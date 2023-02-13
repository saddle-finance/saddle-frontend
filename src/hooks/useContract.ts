import {
  BRIDGE_CONTRACT_ADDRESSES,
  BTC_POOL_NAME,
  CHILD_ORACLE_CONTRACT_ADDRESSES,
  FEE_DISTRIBUTOR_ADDRESSES,
  GAUGE_CONTROLLER_ADDRESSES,
  GAUGE_MINTER_ADDRESSES,
  GENERALIZED_SWAP_MIGRATOR_CONTRACT_ADDRESSES,
  MASTER_REGISTRY_CONTRACT_ADDRESSES,
  MINICHEF_CONTRACT_ADDRESSES,
  RETROACTIVE_VESTING_CONTRACT_ADDRESSES,
  ROOT_GAUGE_FACTORY_CONTRACT_ADDRESSES,
  SDL_TOKEN_ADDRESSES,
  SDL_WETH_SUSHI_LP_CONTRACT_ADDRESSES,
  SYNTHETIX_CONTRACT_ADDRESSES,
  SYNTHETIX_EXCHANGE_RATES_CONTRACT_ADDRESSES,
  Token,
  VOTING_ESCROW_CONTRACT_ADDRESS,
} from "../constants"
import { Contract, ContractInterface } from "@ethersproject/contracts"
import { createMultiCallContract, getContract, getSwapContract } from "../utils"
import { useContext, useEffect, useMemo, useState } from "react"

import { AddressZero } from "@ethersproject/constants"
import BRIDGE_CONTRACT_ABI from "../constants/abis/bridge.json"
import { BasicPoolsContext } from "../providers/BasicPoolsProvider"
import { Bridge } from "../../types/ethers-contracts/Bridge"
import CHILD_GAUGE_ABI from "../constants/abis/childGauge.json"
import CHILD_GAUGE_FACTORY_ABI from "../constants/abis/childGaugeFactory.json"
import CHILD_ORACLE_ABI from "../constants/abis/childOracle.json"
import { ChainId } from "../constants/networks"
import { ChildGauge } from "../../types/ethers-contracts/ChildGauge"
import { ChildGaugeFactory } from "../../types/ethers-contracts/ChildGaugeFactory"
import { ChildOracle } from "../../types/ethers-contracts/ChildOracle"
import ERC20_ABI from "../constants/abis/erc20.json"
import FEE_DISTRIBUTOR_ABI from "../constants/abis/feeDistributor.json"
import { FeeDistributor } from "../../types/ethers-contracts/FeeDistributor"
import GAUGE_CONTROLLER_ABI from "../constants/abis/gaugeController.json"
import GAUGE_MINTER_ABI from "../constants/abis/minter.json"
import GENERALIZED_SWAP_MIGRATOR_CONTRACT_ABI from "../constants/abis/generalizedSwapMigrator.json"
import { GaugeController } from "../../types/ethers-contracts/GaugeController"
import { GeneralizedSwapMigrator } from "../../types/ethers-contracts/GeneralizedSwapMigrator"
import { IS_VESDL_LIVE } from "./../constants/index"
import LIQUIDITY_V5_GAUGE_ABI from "../constants/abis/liquidityGaugeV5.json"
import LPTOKEN_GUARDED_ABI from "../constants/abis/lpTokenGuarded.json"
import LPTOKEN_UNGUARDED_ABI from "../constants/abis/lpTokenUnguarded.json"
import { LiquidityGaugeV5 } from "./../../types/ethers-contracts/LiquidityGaugeV5"
import { LpTokenGuarded } from "../../types/ethers-contracts/LpTokenGuarded"
import { LpTokenUnguarded } from "../../types/ethers-contracts/LpTokenUnguarded"
import MASTER_REGISTRY_ABI from "../constants/abis/masterRegistry.json"
import MINICHEF_CONTRACT_ABI from "../constants/abis/miniChef.json"
import { MasterRegistry } from "../../types/ethers-contracts/MasterRegistry"
import { MetaSwapDeposit } from "../../types/ethers-contracts/MetaSwapDeposit"
import { MiniChef } from "../../types/ethers-contracts/MiniChef"
import { Minter } from "../../types/ethers-contracts/Minter"
import { MulticallContract } from "../types/ethcall"
import PERMISSIONLESS_DEPLOYER_ABI from "../constants/abis/permissionlessDeployer.json"
import POOL_REGISTRY_ABI from "../constants/abis/poolRegistry.json"
import { PermissionlessDeployer } from "../../types/ethers-contracts/PermissionlessDeployer"
import { PoolRegistry } from "../../types/ethers-contracts/PoolRegistry"
import RETROACTIVE_VESTING_CONTRACT_ABI from "../constants/abis/retroactiveVesting.json"
import ROOT_GAUGE_FACTORY_ABI from "../constants/abis/rootGaugeFactory.json"
import { RetroactiveVesting } from "../../types/ethers-contracts/RetroactiveVesting"
import { RootGaugeFactory } from "../../types/ethers-contracts/RootGaugeFactory"
import SDL_TOKEN_ABI from "../constants/abis/sdl.json"
import SUSHI_POOL_ABI from "../constants/abis/sushiPool.json"
import SYNTHETIX_EXCHANGE_RATE_CONTRACT_ABI from "../constants/abis/synthetixExchangeRate.json"
import SYNTHETIX_NETWORK_TOKEN_CONTRACT_ABI from "../constants/abis/synthetixNetworkToken.json"
import { Sdl } from "../../types/ethers-contracts/Sdl"
import { SushiPool } from "./../../types/ethers-contracts/SushiPool.d"
import { SwapFlashLoan } from "../../types/ethers-contracts/SwapFlashLoan"
import { SwapFlashLoanNoWithdrawFee } from "../../types/ethers-contracts/SwapFlashLoanNoWithdrawFee"
import { SwapGuarded } from "../../types/ethers-contracts/SwapGuarded"
import { SynthetixExchangeRate } from "../../types/ethers-contracts/SynthetixExchangeRate"
import { SynthetixNetworkToken } from "../../types/ethers-contracts/SynthetixNetworkToken"
import VOTING_ESCROW_CONTRACT_ABI from "../constants/abis/votingEscrow.json"
import { VotingEscrow } from "../../types/ethers-contracts/VotingEscrow"
import { Web3Provider } from "@ethersproject/providers"
import { formatBytes32String } from "@ethersproject/strings"
import { useActiveWeb3React } from "./index"

