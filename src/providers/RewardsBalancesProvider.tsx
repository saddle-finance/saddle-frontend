import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { BLOCK_TIME } from "../constants"
import { BasicPoolsContext } from "./BasicPoolsProvider"
import { BigNumber } from "@ethersproject/bignumber"
import { UserStateContext } from "./UserStateProvider"
import { Zero } from "@ethersproject/constants"
import { areGaugesActive } from "../utils/gauges"
import { useActiveWeb3React } from "../hooks"
import usePoller from "../hooks/usePoller"
import { useRetroMerkleData } from "../hooks/useRetroMerkleData"
import { useRetroactiveVestingContract } from "../hooks/useContract"

type PoolsRewards = { [poolName: string]: BigNumber }
type AggRewards = PoolsRewards & { total: BigNumber } & {
  retroactive: BigNumber
  retroactiveTotal: BigNumber
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
    retroactiveTotal: Zero,
  })
  const { chainId } = useActiveWeb3React()
  const poolsRewardsBalances = usePoolsRewardBalances()
  const gaugeRewardBalance = useGaugeRewardTotal()
  const gaugesAreActive = areGaugesActive(chainId)
  const { vested: retroBalanceVested, total: retroBalanceTotal } =
    useRetroactiveRewardBalance()

  useMemo(() => {
    const total = Object.values({
      ...poolsRewardsBalances,
      retroBalanceVested,
      ...(gaugesAreActive && { gaugeRewardBalance }),
    }).reduce((acc, bal) => {
      return acc.add(bal || Zero)
    }, Zero)
    setAggBalances({
      ...poolsRewardsBalances,
      retroactive: retroBalanceVested,
      retroactiveTotal: retroBalanceTotal,
      total,
    })
  }, [
    poolsRewardsBalances,
    retroBalanceVested,
    retroBalanceTotal,
    gaugeRewardBalance,
    gaugesAreActive,
  ])

  return (
    <RewardsBalancesContext.Provider value={aggbalances}>
      {children}
    </RewardsBalancesContext.Provider>
  )
}

function useRetroactiveRewardBalance() {
  const { chainId, account, library } = useActiveWeb3React()
  const [balances, setBalances] = useState<{
    vested: BigNumber
    total: BigNumber
  }>({ vested: Zero, total: Zero })
  const retroRewardsContract = useRetroactiveVestingContract()
  const userMerkleData = useRetroMerkleData()

  const fetchBalance = useCallback(async () => {
    if (!library || !chainId || !account || !retroRewardsContract) {
      return
    }

    try {
      const userVesting = await retroRewardsContract.vestings(account)
      if (userVesting?.isVerified) {
        const fetchedBalance = await retroRewardsContract.vestedAmount(account)
        setBalances({
          vested: fetchedBalance || Zero,
          total: userVesting.totalAmount || Zero,
        })
      } else {
        // estimate claimable % of user's grant based on elapsed time
        const startTimeSeconds = await retroRewardsContract.startTimestamp()
        const startTimeMs = startTimeSeconds.mul(1000)
        const twoYearsMs = BigNumber.from(2 * 365 * 24 * 60 * 60 * 1000) // the vesting period
        const nowMs = BigNumber.from(Date.now())
        // bail if vesting hasn't yet started
        if (startTimeMs.gt(nowMs)) return

        // Scale by 1e18 for more accurate percentage
        const userMerkleAmount = userMerkleData?.amount || Zero
        const vestedPercent = nowMs
          .sub(startTimeMs)
          .mul(BigNumber.from(10).pow(18))
          .div(twoYearsMs)
        const vestedAmount = userMerkleAmount
          .mul(vestedPercent)
          .div(BigNumber.from(10).pow(18))
        setBalances({
          vested: vestedAmount || Zero,
          total: userMerkleAmount,
        })
      }
    } catch (e) {
      console.error(e)
      setBalances({
        vested: Zero,
        total: Zero,
      })
    }
  }, [library, chainId, account, retroRewardsContract, userMerkleData])
  useEffect(() => {
    void fetchBalance()
  }, [fetchBalance])
  usePoller(() => void fetchBalance(), BLOCK_TIME * 3)
  return balances
}

function usePoolsRewardBalances() {
  const userState = useContext(UserStateContext)
  const basicPools = useContext(BasicPoolsContext)
  return useMemo(() => {
    if (!userState || !basicPools) {
      return
    }
    const poolsWithRewards = Object.values(basicPools).filter(
      ({ miniChefRewardsPid }) => miniChefRewardsPid != null,
    )
    const poolNameToMinichefSDLBalance = poolsWithRewards.reduce(
      (acc, { miniChefRewardsPid, poolName }) => {
        return {
          ...acc,
          [poolName]:
            userState.minichef?.[miniChefRewardsPid as number]?.pendingSDL ??
            Zero,
        }
      },
      {} as { [poolName: string]: BigNumber },
    )
    return poolNameToMinichefSDLBalance
  }, [userState, basicPools])
}

function useGaugeRewardTotal() {
  const userState = useContext(UserStateContext)

  return useMemo(() => {
    if (!userState) {
      return Zero
    }

    const totalSdlFromGauges = Object.values(
      userState?.gaugeRewards ?? {},
    ).reduce((sum, { claimableSDL }) => sum.add(claimableSDL), Zero)

    return totalSdlFromGauges
  }, [userState])
}
