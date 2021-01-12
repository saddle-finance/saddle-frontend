import "./Toast.scss"

import React, { ReactElement } from "react"

import classNames from "classnames"
import iconCancelCircle from "../assets/icons/iconCancelCircle.svg"
import iconCheckCircle from "../assets/icons/iconCheckCircle.svg"
import iconWaitingCircle from "../assets/icons/iconWaitingCircle.svg"

type ToastType = "error" | "success" | "pending"
function getIconForType(type: ToastType): string {
  switch (type) {
    case "error":
      return iconCancelCircle
    case "success":
      return iconCheckCircle
    case "pending":
      return iconWaitingCircle
  }
}
export interface ToastProps {
  type: ToastType
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
        <img src={getIconForType(type)} alt="A notification icon" />
        <span>{title}</span>
      </div>
    </div>
  )
}
