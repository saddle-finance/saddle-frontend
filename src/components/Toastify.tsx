/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { Box, Link } from "@mui/material"
import React, { ReactText } from "react"

import { ChainId } from "../constants/networks"
import { IS_PRODUCTION } from "../utils/environment"
import LaunchIcon from "@mui/icons-material/Launch"
import { getMultichainScanLink } from "../utils/getEtherscanLink"
import i18n from "i18next"
import { toast as toastify } from "react-toastify"

type ToastVariation = "success" | "info" | "error"
type TxType =
  | "createPermissionlessPool"
  | "tokenApproval"
  | "deposit"
  | "swap"
  | "withdraw"
  | "claim"
  | "migrate"
  | "stake"
  | "unstake"
  | "createLock"
  | "increaseLockAmt"
  | "increaseLockEndTime"
  | "increaseLockAmtAndEndTime"
  | "unlock"
  | "vote"

export const enqueuePromiseToast = (
  chainId: ChainId,
  promy: Promise<unknown>,
  type: TxType,
  additionalData?: { tokenName?: string; poolName?: string },
): Promise<unknown> => {
  const renderPendingContentBasedOnType = (type: TxType) => {
    switch (type) {
      case "createPermissionlessPool":
        return `Permissionless Pool ${additionalData?.poolName} initiated`
      case "deposit":
        return i18n.t("depositInitiated")
      case "tokenApproval":
        return i18n.t("approveSpend", { tokenName: additionalData?.tokenName })
      case "swap":
        return i18n.t("swapInitiated")
      case "withdraw":
        return i18n.t("withdrawInitiated")
      case "claim":
        return i18n.t("claimInitiated")
      case "migrate":
        return i18n.t("migrateInitiated")
      case "stake":
        return i18n.t("stakeInitiated")
      case "unstake":
        return i18n.t("unstakeInitiated")
      case "createLock":
        return i18n.t("lockInitiated")
      case "increaseLockAmt":
        return i18n.t("increaseAmtInitiated")
      case "increaseLockEndTime":
        return i18n.t("increaseLockTimeInitiate")
      case "unlock":
        return i18n.t("unlockInitiated")
      case "vote":
        return i18n.t("voted")
      default:
        return i18n.t("transactionInitiated")
    }
  }

  const renderSuccessContentBasedOnType = (type: TxType) => {
    switch (type) {
      case "createPermissionlessPool":
        return `Permissionless Pool ${additionalData?.poolName} created`
      case "deposit":
        return i18n.t("depositComplete", { poolName: additionalData?.poolName })
      case "tokenApproval":
        return i18n.t("tokenApprovalComplete", {
          tokenName: additionalData?.tokenName,
        })
      case "swap":
        return i18n.t("swapComplete")
      case "withdraw":
        return i18n.t("withdrawComplete", {
          poolName: additionalData?.poolName,
        })
      case "claim":
        return i18n.t("claimComplete", {
          poolName: additionalData?.poolName,
        })
      case "migrate":
        return i18n.t("migrateComplete", {
          poolName: additionalData?.poolName,
        })
      case "stake":
        return i18n.t("stakeComplete", {
          poolName: additionalData?.poolName,
        })
      case "unstake":
        return i18n.t("unstakeComplete", {
          poolName: additionalData?.poolName,
        })
      // vesdl lock
      case "createLock":
        return i18n.t("lockCompleted", {
          poolName: additionalData?.poolName,
        })
      case "increaseLockAmt":
        return i18n.t("increaseAmtComplete", {
          poolName: additionalData?.poolName,
        })
      case "increaseLockEndTime":
        return i18n.t("increaseLockTimeComplete", {
          poolName: additionalData?.poolName,
        })
      case "unlock":
        return i18n.t("unlockCompleted", {
          poolName: additionalData?.poolName,
        })
      default:
        return i18n.t("transactionComplete")
    }
  }

  return toastify.promise(promy, {
    pending: {
      render() {
        return renderPendingContentBasedOnType(type)
      },
    },
    success: {
      render(data: { transactionHash?: string }) {
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{renderSuccessContentBasedOnType(type)}</span>
            {data?.transactionHash && (
              <Link
                href={getMultichainScanLink(
                  chainId,
                  data?.transactionHash ?? "",
                  "tx",
                )}
                target="_blank"
                rel="noreferrer"
                sx={{ alignItems: "center" }}
              >
                <LaunchIcon fontSize="inherit" />
              </Link>
            )}
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
  toastVariation: ToastVariation,
  toastData: string,
): ReactText => {
  return toastify[toastVariation](toastData, {
    autoClose: IS_PRODUCTION ? 5000 : 10_000, // keep toasts around longer for slow CI tests :(
  })
}
