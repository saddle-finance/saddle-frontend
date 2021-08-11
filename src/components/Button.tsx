import "./Button.scss"

import React, { ReactElement } from "react"

import classNames from "classnames"

type Props = {
  disabled?: boolean
  kind?: "primary" | "secondary" | "ternary" | "cancel" | "temporary"
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}
export default function Button(
  props: React.PropsWithChildren<Props>,
): ReactElement {
  const { kind = "primary", ...buttonProps } = props
  return (
    <button className={classNames("button", kind, "large")} {...buttonProps} />
  )
}
