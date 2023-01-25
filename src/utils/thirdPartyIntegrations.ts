import {
  ALETH_POOL_NAME,
  MINICHEF_CONTRACT_ADDRESSES,
  TBTC_METAPOOL_V2_NAME,
} from "../constants"
import { AddressZero, Zero } from "@ethersproject/constants"
import { getContract, getMulticallProvider, shiftBNDecimals } from "../utils"

import ALCX_REWARDS_ABI from "../constants/abis/alchemixStakingPools.json"
import { AlchemixStakingPools } from "../../types/ethers-contracts/AlchemixStakingPools"
import { BigNumber } from "@ethersproject/bignumber"
import { ChainId } from "../constants/networks"
import { Contract } from "ethcall"
import IREWARDER_ABI from "../constants/abis/IRewarder.json"
import { IRewarder } from "../../types/ethers-contracts/IRewarder"
import LP_TOKEN_ABI from "../constants/abis/lpTokenUnguarded.json"
import { LpTokenUnguarded } from "../../types/ethers-contracts/LpTokenUnguarded"
import { MulticallContract } from "../types/ethcall"
import { TokenPricesUSD } from "../state/application"
import { Web3Provider } from "@ethersproject/providers"
import { parseUnits } from "@ethersproject/units"

export type Partners = "threshold" | "alchemix" | "frax" | "sperax"

type ThirdPartyData = {
  aprs: Partial<
    Record<
      Partners,
      {
        symbol: string
        apr: BigNumber
      }
    >
  >
  amountsStaked: Partial<Record<Partners, BigNumber>>
  claimableAmount: Partial<Record<Partners, BigNumber>>
}
export async function getThirdPartyDataForPool(
  library: Web3Provider,
  chainId: ChainId,
  accountId: string | undefined | null,
  {
    name: poolName,
    lpTokenAddress,
  }: { name: string; address: string; lpTokenAddress: string },
  tokenPricesUSD: TokenPricesUSD,
  lpTokenPriceUSD: BigNumber,
): Promise<ThirdPartyData> {
  const result: ThirdPartyData = {
    aprs: {},
    amountsStaked: {},
    claimableAmount: {},
  }
  try {
    if (poolName === ALETH_POOL_NAME) {
      const rewardSymbol = "ALCX"
      const [apr, userStakedAmount] = await getAlEthData(
        library,
        chainId,
        lpTokenPriceUSD,
        tokenPricesUSD?.[rewardSymbol],
        accountId,
      )
      result.aprs.alchemix = { apr, symbol: rewardSymbol }
      result.amountsStaked.alchemix = userStakedAmount
    } else if (poolName === TBTC_METAPOOL_V2_NAME) {
      const rewardSymbol = "T"
      const [apr, userStakedAmount, thresholdClaimableAmount] =
        await getThresholdData(
          library,
          chainId,
          lpTokenPriceUSD,
          tokenPricesUSD?.[rewardSymbol],
          lpTokenAddress,
          accountId,
        )
      result.aprs.threshold = { apr, symbol: rewardSymbol }
      result.amountsStaked.threshold = userStakedAmount
      result.claimableAmount.threshold = thresholdClaimableAmount
    } else if (poolName === "USDS-ArbUSDV2" || poolName === "FRAXBP-USDs") {
      const rewardSymbol = "SPA"
      const [apr, userStakedAmount] = await getSperaxData(
        library,
        chainId,
        lpTokenPriceUSD,
        tokenPricesUSD?.[rewardSymbol],
        lpTokenAddress,
        poolName,
        accountId,
      )
      result.aprs.sperax = { apr, symbol: rewardSymbol }
      result.amountsStaked.sperax = userStakedAmount
    }
  } catch (e) {
    console.error(e)
  }
  return result
}

async function getAlEthData(
  library: Web3Provider,
  chainId: ChainId,
  lpTokenPrice: BigNumber,
  alcxPrice = 0,
  accountId?: string | null,
): Promise<[BigNumber, BigNumber]> {
  if (
    library == null ||
    lpTokenPrice.eq("0") ||
    alcxPrice === 0 ||
    chainId !== ChainId.MAINNET
  )
    return [Zero, Zero]
  const ethcallProvider = await getMulticallProvider(library, chainId)
  const rewardsContract = new Contract(
    "0xAB8e74017a8Cc7c15FFcCd726603790d26d7DeCa", // prod address
    ALCX_REWARDS_ABI,
  ) as MulticallContract<AlchemixStakingPools>
  const POOL_ID = 6
  const multicalls = [
    rewardsContract.getPoolRewardRate(POOL_ID),
    rewardsContract.getPoolTotalDeposited(POOL_ID),
    rewardsContract.getStakeTotalDeposited(accountId || AddressZero, POOL_ID),
  ]
  const [alcxRewardPerBlock, poolTotalDeposited, userStakedAmount] =
    await ethcallProvider.tryEach(
      multicalls,
      multicalls.map(() => false) as false[],
    )
  const alcxPerYear = alcxRewardPerBlock.mul(52 * 45000) // 1e18 // blocks/year rate from Alchemix's own logic
  const alcxPerYearUSD = alcxPerYear.mul(parseUnits(alcxPrice.toFixed(2), 2)) // 1e20
  const totalDepositedUSD = poolTotalDeposited.mul(lpTokenPrice) // 1e36
  const alcxApr = alcxPerYearUSD
    .mul(BigNumber.from(10).pow(34))
    .div(totalDepositedUSD) // 1e18
  return [alcxApr, userStakedAmount]
}

