import React, { ReactElement } from "react"

import Button from "./Button"
import { IS_L2_SUPPORTED } from "../constants"
import { NETWORK_LABEL } from "../constants/networks"
import classnames from "classnames"
import styles from "./NetworkDisplay.module.scss"
import { useActiveWeb3React } from "../hooks"
import { useTranslation } from "react-i18next"

export default function NetworkDisplay({
  onClick,
}: {
  onClick: () => void
}): ReactElement | null {
  const { chainId, active } = useActiveWeb3React()
  const { t } = useTranslation()
  const networkLabel: string =
    (chainId ? NETWORK_LABEL[chainId] : undefined) || t("unknown")

  return IS_L2_SUPPORTED ? (
    <Button kind="ghost" size="medium" onClick={onClick}>
      <div
        className={classnames(styles.circle, { [styles.active]: active })}
      ></div>{" "}
      {networkLabel}
    </Button>
  ) : null
}
