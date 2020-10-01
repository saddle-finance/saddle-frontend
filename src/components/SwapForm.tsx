import "./SwapForm.scss"

import React, { ReactElement } from "react"

import classNames from "classnames"

interface Props {
  title: string
  tokens: Array<{ name: string; value: number; icon: string }>
  selected: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

function SwapForm({ title, tokens, selected }: Props): ReactElement {
  return (
    <div className="swapForm">
      <div className="head">
        <h4 className="title">{title}</h4>
        <input></input>
        {title === "From" ? <button className="max">MAX</button> : ""}
      </div>
      <ul className="tokenList">
        {tokens.map((token, i) => (
          <div
            className={
              "tokenListItem " + classNames({ active: selected === token.name })
            }
            key={i}
          >
            <img className="tokenIcon" src={token.icon} alt="" />
            <span className="tokenName">{token.name}</span>
            <span className="tokenValue">{token.value}</span>
          </div>
        ))}
      </ul>
    </div>
  )
}

export default SwapForm
