import "./TopMenu.scss"

import { AppBar, Box, Button, Hidden, Stack, Toolbar } from "@mui/material"
import { Link, useLocation } from "react-router-dom"
import React, { ReactElement, useContext, useState } from "react"

import { IS_SDL_LIVE } from "../constants"
import { MoreVert } from "@mui/icons-material"
import NetworkDisplay from "./NetworkDisplay"
import { RewardsBalancesContext } from "../providers/RewardsBalancesProvider"
import { ReactComponent as SaddleLogo } from "../assets/icons/logo.svg"
import SiteSettingsMenu from "./SiteSettingsMenu"
import TokenClaimDialog from "./TokenClaimDialog"
import Web3Status from "./Web3Status"
import classNames from "classnames"
import { formatBNToShortString } from "../utils"
import { useTranslation } from "react-i18next"

type ActiveTabType = "" | "pools" | "risk"

function TopMenu(): ReactElement {
  const { t } = useTranslation()
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const { pathname } = useLocation()
  const activeTab = pathname.split("/")[1] as ActiveTabType

  const handleSettingMenu = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    setAnchorEl(event.currentTarget)
  }
  return (
    <AppBar position="static" elevation={0}>
      <Toolbar
        data-testid="topMenuContainer"
        sx={{ mx: { md: 7 }, mt: { md: 3 } }}
      >
        <Box
          display="grid"
          gridTemplateColumns="1fr 1fr 1fr"
          gridTemplateRows="auto auto auto"
          width="100%"
          alignItems="center"
        >
          <Hidden mdDown>
            <Box flex={1} flexBasis="30%">
              <Link to="/">
                <SaddleLogo />
              </Link>
            </Box>
          </Hidden>
          <ul className="nav" style={{ textAlign: "center" }}>
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
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <RewardsButton setCurrentModal={setCurrentModal} />
            <Web3Status />
            <NetworkDisplay onClick={handleSettingMenu} />
            <Button size="small" onClick={handleSettingMenu}>
              <MoreVert />
            </Button>
          </Stack>
        </Box>

        <SiteSettingsMenu
          key="buttonSettings"
          anchorEl={anchorEl ?? undefined}
        />

        <TokenClaimDialog
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
      variant="contained"
      color="info"
      data-testid="rewardButton"
      onClick={() => setCurrentModal("tokenClaim")}
      endIcon={<SaddleLogo width={24} height={24} />}
    >
      {formattedTotal}{" "}
    </Button>
  ) : null
}

export default TopMenu
