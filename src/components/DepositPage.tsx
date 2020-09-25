import React from "react"
import "./DepositPage.scss"
import classNames from "classnames"

import TopMenu from "./TopMenu"
import MyShareCard from "./MyShareCard"
import PoolInfoCard from "./PoolInfoCard"
import TokenInput from "./TokenInput"
import Modal from "./Modal"
import ReviewDeposit from "./ReviewDeposit"
import ConfirmTransaction from "./ConfirmTransaction"

interface State {
  advanced: boolean
  modalOpen: boolean
  popUp: string
}

interface Props {
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
}

class DepositPage extends React.Component<Props, State> {
  state: State = {
    advanced: false,
    modalOpen: false,
    popUp: "",
  }

  toggleAdvanced = () => {
    this.setState({
      advanced: !this.state.advanced,
    })
  }

  openModal = () => {
    this.setState({
      modalOpen: true,
      popUp: "review",
    })
  }

  closeModal = () => {
    this.setState({
      modalOpen: false,
    })
  }

  openReview = () => {
    this.setState({
      popUp: "review",
    })
  }

  closeReview = () => {
    this.setState({
      popUp: "",
    })
  }

  openConfirm = () => {
    this.setState({
      popUp: "confirm",
    })
  }

  closeConfirm = () => {
    this.setState({
      popUp: "",
    })
  }

  render() {
    const { advanced, modalOpen, popUp } = this.state
    const {
      selected,
      tokensData,
      poolData,
      transactionInfoData,
      myShareData,
    } = this.props

    return (
      <div className="deposit">
        <TopMenu activeTab={"pool"} />
        <div className="content">
          <div className="form">
            <h3>Add Liqudity in BTC Pool</h3>
            {tokensData.map((token, index) => (
              <>
                <TokenInput token={token} key={index} />
                <div style={{ height: "24px" }}></div> {/* space divider */}
              </>
            ))}
            <div className="advancedOptions">
              <span className="title" onClick={this.toggleAdvanced}>
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
            <button className="actionBtn" onClick={this.openModal}>
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
          <Modal isOpen={modalOpen} onClose={this.closeModal}>
            {popUp === "review" ? (
              <ReviewDeposit
                onConfirm={this.openConfirm}
                onClose={this.closeModal}
              />
            ) : null}
            {popUp === "confirm" ? <ConfirmTransaction /> : null}
          </Modal>
        </div>
      </div>
    )
  }
}

export default DepositPage
