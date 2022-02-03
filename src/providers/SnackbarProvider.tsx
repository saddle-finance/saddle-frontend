import { IconButton, Slide, Snackbar } from "@mui/material"
import React, { ReactElement, createContext, useContext, useState } from "react"

import CloseIcon from "@mui/icons-material/Close"

type SnackbarContextProps = {
  addSnackbar: (snackbar: { msg: string; id: string; type: string }) => void
}
const defaultValue: SnackbarContextProps = {
  addSnackbar: () => undefined,
}
const SnackbarContext = createContext(defaultValue)

export default SnackbarContext

interface SnackbarContextProviderProps {
  children: React.ReactNode
}

export const SnackbarContextProvider = (
  props: SnackbarContextProviderProps,
): ReactElement => {
  const [snackbars, setSnackbars] = useState<
    { msg: string; id: string; type: string }[]
  >([])
  const [open, setOpen] = useState(false)

  const addSnackbar = (snackbar: { msg: string; id: string; type: string }) => {
    setSnackbars(
      (snackbars) =>
        [...snackbars, snackbar] as { msg: string; id: string; type: string }[],
    )
    setOpen(true)
  }

  return (
    <SnackbarContext.Provider value={{ addSnackbar }}>
      {props.children}
      {snackbars.map((snackbar) => (
        <Snackbar
          open={open}
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
          autoHideDuration={9000}
          message={snackbar.msg}
          key={snackbar.id}
          TransitionComponent={(props) => <Slide {...props} direction="down" />}
          onClose={() => setOpen(false)}
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={() => setOpen(false)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        />
      ))}
    </SnackbarContext.Provider>
  )
}

export const useSnackbarContext: () => SnackbarContextProps = () =>
  useContext(SnackbarContext)
