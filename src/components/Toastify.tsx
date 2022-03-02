/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { Box, Link } from "@mui/material"
import React, { ReactText } from "react"

import LaunchIcon from "@mui/icons-material/Launch"
import { getEtherscanLink } from "../utils/getEtherscanLink"
import { toast as toastify } from "react-toastify"

type ToastStatus = "success" | "info" | "error"
type TxType =
  | "tokenApproval"
  | "deposit"
  | "swap"
  | "withdraw"
  | "claim"
  | "migrate"

export const enqueuePromiseToast = (
  promy: Promise<unknown>,
  type: TxType,
  additionalData?: { tokenName?: string; poolName?: string },
): Promise<unknown> => {
  const renderPendingContentBasedOnType = (type: string) => {
    switch (type) {
      case "deposit":
        return "Deposit Initiated"
      case "tokenApproval":
        return `Approve ${additionalData?.tokenName} spend`
      case "swap":
        return "Swap Initiated"
      case "withdraw":
        return "Withdraw Initiated"
      case "claim":
        return "Claim Initiated"
      case "migrate":
        return "Migrate Initiated"
      default:
        return "Transaction Initiated"
    }
  }

  const renderSuccessContentBasedOnType = (type: TxType) => {
    switch (type) {
      case "deposit":
        return `Deposit on ${additionalData?.poolName} complete`
      case "tokenApproval":
        return `${additionalData?.tokenName} approval complete`
      case "swap":
        return "Swap Complete"
      case "withdraw":
        return `Withdraw on ${additionalData?.poolName} complete`
      case "claim":
        return `Claim on ${additionalData?.poolName} complete`
      case "migrate":
        return `Migrate from ${additionalData?.poolName} complete`
      default:
        return "Transaction complete"
    }
  }

  return toastify.promise(promy, {
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
            <>
              {renderSuccessContentBasedOnType(type)}
              <Link
                // @ts-ignore
                href={getEtherscanLink(data?.transactionHash, "tx")}
                target="_blank"
                rel="noreferrer"
              >
                <LaunchIcon fontSize="inherit" />
              </Link>
            </>
          </Box>
        )
      },
    },
    error: {
      render({ data }: { data: { message: string } }) {
        return data.message
      },
    },
  })
}

export const enqueueToast = (
  toastStatus: ToastStatus,
  toastData: string,
): ReactText => {
  return toastify[toastStatus](toastData)
}
