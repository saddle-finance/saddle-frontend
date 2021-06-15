import {
  ALETH_POOL_NAME,
  BTC_POOL_NAME,
  POOLS_MAP,
  PoolName,
  TRANSACTION_TYPES,
  Token,
} from "../constants"
import { useAllContracts, useSwapContract } from "./useContract"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import { GasPrices } from "../state/user"
import { IS_PRODUCTION } from "../utils/environment"
import { NumberInputState } from "../utils/numberInputState"
import { SwapFlashLoan } from "../../types/ethers-contracts/SwapFlashLoan"
import { SwapFlashLoanNoWithdrawFee } from "../../types/ethers-contracts/SwapFlashLoanNoWithdrawFee"
import { SwapGuarded } from "../../types/ethers-contracts/SwapGuarded"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { formatDeadlineToNumber } from "../utils"
import { getFormattedTimeString } from "../utils/dateTime"
import { parseUnits } from "@ethersproject/units"
import { subtractSlippage } from "../utils/slippage"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import { useToast } from "./useToast"

interface ApproveAndDepositStateArgument {
  [tokenSymbol: string]: NumberInputState
}

export function useApproveAndDeposit(
  poolName: PoolName,
): (state: ApproveAndDepositStateArgument) => Promise<void> {
  const dispatch = useDispatch()
  const swapContract = useSwapContract(poolName)
  const tokenContracts = useAllContracts()
  const { account } = useActiveWeb3React()
  const { addToast, clearToasts } = useToast()
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

  return async function approveAndDeposit(
    state: ApproveAndDepositStateArgument,
  ): Promise<void> {
    if (!account) throw new Error("Wallet must be connected")
    if (!swapContract) throw new Error("Swap contract is not loaded")

    const approveSingleToken = async (token: Token): Promise<void> => {
      const spendingValue = BigNumber.from(state[token.symbol].valueSafe)
      if (spendingValue.isZero()) return
      const tokenContract = tokenContracts?.[token.symbol] as Erc20
      if (tokenContract == null) return
      await checkAndApproveTokenForTrade(
        tokenContract,
        swapContract.address,
        account,
        spendingValue,
        infiniteApproval,
        {
          onTransactionStart: () => {
            return addToast(
              {
                type: "pending",
                title: `${getFormattedTimeString()} Approving spend for ${
                  token.name
                }`,
              },
              {
                autoDismiss: false, // TODO: be careful of orphan toasts on error
              },
            )
          },
          onTransactionSuccess: () => {
            return addToast({
              type: "success",
              title: `${getFormattedTimeString()} Successfully approved spend for ${
                token.name
              }`,
            })
          },
          onTransactionError: () => {
            throw new Error("Your transaction could not be completed")
          },
        },
      )
      return
    }
    try {
      // For each token being deposited, check the allowance and approve it if necessary
      if (!IS_PRODUCTION) {
        for (const token of POOL.poolTokens) {
          await approveSingleToken(token)
        }
      } else {
        await Promise.all(
          POOL.poolTokens.map((token) => approveSingleToken(token)),
        )
      }

      // "isFirstTransaction" check can be removed after launch
      const poolTokenBalances: BigNumber[] = await Promise.all(
        POOL.poolTokens.map(async (token, i) => {
          return await swapContract.getTokenBalance(i)
        }),
      )
      const isFirstTransaction = poolTokenBalances.every((bal) => bal.isZero())
      let minToMint: BigNumber
      if (isFirstTransaction) {
        minToMint = BigNumber.from("0")
      } else {
        if (poolName === ALETH_POOL_NAME) {
          minToMint = await (swapContract as SwapFlashLoanNoWithdrawFee).calculateTokenAmount(
            POOL.poolTokens.map(({ symbol }) => state[symbol].valueSafe),
            true, // deposit boolean
          )
        } else {
          minToMint = await (swapContract as SwapFlashLoan).calculateTokenAmount(
            account,
            POOL.poolTokens.map(({ symbol }) => state[symbol].valueSafe),
            true, // deposit boolean
          )
        }
      }

      minToMint = subtractSlippage(minToMint, slippageSelected, slippageCustom)
      const clearMessage = addToast({
        type: "pending",
        title: `${getFormattedTimeString()} Starting your deposit...`,
      })
      let gasPrice
      if (gasPriceSelected === GasPrices.Custom) {
        gasPrice = gasCustom?.valueSafe
      } else if (gasPriceSelected === GasPrices.Fast) {
        gasPrice = gasFast
      } else if (gasPriceSelected === GasPrices.Instant) {
        gasPrice = gasInstant
      } else {
        gasPrice = gasStandard
      }
      gasPrice = parseUnits(String(gasPrice) || "45", 9)
      const deadline = formatDeadlineToNumber(
        transactionDeadlineSelected,
        transactionDeadlineCustom,
      )

      let spendTransaction
      const txnAmounts = POOL.poolTokens.map(
        ({ symbol }) => state[symbol].valueSafe,
      )
      const txnDeadline = Math.round(
        new Date().getTime() / 1000 + 60 * deadline,
      )
      if (poolName === BTC_POOL_NAME) {
        const swapGuardedContract = swapContract as SwapGuarded
        spendTransaction = await swapGuardedContract?.addLiquidity(
          txnAmounts,
          minToMint,
          txnDeadline,
          [],
          {
            gasPrice,
          },
        )
      } else {
        const swapFlashLoanContract = swapContract as SwapFlashLoan
        spendTransaction = await swapFlashLoanContract?.addLiquidity(
          txnAmounts,
          minToMint,
          txnDeadline,
          {
            gasPrice,
          },
        )
      }
      await spendTransaction.wait()
      dispatch(
        updateLastTransactionTimes({
          [TRANSACTION_TYPES.DEPOSIT]: Date.now(),
        }),
      )
      clearMessage()
      addToast({
        type: "success",
        title: `${getFormattedTimeString()} Liquidity added, giddyup! 🤠`,
      })
      return Promise.resolve()
    } catch (e) {
      console.error(e)
      clearToasts()
      addToast({
        type: "error",
        title: `${getFormattedTimeString()} Unable to complete your transaction`,
      })
    }
  }
}
