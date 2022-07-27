import React, { useEffect, useRef } from "react"
import { Button } from "@mui/material"
import { initOnRamp } from "@coinbase/cbpay-js"

const PayWithCoinbaseButton: React.FC = () => {
  const onrampInstance = useRef<ReturnType<typeof initOnRamp>>()

  useEffect(() => {
    onrampInstance.current = initOnRamp({
      appId: "5662715-5b2c-4c76-8934-4842f3d66746",
      widgetParameters: {
        destinationWallets: [
          {
            address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            blockchains: ["ethereum", "avalanche-c-chain"],
          },
        ],
      },
      onReady: () => {
        console.log("ready")
      },
      onSuccess: () => {
        console.log("success")
      },
      onExit: () => {
        console.log("exit")
      },
      onEvent: (event) => {
        console.log("event", event)
      },
      experienceLoggedIn: "embedded",
      experienceLoggedOut: "popup",
      closeOnExit: true,
      closeOnSuccess: true,
    })
    return () => {
      onrampInstance.current?.destroy()
    }
  }, [])

  const handleClick = () => {
    onrampInstance.current?.open()
  }

  return (
    <Button onClick={handleClick} id="cbpay-button-container">
      Buy with Coinbase
    </Button>
  )
}

export default PayWithCoinbaseButton
