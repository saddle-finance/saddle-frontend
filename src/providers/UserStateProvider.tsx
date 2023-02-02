import { GaugeRewardUserData, getGaugeRewardsUserData } from "../utils/gauges"
import { MinichefUserData, getMinichefRewardsUserData } from "../utils/minichef"
import { MulticallCall, MulticallContract } from "../types/ethcall"
import React, { ReactElement, useCallback, useContext, useState } from "react"
import { batchArray, getMulticallProvider } from "../utils"

import { BLOCK_TIME } from "../constants"
import { BasicPoolsContext } from "./BasicPoolsProvider"
import { BigNumber } from "@ethersproject/bignumber"
import { ChainId } from "../constants/networks"
import { Contract } from "ethcall"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "./../../types/ethers-contracts/Erc20.d"
import { GaugeContext } from "./GaugeProvider"
import { NETWORK_NATIVE_TOKENS } from "../constants/networks"
import { TokensContext } from "./TokensProvider"
import { Web3Provider } from "@ethersproject/providers"
import { Zero } from "@ethersproject/constants"
import { useActiveWeb3React } from "../hooks"
import { useFeeDistributor } from "../hooks/useContract"
import usePoller from "../hooks/usePoller"

type UserTokenBalances = { [address: string]: BigNumber }
type UserState = {
  tokenBalances: UserTokenBalances | null
  minichef: MinichefUserData
  gaugeRewards: GaugeRewardUserData | null
  feeDistributorRewards: BigNumber
} | null
export const UserStateContext = React.createContext<UserState>(null)

/**
 * All user state will live here so it can be easily cleared on logout
 */
export default function UserStateProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const { chainId, library, account } = useActiveWeb3React()
  const basicPools = useContext(BasicPoolsContext)
  const tokens = useContext(TokensContext)

  const { gauges } = useContext(GaugeContext)
  const feeDistributorContract = useFeeDistributor()
  const [userState, setUserState] = useState<UserState>(null)
  const fetchState = useCallback(() => {
    async function fetchUserState() {
      if (!chainId || !library || !basicPools || !account || !tokens) {
        setUserState(null)
        return
      }
      const userTokenBalancesPromise = getUserTokenBalances(
        library,
        chainId,
        account,
        Object.keys(tokens) as string[],
      )
      const minichefDataPromise = getMinichefRewardsUserData(
        library,
        chainId,
        Object.values(basicPools).map(
          ({ poolAddress, lpToken, miniChefRewardsPid, lpTokenSupply }) => ({
            poolAddress,
            lpToken,
            miniChefRewardsPid,
            lpTokenSupply,
          }),
        ),
        account,
      )
      const gaugeRewardsPromise = gauges
        ? getGaugeRewardsUserData(
            library,
            chainId,
            Object.values(gauges).map(({ address }) => address),
            Object.values(gauges).map(({ rewards }) =>
              rewards.map(({ tokenAddress }) => {
                const token = tokens[tokenAddress]
                if (!token) {
                  console.error(`Couldn't load token ${tokenAddress}`)
                }
                return token
              }),
            ),
            account,
          )
        : Promise.resolve(null)

      const feedDistributorRewardsPromise = feeDistributorContract
        ? feeDistributorContract["claimable(address)"](account)
        : Promise.resolve(Zero)

      const [
        userTokenBalances,
        minichefData,
        gaugeRewards,
        feeDistributorRewards,
      ] = await Promise.all([
        userTokenBalancesPromise,
        minichefDataPromise,
        gaugeRewardsPromise,
        feedDistributorRewardsPromise,
      ])
      let tokenBalances
      if (userTokenBalances?.ETH) {
        // eslint-disable-next-line
        const { ETH: _, ...rest } = userTokenBalances
        tokenBalances = rest
      } else {
        tokenBalances = userTokenBalances
      }

      setUserState({
        tokenBalances,
        minichef: minichefData,
        gaugeRewards,
        feeDistributorRewards,
      })
    }
    void fetchUserState()
  }, [
    library,
    chainId,
    account,
    basicPools,
    tokens,
    gauges,
    feeDistributorContract,
  ])
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
      // the last call is the native token balance
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
