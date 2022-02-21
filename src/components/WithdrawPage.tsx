import "./WithdrawPage.scss"

import { Box, Stack, Typography } from "@mui/material"
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
import RadioButton from "./RadioButton"
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
              <div className="percentage">
                <span>{`${t("withdrawPercentage")} (%):`}</span>
                <input
                  placeholder="0"
                  onChange={(e: React.FormEvent<HTMLInputElement>): void =>
                    onFormChange({
                      fieldName: "percentage",
                      value: e.currentTarget.value,
                    })
                  }
                  onFocus={(e: React.ChangeEvent<HTMLInputElement>): void =>
                    e.target.select()
                  }
                  value={
                    formStateData.percentage ? formStateData.percentage : ""
                  }
                />
                {formStateData.error && (
                  <div className="error">{formStateData.error.message}</div>
                )}
              </div>
              <Stack direction="row" alignItems="center" spacing={1}>
                <RadioButton
                  checked={formStateData.withdrawType === "ALL"}
                  onChange={(): void =>
                    onFormChange({
                      fieldName: "withdrawType",
                      value: "ALL",
                    })
                  }
                  label="Combo"
                />
                {tokensData.map((t) => {
                  return (
                    <RadioButton
                      key={t.symbol}
                      checked={formStateData.withdrawType === t.symbol}
                      onChange={(): void =>
                        onFormChange({
                          fieldName: "withdrawType",
                          value: t.symbol,
                        })
                      }
                      disabled={poolData?.isPaused}
                      label={t.name}
                    />
                  )
                })}
              </Stack>
              <Stack spacing={3}>
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
                  </div>
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
            </div>
            <Box px={[3, 3, 0]} width="100%">
              <AdvancedOptions />
            </Box>
            <Button
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
