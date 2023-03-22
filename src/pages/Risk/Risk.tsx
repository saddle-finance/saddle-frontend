/* eslint-disable sort-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { IStarknetWindowObject } from "@argent/get-starknet/dist"
import { BigNumber, BigNumberish } from "ethers"
import { Button, Container, Typography } from "@mui/material"
import React, { ReactElement } from "react"
// import { useActiveWeb3React } from "../../hooks"

import {
  addLiquidity,
  callContract,
  connectWallet,
  mintTestToken,
} from "../StarknetTestDapp/starknet-utils"

function Risk(): ReactElement {
  let wallet: IStarknetWindowObject
  const handleConnectClick = async () => {
    const walletConnect = await connectWallet()
    // Check if connection was successful
    if (walletConnect && walletConnect.isConnected) {
      wallet = walletConnect
      console.log("connected wallet account address")
      console.log(wallet.account.address)
    }
  }

  function clickMe() {
    alert("You clicked me!")
  }

  async function handleMintClick0(e) {
    // Prevent the browser from reloading the page
    e.preventDefault()

    const tokenAddress =
      "0x67e0c7132e3d41b3770b68035e1cf947f9b3dfd64e3ccb30242bacf5db7aeb5"
    if (!wallet || !wallet.isConnected) {
      alert("no wallet connected")
    } else {
      const beforeBal = await callContract(tokenAddress, "balanceOf", [
        wallet.account.address,
      ])
      console.log("beforeBal: ", beforeBal)
      await mintTestToken(wallet, tokenAddress)
      console.log("Mint Token0 competed")
      const afterBal = await callContract(tokenAddress, "balanceOf", [
        wallet.account.address,
      ])
      console.log("afterBal: ", afterBal)
    }
  }

  async function handleSubmit(e) {
    // Prevent the browser from reloading the page
    e.preventDefault()

    // Read the form data
    const form = e.target
    const formData = new FormData(form)
    const formJson = Object.fromEntries(formData.entries())

    const swapAddress =
      "0x6166ae39b64bfbc7347634f3e402645bf70751755e9fef78220383f3ce0e0e7"

    const formAmounts: string[] = String(formJson.Amounts).split(",")
    if (!formJson.Amounts) console.log("no amounts provided")
    const amountsInput = formAmounts.map((amount) => BigNumber.from(amount))
    const addLiquidTx = await addLiquidity(
      // TODO biggest problem rn is this account Interface
      wallet,
      swapAddress,
      amountsInput,
      // BigNumber.from(formJson.dx),
      // BigNumber.from(formJson.deadline),
    )
    console.log("addLiquid tx: ", addLiquidTx)
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
      <Button variant="contained" onClick={handleMintClick0}>
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
          Amounts: <input name="Amounts" />
          minToMint: <input name="dx" />
          deadline: <input name="deadline" />
        </label>
        <button type="submit">Submit tx</button>
      </form>
    </Container>
  )
}

export default Risk
