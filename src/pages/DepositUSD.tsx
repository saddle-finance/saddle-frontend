import React from "react"
import "./DepositUSD_BTC.scss"
import classNames from "classnames"

import TopMenu from "../components/TopMenu"
import MyShareCard from "../components/MyShareCard"
import PoolInfoCard from "../components/PoolInfoCard"
import TokenInput from "../components/TokenInput"

// Dumb data start here
const testMyShareData = {
  name: "USD Pool",
  share: 0.001,
  value: 98.56,
  USDbalance: 98.62,
  aveBalance: 98.42,
  token: [
    {
      name: "DAI",
      value: 19.9,
    },
    {
      name: "USDC",
      value: 30.9,
    },
    {
      name: "USDT",
      value: 32.9,
    },
    {
      name: "sUSD",
      value: 27.63,
    },
  ],
}

const testUsdPoolData = {
  name: "USD Pool",
  fee: 0.04,
  adminFee: 0,
  virtualPrice: 1.0224,
  utilization: 45.88,
  volume: 46555333.11,
  reserve: 142890495.38,
  tokens: [
    {
      name: "DAI",
      icon: require("../assets/icons/dai.svg"),
      percent: 12.34,
      value: 17633722.4,
    },
    {
      name: "USDC",
      icon: require("../assets/icons/usdc.svg"),
      percent: 33.98,
      value: 48424123.64,
    },
    {
      name: "USDT",
      icon: require("../assets/icons/usdt.svg"),
      percent: 38.96,
      value: 55675199.22,
    },
    {
      name: "sUSD",
      icon: require("../assets/icons/susd.svg"),
      percent: 14.8,
      value: 21157478.96,
    },
  ],
}

const testTokensData = [
  {
    name: "DAI",
    icon: require("../assets/icons/dai.svg"),
    max: 7.02,
  },
  {
    name: "USDC",
    icon: require("../assets/icons/usdc.svg"),
    max: 1.01,
  },
  {
    name: "USDT",
    icon: require("../assets/icons/usdt.svg"),
    max: 0,
  },
  {
    name: "sUSD",
    icon: require("../assets/icons/susd.svg"),
    max: 0,
  },
]

const selected = {
  maxSlippage: 0.1,
  gas: "standard",
  infiniteApproval: true,
}
// Dumb data end here

interface State {
  advanced: boolean
  info: {
    isInfo: boolean
    content: { [key: string]: any }
  }
}

class DepositUSD extends React.Component<any, State> {
  state: State = {
    advanced: true,
    info: {
      isInfo: true,
      content: {
        minimumReceive: 0.836,
        lpTokenValue: "1.034 USD",
        benefit: -2.836,
      },
    },
  }

  render() {
    const { advanced, info } = this.state

    return (
      <div className="deposit">
        <TopMenu activeTab={"pool"} />
        <div className="content">
          <div className="form">
            <h3>Add Liqudity in USD Pool</h3>
            {testTokensData.map((token, index) => (
              <>
                <TokenInput token={token} key={index} />
                <div style={{ height: "24px" }}></div> {/* space divider */}
              </>
            ))}
            <div className="advancedOptions">
              <span className="title">
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
              <div
                className={"divider " + classNames({ show: advanced })}
              ></div>
              <div
                className={"tableContainer" + classNames({ show: advanced })}
              >
                <div className="infiniteApproval">
                  <input type="checkbox" checked={selected.infiniteApproval} />
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
                      selected: selected.gas === "standard",
                    })}
                  >
                    75 Standard
                  </span>
                  <span
                    className={classNames({
                      selected: selected.gas === "fast",
                    })}
                  >
                    82 Fast
                  </span>
                  <span
                    className={classNames({
                      selected: selected.gas === "instant",
                    })}
                  >
                    87 Instant
                  </span>
                  <input type="number" />
                </div>
              </div>
            </div>
            <button className="actionBtn">Deposit</button>
            <div
              className={
                "transactionInfoContainer " + classNames({ show: info.isInfo })
              }
            >
              <div className="transactionInfo">
                <div className="transactionInfoItem">
                  <span>Minimum Receive</span>
                  <span className="value">{info.content.minimumReceive}</span>
                </div>
                <div className="transactionInfoItem">
                  <span>Saddle LP token value</span>
                  <span className="value">{info.content.lpTokenValue}</span>
                </div>
                <div className="transactionInfoItem">
                  {info.content.benefit > 0 ? (
                    <span className="bonus">Bonus</span>
                  ) : (
                    <span className="slippage">Slippage</span>
                  )}
                  <span
                    className={
                      "value " +
                      (info.content.benefit > 0 ? "bonus" : "slippage")
                    }
                  >
                    {info.content.benefit}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="infoPanels">
            <MyShareCard data={testMyShareData} />
            <div style={{ height: "24px" }}></div> {/* space divider */}
            <PoolInfoCard data={testUsdPoolData} />
          </div>
        </div>
      </div>
    )
  }
}

export default DepositUSD
