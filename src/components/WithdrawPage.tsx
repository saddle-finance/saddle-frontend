import {
  Box,
  Button,
  Checkbox,
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
import {
  WithdrawFormAction,
  WithdrawFormState,
} from "../hooks/useWithdrawFormState"
import { formatBNToPercentString, isNumberOrEmpty } from "../utils"

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
import { Zero } from "@ethersproject/constants"
import { logEvent } from "../utils/googleAnalytics"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

export interface ReviewWithdrawData {
  withdraw: {
    address: string
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
    isOnTokenLists: boolean
    symbol: string
    address: string
    name: string
    decimals: number
    priceUSD: number
    inputValue: string
  }>
  reviewData: ReviewWithdrawData
  poolData: PoolDataType | null
  myShareData: UserShareType | null
  formStateData: WithdrawFormState
  onFormChange: (action: WithdrawFormAction) => void
  onConfirmTransaction: () => Promise<void>
  shouldWithdrawWrapped: boolean
  onToggleWithdrawWrapped?: () => void
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const WithdrawPage = (props: Props): ReactElement | null => {
  const { t } = useTranslation()
  const {
    tokensData,
    poolData,
    myShareData,
    onFormChange,
    formStateData,
    reviewData,
    onConfirmTransaction,
    shouldWithdrawWrapped,
    onToggleWithdrawWrapped,
  } = props

  const { gasPriceSelected } = useSelector((state: AppState) => state.user)
  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const theme = useTheme()
  const isLgDown = useMediaQuery(theme.breakpoints.down("lg"))
  const shouldDisplayWrappedOption = poolData?.isMetaSwap

  const onSubmit = (): void => {
    setCurrentModal("review")
  }
  const handleWithdrawTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onFormChange({
      fieldName: "withdrawType",
      value: event.target.value,
    })
  }
  const noShare = !myShareData || myShareData.lpTokenBalance.eq(Zero)

  return !poolData ? null : (
    <Container maxWidth={isLgDown ? "sm" : "lg"} sx={{ py: 5 }}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={4}
        alignItems={{ xs: "center", lg: "flex-start" }}
      >
        <Box flex={1} justifyContent="center" alignItems="center">
          <Paper>
            <Box p={4}>
              <Typography variant="h1" marginBottom={3}>
                {t("withdraw")}
              </Typography>
              <Box display="flex">
                <Box>
                  <Typography variant="body1" noWrap mr={1}>{`${t(
                    "withdrawPercentage",
                  )} (%):`}</Typography>
                </Box>
                <TextField
                  placeholder="0.0"
                  size="small"
                  data-testid="withdrawPercentageInput"
                  onChange={(e): void => {
                    if (isNumberOrEmpty(e.target.value))
                      onFormChange({
                        fieldName: "percentage",
                        value: e.currentTarget.value.trim(),
                      })
                  }}
                  value={
                    formStateData.percentage ? formStateData.percentage : ""
                  }
                />
              </Box>
              <Box textAlign="end" minHeight="24px">
                <Typography color="error">
                  {formStateData.error?.message || ""}
                </Typography>
              </Box>
              <RadioGroup
                row
                value={formStateData.withdrawType}
                onChange={handleWithdrawTypeChange}
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
                      key={t.address}
                      control={<Radio />}
                      value={t.address}
                      // disabled={poolData?.isPaused}
                      label={t.symbol}
                      data-testid="withdrawTokenRadio"
                    />
                  )
                })}
              </RadioGroup>
              <Stack spacing={3}>
                {tokensData.map(
                  (
                    {
                      isOnTokenLists,
                      decimals,
                      symbol,
                      name,
                      priceUSD,
                      inputValue,
                      address,
                    },
                    index,
                  ) => (
                    <TokenInput
                      key={index}
                      token={{
                        isOnTokenLists,
                        address,
                        decimals,
                        symbol,
                        name,
                        priceUSD,
                      }}
                      inputValue={inputValue}
                      onChange={(value): void =>
                        onFormChange({
                          fieldName: "tokenInputs",
                          value: value,
                          address,
                        })
                      }
                    />
                  ),
                )}
              </Stack>
              <Box
                sx={{
                  display: shouldDisplayWrappedOption ? "block" : "none",
                  mt: 2,
                }}
              >
                <Checkbox
                  onChange={onToggleWithdrawWrapped}
                  checked={shouldWithdrawWrapped}
                  data-testid="withdraw-wrapped-checkbox"
                />
                <Typography component="span" variant="body1">
                  {t("withdrawWrapped")}
                </Typography>
              </Box>
              <Box mt={3}>
                {reviewData.priceImpact.gte(0) ? (
                  <Typography component="span" color="primary" marginRight={1}>
                    {t("bonus")}:
                  </Typography>
                ) : (
                  <Typography
                    component="span"
                    color="error"
                    whiteSpace="nowrap"
                    marginRight={1}
                  >
                    {t("priceImpact")}:
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
        <Stack direction="column" flex={1} spacing={4}>
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
            onConfirm={() => {
              setCurrentModal("confirm")
              logEvent("withdraw", (poolData && { pool: poolData?.name }) || {})
              void onConfirmTransaction?.()
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
