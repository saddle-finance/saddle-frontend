import "./SwapForm.scss"

import React, { ReactElement } from "react"

import classNames from "classnames"
import { useTranslation } from "react-i18next"

interface Props {
  title: string
  tokens: Array<{ name: string; value: number; icon: string }>
  selected: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

function SwapForm({ title, tokens, selected }: Props): ReactElement {
  const { t } = useTranslation()

  return (
    <div className="swapForm">
      <div className="head">
        <h4 className="title">{title}</h4>
        <input></input>
        {title === "From" ? <button className="max">{t("max")}</button> : ""}
      </div>
      <ul className="tokenList">
        {tokens.map((token, i) => (
          <div
            className={
              "tokenListItem " + classNames({ active: selected === token.name })
            }
            key={i}
          >
            <img className="tokenIcon" src={token.icon} alt="icon" />
            <span className="tokenName">{token.name}</span>
            <span className="tokenValue">{token.value}</span>
          </div>
        ))}
      </ul>
    </div>
  )
}

export default SwapForm
