// import { Box, Button } from "@mui/material"
// import { Button, Typography } from "@mui/material"
import React, { ReactElement, useEffect, useState } from "react"

import AccountDetails from "./AccountDetails"
import { Button } from "@mui/material"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import ConnectWallet from "./ConnectWallet"
import Dialog from "./Dialog"
// import Identicon from "./Identicon"
// import { shortenAddress } from "../utils/shortenAddress"
// import { useENS } from "../hooks/useENS"
// import { useTranslation } from "react-i18next"
// import { useUDName } from "../hooks/useUDName"
import { useWeb3React } from "@web3-react/core"

const WALLET_VIEWS = {
  OPTIONS: "options",
  ACCOUNT: "account",
}

const Web3Status = (): ReactElement => {
  const { account } = useWeb3React()
  const [modalOpen, setModalOpen] = useState(false)
  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)
  // const { t } = useTranslation()
  // const { data: ensName } = useENS(account)
  // const udName = useUDName()

  // always reset to account view
  useEffect(() => {
    if (modalOpen) {
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [modalOpen])

  return (
    <div data-testid="walletStatusContainer">
      {/* <Button
        variant={account ? "contained" : "outlined"}
        color={account ? "mute" : "secondary"}
        onClick={(): void => setModalOpen(true)}
        data-testid="accountDetailButton"
        endIcon={account && <Identicon />}
      >
        <Typography variant="body1" whiteSpace="nowrap">
          {account
            ? udName || ensName || shortenAddress(account)
            : t("connectWallet")}
        </Typography>
      </Button> */}
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          return (
            <div
              {...(!mounted && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
            >
              {(() => {
                if (!mounted || !account || !chain) {
                  return (
                    <button onClick={openConnectModal} type="button">
                      Connect Wallet
                    </button>
                  )
                }

                if (chain.unsupported) {
                  return (
                    <button onClick={openChainModal} type="button">
                      Wrong network
                    </button>
                  )
                }

                return (
                  <div style={{ display: "flex", gap: 12 }}>
                    <Button
                      onClick={openChainModal}
                      style={{ display: "flex", alignItems: "center" }}
                      type="button"
                      variant={account ? "contained" : "outlined"}
                      color={account ? "mute" : "secondary"}
                      data-testid="accountDetailButton"
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 12,
                            height: 12,
                            borderRadius: 999,
                            overflow: "hidden",
                            marginRight: 4,
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? "Chain icon"}
                              src={chain.iconUrl}
                              style={{ width: 12, height: 12 }}
                            />
                          )}
                        </div>
                      )}
                      {chain.name}
                    </Button>

                    <button onClick={openAccountModal} type="button">
                      {account.displayName}
                      {account.displayBalance
                        ? ` (${account.displayBalance})`
                        : ""}
                    </button>
                  </div>
                )
              })()}
            </div>
          )
        }}
      </ConnectButton.Custom>
      <Dialog
        open={modalOpen}
        onClose={(): void => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {account && walletView === WALLET_VIEWS.ACCOUNT ? (
          <AccountDetails
            openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
          />
        ) : (
          <ConnectWallet onClose={(): void => setModalOpen(false)} />
        )}
      </Dialog>
    </div>
  )
}

export default Web3Status
