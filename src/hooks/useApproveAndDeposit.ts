import {
  BTC_POOL_NAME,
  PoolName,
  TRANSACTION_TYPES,
  isLegacySwapABIPool,
} from "../constants"
import { BasicToken, TokensContext } from "../providers/TokensProvider"
import { enqueuePromiseToast, enqueueToast } from "../components/Toastify"
import { formatDeadlineToNumber, getContract } from "../utils"
import {
  useAllContracts,
  useLPTokenContract,
  useSwapContract,
} from "./useContract"
import { useContext, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"

import { AppState } from "../state"
import { BasicPoolsContext } from "../providers/BasicPoolsProvider"
import { BigNumber } from "@ethersproject/bignumber"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import { GasPrices } from "../state/user"
import { IS_PRODUCTION } from "../utils/environment"
import META_SWAP_ABI from "../constants/abis/metaSwap.json"
import { MetaSwap } from "../../types/ethers-contracts/MetaSwap"
import { NumberInputState } from "../utils/numberInputState"
import { SwapFlashLoan } from "../../types/ethers-contracts/SwapFlashLoan"
import { SwapFlashLoanNoWithdrawFee } from "../../types/ethers-contracts/SwapFlashLoanNoWithdrawFee"
import { SwapGuarded } from "../../types/ethers-contracts/SwapGuarded"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { parseUnits } from "@ethersproject/units"
import { subtractSlippage } from "../utils/slippage"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."

interface ApproveAndDepositStateArgument {
  [tokenSymbol: string]: NumberInputState
}

export function useApproveAndDeposit(
  poolName: PoolName,
): (
  state: ApproveAndDepositStateArgument,
  shouldDepositWrapped?: boolean,
) => Promise<void> {
  const dispatch = useDispatch()
  const swapContract = useSwapContract(poolName)
  const lpTokenContract = useLPTokenContract(poolName)
  const tokenContracts = useAllContracts()
  const { account, chainId, library } = useActiveWeb3React()
  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )
  const {
    slippageCustom,
    slippageSelected,
    gasPriceSelected,
    gasCustom,
    transactionDeadlineCustom,
    transactionDeadlineSelected,
    infiniteApproval,
  } = useSelector((state: AppState) => state.user)
  const basicPools = useContext(BasicPoolsContext)
  const tokens = useContext(TokensContext)
  const pool = basicPools?.[poolName]
  const metaSwapContract = useMemo(() => {
    if (pool?.metaSwapDepositAddress && chainId && library) {
      return getContract(
        pool.metaSwapDepositAddress[chainId],
        META_SWAP_ABI,
        library,
        account ?? undefined,
      ) as MetaSwap
    }
    return null
  }, [chainId, library, account, pool?.metaSwapDepositAddress])

  return async function approveAndDeposit(
    state: ApproveAndDepositStateArgument,
    shouldDepositWrapped = false,
  ): Promise<void> {
    try {
      if (!account || !chainId) throw new Error("Wallet must be connected")
      if (
        !swapContract ||
        !lpTokenContract ||
        (shouldDepositWrapped && !metaSwapContract)
      )
        throw new Error("Swap contract is not loaded")

      const poolTokenAddresses = pool?.isMetaSwap
        ? pool?.underlyingTokens
        : pool?.tokens
      const poolTokens =
        poolTokenAddresses?.map((token) => tokens?.[token]) ?? []
      const effectiveSwapContract = shouldDepositWrapped
        ? (metaSwapContract as MetaSwap)
        : swapContract

      let gasPriceUnsafe: string | number | undefined
      if (gasPriceSelected === GasPrices.Custom) {
        gasPriceUnsafe = gasCustom?.valueSafe
      } else if (gasPriceSelected === GasPrices.Fast) {
        gasPriceUnsafe = gasFast
      } else if (gasPriceSelected === GasPrices.Instant) {
        gasPriceUnsafe = gasInstant
      } else {
        gasPriceUnsafe = gasStandard
      }
      const gasPrice = parseUnits(
        gasPriceUnsafe ? String(gasPriceUnsafe) : "45",
        9,
      )
      const approveSingleToken = async (
        token: BasicToken | undefined,
      ): Promise<void> => {
        const spendingValue = BigNumber.from(
          state[token?.symbol ?? ""].valueSafe,
        )
        if (spendingValue.isZero()) return
        const tokenContract = tokenContracts?.[token?.symbol ?? ""] as Erc20
        if (tokenContract == null) return
        await checkAndApproveTokenForTrade(
          tokenContract,
          effectiveSwapContract.address,
          account,
          spendingValue,
          infiniteApproval,
          gasPrice,
          {
            onTransactionError: () => {
              throw new Error("Your transaction could not be completed")
            },
          },
          chainId,
        )
        return
      }
      // For each token being deposited, check the allowance and approve it if necessary
      if (!IS_PRODUCTION) {
        for (const token of poolTokens) {
          await approveSingleToken(token)
        }
      } else {
        await Promise.all(poolTokens?.map((token) => approveSingleToken(token)))
      }

      const isFirstTransaction = (await lpTokenContract.totalSupply()).isZero()
      let minToMint: BigNumber
      if (isFirstTransaction) {
        minToMint = BigNumber.from("0")
      } else {
        if (isLegacySwapABIPool(poolName)) {
          minToMint = await (
            effectiveSwapContract as SwapFlashLoan
          ).calculateTokenAmount(
            account,
            poolTokens?.map((token) => state[token?.symbol ?? ""].valueSafe),
            true, // deposit boolean
          )
        } else {
          minToMint = await (
            effectiveSwapContract as SwapFlashLoanNoWithdrawFee
          ).calculateTokenAmount(
            poolTokens?.map((token) => state[token?.symbol ?? ""].valueSafe),
            true, // deposit boolean
          )
        }
      }

      minToMint = subtractSlippage(minToMint, slippageSelected, slippageCustom)
      const deadline = formatDeadlineToNumber(
        transactionDeadlineSelected,
        transactionDeadlineCustom,
      )

      let spendTransaction
      const txnAmounts = poolTokens?.map(
        (token) => state[token?.symbol ?? ""].valueSafe,
      )
      const txnDeadline = Math.round(
        new Date().getTime() / 1000 + 60 * deadline,
      )
      if (poolName === BTC_POOL_NAME) {
        const swapGuardedContract = effectiveSwapContract as SwapGuarded
        spendTransaction = await swapGuardedContract?.addLiquidity(
          txnAmounts,
          minToMint,
          txnDeadline,
          [],
        )
      } else {
        const swapFlashLoanContract = effectiveSwapContract as SwapFlashLoan
        spendTransaction = await swapFlashLoanContract?.addLiquidity(
          txnAmounts,
          minToMint,
          txnDeadline,
        )
      }
      await enqueuePromiseToast(chainId, spendTransaction.wait(), "deposit", {
        poolName,
      })

      dispatch(
        updateLastTransactionTimes({
          [TRANSACTION_TYPES.DEPOSIT]: Date.now(),
        }),
      )
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