export const POOL_REGISTRY_NAME = "PoolRegistry"
export const CHILD_GAUGE_FACTORY_NAME = "ChildGaugeFactory"

// returns null on errors
function useContract(
  address: string | undefined,
  ABI: ContractInterface,
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

export function useMasterRegistry(): MasterRegistry | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? MASTER_REGISTRY_CONTRACT_ADDRESSES[chainId]
    : undefined
  return useContract(
    contractAddress,
    MASTER_REGISTRY_ABI,
    false,
  ) as MasterRegistry
}

export function usePoolRegistry(): PoolRegistry | null {
  const { library } = useActiveWeb3React()
  const masterRegistryContract = useMasterRegistry()
  const [contractAddress, setContractAddress] = useState<string | undefined>()
  useEffect(() => {
    if (masterRegistryContract) {
      masterRegistryContract
        ?.resolveNameToLatestAddress(formatBytes32String(POOL_REGISTRY_NAME))
        .then((contractAddress) => {
          if (contractAddress !== AddressZero) {
            setContractAddress(contractAddress)
          }
        })
        .catch((error) => {
          console.error(error)
          setContractAddress(undefined)
        })
    } else {
      setContractAddress(undefined)
    }
  }, [masterRegistryContract])

  return useMemo(() => {
    if (!library || !contractAddress) return null
    return getContract(
      contractAddress,
      POOL_REGISTRY_ABI,
      library,
    ) as PoolRegistry
  }, [contractAddress, library])
}

export function usePoolRegistryMultiCall(): MulticallContract<PoolRegistry> | null {
  const { library } = useActiveWeb3React()
  const masterRegistryContract = useMasterRegistry()
  const [contractAddress, setContractAddress] = useState<string | undefined>()
  useEffect(() => {
    if (masterRegistryContract) {
      masterRegistryContract
        ?.resolveNameToLatestAddress(formatBytes32String(POOL_REGISTRY_NAME))
        .then((contractAddress) => {
          if (contractAddress !== AddressZero) {
            setContractAddress(contractAddress)
          }
        })
        .catch((error) => {
          console.error(error)
          setContractAddress(undefined)
        })
    } else {
      setContractAddress(undefined)
    }
  }, [masterRegistryContract])

  return useMemo(() => {
    if (!library || !contractAddress) return null
    return createMultiCallContract<PoolRegistry>(
      contractAddress,
      POOL_REGISTRY_ABI,
    )
  }, [contractAddress, library])
}

