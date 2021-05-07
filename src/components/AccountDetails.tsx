import "./AccountDetails.scss"

import React, { ReactElement } from "react"
import Copy from "./Copy"
import Identicon from "./Identicon"
import { getEtherscanLink } from "../utils/getEtherscanLink"
import { shortenAddress } from "../utils/shortenAddress"
import { useActiveWeb3React } from "../hooks"
import { useTranslation } from "react-i18next"

export default function AccountDetail(): ReactElement {
  const { t } = useTranslation()
  const { account } = useActiveWeb3React()

  return (
    <div className="accountDetail">
      <div className="upperSection">
        <h3 className="accountTitle">{t("account")}</h3>
        <div className="accountControl">
          <span className="label">Connected with Metamask</span>
          <span className="label">Balance</span>
          <div className="data">
            <Identicon />
            <span className="address">
              {account && shortenAddress(account)}
            </span>
            {account && (
              <a
                href={getEtherscanLink(account, "address")}
                target="_blank"
                rel="noreferrer"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M11.6667 11.6667H4.33333V4.33333H8V3H4.33333C3.59333 3 3 3.6 3 4.33333V11.6667C3 12.4 3.59333 13 4.33333 13H11.6667C12.4 13 13 12.4 13 11.6667V8H11.6667V11.6667ZM9.33333 2V3.33333H11.7267L6.17333 8.88667L7.11333 9.82667L12.6667 4.27333V6.66667H14V2H9.33333Z" />
                </svg>
              </a>
            )}
          </div>
          <span className="data">0.123456&#926;</span>
          <div className="buttonGroup">
            {account && (
              <Copy toCopy={account}>
                <span className="textStyle">Copy Address</span>
              </Copy>
            )}
          </div>
          <div className="buttonGroup">
            <button className="textStyle">Change Account</button>
          </div>
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
