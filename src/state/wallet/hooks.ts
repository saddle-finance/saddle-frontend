import { BLOCK_TIME, Token } from "../../constants"

import { BigNumber } from "@ethersproject/bignumber"
import { useActiveWeb3React } from "../../hooks"
import usePoller from "../../hooks/usePoller"
import { useState } from "react"
import { useTokenContract } from "../../hooks/useContract"

export function useTokenBalance(t: Token): BigNumber {
  const { account, chainId } = useActiveWeb3React()
  const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0))

  const tokenContract = useTokenContract(t)

  usePoller((): void => {
    async function pollBalance(): Promise<void> {
      const newBalance =
        (await tokenContract?.balanceOf(account)) || BigNumber.from(0)
      if (newBalance !== balance) {
        setBalance(newBalance)
      }
    }
    if (account && chainId) {
      pollBalance()
    }
  }, 2 * BLOCK_TIME)

  return balance
}
