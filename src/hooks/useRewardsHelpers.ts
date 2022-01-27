import { POOLS_MAP, PoolName, TRANSACTION_TYPES } from "../constants"
import { notifyCustomError, notifyHandler } from "../utils/notifyHandler"
import { useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLPTokenContract, useMiniChefContract } from "./useContract"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { Zero } from "@ethersproject/constants"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."

export function useRewardsHelpers(poolName: PoolName): {
  approveAndStake: (amount: BigNumber) => Promise<void>
  unstake: (amount: BigNumber) => Promise<void>
  amountStaked: BigNumber
  isPoolIncentivized: boolean
} {
  const pool = POOLS_MAP[poolName]
  const { account, chainId } = useActiveWeb3React()
  const dispatch = useDispatch()
  const lpTokenContract = useLPTokenContract(poolName)
  const { infiniteApproval } = useSelector((state: AppState) => state.user)
  const rewardsContract = useMiniChefContract()
  const poolPid = chainId && pool ? pool.rewardPids[chainId] : null
  const [amountStaked, setAmountStaked] = useState(Zero)
  const { lastTransactionTimes } = useSelector(
    (state: AppState) => state.application,
  )
  const lastStakeOrClaim =
    lastTransactionTimes[TRANSACTION_TYPES.STAKE_OR_CLAIM]

  const approveAndStake = useCallback(
    async (amount: BigNumber) => {
      if (!lpTokenContract || !rewardsContract || !account || poolPid === null)
        return
      try {
        await checkAndApproveTokenForTrade(
          lpTokenContract,
          rewardsContract.address,
          account,
          amount,
          infiniteApproval,
          BigNumber.from(1),
        )
        const txn = await rewardsContract.deposit(poolPid, amount, account)
        notifyHandler(txn?.hash, "deposit")
        await txn.wait()
        dispatch(
          updateLastTransactionTimes({
            [TRANSACTION_TYPES.STAKE_OR_CLAIM]: Date.now(),
          }),
        )
      } catch (e) {
        console.error(e)
        notifyCustomError({ ...(e as Error), message: "Unable to Stake" })
      }
    },
    [
      lpTokenContract,
      rewardsContract,
      account,
      infiniteApproval,
      poolPid,
      dispatch,
    ],
  )

  const unstake = useCallback(
    async (amount: BigNumber) => {
      if (!lpTokenContract || !rewardsContract || !account || poolPid === null)
        return
      try {
        const txn = await rewardsContract.withdraw(poolPid, amount, account)
        notifyHandler(txn?.hash, "withdraw")
        await txn.wait()
        dispatch(
          updateLastTransactionTimes({
            [TRANSACTION_TYPES.STAKE_OR_CLAIM]: Date.now(),
          }),
        )
      } catch (e) {
        console.error(e)
        notifyCustomError({ ...(e as Error), message: "Unable to Unstake" })
      }
    },
    [lpTokenContract, rewardsContract, account, poolPid, dispatch],
  )

  useEffect(() => {
    async function fetchAmount() {
      if (!rewardsContract || !account || poolPid === null) return
      const userInfo = await rewardsContract
        .userInfo(poolPid, account)
        .catch(console.error)
      setAmountStaked(userInfo ? userInfo.amount : Zero)
    }
    void fetchAmount()
  }, [account, poolPid, rewardsContract, lastStakeOrClaim])

  return {
    approveAndStake,
    unstake,
    amountStaked,
    isPoolIncentivized: poolPid !== null,
  }
}
