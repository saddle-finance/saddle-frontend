import { Box, Link } from "@mui/material"
import React, { ReactText } from "react"

import LaunchIcon from "@mui/icons-material/Launch"
import { getEtherscanLink } from "../utils/getEtherscanLink"
import { toast as toastify } from "react-toastify"

interface toastData {
  tokenName?: string
  status?: number
  hash?: string
}

type toastStatus = "success" | "info" | "error"

export const toastPromise = (promy: Promise<unknown>): Promise<unknown> => {
  // let toastVariation: toastStatus
  // if (!toastData?.status) toastVariation = toastStatus
  // else toastVariation = toastData.status !== 1 ? "error" : toastStatus

  return toastify.promise(
    promy,
    {
      pending: {
        render(data) {
          console.log({ data })
          // eslint-disable-next-line
          return `Token approval initiatiated`
        },
      },
      success: {
        render(data) {
          console.log({ data })
          // eslint-disable-next-line
          // return `${data.data} approval success`
          return (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {data.data && (
                <span>{data.data} check and approve token tx complete</span>
              )}
              <Link
                href={getEtherscanLink("123", "tx")}
                target="_blank"
                rel="noreferrer"
              >
                <LaunchIcon fontSize="inherit" />
              </Link>
            </Box>
          )
        },
      },
      error: {
        render(data) {
          console.log({ data })
          // eslint-disable-next-line
          return `${data.data} approval error`
        },
      },
    },
    { position: toastify.POSITION.TOP_LEFT },
  )
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
          Transaction {`${toastData.status === 1 ? "Successful" : "Failed"}`}
        </Box>
      )}
      <Link
        href={getEtherscanLink(toastData?.hash ?? "", "tx")}
        target="_blank"
        rel="noreferrer"
      >
        <LaunchIcon fontSize="inherit" />
      </Link>
    </Box>,
    {
      position: "top-left",
      autoClose: 25_000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    },
  )
}
