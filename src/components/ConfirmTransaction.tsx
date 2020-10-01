import "./ConfirmTransaction.scss"

import React from "react"

const signImg = require("../assets/icons/icon_sign.svg")

function ConfirmTransaction() {
  return (
    <div className="confirmTransaction">
      <h3>Confirm this transaction in your wallet</h3>
      <img src={signImg} alt="" />
    </div>
  )
}

export default ConfirmTransaction
