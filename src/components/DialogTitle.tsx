import { IconButton, Typography, TypographyProps } from "@mui/material"
import MuiDialogTitle, { DialogTitleProps } from "@mui/material/DialogTitle"
import React, { PropsWithChildren, ReactElement } from "react"
import { Close } from "@mui/icons-material"

interface Props {
  onClose?: () => void
}

export default function DialogTitle({
  children,
  onClose,
  variant = "h3",
  ...props
}: PropsWithChildren<unknown> &
  Props &
  DialogTitleProps &
  TypographyProps): ReactElement {
  return (
    <MuiDialogTitle>
      <IconButton
        sx={{ position: "absolute", right: 24, top: 16 }}
        onClick={onClose}
      >
        <Close />
      </IconButton>
      <Typography component="span" variant={variant} {...props}>
        {children}
      </Typography>
    </MuiDialogTitle>
  )
}
