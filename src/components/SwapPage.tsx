import "./SwapPage.scss"

import React, { ReactElement, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

import { AppDispatch } from "../state"
import { AppState } from "../state/index"
import ConfirmTransaction from "./ConfirmTransaction"
import { GasField } from "./GasField"
import Modal from "./Modal"
import { PayloadAction } from "@reduxjs/toolkit"
import ReviewSwap from "./ReviewSwap"
import SlippageField from "./SlippageField"
import SwapForm from "./SwapForm"
import TopMenu from "./TopMenu"
import classNames from "classnames"
import { updateSwapAdvancedMode } from "../state/user"
import { useTranslation } from "react-i18next"

interface Props {
  tokens: Array<{ symbol: string; name: string; value: string; icon: string }>
  exchangeRateInfo: { pair: string; value: string }
  error: string | null
  info: { isInfo: boolean; message: string }
  infiniteApproval: boolean
  fromState: { symbol: string; value: string }
  toState: { symbol: string; value: string }
  onChangeInfiniteApproval: (approval: boolean) => void
  onChangeFromToken: (tokenSymbol: string) => void
  onChangeFromAmount: (amount: string) => void
  onChangeToToken: (tokenSymbol: string) => void
  onConfirmTransaction: () => Promise<void>
  onClickReverseExchangeDirection: () => void
}

const SwapPage = (props: Props): ReactElement => {
  const { t } = useTranslation()
  const {
    tokens,
    exchangeRateInfo,
    error,
    info,
    fromState,
    toState,
    infiniteApproval,
    onChangeInfiniteApproval,
    onChangeFromToken,
    onChangeFromAmount,
    onChangeToToken,
    onConfirmTransaction,
    onClickReverseExchangeDirection,
  } = props

  const [modalOpen, setModalOpen] = useState(false)
  const [popUp, setPopUp] = useState("")

  const dispatch = useDispatch<AppDispatch>()
  const { userSwapAdvancedMode: advanced, gasPriceSelected } = useSelector(
    (state: AppState) => state.user,
  )

  return (
    <div className="swapPage">
      <TopMenu activeTab={"swap"} />
      <div className="content">
        <SwapForm
          isSwapFrom={true}
          tokens={tokens}
          onChangeSelected={onChangeFromToken}
          onChangeAmount={onChangeFromAmount}
          selected={fromState.symbol}
          inputValue={fromState.value}
        />
        <div style={{ width: "64px" }} />
        <SwapForm
          isSwapFrom={false}
          tokens={tokens}
          onChangeSelected={onChangeToToken}
          selected={toState.symbol}
          inputValue={toState.value}
        />
        <div className="infoSection">
          <div className="priceTable">
            <span className="title">{t("price")}</span>
            <span className="pair">{exchangeRateInfo.pair}</span>
            <button
              className="exchange"
              onClick={onClickReverseExchangeDirection}
            >
              <svg
                width="24"
                height="20"
                viewBox="0 0 24 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.4011 12.4196C17.4011 13.7551 16.5999 13.8505 16.4472 13.8505H6.62679L9.14986 11.3274L8.47736 10.6501L5.13869 13.9888C5.04986 14.0782 5 14.1991 5 14.3251C5 14.4511 5.04986 14.572 5.13869 14.6613L8.47736 18L9.14986 17.3275L6.62679 14.8044H16.4472C17.1054 14.8044 18.355 14.3274 18.355 12.4196V10.9888H17.4011V12.4196Z"
                  fill="#3800D6"
                />
                <path
                  d="M5.9539 7.58511C5.9539 6.24965 6.75519 6.15426 6.90781 6.15426H16.7283L14.2052 8.67733L14.8777 9.34984L18.2164 6.01117C18.3052 5.92181 18.355 5.80092 18.355 5.67492C18.355 5.54891 18.3052 5.42803 18.2164 5.33867L14.8777 2L14.2004 2.67727L16.7283 5.20035H6.90781C6.24962 5.20035 5 5.6773 5 7.58511V9.01597H5.9539V7.58511Z"
                  fill="#3800D6"
                />
              </svg>
            </button>
            <span className="value">{exchangeRateInfo.value}</span>
          </div>
          <div className="cost">{info.isInfo ? info.message : "..."}</div>
          <div
            className="title"
            onClick={(): PayloadAction<boolean> =>
              dispatch(updateSwapAdvancedMode(!advanced))
            }
          >
            {t("advancedOptions")}
            {/* When advanced = true, icon will be upside down */}
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
          </div>
        </div>
        <div className="advancedOptions">
          <div className="divider"></div>
          <div className={"tableContainer " + classNames({ show: advanced })}>
            <div className="table">
              <div className="infiniteApproval tableOption">
                <div className="IAlabel">
                  {t("infiniteApproval")}
                  <span className="tooltipText">
                    {`Allow Saddle to spend all of your ${fromState.symbol} now and in the
                    future. You will not need to approve again.`}
                  </span>
                </div>
                <div className="options">
                  <button
                    className={classNames({
                      selected: infiniteApproval,
                    })}
                    onClick={(): void => onChangeInfiniteApproval(true)}
                  >
                    {t("yes")}
                  </button>
                  <button
                    className={classNames({
                      selected: !infiniteApproval,
                    })}
                    onClick={(): void => onChangeInfiniteApproval(false)}
                  >
                    {t("no")}
                  </button>
                </div>
              </div>
              <div className="tableOption">
                <SlippageField />
              </div>
              <div className="tableOption">
                <GasField />
              </div>
            </div>
          </div>
        </div>
        <button
          className={
            "swap " + classNames({ disabled: !!error || +toState.value <= 0 })
          }
          onClick={(): void => {
            setModalOpen(true)
            setPopUp("review")
          }}
          disabled={!!error || +toState.value <= 0}
        >
          {t("swap")}
        </button>
        <div className={"error " + classNames({ showError: !!error })}>
          {error}
        </div>
        <Modal isOpen={modalOpen} onClose={(): void => setModalOpen(false)}>
          {popUp === "review" ? (
            <ReviewSwap
              onClose={(): void => setModalOpen(false)}
              onConfirm={async (): Promise<void> => {
                setPopUp("confirm")
                await onConfirmTransaction()
                setModalOpen(false)
              }}
              data={{
                from: fromState,
                to: toState,
                exchangeRateInfo,
              }}
            />
          ) : null}
          {popUp === "confirm" ? <ConfirmTransaction /> : null}
        </Modal>
      </div>
    </div>
  )
}
export default SwapPage
