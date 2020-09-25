import React from "react"
import "./DepositUSD_BTC.scss"
import classNames from "classnames"

import TopMenu from "../components/TopMenu"
import MyShareCard from "../components/MyShareCard"
import PoolInfoCard from "../components/PoolInfoCard"
import TokenInput from "../components/TokenInput"
import Modal from "../components/Modal"
import ReviewDeposit from "../components/ReviewDeposit"

// Dumb data start here

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
      name: "tBTC",
      icon: require("../assets/icons/tbtc.svg"),
      percent: 12.34,
      value: 17633722.4,
    },
    {
      name: "wBTC",
      icon: require("../assets/icons/wbtc.svg"),
      percent: 33.98,
      value: 48424123.64,
    },
    {
      name: "renBTC",
      icon: require("../assets/icons/renbtc.svg"),
      percent: 38.96,
      value: 55675199.22,
    },
    {
      name: "sBTC",
      icon: require("../assets/icons/sbtc.svg"),
      percent: 14.8,
      value: 21157478.96,
    },
  ],
}

const testTokensData = [
  {
    name: "tBTC",
    icon: require("../assets/icons/dai.svg"),
    max: 2.02,
  },
  {
    name: "wBTC",
    icon: require("../assets/icons/usdc.svg"),
    max: 1.31,
  },
  {
    name: "renBTC",
    icon: require("../assets/icons/usdt.svg"),
    max: 0.1,
  },
  {
    name: "sBTC",
    icon: require("../assets/icons/susd.svg"),
    max: 0.2,
  },
]

const selected = {
  maxSlippage: 0.1,
  gas: "standard",
  infiniteApproval: false,
}

const testTransInfoData = {
  minimumReceive: 0.083,
  lpTokenValue: "10.34 USD",
  benefit: 1.836,
}
// Dumb data end here

interface State {
  advanced: boolean
  info: {
    isInfo: boolean
    content: { [key: string]: any }
  }
  modalOpen: boolean
}

class DepositBTC extends React.Component<any, State> {
  state: State = {
    advanced: false,
    info: {
      isInfo: false,
      content: {
        minimumReceive: 0,
        lpTokenValue: "",
        benefit: 0,
      },
    },
    modalOpen: true,
  }

  openModal = () => {
    this.setState({
      modalOpen: true,
    })
  }

  closeModal = () => {
    this.setState({
      modalOpen: false,
    })
  }

  render() {
    const { advanced, info, modalOpen } = this.state

    return (
      <div className="deposit">
        <TopMenu activeTab={"pool"} />
        <div className="content">
          <div className="form">
            <h3>Add Liqudity in BTC Pool</h3>
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
                  <span className="value">
                    {testTransInfoData.minimumReceive}
                  </span>
                </div>
                <div className="transactionInfoItem">
                  <span>Saddle LP token value</span>
                  <span className="value">
                    {testTransInfoData.lpTokenValue}
                  </span>
                </div>
                <div className="transactionInfoItem">
                  {testTransInfoData.benefit > 0 ? (
                    <span className="bonus">Bonus</span>
                  ) : (
                    <span className="slippage">Slippage</span>
                  )}
                  <span
                    className={
                      "value " +
                      (testTransInfoData.benefit > 0 ? "bonus" : "slippage")
                    }
                  >
                    {testTransInfoData.benefit}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="infoPanels">
            <MyShareCard />
            <PoolInfoCard data={testUsdPoolData} />
          </div>
          <Modal isOpen={modalOpen} onClose={this.closeModal}>
            <ReviewDeposit />
          </Modal>
        </div>
      </div>
    )
  }
}

export default DepositBTC
