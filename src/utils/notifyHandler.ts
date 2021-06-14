import { NOTIFY_OPTIONS } from "../constants"
import Notify from "bnc-notify"
import { getEtherscanLink } from "../utils/getEtherscanLink"

export const notify = Notify(NOTIFY_OPTIONS)

export function notifyHandler(hash: string): void {
  const { emitter } = notify.hash(hash)

  emitter.on("txPool", (transaction) => {
    if (transaction.hash) {
      return {
        message: `Transaction is pending, check it <a href="${getEtherscanLink(
          transaction.hash,
          "tx",
        )}" rel="noopener noreferrer" target="_blank">on Etherscan</a>.`,
      }
    }
  })
  emitter.on("txSent", () => {
    return {
      message: `Transaction has been sent to the network`,
    }
  })
  emitter.on("txConfirmed", console.log)
  emitter.on("txSpeedUp", console.log)
  emitter.on("txCancel", (transaction) => {
    console.log("txCancel", transaction)
    return {
      message: `Transaction is canceled.`,
    }
  })
  emitter.on("txFailed", console.log)
}
