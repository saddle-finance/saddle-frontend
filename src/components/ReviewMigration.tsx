import {
  Alert,
  Box,
  Button,
  DialogContent,
  Divider,
  Typography,
} from "@mui/material"
import React, { ReactElement, useContext } from "react"
import { commify, formatBNToString } from "../utils"

import { AppState } from "../state/index"
import { BigNumber } from "@ethersproject/bignumber"
import DialogTitle from "./DialogTitle"
import { TokensContext } from "../providers/TokensProvider"
import { gasBNFromState } from "../utils/gas"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  onClose?: () => void
  onConfirm?: () => Promise<void>
  migrationAmount?: BigNumber // 1e18
  lpTokenAddress?: string
}

function ReviewMigration({
  onClose,
  onConfirm,
  migrationAmount,
  lpTokenAddress,
}: Props): ReactElement {
  const { t } = useTranslation()
  const tokens = useContext(TokensContext)
  const { gasPriceSelected, gasCustom } = useSelector(
    (state: AppState) => state.user,
  )
  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )
  const gasPrice = gasBNFromState(
    { gasStandard, gasFast, gasInstant },
    gasPriceSelected,
    gasCustom,
  )
  // const gasAmount = calculateGasEstimate("migrate").mul(gasPrice)
  // const gasValueUSD = tokenPricesUSD?.ETH
  //   ? parseUnits(tokenPricesUSD.ETH.toFixed(2), 18) // USD / ETH  * 10^18
  //       .mul(gasAmount) // GWEI
  //       .div(BigNumber.from(10).pow(25)) // USD / ETH * GWEI * ETH / GWEI = USD
  //   : null
  const shouldDisplayGas = !!gasStandard

  return (
    <React.Fragment>
      <DialogTitle variant="h1">{t("reviewMigration")}</DialogTitle>
      <DialogContent>
        <Alert icon={false} severity="warning">
          {t("migrationExplain")}
        </Alert>
        <Box my={3}>
          <Box display="flex" justifyContent="space-between">
            <Typography>{t("migrationAmount")}</Typography>
            <Typography>
              {commify(
                formatBNToString(migrationAmount || BigNumber.from("0"), 18, 2),
              )}{" "}
              {lpTokenAddress
                ? tokens?.[lpTokenAddress]?.name
                : null || "LP Token"}
            </Typography>
          </Box>
          {shouldDisplayGas && (
            <Box display="flex" justifyContent="space-between">
              <Typography>{t("gas")}</Typography>
              <Typography>{gasPrice.toString()} GWEI</Typography>
            </Box>
          )}
          {/* TODO: Create a light API to expose the cached BlockNative gas estimates. */}
          {/* {gasValueUSD && (
            <div className="row">
              <Typography component = 'span' className="title">{t("estimatedTxCost")}</Typography>
              <Typography component = 'span' className="value floatRight">
                {`≈$${commify(formatBNToString(gasValueUSD, 2, 2))}`}
              </Typography>
            </div>
          )} */}
          <Box display="flex" justifyContent="space-between">
            <Typography>{t("maxSlippage")}</Typography>
            <Typography>0.5%</Typography>
          </Box>
        </Box>
        <Divider />
        <Typography variant="body2" my={3}>
          {t("estimatedOutput")}
        </Typography>

        <Button
          variant="contained"
          color="secondary"
          size="large"
          fullWidth
          onClick={onConfirm}
        >
          {t("confirmMigrate")}
        </Button>
        <Button color="secondary" size="large" fullWidth onClick={onClose}>
          {t("cancel")}
        </Button>
      </DialogContent>
    </React.Fragment>
  )
}

export default ReviewMigration
