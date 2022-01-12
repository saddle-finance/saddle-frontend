import "./TopMenu.scss"

import { AppBar, Box, Hidden, Toolbar } from "@mui/material"
import { Link, useLocation } from "react-router-dom"
import React, { ReactElement, useContext, useRef, useState } from "react"

import Button from "./Button"
import { IS_SDL_LIVE } from "../constants"
// import Modal from "./Modal"
import NetworkDisplay from "./NetworkDisplay"
import { RewardsBalancesContext } from "../providers/RewardsBalancesProvider"
import { ReactComponent as SaddleLogo } from "../assets/icons/logo.svg"
import SiteSettingsMenu from "./SiteSettingsMenu"
import TokenClaimModal from "./TokenClaimDialog"
import Web3Status from "./Web3Status"
import classNames from "classnames"
import { formatBNToShortString } from "../utils"
import useDetectOutsideClick from "../hooks/useDetectOutsideClick"
import { useTranslation } from "react-i18next"

type ActiveTabType = "" | "pools" | "risk"

function TopMenu(): ReactElement {
  const { t } = useTranslation()
  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const { pathname } = useLocation()
  const activeTab = pathname.split("/")[1] as ActiveTabType

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar
        data-testid="topMenuContainer"
        sx={{ mx: { md: 7 }, mt: { md: 3 } }}
      >
        <Hidden mdDown>
          <Box flex={1} flexBasis="30%">
            <Link to="/">
              <SaddleLogo />
            </Link>
          </Box>
        </Hidden>

        <ul className="nav">
          <li>
            <Link
              data-testid="swapNavLink"
              to="/"
              className={classNames({ active: activeTab === "" })}
            >
              {t("swap")}
            </Link>
          </li>
          <li>
            <Link
              to="/pools"
              className={classNames({
                active: activeTab === "pools",
              })}
            >
              {t("pools")}
            </Link>
          </li>
          <li>
            <Link
              to="/risk"
              className={classNames({ active: activeTab === "risk" })}
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
        <TokenClaimModal
          open={currentModal === "tokenClaim"}
          onClose={(): void => setCurrentModal(null)}
        />
      </Toolbar>
    </AppBar>
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
      {formattedTotal} <SaddleLogo width={24} height={24} />
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
