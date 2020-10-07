import "./WithdrawPage.scss"

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
import TokenInput from "./TokenInput"
import TopMenu from "./TopMenu"
import classNames from "classnames"

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  title: string
  tokensData: Array<{ name: string; icon: string; max: number }>
  selected?: { [key: string]: any }
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

const WithdrawPage = (props: Props): ReactElement => {
  const {
    title,
    tokensData,
    poolData,
    transactionInfoData,
    myShareData,
  } = props

  const [modalOpen, setModalOpen] = useState(false)
  const [combination, setCombination] = useState(false)
  const [popUp, setPopUp] = useState("")
  const [percentage, setPercentage] = useState(100)
  const [error, setError] = useState("")

  const dispatch = useDispatch<AppDispatch>()
  const { gasCustom, selectedGasPrice } = useSelector(
    (state: AppState) => state.user,
  )
  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )
  const onPercentChange = (value: string): void => {
    const percent = parseInt(value)
    if (percent <= 0 || percent > 100) {
      setPercentage(0)
      setError("Please input a number between 0 and 100")
    } else {
      setError("")
      setPercentage(percent)
    }
  }

  const onSubmit = (): void => {
    if (percentage > 0 && percentage <= 100) {
      setModalOpen(true)
      setPopUp("confirm")
    }
  }

  return (
    <div className="withdraw">
      <TopMenu activeTab={"pool"} />
      <div className="content">
        <div className="form">
          <h3>Withdraw from {title}</h3>
          <div className="percentage">
            <span>Withdraw percentage (%): </span>
            <input
              type="number"
              step="10"
              placeholder="100"
              onChange={(e: React.FormEvent<HTMLInputElement>): void =>
                onPercentChange(e.currentTarget.value)
              }
            />
            {error && <div className="error">{error}</div>}
          </div>
          {tokensData.map((token, index) => (
            <div key={index}>
              <TokenInput token={token} />
              <div style={{ height: "24px" }}></div> {/* space divider */}
            </div>
          ))}

          <div className="advancedOptions">
            <div className="combination">
              <input
                type="checkbox"
                checked={combination}
                onChange={(): void => setCombination(!combination)}
              />
              <span>Combination of all</span>
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

          <button
            className="actionBtn"
            type="submit"
            onClick={(): void => {
              onSubmit()
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
          {/* {popUp === "review" ? (
            <ReviewDeposit
              data={depositDataFromParent}
              onConfirm={(): void => setPopUp("confirm")}
              onClose={(): void => setModalOpen(false)}
            />
          ) : null} */}
          {popUp === "confirm" ? <ConfirmTransaction /> : null}
        </Modal>
      </div>
    </div>
  )
}

export default WithdrawPage
