import { Box, Button, Dialog, DialogContent, Typography } from "@mui/material"
import React from "react"

type ConfirmModalType = {
  open: boolean
  modalTitle?: string
  modalText?: string | Element
  onOK?: () => void
  onCancel?: () => void
  onClose: () => void
}
export default function ConfirmModal({
  open,
  modalText,
  onOK,
  onCancel,
  onClose,
}: ConfirmModalType): JSX.Element {
  const handleClickOK = () => {
    onOK && onOK()
    onClose()
  }
  const handleClickCancel = () => {
    onCancel && onCancel()
    onClose()
  }
  return (
    <Dialog open={open} fullWidth maxWidth="xs">
      <DialogContent>
        <Typography textAlign="center">{modalText}</Typography>
        <Box mt={3} display="flex" justifyContent="space-between">
          <Button variant="contained" onClick={handleClickOK}>
            OK
          </Button>
          <Button onClick={handleClickCancel}>Cancel</Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
