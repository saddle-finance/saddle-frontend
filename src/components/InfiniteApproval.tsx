import "./InfiniteApproval.scss"

import React, { ReactElement } from "react"

import { useTranslation } from "react-i18next"

interface Props {
  checked: boolean
  onChange: () => void
}
export default function InfintiteApproval({
  checked,
  onChange,
}: Props): ReactElement {
  const { t } = useTranslation()
  return (
    <div className="infiniteApproval">
      <label className="checkbox_input">
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
      </label>
      <div className="IAlabel">
        {t("infiniteApproval")}
        <span className="tooltipText">
          Allow Saddle to spend all of the selected tokens now and in the
          future. You will not need to approve again.
        </span>
      </div>
    </div>
  )
}
