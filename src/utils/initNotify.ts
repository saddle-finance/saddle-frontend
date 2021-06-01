import Notify from "bnc-notify"

export function initNotify(): API {
  return Notify({
    dappId: process.env.NOTIFY_DAPP_ID,
    networkId: 1,
  })
}
