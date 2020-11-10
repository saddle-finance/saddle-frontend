import "./Toast.scss"

import React, { ReactElement } from "react"

import classNames from "classnames"
import iconCancelCircle from "../assets/icons/iconCancelCircle.svg"
import iconCheckCircle from "../assets/icons/iconCheckCircle.svg"

export interface ToastProps {
  type: "error" | "success" | "info"
  title: string
  onClick: () => void
}
export default function Toast({
  title,
  type,
  onClick,
}: ToastProps): ReactElement {
  return (
    <div className={classNames("toast", `toast-${type}`)} onClick={onClick}>
      <div className="title">
        <img
          src={type === "error" ? iconCancelCircle : iconCheckCircle}
          alt="A notification icon"
        />
        <span>{title}</span>
      </div>
    </div>
  )
}
