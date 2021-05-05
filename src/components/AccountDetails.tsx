import "./AccountDetails.scss"

import React, { ReactElement } from "react"
import Identicon from "./Identicon"
import { useTranslation } from "react-i18next"

export default function AccountDetail(): ReactElement {
  const { t } = useTranslation()

  return (
    <div className="accountDetail">
      <div className="upperSection">
        <h3 className="accountTitle">{t("account")}</h3>
        <div className="accountControl">
          <span className="label">Connected with Metamask</span>
          <span className="label">Balance</span>
          <div className="data">
            <Identicon />
            <span className="address">0x1234...abcd</span>
          </div>
          <span className="data">0.123456&#926;</span>
          <button className="textStyle">Copy Address</button>
          <button className="textStyle">Change Account</button>
        </div>
      </div>

      <div className="lowerSection">
        <div className="titleRow">
          <h4 className="txn">Pending Transactions</h4>
          <button className="textStyle clear">Clear</button>
        </div>
        <span>Your pending transactions will be here.</span>
      </div>
    </div>
  )
}
