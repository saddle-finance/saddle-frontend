import "./TopMenu.scss"

import React, { ReactElement, useContext, useRef, useState } from "react"

import Button from "./Button"
import { IS_SDL_LIVE } from "../constants"
import { Link } from "react-router-dom"
import Modal from "./Modal"
import NetworkDisplay from "./NetworkDisplay"
import { RewardsBalancesContext } from "../providers/RewardsBalancesProvider"
import SiteSettingsMenu from "./SiteSettingsMenu"
import TokenClaimModal from "./TokenClaimModal"
import Web3Status from "./Web3Status"
import classNames from "classnames"
import { formatBNToShortString } from "../utils"
import logo from "../assets/icons/logo.svg"
import useDetectOutsideClick from "../hooks/useDetectOutsideClick"
import { useTranslation } from "react-i18next"

interface Props {
  activeTab: string
}

function TopMenu({ activeTab }: Props): ReactElement {
  const { t } = useTranslation()
  const [currentModal, setCurrentModal] = useState<string | null>(null)

  return (
    <header
      data-testid="topMenuContainer"
      className="top"
      style={{ border: "#000, solid 3px" }}
    >
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
        <RewardsButton setCurrentModal={setCurrentModal} />
        <Web3Status />
        <NetworkDisplayAndSettings />
        <IconButtonAndSettings />
      </div>
      <Modal
        isOpen={!!currentModal}
        onClose={(): void => setCurrentModal(null)}
      >
        {currentModal === "tokenClaim" && <TokenClaimModal />}
      </Modal>
    </header>
  )
}

function RewardsButton({
  setCurrentModal,
}: {
  setCurrentModal: React.Dispatch<React.SetStateAction<string | null>>
}): ReactElement | null {
  const rewardBalances = useContext(RewardsBalancesContext)
  const formattedTotal = formatBNToShortString(rewardBalances.total, 18)
  return IS_SDL_LIVE ? (
    <Button
      data-testid="rewardButton"
      kind="secondary"
      onClick={() => setCurrentModal("tokenClaim")}
      size="medium"
    >
      {formattedTotal} <img className="sdlToken" alt="logo" src={logo} />
    </Button>
  ) : null
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
          <SiteSettingsMenu key="networkSettings" />
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
        data-testid="settingsMenuBtn"
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
          <SiteSettingsMenu key="buttonSettings" />
        </div>
      )}
    </div>
  )
}
export default TopMenu
