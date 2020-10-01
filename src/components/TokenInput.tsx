import "./TokenInput.scss"

import React, { ReactElement } from "react"

interface Props {
  token: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

function TokenInput({ token }: Props): ReactElement {
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
