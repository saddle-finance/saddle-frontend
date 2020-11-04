import "./DepositPage.scss"

import {
  GasPrices,
  updateCustomGasPrice,
  updateSelectedGasPrice,
} from "../state/user"
import React, { ReactElement, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

import { AppDispatch } from "../state"
import { AppState } from "../state"
import ConfirmTransaction from "./ConfirmTransaction"
import Modal from "./Modal"
import MyShareCard from "./MyShareCard"
import { PayloadAction } from "@reduxjs/toolkit"
import PoolInfoCard from "./PoolInfoCard"
import ReviewDeposit from "./ReviewDeposit"
import TokenInput from "./TokenInput"
import TopMenu from "./TopMenu"
import classNames from "classnames"
import { updatePoolAdvancedMode } from "../state/user"
import { useTranslation } from "react-i18next"

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  title: string
  tokens: Array<{ name: string; icon: string; max: number }>
  selected: { [key: string]: any }
  poolData: {
    name: string
    fee: number
    adminFee: number
    virtualPrice: number
    utilization: number
    volume: number
    reserve: number
    tokens: Array<{
      name: string
      icon: string
      percent: number
      value: number
    }>
  }
  myShareData?: {
    name: string
    share: number
    value: number
    USDbalance: number
    aveBalance: number
    token: Array<{ name: string; value: number }>
  }
  transactionInfoData: {
    isInfo: boolean
    content: { [key: string]: any }
  }
  depositDataFromParent: {
    deposit: Array<{ [key: string]: any }>
    rates: Array<{ [key: string]: any }>
    share: number
    sadd: number
    slippage: number
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const DepositPage = (props: Props): ReactElement => {
  const { t } = useTranslation()
  const {
    title,
    selected,
    tokens,
    poolData,
    transactionInfoData,
    myShareData,
    depositDataFromParent,
  } = props

  const [modalOpen, setModalOpen] = useState(false)
  const [infiniteApproval, setInfiniteApproval] = useState(false)
  const [popUp, setPopUp] = useState("")

  const dispatch = useDispatch<AppDispatch>()
  const {
    userPoolAdvancedMode: advanced,
    gasCustom,
    selectedGasPrice,
  } = useSelector((state: AppState) => state.user)
  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )

  return (
    <div className="deposit">
      <TopMenu activeTab={"pool"} />
      <div className="content">
        <div className="left">
          <div className="form">
            <h3>{`${t("addLiquidity")} ${title}`}</h3>
            {tokens.map((token, index) => (
              <div key={index}>
                <TokenInput token={token} />
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
                    onChange={(): void =>
                      setInfiniteApproval(!infiniteApproval)
                    }
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
                        stroke="#00f4d7"
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
                  {/* Replace placeholder text "USDC" to real token name */}
                </div>
              </div>
              <div className="paramater">
                {`${t("maxSlippage")}:`}
                <span
                  className={classNames({
                    selected: selected.maxSlippage === 0.1,
                  })}
                >
                  0.1%
                </span>
                <span
                  className={classNames({
                    selected: selected.maxSlippage === 1,
                  })}
                >
                  1%
                </span>
                <input type="number" />%
              </div>
              <div className="paramater">
                {`${t("gas")}(GWEI):`}
                <span
                  className={classNames({
                    selected: selectedGasPrice === GasPrices.Standard,
                  })}
                  onClick={(): PayloadAction<GasPrices> =>
                    dispatch(updateSelectedGasPrice(GasPrices.Standard))
                  }
                >
                  {gasStandard} {t("standard")}
                </span>
                <span
                  className={classNames({
                    selected: selectedGasPrice === GasPrices.Fast,
                  })}
                  onClick={(): PayloadAction<GasPrices> =>
                    dispatch(updateSelectedGasPrice(GasPrices.Fast))
                  }
                >
                  {gasFast} {t("fast")}
                </span>
                <span
                  className={classNames({
                    selected: selectedGasPrice === GasPrices.Instant,
                  })}
                  onClick={(): PayloadAction<GasPrices> =>
                    dispatch(updateSelectedGasPrice(GasPrices.Instant))
                  }
                >
                  {gasInstant} {t("instant")}
                </span>
                <input
                  type="number"
                  className={classNames({
                    selected: selectedGasPrice === GasPrices.Custom,
                  })}
                  defaultValue={gasCustom}
                  onClick={(): PayloadAction<GasPrices> =>
                    dispatch(updateSelectedGasPrice(GasPrices.Custom))
                  }
                  onChange={(
                    e: React.ChangeEvent<HTMLInputElement>,
                  ): PayloadAction<number> =>
                    dispatch(updateCustomGasPrice(Number(e.target.value)))
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
              gas={selectedGasPrice}
              onConfirm={(): void => setPopUp("confirm")}
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
