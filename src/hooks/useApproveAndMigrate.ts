import { POOLS_MAP, PoolName, TRANSACTION_TYPES } from "../constants"
import { enqueuePromiseToast, enqueueToast } from "../components/Toastify"
import { useDispatch, useSelector } from "react-redux"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { gasBNFromState } from "../utils/gas"
import { getContract } from "../utils"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."
import { useGeneralizedSwapMigratorContract } from "./useContract"

export function useApproveAndMigrate(): (
  oldPoolName: PoolName | null,
  lpTokenBalance?: BigNumber,
) => Promise<void> {
  const dispatch = useDispatch()
  const migratorContract = useGeneralizedSwapMigratorContract()
  const { account, chainId, library } = useActiveWeb3React()
  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )
  const { gasPriceSelected, gasCustom } = useSelector(
    (state: AppState) => state.user,
  )

  return async function approveAndMigrate(
    oldPoolName: PoolName | null,
    lpTokenBalance?: BigNumber,
  ): Promise<void> {
    if (!migratorContract || !chainId || !account || !library || !oldPoolName)
      return
    const pool = POOLS_MAP[oldPoolName]
    const lpTokenAddress = pool.lpToken.addresses[chainId]
    const lpTokenContract = getContract(
      lpTokenAddress,
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
        gasPrice,
        {
          onTransactionError: () => {
            throw new Error("Your transaction could not be completed")
          },
        },
      )
      try {
        const metaSwapAddress = pool.metaSwapAddresses?.[chainId]
        const migratingPoolAddress = metaSwapAddress || pool.addresses[chainId]
        const migrateTransaction = await migratorContract.migrate(
          migratingPoolAddress,
          lpTokenBalance,
          lpTokenBalance.mul(1000 - 5).div(1000), // 50bps, 0.5%
        )
        await enqueuePromiseToast(migrateTransaction.wait(), "migrate", {
          poolName: pool.name,
        })
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
