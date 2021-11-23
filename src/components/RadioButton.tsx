import "./RadioButton.scss"

import React, { ReactElement } from "react"

import classnames from "classnames"

interface Props {
  checked: boolean
  onChange: () => void
  label: string
  disabled?: boolean
}

export default function RadioButton({
  checked,
  onChange,
  label,
  disabled = false,
}: Props): ReactElement {
  return (
    <div className="radio">
      <label className={classnames("radio_wrapper", { disabled })}>
        <span className="radio_input">
          <input
            type="radio"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
          />
          <span className="radio_control"></span>
        </span>
        <span className="label">{label}</span>
      </label>
    </div>
  )
}
