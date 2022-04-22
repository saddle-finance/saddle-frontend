import { BLOCK_TIME, ChainId } from "../constants"
import { BasicPool, BasicPoolsContext } from "./BasicPoolsProvider"
import { MinichefUserData, getMinichefRewardsUserData } from "../utils/minichef"
import { MulticallCall, MulticallContract } from "../types/ethcall"
import React, { ReactElement, useCallback, useContext, useState } from "react"
import { batchArray, getMulticallProvider } from "../utils"

import { BigNumber } from "@ethersproject/bignumber"
import { Contract } from "ethcall"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "./../../types/ethers-contracts/Erc20.d"
import { NETWORK_NATIVE_TOKENS } from "../constants/networks"
import { TokensContext } from "./TokensProvider"
import { Web3Provider } from "@ethersproject/providers"
import { Zero } from "@ethersproject/constants"
import { useActiveWeb3React } from "../hooks"
import usePoller from "../hooks/usePoller"

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
  const fetchState = useCallback(() => {
    async function fetchUserState() {
      if (!chainId || !library || !pools || !account || !tokens) {
        setUserState(null)
        return
      }
      const userTokenBalances = await getUserTokenBalances(
        library,
        chainId,
        account,
        Object.keys(tokens) as string[],
      )
      const minichefData = await getMinichefRewardsUserData(
        library,
        chainId,
        (Object.values(pools) as BasicPool[]).map(
          ({ poolAddress }) => poolAddress,
        ),
        account,
      )
      setUserState({
        tokenBalances: userTokenBalances,
        minichef: minichefData,
      })
    }
    void fetchUserState()
  }, [library, chainId, account, pools, tokens])
  usePoller(fetchState, BLOCK_TIME * 2, [fetchState])
  return (
    <UserStateContext.Provider value={userState}>
      {children}
    </UserStateContext.Provider>
  )
}

const BATCH_SIZE = 40
async function getUserTokenBalances(
  library: Web3Provider,
  chainId: ChainId,
  account: string,
  tokenAddresses: string[], // assumes addresses are deduped
): Promise<UserTokenBalances | null> {
  try {
    const ethCallProvider = await getMulticallProvider(library, chainId)
    const balanceCalls: MulticallCall<unknown, BigNumber>[] =
      tokenAddresses.map((address) => {
        const contract = new Contract(
          address,
          ERC20_ABI,
        ) as MulticallContract<Erc20>
        return contract.balanceOf(account)
      })
    balanceCalls.push(ethCallProvider.getEthBalance(account))
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

    return batchBalanceResults.reduce((acc, result, i) => {
      const address =
        i === batchBalanceResults.length - 1
          ? NETWORK_NATIVE_TOKENS[chainId]
          : tokenAddresses[i]
      return {
        ...acc,
        [address]: result || Zero,
      }
    }, {} as UserTokenBalances)
  } catch (e) {
    const error = e as Error
    error.message = `Failed to get user token balances: ${error.message}`
    console.error(error)
    return null
  }
}
