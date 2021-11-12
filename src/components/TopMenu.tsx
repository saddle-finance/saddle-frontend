import "./TopMenu.scss"

import React, { ReactElement, useRef, useState } from "react"

import Button from "./Button"
import { Link } from "react-router-dom"
import NetworkDisplay from "./NetworkDisplay"
import SiteSettingsMenu from "./SiteSettingsMenu"
import Web3Status from "./Web3Status"
import classNames from "classnames"
import logo from "../assets/icons/logo.svg"
import useDetectOutsideClick from "../hooks/useDetectOutsideClick"
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
        <NetworkDisplayAndSettings />
        <IconButtonAndSettings />
      </div>
    </header>
  )
}

function NetworkDisplayAndSettings(): ReactElement {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const wrapperRef = useRef(null)
  useDetectOutsideClick(
    wrapperRef,
    () => setIsDropdownOpen(false),
    isDropdownOpen,
  )

  return (
    <div style={{ position: "relative" }} ref={wrapperRef}>
      <NetworkDisplay onClick={() => setIsDropdownOpen((state) => !state)} />
      {isDropdownOpen && (
        <div className="siteSettingsWrapper">
          <SiteSettingsMenu />
        </div>
      )}
    </div>
  )
}

function IconButtonAndSettings(): ReactElement {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const wrapperRef = useRef(null)
  useDetectOutsideClick(
    wrapperRef,
    () => setIsDropdownOpen(false),
    isDropdownOpen,
  )

  return (
    <div style={{ position: "relative" }} ref={wrapperRef}>
      <Button
        kind="ternary"
        size="medium"
        onClick={() => setIsDropdownOpen((state) => !state)}
      >
        <svg
          width="6"
          height="22"
          viewBox="0 0 6 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={"hamburger"}
        >
          <circle cx="3" cy="3" r="2.5" />
          <circle cx="3" cy="10.5" r="2.5" />
          <circle cx="3" cy="18" r="2.5" />
        </svg>
      </Button>
      {isDropdownOpen && (
        <div className="siteSettingsWrapper">
          <SiteSettingsMenu />
        </div>
      )}
    </div>
  )
}
export default TopMenu
