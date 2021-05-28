import "./Button.scss"

import React, { ReactElement } from "react"

import classNames from "classnames"

type Props = {
  disabled?: boolean
  kind?: "primary" | "secondary" | "ternary" | "cancel"
  size?: "large" | "small"
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}
export default function Button(
  props: React.PropsWithChildren<Props>,
): ReactElement {
  const { kind = "primary", size = "large", ...buttonProps } = props
  return (
    <button className={classNames("button", kind, size)} {...buttonProps} />
  )
}
