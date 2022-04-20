import { MinichefUserData, getMinichefRewardsUserData } from "../utils/minichef"
import React, { ReactElement, useContext, useEffect, useState } from "react"
import { batchArray, getMulticallProvider } from "../utils"

import { BasicPoolsContext } from "./BasicPoolsProvider"
import { BigNumber } from "@ethersproject/bignumber"
import { ChainId } from "../constants"
import { Contract } from "ethcall"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "./../../types/ethers-contracts/Erc20.d"
import { MulticallContract } from "../types/ethcall"
import { TokensContext } from "./TokensProvider"
import { Web3Provider } from "@ethersproject/providers"
import { Zero } from "@ethersproject/constants"
import { useActiveWeb3React } from "../hooks"

type UserTokenBalances = { [address: string]: BigNumber }
type UserState = {
  tokenBalances: UserTokenBalances | null
  minichef: MinichefUserData
} | null
export const UserStateContext = React.createContext<UserState>(null)

/**
 * All user state will live here so it can be easily cleared on logout
 */
export default function UserStateProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const { chainId, library, account } = useActiveWeb3React()
  const pools = useContext(BasicPoolsContext)
  const tokens = useContext(TokensContext)
  const [userState, setUserState] = useState<UserState>(null)
  useEffect(() => {
    async function fetchUserState() {
      if (!chainId || !library || !pools || !account) {
        setUserState(null)
        return
      }
      const userTokenBalances = await getUserTokenBalances(
        library,
        chainId,
        account,
        Object.keys(tokens),
      )
      const minichefData = await getMinichefRewardsUserData(
        library,
        chainId,
        Object.keys(pools),
        account,
      )
      setUserState({
        tokenBalances: userTokenBalances,
        minichef: minichefData,
      })
    }
    void fetchUserState()
  }, [library, chainId, account, pools, tokens])
  return (
    <UserStateContext.Provider value={userState}>
      {children}
    </UserStateContext.Provider>
  )
}

const BATCH_SIZE = 30
async function getUserTokenBalances(
  library: Web3Provider,
  chainId: ChainId,
  account: string,
  tokenAddresses: string[], // assumes addresses are deduped
): Promise<UserTokenBalances | null> {
  try {
    const ethCallProvider = await getMulticallProvider(library, chainId)
    const balanceCalls = tokenAddresses.map((address) => {
      const contract = new Contract(
        address,
        ERC20_ABI,
      ) as MulticallContract<Erc20>
      return contract.balanceOf(account)
    })
    const batchBalanceResults = (
      await Promise.all(
        batchArray(balanceCalls, BATCH_SIZE).map((batch) => {
          return ethCallProvider.tryEach(
            batch,
            batch.map(() => true),
          )
        }),
      )
    ).flat()
    return tokenAddresses.reduce((acc, address, i) => {
      return {
        ...acc,
        [address]: batchBalanceResults[i] || Zero,
      }
    }, {} as UserTokenBalances)
  } catch (e) {
    const error = e as Error
    error.message = `Failed to get user token balances: ${error.message}`
    console.error(error)
    return null
  }
}
