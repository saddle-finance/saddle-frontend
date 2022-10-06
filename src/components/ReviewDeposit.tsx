import {
  Box,
  Button,
  DialogContent,
  Divider,
  Typography,
  styled,
} from "@mui/material"
import React, { ReactElement, useState } from "react"
import {
  commify,
  formatBNToPercentString,
  formatBNToString,
  formatDeadlineToNumber,
} from "../utils"

import { AppState } from "../state/index"
import { DepositBasicTransaction } from "../interfaces/transactions"
import DialogTitle from "./DialogTitle"
import HighPriceImpactConfirmation from "./HighPriceImpactConfirmation"
import TokenIcon from "./TokenIcon"
import { Zero } from "@ethersproject/constants"
import { formatGasToString } from "../utils/gas"
import { formatSlippageToString } from "../utils/slippage"
import { isHighPriceImpact } from "../utils/priceImpact"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  onClose: () => void
  onConfirm: () => void
  transactionData: DepositBasicTransaction | null
}

const DepositInfoItem = styled(Box)(({ theme }) => ({
  display: "flex",
  minWidth: "100%",
  marginBottom: theme.spacing(2),
  "& div:first-of-type": {
    display: "flex",
    gap: theme.spacing(1),
  },
  "& :last-child": {
    marginLeft: "auto",
    marginRight: 0,
  },
}))
function ReviewDeposit({
  onClose,
  onConfirm,
  transactionData,
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
  const isHighPriceImpactTxn = isHighPriceImpact(
    transactionData?.priceImpact ?? Zero,
  )
  const deadline = formatDeadlineToNumber(
    transactionDeadlineSelected,
    transactionDeadlineCustom,
  )
  const shouldDisplayGas = !!gasStandard

  return (
    <React.Fragment>
      <DialogTitle variant="h1">{t("reviewDeposit")}</DialogTitle>
      <DialogContent>
        <Box>
          <Typography variant="subtitle1" my={2}>
            {t("depositing")}
          </Typography>
          <Box>
            {transactionData?.from.items.map(({ token, amount }) => (
              <DepositInfoItem key={token?.name}>
                <div>
                  <TokenIcon
                    symbol={token?.symbol ?? ""}
                    width={24}
                    height={24}
                    alt="icon"
                  />
                  <Typography ml={1}>{token?.symbol}</Typography>
                </div>
                <Typography>
                  {commify(formatBNToString(amount, token?.decimals ?? 0))}
                </Typography>
              </DepositInfoItem>
            ))}
            <DepositInfoItem>
              <Typography variant="subtitle1">{t("total")}</Typography>
              <Typography variant="subtitle1">
                {commify(
                  formatBNToString(
                    transactionData?.from.totalAmount ?? Zero,
                    18,
                  ),
                )}
              </Typography>
            </DepositInfoItem>
          </Box>
          <Divider />
          <Typography variant="h3" my={2}>
            {t("receiving")}
          </Typography>
          <DepositInfoItem>
            <div>
              <TokenIcon
                symbol={transactionData?.to.item.token?.symbol ?? ""}
                width={24}
                height={24}
                alt="icon"
              />
              <Typography ml={1}>
                {transactionData?.to.item.token?.symbol ?? ""}
              </Typography>
            </div>
            <Typography>
              {commify(
                formatBNToString(
                  transactionData?.to.item.amount ?? Zero,
                  transactionData?.to.item.token?.decimals ?? 0,
                ),
              )}
            </Typography>
          </DepositInfoItem>
          <Divider />
          <DepositInfoItem mt={2}>
            <Typography>{t("shareOfPool")}</Typography>
            <Typography>
              {formatBNToPercentString(
                transactionData?.shareOfPool ?? Zero,
                18,
              )}
            </Typography>
          </DepositInfoItem>
          {shouldDisplayGas && (
            <DepositInfoItem>
              <Typography>{t("gas")}</Typography>
              <Typography>
                {formatGasToString(
                  { gasStandard, gasFast, gasInstant },
                  gasPriceSelected,
                  gasCustom,
                )}{" "}
                GWEI
              </Typography>
            </DepositInfoItem>
          )}
          {/* TODO: Create a light API to expose the cached BlockNative gas estimates. */}
          {/* {transactionData.txnGasCost?.valueUSD && (
          <div className="depositInfoItem">
            <span className="label">{t("estimatedTxCost")}</span>
            <span className="value">
              {`≈$${commify(
                formatBNToString(transactionData.txnGasCost.valueUSD, 2, 2),
              )}`}
            </span>
          </div>
        )} */}
          <DepositInfoItem>
            <Typography>{t("maxSlippage")}</Typography>
            <Typography>
              {formatSlippageToString(slippageSelected, slippageCustom)}%
            </Typography>
          </DepositInfoItem>
          <DepositInfoItem>
            <Typography>{t("deadline")}</Typography>
            <Typography>
              {deadline} {t("minutes")}
            </Typography>
          </DepositInfoItem>
          <Box>
            <Typography mr={2}>{t("rates")}</Typography>

            <Box ml="auto" mr={0} width="fit-content">
              {transactionData?.from.items.map(
                ({ token, singleTokenPriceUSD }) => (
                  <Typography key={token?.symbol}>
                    1 {token?.symbol} = $
                    {commify(formatBNToString(singleTokenPriceUSD, 18, 2))}
                  </Typography>
                ),
              )}
              {[transactionData?.to.item].map((item) => (
                <Typography key={item?.token?.address}>
                  1 {item?.token?.symbol} = $
                  {commify(
                    formatBNToString(item?.singleTokenPriceUSD ?? Zero, 18, 2),
                  )}
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>
        {isHighPriceImpactTxn && (
          <HighPriceImpactConfirmation
            checked={hasConfirmedHighPriceImpact}
            onCheck={(): void =>
              setHasConfirmedHighPriceImpact((prevState) => !prevState)
            }
          />
        )}
        <Typography my={3}>{t("estimatedOutput")}</Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={onConfirm}
          disabled={isHighPriceImpactTxn && !hasConfirmedHighPriceImpact}
        >
          {t("confirmDeposit")}
        </Button>
        <Button size="large" fullWidth onClick={onClose} sx={{ mt: 1 }}>
          {t("cancel")}
        </Button>
      </DialogContent>
    </React.Fragment>
  )
}

export default ReviewDeposit
