import "./Button.scss"

import React, { ReactElement } from "react"

import classNames from "classnames"

type Props = {
  disabled?: boolean
  kind?: "primary" | "secondary" | "ternary"
  size?: "large" | "small"
  onClick?: () => void
  children?: ReactElement
}
export default function Button(props: Props): ReactElement {
  const { kind = "primary", size = "large", ...buttonProps } = props
  return (
    <button className={classNames("button", kind, size)} {...buttonProps} />
  )
}
