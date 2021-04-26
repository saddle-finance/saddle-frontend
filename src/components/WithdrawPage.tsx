import "./WithdrawPage.scss"

import { Button, Center } from "@chakra-ui/react"
import { PoolDataType, UserShareType } from "../hooks/usePoolData"
import React, { ReactElement, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

import { AppDispatch } from "../state"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import ConfirmTransaction from "./ConfirmTransaction"
import DeadlineField from "./DeadlineField"
import GasField from "./GasField"
import InfiniteApprovalField from "./InfiniteApprovalField"
import Modal from "./Modal"
import MyShareCard from "./MyShareCard"
import NoShareContent from "./NoShareContent"
import { PayloadAction } from "@reduxjs/toolkit"
import PoolInfoCard from "./PoolInfoCard"
import RadioButton from "./RadioButton"
import ReviewWithdraw from "./ReviewWithdraw"
import SlippageField from "./SlippageField"
import TokenInput from "./TokenInput"
import TopMenu from "./TopMenu"
import { WithdrawFormState } from "../hooks/useWithdrawFormState"
import { Zero } from "@ethersproject/constants"
import classNames from "classnames"
import { formatBNToPercentString } from "../utils"
import { logEvent } from "../utils/googleAnalytics"
import { updatePoolAdvancedMode } from "../state/user"
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
  const dispatch = useDispatch<AppDispatch>()
  const { userPoolAdvancedMode: advanced } = useSelector(
    (state: AppState) => state.user,
  )
  const { gasPriceSelected } = useSelector((state: AppState) => state.user)
  const [currentModal, setCurrentModal] = useState<string | null>(null)

  const onSubmit = (): void => {
    setCurrentModal("review")
  }
  const noShare = !myShareData || myShareData.lpTokenBalance.eq(Zero)

  return (
    <div className={"withdraw " + classNames({ noShare: noShare })}>
      <TopMenu activeTab={"withdraw"} />
      {noShare ? (
        <NoShareContent />
      ) : (
        <div className="content">
          <div className="left">
            <div className="form">
              <h3>{t("withdraw")}</h3>
              <div className="percentage">
                <span>{`${t("withdrawPercentage")} (%):`}</span>
                <input
                  placeholder="100"
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
              <div className="horizontalDisplay">
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
                      label={t.name}
                    />
                  )
                })}
              </div>
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
                  />
                  {index === tokensData.length - 1 ? (
                    ""
                  ) : (
                    <div className="divider"></div>
                  )}
                </div>
              ))}
              <div className={classNames("transactionInfoContainer", "show")}>
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
                      {" "}
                      {formatBNToPercentString(reviewData.priceImpact, 18, 4)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="advancedOptions">
              <span
                className="title"
                onClick={(): PayloadAction<boolean> =>
                  dispatch(updatePoolAdvancedMode(!advanced))
                }
              >
                {t("advancedOptions")}
                <svg
                  className={classNames("triangle", { upsideDown: advanced })}
                  width="16"
                  height="10"
                  viewBox="0 0 16 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M14.8252 0C16.077 0 16.3783 0.827943 15.487 1.86207L8.80565 9.61494C8.35999 10.1321 7.63098 10.1246 7.19174 9.61494L0.510262 1.86207C-0.376016 0.833678 -0.0777447 0 1.17205 0L14.8252 0Z"
                    fill="#00f4d7"
                  />
                </svg>
              </span>
              <div className="divider"></div>
              <div
                className={"tableContainer" + classNames({ show: advanced })}
              >
                <div className="parameter">
                  <InfiniteApprovalField />
                </div>
                <div className="parameter">
                  <SlippageField />
                </div>
                <div className="parameter">
                  <DeadlineField />
                </div>
                <div className="parameter">
                  <GasField />
                </div>
              </div>
            </div>
            <Center width="100%" py={6}>
              <Button
                variant="primary"
                size="lg"
                width="240px"
                disabled={
                  !!formStateData.error ||
                  formStateData.lpTokenAmountToSpend.isZero()
                }
                onClick={onSubmit}
              >
                {t("withdraw")}
              </Button>
            </Center>
          </div>
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
      )}
    </div>
  )
}

export default WithdrawPage
