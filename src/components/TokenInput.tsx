import React, { ReactElement, useState } from "react"

// import Button from "./Button"
import { calculatePrice, commify } from "../utils"
import { AppState } from "../state/index"
import { TOKENS_MAP } from "../constants"
import { Zero } from "@ethersproject/constants"
// import classNames from "classnames"
import { formatBNToString } from "../utils"
import styles from "./TokenInput.module.scss"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  symbol: string
  icon: string
  max?: string
  inputValue: string
  onChange: (value: string) => void
  disabled?: boolean
}

function TokenInput({
  symbol,
  icon,
  max,
  inputValue,
  onChange,
  disabled,
}: Props): ReactElement {
  const { t } = useTranslation()
  const { name } = TOKENS_MAP[symbol]
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)

  const [valueUSD, setValueUSD] = useState<string>("0.00")
  let inputValueUSD = Zero

  function onChangeInput(e: React.ChangeEvent<HTMLInputElement>): void {
    const { decimals } = TOKENS_MAP[symbol]
    const parsedValue = parseFloat("0" + e.target.value)
    const periodIndex = e.target.value.indexOf(".")
    const isValidInput = e.target.value === "" || !isNaN(parsedValue)
    const isValidPrecision =
      periodIndex === -1 || e.target.value.length - 1 - periodIndex <= decimals
    if (isValidInput && isValidPrecision) {
      // don't allow input longer than the token allows
      inputValueUSD = calculatePrice(e.target.value, tokenPricesUSD?.[symbol])
      setValueUSD(commify(formatBNToString(inputValueUSD, 18, 2)))
      onChange(e.target.value)
    }
  }
  function onClickMax(): void {
    onChange(String(max))
    inputValueUSD = calculatePrice(String(max), tokenPricesUSD?.[symbol])
    setValueUSD(commify(formatBNToString(inputValueUSD, 18, 2)))
  }

  return (
    <div>
      {max != null && (
        <div className={styles.balanceContainer}>
          <span>{t("balance")}:</span>
          &nbsp;
          <a onClick={() => onClickMax()}>{max}</a>
        </div>
      )}

      <div className={styles.tokenInputContainer}>
        <img alt="icon" src={icon} />
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
          <p className={styles.smallText}>≈${valueUSD}</p>
        </div>
        {/* {max != null && (
        <Button
          onClick={onClickMax}
          size="small"
          kind="ternary"
          disabled={disabled}
        >
          {t("max")}
        </Button>
      )} */}
      </div>
    </div>
  )
}

export default TokenInput
