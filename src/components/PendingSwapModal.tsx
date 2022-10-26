import { Box, DialogContent, Link, Typography } from "@mui/material"
import React, { ReactElement, useCallback, useState } from "react"
import {
  calculateExchangeRate,
  calculatePrice,
  commify,
  formatBNToString,
  formatDeadlineToNumber,
} from "../utils"
import { enqueuePromiseToast, enqueueToast } from "./Toastify"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import ConfirmTransaction from "./ConfirmTransaction"
import InfoIcon from "@mui/icons-material/InfoOutlined"
import { PendingSwap } from "../hooks/usePendingSwapData"
import PendingSwapExchange from "./PendingSwapExchange"
import PendingSwapTimeline from "./PendingSwapTimeline"
import ReviewVirtualSwapSettlement from "./ReviewVirtualSwapSettlement"
import { SWAP_TYPES } from "../constants"
import { Zero } from "@ethersproject/constants"
import { calculatePriceImpact } from "../utils/priceImpact"
import { formatUnits } from "@ethersproject/units"
import { gasBNFromState } from "../utils/gas"
import { subtractSlippage } from "../utils/slippage"
import { useActiveWeb3React } from "../hooks"
import { useBridgeContract } from "../hooks/useContract"
import { useEffect } from "react"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

type ModalStep = "timer" | "exchange" | "review" | "confirmation"
const PendingSwapModal = ({
  pendingSwap,
  onClose,
}: {
  pendingSwap: PendingSwap
  onClose: () => void
}): ReactElement => {
  const {
    secondsRemaining,
    tokenTo,
    synthBalance,
    synthTokenFrom,
    itemId,
    swapType,
  } = pendingSwap
  const { t } = useTranslation()
  const { chainId } = useActiveWeb3React()
  const {
    slippageCustom,
    slippageSelected,
    gasPriceSelected,
    gasCustom,
    transactionDeadlineSelected,
    transactionDeadlineCustom,
  } = useSelector((state: AppState) => state.user)
  const { tokenPricesUSD, gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )
  const bridgeContract = useBridgeContract()
  const [settlementState, setSettlementState] = useState<{
    action: "withdraw" | "settle" | null
    amount: BigNumber
  }>({
    action: null,
    amount: Zero,
  })
  const [calculatedTokenAmount, setCalculatedTokenAmount] =
    useState<BigNumber | null>(null)
  const [currentStep, setCurrentStep] = useState<ModalStep>(
    secondsRemaining === 0 ? "exchange" : "timer",
  )
  useEffect(() => {
    // Watch the timer and transition to the "exchange" state
    if (currentStep === "timer" && secondsRemaining === 0) {
      setCurrentStep("exchange")
    }
  }, [secondsRemaining, currentStep])
  useEffect(() => {
    async function calcAmount() {
      if (
        !bridgeContract ||
        settlementState.amount.isZero() ||
        (swapType !== SWAP_TYPES.SYNTH_TO_TOKEN &&
          swapType !== SWAP_TYPES.TOKEN_TO_TOKEN)
      )
        return
      const calculatedAmount = await bridgeContract?.calcCompleteToToken(
        itemId,
        settlementState.amount,
      )
      setCalculatedTokenAmount(calculatedAmount)
    }
    void calcAmount()
  }, [bridgeContract, settlementState, itemId, swapType])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const gasPrice = gasBNFromState(
    { gasStandard, gasFast, gasInstant },
    gasPriceSelected,
    gasCustom,
  ).mul(BigNumber.from(10).pow(9))
  const handlePendingSwapSettlement = useCallback(
    (action: "withdraw" | "settle", amount: BigNumber) => {
      setSettlementState({
        action,
        amount,
      })
      setCurrentStep("review")
    },
    [setSettlementState],
  )

  const handleConfirmSettlement = useCallback(async () => {
    try {
      setCurrentStep("confirmation")
      const txnArgs = {}
      let transaction
      if (settlementState.action === "withdraw") {
        transaction = await bridgeContract?.withdraw(
          itemId,
          settlementState.amount,
          txnArgs,
        )
      } else if (
        settlementState.action === "settle" &&
        (swapType === SWAP_TYPES.SYNTH_TO_TOKEN ||
          swapType === SWAP_TYPES.TOKEN_TO_TOKEN) &&
        calculatedTokenAmount != null
      ) {
        const deadline = Math.round(
          new Date().getTime() / 1000 +
            60 *
              formatDeadlineToNumber(
                transactionDeadlineSelected,
                transactionDeadlineCustom,
              ),
        )
        transaction = await bridgeContract?.completeToToken(
          itemId,
          settlementState.amount,
          subtractSlippage(
            calculatedTokenAmount,
            slippageSelected,
            slippageCustom,
          ),
          deadline,
          txnArgs,
        )
      } else if (
        settlementState.action === "settle" &&
        swapType === SWAP_TYPES.TOKEN_TO_SYNTH
      ) {
        transaction = await bridgeContract?.completeToSynth(itemId, txnArgs)
      } else {
        console.error("Unable to confirm settlement")
        console.table([
          ["action", settlementState.action],
          ["swap type", swapType],
          ["swap amount", settlementState.amount.toString()],
        ])
        return
      }
      transaction &&
        chainId &&
        (await enqueuePromiseToast(chainId, transaction.wait(), "swap"))
      onClose()
    } catch (e) {
      console.error(e)
      enqueueToast(
        "error",
        e instanceof Error ? e.message : "Transaction Failed",
      )
    }
  }, [
    settlementState,
    bridgeContract,
    itemId,
    calculatedTokenAmount,
    onClose,
    slippageCustom,
    slippageSelected,
    swapType,
    transactionDeadlineCustom,
    transactionDeadlineSelected,
    chainId,
  ])

  const minutesRemaining = Math.max(Math.ceil(secondsRemaining / 60), 0)
  const fromAmount =
    settlementState.action === "settle" &&
    swapType === SWAP_TYPES.TOKEN_TO_SYNTH
      ? synthBalance
      : settlementState.amount
  if (!synthTokenFrom || !tokenTo || !tokenPricesUSD) return <></>
  const formattedSynthBalance = commify(
    formatBNToString(synthBalance, synthTokenFrom.decimals, 6),
  )

  return (
    <DialogContent>
      {(currentStep === "timer" || currentStep === "exchange") && (
        <div>
          <div>
            <b>
              {formattedSynthBalance} {synthTokenFrom.address} {"->"}{" "}
              {tokenTo.address}
            </b>
          </div>
          <div>
            {currentStep === "timer" && (
              <Typography
                variant="h2"
                color="primary"
                textAlign="center"
                mt={4}
              >
                {t("waiting")}
                {t("minutesLeft", { count: minutesRemaining })}
              </Typography>
            )}
            {currentStep === "exchange" && (
              <PendingSwapExchange
                pendingSwap={pendingSwap}
                onPendingSwapSettlement={handlePendingSwapSettlement}
              />
            )}
          </div>
          <div>
            <Typography variant="subtitle1" mt={4} mb={2}>
              {t("swapTimeline")}
            </Typography>
            <PendingSwapTimeline pendingSwap={pendingSwap} />
            <Box display="flex" alignItems="center">
              <InfoIcon sx={{ mr: 1 }} />
              <Link
                href="https://docs.saddle.finance/saddle-faq#what-is-virtual-swap"
                target="_blank"
                rel="noreferrer"
              >
                {t("aboutVirtualSwap")}
              </Link>
            </Box>
          </div>
        </div>
      )}
      {currentStep === "review" && (
        <ReviewVirtualSwapSettlement
          onClose={onClose}
          onConfirm={() => void handleConfirmSettlement}
          data={{
            from: {
              symbol: synthTokenFrom.symbol,
              value: formatUnits(fromAmount, synthTokenFrom.decimals),
            },
            swapType,
            ...(settlementState.action === "settle"
              ? {
                  to: {
                    symbol: tokenTo.symbol,
                    value: formatUnits(
                      calculatedTokenAmount || Zero,
                      tokenTo.decimals,
                    ),
                  },
                  exchangeRateInfo: {
                    pair: `${synthTokenFrom.symbol}/${tokenTo.symbol}`,
                    priceImpact: calculatedTokenAmount
                      ? calculatePriceImpact(
                          calculatePrice(
                            fromAmount,
                            tokenPricesUSD[synthTokenFrom.address],
                            synthTokenFrom.decimals,
                          ),
                          calculatePrice(
                            calculatedTokenAmount || Zero,
                            tokenPricesUSD[tokenTo.address],
                            tokenTo.decimals,
                          ),
                        )
                      : Zero,
                    exchangeRate: calculateExchangeRate(
                      settlementState.amount,
                      synthTokenFrom.decimals,
                      calculatedTokenAmount || Zero,
                      tokenTo.decimals,
                    ),
                  },
                }
              : {}),
          }}
        />
      )}
      {currentStep === "confirmation" && <ConfirmTransaction />}
    </DialogContent>
  )
}

export default PendingSwapModal
