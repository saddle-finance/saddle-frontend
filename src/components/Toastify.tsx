import { Box, Link } from "@mui/material"
import React, { ReactText } from "react"

import LaunchIcon from "@mui/icons-material/Launch"
import { getEtherscanLink } from "../utils/getEtherscanLink"
import { toast as toastify } from "react-toastify"

type toastStatus = "success" | "info" | "error"

export const enqueuePromiseToast = (
  promy: Promise<unknown>,
  type: string,
  additionalData?: { tokenName?: string; poolName?: string },
): Promise<unknown> => {
  const renderPendingContentBasedOnType = (type: string) => {
    if (type === "deposit") {
      return "Deposit Initiated"
    } else if (type === "tokenApproval") {
      // eslint-disable-next-line
      return `Approve ${additionalData?.tokenName} spend`
    }
  }

  const renderSuccessContentBasedOnType = (
    type: string,
    data: undefined | string | unknown,
  ) => {
    if (type === "deposit") {
      return (
        <>
          Deposit Successful on {additionalData?.poolName}
          <Link
            // @ts-ignore
            href={getEtherscanLink(data?.transactionHash, "tx")}
            target="_blank"
            rel="noreferrer"
          >
            <LaunchIcon fontSize="inherit" />
          </Link>
        </>
      )
    } else if (type === "tokenApproval") {
      return (
        <>
          {/* @ts-ignore */}
          {additionalData?.tokenName} Approval Successful
          <Link
            // @ts-ignore
            href={getEtherscanLink(data?.transactionHash, "tx")}
            target="_blank"
            rel="noreferrer"
          >
            <LaunchIcon fontSize="inherit" />
          </Link>
        </>
      )
    }
  }

  return toastify.promise(
    promy,
    {
      pending: {
        render() {
          return renderPendingContentBasedOnType(type)
        },
      },
      success: {
        render(data) {
          console.log({ data })
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
          return data.message
        },
      },
    },
    { position: toastify.POSITION.TOP_LEFT, pauseOnFocusLoss: false },
  )
}

export const enqueueToast = (
  toastStatus: toastStatus,
  toastData: string,
): ReactText => {
  return toastify[toastStatus](toastData)
}
