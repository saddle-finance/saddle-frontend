import {
  BTC_POOL_NAME,
  BTC_SWAP_ADDRESSES,
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
import LPTOKEN_ABI from "../constants/abis/lpToken.json"
import SWAP_ABI from "../constants/abis/swap.json"
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

export function useSwapContract(poolName: PoolName): Contract | null {
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
      return btcSwapContract
    } else {
      return stablecoinSwapContract
    }
  }, [stablecoinSwapContract, btcSwapContract, poolName])
}

export function useLPTokenContract(poolName: PoolName): Contract | null {
  const swapContract = useSwapContract(poolName)
  const [lpTokenAddress, setLPTokenAddress] = useState("")
  swapContract
    ?.swapStorage()
    .then(({ lpToken }: { lpToken: string }) => setLPTokenAddress(lpToken))
  return useContract(lpTokenAddress, LPTOKEN_ABI)
}

interface AllContractsObject {
  [x: string]: Contract | null
}
export function useAllContracts(): AllContractsObject | null {
  const tbtcContract = useTokenContract(TBTC)
  const wbtcContract = useTokenContract(WBTC)
  const renbtcContract = useTokenContract(RENBTC)
  const sbtcContract = useTokenContract(SBTC)
  const daiContract = useTokenContract(DAI)
  const usdcContract = useTokenContract(USDC)
  const usdtContract = useTokenContract(USDT)
  const susdContract = useTokenContract(SUSD)

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
  ])
}
