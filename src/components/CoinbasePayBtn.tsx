import { Box, styled } from "@mui/material"
import React, { useEffect, useRef, useState } from "react"
import CnButtonImg from "../assets/button-cbPay-compact-addCrypto.png"
import { generateOnRampURL } from "@coinbase/cbpay-js"
import { initOnRamp } from "@coinbase/cbpay-js"

const CoinbasePayButton = styled("button")(() => ({
  maxHeight: 40,
  display: "block",
  background: 0,
  border: 0,
  padding: 0,
  margin: 0,
  cursor: "pointer",
  "&:disabled": {
    filter: "saturate(0)",
    cursor: "not-allowed",
  },
}))
const CoinbasePayLinkButton = styled("a")(() => ({
  maxHeight: 40,
  display: "block",
  background: 0,
  border: 0,
  padding: 0,
  margin: 0,
  cursor: "pointer",
  "&:disabled": {
    filter: "saturate(0)",
    cursor: "not-allowed",
  },
}))

const onRampURL = generateOnRampURL({
  appId: "a5662715-5b2c-4c76-8934-4842f3d66746",
  destinationWallets: [
    {
      address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      assets: ["ETH", "USDC"],
    },
  ],
})
const CoinbasePayBtn: React.FC = () => {
  const [isReady, setIsReady] = useState<boolean>(false)
  const cbInstance = useRef<ReturnType<typeof initOnRamp>>()

  useEffect(() => {
    cbInstance.current = initOnRamp({
      appId: "a5662715-5b2c-4c76-8934-4842f3d66746",
      target: "#cbpay-button-container",
      widgetParameters: {
        destinationWallets: [
          {
            address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          },
        ],
      },
      onReady: () => {
        // Update loading/ready states.
        setIsReady(true)
      },
      onSuccess: () => {
        console.log("success")
      },
      onExit: () => {
        console.log("exit")
      },
      onEvent: (event) => {
        // event stream
        console.log(event)
      },
      experienceLoggedIn: "embedded",
      experienceLoggedOut: "popup",
      closeOnExit: true,
      closeOnSuccess: true,
    })
    return () => {
      cbInstance.current?.destroy()
    }
  }, [])

  const handleClick = () => {
    if (cbInstance?.current) {
      cbInstance?.current.open()
    }
  }
  return (
    <Box>
      <CoinbasePayButton
        id="cbpay-button-container"
        onClick={handleClick}
        disabled={!isReady}
      >
        <img src={CnButtonImg} />
      </CoinbasePayButton>
      <CoinbasePayLinkButton href={onRampURL} target="_blank">
        <img src={CnButtonImg} />
      </CoinbasePayLinkButton>
    </Box>
  )
}

export default CoinbasePayBtn
