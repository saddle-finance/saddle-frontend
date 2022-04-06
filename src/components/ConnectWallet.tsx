import {
  Box,
  Button,
  DialogContent,
  Link,
  Stack,
  Typography,
  useTheme,
} from "@mui/material"
import React, { ReactElement } from "react"
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core"
import DialogTitle from "./DialogTitle"
import { SUPPORTED_WALLETS } from "../constants"
import { logEvent } from "../utils/googleAnalytics"
import { map } from "lodash"
import { useTranslation } from "react-i18next"

interface Props {
  onClose: () => void
}

function ConnectWallet({ onClose }: Props): ReactElement {
  const { t } = useTranslation()
  const { activate } = useWeb3React()
  const theme = useTheme()

  return (
    <Box mt={3} data-testid="connectWalletContainer">
      <DialogTitle variant="h2">{t("connectWallet")}</DialogTitle>
      <DialogContent sx={{ padding: 4 }}>
        <Stack my={3} ml={1} spacing={2}>
          {map(SUPPORTED_WALLETS, (wallet, index) => (
            <Button
              key={index}
              fullWidth
              variant="outlined"
              color="inherit"
              size="large"
              onClick={(): void => {
                activate(wallet.connector, undefined, true).catch((error) => {
                  if (error instanceof UnsupportedChainIdError) {
                    void activate(wallet.connector) // a little janky...can't use setError because the connector isn't set
                  } else {
                    // TODO: handle error
                  }
                })
                logEvent("change_wallet", { name: wallet.name })
                onClose()
              }}
              endIcon={
                <img
                  src={wallet.icon}
                  alt="icon"
                  className="icon"
                  width="24px"
                />
              }
              sx={{
                justifyContent: "space-between",
                padding: 2,
                borderColor: theme.palette.grey[300],
              }}
            >
              <span>{wallet.name}</span>
            </Button>
          ))}
        </Stack>
        <Typography variant="body1">
          {t("dontHaveWallet") + " "}
          <Link
            color="primary"
            href="https://ethereum.org/en/wallets/"
            target="blank"
          >
            {t("getWallet")}
          </Link>
        </Typography>
      </DialogContent>
    </Box>
  )
}

export default ConnectWallet
