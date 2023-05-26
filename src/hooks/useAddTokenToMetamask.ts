import { useCallback, useState } from "react"

import { Token } from "../constants"
import { getTokenIconPath } from "../utils"
import { useAccount } from "wagmi"
import { useActiveWeb3React } from "."

// @dev https://eips.ethereum.org/EIPS/eip-747#wallet_watchasset
export default function useAddTokenToMetamask(token: Token | undefined): {
  addToken: () => void
  success: boolean | undefined
  canAdd: boolean
} {
  const { chainId } = useActiveWeb3React()
  const { connector: activeConnector } = useAccount()
  const [success, setSuccess] = useState<boolean | undefined>()

  const isMetaMask = activeConnector?.name === "MetaMask"
  const canAdd = Boolean(isMetaMask && chainId && token?.addresses[chainId])

  const addToken = useCallback(() => {
    if (activeConnector && isMetaMask && token) {
      activeConnector
        .watchAsset?.({
          address: token.addresses[chainId],
          symbol: token.symbol,
          decimals: token.decimals,
          image: getTokenIconPath(token.symbol),
        })
        .then((success: boolean) => setSuccess(success))
        .catch(() => setSuccess(false))
    }
  }, [activeConnector, chainId, isMetaMask, token])

  return { addToken, success, canAdd }
}
