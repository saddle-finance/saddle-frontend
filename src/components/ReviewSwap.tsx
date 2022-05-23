import {
  Box,
  Button,
  DialogContent,
  Divider,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material"
import React, { ReactElement, useState } from "react"
import { SWAP_TYPES, getIsVirtualSwap } from "../constants"
import { formatBNToString, formatDeadlineToNumber } from "../utils"

import { AppState } from "../state/index"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import { BigNumber } from "@ethersproject/bignumber"
import DialogTitle from "./DialogTitle"
import DoubleArrowDown from "@mui/icons-material/KeyboardDoubleArrowDown"
import HighPriceImpactConfirmation from "./HighPriceImpactConfirmation"
import TokenIcon from "./TokenIcon"
// import { formatGasToString } from "../utils/gas"
import { formatSlippageToString } from "../utils/slippage"
import { isHighPriceImpact } from "../utils/priceImpact"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  onClose: () => void
  onConfirm: () => void
  data: {
    from: { symbol: string; value: string }
    to: { symbol: string; value: string }
    exchangeRateInfo: {
      pair: string
      priceImpact: BigNumber
      exchangeRate: BigNumber
      route: string[]
    }
    swapType: SWAP_TYPES
    txnGasCost: {
      amount: BigNumber
      valueUSD: BigNumber | null // amount * ethPriceUSD
    }
  }
}

function ReviewSwap({ onClose, onConfirm, data }: Props): ReactElement {
  const { t } = useTranslation()
  const {
    slippageCustom,
    slippageSelected,
    // gasPriceSelected,
    // gasCustom,
    transactionDeadlineSelected,
    transactionDeadlineCustom,
  } = useSelector((state: AppState) => state.user)
  // const { gasStandard, gasFast, gasInstant } = useSelector(
  //   (state: AppState) => state.application,
  // )
  const [hasConfirmedHighPriceImpact, setHasConfirmedHighPriceImpact] =
    useState(false)
  const isHighPriceImpactTxn = isHighPriceImpact(
    data.exchangeRateInfo.priceImpact,
  )
  const isVirtualSwap = getIsVirtualSwap(data.swapType)
  const deadline = formatDeadlineToNumber(
    transactionDeadlineSelected,
    transactionDeadlineCustom,
  )

  return (
    <Paper>
      <DialogTitle variant="h1">{t("reviewSwap")}</DialogTitle>
      <DialogContent>
        {isVirtualSwap ? (
          <VirtualSwapTokens data={data} />
        ) : (
          <DirectSwapTokens data={data} />
        )}
        {data.swapType === SWAP_TYPES.SYNTH_TO_SYNTH && (
          <Box>
            <Typography>
              {t("virtualSwapSynthToSynthInfo")}{" "}
              <Link href="https://blog.synthetix.io/how-fee-reclamation-rebates-work/">
                {t("learnMore")}
              </Link>
            </Typography>
          </Box>
        )}
        <Divider sx={{ my: 3 }} />
        <Stack mb={3} spacing={1}>
          <Box display="flex">
            <Typography component="span">{t("price")} </Typography>
            <Typography component="span" mx={1}>
              {data.exchangeRateInfo.pair}
            </Typography>
            <Button variant="contained" size="small">
              <svg
                width="24"
                height="20"
                viewBox="0 0 24 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.4011 12.4196C17.4011 13.7551 16.5999 13.8505 16.4472 13.8505H6.62679L9.14986 11.3274L8.47736 10.6501L5.13869 13.9888C5.04986 14.0782 5 14.1991 5 14.3251C5 14.4511 5.04986 14.572 5.13869 14.6613L8.47736 18L9.14986 17.3275L6.62679 14.8044H16.4472C17.1054 14.8044 18.355 14.3274 18.355 12.4196V10.9888H17.4011V12.4196Z"
                  fill="#D67A0A"
                />
                <path
                  d="M5.9539 7.58511C5.9539 6.24965 6.75519 6.15426 6.90781 6.15426H16.7283L14.2052 8.67733L14.8777 9.34984L18.2164 6.01117C18.3052 5.92181 18.355 5.80092 18.355 5.67492C18.355 5.54891 18.3052 5.42803 18.2164 5.33867L14.8777 2L14.2004 2.67727L16.7283 5.20035H6.90781C6.24962 5.20035 5 5.6773 5 7.58511V9.01597H5.9539V7.58511Z"
                  fill="#D67A0A"
                />
              </svg>
            </Button>
            <Typography component="span" ml="auto" mr={0}>
              {formatBNToString(data.exchangeRateInfo.exchangeRate, 18, 6)}
            </Typography>
          </Box>
          {/* Hide gas because we don't have curretnly too way of estimating this value. */}
          {/* <Box display="none">
            <Typography component="span">{t("gas")}</Typography>
            <Typography ml="auto" mr={0}>
              {formatGasToString(
                { gasStandard, gasFast, gasInstant },
                gasPriceSelected,
                gasCustom,
              )}{" "}
              GWEI
            </Typography>
          </Box> */}
          {/* TODO: Create a light API to expose the cached BlockNative gas estimates. */}
          {/* {data.txnGasCost?.valueUSD && (
            <div className="row">
              <span className="title">{t("estimatedTxCost")}</span>
              <span className="value floatRight">
                {`≈$${commify(
                  formatBNToString(data.txnGasCost.valueUSD, 2, 2),
                )}`}
              </span>
            </div>
          )} */}
          <Box display="flex">
            <Typography component="span">{t("maxSlippage")}</Typography>
            <Typography component="span" ml="auto" mr={0}>
              {formatSlippageToString(slippageSelected, slippageCustom)}%
            </Typography>
          </Box>
          {!isVirtualSwap && (
            <Box display="flex">
              <Typography component="span">{t("deadline")}</Typography>
              <Typography ml="auto" mr={0}>
                {deadline} {t("minutes")}
              </Typography>
            </Box>
          )}
          {isHighPriceImpactTxn && (
            <HighPriceImpactConfirmation
              checked={hasConfirmedHighPriceImpact}
              onCheck={(): void =>
                setHasConfirmedHighPriceImpact((prevState) => !prevState)
              }
            />
          )}
        </Stack>
        <Divider />
        <Typography variant="body2" my={3}>
          {t("estimatedOutput")}
        </Typography>
        <Stack spacing={1}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={onConfirm}
            disabled={isHighPriceImpactTxn && !hasConfirmedHighPriceImpact}
          >
            {t("confirmSwap")}
          </Button>
          <Button onClick={onClose} size="large" fullWidth>
            {t("cancel")}
          </Button>
        </Stack>
      </DialogContent>
    </Paper>
  )
}

