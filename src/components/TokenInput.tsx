import React from "react"
import "./TokenInput.scss"

interface Props {
  token: any
}

function TokenInput({ token }: Props) {
  return (
    <div>
      <img alt="" src={token.icon} />
      <span>{token.name}</span>
      <span>{token.max}</span>
      <input />
    </div>
  )
}

export default TokenInput
