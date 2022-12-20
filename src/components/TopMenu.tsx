import {
  AppBar,
  Box,
  Button,
  Divider,
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
import Web3Status from "./Web3Status"
import { areGaugesActive } from "../utils/gauges"
import { formatBNToShortString } from "../utils"
import { isMainnet } from "../hooks/useContract"
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
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    }
  },
)

function TopMenu(): ReactElement {
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const theme = useTheme()
  const isUnderLaptopSize = useMediaQuery(theme.breakpoints.down("lg"))
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
    if (isUnderLaptopSize) {
      setDrawerOpen(true)
    } else {
      handleSettingMenu(event)
    }
  }
  return (
    <AppBar position="static" elevation={0}>
      <Toolbar data-testid="topMenuContainer" sx={{ xs: 0, lg: 7 }}>
        <Box display="flex" width="100%" alignItems="center">
          <Box flex={1}>
            <NavLink to="/">
              <SaddleLogo height={isUnderLaptopSize ? "40px" : "100"} />
            </NavLink>
          </Box>

          <Stack
            display={isUnderLaptopSize ? "none" : "flex"}
            bottom={{ xs: theme.spacing(4) }}
            right="50%"
            flex={1}
            direction="row"
            spacing={4}
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
            <Box display={isUnderLaptopSize ? "none" : "block"}>
              <Web3Status />
            </Box>
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
                sx={{ display: isUnderLaptopSize ? "none" : "block" }}
              />
              <MenuIcon
                sx={{ display: !isUnderLaptopSize ? "none" : "block" }}
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
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          anchor="right"
          PaperProps={{ sx: { borderWidth: 0, borderRadius: 0 } }}
        >
          <Stack m={(theme) => theme.spacing(5, 5, 0, 8)}>
            <Stack onClick={() => setDrawerOpen(false)}>
              <MenuList />
            </Stack>
            <Divider />
            <Box py={2}>
              <Web3Status />
            </Box>
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { pathname } = useLocation()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const activeTab = pathname.split("/")[1] as ActiveTabType
  return (
    <React.Fragment>
      <NavMenu data-testid="swapNavLink" to="/" selected={activeTab === ""}>
        {t("swap")}
      </NavMenu>

      <NavMenu to="/pools" selected={activeTab === "pools"}>
        {t("pools")}
      </NavMenu>

      {areGaugesActive(chainId) && (
        <NavMenu to="/farm" selected={activeTab === "farm"}>
          {t("farm")}
        </NavMenu>
      )}

      {isMainnet(chainId) && (
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
    "https://ethereum.sushi.com/swap?inputCurrency=ETH&outputCurrency=0xf1Dc500FdE233A4055e25e5BbF516372BC4F6871"
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
