import "./TokenInput.scss"

import React, { ReactElement } from "react"

import { useTranslation } from "react-i18next"

interface Props {
  name: string
  icon: string
  max: number
  inputValue: number
  onChange: (value: number) => void
}

function TokenInput({
  name,
  icon,
  max,
  inputValue,
  onChange,
}: Props): ReactElement {
  const { t } = useTranslation()
  function onClickMax(e: React.MouseEvent<HTMLButtonElement>): void {
    e.preventDefault()
    onChange(max)
  }
  function onChangeInput(e: React.ChangeEvent<HTMLInputElement>): void {
    onChange(Number(e.target.value))
  }

  return (
    <div className="tokenInput">
      <img alt="icon" src={icon} />
      <span>{name}</span>
      <button className="max" onClick={onClickMax}>
        {`${t("max")}:${Math.floor(max * 100) / 100}`}
      </button>
      <input
        type="number"
        value={inputValue}
        onChange={onChangeInput}
        placeholder={String(max)}
        max={max}
        min={0}
      />
    </div>
  )
}

export default TokenInput
