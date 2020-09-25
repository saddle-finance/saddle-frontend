import React from "react"
import "./ReviewDeposit.scss"

const data = {
  deposit: [
    {
      name: "DAI",
      value: 6.21,
      icon: require("../assets/icons/dai.svg"),
    },
    {
      name: "USDC",
      value: 8.65,
      icon: require("../assets/icons/usdc.svg"),
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
  ],
  share: 0.000024,
  sadd: 0.325496,
}

interface Props {
  onClose?: () => void
  onConfirm?: () => void
  data?: any
}

function ReviewDeposit({ onClose, onConfirm }: Props) {
  return (
    <div className="reviewDeposit">
      <h3>Review Deposit</h3>
      <div className="table">
        {data.deposit.map((each, index) => (
          <div className="eachToken" key={index}>
            <span className="value">{each.value}</span>
            <img src={each.icon} />
            <span>{each.name}</span>
          </div>
        ))}
        <div
          style={{
            height: "1px",
            background: "#FAE09E",
            width: "100%",
            marginTop: "-8px",
          }}
        ></div>
        <div className="tableBottomItem">
          <span className="label">Share of pool:</span>
          <span className="value">{data.share}%</span>
        </div>
        <div className="tableBottomItem">
          <span className="label">Rates:</span>
          <div className="rates value">
            {data.rates.map((each, index) => (
              <span key={index}>
                1 {each.name} = {each.rate} USD
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="bottom">
        <h4>You will receive</h4>
        <span>{data.sadd}</span>
        <span style={{ float: "right" }}>SADD pool tokens</span>
        <p>
          Output is estimated. If the price changes by more than 0.1% your
          transaction will revert.
        </p>
        <button onClick={onConfirm} className="confirm">
          Confirm Swap
        </button>
        <button onClick={onClose} className="cancel">
          Cancel
        </button>
      </div>
    </div>
  )
}

export default ReviewDeposit
