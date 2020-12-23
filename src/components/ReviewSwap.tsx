import "./ReviewSwap.scss"

import React, { ReactElement } from "react"

import USDC from "../assets/icons/usdc.svg"
import USDT from "../assets/icons/usdt.svg"
import iconDown from "../assets/icons/icon_down.svg"
import { useTranslation } from "react-i18next"

interface Props {
  onClose: () => void
  onConfirm: () => void
  data: {
    from: { symbol: string; value: string }
    to: { symbol: string; value: string }
    exchangeRateInfo: {
      pair: string
      value: string
    }
    gas: string
    slippage: string
  }
}

function ReviewSwap({ onClose, onConfirm, data }: Props): ReactElement {
  const { t } = useTranslation()

  return (
    <div className="reviewSwap">
      <h3>{t("reviewSwap")}</h3>
      <div className="swapTable">
        <div className="from">
          <img className="tokenIcon" src={USDC} alt="icon" />
          <span className="tokenName">{data.from.symbol}</span>
          <div className="floatRight">
            <span>{data.from.value}</span>
          </div>
        </div>
        <img src={iconDown} alt="to" className="arrowDown" />
        <div className="to">
          <img className="tokenIcon" src={USDT} alt="icon" />
          <span className="tokenName">{data.to.symbol}</span>
          <div className="floatRight">
            <span>{data.to.value}</span>
          </div>
        </div>
        <div className="divider" style={{ height: "1px", width: "100%" }} />
        <div className="swapInfo">
          <div className="priceTable">
            <span className="title">{t("price")}</span>
            <span className="pair">{data.exchangeRateInfo.pair}</span>
            <button className="exchange">
              <svg
                width="24"
                height="20"
                viewBox="0 0 24 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.4011 12.4196C17.4011 13.7551 16.5999 13.8505 16.4472 13.8505H6.62679L9.14986 11.3274L8.47736 10.6501L5.13869 13.9888C5.04986 14.0782 5 14.1991 5 14.3251C5 14.4511 5.04986 14.572 5.13869 14.6613L8.47736 18L9.14986 17.3275L6.62679 14.8044H16.4472C17.1054 14.8044 18.355 14.3274 18.355 12.4196V10.9888H17.4011V12.4196Z"
                  fill="#D67A0A"
                />
                <path
                  d="M5.9539 7.58511C5.9539 6.24965 6.75519 6.15426 6.90781 6.15426H16.7283L14.2052 8.67733L14.8777 9.34984L18.2164 6.01117C18.3052 5.92181 18.355 5.80092 18.355 5.67492C18.355 5.54891 18.3052 5.42803 18.2164 5.33867L14.8777 2L14.2004 2.67727L16.7283 5.20035H6.90781C6.24962 5.20035 5 5.6773 5 7.58511V9.01597H5.9539V7.58511Z"
                  fill="#D67A0A"
                />
              </svg>
            </button>
            <span className="value floatRight">
              {data.exchangeRateInfo.value}
            </span>
          </div>
          <div className="gas">
            <span className="title">Gas</span>
            <span className="value floatRight">{data.gas} GWEI</span>
          </div>
          <div className="slippage">
            <span className="title">Max Slippage</span>
            <span className="value floatRight">{data.slippage}%</span>
          </div>
        </div>
      </div>
      <div className="bottom">
        <p>{t("estimatedOutput")}</p>
        <button onClick={onConfirm} className="confirm">
          {t("confirmSwap")}
        </button>
        <button onClick={onClose} className="cancel">
          {t("cancel")}
        </button>
      </div>
    </div>
  )
}

export default ReviewSwap
