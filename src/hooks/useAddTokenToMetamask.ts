import { SUPPORTED_WALLETS, Token } from "../constants"
import { useCallback, useState } from "react"

import { find } from "lodash"
import { getTokenIconPath } from "../utils"
import { useActiveWeb3React } from "./index"

// @dev https://eips.ethereum.org/EIPS/eip-747#wallet_watchasset
export default function useAddTokenToMetamask(token: Token | undefined): {
  addToken: () => void
  success: boolean | undefined
  canAdd: boolean
} {
  const { library, chainId, connector } = useActiveWeb3React()
  const [success, setSuccess] = useState<boolean | undefined>()

  const isMetaMask: boolean =
    find(SUPPORTED_WALLETS, ["connector", connector])?.name == "MetaMask"
  const canAdd = Boolean(isMetaMask && chainId && token?.addresses[chainId])
  const sdlLogoUrl =
    "https://assets.coingecko.com/coins/images/20476/small/edit_saddle.png?1660734429"

  const addToken = useCallback(() => {
    if (library && library.provider.request && isMetaMask && token && chainId) {
      library.provider
        .request({
          method: "wallet_watchAsset",
          params: {
            //@ts-ignore // need this for incorrect ethers provider type
            type: "ERC20",
            options: {
              address: token.addresses[chainId],
              symbol: token.symbol,
              decimals: token.decimals,
              image:
                token.symbol === "SDL"
                  ? sdlLogoUrl
                  : getTokenIconPath(token.symbol),
            },
          },
        })
        .then((success: boolean) => setSuccess(success))
        .catch(() => setSuccess(false))
    }
  }, [library, token, chainId, isMetaMask])

  return { addToken, success, canAdd }
}
