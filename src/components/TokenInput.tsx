import "./TokenInput.scss"

import React, { ReactElement } from "react"

import Button from "./Button"
import classNames from "classnames"
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
  function onClickMax(e: React.MouseEvent<HTMLButtonElement>): void {
    e.preventDefault()
    onChange(String(max))
  }
  function onChangeInput(e: React.ChangeEvent<HTMLInputElement>): void {
    onChange(e.target.value)
  }

  return (
    <div className="tokenInput">
      <img alt="icon" src={icon} />
      <span>{symbol}</span>
      <input
        disabled={disabled ? true : false}
        className={classNames({ hasMaxButton: max })}
        value={inputValue}
        onChange={onChangeInput}
        placeholder={max || "0"}
        onFocus={(e: React.ChangeEvent<HTMLInputElement>): void =>
          e.target.select()
        }
      />
      {max != null && (
        <Button
          onClick={onClickMax}
          size="small"
          kind="ternary"
          disabled={disabled}
        >
          {t("max")}
        </Button>
      )}
    </div>
  )
}

export default TokenInput
