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
import { commify, formatBNToString } from "../utils"
import ChangeIcon from "@mui/icons-material/ImportExport"
import Copy from "./Copy"
import Davatar from "@davatar/react"
import DialogTitle from "./DialogTitle"
import LaunchIcon from "@mui/icons-material/Launch"
import { SUPPORTED_WALLETS } from "../constants"
import Transactions from "./Transactions"
import { Zero } from "@ethersproject/constants"
import { find } from "lodash"
import { getEtherscanLink } from "../utils/getEtherscanLink"
import { shortenAddress } from "../utils/shortenAddress"
import { useActiveWeb3React } from "../hooks"
import { usePoolTokenBalances } from "../state/wallet/hooks"
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

  const connectorName = find(SUPPORTED_WALLETS, ["connector", connector])?.name
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
            <Davatar
              size={24}
              address={account || ""}
              generatedAvatarType="jazzicon"
            />
            <Typography variant="subtitle1">
              {account && shortenAddress(account)}
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
            {account && <Copy toCopy={account}>{t("copyAddress")}</Copy>}
          </Box>
          <Box display="flex" alignItems="center">
            <Button
              onClick={() => {
                openOptions()
              }}
              startIcon={<ChangeIcon />}
              data-testid="changeAccount"
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
