import { BigNumber } from "@ethersproject/bignumber"

export type Partners = "keep" | "sharedStake" | "alchemix" | "frax"

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
}
export function getThirdPartyDataForPool(): ThirdPartyData {
  const result: ThirdPartyData = {
    aprs: {},
    amountsStaked: {},
  }
  // if (poolName === ALETH_POOL_NAME) {
  //   const rewardSymbol = "ALCX"
  //   const [apr, userStakedAmount] = await getAlEthData(
  //     library,
  //     chainId,
  //     lpTokenPriceUSD,
  //     tokenPricesUSD?.[rewardSymbol],
  //     accountId,
  //   )
  //   result.aprs.alchemix = { apr, symbol: rewardSymbol }
  //   result.amountsStaked.alchemix = userStakedAmount
  // } else if (poolName === VETH2_POOL_NAME) {
  //   const rewardSymbol = "SGT"
  //   const [apr, userStakedAmount] = await getSharedStakeData(
  //     library,
  //     chainId,
  //     lpTokenPriceUSD,
  //     tokenPricesUSD?.[rewardSymbol],
  //     accountId,
  //   )
  //   result.aprs.sharedStake = { apr, symbol: rewardSymbol }
  //   result.amountsStaked.sharedStake = userStakedAmount
  // } else if (poolName === BTC_POOL_NAME) {
  //   const rewardSymbol = "KEEP"
  //   const [apr, userStakedAmount] = await getKeepData(
  //     library,
  //     chainId,
  //     lpTokenPriceUSD,
  //     tokenPricesUSD?.[rewardSymbol],
  //     accountId,
  //   )
  //   result.aprs.keep = { apr, symbol: rewardSymbol }
  //   result.amountsStaked.keep = userStakedAmount
  // } else if (poolName === D4_POOL_NAME) {
  //   // this is a slight bastardization of how this is supposed to work
  //   // TODO: update once we have UI for multiple APYS
  //   const rewardSymbol = "ALCX/FXS/LQTY/TRIBE"
  //   const [apr, userStakedAmount] = await getFraxData(
  //     library,
  //     chainId,
  //     lpTokenPriceUSD,
  //   )
  //   result.aprs.frax = { apr, symbol: rewardSymbol }
  //   result.amountsStaked.frax = userStakedAmount
  // }
  return result
}
