import "./SwapForm.scss"

import React, { ReactElement } from "react"

import classNames from "classnames"
import { useTranslation } from "react-i18next"

interface Props {
  isSwapFrom: boolean
  tokens: Array<{
    name: string
    value: string
    icon: string
    symbol: string
  }>
  selected: string
  inputValue: string
  onChangeSelected: (tokenSymbol: string) => void
  onChangeAmount?: (value: string) => void
}

function SwapForm({
  tokens,
  selected,
  inputValue,
  isSwapFrom,
  onChangeSelected,
  onChangeAmount,
}: Props): ReactElement {
  const { t } = useTranslation()

  return (
    <div className="swapForm">
      <div className="head">
        <h4 className="title">{isSwapFrom ? t("from") : t("to")}</h4>
        <div className="inputField">
          <input
            value={inputValue}
            onChange={(e): void => onChangeAmount?.(e.target.value)}
            onFocus={(e: React.ChangeEvent<HTMLInputElement>): void => {
              if (isSwapFrom) {
                e.target.select()
              }
            }}
          />
          {isSwapFrom ? (
            <button
              className="max"
              onClick={(): void => {
                const token = tokens.find((t) => t.symbol === selected)
                if (token && onChangeAmount) {
                  onChangeAmount(token.value)
                }
              }}
            >
              {t("max")}
            </button>
          ) : (
            ""
          )}
        </div>
      </div>
      <ul className="tokenList">
        {tokens.map(({ symbol, icon, name, value }, i) => (
          <div
            className={classNames("tokenListItem", {
              active: selected === symbol,
            })}
            key={symbol}
            onClick={(): void => onChangeSelected(symbol)}
          >
            <img className="tokenIcon" src={icon} alt="icon" />
            <span className="tokenName">{name}</span>
            {isSwapFrom ? <span className="tokenValue">{value}</span> : null}
            {i === tokens.length - 1 ? "" : <div className="divider"></div>}
          </div>
        ))}
      </ul>
    </div>
  )
}

export default SwapForm
