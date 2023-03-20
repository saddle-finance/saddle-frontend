/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Button, Container, Typography } from "@mui/material"
import React, { ReactElement } from "react"
// import { useActiveWeb3React } from "../../hooks"
// import {
//   addWalletChangeListener,
//   chainId,
//   connectWallet,
//   removeWalletChangeListener,
//   silentConnectWallet,
// } from "../StarknetTestDapp/starknet-utils"
import { connectWallet } from "../StarknetTestDapp/starknet-utils"

function Risk(): ReactElement {
  const handleConnectClick = async () => {
    const wallet = await connectWallet()
    // Check if connection was successful
    if (wallet && wallet.isConnected) {
      console.log("connected wallet account address")
      console.log(wallet.account.address)
    }
  }

  function clickMe() {
    alert("You clicked me!")
  }

  function handleSubmit(e) {
    // Prevent the browser from reloading the page
    e.preventDefault()

    // Read the form data
    const form = e.target
    const formData = new FormData(form)

    // Or you can work with it as a plain object:
    const formJson = Object.fromEntries(formData.entries())
    console.log(formJson)
  }

  return (
    <Container maxWidth="md" sx={{ pb: 16 }}>
      <Typography variant="h3" mt={5} mb={2}>
        Connect Arget-X Walllet
      </Typography>
      <Button variant="contained" onClick={handleConnectClick}>
        {" "}
        Connect Wallet{" "}
      </Button>
      <Typography variant="h3" mt={5} mb={2}>
        Mint Dummy Token 0
      </Typography>
      <Button variant="contained" onClick={clickMe}>
        {" "}
        Mint{" "}
      </Button>
      <Typography variant="h3" mt={5} mb={2}>
        Mint Dummy Token 1
      </Typography>
      <Button variant="contained" onClick={clickMe}>
        {" "}
        Mint{" "}
      </Button>
      <Typography variant="h3" mt={5} mb={2}>
        approve swap usage of tokens
      </Typography>
      <Button variant="contained" onClick={clickMe}>
        {" "}
        Approve{" "}
      </Button>
      <Typography variant="h3" mt={5} mb={2}>
        Add Liquidity to swap
      </Typography>
      <form method="post" onSubmit={handleSubmit}>
        <label>
          Amounts: <input name="Amout" />
          minToMint: <input name="dx" />
          deadline: <input name="deadline" />
        </label>
        <button type="submit">Submit tx</button>
      </form>
    </Container>
  )
}

export default Risk
