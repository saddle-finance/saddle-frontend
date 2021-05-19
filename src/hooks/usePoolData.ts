import { AddressZero, Zero } from "@ethersproject/constants"
import {
  BTC_POOL_NAME,
  ChainId,
  POOLS_MAP,
  PoolName,
  TRANSACTION_TYPES,
  VETH2_POOL_NAME,
} from "../constants"
import { Contract, Provider } from "ethcall"
import { MulticallContract, MulticallProvider } from "../types/ethcall"
import { formatBNToPercentString, getContract } from "../utils"
import { useEffect, useState } from "react"

import { AppState } from "../state"
import BALANCE_OF_ABI from "../constants/abis/simpleBalanceOf.json"
import { BigNumber } from "@ethersproject/bignumber"
import LPTOKEN_GUARDED_ABI from "../constants/abis/lpTokenGuarded.json"
import LPTOKEN_UNGUARDED_ABI from "../constants/abis/lpTokenUnguarded.json"
import { LpTokenGuarded } from "../../types/ethers-contracts/LpTokenGuarded"
import { LpTokenUnguarded } from "../../types/ethers-contracts/LpTokenUnguarded"
import SGT_REWARDS_ABI from "../constants/abis/sharedStakeStakingRewards.json"
import { SharedStakeStakingRewards } from "../../types/ethers-contracts/SharedStakeStakingRewards"
import { SimpleBalanceOf } from "../../types/ethers-contracts/SimpleBalanceOf"
import { Web3Provider } from "@ethersproject/providers"
import { parseUnits } from "@ethersproject/units"
import { useActiveWeb3React } from "."
import { useSelector } from "react-redux"
import { useSwapContract } from "./useContract"

interface TokenShareType {
  percent: string
  symbol: string
  value: BigNumber
}

export interface PoolDataType {
  adminFee: BigNumber
  apy: string // TODO: calculate
  name: string
  reserve: BigNumber
  swapFee: BigNumber
  tokens: TokenShareType[]
  totalLocked: BigNumber
  utilization: string // TODO: calculate
  virtualPrice: BigNumber
  volume: string // TODO: calculate
  aprs: {
    keep: BigNumber
    sharedStake: BigNumber
  }
  lpTokenPriceUSD: BigNumber
}

export interface UserShareType {
  currentWithdrawFee: BigNumber
  lpTokenBalance: BigNumber
  name: string // TODO: does this need to be on user share?
  share: BigNumber
  tokens: TokenShareType[]
  usdBalance: BigNumber
  underlyingTokensAmount: BigNumber
  amountsStaked: Record<"keep" | "sharedStake", BigNumber>
}

export type PoolDataHookReturnType = [PoolDataType, UserShareType | null]

const emptyPoolData = {
  adminFee: Zero,
  apy: "",
  name: "",
  reserve: Zero,
  swapFee: Zero,
  tokens: [],
  totalLocked: Zero,
  utilization: "",
  virtualPrice: Zero,
  volume: "",
  aprs: {
    keep: Zero,
    sharedStake: Zero,
  },
  lpTokenPriceUSD: Zero,
} as PoolDataType

