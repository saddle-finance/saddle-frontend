import { Box, Button, Dialog, DialogContent, Typography } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import { AppState } from "../state"
import React from "react"
import { updateConfirmModal } from "../state/user"

export default function ConfirmModal(): JSX.Element {
  const {
    confirmModalOption: { open, options },
  } = useSelector((state: AppState) => state.user)
  const dispatch = useDispatch()
  const onOK = options?.onOK
  const onCancel = options?.onCancel
  const modalText = options?.modalText || "Are you sure?"
  const handleClickOK = () => {
    dispatch(updateConfirmModal({ open: false }))
    onOK && onOK()
  }
  const handleClickCancel = () => {
    dispatch(updateConfirmModal({ open: false }))
    onCancel && onCancel()
  }
  return (
    <Dialog open={open} fullWidth maxWidth="xs">
      <DialogContent>
        <Typography>{modalText}</Typography>
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
