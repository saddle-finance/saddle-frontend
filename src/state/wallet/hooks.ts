import { useEffect, useState } from "react"

import { Token } from "../../constants"
import { useActiveWeb3React } from "../../hooks"
import { useTokenContract } from "../../hooks/useContract"

export function useTokenBalance(t: Token): number {
  const { account, chainId } = useActiveWeb3React()

  const [tokenBalance, setTokenBalance] = useState(0)
  const address = chainId ? t.addresses[chainId] : undefined
  const tokenContract = useTokenContract(address)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    async function fetchBalances() {
      const balance = await tokenContract?.balanceOf(account)
      setTokenBalance(balance / Math.pow(10, t.decimals))
    }
    if (account && chainId) {
      fetchBalances()
    }
  }, [account, chainId, tokenContract, t])

  return tokenBalance
}
