import "./MyFarm.scss"

import { ChainId, IS_SDL_LIVE, PoolName } from "../constants"
import React, { ReactElement } from "react"
import { commify, formatBNToString } from "../utils"

import { BigNumber } from "@ethersproject/bignumber"
import { Box } from "@mui/material"
import Button from "./Button"
import { Zero } from "@ethersproject/constants"
import { useActiveWeb3React } from "../hooks"
import { useRewardsHelpers } from "../hooks/useRewardsHelpers"
import { useTranslation } from "react-i18next"

type Props = {
  lpWalletBalance: BigNumber
  poolName: string
}
export default function MyFarm({
  lpWalletBalance,
  poolName,
}: Props): ReactElement | null {
  const {
    approveAndStake,
    claimSPA,
    unstake,
    amountStaked,
    amountOfSpaClaimable,
    isPoolIncentivized,
  } = useRewardsHelpers(poolName as PoolName)
  const { chainId } = useActiveWeb3React()
  const { t } = useTranslation()
  const formattedLpWalletBalance = commify(
    formatBNToString(lpWalletBalance, 18, 4),
  )
  const formattedLpStakedBalance = commify(
    formatBNToString(amountStaked, 18, 4),
  )
  const formattedSpaClaimableBalance = commify(
    formatBNToString(amountOfSpaClaimable, 18, 4),
  )
  return isPoolIncentivized && IS_SDL_LIVE ? (
    <div className="myFarm">
      <h4>{t("myFarm")}</h4>
      <div className="item" style={{ marginBottom: 16 }}>
        <div>
          <p>{t("lpAvailable")}</p>
          <p className="bold">{formattedLpWalletBalance}</p>
        </div>
        <Box>
          <Button
            kind="outline"
            disabled={lpWalletBalance.isZero()}
            onClick={() => approveAndStake(lpWalletBalance)}
          >
            {t("stakeAll")}
          </Button>
        </Box>
      </div>
      <div className="item">
        <div>
          <p>{t("lpStaked")}</p>
          <p className="bold">{formattedLpStakedBalance}</p>
        </div>
        <Box>
          <Button
            kind="outline"
            disabled={amountStaked.isZero()}
            onClick={() => unstake(amountStaked)}
          >
            {t("unstakeAll")}
          </Button>
        </Box>
      </div>
      {chainId === ChainId.ARBITRUM && amountOfSpaClaimable.gt(Zero) && (
        <Box className="item" sx={{ mt: 2 }}>
          <Box>
            <p>{t("claimableSPA")}</p>
            <p className="bold">{formattedSpaClaimableBalance}</p>
          </Box>
          <Box>
            <Button
              kind="outline"
              disabled={amountOfSpaClaimable.isZero()}
              onClick={() => claimSPA()}
            >
              {t("claimAll")}
            </Button>
          </Box>
        </Box>
      )}
    </div>
  ) : null
}
