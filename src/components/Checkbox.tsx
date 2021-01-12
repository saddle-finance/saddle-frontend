import "./Checkbox.scss"

import React, { ReactElement } from "react"

interface Props {
  checked: boolean
  onChange: () => void
  label: string
}

export default function Checkbox({
  checked,
  onChange,
  label,
}: Props): ReactElement {
  return (
    <div className="checkbox">
      <label className="checkbox_wrapper">
        <span className="checkbox_input">
          <input type="checkbox" checked={checked} onChange={onChange} />
          <span className="checkbox_control">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path
                fill="none"
                strokeWidth="4"
                d="M1.73 12.91l6.37 6.37L22.79 4.59"
              />
            </svg>
          </span>
        </span>
        <span className="label">{label}</span>
      </label>
    </div>
  )
}
