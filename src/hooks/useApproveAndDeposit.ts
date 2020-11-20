import {
  BTC_POOL_NAME,
  BTC_POOL_TOKENS,
  DAI,
  PoolName,
  RENBTC,
  SBTC,
  STABLECOIN_POOL_NAME,
  STABLECOIN_POOL_TOKENS,
  SUSD,
  TBTC,
  TEST_STABLECOIN_SWAP_ADDRESS,
  Token,
  USDC,
  USDT,
  WBTC,
} from "../constants"
import { GasPrices, Slippages } from "../state/user"
import { useSwapContracts, useTokenContract } from "./useContract"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { NumberInputState } from "../utils/numberInputState"
import { applySlippage } from "../utils/slippage"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { getFormattedTimeString } from "../utils/dateTime"
import { useActiveWeb3React } from "."
import { useSelector } from "react-redux"
import { useToast } from "./useToast"

interface ApproveAndDepositStateArgument {
  tokenFormState: { [tokenSymbol: string]: NumberInputState }
  infiniteApproval: boolean
  slippageSelected: Slippages
  slippageCustom?: NumberInputState
  gasPriceSelected: GasPrices
  gasCustom?: NumberInputState
}

export function useApproveAndDeposit(
  poolName: PoolName,
): (state: ApproveAndDepositStateArgument) => Promise<void> {
  const swapContracts = useSwapContracts()
  const { account } = useActiveWeb3React()
  const { addToast, clearToasts } = useToast()
  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )
  const tbtcContract = useTokenContract(TBTC)
  const wbtcContract = useTokenContract(WBTC)
  const renbtcContract = useTokenContract(RENBTC)
  const sbtcContract = useTokenContract(SBTC)
  const daiContract = useTokenContract(DAI)
  const usdcContract = useTokenContract(USDC)
  const usdtContract = useTokenContract(USDT)
  const susdContract = useTokenContract(SUSD)
  const tokenContracts = {
    [TBTC.symbol]: tbtcContract,
    [WBTC.symbol]: wbtcContract,
    [RENBTC.symbol]: renbtcContract,
    [SBTC.symbol]: sbtcContract,
    [DAI.symbol]: daiContract,
    [USDC.symbol]: usdcContract,
    [USDT.symbol]: usdtContract,
    [SUSD.symbol]: susdContract,
  }
  let tokens: Token[]
  if (poolName === BTC_POOL_NAME) {
    tokens = BTC_POOL_TOKENS
  } else if (poolName === STABLECOIN_POOL_NAME) {
    tokens = STABLECOIN_POOL_TOKENS
  } else {
    new Error("useApproveAndDeposit requires a valid pool name")
  }

  return async function approveAndDeposit(
    state: ApproveAndDepositStateArgument,
  ): Promise<void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      // For each token being desposited, check the allowance and approve it if necessary
      for (const token of tokens) {
        const spendingValue = BigNumber.from(
          state.tokenFormState[token.symbol].valueSafe,
        )
        if (spendingValue.isZero()) continue
        const tokenContract = tokenContracts[token.symbol]
        if (tokenContract == null) continue
        await checkAndApproveTokenForTrade(
          tokenContract,
          TEST_STABLECOIN_SWAP_ADDRESS, // TODO: productionize!
          account,
          spendingValue,
          state.infiniteApproval,
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
      }
      // "isFirstTransaction" check can be removed after launch
      const poolTokenBalances: BigNumber[] = await Promise.all(
        tokens.map(async (token, i) => {
          return await swapContracts?.[poolName]?.getTokenBalance(i)
        }),
      )
      const isFirstTransaction = poolTokenBalances.every((bal) => bal.isZero())
      let minToMint: BigNumber
      if (isFirstTransaction) {
        minToMint = BigNumber.from("0")
      } else {
        minToMint = await swapContracts?.[poolName]?.calculateTokenAmount(
          tokens.map(({ symbol }) => state.tokenFormState[symbol].valueSafe),
          true, // deposit boolean
        )
      }
      console.debug(`MinToMint 1: ${minToMint.toString()}`)

      minToMint = applySlippage(
        minToMint,
        state.slippageSelected,
        state.slippageCustom,
      )
      console.debug(`MinToMint 2: ${minToMint.toString()}`)
      const clearMessage = addToast({
        type: "pending",
        title: `${getFormattedTimeString()} Starting your deposit...`,
      })
      let gasPrice
      if (state.gasPriceSelected === GasPrices.Custom) {
        gasPrice = state.gasCustom?.valueSafe
      } else if (state.gasPriceSelected === GasPrices.Fast) {
        gasPrice = gasFast
      } else if (state.gasPriceSelected === GasPrices.Instant) {
        gasPrice = gasInstant
      } else {
        gasPrice = gasStandard
      }
      gasPrice = BigNumber.from(gasPrice)?.mul(BigNumber.from(10).pow(9)) // TODO: unjank this
      const spendTransaction = await swapContracts?.[poolName]?.addLiquidity(
        tokens.map(({ symbol }) => state.tokenFormState[symbol].valueSafe),
        minToMint,
        Math.round(new Date().getTime() / 1000 + 60 * 10),
        {
          gasPrice,
        },
      )
      await spendTransaction.wait()
      clearMessage()
      addToast({
        type: "success",
        title: `${getFormattedTimeString()} Liquidity added, giddyup! 🤠`,
      })
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
