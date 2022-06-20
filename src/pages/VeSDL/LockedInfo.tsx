import { Box, Paper, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import {
  useSdlContract,
  useVotingEscrowContract,
} from "../../hooks/useContract"

import { BigNumber } from "@ethersproject/bignumber"
import { ChainId } from "../../constants"
import { formatBNToShortString } from "../../utils"
import { useActiveWeb3React } from "../../hooks"
import { useTranslation } from "react-i18next"

// TODO add avgLockTime data
export default function LockedInfo(): JSX.Element {
  const { t } = useTranslation()
  const { account, chainId, library } = useActiveWeb3React()

  const votingEscrowContract = useVotingEscrowContract()
  const sdlContract = useSdlContract()
  const [aggSDLInfo, setAggSDLInfo] = useState<{
    sdlLocked: BigNumber
    totalVeSDL: BigNumber
  } | null>(null)

  useEffect(() => {
    // TODO move to API to work cross-chain
    async function fetchSDLInfo() {
      if (
        !library ||
        (chainId !== ChainId.MAINNET && chainId !== ChainId.HARDHAT) ||
        !account ||
        !sdlContract ||
        !votingEscrowContract
      )
        return
      const [totalVeSDL, sdlLocked] = await Promise.all([
        votingEscrowContract["totalSupply()"](),
        sdlContract.balanceOf(votingEscrowContract.address),
      ])
      setAggSDLInfo({
        sdlLocked,
        totalVeSDL,
      })
    }
    void fetchSDLInfo()
  }, [account, chainId, library, sdlContract, votingEscrowContract])

  return (
    <Paper sx={{ display: "flex", p: 2 }}>
      <Box flex={1}>
        <Typography>{t("sdlLocked")}</Typography>
        <Typography variant="subtitle1">
          {aggSDLInfo ? formatBNToShortString(aggSDLInfo.sdlLocked, 18) : "-"}
        </Typography>
      </Box>
      <Box flex={1}>
        <Typography>{t("totalVeSDL")}</Typography>
        <Typography variant="subtitle1">
          {aggSDLInfo ? formatBNToShortString(aggSDLInfo.totalVeSDL, 18) : "-"}
        </Typography>
      </Box>
      {/* <Box flex={1}>
        <Typography>{t("avgLockTime")}</Typography>
        <Typography variant="subtitle1">{"-"}</Typography>
      </Box> */}
    </Paper>
  )
}
