import { enqueuePromiseToast, enqueueToast } from "../components/Toastify"
import { useCallback, useContext, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLPTokenContract, useMiniChefContract } from "./useContract"

import { AppState } from "../state"
import { BasicPoolsContext } from "../providers/BasicPoolsProvider"
import { BigNumber } from "@ethersproject/bignumber"
import { MinichefContext } from "../providers/MinichefProvider"
import { TRANSACTION_TYPES } from "../constants"
import { TokensContext } from "./../providers/TokensProvider"
import { UserStateContext } from "./../providers/UserStateProvider"
import { Zero } from "@ethersproject/constants"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."

export function useRewardsHelpers(poolName: string): {
  approveAndStake: (amount: BigNumber) => Promise<void>
  unstakeMinichef: (amount: BigNumber) => Promise<void>
  claimSPA: () => Promise<void>
  amountStakedMinichef: BigNumber
  amountOfSpaClaimable: BigNumber
  isPoolIncentivized: boolean
} {
  const basicPools = useContext(BasicPoolsContext)
  const userState = useContext(UserStateContext)
  const minichefData = useContext(MinichefContext)
  const tokens = useContext(TokensContext)
  const basicPool = basicPools?.[poolName]
  const { account, chainId } = useActiveWeb3React()
  const dispatch = useDispatch()
  const lpTokenContract = useLPTokenContract(poolName)
  const { infiniteApproval } = useSelector((state: AppState) => state.user)
  const rewardsContract = useMiniChefContract()
  const poolPid = basicPool ? basicPool.miniChefRewardsPid : null
  const [amountStakedMinichef, setAmountStakedMinichef] = useState(Zero)
  const [amountOfSpaClaimable, setAmountOfSpaClaimable] = useState(Zero)

  const approveAndStake = useCallback(
    async (amount: BigNumber) => {
      if (
        !lpTokenContract ||
        !rewardsContract ||
        !account ||
        poolPid === null ||
        !chainId
      )
        return
      try {
        await checkAndApproveTokenForTrade(
          lpTokenContract,
          rewardsContract.address,
          account,
          amount,
          infiniteApproval,
          BigNumber.from(1),
          {
            onTransactionError: () => {
              throw new Error("Your transaction could not be completed")
            },
          },
          chainId,
        )
        const txn = await rewardsContract.deposit(poolPid, amount, account)
        await enqueuePromiseToast(chainId, txn.wait(), "stake", { poolName })
        dispatch(
          updateLastTransactionTimes({
            [TRANSACTION_TYPES.STAKE_OR_CLAIM]: Date.now(),
          }),
        )
      } catch (e) {
        console.error(e)
        enqueueToast("error", "Unable to stake")
      }
    },
    [
      chainId,
      lpTokenContract,
      rewardsContract,
      account,
      infiniteApproval,
      poolPid,
      dispatch,
      poolName,
    ],
  )

  const unstakeMinichef = useCallback(
    async (amount: BigNumber) => {
      if (!rewardsContract || !account || poolPid === null || !chainId) return
      try {
        const txn = await rewardsContract.withdraw(poolPid, amount, account)
        await enqueuePromiseToast(chainId, txn.wait(), "unstake", { poolName })
        dispatch(
          updateLastTransactionTimes({
            [TRANSACTION_TYPES.STAKE_OR_CLAIM]: Date.now(),
          }),
        )
      } catch (e) {
        console.error(e)
        enqueueToast("error", "Unable to unstake")
      }
    },
    [rewardsContract, account, poolPid, dispatch, poolName, chainId],
  )

  const claimSPA = useCallback(async () => {
    if (!rewardsContract || !account || poolPid === null || !chainId) return
    try {
      // Calling `deposit` with 0 amount will claim all the SPA available. This is
      // a workaround having a token that we can't give away.
      const txn = await rewardsContract.deposit(poolPid, Zero, account)
      await enqueuePromiseToast(chainId, txn.wait(), "claim", { poolName })
      dispatch(
        updateLastTransactionTimes({
          [TRANSACTION_TYPES.STAKE_OR_CLAIM]: Date.now(),
        }),
      )
    } catch (e) {
      console.error(e)
      enqueueToast("error", "Unable to claim SPA")
    }
  }, [rewardsContract, account, poolPid, dispatch, poolName, chainId])

  useEffect(() => {
    if (poolPid == null || userState == null || basicPool == null) return
    const userInfo = userState.minichef?.[poolPid]
    const minichefInfo = minichefData?.pools?.[basicPool.poolAddress]
    const rewardTokenAddress = minichefInfo?.rewards?.rewardTokenAddress
    const rewardToken = rewardTokenAddress ? tokens?.[rewardTokenAddress] : null

    setAmountStakedMinichef(userInfo ? userInfo.amountStaked : Zero)
    if (rewardToken?.symbol === "SPA") {
      setAmountOfSpaClaimable(userInfo ? userInfo.pendingExternal : Zero)
    }
  }, [poolPid, userState, basicPool, minichefData, tokens])

  return {
    approveAndStake,
    unstakeMinichef,
    claimSPA,
    amountStakedMinichef,
    amountOfSpaClaimable,
    isPoolIncentivized: poolPid !== null,
  }
}