export const PERMISSIONLESS_DEPLOYER_NAME = formatBytes32String(
  "PermissionlessDeployer",
)
export function usePermissionlessDeployer(): PermissionlessDeployer | null {
  const { account, library } = useActiveWeb3React()
  const masterRegistryContract = useMasterRegistry()
  const [contractAddress, setContractAddress] = useState<string | undefined>()
  useEffect(() => {
    if (masterRegistryContract) {
      masterRegistryContract
        ?.resolveNameToLatestAddress(PERMISSIONLESS_DEPLOYER_NAME)
        .then((contractAddress) => {
          if (contractAddress !== AddressZero) {
            setContractAddress(contractAddress)
          }
        })
        .catch((error) => {
          console.error(error)
          setContractAddress(undefined)
        })
    } else {
      setContractAddress(undefined)
    }
  }, [masterRegistryContract])

  return useMemo(() => {
    if (!library || !account || !contractAddress) return null
    return getContract(
      contractAddress,
      PERMISSIONLESS_DEPLOYER_ABI,
      library,
      account,
    ) as PermissionlessDeployer
  }, [contractAddress, library, account])
}

export function useGeneralizedSwapMigratorContract(): GeneralizedSwapMigrator | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? GENERALIZED_SWAP_MIGRATOR_CONTRACT_ADDRESSES[chainId]
    : undefined
  return useContract(
    contractAddress,
    GENERALIZED_SWAP_MIGRATOR_CONTRACT_ABI,
  ) as GeneralizedSwapMigrator
}

export function useBridgeContract(): Bridge | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? BRIDGE_CONTRACT_ADDRESSES[chainId]
    : undefined
  return useContract(contractAddress, BRIDGE_CONTRACT_ABI) as Bridge
}

export function useMiniChefContract(): MiniChef | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? MINICHEF_CONTRACT_ADDRESSES[chainId]
    : undefined
  return useContract(contractAddress, MINICHEF_CONTRACT_ABI) as MiniChef
}

export function useRetroactiveVestingContract(): RetroactiveVesting | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? RETROACTIVE_VESTING_CONTRACT_ADDRESSES[chainId]
    : undefined
  return useContract(
    contractAddress,
    RETROACTIVE_VESTING_CONTRACT_ABI,
  ) as RetroactiveVesting
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
    false,
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

export function useSwapContract<T extends string>(
  poolName?: T,
): T extends typeof BTC_POOL_NAME
  ? SwapGuarded | null
  : SwapFlashLoan | SwapFlashLoanNoWithdrawFee | MetaSwapDeposit | null
export function useSwapContract(
  poolName?: string,
): ReturnType<typeof getSwapContract> {
  const { account, library } = useActiveWeb3React()
  const basicPools = useContext(BasicPoolsContext)
  const pool = poolName ? basicPools?.[poolName] : null
  return useMemo(() => {
    if (!pool || !library) return null
    try {
      const poolAddress = pool.metaSwapDepositAddress || pool.poolAddress
      if (!poolAddress) return null
      return getSwapContract(library, poolAddress, pool, account ?? undefined)
    } catch (error) {
      console.error("Failed to get contract", error)
      return null
    }
  }, [library, account, pool])
}

export function useLPTokenContract<T extends string>(
  poolName: T,
): T extends typeof BTC_POOL_NAME
  ? LpTokenGuarded | null
  : LpTokenUnguarded | null
export function useLPTokenContract(
  poolName: string,
): LpTokenUnguarded | LpTokenGuarded | null {
  const { account, library } = useActiveWeb3React()
  const basicPools = useContext(BasicPoolsContext)
  const pool = basicPools?.[poolName]
  return useMemo(() => {
    if (!library || !pool) return null
    try {
      if (pool.isGuarded) {
        return getContract(
          pool.lpToken,
          LPTOKEN_GUARDED_ABI,
          library,
          account ?? undefined,
        ) as LpTokenGuarded
      } else {
        return getContract(
          pool.lpToken,
          LPTOKEN_UNGUARDED_ABI,
          library,
          account ?? undefined,
        ) as LpTokenUnguarded
      }
    } catch (error) {
      console.error("Failed to get contract", error)
      return null
    }
  }, [library, pool, account])
}

