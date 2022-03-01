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

export const enqueuePromiseToast = (
  promy: Promise<unknown>,
  type: string,
): Promise<unknown> => {
  const renderPendingContentBasedOnType = (type: string) => {
    if (type === "deposit") {
      return "Deposit Initiated"
    } else if (type === "tokenApproval") {
      return "Token Approval Initiated"
    }
  }

  const renderSuccessContentBasedOnType = (
    type: string,
    data: unknown | undefined | string,
  ) => {
    if (type === "deposit") {
      return (
        <>
          Deposit Successful
          <Link
            // @ts-ignore
            href={getEtherscanLink(data.transactionHash, "tx")}
            target="_blank"
            rel="noreferrer"
          >
            <LaunchIcon fontSize="inherit" />
          </Link>
        </>
      )
    } else if (type === "tokenApproval") {
      return <span>{data} Approval Successful</span>
    }
  }

  return toastify.promise(
    promy,
    {
      pending: {
        render(data) {
          console.log({ data })
          // eslint-disable-next-line
          return renderPendingContentBasedOnType(type)
        },
      },
      success: {
        render(data) {
          console.log({ data })
          // eslint-disable-next-line
          return (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
              }}
            >
              {renderSuccessContentBasedOnType(type, data.data)}
            </Box>
          )
        },
      },
      error: {
        render({ data }: { data: { message: string } }) {
          console.log({ data })
          return data.message
        },
      },
    },
    { position: toastify.POSITION.TOP_LEFT },
  )
}

export const enqueueToast = (
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
