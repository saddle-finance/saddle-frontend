import Notify from "bnc-notify"
import { getEtherscanLink } from "../utils/getEtherscanLink"

const notifyNetworks = new Set([1, 3, 4, 5, 42, 56, 100])
const networkId = parseInt(process.env.REACT_APP_CHAIN_ID ?? "1")
const notify = Notify({
  ...(notifyNetworks.has(networkId)
    ? { dappId: process.env.REACT_APP_NOTIFY_DAPP_ID }
    : {}), // trigger "UI Only Mode" when on a testnet https://docs.blocknative.com/notify#ui-only-mode
  networkId,
  desktopPosition: "topRight" as const,
  darkMode: true,
})

export function notifyHandler(
  hash: string,
  type: "Deposit" | "Withdraw" | "Swap" | "Token approval",
): void {
  const { emitter } = notify.hash(hash)

  emitter.on("txPool", (transaction) => {
    if (transaction.hash) {
      return {
        message: `${type} transaction is pending, view it <a href="${getEtherscanLink(
          transaction.hash,
          "tx",
        )}" rel="noopener noreferrer" target="_blank">on Etherscan</a>.`,
      }
    }
  })
  emitter.on("txSent", () => {
    return {
      message: `${type} transaction was sent to the network`,
    }
  })
  emitter.on("txConfirmed", () => {
    return {
      message: `${type} transaction is confirmed.`,
    }
  })
  emitter.on("txSpeedUp", (transaction) => {
    if (transaction.hash) {
      return {
        message: `${type} transaction was sped up. View it <a href="${getEtherscanLink(
          transaction.hash,
          "tx",
        )}" rel="noopener noreferrer" target="_blank">on Etherscan</a>.`,
      }
    }
  })
  emitter.on("txCancel", () => {
    return {
      message: `${type} transaction was canceled.`,
    }
  })
  emitter.on("txFailed", (transaction) => {
    if (transaction.hash) {
      return {
        message: `${type} transaction failed. View it <a href="${getEtherscanLink(
          transaction.hash,
          "tx",
        )}" rel="noopener noreferrer" target="_blank">on Etherscan</a>.`,
      }
    }
  })
}