export default function usePoolData(
  poolName: PoolName,
): PoolDataHookReturnType {
  const { account, library, chainId } = useActiveWeb3React()
  const swapContract = useSwapContract(poolName)
  const { tokenPricesUSD, lastTransactionTimes } = useSelector(
    (state: AppState) => state.application,
  )
  const lastDepositTime = lastTransactionTimes[TRANSACTION_TYPES.DEPOSIT]
  const lastWithdrawTime = lastTransactionTimes[TRANSACTION_TYPES.WITHDRAW]
  const lastSwapTime = lastTransactionTimes[TRANSACTION_TYPES.SWAP]
  const POOL = POOLS_MAP[poolName]

  const [poolData, setPoolData] = useState<PoolDataHookReturnType>([
    {
      ...emptyPoolData,
      name: poolName,
      tokens: POOL.poolTokens.map((token) => ({
        symbol: token.symbol,
        percent: "0",
        value: Zero,
      })),
    },
    null,
  ])

  useEffect(() => {
    async function getSwapData(): Promise<void> {
      if (
        poolName == null ||
        swapContract == null ||
        tokenPricesUSD == null ||
        library == null
      )
        return

      // Swap fees, price, and LP Token data
      const [userCurrentWithdrawFee, swapStorage] = await Promise.all([
        swapContract.calculateCurrentWithdrawFee(account || AddressZero),
        swapContract.swapStorage(), // will fail without account
      ])
      const { adminFee, lpToken: lpTokenAddress, swapFee } = swapStorage
      let lpTokenContract
      if (poolName === BTC_POOL_NAME) {
        lpTokenContract = getContract(
          lpTokenAddress,
          LPTOKEN_GUARDED_ABI,
          library,
          account ?? undefined,
        ) as LpTokenGuarded
      } else {
        lpTokenContract = getContract(
          lpTokenAddress,
          LPTOKEN_UNGUARDED_ABI,
          library,
          account ?? undefined,
        ) as LpTokenUnguarded
      }
      const keepLPRewardsContract =
        chainId === ChainId.MAINNET && poolName === BTC_POOL_NAME
          ? (getContract(
              "0x78aa83bd6c9de5de0a2231366900ab060a482edd",
              BALANCE_OF_ABI,
              library,
              account ?? undefined,
            ) as SimpleBalanceOf)
          : { balanceOf: () => Promise.resolve(Zero) }
      const lpTokenAmountStakedOnKeep =
        poolName === BTC_POOL_NAME && account != null
          ? await keepLPRewardsContract.balanceOf(account)
          : Zero
      const sharedStakeLPRewardsContract =
        chainId === ChainId.MAINNET && poolName === VETH2_POOL_NAME
          ? (getContract(
              "0xcf91812631e37c01c443a4fa02dfb59ee2ddba7c",
              SGT_REWARDS_ABI,
              library,
              account ?? undefined,
            ) as SharedStakeStakingRewards)
          : null
      const lpTokenAmountStakedOnSharedStake =
        poolName === VETH2_POOL_NAME &&
        account != null &&
        sharedStakeLPRewardsContract != null
          ? await sharedStakeLPRewardsContract.balanceOf(account)
          : Zero

      const [userLpTokenBalance, totalLpTokenBalance] = await Promise.all([
        lpTokenContract.balanceOf(account || AddressZero),
        lpTokenContract.totalSupply(),
      ])

      const virtualPrice = totalLpTokenBalance.isZero()
        ? BigNumber.from(10).pow(18)
        : await swapContract.getVirtualPrice()

      // Pool token data
      const tokenBalances: BigNumber[] = await Promise.all(
        POOL.poolTokens.map(async (token, i) => {
          const balance = await swapContract.getTokenBalance(i)
          return BigNumber.from(10)
            .pow(18 - token.decimals) // cast all to 18 decimals
            .mul(balance)
        }),
      )
      const tokenBalancesSum: BigNumber = tokenBalances.reduce((sum, b) =>
        sum.add(b),
      )
      const tokenBalancesUSD = POOL.poolTokens.map((token, i) => {
        const balance = tokenBalances[i]
        return balance
          .mul(parseUnits(String(tokenPricesUSD[token.symbol] || 0), 18))
          .div(BigNumber.from(10).pow(18))
      })
      const tokenBalancesUSDSum: BigNumber = tokenBalancesUSD.reduce((sum, b) =>
        sum.add(b),
      )
      const lpTokenPriceUSD = tokenBalancesSum.isZero()
        ? Zero
        : tokenBalancesUSDSum
            .mul(BigNumber.from(10).pow(18))
            .div(tokenBalancesSum)

      // (weeksPerYear * KEEPPerWeek * KEEPPrice) / (BTCPrice * BTCInPool)
      const comparisonPoolToken = POOL.poolTokens[0]
      const keepAPRNumerator = BigNumber.from(52 * 250000)
        .mul(BigNumber.from(10).pow(18))
        .mul(parseUnits(String(tokenPricesUSD.KEEP || 0), 18))
      const keepAPRDenominator = totalLpTokenBalance
        .mul(
          parseUnits(
            String(tokenPricesUSD[comparisonPoolToken.symbol] || 0),
            6,
          ),
        )
        .div(1e6)

      const keepApr = totalLpTokenBalance.isZero()
        ? keepAPRNumerator
        : keepAPRNumerator.div(keepAPRDenominator)
      const sgtApr =
        poolName === VETH2_POOL_NAME
          ? await getSgtApr(
              library,
              tokenBalancesUSDSum,
              chainId,
              tokenPricesUSD.SGT,
            )
          : Zero

      function calculatePctOfTotalShare(lpTokenAmount: BigNumber): BigNumber {
        // returns the % of total lpTokens
        return lpTokenAmount
          .mul(BigNumber.from(10).pow(18))
          .div(
            totalLpTokenBalance.isZero()
              ? BigNumber.from("1")
              : totalLpTokenBalance,
          )
      }
      // User share data
      let userShare = calculatePctOfTotalShare(userLpTokenBalance)
      const percentOfAllLPTokensUserStakedInKeep = calculatePctOfTotalShare(
        lpTokenAmountStakedOnKeep,
      )
      const percentOfAllLPTokensUserStakedInSharedStake = calculatePctOfTotalShare(
        lpTokenAmountStakedOnSharedStake,
      )
      // lpToken balance in wallet as a % of total lpTokens, plus lpTokens staked elsewhere
      userShare = userShare
        .add(percentOfAllLPTokensUserStakedInKeep)
        .add(percentOfAllLPTokensUserStakedInSharedStake)
      const userPoolTokenBalances = tokenBalances.map((balance) => {
        return userShare.mul(balance).div(BigNumber.from(10).pow(18))
      })
      // sum the amount of tokens represented by user's lpTokens staked elsewhere
      const amountsStaked = tokenBalances.reduce(
        (acc, balance) => {
          const [balanceAmountInKeep, balanceAmountInSharedStake] = [
            percentOfAllLPTokensUserStakedInKeep,
            percentOfAllLPTokensUserStakedInSharedStake,
          ].map((percentStaked) => {
            return percentStaked.mul(balance).div(BigNumber.from(10).pow(18))
          })
          return {
            keep: acc.keep.add(balanceAmountInKeep),
            sharedStake: acc.sharedStake.add(balanceAmountInSharedStake),
          }
        },
        { keep: Zero, sharedStake: Zero },
      )
      const userPoolTokenBalancesSum: BigNumber = userPoolTokenBalances.reduce(
        (sum, b) => sum.add(b),
      )
      const userPoolTokenBalancesUSD = tokenBalancesUSD.map((balance) => {
        return userShare.mul(balance).div(BigNumber.from(10).pow(18))
      })
      const userPoolTokenBalancesUSDSum: BigNumber = userPoolTokenBalancesUSD.reduce(
        (sum, b) => sum.add(b),
      )

      const poolTokens = POOL.poolTokens.map((token, i) => ({
        symbol: token.symbol,
        percent: formatBNToPercentString(
          tokenBalances[i]
            .mul(10 ** 5)
            .div(
              totalLpTokenBalance.isZero()
                ? BigNumber.from("1")
                : tokenBalancesSum,
            ),
          5,
        ),
        value: tokenBalances[i],
      }))
      const userPoolTokens = POOL.poolTokens.map((token, i) => ({
        symbol: token.symbol,
        percent: formatBNToPercentString(
          tokenBalances[i]
            .mul(10 ** 5)
            .div(
              totalLpTokenBalance.isZero()
                ? BigNumber.from("1")
                : tokenBalancesSum,
            ),
          5,
        ),
        value: userPoolTokenBalances[i],
      }))
      const poolData = {
        name: poolName,
        tokens: poolTokens,
        reserve: tokenBalancesUSDSum,
        totalLocked: totalLpTokenBalance,
        virtualPrice: virtualPrice,
        adminFee: adminFee,
        swapFee: swapFee,
        volume: "XXX", // TODO
        utilization: "XXX", // TODO
        apy: "XXX", // TODO
        aprs: {
          keep: poolName === BTC_POOL_NAME ? keepApr : Zero,
          sharedStake: poolName === VETH2_POOL_NAME ? sgtApr : Zero,
        },
        lpTokenPriceUSD,
      }
      const userShareData = account
        ? {
            name: poolName,
            share: userShare,
            underlyingTokensAmount: userPoolTokenBalancesSum,
            usdBalance: userPoolTokenBalancesUSDSum,
            tokens: userPoolTokens,
            currentWithdrawFee: userCurrentWithdrawFee,
            lpTokenBalance: userLpTokenBalance,
            amountsStaked, // this is # of underlying tokens (eg btc), not lpTokens
          }
        : null
      setPoolData([poolData, userShareData])
    }
    void getSwapData()
  }, [
    lastDepositTime,
    lastWithdrawTime,
    lastSwapTime,
    poolName,
    swapContract,
    tokenPricesUSD,
    account,
    library,
    chainId,
    POOL.poolTokens,
  ])

  return poolData
}

