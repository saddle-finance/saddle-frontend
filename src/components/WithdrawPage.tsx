import "./WithdrawPage.scss"

import { PoolDataType, UserShareType } from "../hooks/usePoolData"
import React, { ReactElement, useState } from "react"

import { AppState } from "../state"
import { BigNumber } from "ethers"
import ConfirmTransaction from "./ConfirmTransaction"
import GasField from "./GasField"
import InfiniteApprovalField from "./InfiniteApprovalField"
import Modal from "./Modal"
import MyShareCard from "./MyShareCard"
import NoShareContent from "./NoShareContent"
import PoolInfoCard from "./PoolInfoCard"
import RadioButton from "./RadioButton"
import ReviewWithdraw from "./ReviewWithdraw"
import SlippageField from "./SlippageField"
import TokenInput from "./TokenInput"
import TopMenu from "./TopMenu"
import { WithdrawFormState } from "../hooks/useWithdrawFormState"
import classNames from "classnames"
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
}

const testWithdrawData = {
  share: 0.000024,
  keepToken: 0.325496, // TODO: Calculate or pull from contract to get real value
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
  transactionInfoData: {
    isInfo: boolean
    content: { [key: string]: any }
  }
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
    transactionInfoData,
    myShareData,
    onFormChange,
    formStateData,
    reviewData,
    onConfirmTransaction,
  } = props

  const [modalOpen, setModalOpen] = useState(false)
  const [popUp, setPopUp] = useState("")

  const { gasPriceSelected } = useSelector((state: AppState) => state.user)

  const onSubmit = (): void => {
    setModalOpen(true)
    setPopUp("review")
  }
 
  const noShare =
    !myShareData || myShareData.lpTokenBalance.eq(BigNumber.from(0))

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
              <div
                className={
                  "transactionInfoContainer " +
                  classNames({ show: transactionInfoData.isInfo })
                }
              >
                <div className="transactionInfo">
                  <div className="transactionInfoItem">
                    {transactionInfoData.content.benefit > 0 ? (
                      <span className="bonus">{t("bonus")}: </span>
                    ) : (
                      <span className="slippage">{t("maxSlippage")}</span>
                    )}
                    <span
                      className={
                        "value " +
                        (transactionInfoData.content.benefit > 0
                          ? "bonus"
                          : "slippage")
                      }
                    >
                      {transactionInfoData.content.benefit}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="advancedOptions">
              <div className="paramater">
                <GasField />
              </div>
              <div className="paramater">
                <SlippageField />
              </div>
              <div className="paramater">
                <InfiniteApprovalField />
              </div>
            </div>
            <button
              className="actionBtn"
              type="submit"
              disabled={
                !!formStateData.error ||
                formStateData.lpTokenAmountToSpend.isZero()
              }
              onClick={(): void => {
                onSubmit()
              }}
            >
              {t("withdraw")}
            </button>
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
          <Modal isOpen={modalOpen} onClose={(): void => setModalOpen(false)}>
            {popUp === "review" ? (
              <ReviewWithdraw
                data={{ ...testWithdrawData, ...reviewData }}
                gas={gasPriceSelected}
                onConfirm={(): void => {
                  onConfirmTransaction()
                  setPopUp("confirm")
                  logEvent(
                    "withdraw",
                    (poolData && { pool: poolData?.name }) || {},
                  )
                }}
                onClose={(): void => setModalOpen(false)}
              />
            ) : null}
            {popUp === "confirm" ? <ConfirmTransaction /> : null}
          </Modal>
        </div>
      )}
    </div>
  )
}

export default WithdrawPage
