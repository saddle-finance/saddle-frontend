import { SUPPORTED_WALLETS, Token } from "../constants"
import { useCallback, useState } from "react"
import { find } from "lodash"
import { useActiveWeb3React } from "./index"

export default function useAddTokenToMetamask(
  token: Token | undefined,
): {
  addToken: () => void
  success: boolean | undefined
} {
  const { library, chainId, connector } = useActiveWeb3React()
  const [success, setSuccess] = useState<boolean | undefined>()

  const isMetaMask: boolean =
    find(SUPPORTED_WALLETS, ["connector", connector])?.name == "MetaMask"

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
            },
          },
        })
        .then((success) => setSuccess(success))
        .catch(() => setSuccess(false))
    }
  }, [library, token])

  return { addToken, success }
}
