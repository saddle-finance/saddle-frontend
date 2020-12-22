import "./SwapForm.scss"

import React, { ReactElement } from "react"

import classNames from "classnames"
import { useTranslation } from "react-i18next"

interface Props {
  title: string
  tokens: Array<{ name: string; value: string; icon: string }>
  selected: string
  onChangeSelected: (tokenName: string) => void
}

function SwapForm({
  title,
  tokens,
  selected,
  onChangeSelected,
}: Props): ReactElement {
  const { t } = useTranslation()

  return (
    <div className="swapForm">
      <div className="head">
        <h4 className="title">{title}</h4>
        <div className="inputField">
          <input></input>
          {title === t("from") ? (
            <button className="max">{t("max")}</button>
          ) : (
            ""
          )}
        </div>
      </div>
      <ul className="tokenList">
        {tokens.map((token, i) => (
          <div
            className={
              "tokenListItem " + classNames({ active: selected === token.name })
            }
            key={i}
            onClick={(): void => onChangeSelected(token.name)}
          >
            <img className="tokenIcon" src={token.icon} alt="icon" />
            <span className="tokenName">{token.name}</span>
            <span className="tokenValue">{token.value}</span>
            {i === tokens.length - 1 ? "" : <div className="divider"></div>}
          </div>
        ))}
      </ul>
    </div>
  )
}

export default SwapForm
