import {
  BTC_POOL_NAME,
  DAI,
  PoolName,
  RENBTC,
  SBTC,
  SUSD,
  TBTC,
  TEST_BTC_SWAP_ADDRESS,
  TEST_STABLECOIN_SWAP_ADDRESS,
  Token,
  USDC,
  USDT,
  WBTC,
} from "../constants"

import { Contract } from "@ethersproject/contracts"
import ERC20_ABI from "../constants/abis/erc20.json"
import SWAP_ABI from "../constants/abis/swap.json"
import { getContract } from "../utils"
import { useActiveWeb3React } from "./index"
import { useMemo } from "react"

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
  const stablecoinSwapContract = useContract(
    TEST_STABLECOIN_SWAP_ADDRESS,
    SWAP_ABI,
    withSignerIfPossible,
  )
  const btcSwapContract = useContract(
    TEST_BTC_SWAP_ADDRESS,
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
