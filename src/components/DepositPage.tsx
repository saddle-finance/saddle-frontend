import "./DepositPage.scss"

import {
  GasPrices,
  updateCustomGasPrice,
  updateSelectedGasPrice,
} from "../state/application"
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
import { updateUserPoolAdvancedMode } from "../state/user"

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  title: string
  tokensData: Array<{ name: string; icon: string; max: number }>
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
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const DepositPage = (props: Props): ReactElement => {
  const {
    title,
    selected,
    tokensData,
    poolData,
    transactionInfoData,
    myShareData,
    depositDataFromParent,
  } = props

  const [modalOpen, setModalOpen] = useState(false)
  const [infiniteApproval, setInfiniteApproval] = useState(false)
  const [popUp, setPopUp] = useState("")

  const dispatch = useDispatch<AppDispatch>()
  const { userPoolAdvancedMode: advanced } = useSelector(
    (state: AppState) => state.user,
  )
  const {
    gasStandard,
    gasFast,
    gasInstant,
    gasCustom,
    selectedGasPrice,
  } = useSelector((state: AppState) => state.application)

  return (
    <div className="deposit">
      <TopMenu activeTab={"pool"} />
      <div className="content">
        <div className="form">
          <h3>Add Liquidity in {title}</h3>
          {tokensData.map((token, index) => (
            <div key={index}>
              <TokenInput token={token} />
              <div style={{ height: "24px" }}></div> {/* space divider */}
            </div>
          ))}
          <div className="advancedOptions">
            <span
              className="title"
              onClick={(): PayloadAction<boolean> =>
                dispatch(updateUserPoolAdvancedMode(!advanced))
              }
            >
              Advanced Options
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
                  fill="#EA860B"
                />
              </svg>
            </span>
            {/* When advanced = true, divider will be shown */}
            <div className={"divider " + classNames({ show: advanced })}></div>
            <div className={"tableContainer" + classNames({ show: advanced })}>
              <div className="infiniteApproval">
                <input
                  type="checkbox"
                  checked={infiniteApproval}
                  onChange={(): void => setInfiniteApproval(!infiniteApproval)}
                />
                <span>Infinite Approval</span>
              </div>
              <div className="paramater">
                Max Slippage:
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
                Gas:
                <span
                  className={classNames({
                    selected: selectedGasPrice === GasPrices.Standard,
                  })}
                  onClick={(): PayloadAction<GasPrices> =>
                    dispatch(updateSelectedGasPrice(GasPrices.Standard))
                  }
                >
                  {gasStandard} Standard
                </span>
                <span
                  className={classNames({
                    selected: selectedGasPrice === GasPrices.Fast,
                  })}
                  onClick={(): PayloadAction<GasPrices> =>
                    dispatch(updateSelectedGasPrice(GasPrices.Fast))
                  }
                >
                  {gasFast} Fast
                </span>
                <span
                  className={classNames({
                    selected: selectedGasPrice === GasPrices.Instant,
                  })}
                  onClick={(): PayloadAction<GasPrices> =>
                    dispatch(updateSelectedGasPrice(GasPrices.Instant))
                  }
                >
                  {gasInstant} Instant
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
            Deposit
          </button>
          <div
            className={
              "transactionInfoContainer " +
              classNames({ show: transactionInfoData.isInfo })
            }
          >
            <div className="transactionInfo">
              <div className="transactionInfoItem">
                <span>Minimum Receive</span>
                <span className="value">
                  {transactionInfoData.content.minimumReceive}
                </span>
              </div>
              <div className="transactionInfoItem">
                <span>Saddle LP token value</span>
                <span className="value">
                  {transactionInfoData.content.lpTokenValue}
                </span>
              </div>
              <div className="transactionInfoItem">
                {transactionInfoData.content.benefit > 0 ? (
                  <span className="bonus">Bonus</span>
                ) : (
                  <span className="slippage">Slippage</span>
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
        <div className="infoPanels">
          <MyShareCard data={myShareData} />
          <div
            style={{
              height: "24px",
              display: myShareData ? "block" : "none",
            }}
          ></div>{" "}
          {/* space divider */}
          <PoolInfoCard data={poolData} />
        </div>
        <Modal isOpen={modalOpen} onClose={(): void => setModalOpen(false)}>
          {popUp === "review" ? (
            <ReviewDeposit
              data={depositDataFromParent}
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
