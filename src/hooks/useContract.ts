import {
  ALETH,
  ALETH_SWAP_TOKEN,
  ALUSD,
  BRIDGE_CONTRACT_ADDRESSES,
  BTC_POOL_NAME,
  BTC_SWAP_TOKEN,
  D4_SWAP_TOKEN,
  DAI,
  FEI,
  FRAX,
  LUSD,
  POOLS_MAP,
  PoolName,
  RENBTC,
  SBTC,
  SETH,
  STABLECOIN_SWAP_TOKEN,
  STABLECOIN_SWAP_V2_TOKEN,
  SUSD,
  SUSD_SWAP_TOKEN,
  SWAP_MIGRATOR_USD_CONTRACT_ADDRESSES,
  SYNTHETIX_CONTRACT_ADDRESSES,
  SYNTHETIX_EXCHANGE_RATES_CONTRACT_ADDRESSES,
  TBTC,
  Token,
  USDC,
  USDT,
  VETH2,
  VETH2_SWAP_TOKEN,
  WBTC,
  WETH,
  isLegacySwapABIPool,
  isMetaPool,
} from "../constants"

import BRIDGE_CONTRACT_ABI from "../constants/abis/bridge.json"
import { Bridge } from "../../types/ethers-contracts/Bridge"
import { Contract } from "@ethersproject/contracts"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import LPTOKEN_GUARDED_ABI from "../constants/abis/lpTokenGuarded.json"
import LPTOKEN_UNGUARDED_ABI from "../constants/abis/lpTokenUnguarded.json"
import { LpTokenGuarded } from "../../types/ethers-contracts/LpTokenGuarded"
import { LpTokenUnguarded } from "../../types/ethers-contracts/LpTokenUnguarded"
import META_SWAP_DEPOSIT_ABI from "../constants/abis/metaSwapDeposit.json"
import MIGRATOR_USD_CONTRACT_ABI from "../constants/abis/swapMigratorUSD.json"
import { MetaSwapDeposit } from "../../types/ethers-contracts/MetaSwapDeposit"
import SWAP_FLASH_LOAN_ABI from "../constants/abis/swapFlashLoan.json"
import SWAP_FLASH_LOAN_NO_WITHDRAW_FEE_ABI from "../constants/abis/swapFlashLoanNoWithdrawFee.json"
import SWAP_GUARDED_ABI from "../constants/abis/swapGuarded.json"
import SYNTHETIX_EXCHANGE_RATE_CONTRACT_ABI from "../constants/abis/synthetixExchangeRate.json"
import SYNTHETIX_NETWORK_TOKEN_CONTRACT_ABI from "../constants/abis/synthetixNetworkToken.json"
import { SwapFlashLoan } from "../../types/ethers-contracts/SwapFlashLoan"
import { SwapFlashLoanNoWithdrawFee } from "../../types/ethers-contracts/SwapFlashLoanNoWithdrawFee"
import { SwapGuarded } from "../../types/ethers-contracts/SwapGuarded"
import { SwapMigratorUSD } from "../../types/ethers-contracts/SwapMigratorUSD"
import { SynthetixExchangeRate } from "../../types/ethers-contracts/SynthetixExchangeRate"
import { SynthetixNetworkToken } from "../../types/ethers-contracts/SynthetixNetworkToken"
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

export function useSwapMigratorUSDContract(): SwapMigratorUSD | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? SWAP_MIGRATOR_USD_CONTRACT_ADDRESSES[chainId]
    : undefined
  return useContract(
    contractAddress,
    MIGRATOR_USD_CONTRACT_ABI,
  ) as SwapMigratorUSD
}

export function useBridgeContract(): Bridge | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? BRIDGE_CONTRACT_ADDRESSES[chainId]
    : undefined
  return useContract(contractAddress, BRIDGE_CONTRACT_ABI) as Bridge
}

