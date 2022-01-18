import React, { PropsWithChildren, ReactElement } from "react"
import { Close } from "@mui/icons-material"
import { IconButton } from "@mui/material"
import MuiDialogTitle from "@mui/material/DialogTitle"

interface DialogTitleProps {
  onClose?: () => void
}

export default function DialogTitle({
  children,
  onClose,
}: PropsWithChildren<unknown> & DialogTitleProps): ReactElement {
  return (
    <MuiDialogTitle>
      <IconButton
        sx={{ position: "absolute", right: 24, top: 16 }}
        onClick={onClose}
      >
        <Close />
      </IconButton>
      {children}
    </MuiDialogTitle>
  )
}
