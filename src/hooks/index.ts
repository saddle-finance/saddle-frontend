import { useAccount, useChainId, useProvider, useSigner } from "wagmi"

import { ChainId } from "../constants/networks"
import { useMemo } from "react"

export function useActiveWeb3React() {
  const chainId = useChainId() as ChainId
  const { address: account } = useAccount()
  const provider = useProvider()
  const { data: signer } = useSigner()
  const library = useMemo(() => signer || provider, [signer, provider])

  const activeWeb3React = useMemo(
    () => ({ chainId, account, library }),
    [chainId, account, library],
  )

  return activeWeb3React
}
