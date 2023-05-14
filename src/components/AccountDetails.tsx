import {
  Box,
  Button,
  DialogContent,
  Link,
  Stack,
  Typography,
} from "@mui/material"
import React, { ReactElement, useContext } from "react"
import { commify, formatBNToString } from "../utils"
import { useAccount, useDisconnect, useNetwork } from "wagmi"

import Copy from "./Copy"
import DisconnectIcon from "@mui/icons-material/ExitToApp"
import Identicon from "./Identicon"
import LaunchIcon from "@mui/icons-material/Launch"
import Transactions from "./Transactions"
import { UserStateContext } from "../providers/UserStateProvider"
import { Zero } from "@ethersproject/constants"
import { getMultichainScanLink } from "../utils/getEtherscanLink"
import { shortenAddress } from "../utils/shortenAddress"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { useUDName } from "../hooks/useUDName"

export default function AccountDetail(): ReactElement {
  const { t } = useTranslation()
  const { address, connector } = useAccount()
  const { chain } = useNetwork()
  const { disconnect } = useDisconnect()
  const userState = useContext(UserStateContext)
  const udName = useUDName()

  const nativeToken = chain?.nativeCurrency
  const chainId = chain?.id

  const ethBalanceFormatted = commify(
    formatBNToString(
      userState?.tokenBalances?.[nativeToken?.symbol || "ETH"] || Zero,
      18,
      6,
    ),
  )

  const connectorName = connector?.name
  const theme = useTheme()

  const handleDisconnect = () => {
    disconnect()
  }

  return (
    <Box data-testid="accountDetailContainer">
      <DialogContent>
        <Typography variant="h2" mb={2}>
          {t("account")}
        </Typography>
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
              {udName || (address && shortenAddress(address))}
            </Typography>
            {chainId && address && (
              <Link
                href={getMultichainScanLink(chainId, address, "address")}
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
        </Box>
        <Box display="flex" gap="16px" justifyContent="space-between" mt="16px">
          <Box display="flex" alignItems="center">
            {address && <Copy toCopy={address} />}
          </Box>
          <Button onClick={handleDisconnect} startIcon={<DisconnectIcon />}>
            {t("disconnect")}
          </Button>
        </Box>
      </DialogContent>
      <Box bgcolor={theme.palette.background.paper} p={3}>
        <Transactions />
      </Box>
    </Box>
  )
}
