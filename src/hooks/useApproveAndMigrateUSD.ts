import { STABLECOIN_POOL_NAME, TRANSACTION_TYPES } from "../constants"
import { useDispatch, useSelector } from "react-redux"
import { useLPTokenContract, useSwapMigratorUSDContract } from "./useContract"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { gasBNFromState } from "../utils/gas"
import { notifyHandler } from "../utils/notifyHandler"
import { subtractSlippage } from "../utils/slippage"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."

export function useApproveAndMigrateUSD(): (
  lpTokenBalance?: BigNumber,
) => Promise<void> {
  const dispatch = useDispatch()
  const migratorContract = useSwapMigratorUSDContract()
  const lpTokenContract = useLPTokenContract(STABLECOIN_POOL_NAME)
  const { account } = useActiveWeb3React()
  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )
  const {
    slippageCustom,
    slippageSelected,
    gasPriceSelected,
    gasCustom,
  } = useSelector((state: AppState) => state.user)

  return async function approveAndMigrateUSD(
    lpTokenBalance?: BigNumber,
  ): Promise<void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (!migratorContract) throw new Error("Migration contract is not loaded")
      if (!lpTokenBalance || lpTokenBalance.isZero()) return
      if (lpTokenContract == null) return
      await checkAndApproveTokenForTrade(
        lpTokenContract,
        migratorContract.address,
        account,
        lpTokenBalance,
        false,
        {
          onTransactionError: () => {
            throw new Error("Your transaction could not be completed")
          },
        },
      )

      const gasPrice = gasBNFromState(
        { gasStandard, gasFast, gasInstant },
        gasPriceSelected,
        gasCustom,
      ).mul(BigNumber.from(10).pow(9))
      const migrateTransaction = await migratorContract.migrateUSDPool(
        lpTokenBalance,
        subtractSlippage(lpTokenBalance, slippageSelected, slippageCustom),
        {
          gasPrice,
        },
      )

      notifyHandler(migrateTransaction.hash, "Migrate")

      await migrateTransaction.wait()
      dispatch(
        updateLastTransactionTimes({
          [TRANSACTION_TYPES.MIGRATE]: Date.now(),
        }),
      )
      return Promise.resolve()
    } catch (e) {
      console.error(e)
    }
  }
}
