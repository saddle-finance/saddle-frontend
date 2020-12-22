import "./DepositPage.scss"

import {
  GasPrices,
  Slippages,
  updateGasPriceCustom,
  updateGasPriceSelected,
  updatePoolAdvancedMode,
  updateSlippageCustom,
  updateSlippageSelected,
} from "../state/user"
import { PoolDataType, UserShareType } from "../hooks/usePoolData"
import React, { ReactElement, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

import { AppDispatch } from "../state"
import { AppState } from "../state"
import ConfirmTransaction from "./ConfirmTransaction"
import IneligibilityBanner from "./IneligibilityBanner"
import Modal from "./Modal"
import MyShareCard from "./MyShareCard"
import { PayloadAction } from "@reduxjs/toolkit"
import PoolInfoCard from "./PoolInfoCard"
import ReviewDeposit from "./ReviewDeposit"
import TokenInput from "./TokenInput"
import TopMenu from "./TopMenu"
import classNames from "classnames"
import { useTranslation } from "react-i18next"

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  title: string
  infiniteApproval: boolean
  onConfirmTransaction: () => Promise<void>
  onChangeTokenInputValue: (tokenSymbol: string, value: string) => void
  onChangeInfiniteApproval: () => void
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
    sadd: number
    slippage: string
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const DepositPage = (props: Props): ReactElement => {
  const { t } = useTranslation()
  const {
    title,
    tokens,
    poolData,
    transactionInfoData,
    myShareData,
    depositDataFromParent,
    infiniteApproval,
    onChangeTokenInputValue,
    onConfirmTransaction,
    onChangeInfiniteApproval,
  } = props

  const [modalOpen, setModalOpen] = useState(false)
  const [popUp, setPopUp] = useState("")

  const dispatch = useDispatch<AppDispatch>()
  const {
    userPoolAdvancedMode: advanced,
    gasCustom,
    gasPriceSelected,
    slippageCustom,
    slippageSelected,
  } = useSelector((state: AppState) => state.user)
  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )
  // TODO: Add eligibility logic
  const eligible = false

  return (
    <div className="deposit">
      <TopMenu activeTab={"pool"} />
      {!eligible && <IneligibilityBanner />}
      <div className="content">
        <div className="left">
          <div className="form">
            <h3>{`${t("addLiquidity")} ${title}`}</h3>
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
                  <span>{`Saddle LP ${t("tokenValue")}: `}</span>
                  <span className="value">
                    {transactionInfoData.content.lpTokenValue}
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
                className={classNames({ upsideDown: advanced })}
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
              <div className="infiniteApproval">
                <label className="checkbox_input">
                  <input
                    type="checkbox"
                    checked={infiniteApproval}
                    onChange={onChangeInfiniteApproval}
                  />
                  <span className="checkbox_control">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        fill="none"
                        strokeWidth="4"
                        d="M1.73 12.91l6.37 6.37L22.79 4.59"
                      />
                    </svg>
                  </span>
                </label>
                <div className="IAlabel">
                  {t("infiniteApproval")}
                  <span className="tooltipText">
                    Allow Saddle to spend all of your USDC now and in the
                    future. You will not need to approve again.
                  </span>
                  {/* TODO: Replace placeholder text "USDC" to real token name */}
                </div>
              </div>
              <div className="paramater">
                {`${t("maxSlippage")}:`}
                <span
                  className={classNames({
                    selected: slippageSelected === Slippages.OneTenth,
                  })}
                  onClick={(): PayloadAction<Slippages> =>
                    dispatch(updateSlippageSelected(Slippages.OneTenth))
                  }
                >
                  0.1%
                </span>
                <span
                  className={classNames({
                    selected: slippageSelected === Slippages.One,
                  })}
                  onClick={(): PayloadAction<Slippages> =>
                    dispatch(updateSlippageSelected(Slippages.One))
                  }
                >
                  1%
                </span>
                <input
                  value={slippageCustom?.valueRaw}
                  onClick={(): PayloadAction<Slippages> =>
                    dispatch(updateSlippageSelected(Slippages.Custom))
                  }
                  onChange={(e): PayloadAction<string> =>
                    dispatch(updateSlippageCustom(e.target.value))
                  }
                />
                %
              </div>
              <div className="paramater">
                {`${t("gas")}(GWEI):`}
                <span
                  className={classNames({
                    selected: gasPriceSelected === GasPrices.Standard,
                  })}
                  onClick={(): PayloadAction<GasPrices> =>
                    dispatch(updateGasPriceSelected(GasPrices.Standard))
                  }
                >
                  {gasStandard} {t("standard")}
                </span>
                <span
                  className={classNames({
                    selected: gasPriceSelected === GasPrices.Fast,
                  })}
                  onClick={(): PayloadAction<GasPrices> =>
                    dispatch(updateGasPriceSelected(GasPrices.Fast))
                  }
                >
                  {gasFast} {t("fast")}
                </span>
                <span
                  className={classNames({
                    selected: gasPriceSelected === GasPrices.Instant,
                  })}
                  onClick={(): PayloadAction<GasPrices> =>
                    dispatch(updateGasPriceSelected(GasPrices.Instant))
                  }
                >
                  {gasInstant?.toString()} {t("instant")}
                </span>
                <input
                  className={classNames({
                    selected: gasPriceSelected === GasPrices.Custom,
                  })}
                  value={gasCustom?.valueRaw}
                  onClick={(): PayloadAction<GasPrices> =>
                    dispatch(updateGasPriceSelected(GasPrices.Custom))
                  }
                  onChange={(
                    e: React.ChangeEvent<HTMLInputElement>,
                  ): PayloadAction<string> =>
                    dispatch(updateGasPriceCustom(e.target.value))
                  }
                ></input>
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
              gas={gasPriceSelected}
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
