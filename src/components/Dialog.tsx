import { DialogProps, IconButton, Dialog as MuiDialog } from "@mui/material"

import { Close } from "@mui/icons-material"
import React from "react"

interface Props {
  hideClose?: boolean
  onClose: () => void
}
export default function Dialog({
  hideClose = false,
  onClose,
  children,
  ...props
}: Props & DialogProps): JSX.Element {
  return (
    <MuiDialog {...props} onClose={hideClose ? undefined : onClose}>
      {!hideClose && (
        <IconButton
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            zIndex: (theme) => theme.zIndex.modal + 1,
          }}
          onClick={() => onClose()}
          data-testid="dialogCloseBtn"
        >
          <Close />
        </IconButton>
      )}
      {children}
    </MuiDialog>
  )
}
