import React, { ReactElement, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { calculatePrice, commify, formatBNToString } from "../utils"

import { AppState } from "../state"
import { BigNumber } from "ethers"
import Button from "./Button"
import { PendingSwap } from "../hooks/usePendingSwapData"
import SwapInput from "./SwapInput"
import { Zero } from "@ethersproject/constants"
import styles from "./PendingSwapExchange.module.scss"
import { useSelector } from "react-redux"

const PendingSwapExchange = ({
  pendingSwap,
}: {
  pendingSwap: PendingSwap
}): ReactElement => {
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)
  const [inputState, setInputState] = useState<{
    value: string
    valueUSD: BigNumber
  }>({
    value: "",
    valueUSD: Zero,
  })
  const { t } = useTranslation()
  const { synthTokenFrom, tokenTo, synthBalance } = pendingSwap
  const formattedSynthBalance = commify(
    formatBNToString(synthBalance, synthTokenFrom.decimals, 6),
  )
  return (
    <div className={styles.exchangeWrapper}>
      <div className={styles.stepWrapper}>
        <h2>{t("step2Settlement")}</h2>
      </div>
      <div className={styles.balanceWrapper}>
        <p>
          {t("balance")}:{" "}
          <b
            className={styles.balance}
            onClick={() =>
              setInputState((prevState) => ({
                ...prevState,
                valueUSD: calculatePrice(
                  synthBalance,
                  tokenPricesUSD?.[synthTokenFrom.symbol],
                  synthTokenFrom.decimals,
                ),
                value: formatBNToString(synthBalance, synthTokenFrom.decimals),
              }))
            }
          >
            {formattedSynthBalance}
          </b>
        </p>
      </div>
      <SwapInput
        tokens={[]}
        onChangeAmount={(newValue) =>
          setInputState((prevState) => ({ ...prevState, value: newValue }))
        }
        selected={synthTokenFrom.symbol}
        inputValue={inputState.value}
        inputValueUSD={inputState.valueUSD}
        isSwapFrom={true}
      />
      <div className={styles.buttonGroup}>
        <Button>
          <Trans t={t} i18nKey="settleAsToken">
            Settle as <img src={tokenTo.icon} /> {{ name: tokenTo.symbol }}
          </Trans>
        </Button>
        <Button>
          <Trans t={t} i18nKey="withdrawSynth">
            Withdraw <img src={synthTokenFrom.icon} />{" "}
            {{ name: synthTokenFrom.symbol }}
          </Trans>
        </Button>
      </div>
    </div>
  )
}

export default PendingSwapExchange
