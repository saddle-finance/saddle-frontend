import {
  ALETH_POOL_NAME,
  BTC_POOL_NAME,
  POOLS_MAP,
  PoolName,
  TRANSACTION_TYPES,
} from "../constants"
import { AddressZero, Zero } from "@ethersproject/constants"
import { formatBNToPercentString, getContract } from "../utils"
import { useEffect, useState } from "react"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import LPTOKEN_GUARDED_ABI from "../constants/abis/lpTokenGuarded.json"
import LPTOKEN_UNGUARDED_ABI from "../constants/abis/lpTokenUnguarded.json"
import { LpTokenGuarded } from "../../types/ethers-contracts/LpTokenGuarded"
import { LpTokenUnguarded } from "../../types/ethers-contracts/LpTokenUnguarded"
import { SwapFlashLoan } from "../../types/ethers-contracts/SwapFlashLoan"
import { SwapFlashLoanNoWithdrawFee } from "../../types/ethers-contracts/SwapFlashLoanNoWithdrawFee"
import { getThirdPartyDataForPool } from "../utils/thirdPartyIntegrations"
import { parseUnits } from "@ethersproject/units"
import { useActiveWeb3React } from "."
import { useSelector } from "react-redux"
import { useSwapContract } from "./useContract"

interface TokenShareType {
  percent: string
  symbol: string
  value: BigNumber
}

export type Partners = "keep" | "sharedStake" | "alchemix"
export interface PoolDataType {
  adminFee: BigNumber
  aParameter: BigNumber
  apy: string // TODO: calculate
  name: string
  reserve: BigNumber
  swapFee: BigNumber
  tokens: TokenShareType[]
  totalLocked: BigNumber
  utilization: string // TODO: calculate
  virtualPrice: BigNumber
  volume: string // TODO: calculate
  aprs: Partial<
    Record<
      Partners,
      {
        apr: BigNumber
        symbol: string
      }
    >
  >
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
  amountsStaked: Partial<Record<Partners, BigNumber>>
}

export type PoolDataHookReturnType = [PoolDataType, UserShareType | null]

const emptyPoolData = {
  adminFee: Zero,
  aParameter: Zero,
  apy: "",
  name: "",
  reserve: Zero,
  swapFee: Zero,
  tokens: [],
  totalLocked: Zero,
  utilization: "",
  virtualPrice: Zero,
  volume: "",
  aprs: {},
  lpTokenPriceUSD: Zero,
} as PoolDataType

export default function usePoolData(
  poolName?: PoolName,
): PoolDataHookReturnType {
  const { account, library, chainId } = useActiveWeb3React()
  const swapContract = useSwapContract(poolName)
  const { tokenPricesUSD, lastTransactionTimes } = useSelector(
    (state: AppState) => state.application,
  )
  const lastDepositTime = lastTransactionTimes[TRANSACTION_TYPES.DEPOSIT]
  const lastWithdrawTime = lastTransactionTimes[TRANSACTION_TYPES.WITHDRAW]
  const lastSwapTime = lastTransactionTimes[TRANSACTION_TYPES.SWAP]

  const [poolData, setPoolData] = useState<PoolDataHookReturnType>([
    {
      ...emptyPoolData,
      name: poolName || "",
    },
    null,
  ])

  useEffect(() => {
    async function getSwapData(): Promise<void> {
      if (
        poolName == null ||
        swapContract == null ||
        tokenPricesUSD == null ||
        library == null ||
        chainId == null
      )
        return
      const POOL = POOLS_MAP[poolName]

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let withdrawPromises: any
      if (POOL.name === ALETH_POOL_NAME) {
        withdrawPromises = [
          Promise.resolve(BigNumber.from(0)),
          (swapContract as SwapFlashLoanNoWithdrawFee).swapStorage(),
          (swapContract as SwapFlashLoanNoWithdrawFee).getA(),
        ]
      } else {
        withdrawPromises = [
          (swapContract as SwapFlashLoan).calculateCurrentWithdrawFee(
            account || AddressZero,
          ),
          (swapContract as SwapFlashLoan).swapStorage(), // will fail without account
          (swapContract as SwapFlashLoanNoWithdrawFee).getA(),
        ]
      }

      // Swap fees, price, and LP Token data
      const [
        userCurrentWithdrawFee,
        swapStorage,
        aParameter,
      ] = await Promise.all(withdrawPromises)
      const {
        adminFee,
        lpToken: lpTokenAddress,
        swapFee,
      } = swapStorage as SwapFlashLoan
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

      const { aprs, amountsStaked } = await getThirdPartyDataForPool(
        library,
        chainId,
        account,
        poolName,
        tokenPricesUSD,
        lpTokenPriceUSD,
      )

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
      const userLpTokenBalanceStakedElsewhere = Object.keys(
        amountsStaked,
      ).reduce(
        (sum, key) => sum.add(amountsStaked[key as Partners] || Zero),
        Zero,
      )
      // lpToken balance in wallet as a % of total lpTokens, plus lpTokens staked elsewhere
      const userShare = calculatePctOfTotalShare(userLpTokenBalance).add(
        calculatePctOfTotalShare(userLpTokenBalanceStakedElsewhere),
      )
      const userPoolTokenBalances = tokenBalances.map((balance) => {
        return userShare.mul(balance).div(BigNumber.from(10).pow(18))
      })
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
        adminFee: adminFee as BigNumber,
        swapFee: swapFee as BigNumber,
        aParameter: aParameter as BigNumber,
        volume: "XXX", // TODO
        utilization: "XXX", // TODO
        apy: "XXX", // TODO
        aprs,
        lpTokenPriceUSD,
      }
      const userShareData = account
        ? {
            name: poolName,
            share: userShare,
            underlyingTokensAmount: userPoolTokenBalancesSum,
            usdBalance: userPoolTokenBalancesUSDSum,
            tokens: userPoolTokens,
            currentWithdrawFee: userCurrentWithdrawFee as BigNumber,
            lpTokenBalance: userLpTokenBalance,
            amountsStaked: Object.keys(amountsStaked).reduce((acc, key) => {
              const amount = amountsStaked[key as Partners]
              return key
                ? {
                    ...acc,
                    [key]: amount
                      ?.mul(virtualPrice)
                      .div(BigNumber.from(10).pow(18)),
                  }
                : acc
            }, {}), // this is # of underlying tokens (eg btc), not lpTokens
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
  ])

  return poolData
}
