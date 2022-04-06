import MuiDialogTitle, { DialogTitleProps } from "@mui/material/DialogTitle"
import React, { PropsWithChildren, ReactElement } from "react"
import { Typography, TypographyProps } from "@mui/material"

export default function DialogTitle({
  children,
  variant = "h3",
  ...props
}: PropsWithChildren<unknown> &
  DialogTitleProps &
  TypographyProps): ReactElement {
  return (
    <MuiDialogTitle sx={{ mb: 2 }}>
      <Typography component="span" variant={variant} {...props}>
        {children}
      </Typography>
    </MuiDialogTitle>
  )
}
