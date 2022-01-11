import {
  Box,
  Button,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  useTheme,
} from "@mui/material"
import React, { ReactElement } from "react"
import { commify, formatBNToString } from "../utils"
import { ReactComponent as ChangeIcon } from "../assets/icons/accountChange.svg"
import Copy from "./Copy"
import Davatar from "@davatar/react"
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
}

export default function AccountDetail({ openOptions }: Props): ReactElement {
  const { t } = useTranslation()
  const { account, connector } = useActiveWeb3React()
  const tokenBalances = usePoolTokenBalances()
  const ethBalanceFormatted = commify(
    formatBNToString(tokenBalances?.ETH || Zero, 18, 6),
  )

  const connectorName = find(SUPPORTED_WALLETS, ["connector", connector])?.name
  const theme = useTheme()

  return (
    <div className="accountDetail">
      <DialogTitle>
        <Typography variant="h3">{t("account")}</Typography>
      </DialogTitle>
      <DialogContent>
        <Box
          display="grid"
          gridTemplateColumns="1fr 1fr"
          gridTemplateRows="auto auto"
          rowGap={2}
        >
          {/* TODO change color with text color of theme after confirming */}
          <Typography variant="caption" color="#686868">
            {t("connectedWith")}&nbsp;
            {connectorName}
          </Typography>
          <Typography variant="caption" color="#686868">
            {t("balance")}
          </Typography>

          <Stack direction="row" spacing={1}>
            <Davatar
              size={24}
              address={account || ""}
              generatedAvatarType="jazzicon"
            />
            <Typography>{account && shortenAddress(account)}</Typography>
            {account && (
              <a
                href={getEtherscanLink(account, "address")}
                target="_blank"
                rel="noreferrer"
              >
                {/* link icon */}
                <LaunchIcon fontSize="inherit" />
              </a>
            )}
          </Stack>
          <Box>
            <Typography>{ethBalanceFormatted}&#926;</Typography>
          </Box>
          <Box display="flex" alignItems="center">
            {account && <Copy toCopy={account}>{t("copyAddress")}</Copy>}
          </Box>
          <Box display="flex" alignItems="center">
            <Button
              color="info"
              onClick={() => {
                openOptions()
              }}
              startIcon={<ChangeIcon color={theme.palette.info.main} />}
            >
              {t("changeAccount")}
            </Button>
          </Box>
        </Box>
      </DialogContent>
      {/* Change hardcoded color with theme color after definining design */}
      <Box bgcolor={theme.palette.mode == "light" ? "#dfdde3" : "#333"} p={3}>
        <Transactions />
      </Box>
    </div>
  )
}
