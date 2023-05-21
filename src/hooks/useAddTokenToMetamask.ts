import { SUPPORTED_WALLETS, Token } from "../constants"
import { useCallback, useState } from "react"
import { useChainId, useConnect } from "wagmi"

import { ChainId } from "../constants/networks"
import { find } from "lodash"

// @dev https://eips.ethereum.org/EIPS/eip-747#wallet_watchasset
export default function useAddTokenToMetamask(token: Token | undefined): {
  addToken: () => void
  success: boolean | undefined
  canAdd: boolean
} {
  const chainId = useChainId()
  const connector = useConnect()
  const [success] = useState<boolean | undefined>()

  const isMetaMask: boolean =
    find(SUPPORTED_WALLETS, ["connector", connector])?.name == "MetaMask"
  const canAdd = Boolean(
    isMetaMask && chainId && token?.addresses[chainId as ChainId],
  )

  const addToken = useCallback(() => {
    console.log("add")
  }, [])

  return { addToken, success, canAdd }
}
