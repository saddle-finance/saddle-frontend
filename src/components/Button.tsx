import "./Button.scss"

import React, { ReactElement } from "react"

import classNames from "classnames"

type Props = {
  disabled?: boolean
  size?: "medium" | "large"
  fullWidth?: boolean
  kind?:
    | "primary"
    | "secondary"
    | "ternary"
    | "cancel"
    | "temporary"
    | "outline"
    | "ghost"
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}
export default function Button(
  props: React.PropsWithChildren<Props>,
): ReactElement {
  const { kind = "primary", size = "large", fullWidth, ...buttonProps } = props
  return (
    <button
      className={classNames("button", kind, size, { fullWidth })}
      {...buttonProps}
    />
  )
}
