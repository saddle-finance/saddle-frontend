import {
  AppBar,
  Box,
  Button,
  Hidden,
  Stack,
  Toolbar,
  styled,
  useTheme,
} from "@mui/material"
import { NavLink, NavLinkProps, useLocation } from "react-router-dom"
import React, { ReactElement, useContext, useState } from "react"

import { IS_SDL_LIVE } from "../constants"
import { MoreVert } from "@mui/icons-material"
import NetworkDisplay from "./NetworkDisplay"
import { RewardsBalancesContext } from "../providers/RewardsBalancesProvider"
import { ReactComponent as SaddleLogo } from "../assets/icons/logo.svg"
import SiteSettingsMenu from "./SiteSettingsMenu"
import TokenClaimDialog from "./TokenClaimDialog"
import Web3Status from "./Web3Status"
import { formatBNToShortString } from "../utils"
import { useTranslation } from "react-i18next"

type ActiveTabType = "" | "pools" | "risk"

const NavMenu = styled(NavLink)<NavLinkProps & { selected: boolean }>(
  ({ theme, selected }) => {
    return {
      fontWeight: selected ? "bold" : "normal",
      textDecoration: "none",
      fontSize: 20,
      color: theme.palette.text.primary,
    }
  },
)

function TopMenu(): ReactElement {
  const { t } = useTranslation()
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const theme = useTheme()
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
          gridTemplateColumns="1fr auto 1fr"
          gridTemplateRows="auto auto auto"
          width="100%"
          alignItems="center"
        >
          <Hidden mdDown>
            <Box flex={1} flexBasis="30%">
              <NavLink to="/">
                <SaddleLogo />
              </NavLink>
            </Box>
          </Hidden>
          <Stack direction="row" spacing={5} justifyContent="center">
            <NavMenu
              data-testid="swapNavLink"
              to="/"
              selected={activeTab === ""}
            >
              {t("swap")}
            </NavMenu>

            <NavMenu to="/pools" selected={activeTab === "pools"}>
              {t("pools")}
            </NavMenu>

            <NavMenu to="/risk" selected={activeTab === "risk"}>
              {t("risk")}
            </NavMenu>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            justifyContent="flex-end"
            alignItems="center"
          >
            <RewardsButton setCurrentModal={setCurrentModal} />
            <Web3Status />
            <NetworkDisplay onClick={handleSettingMenu} />
            <Button
              color="secondaryLight"
              variant="contained"
              onClick={handleSettingMenu}
              sx={{ minWidth: 0, padding: 0 }}
            >
              <MoreVert
                htmlColor={theme.palette.text.primary}
                fontSize="large"
              />
            </Button>
          </Stack>
        </Box>

        <SiteSettingsMenu
          key="buttonSettings"
          anchorEl={anchorEl ?? undefined}
          close={() => setAnchorEl(null)}
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
      endIcon={<SaddleLogo width={20} height={20} />}
    >
      {formattedTotal}
    </Button>
  ) : null
}

export default TopMenu