export function useGaugeControllerContract(): GaugeController | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? GAUGE_CONTROLLER_ADDRESSES[chainId]
    : undefined
  return useContract(
    contractAddress,
    GAUGE_CONTROLLER_ABI,
    true,
  ) as GaugeController
}

export const useSdlContract = (): Sdl => {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId ? SDL_TOKEN_ADDRESSES[chainId] : undefined
  return useContract(contractAddress, SDL_TOKEN_ABI) as Sdl
}

export const useVotingEscrowContract = (): VotingEscrow => {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? VOTING_ESCROW_CONTRACT_ADDRESS[chainId]
    : undefined

  return useContract(
    contractAddress,
    VOTING_ESCROW_CONTRACT_ABI,
  ) as VotingEscrow
}

export const useFeeDistributor = (): FeeDistributor | null => {
  const { chainId } = useActiveWeb3React()
  const contractAddress =
    chainId && IS_VESDL_LIVE ? FEE_DISTRIBUTOR_ADDRESSES[chainId] : undefined
  return useContract(contractAddress, FEE_DISTRIBUTOR_ABI) as FeeDistributor
}

export const useGaugeMinterContract = (): Minter | null => {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId ? GAUGE_MINTER_ADDRESSES[chainId] : undefined
  return useContract(contractAddress, GAUGE_MINTER_ABI) as Minter
}

export const useSdlWethSushiPairContract = (): SushiPool | null => {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? SDL_WETH_SUSHI_LP_CONTRACT_ADDRESSES[chainId]
    : undefined
  return useContract(contractAddress, SUSHI_POOL_ABI, false) as SushiPool
}

export function useLiquidityGaugeContract(
  gaugeAddress?: string,
): LiquidityGaugeV5 | null {
  return useContract(gaugeAddress, LIQUIDITY_V5_GAUGE_ABI) as LiquidityGaugeV5
}

// This section instantiate new contract without Hooks
export const getGaugeContract = (
  library: Web3Provider,
  chainId: ChainId,
  address: string,
  account: string,
): LiquidityGaugeV5 | ChildGauge => {
  if (isMainnet(chainId)) {
    return getContract(
      address,
      LIQUIDITY_V5_GAUGE_ABI,
      library,
      account,
    ) as LiquidityGaugeV5
  }

  return getContract(address, CHILD_GAUGE_ABI, library, account) as ChildGauge
}

export const getGaugeControllerContract = (
  library: Web3Provider,
  chainId: ChainId,
  account?: string,
) => {
  return getContract(
    GAUGE_CONTROLLER_ADDRESSES[chainId],
    GAUGE_CONTROLLER_ABI,
    library,
    account,
  ) as GaugeController
}

export const getGaugeMinterContract = (
  library: Web3Provider,
  chainId: ChainId,
  account?: string,
) => {
  return getContract(
    GAUGE_MINTER_ADDRESSES[chainId],
    GAUGE_MINTER_ABI,
    library,
    account,
  ) as Minter
}

export const getChildGaugeFactory = (
  library: Web3Provider,
  chainId: ChainId,
  address?: string,
  account?: string,
) => {
  return getContract(
    address ?? "",
    CHILD_GAUGE_FACTORY_ABI,
    library,
    account ?? undefined,
  ) as ChildGaugeFactory
}

export const getVotingEscrowContract = (
  library: Web3Provider,
  chainId: ChainId,
  account?: string,
): VotingEscrow => {
  return getContract(
    VOTING_ESCROW_CONTRACT_ADDRESS[chainId],
    VOTING_ESCROW_CONTRACT_ABI,
    library,
    account,
  ) as VotingEscrow
}

export const getChildOracle = (
  library: Web3Provider,
  chainId: ChainId,
  account?: string,
): ChildOracle => {
  return getContract(
    CHILD_ORACLE_CONTRACT_ADDRESSES[chainId],
    CHILD_ORACLE_ABI,
    library,
    account,
  ) as ChildOracle
}

export const getRootGaugeFactory = (
  library: Web3Provider,
  chainId: ChainId,
  account?: string,
): RootGaugeFactory => {
  return getContract(
    ROOT_GAUGE_FACTORY_CONTRACT_ADDRESSES[chainId],
    ROOT_GAUGE_FACTORY_ABI,
    library,
    account,
  ) as RootGaugeFactory
}

export const isMainnet = (chainId?: ChainId): boolean => {
  return (
    !!chainId && (chainId === ChainId.MAINNET || chainId === ChainId.HARDHAT)
  )
}
