import { IconButton, Slide, Snackbar, Stack } from "@mui/material"
import React, { ReactElement, createContext, useContext, useState } from "react"

import CloseIcon from "@mui/icons-material/Close"
import { getEtherscanLink } from "../utils/getEtherscanLink"

type SnackbarContextProps = {
  enqueueSnackbar: (snackbar: {
    msg: string
    id: string
    type: string
    data?: string | number | undefined
  }) => void
}
const defaultValue: SnackbarContextProps = {
  enqueueSnackbar: () => undefined,
}
export const SnackbarContext = createContext(defaultValue)
interface SnackbarContextProviderProps {
  children: React.ReactNode
}

export const SnackbarContextProvider = (
  props: SnackbarContextProviderProps,
): ReactElement => {
  const [snackbars, setSnackbars] = useState<
    { msg: string; id: string; type: string; data?: string | number }[]
  >([])
  // const [open, setOpen] = useState(false)

  const enqueueSnackbar = (snackbar: {
    msg: string
    id: string
    type: string
  }) => {
    setSnackbars(
      (snackbars) =>
        [...snackbars, snackbar] as {
          msg: string
          id: string
          type: string
          data?: string | number
        }[],
    )
    // console.log({ snackbars })
    // setOpen({ id: snackbar.id, isOpen: true })
  }

  const message = (msg: string, type: string) => {
    console.log({ msg })
    switch (type) {
      case "deposit":
        return `${msg}`
      // return "Deposit sent to network"
      default:
        return msg
    }
  }

  // return (
  //   <SnackbarProvider
  //     action={(key: string) => {
  //       return <a href={`${key}`}>test</a>
  //     }}
  //   >
  //     {props.children}
  //   </SnackbarProvider>
  // )
  return (
    <SnackbarContext.Provider value={{ enqueueSnackbar }}>
      {props.children}
      <Stack spacing={6} sx={{ maxWidth: 600 }}>
        {snackbars.map((snackbar) => (
          <Snackbar
            open={Boolean(snackbar.id)}
            anchorOrigin={{ vertical: "top", horizontal: "left" }}
            autoHideDuration={19000}
            message={message(snackbar.msg, snackbar.type)}
            key={snackbar.id}
            TransitionComponent={(props) => (
              <Slide {...props} direction="down" />
            )}
            onClose={() =>
              setSnackbars((snackbars1) =>
                snackbars1.filter((snackbar1) => snackbar1.id !== snackbar.id),
              )
            }
            action={
              <>
                <a href={`${getEtherscanLink(snackbar.msg, "tx")}`}>
                  Etherscan
                </a>
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={() =>
                    setSnackbars((snackbars1) =>
                      snackbars1.filter(
                        (snackbar1) => snackbar1.id !== snackbar.id,
                      ),
                    )
                  }
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </>
            }
          />
        ))}
      </Stack>
    </SnackbarContext.Provider>
  )
}

export default SnackbarContextProvider

export const useSnackbarContext: () => SnackbarContextProps = () =>
  useContext(SnackbarContext)
