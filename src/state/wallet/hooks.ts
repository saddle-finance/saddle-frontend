import { BLOCK_TIME, DAI, STABLECOIN_POOL_NAME, Token } from "../../constants"
import {
  BTC_POOL_NAME,
  PoolName,
  RENBTC,
  SBTC,
  TBTC,
  USDC,
  USDT,
  WBTC,
} from "../../constants"

import { BigNumber } from "@ethersproject/bignumber"
import { Erc20 } from "../../../types/ethers-contracts/Erc20"
import { Zero } from "@ethersproject/constants"
import { useActiveWeb3React } from "../../hooks"
import { useMemo } from "react"
import usePoller from "../../hooks/usePoller"
import { useState } from "react"
import { useTokenContract } from "../../hooks/useContract"

export function useTokenBalance(t: Token): BigNumber {
  const { account, chainId } = useActiveWeb3React()
  const [balance, setBalance] = useState<BigNumber>(Zero)

  const tokenContract = useTokenContract(t) as Erc20

  usePoller((): void => {
    async function pollBalance(): Promise<void> {
      const newBalance = account
        ? await tokenContract?.balanceOf(account)
        : Zero
      if (newBalance !== balance) {
        setBalance(newBalance)
      }
    }
    if (account && chainId) {
      void pollBalance()
    }
  }, BLOCK_TIME)

  return balance
}

export function usePoolTokenBalances(
  poolName: PoolName,
): { [token: string]: BigNumber } | null {
  const tbtcTokenBalance = useTokenBalance(TBTC)
  const wbtcTokenBalance = useTokenBalance(WBTC)
  const renbtcTokenBalance = useTokenBalance(RENBTC)
  const sbtcTokenBalance = useTokenBalance(SBTC)
  const daiTokenBalance = useTokenBalance(DAI)
  const usdcTokenBalance = useTokenBalance(USDC)
  const usdtTokenBalance = useTokenBalance(USDT)
  const btcPoolTokenBalances = useMemo(
    () => ({
      [TBTC.symbol]: tbtcTokenBalance,
      [WBTC.symbol]: wbtcTokenBalance,
      [RENBTC.symbol]: renbtcTokenBalance,
      [SBTC.symbol]: sbtcTokenBalance,
    }),
    [tbtcTokenBalance, wbtcTokenBalance, renbtcTokenBalance, sbtcTokenBalance],
  )
  const stablecoinPoolTokenBalances = useMemo(
    () => ({
      [DAI.symbol]: daiTokenBalance,
      [USDC.symbol]: usdcTokenBalance,
      [USDT.symbol]: usdtTokenBalance,
    }),
    [daiTokenBalance, usdcTokenBalance, usdtTokenBalance],
  )

  if (poolName === BTC_POOL_NAME) {
    return btcPoolTokenBalances
  } else if (poolName === STABLECOIN_POOL_NAME) {
    return stablecoinPoolTokenBalances
  }
  return null
}
