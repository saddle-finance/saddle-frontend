import "./WithdrawPage.scss"

import {
  GasPrices,
  updateGasPriceCustom,
  updateGasPriceSelected,
} from "../state/user"
import { PoolDataType, UserShareType } from "../hooks/usePoolData"
import React, { ReactElement, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

import { AppDispatch } from "../state"
import { AppState } from "../state"
import ConfirmTransaction from "./ConfirmTransaction"
import Modal from "./Modal"
import MyShareCard from "./MyShareCard"
import { PayloadAction } from "@reduxjs/toolkit"
import PoolInfoCard from "./PoolInfoCard"
import ReviewWithdraw from "./ReviewWithdraw"
import TokenInput from "./TokenInput"
import TopMenu from "./TopMenu"
import classNames from "classnames"
import daiLogo from "../assets/icons/dai.svg"
// import susdLogo from "../assets/icons/susd.svg"
import usdcLogo from "../assets/icons/usdc.svg"
import usdtLogo from "../assets/icons/usdt.svg"
import { useTranslation } from "react-i18next"

const testWithdrawData = {
  withdraw: [
    {
      name: "DAI",
      value: 23.21,
      icon: daiLogo,
    },
    {
      name: "USDC",
      value: 30.65,
      icon: usdcLogo,
    },
    {
      name: "USDT",
      value: 20.15,
      icon: usdtLogo,
    },
  ],
  rates: [
    {
      name: "DAI",
      rate: 1.02,
    },
    {
      name: "USDC",
      rate: 0.99,
    },
    {
      name: "USDT",
      rate: 1.01,
    },
  ],
  share: 0.000024,
  sadd: 0.325496,
}
/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  title: string
  onChangeTokenInputValue: (tokenSymbol: string, value: string) => void
  tokensData: Array<{
    symbol: string
    name: string
    icon: string
    max: number
    inputValue: string
  }>
  selected?: { [key: string]: any }
  poolData: PoolDataType | null
  myShareData?: UserShareType | null
  transactionInfoData: {
    isInfo: boolean
    content: { [key: string]: any }
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const WithdrawPage = (props: Props): ReactElement => {
  const { t } = useTranslation()
  const {
    title,
    tokensData,
    poolData,
    transactionInfoData,
    myShareData,
    onChangeTokenInputValue,
  } = props

  const [modalOpen, setModalOpen] = useState(false)
  const [combination, setCombination] = useState(false)
  const [popUp, setPopUp] = useState("")
  const [percentage, setPercentage] = useState(100)
  const [error, setError] = useState("")
  const [currentTokensData, setCurrentTokensData] = useState(tokensData)

  const dispatch = useDispatch<AppDispatch>()
  const { gasCustom, gasPriceSelected } = useSelector(
    (state: AppState) => state.user,
  )
  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )
  const onPercentChange = (value: string): void => {
    const percent = parseInt(value)
    if (percent <= 0 || percent > 100) {
      setPercentage(percent)
      setError(t("inputNotValid"))
    } else {
      setError("")
      setPercentage(percent)
      setCurrentTokensData(
        tokensData.map((token) => ({
          ...token,
          max: Math.floor(token.max * percent) / 100,
        })),
      )
    }
  }

  const validPercentage = (value: number): boolean => {
    return value > 0 && value <= 100 ? true : false
  }

  const onSubmit = (): void => {
    if (validPercentage(percentage)) {
      setModalOpen(true)
      setPopUp("review")
    }
  }

  return (
    <div className="withdraw">
      <TopMenu activeTab={"pool"} />
      <div className="content">
        <div className="left">
          <div className="form">
            <h3>{`${t("withdrawFrom")} ${title}`}</h3>
            <div className="percentage">
              <span>{`${t("withdrawPercentage")} (%):`}</span>
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
            {currentTokensData.map((token, index) => (
              <div key={index}>
                <TokenInput
                  {...token}
                  onChange={(value): void =>
                    onChangeTokenInputValue(token.symbol, value)
                  }
                />
                {index === currentTokensData.length - 1 ? (
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
            <label className="combination">
              <span className="checkbox_input">
                <input
                  type="checkbox"
                  checked={combination}
                  onChange={(): void => setCombination(!combination)}
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
              </span>
              <span className="combLabel">{t("combinationOfAll")}</span>
            </label>
            <div className="paramater">
              {`${t("gas")}:`}
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
                {gasInstant} {t("instant")}
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
          <button
            className="actionBtn"
            type="submit"
            disabled={!validPercentage(percentage)}
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
              data={testWithdrawData}
              gas={gasPriceSelected}
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

export default WithdrawPage
