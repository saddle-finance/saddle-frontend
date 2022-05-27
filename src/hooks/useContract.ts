import {
  BRIDGE_CONTRACT_ADDRESSES,
  BTC_POOL_NAME,
  FEE_DISTRIBUTOR_ADDRESSES,
  GAUGE_CONTROLLER_ADDRESSES,
  GENERALIZED_SWAP_MIGRATOR_CONTRACT_ADDRESSES,
  MASTER_REGISTRY_CONTRACT_ADDRESSES,
  MINICHEF_CONTRACT_ADDRESSES,
  RETROACTIVE_VESTING_CONTRACT_ADDRESSES,
  SDL_TOKEN_ADDRESSES,
  SYNTHETIX_CONTRACT_ADDRESSES,
  SYNTHETIX_EXCHANGE_RATES_CONTRACT_ADDRESSES,
  TOKENS_MAP,
  Token,
  VOTING_ESCROW_CONTRACT_ADDRESS,
} from "../constants"
import { getContract, getSwapContract } from "../utils"
import { useContext, useEffect, useMemo, useState } from "react"

import { AddressZero } from "@ethersproject/constants"
import BRIDGE_CONTRACT_ABI from "../constants/abis/bridge.json"
import { BasicPoolsContext } from "../providers/BasicPoolsProvider"
import { Bridge } from "../../types/ethers-contracts/Bridge"
import { Contract } from "@ethersproject/contracts"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import FEE_DISTRIBUTOR_ABI from "../constants/abis/feeDistributor.json"
import { FeeDistributor } from "../../types/ethers-contracts/FeeDistributor"
import GAUGE_CONTROLLER_ABI from "../constants/abis/gaugeController.json"
import GENERALIZED_SWAP_MIGRATOR_CONTRACT_ABI from "../constants/abis/generalizedSwapMigrator.json"
import { GaugeController } from "../../types/ethers-contracts/GaugeController"
import { GeneralizedSwapMigrator } from "../../types/ethers-contracts/GeneralizedSwapMigrator"
import LPTOKEN_GUARDED_ABI from "../constants/abis/lpTokenGuarded.json"
import LPTOKEN_UNGUARDED_ABI from "../constants/abis/lpTokenUnguarded.json"
import { LpTokenGuarded } from "../../types/ethers-contracts/LpTokenGuarded"
import { LpTokenUnguarded } from "../../types/ethers-contracts/LpTokenUnguarded"
import MASTER_REGISTRY_ABI from "../constants/abis/masterRegistry.json"
import MINICHEF_CONTRACT_ABI from "../constants/abis/miniChef.json"
import { MasterRegistry } from "../../types/ethers-contracts/MasterRegistry"
import { MetaSwapDeposit } from "../../types/ethers-contracts/MetaSwapDeposit"
import { MiniChef } from "../../types/ethers-contracts/MiniChef"
import PERMISSIONLESS_DEPLOYER_ABI from "../constants/abis/permissionlessDeployer.json"
import POOL_REGISTRY_ABI from "../constants/abis/poolRegistry.json"
import { PermissionlessDeployer } from "../../types/ethers-contracts/PermissionlessDeployer"
import { PoolRegistry } from "../../types/ethers-contracts/PoolRegistry"
import RETROACTIVE_VESTING_CONTRACT_ABI from "../constants/abis/retroactiveVesting.json"
import { RetroactiveVesting } from "../../types/ethers-contracts/RetroactiveVesting"
import SDL_TOKEN_ABI from "../constants/abis/sdl.json"
import SYNTHETIX_EXCHANGE_RATE_CONTRACT_ABI from "../constants/abis/synthetixExchangeRate.json"
import SYNTHETIX_NETWORK_TOKEN_CONTRACT_ABI from "../constants/abis/synthetixNetworkToken.json"
import { Sdl } from "../../types/ethers-contracts/Sdl"
import { SwapFlashLoan } from "../../types/ethers-contracts/SwapFlashLoan"
import { SwapFlashLoanNoWithdrawFee } from "../../types/ethers-contracts/SwapFlashLoanNoWithdrawFee"
import { SwapGuarded } from "../../types/ethers-contracts/SwapGuarded"
import { SynthetixExchangeRate } from "../../types/ethers-contracts/SynthetixExchangeRate"
import { SynthetixNetworkToken } from "../../types/ethers-contracts/SynthetixNetworkToken"
import VOTING_ESCROW_CONTRACT_ABI from "../constants/abis/votingEscrow.json"
import { VotingEscrow } from "../../types/ethers-contracts/VotingEscrow"
import { formatBytes32String } from "@ethersproject/strings"
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

export function useMasterRegistry(): MasterRegistry | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? MASTER_REGISTRY_CONTRACT_ADDRESSES[chainId]
    : undefined
  return useContract(contractAddress, MASTER_REGISTRY_ABI) as MasterRegistry
}

export const POOL_REGISTRY_NAME = formatBytes32String("PoolRegistry")
export function usePoolRegistry(): PoolRegistry | null {
  const { account, library } = useActiveWeb3React()
  const masterRegistryContract = useMasterRegistry()
  const [contractAddress, setContractAddress] = useState<string | undefined>()
  useEffect(() => {
    if (masterRegistryContract) {
      masterRegistryContract
        ?.resolveNameToLatestAddress(POOL_REGISTRY_NAME)
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
      POOL_REGISTRY_ABI,
      library,
      account,
    ) as PoolRegistry
  }, [contractAddress, library, account])
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

interface AllContractsObject {
  [x: string]: Erc20 | null
}
export function useAllContracts(): AllContractsObject | null {
  const { chainId, library, account } = useActiveWeb3React()
  return useMemo(() => {
    if (!library || !chainId) return {}
    const allTokensForChain = Object.values(TOKENS_MAP).filter(
      ({ addresses }) => addresses[chainId],
    )
    return allTokensForChain.reduce((acc, token) => {
      const tokenAddress = token.addresses[chainId]
      if (tokenAddress) {
        let contract = null
        try {
          contract = getContract(
            tokenAddress,
            ERC20_ABI,
            library,
            account || undefined,
          ) as Erc20
        } catch (e) {
          console.error(`Couldn't create contract for token ${tokenAddress}`)
        }
        acc[token.symbol] = contract
      }
      return acc
    }, {} as AllContractsObject)
  }, [chainId, library, account])
}

export function useGaugeControllerContract(): GaugeController | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? GAUGE_CONTROLLER_ADDRESSES[chainId]
    : undefined
  return useContract(contractAddress, GAUGE_CONTROLLER_ABI) as GaugeController
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

export const useFeeDistributor = (): FeeDistributor => {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? FEE_DISTRIBUTOR_ADDRESSES[chainId]
    : undefined
  return useContract(contractAddress, FEE_DISTRIBUTOR_ABI) as FeeDistributor
}
