import {
  AppBar,
  Box,
  Button,
  Hidden,
  IconButton,
  Stack,
  Toolbar,
  styled,
  useTheme,
} from "@mui/material"
import { IS_SDL_LIVE, SDL_TOKEN } from "../constants"
import { NavLink, NavLinkProps, useLocation } from "react-router-dom"
import React, { ReactElement, useContext, useState } from "react"

import { AppState } from "../state"
import { IS_DEVELOPMENT } from "../utils/environment"
import { MoreVert } from "@mui/icons-material"
import NetworkDisplay from "./NetworkDisplay"
import { RewardsBalancesContext } from "../providers/RewardsBalancesProvider"
import { ReactComponent as SaddleLogo } from "../assets/icons/logo.svg"
import SiteSettingsMenu from "./SiteSettingsMenu"
import TokenClaimDialog from "./TokenClaimDialog"
import Web3Status from "./Web3Status"
import { areGaugesActive } from "../utils/gauges"
import { formatBNToShortString } from "../utils"
import { useActiveWeb3React } from "../hooks"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

type ActiveTabType = "" | "pools" | "risk" | "vesdl" | "farm"

const NavMenu = styled(NavLink)<NavLinkProps & { selected: boolean }>(
  ({ theme, selected }) => {
    return {
      fontWeight: selected ? "bold" : "normal",
      textDecoration: "none",
      fontSize: theme.typography.h3.fontSize,
      color: theme.palette.text.primary,
    }
  },
)

function TopMenu(): ReactElement {
  const { t } = useTranslation()
  const { chainId } = useActiveWeb3React()
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const theme = useTheme()
  const { pathname } = useLocation()
  const activeTab = pathname.split("/")[1] as ActiveTabType
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)
  const sdlPrice = tokenPricesUSD?.[SDL_TOKEN.symbol]
  const handleSettingMenu = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    setAnchorEl(event.currentTarget)
  }
  const gaugesAreActive = areGaugesActive(chainId)
  return (
    <AppBar position="static" elevation={0}>
      <Toolbar
        data-testid="topMenuContainer"
        sx={{ mx: { md: 7 }, mt: { md: 3 } }}
      >
        <Box display="flex" width="100%" alignItems="center">
          <Hidden lgDown>
            <Box flex={{ xl: 1 }}>
              <NavLink to="/">
                <SaddleLogo />
              </NavLink>
            </Box>
          </Hidden>
          <Stack
            position={{ xs: "fixed", lg: "static" }}
            bottom={{ xs: theme.spacing(4) }}
            right="50%"
            flex={1}
            direction="row"
            spacing={5}
            justifyContent="center"
            sx={{
              transform: { xs: "translate(50%, -50%)", lg: "none" },
              zIndex: 1000,
            }}
            bgcolor={{ xs: theme.palette.background.paper, lg: "transparent" }}
            border={{
              xs: `1px solid ${theme.palette.other.divider}`,
              lg: "none",
            }}
            borderRadius={1}
            padding={theme.spacing(1, 3)}
          >
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

            {gaugesAreActive && (
              <NavMenu to="/farm" selected={activeTab === "farm"}>
                {t("farm")}
              </NavMenu>
            )}

            {IS_DEVELOPMENT && (
              <NavMenu to="/vesdl" selected={activeTab === "vesdl"}>
                {t("veSdl")}
              </NavMenu>
            )}

            <NavMenu to="/risk" selected={activeTab === "risk"}>
              {t("risk")}
            </NavMenu>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            flex={1}
            justifyContent={{ xs: "center", lg: "flex-end" }}
            alignItems="center"
          >
            <SDLPrice sdlPrice={sdlPrice} />
            <RewardsButton setCurrentModal={setCurrentModal} />
            <Web3Status />
            <NetworkDisplay onClick={handleSettingMenu} />
            <IconButton
              onClick={handleSettingMenu}
              data-testid="settingsMenuBtn"
              sx={{
                minWidth: 0,
                padding: 0,
                backgroundColor: theme.palette.background.default,
                borderRadius: theme.spacing(1),
              }}
            >
              <MoreVert
                htmlColor={theme.palette.text.primary}
                fontSize="large"
              />
            </IconButton>
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

interface SDLPriceProps {
  sdlPrice: number | undefined
}

function SDLPrice({ sdlPrice }: SDLPriceProps): ReactElement | null {
  if (sdlPrice === undefined) return null

  const SUSHI_WETH_SDL_POOL_URL =
    "https://app.sushi.com/analytics/pools/0x0c6f06b32e6ae0c110861b8607e67da594781961?chainId=1"
  return (
    <Button
      variant="contained"
      color="info"
      data-testid="sdlPriceButton"
      href={SUSHI_WETH_SDL_POOL_URL}
      target="_blank"
      startIcon={<SaddleLogo width={20} height={20} />}
      style={{ minWidth: 100 }}
    >
      {`$${sdlPrice.toFixed(2)}`}
    </Button>
  )
}

export default TopMenu
