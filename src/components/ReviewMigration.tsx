import {
  Alert,
  Box,
  Button,
  DialogContent,
  Divider,
  Typography,
} from "@mui/material"
import React, { ReactElement } from "react"
import { commify, formatBNToString } from "../utils"

import { AppState } from "../state/index"
import { BigNumber } from "@ethersproject/bignumber"
import DialogTitle from "./DialogTitle"
import { gasBNFromState } from "../utils/gas"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  onClose?: () => void
  onConfirm?: () => void
  migrationAmount?: BigNumber // 1e18
  lpTokenName?: string
}

function ReviewMigration({
  onClose,
  onConfirm,
  migrationAmount,
  lpTokenName,
}: Props): ReactElement {
  const { t } = useTranslation()
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
      <DialogTitle variant="h1" onClose={onClose}>
        {t("reviewMigration")}
      </DialogTitle>
      <DialogContent>
        <Alert variant="filled" icon={false} severity="warning">
          {t("migrationExplain")}
        </Alert>
        <Box my={3}>
          <Box>
            <Box display="flex">
              <Typography component="span">{t("migrationAmount")}</Typography>
              <Typography component="span" ml="auto" mr={0}>
                {commify(
                  formatBNToString(
                    migrationAmount || BigNumber.from("0"),
                    18,
                    2,
                  ),
                )}{" "}
                {lpTokenName}
              </Typography>
            </Box>
            {shouldDisplayGas && (
              <Box display="flex">
                <Typography component="span">{t("gas")}</Typography>
                <Typography component="span" ml="auto" mr={0}>
                  {gasPrice.toString()} GWEI
                </Typography>
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
            <Box display="flex">
              <Typography component="span">{t("maxSlippage")}</Typography>
              <Typography component="span" ml="auto" mr={0}>
                0.5%
              </Typography>
            </Box>
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
