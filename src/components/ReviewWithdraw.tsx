import {
  Box,
  Button,
  DialogContent,
  Divider,
  Typography,
  styled,
} from "@mui/material"
import React, { ReactElement, useState } from "react"
import { AppState } from "../state/index"
import { GasPrices } from "../state/user"
import HighPriceImpactConfirmation from "./HighPriceImpactConfirmation"
import { ReviewWithdrawData } from "./WithdrawPage"
import TokenIcon from "./TokenIcon"
import { formatDeadlineToNumber } from "../utils"
import { formatGasToString } from "../utils/gas"
import { formatSlippageToString } from "../utils/slippage"
import { formatUnits } from "@ethersproject/units"
import { isHighPriceImpact } from "../utils/priceImpact"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  onClose: () => void
  onConfirm: () => void
  data: ReviewWithdrawData
  gas: GasPrices
}

const WithdrawInfoItem = styled(Box)(() => ({
  display: "flex",
  justifyContent: "space-between",
}))

function ReviewWithdraw({ onClose, onConfirm, data }: Props): ReactElement {
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
  const isHighSlippageTxn = isHighPriceImpact(data.priceImpact)
  const deadline = formatDeadlineToNumber(
    transactionDeadlineSelected,
    transactionDeadlineCustom,
  )
  const shouldDisplayGas = !!gasStandard

  return (
    <DialogContent>
      <Typography variant="h1">{t("reviewWithdraw")}</Typography>
      <Typography variant="subtitle1" my={2}>
        {t("withdrawing")}
      </Typography>
      <WithdrawInfoItem>
        <Box display="flex" alignItems="center">
          <TokenIcon
            symbol={"saddle_lp_token.svg"}
            alt="icon"
            width={20}
            height={20}
          />
          <Typography ml={0.5}>SaddleUSD-V2</Typography>
        </Box>
        <Typography variant="body1">
          {formatUnits(data.withdrawLPTokenAmount)}
        </Typography>
      </WithdrawInfoItem>
      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle1" my={2}>
        {t("receiving")}
      </Typography>
      <Box>
        {data.withdraw.map((token, index) => (
          <WithdrawInfoItem key={index} mb={1}>
            <Box display="flex" alignItems="center">
              <TokenIcon
                symbol={token.symbol}
                alt="icon"
                width={20}
                height={20}
              />
              <Typography ml={0.5}>{token.name}</Typography>
            </Box>

            <Typography variant="body1">{token.value}</Typography>
          </WithdrawInfoItem>
        ))}
        <WithdrawInfoItem>
          <Typography variant="body1">{t("total")}</Typography>
          <Typography>{data.totalAmount}</Typography>
        </WithdrawInfoItem>
      </Box>
      <Divider sx={{ my: 3 }} />
      {shouldDisplayGas && (
        <WithdrawInfoItem>
          <Typography variant="body1">{t("gas")}</Typography>
          <Typography variant="body1">
            {formatGasToString(
              { gasStandard, gasFast, gasInstant },
              gasPriceSelected,
              gasCustom,
            )}{" "}
            GWEI
          </Typography>
        </WithdrawInfoItem>
      )}
      {/* TODO: Create a light API to expose the cached BlockNative gas estimates. */}
      {/* {data.txnGasCost?.valueUSD && (
          <WithdrawInfoItem>
            <Typography variant="body1">{t("estimatedTxCost")}</Typography>
            <Typography variant="body1">
              {`≈$${commify(formatBNToString(data.txnGasCost.valueUSD, 2, 2))}`}{" "}
            </Typography>
          
        )} */}
      <WithdrawInfoItem>
        <Typography variant="body1">{t("maxSlippage")}</Typography>
        <Typography variant="body1">
          {formatSlippageToString(slippageSelected, slippageCustom)}%
        </Typography>
      </WithdrawInfoItem>
      <WithdrawInfoItem>
        <Typography variant="body1">{t("deadline")}</Typography>
        <Typography variant="body1">
          {deadline} {t("minutes")}
        </Typography>
      </WithdrawInfoItem>
      <WithdrawInfoItem>
        <Typography variant="body1">{`${t("rates")}`}</Typography>
        <Box textAlign="right">
          {data.rates.map((rate, index) => (
            <Typography key={index}>
              1 {rate.name} = ${rate.rate}
            </Typography>
          ))}
        </Box>
      </WithdrawInfoItem>
      {isHighSlippageTxn && (
        <WithdrawInfoItem>
          <HighPriceImpactConfirmation
            checked={hasConfirmedHighPriceImpact}
            onCheck={(): void =>
              setHasConfirmedHighPriceImpact((prevState) => !prevState)
            }
          />
        </WithdrawInfoItem>
      )}
      <Divider sx={{ my: 3 }} />
      <Typography variant="body2">{t("estimatedOutput")}</Typography>
      <Box mt={2}>
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={onConfirm}
          disabled={isHighSlippageTxn && !hasConfirmedHighPriceImpact}
        >
          {t("confirmWithdraw")}
        </Button>
        <Button size="large" fullWidth onClick={onClose} sx={{ mt: 1 }}>
          {t("cancel")}
        </Button>
      </Box>
    </DialogContent>
  )
}

export default ReviewWithdraw
