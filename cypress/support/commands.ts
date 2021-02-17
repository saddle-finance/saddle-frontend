/* eslint-disable */
import { JsonRpcProvider } from "@ethersproject/providers"
import { Wallet } from "@ethersproject/wallet"
import { _Eip1193Bridge } from "@ethersproject/experimental/lib/eip1193-bridge"

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

class CustomizedBridge extends _Eip1193Bridge {
  async sendAsync(...args) {
    return this.send(...args)
  }
  async send(...args) {
    const isCallbackForm =
      typeof args[0] === "object" && typeof args[1] === "function"
    let callback
    let method
    let params
    if (isCallbackForm) {
      callback = args[1]
      method = args[0].method
      params = args[0].params
    } else {
      method = args[0]
      params = args[1]
    }
    console.log(`method: ${method}`)
    function wrapResponse(result, error = null) {
      if (result == null && result == null) {
        error = new Error("Something went wrong")
      }
      if (isCallbackForm) {
        callback(error, result ? { result } : null )
      } else {
        return result ? Promise.resolve(result) : Promise.reject(error)
      }
    }
    if (method === "eth_requestAccounts" || method === "eth_accounts") {
      return wrapResponse([Cypress.env("PRIVATE_TEST_WALLET_ADDRESS")])
    }
    if (method === "eth_chainId") {
      return wrapResponse(`0x${Cypress.env("NETWORK_ID").toString(16).toUpperCase()}`)
    }
    let [argsObject, ...paramsRest] = params || []
    if (
      (method === "eth_call" || method === "eth_sendTransaction") &&
      typeof argsObject === "object"
    ) {
      // this seems to throw unless the from arg is removed
      delete argsObject.from
    }
    if (method === "eth_sendTransaction") {
      argsObject = { ...argsObject, gasPrice: params.gas }
      delete argsObject.gas
    }
    try {
      const result = await super.send(method, [argsObject, ...paramsRest])
      return wrapResponse(result)
    } catch (error) {
      return wrapResponse(null, error)
    }
  }
}
Cypress.Commands.overwrite("visit", (original, url, options) => {
  return original(
    url.startsWith("/") && url.length > 2 && !url.startsWith("/#")
      ? `/#${url}`
      : url,
    {
      ...options,
      onBeforeLoad(win) {
        options && options.onBeforeLoad && options.onBeforeLoad(win)
        win.localStorage.clear()
        const provider = new JsonRpcProvider(
          Cypress.env("PROVIDER_HOST"),
          { name: "local", chainId: Cypress.env("NETWORK_ID") },
        )
        const signer = new Wallet(Cypress.env("PRIVATE_TEST_WALLET_PK"), provider)
        win.ethereum = new CustomizedBridge(signer, provider)
      },
    },
  )
})
