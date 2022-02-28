import React, { ReactText } from "react"

import { Box } from "@mui/material"
import LaunchIcon from "@mui/icons-material/Launch"
import { toast as toastify } from "react-toastify"

interface toastData {
  tokenName?: string
  status?: number
}

type toastStatus = "success" | "info" | "error"

export const toastPromise = (promy: Promise<void>): Promise<unknown> => {
  // let toastVariation: toastStatus
  // if (!toastData?.status) toastVariation = toastStatus
  // else toastVariation = toastData.status !== 1 ? "error" : toastStatus

  return toastify.promise(promy, {
    pending: "tx initiatiated",
    success: {
      render({ data }: { data: string }) {
        return `response ${data}`
      },
    },
    error: {
      render({ data }: { data: string }) {
        return `err ${data}`
      },
    },
  })
}

export const toast = (
  toastStatus: toastStatus,
  toastData?: toastData,
): ReactText => {
  let toastVariation: toastStatus
  if (!toastData?.status) toastVariation = toastStatus
  else toastVariation = toastData.status !== 1 ? "error" : toastStatus

  return toastify[toastVariation](
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {toastData?.tokenName && (
        <span>{toastData.tokenName} check and approve token tx complete</span>
      )}
      {toastData?.status && (
        <Box>
          {`${toastData.status === 1 ? "Successful" : "Failed"}`} transaction
        </Box>
      )}
      <LaunchIcon fontSize="inherit" />
      {/* <a target="_blank" rel="noreferrer" href="https://www.google.com">
              EtherScan
            </a> */}
    </Box>,
    {
      position: "top-right",
      autoClose: 25_000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    },
  )
}
