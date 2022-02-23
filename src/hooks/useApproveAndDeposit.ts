import {
  BTC_POOL_NAME,
  POOLS_MAP,
  PoolName,
  TRANSACTION_TYPES,
  Token,
  isLegacySwapABIPool,
} from "../constants"
import { formatDeadlineToNumber, getContract } from "../utils"
import { notifyCustomError, notifyHandler } from "../utils/notifyHandler"
import {
  useAllContracts,
  useLPTokenContract,
  useSwapContract,
} from "./useContract"
import { useDispatch, useSelector } from "react-redux"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
// import { Box } from "@mui/material"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import { GasPrices } from "../state/user"
import { IS_PRODUCTION } from "../utils/environment"
// import LaunchIcon from "@mui/icons-material/Launch"
import META_SWAP_ABI from "../constants/abis/metaSwap.json"
import { MetaSwap } from "../../types/ethers-contracts/MetaSwap"
import { NumberInputState } from "../utils/numberInputState"
// import React from "react"
import { SwapFlashLoan } from "../../types/ethers-contracts/SwapFlashLoan"
import { SwapFlashLoanNoWithdrawFee } from "../../types/ethers-contracts/SwapFlashLoanNoWithdrawFee"
import { SwapGuarded } from "../../types/ethers-contracts/SwapGuarded"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { parseUnits } from "@ethersproject/units"
import { subtractSlippage } from "../utils/slippage"
import { toast } from "./utils"
// import { toast } from "react-toastify"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."
import { useMemo } from "react"
import { useSnackbarContext } from "../providers/SnackbarProvider"

// import { useSnackbar } from "notistack"

interface ApproveAndDepositStateArgument {
  [tokenSymbol: string]: NumberInputState
}

export function useApproveAndDeposit(
  poolName: PoolName,
): (
  state: ApproveAndDepositStateArgument,
  shouldDepositWrapped?: boolean,
) => Promise<string | undefined> {
  const dispatch = useDispatch()
  const swapContract = useSwapContract(poolName)
  const lpTokenContract = useLPTokenContract(poolName)
  const tokenContracts = useAllContracts()
  const { enqueueSnackbar } = useSnackbarContext()
  // const { enqueueSnackbar } = useSnackbar()
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
  const POOL = POOLS_MAP[poolName]
  const metaSwapContract = useMemo(() => {
    if (POOL.metaSwapAddresses && chainId && library) {
      return getContract(
        POOL.metaSwapAddresses?.[chainId],
        META_SWAP_ABI,
        library,
        account ?? undefined,
      ) as MetaSwap
    }
    return null
  }, [chainId, library, POOL.metaSwapAddresses, account])

  return async function approveAndDeposit(
    state: ApproveAndDepositStateArgument,
    shouldDepositWrapped = false,
  ): Promise<string | undefined> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (
        !swapContract ||
        !lpTokenContract ||
        (shouldDepositWrapped && !metaSwapContract)
      )
        throw new Error("Swap contract is not loaded")

      const poolTokens = shouldDepositWrapped
        ? (POOL.underlyingPoolTokens as Token[])
        : POOL.poolTokens
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
      const approveSingleToken = async (token: Token): Promise<void> => {
        const spendingValue = BigNumber.from(state[token.symbol].valueSafe)
        if (spendingValue.isZero()) return
        const tokenContract = tokenContracts?.[token.symbol] as Erc20
        if (tokenContract == null) return
        console.log({ IS_PRODUCTION, token })
        await checkAndApproveTokenForTrade(
          tokenContract,
          effectiveSwapContract.address,
          account,
          spendingValue,
          infiniteApproval,
          gasPrice,
          {
            onTransactionError: () => {
              enqueueSnackbar({
                msg: `${token.name} check and approve tx errors`,
                id: `${token.name}CheckAndApprove`,
                type: "error",
              })
              throw new Error("Your transaction could not be completed")
            },
          },
        )
        toast({ tokenName: token.name })
        // enqueueSnackbar({
        //   msg: `${token.name} check and approve token tx complete`,
        //   id: `${token.name}CheckAndApprove`,
        //   type: "success",
        //   data: waitedTx || "",
        // })
        // console.log({ waitedTx })
        return
      }
      // For each token being deposited, check the allowance and approve it if necessary
      if (!IS_PRODUCTION) {
        for (const token of poolTokens) {
          await approveSingleToken(token)
        }
      } else {
        await Promise.all(poolTokens.map((token) => approveSingleToken(token)))
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
            poolTokens.map(({ symbol }) => state[symbol].valueSafe),
            true, // deposit boolean
          )
        } else {
          minToMint = await (
            effectiveSwapContract as SwapFlashLoanNoWithdrawFee
          ).calculateTokenAmount(
            poolTokens.map(({ symbol }) => state[symbol].valueSafe),
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
      const txnAmounts = poolTokens.map(({ symbol }) => state[symbol].valueSafe)
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

      console.log({ spendTransaction })
      notifyHandler(spendTransaction.hash, "deposit")

      const waitedTx = await spendTransaction.wait()
      console.log({ waitedTx })
      toast({ status: waitedTx.status })

      dispatch(
        updateLastTransactionTimes({
          [TRANSACTION_TYPES.DEPOSIT]: Date.now(),
        }),
      )
      return Promise.resolve(spendTransaction.hash)
    } catch (e) {
      console.error(e)
      notifyCustomError(e as Error)
    }
  }
}
