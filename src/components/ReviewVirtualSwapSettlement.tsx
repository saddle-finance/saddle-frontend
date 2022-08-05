import { Box, Button, Divider, Typography } from "@mui/material"
import React, { ReactElement, useState } from "react"
import { commify, formatBNToString, formatDeadlineToNumber } from "../utils"

import { AppState } from "../state/index"
import { BigNumber } from "@ethersproject/bignumber"
import DoubleArrow from "@mui/icons-material/KeyboardDoubleArrowDown"
import HighPriceImpactConfirmation from "./HighPriceImpactConfirmation"
import { SWAP_TYPES } from "../constants"
import TokenIcon from "./TokenIcon"
import { formatGasToString } from "../utils/gas"
import { formatSlippageToString } from "../utils/slippage"
import { isHighPriceImpact } from "../utils/priceImpact"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  onClose: () => void
  onConfirm: () => void
  data: {
    from: { symbol: string; value: string }
    to?: { symbol: string; value: string }
    swapType: SWAP_TYPES
    exchangeRateInfo?: {
      pair: string
      exchangeRate: BigNumber
      priceImpact: BigNumber
    }
  }
}

function ReviewVirtualSwapSettlement({
  onClose,
  onConfirm,
  data,
}: Props): ReactElement {
  const { t } = useTranslation()
  const {
    slippageCustom,
    slippageSelected,
    gasPriceSelected,
    gasCustom,
    transactionDeadlineSelected,
    transactionDeadlineCustom,
  } = useSelector((state: AppState) => state.user)
  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )
  const [hasConfirmedHighPriceImpact, setHasConfirmedHighPriceImpact] =
    useState(false)
  const isHighPriceImpactTxn = Boolean(
    data.to?.value &&
      data.exchangeRateInfo &&
      isHighPriceImpact(data.exchangeRateInfo.priceImpact),
  )
  const deadline = formatDeadlineToNumber(
    transactionDeadlineSelected,
    transactionDeadlineCustom,
  )
  // const gasPrice = gasBNFromState(
  //   { gasStandard, gasFast, gasInstant },
  //   gasPriceSelected,
  //   gasCustom,
  // )
  // const gasAmount = calculateGasEstimate("virtualSwapSettleOrWithdraw").mul(
  //   gasPrice,
  // )
  // const gasValueUSD = tokenPricesUSD?.ETH
  //   ? parseUnits(tokenPricesUSD.ETH.toFixed(2), 18) // USD / ETH  * 10^18
  //       .mul(gasAmount) // GWEI
  //       .div(BigNumber.from(10).pow(25)) // USD / ETH * GWEI * ETH / GWEI = USD
  //   : null
  const shouldDisplayGas = !!gasStandard
  const isWithdrawAction = !data.to
  return (
    <div>
      <Typography variant="h1" mb={3}>
        {isWithdrawAction ? t("step2ReviewWithdraw") : t("step2ReviewSettle")}
      </Typography>

      <Box display="flex" alignItems="center">
        <TokenIcon
          symbol={data.from.symbol}
          alt="icon"
          width={20}
          height={20}
        />
        <Typography ml={1}>{data.from.symbol}</Typography>
        <Typography sx={{ float: "right", ml: "auto" }}>
          {commify(data.from.value)}
        </Typography>
      </Box>

      {data.to && (
        <>
          <DoubleArrow color="primary" sx={{ fontSize: 20, marginTop: 1 }} />
          <Box display="flex" alignItems="center">
            <TokenIcon
              symbol={data.to?.symbol}
              alt="icon"
              width={20}
              height={20}
            />
            <Typography ml={1}>{data.to.symbol}</Typography>
            <Typography sx={{ float: "right", ml: "auto" }}>
              {commify(data.to.value)}
            </Typography>
          </Box>
        </>
      )}
      <Divider sx={{ my: 3 }} />

      {data.exchangeRateInfo && (
        <Box display="flex">
          <Typography>{t("rate")}</Typography>
          <Typography ml={1}>{data.exchangeRateInfo.pair}</Typography>
          <Typography sx={{ float: "right", ml: "auto" }}>
            {formatBNToString(data.exchangeRateInfo.exchangeRate, 18, 4)}
          </Typography>
        </Box>
      )}

      {shouldDisplayGas && (
        <Box display="flex">
          <Typography>{t("gas")}</Typography>
          <Typography>
            {formatGasToString(
              { gasStandard, gasFast, gasInstant },
              gasPriceSelected,
              gasCustom,
            )}{" "}
            GWEI
          </Typography>
        </Box>
      )}
      {/* TODO: Create a light API to expose the cached BlockNative gas estimates. */}
      {/* {gasValueUSD && (
            <Box display = 'flex'>
              <Typography className="title">{t("estimatedTxCost")}</Typography> 
              <Typography sx={{ float: "right", ml: "auto" }}>
                {`≈$${commify(formatBNToString(gasValueUSD, 2, 2))}`}
              </Typography>
            </Box>
          )} */}
      <Box display="flex">
        <Typography>{t("maxSlippage")}</Typography>
        <Typography sx={{ float: "right", ml: "auto" }}>
          {formatSlippageToString(slippageSelected, slippageCustom)}%
        </Typography>
      </Box>
      <Box display="flex">
        <Typography className="title">{t("deadline")}</Typography>
        <Typography sx={{ float: "right", ml: "auto" }}>
          {deadline} {t("minutes")}
        </Typography>
      </Box>
      {isHighPriceImpactTxn && (
        <HighPriceImpactConfirmation
          checked={hasConfirmedHighPriceImpact}
          onCheck={(): void =>
            setHasConfirmedHighPriceImpact((prevState) => !prevState)
          }
        />
      )}

      <Divider sx={{ my: 3 }} />

      <Typography variant="body2" mb={2}>
        {t("estimatedOutput")}
      </Typography>
      <Button
        variant="contained"
        color={isWithdrawAction ? "secondary" : "primary"}
        fullWidth
        size="large"
        onClick={() => void onConfirm()}
        disabled={isHighPriceImpactTxn && !hasConfirmedHighPriceImpact}
      >
        {isWithdrawAction ? t("confirmWithdraw") : t("confirmSwap")}
      </Button>
      <Button
        color={isWithdrawAction ? "secondary" : "primary"}
        fullWidth
        size="large"
        onClick={onClose}
        sx={{ mt: 1 }}
      >
        {t("cancel")}
      </Button>
    </div>
  )
}

export default ReviewVirtualSwapSettlement
