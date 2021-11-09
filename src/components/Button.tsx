import "./Button.scss"

import React, { ReactElement } from "react"
import { ThemeContext } from "../providers/ThemeProvider"

import classNames from "classnames"

type Props = {
  disabled?: boolean
  kind?:
    | "primary"
    | "secondary"
    | "ternary"
    | "cancel"
    | "temporary"
    | "outline"
  size?: "large" | "middle"
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}
export default function Button(
  props: React.PropsWithChildren<Props>,
): ReactElement {
  const { kind = "primary", size = "large", ...buttonProps } = props
  const { userDarkMode } = React.useContext(ThemeContext)
  return (
    <button
      className={classNames("button", kind, size, userDarkMode && "dark")}
      {...buttonProps}
    />
  )
}
