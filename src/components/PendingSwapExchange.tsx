import React, { ReactElement, useCallback, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { calculatePrice, commify, formatBNToString } from "../utils"

import AdvancedOptions from "./AdvancedOptions"
import { AppState } from "../state"
import { BigNumber } from "ethers"
import Button from "./Button"
import { PendingSwap } from "../hooks/usePendingSwapData"
import { SWAP_TYPES } from "../constants"
import SwapTokenInput from "./SwapTokenInput"
import { Zero } from "@ethersproject/constants"
import { parseUnits } from "@ethersproject/units"
import styles from "./PendingSwapExchange.module.scss"
import { useSelector } from "react-redux"

const PendingSwapExchange = ({
  pendingSwap,
  onPendingSwapSettlement,
}: {
  pendingSwap: PendingSwap
  onPendingSwapSettlement: (
    action: "withdraw" | "settle",
    amount: BigNumber,
  ) => void
}): ReactElement => {
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)
  const [inputState, setInputState] = useState<{
    value: string
    valueBN: BigNumber
    valueUSD: BigNumber
    error: string | null
  }>({
    value: "",
    valueBN: Zero,
    valueUSD: Zero,
    error: null,
  })
  const { t } = useTranslation()
  const { synthTokenFrom, tokenTo, synthBalance, swapType } = pendingSwap
  const formattedSynthBalance = commify(
    formatBNToString(synthBalance, synthTokenFrom.decimals, 6),
  )
  const withdraw = useCallback(() => {
    const amount = inputState.value
      ? parseUnits(inputState.value, synthTokenFrom.decimals)
      : Zero
    onPendingSwapSettlement("withdraw", amount)
  }, [inputState.value, synthTokenFrom.decimals, onPendingSwapSettlement])
  const settle = useCallback(() => {
    const amount = inputState.value
      ? parseUnits(inputState.value, synthTokenFrom.decimals)
      : Zero
    onPendingSwapSettlement("settle", amount)
  }, [inputState.value, synthTokenFrom.decimals, onPendingSwapSettlement])
  return (
    <div className={styles.exchangeWrapper}>
      <div className={styles.stepWrapper}>
        <h2>{t("step2Settlement")}</h2>
      </div>
      <div className={styles.balanceWrapper}>
        <p>
          {t("balance")}:{" "}
          <b
            data-testid="max-balance-btn"
            className={styles.balance}
            onClick={() =>
              setInputState((prevState) => ({
                ...prevState,
                valueBN: synthBalance,
                valueUSD: calculatePrice(
                  synthBalance,
                  tokenPricesUSD?.[synthTokenFrom.symbol],
                  synthTokenFrom.decimals,
                ),
                value: formatBNToString(synthBalance, synthTokenFrom.decimals),
                error: null,
              }))
            }
          >
            {formattedSynthBalance}
          </b>
        </p>
      </div>
      <SwapTokenInput
        tokens={[]}
        onChangeAmount={(newValue) =>
          setInputState((prevState) => {
            const cleanedValue = newValue.replace(/[$,]/g, "")
            const isInputNumber = !(isNaN(+cleanedValue) || cleanedValue === "")
            const isInvalid =
              !isInputNumber && cleanedValue !== "" && cleanedValue !== "."
            if (isInvalid) {
              return prevState
            }
            const valueBN = isInputNumber
              ? parseUnits(cleanedValue, synthTokenFrom.decimals)
              : Zero
            return {
              value: newValue,
              valueBN,
              valueUSD: calculatePrice(
                valueBN,
                tokenPricesUSD?.[synthTokenFrom.symbol],
                synthTokenFrom.decimals,
              ),
              error: valueBN.gt(synthBalance) ? t("insufficientBalance") : null,
            }
          })
        }
        selected={synthTokenFrom.symbol}
        inputValue={inputState.value}
        inputValueUSD={inputState.valueUSD}
        isSwapFrom={true}
      />
      {inputState.error && (
        <div className={styles.error}>{inputState.error}</div>
      )}
      <div className={styles.buttonGroup}>
        <Button
          data-testid="settle-as-btn"
          onClick={settle}
          disabled={
            (swapType !== SWAP_TYPES.TOKEN_TO_SYNTH && !inputState.value) ||
            !!inputState.error
          }
        >
          <Trans t={t} i18nKey="settleAsToken">
            Settle as <img src={tokenTo.icon} /> {{ name: tokenTo.symbol }}
          </Trans>
        </Button>
        <Button
          onClick={withdraw}
          disabled={!inputState.value || !!inputState.error}
        >
          <Trans t={t} i18nKey="withdrawSynth">
            Withdraw <img src={synthTokenFrom.icon} />{" "}
            {{ name: synthTokenFrom.symbol }}
          </Trans>
        </Button>
      </div>
      <AdvancedOptions />
    </div>
  )
}

export default PendingSwapExchange
