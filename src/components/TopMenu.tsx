import "./TopMenu.scss"

import React, { ReactElement } from "react"

import { Link } from "react-router-dom"
import ThemeChanger from "./ThemeChanger"
import Web3Status from "./Web3Status"
import classNames from "classnames"
import logo from "../assets/icons/logo.svg"
import { useTranslation } from "react-i18next"

interface Props {
  activeTab: string
}

function TopMenu({ activeTab }: Props): ReactElement {
  const { t } = useTranslation()

  return (
    <header className="top" style={{ border: "#000, solid 3px" }}>
      <div className="logoWrapper">
        <Link to="/">
          <img className="logo" alt="logo" src={logo} />
        </Link>
      </div>

      <ul className="nav">
        <li>
          <Link to="/" className={classNames({ active: activeTab === "swap" })}>
            {t("swap")}
          </Link>
        </li>
        <li>
          <Link
            to="/pools"
            className={classNames({
              active:
                activeTab === "pools" ||
                activeTab === "deposit" ||
                activeTab === "withdraw",
            })}
          >
            {t("pools")}
          </Link>
        </li>
        <li>
          <Link
            to="/risk"
            className={classNames({ active: activeTab === t("risk") })}
          >
            {t("risk")}
          </Link>
        </li>
      </ul>
      <div className="walletWrapper">
        <Web3Status />
        <ThemeChanger />
      </div>
    </header>
  )
}

export default TopMenu
