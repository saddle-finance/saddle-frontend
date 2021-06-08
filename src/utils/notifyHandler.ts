import { NOTIFY_OPTIONS } from "../constants"
import Notify from "bnc-notify"
import { getEtherscanLink } from "../utils/getEtherscanLink"

export const notify = Notify(NOTIFY_OPTIONS)

export function notifyHandler(hash: string): void {
  const { emitter } = notify.hash(hash)

  emitter.on("txPool", (transaction) => {
    if (transaction.hash) {
      console.log(transaction)
      return {
        message: `Your transaction is pending, <a href="${getEtherscanLink(
          transaction.hash,
          "tx",
        )}" rel="noopener noreferrer" target="_blank">click here</a> for more info.`,
      }
    }
  })

  emitter.on("all", (transaction) => ({
    onclick: () => {
      console.log(transaction)
      if (transaction.hash) {
        window.open(
          getEtherscanLink(transaction.hash, "tx"),
          "_blank",
          "noopener norefferer",
        )
      }
    },
  }))
}

/*
const { emitter } = notify.hash(spendTransaction.hash)

emitter.on("txPool", (transaction) => {
  return {
    message: `Your transaction is pending, click for more info.`,
    onclick: () => {
      if (transaction.hash) {
        window.open(
          getEtherscanLink(transaction.hash, "tx"),
          "_blank",
          "noopener norefferer",
        )
      }
    },
  }
})
*/
