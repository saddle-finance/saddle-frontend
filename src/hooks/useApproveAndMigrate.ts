import { enqueuePromiseToast, enqueueToast } from "../components/Toastify"
import { useDispatch, useSelector } from "react-redux"

import { AppState } from "../state"
import { BasicPoolsContext } from "../providers/BasicPoolsProvider"
import { BigNumber } from "@ethersproject/bignumber"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import { TRANSACTION_TYPES } from "../constants"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { gasBNFromState } from "../utils/gas"
import { getContract } from "../utils"
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
    const basicPool = basicPools?.[oldPoolName || ""]

    if (
      !migratorContract ||
      !chainId ||
      !account ||
      !library ||
      !oldPoolName ||
      !basicPool ||
      !lpTokenBalance ||
      lpTokenBalance.isZero()
    )
      return
    const lpTokenContract = getContract(
      basicPool.lpToken,
      ERC20_ABI,
      library,
      account,
    ) as Erc20
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
          basicPool.poolAddress,
          lpTokenBalance,
          lpTokenBalance.mul(1000 - 5).div(1000), // 50bps, 0.5%
        )
        await enqueuePromiseToast(
          chainId,
          migrateTransaction.wait(),
          "migrate",
          {
            poolName: basicPool.poolName,
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
