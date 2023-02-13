import {
  Box,
  Collapse,
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem as MuiMenuItem,
  styled,
} from "@mui/material"
import {
  ChainId,
  DEV_SUPPORTED_NETWORKS,
  SUPPORTED_NETWORKS,
} from "../constants/networks"
import {
  ExpandLess,
  ExpandMore,
  LightMode,
  NightlightRound,
} from "@mui/icons-material"
import { IS_L2_SUPPORTED, IS_SDL_LIVE, SDL_TOKEN } from "../constants"
import React, { ReactElement, useState } from "react"

import CheckIcon from "@mui/icons-material/Check"
import { IS_DEVELOPMENT } from "../utils/environment"
import { ReactComponent as SaddleLogo } from "../assets/icons/logo.svg"
import { extractAddEthereumChainArgs } from "../utils"
import { useActiveWeb3React } from "../hooks"
import useAddTokenToMetamask from "../hooks/useAddTokenToMetamask"
import { useThemeSettings } from "../providers/ThemeSettingsProvider"
import { useTranslation } from "react-i18next"

const MenuItem = styled(MuiMenuItem)({
  display: "flex",
  justifyContent: "space-between",
})

interface SiteSettingsMenuProps {
  anchorEl?: Element
  close?: () => void
  direction?: "right" | "left"
}
export default function SiteSettingsMenu({
  anchorEl,
  close,
  direction = "right",
}: SiteSettingsMenuProps): ReactElement {
  const open = Boolean(anchorEl)
  return (
    <Menu
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: direction,
        vertical: "bottom",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: direction,
      }}
      data-testid="settingsMenuContainer"
      onClose={close}
      PaperProps={{ sx: { minWidth: 240 } }}
    >
      <Box>
        {IS_L2_SUPPORTED && <NetworkSection key="network" />}
        <Divider variant="middle" />
        <LanguageSection key="language" />
        <Divider variant="middle" />
        <ThemeSection key="theme" />
        {IS_SDL_LIVE && <AddTokenSection key="token" />}
      </Box>
    </Menu>
  )
}

function AddTokenSection(): ReactElement | null {
  const { addToken, canAdd } = useAddTokenToMetamask({
    ...SDL_TOKEN,
  })
  const { t } = useTranslation()

  return canAdd ? (
    <MenuItem onClick={() => addToken()}>
      <span>{t("addSDL")}</span> <SaddleLogo height={24} width={24} />
    </MenuItem>
  ) : null
}

function NetworkSection(): ReactElement {
  const { t } = useTranslation()
  const { chainId: activeChainId, library, account } = useActiveWeb3React()
  const [isNetworkVisible, setIsNetworkVisible] = useState(false)
  const networks = (
    IS_DEVELOPMENT
      ? Object.values(DEV_SUPPORTED_NETWORKS)
      : Object.values(SUPPORTED_NETWORKS)
  ).sort((a, b) => a.chainName.localeCompare(b.chainName))

  return (
    <div data-testid="networkMenuContainer">
      <MenuItem
        data-testid="networkMenuTitle"
        onClick={() => setIsNetworkVisible((state) => !state)}
      >
        {t("network")} {isNetworkVisible ? <ExpandLess /> : <ExpandMore />}
      </MenuItem>
      <Collapse in={isNetworkVisible}>
        {networks.map((network) => {
          return network ? (
            <ListItemButton
              onClick={() => {
                if (Number(network.chainId) === ChainId.MAINNET) {
                  void library?.send("wallet_switchEthereumChain", [
                    { chainId: "0x1" },
                    account,
                  ])
                } else {
                  void library?.send("wallet_addEthereumChain", [
                    extractAddEthereumChainArgs(network),
                    account,
                  ])
                }
              }}
              key={network.chainId}
            >
              <ListItemIcon sx={{ ml: 2 }}>
                {activeChainId === Number(network.chainId) && (
                  <CheckIcon fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText primary={network?.chainName} />
            </ListItemButton>
          ) : null
        })}
      </Collapse>
    </div>
  )
}

function LanguageSection(): ReactElement {
  const { t, i18n } = useTranslation()

  const [isLanguageVisible, setIsLanguageVisible] = useState(false)
  const languageOptions = [
    { displayText: "English", i18nKey: "en" },
    { displayText: "简体中文", i18nKey: "zh" },
  ]
  const currentLanguage = i18n.language
  return (
    <div>
      <MenuItem
        data-testid="languageMenu"
        onClick={() => setIsLanguageVisible((state) => !state)}
      >
        {t("language")}
        {isLanguageVisible ? <ExpandLess /> : <ExpandMore />}
      </MenuItem>
      <Collapse in={isLanguageVisible} data-testid="languageMenuContainer">
        {languageOptions.map(({ displayText, i18nKey }) => (
          <ListItemButton
            onClick={() => void i18n.changeLanguage(i18nKey)}
            key={displayText}
          >
            <ListItemIcon sx={{ ml: 2 }}>
              {currentLanguage === i18nKey && <CheckIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText primary={displayText} />
          </ListItemButton>
        ))}
      </Collapse>
    </div>
  )
}

function ThemeSection(): ReactElement {
  const { t } = useTranslation()
  const { themeMode, onChangeMode } = useThemeSettings()

  const handleChangeMode = () => {
    onChangeMode(themeMode === "dark" ? "light" : "dark")
  }

  return (
    <MenuItem data-testid="themeMenuOption" onClick={handleChangeMode}>
      {t("theme")} {themeMode === "dark" ? <NightlightRound /> : <LightMode />}
    </MenuItem>
  )
}
