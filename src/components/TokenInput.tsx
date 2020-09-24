import React from "react"
import "./TokenInput.scss"

interface Props {
  token: any
}

function TokenInput({ token }: Props) {
  return (
    <div className="tokenInput">
      <img alt="" src={token.icon} />
      <span>{token.name}</span>
      <span className="max">MAX: {token.max}</span>
      <input type="number" placeholder={token.max} />
    </div>
  )
}

export default TokenInput
