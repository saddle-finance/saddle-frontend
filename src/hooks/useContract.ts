import {
  BRIDGE_CONTRACT_ADDRESSES,
  BTC_POOL_NAME,
  GAUGE_CONTROLLER_ADDRESSES,
  GENERALIZED_SWAP_MIGRATOR_CONTRACT_ADDRESSES,
  MASTER_REGISTRY_CONTRACT_ADDRESSES,
  MINICHEF_CONTRACT_ADDRESSES,
  POOLS_MAP,
  PoolName,
  RETROACTIVE_VESTING_CONTRACT_ADDRESSES,
  SYNTHETIX_CONTRACT_ADDRESSES,
  SYNTHETIX_EXCHANGE_RATES_CONTRACT_ADDRESSES,
  TOKENS_MAP,
  Token,
  isLegacySwapABIPool,
  isMetaPool,
} from "../constants"
import { useEffect, useMemo, useState } from "react"
import { AddressZero } from "@ethersproject/constants"
import BRIDGE_CONTRACT_ABI from "../constants/abis/bridge.json"
import { Bridge } from "../../types/ethers-contracts/Bridge"
import { Contract } from "@ethersproject/contracts"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import GAUGE_CONTROLLER_ABI from "../constants/abis/gaugeController.json"
import GENERALIZED_SWAP_MIGRATOR_CONTRACT_ABI from "../constants/abis/generalizedSwapMigrator.json"
import { GaugeController } from "../../types/ethers-contracts/GaugeController"
import { GeneralizedSwapMigrator } from "../../types/ethers-contracts/GeneralizedSwapMigrator"
import LPTOKEN_GUARDED_ABI from "../constants/abis/lpTokenGuarded.json"
import LPTOKEN_UNGUARDED_ABI from "../constants/abis/lpTokenUnguarded.json"
import { LpTokenGuarded } from "../../types/ethers-contracts/LpTokenGuarded"
import { LpTokenUnguarded } from "../../types/ethers-contracts/LpTokenUnguarded"
import MASTER_REGISTRY_ABI from "../constants/abis/masterRegistry.json"
import META_SWAP_DEPOSIT_ABI from "../constants/abis/metaSwapDeposit.json"
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
import SWAP_FLASH_LOAN_ABI from "../constants/abis/swapFlashLoan.json"
import SWAP_FLASH_LOAN_NO_WITHDRAW_FEE_ABI from "../constants/abis/swapFlashLoanNoWithdrawFee.json"
import SWAP_GUARDED_ABI from "../constants/abis/swapGuarded.json"
import SYNTHETIX_EXCHANGE_RATE_CONTRACT_ABI from "../constants/abis/synthetixExchangeRate.json"
import SYNTHETIX_NETWORK_TOKEN_CONTRACT_ABI from "../constants/abis/synthetixNetworkToken.json"
import { SwapFlashLoan } from "../../types/ethers-contracts/SwapFlashLoan"
import { SwapFlashLoanNoWithdrawFee } from "../../types/ethers-contracts/SwapFlashLoanNoWithdrawFee"
import { SwapGuarded } from "../../types/ethers-contracts/SwapGuarded"
import { SynthetixExchangeRate } from "../../types/ethers-contracts/SynthetixExchangeRate"
import { SynthetixNetworkToken } from "../../types/ethers-contracts/SynthetixNetworkToken"
import { formatBytes32String } from "@ethersproject/strings"
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

export function useSwapContract<T extends PoolName | string>(
  poolName?: T,
): T extends typeof BTC_POOL_NAME
  ? SwapGuarded | null
  : SwapFlashLoan | SwapFlashLoanNoWithdrawFee | MetaSwapDeposit | null
export function useSwapContract(
  poolName?: string,
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
      const poolAddress = pool.addresses[chainId]
      if (!poolAddress) return null
      if (poolName === BTC_POOL_NAME) {
        return getContract(
          poolAddress,
          SWAP_GUARDED_ABI,
          library,
          account ?? undefined,
        ) as SwapGuarded
      } else if (isLegacySwapABIPool(poolName)) {
        return getContract(
          poolAddress,
          SWAP_FLASH_LOAN_ABI,
          library,
          account ?? undefined,
        ) as SwapFlashLoan
      } else if (isMetaPool(poolName)) {
        return getContract(
          poolAddress,
          META_SWAP_DEPOSIT_ABI,
          library,
          account ?? undefined,
        ) as MetaSwapDeposit
      } else if (pool) {
        return getContract(
          poolAddress,
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
