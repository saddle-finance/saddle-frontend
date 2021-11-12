import "./MyFarm.scss"

import React, { ReactElement } from "react"

import { Box } from "@chakra-ui/react"
import StackButton from "./Button"
import { useTranslation } from "react-i18next"

// TODO All number is place holder.
export default function MyFarm(): ReactElement {
  const { t } = useTranslation()

  return (
    <div className="myFarm">
      <h4>{t("myFarm")}</h4>
      <div className="item" style={{ marginBottom: 16 }}>
        <div>
          <p>{t("lpAvailable")}</p>
          <p className="bold">2.123456</p>
        </div>
        <Box>
          <StackButton kind="outline">{t("stakeAll")}</StackButton>
        </Box>
      </div>
      <div className="item">
        <div>
          <p>{t("lpStaked")}</p>
          <p className="bold">2.123456</p>
        </div>
        <Box>
          <StackButton kind="outline">{t("unstakeAll")}</StackButton>
        </Box>
      </div>
    </div>
  )
}
