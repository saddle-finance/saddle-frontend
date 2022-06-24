import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { IS_SDL_LIVE, SDL_TOKEN } from "../constants"
import { Menu as MenuIcon, MoreVert } from "@mui/icons-material"
import { NavLink, NavLinkProps, useLocation } from "react-router-dom"
import React, { ReactElement, useContext, useState } from "react"

import { AppState } from "../state"
import NetworkDisplay from "./NetworkDisplay"
import { RewardsBalancesContext } from "../providers/RewardsBalancesProvider"
import { ReactComponent as SaddleLogo } from "../assets/icons/logo.svg"
import SiteSettingsMenu from "./SiteSettingsMenu"
import TokenClaimDialog from "./TokenClaimDialog"
// import Web3Status from "./Web3Status"
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
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)
  const sdlPrice = tokenPricesUSD?.[SDL_TOKEN.symbol]
  const handleSettingMenu = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    setAnchorEl(event.currentTarget)
  }
  const handleMoreMenu = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    if (isMobile) {
      setDrawerOpen(true)
    } else {
      handleSettingMenu(event)
    }
  }
  return (
    <AppBar position="static" elevation={0}>
      <Toolbar
        data-testid="topMenuContainer"
        sx={{ mx: { md: 7 }, mt: { md: 3 } }}
      >
        <Box display="flex" width="100%" alignItems="center">
          <Box flex={{ xl: 1 }}>
            <NavLink to="/">
              <SaddleLogo />
            </NavLink>
          </Box>

          <Stack
            display={{ xs: "none", lg: "flex" }}
            bottom={{ xs: theme.spacing(4) }}
            right="50%"
            flex={1}
            direction="row"
            spacing={5}
            justifyContent="center"
            padding={theme.spacing(1, 3)}
          >
            <MenuList />
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            flex={1}
            justifyContent="flex-end"
            alignItems="center"
          >
            <SDLPrice sdlPrice={sdlPrice} />
            <RewardsButton setCurrentModal={setCurrentModal} />
            {/* <Web3Status /> */}
            <NetworkDisplay onClick={handleSettingMenu} />
            <IconButton
              onClick={handleMoreMenu}
              data-testid="settingsMenuBtn"
              sx={{
                minWidth: 0,
                padding: 0.5,
                backgroundColor: theme.palette.background.default,
                borderRadius: theme.spacing(1),
              }}
            >
              <MoreVert
                htmlColor={theme.palette.text.primary}
                sx={{ display: { xs: "none", md: "block" } }}
              />
              <MenuIcon sx={{ display: { xs: "block", md: "none", p: 1 } }} />
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
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          anchor="right"
          PaperProps={{ sx: { borderWidth: 0, borderRadius: 0 } }}
        >
          <Stack gap={3} p={(theme) => theme.spacing(5, 5, 0, 8)}>
            <MenuList />
          </Stack>
        </Drawer>
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

function MenuList() {
  const { t } = useTranslation()
  const { chainId } = useActiveWeb3React()
  const gaugesAreActive = areGaugesActive(chainId)
  const { pathname } = useLocation()
  const activeTab = pathname.split("/")[1] as ActiveTabType
  return (
    <React.Fragment>
      <NavMenu data-testid="swapNavLink" to="/" selected={activeTab === ""}>
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

      {gaugesAreActive && (
        <NavMenu to="/vesdl" selected={activeTab === "vesdl"}>
          {t("veSdl")}
        </NavMenu>
      )}

      <NavMenu to="/risk" selected={activeTab === "risk"}>
        {t("risk")}
      </NavMenu>
    </React.Fragment>
  )
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