async function getSgtApr(
  library: Web3Provider,
  tvlUsd: BigNumber,
  chainId?: ChainId,
  sgtPrice = 0,
): Promise<BigNumber> {
  // https://github.com/SharedStake/SharedStake-ui/blob/main/src/components/Earn/geyser.vue#L336
  if (library == null || tvlUsd.eq(Zero) || chainId != null) return Zero
  const ethcallProvider = new Provider() as MulticallProvider
  await ethcallProvider.init(library)
  // override the contract address when using hardhat
  if (chainId == ChainId.HARDHAT) {
    ethcallProvider.multicallAddress =
      "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f"
  }
  const rewardsContract = new Contract(
    "0xcf91812631e37c01c443a4fa02dfb59ee2ddba7c", // prod address
    SGT_REWARDS_ABI,
  ) as MulticallContract<SharedStakeStakingRewards>
  const multicalls = [
    rewardsContract.periodFinish(), // 1e0 timestamp in seconds
    rewardsContract.rewardsDuration(), // 1e0 seconds
    rewardsContract.getRewardForDuration(), // 1e18
  ] as const
  const [
    until,
    rewardsDuration,
    sgtRewardsPerPeriod,
  ] = await ethcallProvider.all(multicalls, {})

  const now = BigNumber.from(Math.floor(Date.now() / 1000))
  const remainingDays = until.sub(now).div(60 * 60 * 24) // 1e0
  const rewardsDurationDays = rewardsDuration.div(60 * 60 * 24) // 1e0
  const remainingRewards = remainingDays.mul(
    sgtRewardsPerPeriod.div(rewardsDurationDays),
  ) // 1e18

  const remainingRewardsValueUSD = parseUnits(sgtPrice.toFixed(2), 4).mul(
    remainingRewards,
  ) // 1e22
  const annualCoefficient = BigNumber.from(365)
    .mul(BigNumber.from(10).pow(18))
    .div(remainingDays) // 1e18
  const pctYieldForPool = remainingRewardsValueUSD.div(tvlUsd) // 1e4
  return pctYieldForPool.mul(annualCoefficient).div(BigNumber.from(10).pow(4)) // 1e18
}
