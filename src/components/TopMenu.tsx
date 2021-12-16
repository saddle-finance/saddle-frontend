import "./TopMenu.scss"

import { Box, Stack, styled } from "@mui/material"
import { Link, useLocation } from "react-router-dom"
import React, { ReactElement, useContext, useRef, useState } from "react"
import Button from "./Button"
import { IS_SDL_LIVE } from "../constants"
import Modal from "./Modal"
import NetworkDisplay from "./NetworkDisplay"
import { RewardsBalancesContext } from "../providers/RewardsBalancesProvider"
import { ReactComponent as SaddleLogo } from "../assets/icons/logo.svg"
import SiteSettingsMenu from "./SiteSettingsMenu"
import TokenClaimModal from "./TokenClaimModal"
import Web3Status from "./Web3Status"
import { formatBNToShortString } from "../utils"
import useDetectOutsideClick from "../hooks/useDetectOutsideClick"
import { useTranslation } from "react-i18next"

type LinkStyleProps = {
  active: boolean
}
const LinkStyle = styled(Link)<LinkStyleProps>(({ theme, active }) => ({
  ...theme.typography.subtitle1,
  color: theme.palette.text.primary,
  marginRight: theme.spacing(5),
  transition: theme.transitions.create("opacity", {
    duration: theme.transitions.duration.shortest,
  }),
  fontWeight: active ? "bold" : "normal",
  textDecoration: "none",
  "&:hover": {
    opacity: 0.48,
  },
}))

function TopMenu(): ReactElement {
  const { t } = useTranslation()
  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const { pathname } = useLocation()
  console.log("path name ==>", pathname)
  const activeTab = pathname.split("/")[1]
  console.log("active name ==>", activeTab)

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      data-testid="topMenuContainer"
      width="100%"
    >
      <Box flex={1}>
        <Link to="/">
          <Box mt={2} mb={1}>
            <SaddleLogo />
          </Box>
        </Link>
      </Box>

      <Box flex={1} textAlign="center">
        <nav>
          <LinkStyle to="/" active={activeTab === ""}>
            {t("swap")}
          </LinkStyle>
          <LinkStyle to="/pools" active={activeTab === "pools"}>
            {t("pools")}
          </LinkStyle>
          <LinkStyle to="/risk" active={activeTab === "risk"}>
            {t("risk")}
          </LinkStyle>
        </nav>
      </Box>

      <Stack
        direction="row"
        spacing={2}
        justifyContent="end"
        alignItems="center"
        flex={1}
      >
        <RewardsButton setCurrentModal={setCurrentModal} />
        <Web3Status />
        <NetworkDisplayAndSettings />
        <IconButtonAndSettings />
      </Stack>
      <Modal
        isOpen={!!currentModal}
        onClose={(): void => setCurrentModal(null)}
      >
        {currentModal === "tokenClaim" && <TokenClaimModal />}
      </Modal>
    </Stack>
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
      {formattedTotal}
      <Box width={20} height={20} borderRadius={20} bgcolor="white">
        <SaddleLogo width={20} height={20} />
      </Box>
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
