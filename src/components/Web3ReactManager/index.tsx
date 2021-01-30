import React, { useEffect, useState } from "react"
import { useEagerConnect, useInactiveListener } from "../../hooks"

import { NetworkContextName } from "../../constants"
import { network } from "../../connectors"
import { useWeb3React } from "@web3-react/core"

export default function Web3ReactManager({
  children,
}: {
  children: JSX.Element
}): JSX.Element | null {
  const { active } = useWeb3React()
  const {
    active: networkActive,
    error: networkError,
    activate: activateNetwork,
  } = useWeb3React(NetworkContextName)

  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // after eagerly trying injected, if the network connect ever isn't active or in an error state, activate it
  useEffect(() => {
    if (triedEager && !networkActive && !networkError && !active) {
      void activateNetwork(network)
    }
  }, [triedEager, networkActive, networkError, activateNetwork, active])

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager)

  // handle delayed loader state
  const [showLoader, setShowLoader] = useState(false)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoader(true)
    }, 600)

    return (): void => {
      clearTimeout(timeout)
    }
  }, [])

  // on page load, do nothing until we've tried to connect to the injected connector
  if (!triedEager) {
    return null
  }

  // if the account context isn't active, and there's an error on the network context, it's an irrecoverable error
  if (!active && networkError) {
    return (
      // TODO: style
      <h1>Unknown error</h1>
    )
  }

  // if neither context is active, spin
  if (!active && !networkActive) {
    // TODO: style and/or add proper loader
    return showLoader ? <h1>Loading...</h1> : null
  }

  return children
}
