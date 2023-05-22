import { Box, Button, IconButton, useTheme } from "@mui/material"
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit"
import React, { ReactElement, useState } from "react"

import AccountDetails from "./AccountDetails"
import Dialog from "./Dialog"
import { useAccount } from "wagmi"
const Web3Status = (): ReactElement => {
  const [modalOpen, setModalOpen] = useState(false)
  const account = useAccount()
  const theme = useTheme()
  const { openConnectModal } = useConnectModal()

  const handleAccountButton = () => {
    if (account.isConnected) {
      setModalOpen(true)
    } else {
      openConnectModal?.()
    }
  }

  return (
    <ConnectButton.Custom>
      {({ account, chain, openChainModal, authenticationStatus, mounted }) => {
        const ready = mounted && authenticationStatus !== "loading"
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    variant="outlined"
                    onClick={openConnectModal}
                    color="secondary"
                  >
                    Connect Wallet
                  </Button>
                )
              }

              if (chain.unsupported) {
                return (
                  <Button
                    variant="contained"
                    onClick={openChainModal}
                    color="error"
                  >
                    Wrong network
                  </Button>
                )
              }

              return (
                <Box>
                  <Button
                    variant={connected ? "contained" : "outlined"}
                    color="secondary"
                    onClick={handleAccountButton}
                    type="button"
                  >
                    {connected ? account.displayName : "Connect Wallet"}
                  </Button>
                  <IconButton
                    onClick={openChainModal}
                    sx={{
                      minWidth: 0,
                      padding: 0.5,
                      backgroundColor: theme.palette.background.default,
                      borderRadius: theme.spacing(1),
                    }}
                  >
                    {chain.hasIcon && chain.iconUrl && (
                      <img
                        alt={chain.name ?? "Chain icon"}
                        src={chain.iconUrl}
                      />
                    )}
                  </IconButton>
                </Box>
              )
            })()}

            <Dialog
              open={modalOpen}
              onClose={(): void => setModalOpen(false)}
              maxWidth="sm"
              fullWidth
            >
              <AccountDetails />
            </Dialog>
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

export default Web3Status
