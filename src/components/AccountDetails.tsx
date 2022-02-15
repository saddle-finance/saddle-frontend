import {
  Box,
  Button,
  DialogContent,
  Link,
  Stack,
  Typography,
} from "@mui/material"
import React, { ReactElement, useEffect, useState } from "react"
import { commify, formatBNToString } from "../utils"

import ChangeIcon from "@mui/icons-material/ImportExport"
import Copy from "./Copy"
import DialogTitle from "./DialogTitle"
import Identicon from "./Identicon"
import LaunchIcon from "@mui/icons-material/Launch"
import { SUPPORTED_WALLETS } from "../constants"
import Transactions from "./Transactions"
import { Zero } from "@ethersproject/constants"
import { find } from "lodash"
import { getEtherscanLink } from "../utils/getEtherscanLink"
import { shortenAddress } from "../utils/shortenAddress"
import { uauth } from "../connectors"
import { useActiveWeb3React } from "../hooks"
import { usePoolTokenBalances } from "../state/wallet/hooks"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"

interface Props {
  openOptions: () => void
  onClose?: () => void
}

export default function AccountDetail({
  openOptions,
  onClose,
}: Props): ReactElement {
  const { t } = useTranslation()
  const { account, connector } = useActiveWeb3React()
  const tokenBalances = usePoolTokenBalances()
  const ethBalanceFormatted = commify(
    formatBNToString(tokenBalances?.ETH || Zero, 18, 6),
  )
  const [user, setUser] = useState<string>("")

  const connectorName = find(SUPPORTED_WALLETS, ["connector", connector])?.name
  useEffect(() => {
    const checkUDName = async () => {
      if (connectorName === "Unstoppable Domains") {
        const userUD = await uauth.uauth.user()
        setUser(userUD.sub)
      }
    }
    void checkUDName()
    return () => {
      setUser("")
    }
  }, [connectorName])
  const theme = useTheme()

  return (
    <Box
      data-testid="accountDetailContainer"
      bgcolor={
        theme.palette.mode === "light"
          ? theme.palette.common.white
          : theme.palette.common.black
      }
    >
      <DialogTitle onClose={onClose}>
        <Typography variant="h3">{t("account")}</Typography>
      </DialogTitle>
      <DialogContent>
        <Box
          display="grid"
          gridTemplateColumns="1fr 1fr"
          gridTemplateRows="auto auto"
          rowGap={2}
        >
          <Typography variant="body2" color="text.secondary">
            {t("connectedWith")}&nbsp;
            {connectorName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("balance")}
          </Typography>

          <Stack direction="row" spacing={1}>
            <Identicon />
            <Typography variant="subtitle1">
              {user || (account && shortenAddress(account))}
            </Typography>
            {account && (
              <Link
                href={getEtherscanLink(account, "address")}
                target="_blank"
                rel="noreferrer"
              >
                <LaunchIcon fontSize="inherit" />
              </Link>
            )}
          </Stack>
          <Box>
            <Typography variant="subtitle1">
              {ethBalanceFormatted}&#926;
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            {account && <Copy toCopy={account} />}
          </Box>
          <Box display="flex" alignItems="center">
            <Button
              onClick={() => {
                openOptions()
              }}
              startIcon={<ChangeIcon />}
              data-testid="changeAccountBtn"
            >
              {t("changeAccount")}
            </Button>
          </Box>
        </Box>
      </DialogContent>
      {/* Change hardcoded color with theme color after definining design */}
      <Box
        bgcolor={
          theme.palette.mode == "light"
            ? theme.palette.background.paper
            : "#333"
        }
        p={3}
      >
        <Transactions />
      </Box>
    </Box>
  )
}
