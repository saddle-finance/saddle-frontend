import { ChainId, IS_L2_SUPPORTED } from "../constants"
import React, { ReactElement } from "react"
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core"

import Button from "./Button"
import { NETWORK_LABEL } from "../constants/networks"
import classnames from "classnames"
import styles from "./NetworkDisplay.module.scss"

export default function NetworkDisplay({
  onClick,
}: {
  onClick: () => void
}): ReactElement | null {
  const { active, chainId, error } = useWeb3React()
  const networkLabel: string =
    (chainId ? NETWORK_LABEL[chainId as ChainId] : undefined) ?? "Ethereum"
  const isUnsupportChainIdError = error instanceof UnsupportedChainIdError

  return IS_L2_SUPPORTED ? (
    <Button
      data-testid="networkDisplayBtn"
      kind="ghost"
      size="medium"
      onClick={onClick}
    >
      <div
        className={classnames(styles.circle, {
          [styles.wrong]: isUnsupportChainIdError,
          [styles.active]: active,
        })}
      ></div>{" "}
      {networkLabel}
    </Button>
  ) : null
}
