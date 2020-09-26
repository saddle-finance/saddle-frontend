import React from "react"
import "./SwapPage.scss"
import classNames from "classnames"

import TopMenu from "./TopMenu"
import SwapForm2 from "./SwapForm2"
import Modal from "./Modal"
import ReviewSwap from "./ReviewSwap"
import ConfirmTransaction from "./ConfirmTransaction"

// TODO:
// - Use state to add function of exchange button in priceTable
// - Use state to add function of MAX button
// - Use state to add function of input fields

// Dumb data for UI
const selected = {
  tradePool: "Y",
  gas: "standard",
  maxSlippage: 0.5,
  infiniteApproval: false,
}
// End of dumb data

interface Props {
  tokens: Array<{ name: string; value: number; icon: string }>
  rate: { [key: string]: any }
  selectedTokens: string[]
  error: { isError: boolean; message: string }
  info: { isInfo: boolean; message: string }
  advanced: boolean
}

interface State {
  modalOpen: boolean
  popUp: string
}

// Stateful version to use local state for modal opening.
// If local state gets to hooked into global state, please rewrite component to be the stateless.
class SwapPage extends React.Component<Props, State> {
  state: State = {
    modalOpen: false,
    popUp: "",
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
    const { tokens, rate, selectedTokens, error, info, advanced } = this.props
    const { modalOpen, popUp } = this.state

    return (
      <div className="swapPage">
        <TopMenu activeTab={"swap"} />
        <div className="content">
          <SwapForm2
            title="From"
            tokens={tokens}
            selected={selectedTokens[0]}
          />
          <img src={require("../assets/icons/icon_change.svg")} alt="" />
          <SwapForm2 title="To" tokens={tokens} selected={selectedTokens[1]} />
          <div className="priceTable">
            <span className="title">Price</span>
            <span className="pair">{rate.pair}</span>
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
            <span className="value">{rate.value}</span>
          </div>
          <div className="advancedOptions">
            <div className="title">
              Advanced Options
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
                  fill="#EA860B"
                />
              </svg>
            </div>

            {/* When advanced = true, divider will be shown */}
            <div className={"divider " + classNames({ show: advanced })}></div>

            {/* When advanced = true, this table will be shown */}
            <div className={"tableContainer " + classNames({ show: advanced })}>
              <div className="table">
                <div className="infiniteApproval tableOption">
                  <span className="label">Infinite Approval</span>
                  <div className="options">
                    <button
                      className={classNames({
                        selected: selected.infiniteApproval,
                      })}
                    >
                      Yes
                    </button>
                    <button
                      className={classNames({
                        selected: !selected.infiniteApproval,
                      })}
                    >
                      No
                    </button>
                  </div>
                </div>
                <div className="maxSlippage tableOption">
                  <span className="label">Max Slippage</span>
                  <div className="options">
                    <button
                      className={classNames({
                        selected: selected.maxSlippage === 0.5,
                      })}
                    >
                      0.5%
                    </button>
                    <button
                      className={classNames({
                        selected: selected.maxSlippage === 1,
                      })}
                    >
                      1%
                    </button>
                    <input></input>
                  </div>
                </div>
                <div className="maxSlippage tableOption">
                  <span className="label">Gas</span>
                  <div className="options">
                    <button
                      className={classNames({
                        selected: selected.gas === "standard",
                      })}
                    >
                      75 Standard
                    </button>
                    <button
                      className={classNames({
                        selected: selected.gas === "fast",
                      })}
                    >
                      82 Fast
                    </button>
                    <button
                      className={classNames({
                        selected: selected.gas === "instant",
                      })}
                    >
                      89 Instant
                    </button>
                    <input></input>
                  </div>
                </div>
                <div className="tradePool tableOption">
                  <span className="label">Trade Pool</span>
                  <div className="options">
                    <button
                      className={classNames({
                        selected: selected.tradePool === "Y",
                      })}
                    >
                      Y
                    </button>
                    <button
                      className={classNames({
                        selected: selected.tradePool === "ren",
                      })}
                    >
                      ren
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={"error " + classNames({ showError: error.isError })}>
            {error.message}
          </div>
          <button
            className={"swap " + classNames({ disabled: error.isError })}
            onClick={this.openModal}
            disabled={error.isError}
          >
            Swap
          </button>
          <div className={"info " + classNames({ showInfo: info.isInfo })}>
            {info.message}
          </div>
          <Modal isOpen={modalOpen} onClose={this.closeModal}>
            {popUp === "review" ? (
              <ReviewSwap
                onClose={this.closeModal}
                onConfirm={this.openConfirm}
              />
            ) : null}
            {popUp === "confirm" ? <ConfirmTransaction /> : null}
          </Modal>
        </div>
      </div>
    )
  }
}

export default SwapPage
