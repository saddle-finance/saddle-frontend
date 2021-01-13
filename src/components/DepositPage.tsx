import "./DepositPage.scss"

import { PoolDataType, UserShareType } from "../hooks/usePoolData"
import React, { ReactElement, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

import { AppDispatch } from "../state"
import { AppState } from "../state"
import ConfirmTransaction from "./ConfirmTransaction"
import GasField from "./GasField"
import IneligibilityBanner from "./IneligibilityBanner"
import InfiniteApprovalField from "./InfiniteApprovalField"
import Modal from "./Modal"
import MyShareCard from "./MyShareCard"
import { PayloadAction } from "@reduxjs/toolkit"
import PoolInfoCard from "./PoolInfoCard"
import ReviewDeposit from "./ReviewDeposit"
import SlippageField from "./SlippageField"
import TokenInput from "./TokenInput"
import TopMenu from "./TopMenu"
import classNames from "classnames"
import { updatePoolAdvancedMode } from "../state/user"
import { useTranslation } from "react-i18next"

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  title: string
  onConfirmTransaction: () => Promise<void>
  onChangeTokenInputValue: (tokenSymbol: string, value: string) => void
  tokens: Array<{
    symbol: string
    name: string
    icon: string
    max: string
    inputValue: string
  }>
  selected?: { [key: string]: any }
  poolData: PoolDataType | null
  myShareData: UserShareType | null
  transactionInfoData: {
    isInfo: boolean
    content: { [key: string]: any }
  }
  depositDataFromParent: {
    deposit: Array<{ [key: string]: any }>
    rates: Array<{ [key: string]: any }>
    share: number
    lpToken: number // TODO: Calculate or pull from contract to get real value
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const DepositPage = (props: Props): ReactElement => {
  const { t } = useTranslation()
  const {
    tokens,
    poolData,
    transactionInfoData,
    myShareData,
    depositDataFromParent,
    onChangeTokenInputValue,
    onConfirmTransaction,
  } = props

  const [modalOpen, setModalOpen] = useState(false)
  const [popUp, setPopUp] = useState("")

  const dispatch = useDispatch<AppDispatch>()
  const { userPoolAdvancedMode: advanced } = useSelector(
    (state: AppState) => state.user,
  )
  // TODO: Add eligibility logic
  const eligible = true

  return (
    <div className="deposit">
      <TopMenu activeTab={"deposit"} />
      {!eligible && <IneligibilityBanner />}

      <div className="content">
        <div className="left">
          <div className="form">
            <h3>{t("addLiquidity")}</h3>
            {tokens.map((token, index) => (
              <div key={index}>
                <TokenInput
                  {...token}
                  disabled={!eligible}
                  onChange={(value): void =>
                    onChangeTokenInputValue(token.symbol, value)
                  }
                />
                {index === tokens.length - 1 ? (
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
                  <span>{`KEEP ROI ${t("tokenValue")}: `}</span>
                  <span className="value">
                    {transactionInfoData.content.keepTokenValue}
                  </span>
                </div>
                <div className="transactionInfoItem">
                  {transactionInfoData.content.benefit > 0 ? (
                    <span className="bonus">{`${t("bonus")}: `}</span>
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
            <div className={"tableContainer" + classNames({ show: advanced })}>
              <div className="parameter">
                <GasField />
              </div>
              <div className="parameter">
                <SlippageField />
              </div>
              <div className="parameter">
                <InfiniteApprovalField />
              </div>
            </div>
          </div>
          <button
            className="actionBtn"
            onClick={(): void => {
              setModalOpen(true)
              setPopUp("review")
            }}
            disabled={!eligible}
          >
            {t("deposit")}
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
            <ReviewDeposit
              data={depositDataFromParent}
              onConfirm={(): void => {
                setPopUp("confirm")
                onConfirmTransaction?.().finally(() => setModalOpen(false))
              }}
              onClose={(): void => setModalOpen(false)}
            />
          ) : null}
          {popUp === "confirm" ? <ConfirmTransaction /> : null}
        </Modal>
      </div>
    </div>
  )
}

export default DepositPage