export function useSynthetixContract(): SynthetixNetworkToken | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? SYNTHETIX_CONTRACT_ADDRESSES[chainId]
    : undefined
  return useContract(
    contractAddress,
    SYNTHETIX_NETWORK_TOKEN_CONTRACT_ABI,
  ) as SynthetixNetworkToken
}

export function useSynthetixExchangeRatesContract(): SynthetixExchangeRate | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? SYNTHETIX_EXCHANGE_RATES_CONTRACT_ADDRESSES[chainId]
    : undefined
  return useContract(
    contractAddress,
    SYNTHETIX_EXCHANGE_RATE_CONTRACT_ABI,
  ) as SynthetixExchangeRate
}

export function useTokenContract(
  t: Token,
  withSignerIfPossible?: boolean,
): Contract | null {
  const { chainId } = useActiveWeb3React()
  const tokenAddress = chainId ? t.addresses[chainId] : undefined
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useSwapContract<T extends PoolName>(
  poolName?: T,
): T extends typeof BTC_POOL_NAME
  ? SwapGuarded | null
  : SwapFlashLoan | SwapFlashLoanNoWithdrawFee | MetaSwapDeposit | null
export function useSwapContract(
  poolName?: PoolName,
):
  | SwapGuarded
  | SwapFlashLoan
  | SwapFlashLoanNoWithdrawFee
  | MetaSwapDeposit
  | null {
  const { chainId, account, library } = useActiveWeb3React()
  return useMemo(() => {
    if (!poolName || !library || !chainId) return null
    try {
      const pool = POOLS_MAP[poolName]
      if (poolName === BTC_POOL_NAME) {
        return getContract(
          pool.addresses[chainId],
          SWAP_GUARDED_ABI,
          library,
          account ?? undefined,
        ) as SwapGuarded
      } else if (isLegacySwapABIPool(poolName)) {
        return getContract(
          pool.addresses[chainId],
          SWAP_FLASH_LOAN_ABI,
          library,
          account ?? undefined,
        ) as SwapFlashLoan
      } else if (isMetaPool(poolName)) {
        return getContract(
          pool.addresses[chainId],
          META_SWAP_DEPOSIT_ABI,
          library,
          account ?? undefined,
        ) as MetaSwapDeposit
      } else if (pool) {
        return getContract(
          pool.addresses[chainId],
          SWAP_FLASH_LOAN_NO_WITHDRAW_FEE_ABI,
          library,
          account ?? undefined,
        ) as SwapFlashLoanNoWithdrawFee
      } else {
        return null
      }
    } catch (error) {
      console.error("Failed to get contract", error)
      return null
    }
  }, [chainId, library, account, poolName])
}

export function useLPTokenContract<T extends PoolName>(
  poolName: T,
): T extends typeof BTC_POOL_NAME
  ? LpTokenGuarded | null
  : LpTokenUnguarded | null
export function useLPTokenContract(
  poolName: PoolName,
): LpTokenUnguarded | LpTokenGuarded | null {
  const { chainId, account, library } = useActiveWeb3React()
  return useMemo(() => {
    if (!poolName || !library || !chainId) return null
    try {
      const pool = POOLS_MAP[poolName]
      if (poolName == BTC_POOL_NAME) {
        return getContract(
          pool.lpToken.addresses[chainId],
          LPTOKEN_GUARDED_ABI,
          library,
          account ?? undefined,
        ) as LpTokenGuarded
      } else {
        return getContract(
          pool.lpToken.addresses[chainId],
          LPTOKEN_UNGUARDED_ABI,
          library,
          account ?? undefined,
        ) as LpTokenUnguarded
      }
    } catch (error) {
      console.error("Failed to get contract", error)
      return null
    }
  }, [chainId, library, account, poolName])
}

interface AllContractsObject {
  [x: string]: LpTokenGuarded | LpTokenUnguarded | Erc20 | null
}
export function useAllContracts(): AllContractsObject | null {
  const susdContract = useTokenContract(SUSD) as Erc20
  const tbtcContract = useTokenContract(TBTC) as Erc20
  const wbtcContract = useTokenContract(WBTC) as Erc20
  const renbtcContract = useTokenContract(RENBTC) as Erc20
  const sbtcContract = useTokenContract(SBTC) as Erc20
  const daiContract = useTokenContract(DAI) as Erc20
  const usdcContract = useTokenContract(USDC) as Erc20
  const usdtContract = useTokenContract(USDT) as Erc20
  const wethContract = useTokenContract(WETH) as Erc20
  const veth2Contract = useTokenContract(VETH2) as Erc20
  const alethContract = useTokenContract(ALETH) as Erc20
  const sethContract = useTokenContract(SETH) as Erc20
  const alusdContract = useTokenContract(ALUSD) as Erc20
  const feiContract = useTokenContract(FEI) as Erc20
  const fraxContract = useTokenContract(FRAX) as Erc20
  const lusdContract = useTokenContract(LUSD) as Erc20
  const btcSwapTokenContract = useTokenContract(
    BTC_SWAP_TOKEN,
  ) as LpTokenGuarded
  const stablecoinSwapTokenContract = useTokenContract(
    STABLECOIN_SWAP_TOKEN,
  ) as LpTokenUnguarded
  const stablecoinSwapV2TokenContract = useTokenContract(
    STABLECOIN_SWAP_V2_TOKEN,
  ) as LpTokenUnguarded
  const veth2SwapTokenContract = useTokenContract(
    VETH2_SWAP_TOKEN,
  ) as LpTokenUnguarded
  const alethSwapTokenContract = useTokenContract(
    ALETH_SWAP_TOKEN,
  ) as LpTokenUnguarded
  const d4SwapTokenContract = useTokenContract(
    D4_SWAP_TOKEN,
  ) as LpTokenUnguarded
  const susdSwapTokenContract = useTokenContract(
    SUSD_SWAP_TOKEN,
  ) as LpTokenUnguarded

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
        wethContract,
        veth2Contract,
        alethContract,
        sethContract,
        alusdContract,
        feiContract,
        fraxContract,
        lusdContract,
        susdContract,
        btcSwapTokenContract,
        stablecoinSwapTokenContract,
        stablecoinSwapV2TokenContract,
        veth2SwapTokenContract,
        alethSwapTokenContract,
        d4SwapTokenContract,
        susdSwapTokenContract,
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
      [WETH.symbol]: wethContract,
      [VETH2.symbol]: veth2Contract,
      [ALETH.symbol]: alethContract,
      [SETH.symbol]: sethContract,
      [ALUSD.symbol]: alusdContract,
      [FEI.symbol]: feiContract,
      [FRAX.symbol]: fraxContract,
      [LUSD.symbol]: lusdContract,
      [SUSD.symbol]: susdContract,
      [BTC_SWAP_TOKEN.symbol]: btcSwapTokenContract,
      [STABLECOIN_SWAP_TOKEN.symbol]: stablecoinSwapTokenContract,
      [STABLECOIN_SWAP_V2_TOKEN.symbol]: stablecoinSwapV2TokenContract,
      [VETH2_SWAP_TOKEN.symbol]: veth2SwapTokenContract,
      [ALETH_SWAP_TOKEN.symbol]: alethSwapTokenContract,
      [D4_SWAP_TOKEN.symbol]: d4SwapTokenContract,
      [SUSD_SWAP_TOKEN.symbol]: susdSwapTokenContract,
    }
  }, [
    tbtcContract,
    wbtcContract,
    renbtcContract,
    sbtcContract,
    daiContract,
    usdcContract,
    usdtContract,
    wethContract,
    veth2Contract,
    alethContract,
    sethContract,
    alusdContract,
    feiContract,
    fraxContract,
    lusdContract,
    susdContract,
    btcSwapTokenContract,
    stablecoinSwapTokenContract,
    stablecoinSwapV2TokenContract,
    veth2SwapTokenContract,
    alethSwapTokenContract,
    d4SwapTokenContract,
    susdSwapTokenContract,
  ])
}
