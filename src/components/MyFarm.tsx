import "./MyFarm.scss"

import React, { ReactElement } from "react"
import { commify, formatBNToString } from "../utils"

import { BigNumber } from "@ethersproject/bignumber"
import { Box } from "@chakra-ui/react"
import Button from "./Button"
import { PoolName } from "../constants"
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
    unstake,
    amountStaked,
    isPoolIncentivized,
  } = useRewardsHelpers(poolName as PoolName)
  const { t } = useTranslation()
  const formattedLpWalletBalance = commify(
    formatBNToString(lpWalletBalance, 18, 4),
  )
  const formattedLpStakedBalance = commify(
    formatBNToString(amountStaked, 18, 4),
  )
  return isPoolIncentivized ? (
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
    </div>
  ) : null
}
