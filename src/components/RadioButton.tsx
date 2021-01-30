import "./RadioButton.scss"

import React, { ReactElement } from "react"

interface Props {
  checked: boolean
  onChange: () => void
  label: string
}

export default function RadioButton({
  checked,
  onChange,
  label,
}: Props): ReactElement {
  return (
    <div className="radio">
      <label className="radio_wrapper">
        <span className="radio_input">
          <input type="radio" checked={checked} onChange={onChange} />
          <span className="radio_control"></span>
        </span>
        <span className="label">{label}</span>
      </label>
    </div>
  )
}
