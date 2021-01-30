import {
  BTC_POOL_NAME,
  BTC_SWAP_ADDRESSES,
  BTC_SWAP_TOKEN,
  DAI,
  PoolName,
  RENBTC,
  SBTC,
  STABLECOIN_SWAP_ADDRESSES,
  SUSD,
  TBTC,
  Token,
  USDC,
  USDT,
  WBTC,
} from "../constants"
import { useMemo, useState } from "react"

import { Contract } from "@ethersproject/contracts"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import LPTOKEN_ABI from "../constants/abis/lpToken.json"
import { LpToken } from "../../types/ethers-contracts/LpToken"
import SWAP_ABI from "../constants/abis/swap.json"
import { Swap } from "../../types/ethers-contracts/Swap"
import { getContract } from "../utils"
import { useActiveWeb3React } from "./index"

// returns null on errors
function useContract(
  address: string | undefined,
  ABI: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  withSignerIfPossible = true,
): Contract | null {
  const { library, account } = useActiveWeb3React()

  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(
        address,
        ABI,
        library,
        withSignerIfPossible && account ? account : undefined,
      )
    } catch (error) {
      console.error("Failed to get contract", error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function useTokenContract(
  t: Token,
  withSignerIfPossible?: boolean,
): Contract | null {
  const { chainId } = useActiveWeb3React()
  const tokenAddress = chainId ? t.addresses[chainId] : undefined
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useSwapContract(poolName: PoolName): Swap | null {
  const withSignerIfPossible = true
  const { chainId } = useActiveWeb3React()
  const stablecoinSwapContract = useContract(
    chainId ? STABLECOIN_SWAP_ADDRESSES[chainId] : undefined,
    SWAP_ABI,
    withSignerIfPossible,
  )
  const btcSwapContract = useContract(
    chainId ? BTC_SWAP_ADDRESSES[chainId] : undefined,
    SWAP_ABI,
    withSignerIfPossible,
  )
  return useMemo(() => {
    if (poolName === BTC_POOL_NAME) {
      return btcSwapContract as Swap
    } else {
      return stablecoinSwapContract as Swap
    }
  }, [stablecoinSwapContract, btcSwapContract, poolName])
}

export function useLPTokenContract(poolName: PoolName): LpToken | null {
  const swapContract = useSwapContract(poolName)
  const [lpTokenAddress, setLPTokenAddress] = useState("")
  swapContract
    ?.swapStorage()
    .then(({ lpToken }: { lpToken: string }) => setLPTokenAddress(lpToken))
  return useContract(lpTokenAddress, LPTOKEN_ABI) as LpToken
}

interface AllContractsObject {
  [x: string]: Swap | Erc20 | null
}
export function useAllContracts(): AllContractsObject | null {
  const tbtcContract = useTokenContract(TBTC) as Erc20
  const wbtcContract = useTokenContract(WBTC) as Erc20
  const renbtcContract = useTokenContract(RENBTC) as Erc20
  const sbtcContract = useTokenContract(SBTC) as Erc20
  const daiContract = useTokenContract(DAI) as Erc20
  const usdcContract = useTokenContract(USDC) as Erc20
  const usdtContract = useTokenContract(USDT) as Erc20
  const susdContract = useTokenContract(SUSD) as Erc20
  const btcSwapTokenContract = useTokenContract(BTC_SWAP_TOKEN) as Swap

  return useMemo(() => {
    if (
      ![
        tbtcContract,
        wbtcContract,
        renbtcContract,
        sbtcContract,
        daiContract,
        usdcContract,
        usdtContract,
        susdContract,
        btcSwapTokenContract,
      ].some(Boolean)
    )
      return null
    return {
      [TBTC.symbol]: tbtcContract,
      [WBTC.symbol]: wbtcContract,
      [RENBTC.symbol]: renbtcContract,
      [SBTC.symbol]: sbtcContract,
      [DAI.symbol]: daiContract,
      [USDC.symbol]: usdcContract,
      [USDT.symbol]: usdtContract,
      [SUSD.symbol]: susdContract,
      [BTC_SWAP_TOKEN.symbol]: btcSwapTokenContract,
    }
  }, [
    tbtcContract,
    wbtcContract,
    renbtcContract,
    sbtcContract,
    daiContract,
    usdcContract,
    usdtContract,
    susdContract,
    btcSwapTokenContract,
  ])
}
