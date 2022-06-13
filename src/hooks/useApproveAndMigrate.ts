import { enqueuePromiseToast, enqueueToast } from "../components/Toastify"
import { getContract, getSwapContract } from "../utils"
import { useDispatch, useSelector } from "react-redux"

import { AppState } from "../state"
import { BasicPoolsContext } from "../providers/BasicPoolsProvider"
import { BigNumber } from "@ethersproject/bignumber"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import { SwapFlashLoanNoWithdrawFee } from "../../types/ethers-contracts/SwapFlashLoanNoWithdrawFee"
import { TRANSACTION_TYPES } from "../constants"
import { Zero } from "@ethersproject/constants"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { gasBNFromState } from "../utils/gas"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."
import { useContext } from "react"
import { useGeneralizedSwapMigratorContract } from "./useContract"

export function useApproveAndMigrate(): (
  oldPoolName: string | null,
  lpTokenBalance?: BigNumber,
) => Promise<void> {
  const dispatch = useDispatch()
  const migratorContract = useGeneralizedSwapMigratorContract()
  const basicPools = useContext(BasicPoolsContext)
  const { account, chainId, library } = useActiveWeb3React()
  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )
  const { gasPriceSelected, gasCustom } = useSelector(
    (state: AppState) => state.user,
  )

  return async function approveAndMigrate(
    oldPoolName: string | null,
    lpTokenBalance?: BigNumber,
  ): Promise<void> {
    const oldPool = oldPoolName ? basicPools?.[oldPoolName] : null
    if (!chainId || !oldPool?.newPoolAddress) return
    if (
      !migratorContract ||
      !account ||
      !library ||
      !oldPool ||
      !lpTokenBalance ||
      lpTokenBalance.isZero()
    )
      return
    const lpTokenContract = getContract(
      oldPool.lpToken,
      ERC20_ABI,
      library,
      account,
    ) as Erc20
    const oldPoolAddress = oldPool.poolAddress

    const newPoolContract = getSwapContract(
      library,
      oldPool?.newPoolAddress,
      {},
      account ?? undefined,
    ) as SwapFlashLoanNoWithdrawFee
    const oldPoolContract = getSwapContract(
      library,
      oldPoolAddress,
      {},
      account ?? undefined,
    ) as SwapFlashLoanNoWithdrawFee

    const expectedWithdrawAmounts =
      await oldPoolContract?.calculateRemoveLiquidity(lpTokenBalance)
    let expectedNewLPTokenBalance: BigNumber = Zero
    try {
      expectedNewLPTokenBalance = expectedWithdrawAmounts
        ? await newPoolContract?.calculateTokenAmount(
            expectedWithdrawAmounts,
            true,
          )
        : Zero
    } catch (err) {
      console.warn(err)
      console.warn(
        "Could not estimate new lp token balance on deposit. Using 0 as minToMint",
      )
    }

    try {
      const gasPrice = gasBNFromState(
        { gasStandard, gasFast, gasInstant },
        gasPriceSelected,
        gasCustom,
      ).mul(BigNumber.from(10).pow(9))

      if (lpTokenContract == null) return
      await checkAndApproveTokenForTrade(
        lpTokenContract,
        migratorContract.address,
        account,
        lpTokenBalance,
        false,
        gasPrice,
        {
          onTransactionError: () => {
            throw new Error("Your transaction could not be completed")
          },
        },
        chainId,
      )
      try {
        const migrateTransaction = await migratorContract.migrate(
          oldPool.poolAddress,
          lpTokenBalance,
          expectedNewLPTokenBalance.mul(1000 - 5).div(1000), // 50bps, 0.5%
        )
        await enqueuePromiseToast(
          chainId,
          migrateTransaction.wait(),
          "migrate",
          {
            poolName: oldPool.poolName,
          },
        )
        dispatch(
          updateLastTransactionTimes({
            [TRANSACTION_TYPES.MIGRATE]: Date.now(),
          }),
        )
      } catch (err) {
        console.error(err)
      }

      return Promise.resolve()
    } catch (e) {
      console.error(e)
      enqueueToast(
        "error",
        e instanceof Error ? e.message : "Transaction Failed",
      )
    }
  }
}
