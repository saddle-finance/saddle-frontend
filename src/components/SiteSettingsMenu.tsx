import { ChainId, IS_L2_SUPPORTED, IS_SDL_LIVE, SDL_TOKEN } from "../constants"
import React, { ReactElement, useContext, useState } from "react"

import { ThemeContext } from "../providers/ThemeProvider"
import classnames from "classnames"
import logo from "../assets/icons/logo.svg"
import styles from "./SiteSettingsMenu.module.scss"
import { useActiveWeb3React } from "../hooks"
import useAddTokenToMetamask from "../hooks/useAddTokenToMetamask"
import { useTranslation } from "react-i18next"

export default function SiteSettingsMenu(): ReactElement {
  return (
    <div className={styles.container}>
      {IS_L2_SUPPORTED && <NetworkSection key="network" />}
      {IS_L2_SUPPORTED && <Divider />}
      <LanguageSection key="language" />
      <Divider />
      <ThemeSection key="theme" />
      {IS_SDL_LIVE && <Divider />}
      {IS_SDL_LIVE && <AddTokenSection key="token" />}
    </div>
  )
}

function Divider(): ReactElement {
  return <div className={styles.divider}></div>
}

function AddTokenSection(): ReactElement | null {
  const { addToken, canAdd } = useAddTokenToMetamask({
    ...SDL_TOKEN,
    icon: `${window.location.origin}/logo.svg`,
  })
  const { t } = useTranslation()

  return canAdd ? (
    <div className={styles.section}>
      <div className={styles.sectionTitle} onClick={() => addToken()}>
        <span>{t("addSDL")}</span> <img src={logo} className={styles.logo} />
      </div>
    </div>
  ) : null
}

// refer to https://github.com/sushiswap/sushiswap-interface/blob/canary/src/modals/NetworkModal/index.tsx#L13
export const SUPPORTED_NETWORKS: {
  [chainId in ChainId]?: {
    chainId: string
    chainName: string
    nativeCurrency: {
      name: string
      symbol: string
      decimals: number
    }
    rpcUrls: string[]
    blockExplorerUrls: string[]
  }
} = {
  [ChainId.MAINNET]: {
    chainId: "0x1",
    chainName: "Ethereum",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.infura.io/v3"],
    blockExplorerUrls: ["https://etherscan.com"],
  },
  [ChainId.ARBITRUM]: {
    chainId: "0xA4B1",
    chainName: "Arbitrum",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://mainnet-arb-explorer.netlify.app"],
  },
}
function NetworkSection(): ReactElement {
  const { t } = useTranslation()
  const { chainId: activeChainId, library, account } = useActiveWeb3React()
  const [isNetworkVisible, setIsNetworkVisible] = useState(false)
  const networks = [
    ChainId.MAINNET,
    ...(IS_L2_SUPPORTED ? [ChainId.ARBITRUM] : []),
  ]

  return (
    <div className={styles.section}>
      <div
        className={styles.sectionTitle}
        onClick={() => setIsNetworkVisible((state) => !state)}
      >
        <span>{t("network")}</span> <span>{isNetworkVisible ? "∧" : "∨"}</span>
      </div>
      {isNetworkVisible &&
        networks.map((chainId) => {
          const params = SUPPORTED_NETWORKS[chainId]

          return (
            <div
              className={classnames(styles.sectionItem, {
                [styles.active]: activeChainId === chainId,
              })}
              onClick={() => {
                if (chainId === ChainId.MAINNET) {
                  void library?.send("wallet_switchEthereumChain", [
                    { chainId: "0x1" },
                    account,
                  ])
                } else {
                  void library?.send("wallet_addEthereumChain", [
                    params,
                    account,
                  ])
                }
              }}
              key={chainId}
            >
              {params?.chainName}
            </div>
          )
        })}
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
    <div className={styles.section}>
      <div
        className={styles.sectionTitle}
        onClick={() => setIsLanguageVisible((state) => !state)}
      >
        <span>{t("language")}</span>{" "}
        <span>{isLanguageVisible ? "∧" : "∨"}</span>
      </div>
      {isLanguageVisible &&
        languageOptions.map(({ displayText, i18nKey }) => (
          <div
            className={classnames(styles.sectionItem, {
              [styles.active]: currentLanguage === i18nKey,
            })}
            onClick={() => i18n.changeLanguage(i18nKey)}
            key={displayText}
          >
            {displayText}
          </div>
        ))}
    </div>
  )
}

function ThemeSection(): ReactElement {
  const { t } = useTranslation()
  const { toggleTheme, userDarkMode } = useContext(ThemeContext)

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle} onClick={toggleTheme}>
        <span>{t("theme")}</span> <span>{userDarkMode ? "☾" : "☀"}</span>
      </div>
    </div>
  )
}
