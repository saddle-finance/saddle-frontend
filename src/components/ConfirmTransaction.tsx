import "./ConfirmTransaction.scss"

import React, { ReactElement } from "react"

import signImg from "../assets/icons/icon_sign.svg"

function ConfirmTransaction(): ReactElement {
  return (
    <div className="confirmTransaction">
      <h3>Confirm this transaction in your wallet</h3>
      <img src={signImg} alt="" />
    </div>
  )
}

export default ConfirmTransaction
