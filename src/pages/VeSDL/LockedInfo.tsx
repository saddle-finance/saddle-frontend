import { Box, Paper, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import {
  useSdlContract,
  useVotingEscrowContract,
} from "../../hooks/useContract"

import { BigNumber } from "@ethersproject/bignumber"
import { ChainId } from "../../constants/networks"
import { Zero } from "@ethersproject/constants"
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
    avgLockDurationWks: BigNumber
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
      ]).catch((e) => {
        console.error(e)
        return [Zero, Zero]
      })
      // ratio of total veSDL to locked SDL, times max lock time (4 yrs = 208 wks)
      const avgLockDurationWks = sdlLocked.gt(Zero)
        ? totalVeSDL.mul(208).div(sdlLocked)
        : Zero
      setAggSDLInfo({
        sdlLocked,
        totalVeSDL,
        avgLockDurationWks,
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
      <Box flex={1}>
        <Typography>{t("avgLockTime")}</Typography>
        <Typography variant="subtitle1">
          {aggSDLInfo
            ? `${(aggSDLInfo.avgLockDurationWks.toNumber() / 52).toFixed(
                1,
              )} yrs`
            : "-"}
        </Typography>
      </Box>
    </Paper>
  )
}