async function getSperaxData(
  library: Web3Provider,
  chainId: ChainId,
  lpTokenPrice: BigNumber,
  spaPrice = 0,
  lpTokenAddress: string,
  poolName: string,
  accountId?: string | null,
): Promise<[BigNumber, BigNumber]> {
  if (
    library == null ||
    lpTokenPrice.eq("0") ||
    spaPrice === 0 ||
    chainId !== ChainId.ARBITRUM
  )
    return [Zero, Zero]
  const arbFraxUsdsRewarderContractAddr =
    "0x492ebe7816b6934cc55f3001e1ac165a6c5afab0"
  const usdsArbUsdRewarderContractAddr =
    "0x1e35ebF875f8A2185EDf22da02e7dBCa0F5558aB"
  const rewardContractAddr =
    poolName === "USDS-ArbUSDV2"
      ? usdsArbUsdRewarderContractAddr
      : arbFraxUsdsRewarderContractAddr
  const rewardsContract = getContract(
    rewardContractAddr, // prod address on arbitrum
    IREWARDER_ABI,
    library,
  ) as IRewarder
  const lpTokenContract = getContract(
    lpTokenAddress,
    LP_TOKEN_ABI,
    library,
  ) as LpTokenUnguarded
  const [totalDeposited, spaRewardsPerSecond, userStakedData] =
    await Promise.all([
      lpTokenContract.balanceOf(MINICHEF_CONTRACT_ADDRESSES[chainId]),
      rewardsContract.rewardPerSecond(),
      rewardsContract.userInfo(accountId || AddressZero),
    ])

  const spaPerYear = spaRewardsPerSecond.mul(3600 * 24 * 365) // 1e18
  const spaPerYearUSD = spaPerYear.mul(parseUnits(spaPrice.toFixed(3), 3)) // 1e18 + 3 = 1e21
  const totalDepositedUSD = totalDeposited.mul(lpTokenPrice) // 1e36
  const spaApr = shiftBNDecimals(spaPerYearUSD, 33).div(totalDepositedUSD) // (1e21 + 1e33 = 1e54) / 1e36 = 1e18
  return [spaApr, userStakedData.amount]
}

// TODO refactor SPA and T fns to read directly from minichef to get simpleRewarder addr
// https://etherscan.io/address/0xe8e1a94f0c960d64e483ca9088a7ec52e77194c2#readContract
async function getThresholdData(
  library: Web3Provider,
  chainId: ChainId,
  lpTokenPrice: BigNumber,
  thresholdPrice = 0,
  lpTokenAddress: string,
  accountId?: string | null,
): Promise<[BigNumber, BigNumber, BigNumber]> {
  if (
    library == null ||
    lpTokenPrice.eq("0") ||
    thresholdPrice === 0 ||
    chainId !== ChainId.MAINNET ||
    !accountId
  )
    return [Zero, Zero, Zero]
  const rewardsContract = getContract(
    "0xe8e1a94F0C960D64E483cA9088A7EC52E77194C2", // prod address
    IREWARDER_ABI,
    library,
  ) as IRewarder
  const lpTokenContract = getContract(
    lpTokenAddress,
    LP_TOKEN_ABI,
    library,
  ) as LpTokenUnguarded
  const [totalDeposited, thresholdRewardsPerSecond, thresholdClaimableAmount] =
    await Promise.all([
      lpTokenContract.balanceOf(MINICHEF_CONTRACT_ADDRESSES[chainId]),
      rewardsContract.rewardPerSecond(),
      rewardsContract.pendingToken(accountId),
    ])

  const thresholdPerYear = thresholdRewardsPerSecond.mul(3600 * 24 * 365) // 1e18
  const thresholdPerYearUSD = thresholdPerYear.mul(
    parseUnits(thresholdPrice.toFixed(3), 3),
  ) // 1e18 + 3 = 1e21
  const totalDepositedUSD = totalDeposited.mul(lpTokenPrice) // 1e18 + 1e18 = 1e36
  const thresholdApr = shiftBNDecimals(thresholdPerYearUSD, 33).div(
    totalDepositedUSD,
  ) // (1e21 + 1e33 = 1e54) / 1e36 = 1e18
  return [thresholdApr, Zero, thresholdClaimableAmount]
}
