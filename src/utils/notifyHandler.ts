import Notify from "bnc-notify"
import { getEtherscanLink } from "../utils/getEtherscanLink"
import i18next from "i18next"
import { truncate } from "lodash"

const notifyNetworks = new Set([1, 3, 4, 5, 42, 56, 100, 137])
const chainId = parseInt(process.env.REACT_APP_CHAIN_ID ?? "137")

export const notify = Notify({
  ...(isChainSupportedByNotify(chainId)
    ? {
        dappId: process.env.REACT_APP_NOTIFY_DAPP_ID,
        networkId: chainId,
      }
    : {}),
  desktopPosition: "topRight" as const,
  darkMode: false,
})

export function isChainSupportedByNotify(chainId: number | undefined): boolean {
  if (!chainId) return false
  return notifyNetworks.has(chainId)
}

export function notifyHandler(
  hash: string,
  type: "deposit" | "withdraw" | "swap" | "tokenApproval" | "migrate" | "claim",
): void {
  const { emitter } = notify.hash(hash)

  emitter.on("txPool", (transaction) => {
    if (transaction.hash) {
      return {
        message: i18next.t("txPool", { context: type }),
        link: getEtherscanLink(transaction.hash, "tx"),
      }
    }
  })
  emitter.on("txSent", () => {
    return {
      message: i18next.t("txSent", { context: type }),
    }
  })
  emitter.on("txConfirmed", () => {
    return {
      message: i18next.t("txConfirmed", { context: type }),
    }
  })
  emitter.on("txSpeedUp", (transaction) => {
    if (transaction.hash) {
      return {
        message: i18next.t("txSpeedUp", { context: type }),
        link: getEtherscanLink(transaction.hash, "tx"),
      }
    }
  })
  emitter.on("txCancel", () => {
    return {
      message: i18next.t("txCancel", { context: type }),
    }
  })
  emitter.on("txFailed", (transaction) => {
    if (transaction.hash) {
      return {
        message: i18next.t("txFailed", { context: type }),
        link: getEtherscanLink(transaction.hash, "tx"),
      }
    }
  })
}

export function notifyCustomError(e: Error): void {
  const truncatedMessage = e.message
    .trim()
    .split(/\s+/)
    .map((word) => truncate(word, { length: 15 }))
    .join(" ")

  notify.notification({
    eventCode: "txFailed",
    type: "error",
    message: `Your transaction failed. ${truncatedMessage}`,
    autoDismiss: 8000, // 8 seconds
  })
}
