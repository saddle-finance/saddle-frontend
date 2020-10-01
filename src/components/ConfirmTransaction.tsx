import "./ConfirmTransaction.scss"

import React from "react"
<<<<<<< HEAD

const signImg = require("../assets/icons/icon_sign.svg")
=======
import signImg from "../assets/icons/icon_sign.svg"
>>>>>>> Enable eslint:recommended linting rules and fix errors

function ConfirmTransaction() {
  return (
    <div className="confirmTransaction">
      <h3>Confirm this transaction in your wallet</h3>
      <img src={signImg} alt="" />
    </div>
  )
}

export default ConfirmTransaction
