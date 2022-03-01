import { Box, Link } from "@mui/material"
import React, { ReactText } from "react"

import LaunchIcon from "@mui/icons-material/Launch"
import { getEtherscanLink } from "../utils/getEtherscanLink"
import { toast as toastify } from "react-toastify"

type toastStatus = "success" | "info" | "error"
type txType = "tokenApproval" | "deposit"

export const enqueuePromiseToast = (
  promy: Promise<unknown>,
  type: txType,
  additionalData?: { tokenName?: string; poolName?: string },
): Promise<unknown> => {
  const renderPendingContentBasedOnType = (type: string) => {
    switch (type) {
      case "deposit":
        return "Deposit Initiated"
      case "tokenApproval":
        // eslint-disable-next-line
        return `Approve ${additionalData?.tokenName} spend`
      default:
        return "Transaction Initiated"
    }
  }

  const renderSuccessContentBasedOnType = (
    type: txType,
    data: undefined | string | unknown,
  ) => {
    switch (type) {
      case "deposit":
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
      case "tokenApproval":
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
      default:
        return "Success"
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
    { position: toastify.POSITION.TOP_LEFT },
  )
}

export const enqueueToast = (
  toastStatus: toastStatus,
  toastData: string,
): ReactText => {
  return toastify[toastStatus](toastData)
}
