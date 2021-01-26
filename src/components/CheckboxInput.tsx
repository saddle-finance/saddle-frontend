import "./CheckboxInput.scss"

import React, { ReactElement } from "react"

interface Props {
  checked: boolean
  onChange: () => void
}

export default function CheckboxInput({
  checked,
  onChange,
}: Props): ReactElement {
  return (
    <label className="checkboxInput">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <div className="checkboxControl">
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
      </div>
    </label>
  )
}
