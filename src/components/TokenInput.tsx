import "./TokenInput.scss"

import React, { ReactElement } from "react"

interface Props {
  token: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

function TokenInput({ token }: Props): ReactElement {
  const [value, setValue] = React.useState<number | undefined>()
  function onClickMax(e: React.MouseEvent<HTMLButtonElement>): void {
    e.preventDefault()
    setValue(token.max)
  }
  function onChangeInput(e: React.ChangeEvent<HTMLInputElement>): void {
    setValue(Number(e.target.value))
  }
  return (
    <div className="tokenInput">
      <img alt="" src={token.icon} />
      <span>{token.name}</span>
      <button className="max" onClick={onClickMax}>
        MAX: {token.max}
      </button>
      <input
        type="number"
        value={value}
        onChange={onChangeInput}
        placeholder={token.max}
        max={token.max}
        min={0}
      />
    </div>
  )
}

export default TokenInput