function DirectSwapTokens({ data }: { data: Props["data"] }) {
  return (
    <Stack mb={3} spacing={1}>
      <Box display="flex" alignItems="center">
        <TokenIcon
          symbol={data.from.symbol}
          alt="icon"
          width={20}
          height={20}
        />
        <Typography component="span" ml={1}>
          {data.from.symbol}
        </Typography>
        <Typography component="span" ml="auto" mr={0}>
          {data.from.value}
        </Typography>
      </Box>
      <DoubleArrowDown color="primary" />
      <Box display="flex" alignItems="center">
        <TokenIcon symbol={data.to.symbol} alt="icon" />
        <Typography component="span" ml={1}>
          {data.to.symbol}
        </Typography>
        <Typography component="span" ml="auto" mr={0}>
          {data.to.value}
        </Typography>
      </Box>
    </Stack>
  )
}

function VirtualSwapTokens({ data }: { data: Props["data"] }) {
  const { t } = useTranslation()

  return (
    <>
      {data.exchangeRateInfo.route.map((symbol, i) => {
        const isFirst = i === 0
        const isLast = i === data.exchangeRateInfo.route.length - 1
        return (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            key={symbol}
            mb={1}
          >
            <Stack direction="row" spacing={1}>
              {!isFirst && !isLast && <ArrowDownwardIcon />}
              <TokenIcon symbol={symbol} alt="icon" />
              <Typography color={isLast ? "text.secondary" : "text.primary"}>
                {symbol}
              </Typography>

              {(isFirst || isLast) && (
                <Typography>
                  (
                  {t("stepN", {
                    step: isFirst ? 1 : 2,
                  })}
                  )
                </Typography>
              )}
            </Stack>
            <div>
              {isFirst && <Typography>{data.from.value}</Typography>}
              {isLast && (
                <Typography color="text.secondary">{data.to.value}</Typography>
              )}
            </div>
          </Box>
        )
      })}
    </>
  )
}

export default ReviewSwap
