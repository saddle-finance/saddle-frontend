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
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}
export default function Button(
  props: React.PropsWithChildren<Props>,
): ReactElement {
  const { kind = "primary", ...buttonProps } = props
  const { userDarkMode } = React.useContext(ThemeContext)
  console.log(userDarkMode)
  return (
    <button
      className={classNames("button", kind, "large", userDarkMode && "dark")}
      {...buttonProps}
    />
  )
}
