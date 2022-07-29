import { Box, Button, Typography } from "@mui/material"
import React, { ReactElement, useState } from "react"
import { calculatePrice, commify, formatBNToString } from "../utils"
import AdvancedOptions from "./AdvancedOptions"
import { AppState } from "../state"
import { BigNumber } from "ethers"
import { PendingSwap } from "../hooks/usePendingSwapData"
import { SWAP_TYPES } from "../constants"
import SwapTokenInput from "./SwapTokenInput"
import TokenIcon from "./TokenIcon"
import { Zero } from "@ethersproject/constants"
import { parseUnits } from "@ethersproject/units"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

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
  if (!synthTokenFrom || !tokenTo || !tokenPricesUSD) return <></>
  const formattedSynthBalance = commify(
    formatBNToString(synthBalance, synthTokenFrom.decimals, 6),
  )
  const withdraw = () => {
    const amount = inputState.value
      ? parseUnits(inputState.value, synthTokenFrom.decimals)
      : Zero
    onPendingSwapSettlement("withdraw", amount)
  }
  const settle = () => {
    const amount = inputState.value
      ? parseUnits(inputState.value, synthTokenFrom.decimals)
      : Zero
    onPendingSwapSettlement("settle", amount)
  }
  return (
    <Box width="100%">
      <Typography variant="h2" color="primary" textAlign="center" my={4}>
        {t("step2Settlement")}
      </Typography>

      <Typography textAlign="right">
        {t("available")}:{" "}
        <Button
          onClick={() =>
            setInputState((prevState) => ({
              ...prevState,
              valueBN: synthBalance,
              valueUSD: calculatePrice(
                synthBalance,
                tokenPricesUSD[synthTokenFrom.symbol],
                synthTokenFrom.decimals,
              ),
              value: formatBNToString(
                synthBalance,
                synthTokenFrom?.decimals ?? 0,
              ),
              error: null,
            }))
          }
          size="small"
        >
          {formattedSynthBalance}
        </Button>
      </Typography>

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
                tokenPricesUSD[synthTokenFrom.symbol],
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
        <Typography textAlign="center" color="error">
          {inputState.error}
        </Typography>
      )}

      <Button
        variant="contained"
        fullWidth
        color="primary"
        size="large"
        onClick={settle}
        disabled={
          (swapType !== SWAP_TYPES.TOKEN_TO_SYNTH && !inputState.value) ||
          !!inputState.error
        }
        sx={{ mt: 2 }}
      >
        {t("settleAsToken")}
        <TokenIcon
          symbol={tokenTo.symbol}
          style={{ marginLeft: "8px", marginRight: "8px" }}
        />
        {tokenTo.symbol}
      </Button>
      <Typography textAlign="center" my={1}>
        {t("OR")}
      </Typography>
      <Button
        variant="contained"
        fullWidth
        color="secondary"
        size="large"
        onClick={withdraw}
        disabled={!inputState.value || !!inputState.error}
      >
        {t("withdrawSynth")}
        <TokenIcon
          symbol={synthTokenFrom.symbol}
          style={{ marginLeft: "8px", marginRight: "8px" }}
        />
        {synthTokenFrom.symbol}
      </Button>

      <AdvancedOptions isOutlined />
    </Box>
  )
}

export default PendingSwapExchange
