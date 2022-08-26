import {
  Box,
  Button,
  DialogContent,
  Link,
  Stack,
  Typography,
} from "@mui/material"
import { ChainId, SUPPORTED_WALLETS } from "../constants"
import React, { ReactElement, useContext } from "react"
import { commify, formatBNToString } from "../utils"
import { useAccount, useNetwork } from "wagmi"

import ChangeIcon from "@mui/icons-material/ImportExport"
import Copy from "./Copy"
import Identicon from "./Identicon"
import LaunchIcon from "@mui/icons-material/Launch"
import { NETWORK_NATIVE_TOKENS } from "../constants/networks"
import Transactions from "./Transactions"
import { UserStateContext } from "../providers/UserStateProvider"
import { Zero } from "@ethersproject/constants"
import { find } from "lodash"
import { getMultichainScanLink } from "../utils/getEtherscanLink"
import { shortenAddress } from "../utils/shortenAddress"
// import { useActiveWeb3React } from "../hooks"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { useUDName } from "../hooks/useUDName"

interface Props {
  openOptions: () => void
}

export default function AccountDetail({ openOptions }: Props): ReactElement {
  const { t } = useTranslation()
  // const { account, connector, chainId } = useActiveWeb3React()
  const { chain } = useNetwork()
  const { address, connector } = useAccount()
  //   onConnect({ address, connector, isReconnected }) {
  //     console.log("Connected", { address, connector, isReconnected })
  //   },
  // })
  const userState = useContext(UserStateContext)
  const udName = useUDName()
  const nativeToken = NETWORK_NATIVE_TOKENS[(chain?.id as ChainId) ?? 1]
  const ethBalanceFormatted = commify(
    formatBNToString(userState?.tokenBalances?.[nativeToken] || Zero, 18, 6),
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
            {chain?.id && address && (
              <Link
                href={getMultichainScanLink(chain.id, address, "address")}
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
            {address && <Copy toCopy={address} />}
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
      <Box bgcolor={theme.palette.background.paper} p={3}>
        <Transactions />
      </Box>
    </Box>
  )
}
