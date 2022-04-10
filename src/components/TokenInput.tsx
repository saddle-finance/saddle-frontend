import { LPTOKEN_TO_POOL_MAP, TOKENS_MAP } from "../constants"
import React, { ReactElement } from "react"
import {
  calculatePrice,
  commify,
  getTokenIconPath,
  handleTokenIconImageError,
} from "../utils"

import { AppState } from "../state/index"
import { BigNumber } from "ethers"
import { Zero } from "@ethersproject/constants"
import classnames from "classnames"
import { formatBNToString } from "../utils"
import styles from "./TokenInput.module.scss"
import usePoolData from "../hooks/usePoolData"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  symbol: string
  max?: string
  inputValue: string
  onChange: (value: string) => void
  disabled?: boolean
}

function TokenInput({
  symbol,
  max,
  inputValue,
  onChange,
  disabled,
}: Props): ReactElement {
  const { t } = useTranslation()
  const { name } = TOKENS_MAP[symbol]

  let tokenUSDValue: number | BigNumber | undefined
  const poolName = LPTOKEN_TO_POOL_MAP[symbol]
  const [poolData] = usePoolData(poolName)
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)

  if (poolData.lpTokenPriceUSD != Zero) {
    tokenUSDValue = parseFloat(
      formatBNToString(poolData.lpTokenPriceUSD, 18, 2),
    )
  } else {
    tokenUSDValue = tokenPricesUSD?.[symbol]
  }

  function onChangeInput(e: React.ChangeEvent<HTMLInputElement>): void {
    const { decimals } = TOKENS_MAP[symbol]
    const parsedValue = parseFloat("0" + e.target.value)
    const periodIndex = e.target.value.indexOf(".")
    const isValidInput = e.target.value === "" || !isNaN(parsedValue)
    const isValidPrecision =
      periodIndex === -1 || e.target.value.length - 1 - periodIndex <= decimals
    if (isValidInput && isValidPrecision) {
      // don't allow input longer than the token allows
      onChange(e.target.value)
    }
  }

  return (
    <div>
      {max != null && (
        <div className={styles.balanceContainer}>
          <span>{t("balance")}:</span>
          &nbsp;
          <a onClick={() => onChange(String(max))}>{max}</a>
        </div>
      )}

      <div
        className={classnames(styles.tokenInputContainer, {
          [styles.disabled]: disabled,
        })}
        id="tokenInput"
      >
        <img
          alt="icon"
          src={getTokenIconPath(symbol)}
          onError={handleTokenIconImageError}
        />
        <div className={styles.tokenSymbolAndName}>
          <p className={styles.boldText}>{symbol}</p>
          <p className={styles.smallText}>{name}</p>
        </div>
        <div className={styles.inputGroup}>
          <input
            autoComplete="off"
            autoCorrect="off"
            type="text"
            placeholder="0.0"
            spellCheck="false"
            disabled={disabled ? true : false}
            value={inputValue}
            onChange={onChangeInput}
            onFocus={(e: React.ChangeEvent<HTMLInputElement>): void =>
              e.target.select()
            }
          />
          <p className={styles.smallText}>
            ≈$
            {commify(
              formatBNToString(
                calculatePrice(inputValue, tokenUSDValue),
                18,
                2,
              ),
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

export default TokenInput
