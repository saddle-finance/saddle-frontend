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
import { WithdrawFormState } from "../hooks/useWithdrawFormState"
import classNames from "classnames"
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
  sadd: 0.325496,
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
    onFormChange,
    formStateData,
    reviewData,
  } = props

  const [modalOpen, setModalOpen] = useState(false)
  const [popUp, setPopUp] = useState("")

  const dispatch = useDispatch<AppDispatch>()
  const { gasCustom, gasPriceSelected } = useSelector(
    (state: AppState) => state.user,
  )
  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )

  const onSubmit = (): void => {
    setModalOpen(true)
    setPopUp("review")
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
                value={formStateData.percentage ? formStateData.percentage : ""}
              />
              {formStateData.error && (
                <div className="error">{formStateData.error.message}</div>
              )}
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
            <div>
              <div>
                <label>
                  {"All tokens"}
                  <input
                    type="radio"
                    value={"ALL"}
                    checked={formStateData.withdrawType === "ALL"}
                    onChange={(): void =>
                      onFormChange({
                        fieldName: "withdrawType",
                        value: "ALL",
                      })
                    }
                  />
                </label>
              </div>
              {tokensData.map((t) => {
                return (
                  <div key={t.symbol}>
                    <label>
                      {t.name}
                      <input
                        type="radio"
                        value={t.symbol}
                        checked={formStateData.withdrawType === t.symbol}
                        onChange={(): void =>
                          onFormChange({
                            fieldName: "withdrawType",
                            value: t.symbol,
                          })
                        }
                      />
                    </label>
                  </div>
                )
              })}
            </div>
            {/* <label className="combination">
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
            </label> */}
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
            disabled={!!formStateData.error}
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
