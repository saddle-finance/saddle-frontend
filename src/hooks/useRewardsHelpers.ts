import { POOLS_MAP, PoolName, SPA, TRANSACTION_TYPES } from "../constants"
import { enqueuePromiseToast, enqueueToast } from "../components/Toastify"
import { getContract, getTokenByAddress } from "../utils"
import { useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLPTokenContract, useMiniChefContract } from "./useContract"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { IRewarder } from "../../types/ethers-contracts/IRewarder"
import IRewarder_ABI from "../constants/abis/IRewarder.json"
import { Zero } from "@ethersproject/constants"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."

export function useRewardsHelpers(poolName: PoolName): {
  approveAndStake: (amount: BigNumber) => Promise<void>
  unstake: (amount: BigNumber) => Promise<void>
  claimSPA: () => Promise<void>
  amountStaked: BigNumber
  amountOfSpaClaimable: BigNumber
  isPoolIncentivized: boolean
} {
  const pool = POOLS_MAP[poolName]
  const { account, chainId, library } = useActiveWeb3React()
  const dispatch = useDispatch()
  const lpTokenContract = useLPTokenContract(poolName)
  const { infiniteApproval } = useSelector((state: AppState) => state.user)
  const rewardsContract = useMiniChefContract()
  const poolPid = chainId && pool ? pool.rewardPids[chainId] : null
  const [amountStaked, setAmountStaked] = useState(Zero)
  const [amountOfSpaClaimable, setAmountOfSpaClaimable] = useState(Zero)
  const { lastTransactionTimes } = useSelector(
    (state: AppState) => state.application,
  )
  const lastStakeOrClaim =
    lastTransactionTimes[TRANSACTION_TYPES.STAKE_OR_CLAIM]

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

  const unstake = useCallback(
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
    [
      lpTokenContract,
      rewardsContract,
      account,
      poolPid,
      dispatch,
      poolName,
      chainId,
    ],
  )

  const claimSPA = useCallback(async () => {
    if (
      !lpTokenContract ||
      !rewardsContract ||
      !account ||
      poolPid === null ||
      !chainId
    )
      return
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
  }, [
    lpTokenContract,
    rewardsContract,
    account,
    poolPid,
    dispatch,
    poolName,
    chainId,
  ])

  useEffect(() => {
    async function fetchAmount() {
      if (
        !rewardsContract ||
        !account ||
        poolPid === null ||
        !library ||
        !chainId
      )
        return
      const userInfo = await rewardsContract
        .userInfo(poolPid, account)
        .catch(console.error)
      setAmountStaked(userInfo ? userInfo.amount : Zero)
      try {
        const rewarderAddress = await rewardsContract.rewarder(poolPid)
        const rewarder = getContract(
          rewarderAddress,
          IRewarder_ABI,
          library,
          account,
        ) as IRewarder
        const [tokenAddresses, tokenAmounts] = await rewarder.pendingTokens(
          poolPid,
          account,
          0,
        )
        const rewards: { [symbol: string]: BigNumber } = {}
        tokenAddresses.forEach((address, i) => {
          const token = getTokenByAddress(address, chainId)
          if (token) rewards[token.symbol] = tokenAmounts[i]
          if (address.toLowerCase() === SPA.addresses[chainId].toLowerCase()) {
            rewards[SPA.symbol] = tokenAmounts[i]
          }
        })

        setAmountOfSpaClaimable(rewards?.SPA || Zero)
      } catch (err) {
        console.error(err)
      }
    }
    void fetchAmount()
  }, [account, poolPid, rewardsContract, lastStakeOrClaim, library, chainId])

  return {
    approveAndStake,
    unstake,
    claimSPA,
    amountStaked,
    amountOfSpaClaimable,
    isPoolIncentivized: poolPid !== null,
  }
}
