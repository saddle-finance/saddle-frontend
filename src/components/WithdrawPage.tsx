import "./WithdrawPage.scss"

import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { PoolDataType, UserShareType } from "../hooks/usePoolData"
import React, { ReactElement, useState } from "react"

import AdvancedOptions from "./AdvancedOptions"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import Button from "./Button"
import ConfirmTransaction from "./ConfirmTransaction"
import Modal from "./Modal"
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
    value: string
    icon: string
  }[]
  rates: {
    name: string
    value: string
    rate: string
  }[]
  slippage: string
  priceImpact: BigNumber
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
    icon: string
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
    <div className="withdraw">
      <div className="content">
        <div className="left">
          <Stack
            direction="column"
            width="434px"
            justifyContent="center"
            spacing={4}
            alignItems="center"
            marginX="auto"
          >
            <div className="form">
              <h3>{t("withdraw")}</h3>
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

              {tokensData.map((token, index) => (
                <div key={index}>
                  <TokenInput
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
                  {index === tokensData.length - 1 ? (
                    ""
                  ) : (
                    <div className="formSpace"></div>
                  )}
                </div>
              ))}
              <div className={"transactionInfoContainer"}>
                <div className="transactionInfo">
                  <div className="transactionInfoItem">
                    {reviewData.priceImpact.gte(0) ? (
                      <span className="bonus">{t("bonus")}: </span>
                    ) : (
                      <span className="slippage">{t("priceImpact")}</span>
                    )}
                    <span
                      className={
                        "value " +
                        (reviewData.priceImpact.gte(0) ? "bonus" : "slippage")
                      }
                    >
                      {formatBNToPercentString(reviewData.priceImpact, 18, 4)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Box px={[3, 3, 0]} width="100%">
              <AdvancedOptions />
            </Box>
            <Button
              data-testid="withdrawBtn"
              disabled={
                noShare ||
                !!formStateData.error ||
                formStateData.lpTokenAmountToSpend.isZero()
              }
              onClick={onSubmit}
            >
              {t("withdraw")}
            </Button>
          </Stack>
        </div>

        <div>
          {poolData && (
            <MyFarm
              lpWalletBalance={myShareData?.lpTokenBalance || Zero}
              poolName={poolData.name}
            />
          )}
          <div className="infoPanels">
            <MyShareCard data={myShareData} />
            <div
              style={{
                display: myShareData ? "block" : "none",
              }}
              className="divider"
            ></div>{" "}
            <PoolInfoCard data={poolData} />
          </div>
        </div>

        <Modal
          isOpen={!!currentModal}
          onClose={(): void => setCurrentModal(null)}
        >
          {currentModal === "review" ? (
            <ReviewWithdraw
              data={reviewData}
              gas={gasPriceSelected}
              onConfirm={async (): Promise<void> => {
                setCurrentModal("confirm")
                logEvent(
                  "withdraw",
                  (poolData && { pool: poolData?.name }) || {},
                )
                await onConfirmTransaction?.()
                setCurrentModal(null)
              }}
              onClose={(): void => setCurrentModal(null)}
            />
          ) : null}
          {currentModal === "confirm" ? <ConfirmTransaction /> : null}
        </Modal>
      </div>
    </div>
  )
}

export default WithdrawPage
