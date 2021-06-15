import {
  ALETH,
  ALETH_POOL_NAME,
  ALETH_SWAP_ADDRESSES,
  ALETH_SWAP_TOKEN,
  BRIDGE_CONTRACT_ADDRESSES,
  BTC_POOL_NAME,
  BTC_SWAP_ADDRESSES,
  BTC_SWAP_TOKEN,
  DAI,
  PoolName,
  RENBTC,
  SBTC,
  SETH,
  STABLECOIN_POOL_NAME,
  STABLECOIN_SWAP_ADDRESSES,
  STABLECOIN_SWAP_TOKEN,
  TBTC,
  Token,
  USDC,
  USDT,
  VETH2,
  VETH2_POOL_NAME,
  VETH2_SWAP_ADDRESSES,
  VETH2_SWAP_TOKEN,
  WBTC,
  WETH,
} from "../constants"
import { useMemo, useState } from "react"

import BRIDGE_CONTRACT_ABI from "../constants/abis/bridge.json"
import { Bridge } from "../../types/ethers-contracts/Bridge"
import { Contract } from "@ethersproject/contracts"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import LPTOKEN_GUARDED_ABI from "../constants/abis/lpTokenGuarded.json"
import LPTOKEN_UNGUARDED_ABI from "../constants/abis/lpTokenUnguarded.json"
import { LpTokenGuarded } from "../../types/ethers-contracts/LpTokenGuarded"
import { LpTokenUnguarded } from "../../types/ethers-contracts/LpTokenUnguarded"
import SWAP_FLASH_LOAN_ABI from "../constants/abis/swapFlashLoan.json"
import SWAP_FLASH_LOAN_NO_WITHDRAW_FEE_ABI from "../constants/abis/swapFlashLoanNoWithdrawFee.json"
import SWAP_GUARDED_ABI from "../constants/abis/swapGuarded.json"
import { SwapFlashLoan } from "../../types/ethers-contracts/SwapFlashLoan"
import { SwapFlashLoanNoWithdrawFee } from "../../types/ethers-contracts/SwapFlashLoanNoWithdrawFee"
import { SwapGuarded } from "../../types/ethers-contracts/SwapGuarded"
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

export function useBridgeContract(): Bridge | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? BRIDGE_CONTRACT_ADDRESSES[chainId]
    : undefined
  return useContract(contractAddress, BRIDGE_CONTRACT_ABI) as Bridge
}

export function useTokenContract(
  t: Token,
  withSignerIfPossible?: boolean,
): Contract | null {
  const { chainId } = useActiveWeb3React()
  const tokenAddress = chainId ? t.addresses[chainId] : undefined
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useSwapBTCContract(): SwapGuarded | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    chainId ? BTC_SWAP_ADDRESSES[chainId] : undefined,
    SWAP_GUARDED_ABI,
  ) as SwapGuarded
}

export function useSwapUSDContract(): SwapFlashLoan | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    chainId ? STABLECOIN_SWAP_ADDRESSES[chainId] : undefined,
    SWAP_FLASH_LOAN_ABI,
  ) as SwapFlashLoan
}

export function useSwapVETH2Contract(): SwapFlashLoan | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    chainId ? VETH2_SWAP_ADDRESSES[chainId] : undefined,
    SWAP_FLASH_LOAN_ABI,
  ) as SwapFlashLoan
}

export function useSwapALETHContract(): SwapFlashLoanNoWithdrawFee | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    chainId ? ALETH_SWAP_ADDRESSES[chainId] : undefined,
    SWAP_FLASH_LOAN_NO_WITHDRAW_FEE_ABI,
  ) as SwapFlashLoanNoWithdrawFee
}

export function useSwapContract<T extends PoolName>(
  poolName?: T,
): T extends typeof BTC_POOL_NAME
  ? SwapGuarded | null
  : SwapFlashLoan | SwapFlashLoanNoWithdrawFee | null
export function useSwapContract(
  poolName?: PoolName,
): SwapGuarded | SwapFlashLoan | SwapFlashLoanNoWithdrawFee | null {
  const usdSwapContract = useSwapUSDContract()
  const btcSwapContract = useSwapBTCContract()
  const veth2SwapContract = useSwapVETH2Contract()
  const alethSwapContract = useSwapALETHContract()
  if (poolName === BTC_POOL_NAME) {
    return btcSwapContract
  } else if (poolName === STABLECOIN_POOL_NAME) {
    return usdSwapContract
  } else if (poolName === VETH2_POOL_NAME) {
    return veth2SwapContract
  } else if (poolName === ALETH_POOL_NAME) {
    return alethSwapContract
  }
  return null
}

export function useLPTokenContract<T extends PoolName>(
  poolName: T,
): T extends typeof BTC_POOL_NAME
  ? LpTokenGuarded | null
  : LpTokenUnguarded | null
export function useLPTokenContract(
  poolName: PoolName,
): LpTokenUnguarded | LpTokenGuarded | null {
  const swapContract = useSwapContract(poolName)
  const [lpTokenAddress, setLPTokenAddress] = useState("")
  void swapContract
    ?.swapStorage()
    .then(({ lpToken }: { lpToken: string }) => setLPTokenAddress(lpToken))
  const lpTokenGuarded = useContract(
    lpTokenAddress,
    LPTOKEN_GUARDED_ABI,
  ) as LpTokenGuarded
  const lpTokenUnguarded = useContract(
    lpTokenAddress,
    LPTOKEN_UNGUARDED_ABI,
  ) as LpTokenUnguarded
  return poolName === BTC_POOL_NAME ? lpTokenGuarded : lpTokenUnguarded
}

interface AllContractsObject {
  [x: string]: LpTokenGuarded | LpTokenUnguarded | Erc20 | null
}
export function useAllContracts(): AllContractsObject | null {
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
  const btcSwapTokenContract = useTokenContract(
    BTC_SWAP_TOKEN,
  ) as LpTokenGuarded
  const stablecoinSwapTokenContract = useTokenContract(
    STABLECOIN_SWAP_TOKEN,
  ) as LpTokenUnguarded
  const veth2SwapTokenContract = useTokenContract(
    VETH2_SWAP_TOKEN,
  ) as LpTokenUnguarded
  const alethSwapTokenContract = useTokenContract(
    ALETH_SWAP_TOKEN,
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
        btcSwapTokenContract,
        stablecoinSwapTokenContract,
        veth2SwapTokenContract,
        alethSwapTokenContract,
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
      [BTC_SWAP_TOKEN.symbol]: btcSwapTokenContract,
      [STABLECOIN_SWAP_TOKEN.symbol]: stablecoinSwapTokenContract,
      [VETH2_SWAP_TOKEN.symbol]: veth2SwapTokenContract,
      [ALETH_SWAP_TOKEN.symbol]: alethSwapTokenContract,
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
    btcSwapTokenContract,
    stablecoinSwapTokenContract,
    veth2SwapTokenContract,
    alethSwapTokenContract,
  ])
}
