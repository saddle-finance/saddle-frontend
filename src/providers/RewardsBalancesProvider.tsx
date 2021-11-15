import {
  BLOCK_TIME,
  MINICHEF_CONTRACT_ADDRESSES,
  POOLS_MAP,
} from "../constants"
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

import { BigNumber } from "@ethersproject/bignumber"
import { Contract } from "ethcall"
import { IS_DEVELOPMENT } from "../utils/environment"
import MINICHEF_CONTRACT_ABI from "../constants/abis/miniChef.json"
import { MiniChef } from "../../types/ethers-contracts/MiniChef"
import { MulticallContract } from "../types/ethcall"
import { Zero } from "@ethersproject/constants"
import { getMulticallProvider } from "../utils"
import { useActiveWeb3React } from "../hooks"
import usePoller from "../hooks/usePoller"
import { useRetroMerkleData } from "../hooks/useRetroMerkleData"
import { useRetroactiveVestingContract } from "../hooks/useContract"

type PoolsRewards = { [poolName: string]: BigNumber }
type AggRewards = PoolsRewards & { total: BigNumber } & {
  retroactive: BigNumber
}
export const RewardsBalancesContext = React.createContext<PoolsRewards>({
  total: Zero,
})

export default function RewardsBalancesProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const [aggbalances, setAggBalances] = useState<AggRewards>({
    total: Zero,
    retroactive: Zero,
  })
  const poolsRewardsBalances = usePoolsRewardBalances()
  const retroBalance = useRetroactiveRewardBalance()

  useMemo(() => {
    const total = Object.values({
      ...poolsRewardsBalances,
      retroBalance,
    }).reduce((acc, bal) => {
      return acc.add(bal || Zero)
    }, Zero)
    setAggBalances({
      ...poolsRewardsBalances,
      retroactive: retroBalance,
      total,
    })
  }, [poolsRewardsBalances, retroBalance])

  return (
    <RewardsBalancesContext.Provider value={aggbalances}>
      {children}
    </RewardsBalancesContext.Provider>
  )
}

function useRetroactiveRewardBalance() {
  const { chainId, account, library } = useActiveWeb3React()
  const [balance, setBalance] = useState<BigNumber>(Zero)
  const retroRewardsContract = useRetroactiveVestingContract()
  const userMerkleData = useRetroMerkleData()

  // async function fetchBalance() {
  const fetchBalance = useCallback(async () => {
    if (
      !library ||
      !chainId ||
      !account ||
      !retroRewardsContract ||
      !userMerkleData
    ) {
      return
    }

    try {
      const userVesting = await retroRewardsContract.vestings(account)
      if (userVesting?.isVerified) {
        const fetchedBalance = await retroRewardsContract.vestedAmount(account)
        setBalance(fetchedBalance || Zero)
      } else {
        // estimate claimable % of user's grant based on elapsed time
        const startTimeSeconds = await retroRewardsContract.startTimestamp()
        let startTimeMs = startTimeSeconds.mul(1000)
        const twoYearsMs = BigNumber.from(2 * 365 * 24 * 60 * 60 * 1000) // the vesting period
        const nowMs = BigNumber.from(Date.now())
        if (IS_DEVELOPMENT) {
          startTimeMs = nowMs.sub(1e11)
        }
        // bail if vesting hasn't yet started
        if (startTimeMs.gt(nowMs)) return
        const vestedPercent = nowMs.sub(startTimeMs).div(twoYearsMs)
        const vestedAmount = userMerkleData.amount.mul(vestedPercent)
        setBalance(vestedAmount)
      }
    } catch (e) {
      console.error(e)
    }
  }, [library, chainId, account, retroRewardsContract, userMerkleData])
  useEffect(() => {
    void fetchBalance()
  }, [fetchBalance])
  usePoller(() => void fetchBalance(), BLOCK_TIME * 5)
  return balance
}

function usePoolsRewardBalances() {
  const { chainId, account, library } = useActiveWeb3React()
  const [balances, setBalances] = useState<PoolsRewards>({})

  const fetchBalances = useCallback(async () => {
    if (!library || !chainId || !account) return
    const ethcallProvider = await getMulticallProvider(library, chainId)
    const pools = Object.values(POOLS_MAP).filter(
      ({ addresses, rewardPids }) =>
        chainId && rewardPids[chainId] !== null && addresses[chainId],
    )
    if (pools.length === 0) return
    const rewardsMulticallContract = new Contract(
      MINICHEF_CONTRACT_ADDRESSES[chainId],
      MINICHEF_CONTRACT_ABI,
    ) as MulticallContract<MiniChef>
    const pendingSDLCalls = pools.map(({ rewardPids }) =>
      rewardsMulticallContract.pendingSaddle(
        rewardPids[chainId] as number,
        account,
      ),
    )
    try {
      const fetchedBalances = await ethcallProvider.all(pendingSDLCalls, {})
      setBalances(
        fetchedBalances.reduce((acc, balance, i) => {
          const { name } = pools[i]
          return balance != null && balance.gt(Zero)
            ? { ...acc, [name]: balance }
            : acc
        }, {} as { [poolName: string]: BigNumber }),
      )
    } catch (e) {
      console.error(e)
    }
  }, [library, chainId, account])
  useEffect(() => {
    void fetchBalances()
  }, [fetchBalances])
  usePoller(() => void fetchBalances(), BLOCK_TIME * 5)
  return balances
}
