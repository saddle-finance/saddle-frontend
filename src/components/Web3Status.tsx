import React from "react"
import { Twemoji } from "react-emoji-render"
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core"

import { injected } from "../connectors"

const Web3Status = () => {
  const { account, activate } = useWeb3React()

  return (
    <div className="walletStatus">
      <button
        type="button"
        onClick={() => {
          activate(injected, undefined, true).catch((error) => {
            if (error instanceof UnsupportedChainIdError) {
              activate(injected) // a little janky...can't use setError because the connector isn't set
            } else {
              // TODO: handle error
            }
          })
        }}
      >
        {!account && <Twemoji className="indicator" text=":red_circle:" />}
        &nbsp;
        {account
          ? `Connected to ${account.substring(0, 6)}...${account.substring(
              account.length - 4,
              account.length,
            )}!`
          : "Connect Wallet"}
      </button>
    </div>
  )
}

export default Web3Status
