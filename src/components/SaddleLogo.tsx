import { ReactComponent as Logo } from "../assets/icons/logo.svg"
import React from "react"
import { useTheme } from "@mui/material"

export default function SaddleLogo({
  ...props
}: React.SVGProps<SVGSVGElement>) {
  const theme = useTheme()
  return (
    <Logo
      {...props}
      color={
        theme.palette.mode === "dark"
          ? theme.palette.common.black
          : theme.palette.common.white
      }
    />
  )
}
