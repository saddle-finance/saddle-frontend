import "./DepositPage.scss"

import { PoolDataType, UserShareType } from "../hooks/usePoolData"
import React, { ReactElement, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

import { AppDispatch } from "../state"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import ConfirmTransaction from "./ConfirmTransaction"
import GasField from "./GasField"
import { HistoricalPoolDataType } from "../hooks/useHistoricalPoolData"
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
import { formatUnits } from "@ethersproject/units"
import { logEvent } from "../utils/googleAnalytics"
import { updatePoolAdvancedMode } from "../state/user"
import { useTranslation } from "react-i18next"

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  title: string
  infiniteApproval: boolean
  willExceedMaxDeposits: boolean
  isAcceptingDeposits: boolean
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
  historicalPoolData: HistoricalPoolDataType | null
  myShareData: UserShareType | null
  transactionInfoData: {
    bonus: BigNumber
  }
  depositDataFromParent: {
    deposit: Array<{ [key: string]: any }>
    rates: Array<{ [key: string]: any }>
    shareOfPool: string
    lpToken: string
  }
  hasValidMerkleState: boolean
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const DepositPage = (props: Props): ReactElement => {
  const { t } = useTranslation()
  const {
    tokens,
    poolData,
    historicalPoolData,
    transactionInfoData,
    myShareData,
    depositDataFromParent,
    willExceedMaxDeposits,
    isAcceptingDeposits,
    onChangeTokenInputValue,
    onConfirmTransaction,
    hasValidMerkleState,
  } = props

  const [currentModal, setCurrentModal] = useState<string | null>(null)

  const dispatch = useDispatch<AppDispatch>()
  const { userPoolAdvancedMode: advanced } = useSelector(
    (state: AppState) => state.user,
  )
  let errorMessage = null
  if (!isAcceptingDeposits) {
    errorMessage = t("poolIsNotAcceptingDeposits")
  } else if (willExceedMaxDeposits) {
    errorMessage = t("depositLimitExceeded")
  }
  const validDepositAmount = +depositDataFromParent.lpToken > 0

  return (
    <div className="deposit">
      <TopMenu activeTab={"deposit"} />
      {!hasValidMerkleState && <IneligibilityBanner />}

      <div className="content">
        <div className="left">
          <div className="form">
            <h3>{t("addLiquidity")}</h3>
            {errorMessage && (
              <div className="error">
                {errorMessage}{" "}
                <a
                  href="https://docs.saddle.finance/faq#what-is-saddles-guarded-launch-proof-of-governance-who-can-participate"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("learnMore")}
                </a>
              </div>
            )}
            {tokens.map((token, index) => (
              <div key={index}>
                <TokenInput
                  {...token}
                  disabled={!isAcceptingDeposits || !hasValidMerkleState}
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
            <div className={classNames("transactionInfoContainer", "show")}>
              <div className="transactionInfo">
                {poolData?.keepApr && (
                  <div className="transactionInfoItem">
                    <a
                      href="https://docs.saddle.finance/faq#what-are-saddles-liquidity-provider-rewards"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>{`KEEP APR:`}</span>
                    </a>{" "}
                    <span className="value">
                      {parseFloat(
                        formatUnits(poolData.keepApr, 18 - 2),
                      ).toFixed(2)}
                      %
                    </span>
                  </div>
                )}
                <div className="transactionInfoItem">
                  {transactionInfoData.bonus.gte(0) ? (
                    <span className="bonus">{`${t("bonus")}: `}</span>
                  ) : (
                    <span className="slippage">{t("maxSlippage")}</span>
                  )}
                  <span
                    className={
                      "value " +
                      (transactionInfoData.bonus.gte(0) ? "bonus" : "slippage")
                    }
                  >
                    {" "}
                    {parseFloat(
                      formatUnits(transactionInfoData.bonus, 18),
                    ).toFixed(4)}
                    %
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
              setCurrentModal("review")
            }}
            disabled={
              !hasValidMerkleState ||
              willExceedMaxDeposits ||
              !isAcceptingDeposits ||
              !validDepositAmount
            }
          >
            {t("deposit")}
          </button>
        </div>
        <div className="infoPanels">
          <MyShareCard
            data={myShareData}
            historicalPoolData={historicalPoolData}
          />
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
            <ReviewDeposit
              data={depositDataFromParent}
              onConfirm={async (): Promise<void> => {
                setCurrentModal("confirm")
                logEvent(
                  "deposit",
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

export default DepositPage
