// import { IconButton, Slide, Snackbar, Stack } from "@mui/material"
import React, { ReactElement, createContext, useContext } from "react"

// import CloseIcon from "@mui/icons-material/Close"
import { SnackbarProvider } from "notistack"
// import { getEtherscanLink } from "../utils/getEtherscanLink"

type SnackbarContextProps = {
  enqueueSnackbar: (snackbar: { msg: string; id: string; type: string }) => void
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
  // const [snackbars, setSnackbars] = useState<
  //   { msg: string; id: string; type: string }[]
  // >([])
  // const [open, setOpen] = useState(false)

  // const enqueueSnackbar = (snackbar: {
  //   msg: string
  //   id: string
  //   type: string
  // }) => {
  //   setSnackbars(
  //     (snackbars) =>
  //       [...snackbars, snackbar] as { msg: string; id: string; type: string }[],
  //   )
  //   setOpen(true)
  // }

  // const message = (msg: string, type: string) => {
  //   console.log({ msg })
  //   switch (type) {
  //     case "deposit":
  //       return `${msg}`
  //     // return "Deposit sent to network"
  //     default:
  //       return msg
  //   }
  // }

  return <SnackbarProvider>{props.children}</SnackbarProvider>
  // return (
  //   <SnackbarContext.Provider value={{ enqueueSnackbar }}>
  //     {props.children}
  //     <Stack spacing={2} sx={{ maxWidth: 600 }}>
  //       {snackbars.map((snackbar) => (
  //         <Snackbar
  //           open={open}
  //           anchorOrigin={{ vertical: "top", horizontal: "left" }}
  //           autoHideDuration={9000}
  //           message={message(snackbar.msg, snackbar.type)}
  //           key={snackbar.id}
  //           TransitionComponent={(props) => (
  //             <Slide {...props} direction="down" />
  //           )}
  //           onClose={() => setOpen(false)}
  //           action={
  //             <>
  //               <a href={`${getEtherscanLink(snackbar.msg, "tx")}`}>
  //                 Etherscan
  //               </a>
  //               <IconButton
  //                 color="inherit"
  //                 size="small"
  //                 onClick={() => setOpen(false)}
  //               >
  //                 <CloseIcon fontSize="small" />
  //               </IconButton>
  //             </>
  //           }
  //         />
  //       ))}
  //     </Stack>
  //   </SnackbarContext.Provider>
  // )
}

export default SnackbarContextProvider

export const useSnackbarContext: () => SnackbarContextProps = () =>
  useContext(SnackbarContext)
