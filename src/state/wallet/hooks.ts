import { BLOCK_TIME, Token } from "../../constants"
import {
  BTC_POOL_NAME,
  PoolName,
  RENBTC,
  SBTC,
  TBTC,
  WBTC,
} from "../../constants"

import { BigNumber } from "@ethersproject/bignumber"
import { useActiveWeb3React } from "../../hooks"
import { useMemo } from "react"
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
  }, BLOCK_TIME)

  return balance
}

export function usePoolTokenBalances(
  poolName: PoolName,
): { [token: string]: BigNumber } | null {
  const tbtcTokenBalance = useTokenBalance(TBTC)
  const wtcTokenBalance = useTokenBalance(WBTC)
  const renbtcTokenBalance = useTokenBalance(RENBTC)
  const sbtcTokenBalance = useTokenBalance(SBTC)
  const btcPoolTokenBalances = useMemo(
    () => ({
      [TBTC.symbol]: tbtcTokenBalance,
      [WBTC.symbol]: wtcTokenBalance,
      [RENBTC.symbol]: renbtcTokenBalance,
      [SBTC.symbol]: sbtcTokenBalance,
    }),
    [tbtcTokenBalance, wtcTokenBalance, renbtcTokenBalance, sbtcTokenBalance],
  )

  if (poolName === BTC_POOL_NAME) {
    return btcPoolTokenBalances
  }
  return null
}
