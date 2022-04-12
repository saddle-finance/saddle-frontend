import {
  Box,
  Button,
  Container,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { PoolDataType, UserShareType } from "../hooks/usePoolData"
import React, { ReactElement, useState } from "react"

import AdvancedOptions from "./AdvancedOptions"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import ConfirmTransaction from "./ConfirmTransaction"
import Dialog from "./Dialog"
import MyFarm from "./MyFarm"
import MyShareCard from "./MyShareCard"
import PoolInfoCard from "./PoolInfoCard"
import ReviewWithdraw from "./ReviewWithdraw"
import TokenInput from "./TokenInput"
import { WithdrawFormState } from "../hooks/useWithdrawFormState"
import { Zero } from "@ethersproject/constants"
import { formatBNToPercentString } from "../utils"
import { logEvent } from "../utils/googleAnalytics"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

export interface ReviewWithdrawData {
  withdraw: {
    name: string
    symbol: string
    value: string
  }[]
  rates: {
    name: string
    value: string
    rate: string
  }[]
  slippage: string
  priceImpact: BigNumber
  totalAmount?: string
  withdrawLPTokenAmount: BigNumber
  txnGasCost: {
    amount: BigNumber
    valueUSD: BigNumber | null // amount * ethPriceUSD
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  title: string
  tokensData: Array<{
    symbol: string
    name: string
    inputValue: string
  }>
  reviewData: ReviewWithdrawData
  selected?: { [key: string]: any }
  poolData: PoolDataType | null
  myShareData: UserShareType | null
  formStateData: WithdrawFormState
  onFormChange: (action: any) => void
  onConfirmTransaction: () => Promise<void>
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const WithdrawPage = (props: Props): ReactElement => {
  const { t } = useTranslation()
  const {
    tokensData,
    poolData,
    myShareData,
    onFormChange,
    formStateData,
    reviewData,
    onConfirmTransaction,
  } = props

  const { gasPriceSelected } = useSelector((state: AppState) => state.user)
  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const theme = useTheme()
  const isLgDown = useMediaQuery(theme.breakpoints.down("lg"))

  const onSubmit = (): void => {
    setCurrentModal("review")
  }
  const handleWithdrawChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFormChange({
      fieldName: "withdrawType",
      value: event.target.value,
    })
  }
  const noShare = !myShareData || myShareData.lpTokenBalance.eq(Zero)

  return (
    <Container maxWidth={isLgDown ? "sm" : "lg"} sx={{ py: 5 }}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={4}
        alignItems={{ xs: "center", lg: "flex-start" }}
      >
        <Box
          flex={1}
          justifyContent="center"
          alignItems="center"
          marginX="auto"
        >
          <Paper>
            <Box p={4}>
              <Typography variant="h1" marginBottom={3}>
                {t("withdraw")}
              </Typography>
              <Box display="flex">
                <Box>
                  <Typography variant="body1" noWrap>{`${t(
                    "withdrawPercentage",
                  )} (%):`}</Typography>
                </Box>
                <TextField
                  placeholder="0"
                  size="small"
                  data-testid="withdrawPercentageInput"
                  onChange={(e): void =>
                    onFormChange({
                      fieldName: "percentage",
                      value: e.currentTarget.value,
                    })
                  }
                  value={
                    formStateData.percentage ? formStateData.percentage : ""
                  }
                />
              </Box>
              <Box textAlign="end" width="100%" minHeight="24px">
                <Typography color="error">
                  {formStateData.error?.message || ""}
                </Typography>
              </Box>
              <RadioGroup
                row
                value={formStateData.withdrawType}
                onChange={handleWithdrawChange}
                sx={{ mb: 2 }}
              >
                <FormControlLabel
                  value="ALL"
                  control={<Radio />}
                  label="Combo"
                  data-testid="withdrawPercentageCombo"
                />
                {tokensData.map((t) => {
                  return (
                    <FormControlLabel
                      key={t.symbol}
                      control={<Radio />}
                      value={t.symbol}
                      disabled={poolData?.isPaused}
                      label={t.name}
                      data-testid="withdrawTokenRadio"
                    />
                  )
                })}
              </RadioGroup>
              <Stack spacing={3}>
                {tokensData.map((token, index) => (
                  <TokenInput
                    key={`tokenInput-${index}`}
                    {...token}
                    // inputValue={parseFloat(token.inputValue).toFixed(5)}
                    onChange={(value): void =>
                      onFormChange({
                        fieldName: "tokenInputs",
                        value: value,
                        tokenSymbol: token.symbol,
                      })
                    }
                    disabled={poolData?.isPaused}
                  />
                ))}
              </Stack>
              <Box mt={3}>
                {reviewData.priceImpact.gte(0) ? (
                  <Typography component="span" color="primary">
                    {t("bonus")}:{" "}
                  </Typography>
                ) : (
                  <Typography
                    component="span"
                    color="error"
                    whiteSpace="nowrap"
                  >
                    {t("priceImpact")}
                  </Typography>
                )}
                <Typography
                  component="span"
                  color={reviewData.priceImpact.gte(0) ? "primary" : "error"}
                >
                  {formatBNToPercentString(reviewData.priceImpact, 18, 4)}
                </Typography>
              </Box>
            </Box>
          </Paper>
          <AdvancedOptions />
          <Button
            variant="contained"
            size="large"
            fullWidth
            data-testid="withdrawBtn"
            disabled={
              noShare ||
              !!formStateData.error ||
              formStateData.lpTokenAmountToSpend.isZero()
            }
            onClick={onSubmit}
            sx={{ mt: 4 }}
          >
            {t("withdraw")}
          </Button>
        </Box>
        <Stack direction="column" flex={1} spacing={4} width="100%">
          {poolData && (
            <MyFarm
              lpWalletBalance={myShareData?.lpTokenBalance || Zero}
              poolName={poolData.name}
            />
          )}
          <Paper>
            <Box p={4}>
              <MyShareCard data={myShareData} />
              <PoolInfoCard data={poolData} />
            </Box>
          </Paper>
        </Stack>
      </Stack>

      <Dialog
        open={!!currentModal}
        maxWidth="xs"
        fullWidth
        onClose={(): void => setCurrentModal(null)}
        scroll="body"
        hideClose={currentModal === "confirm"}
      >
        {currentModal === "review" ? (
          <ReviewWithdraw
            data={reviewData}
            gas={gasPriceSelected}
            onConfirm={async (): Promise<void> => {
              setCurrentModal("confirm")
              logEvent("withdraw", (poolData && { pool: poolData?.name }) || {})
              await onConfirmTransaction?.()
              setCurrentModal(null)
            }}
            onClose={(): void => setCurrentModal(null)}
          />
        ) : null}
        {currentModal === "confirm" ? <ConfirmTransaction /> : null}
      </Dialog>
    </Container>
  )
}

export default WithdrawPage
