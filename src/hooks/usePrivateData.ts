import { calculateBoost, commify } from "../utils"
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useContext, useEffect, useMemo, useState } from "react"
import { useGaugeMinterContract, useVotingEscrowContract } from "./useContract"

import { BN_1E18 } from "../constants"
import { BigNumber } from "@ethersproject/bignumber"
import { GaugeContext } from "../providers/GaugeProvider"
import { UserStateContext } from "../providers/UserStateProvider"
import { Zero } from "@ethersproject/constants"
import { formatUnits } from "@ethersproject/units"
import { useActiveWeb3React } from "."
import { useCallback } from "react"
import useGaugeTVL from "./useGaugeTVL"

const sushiGaugeName = "SLP-gauge"

const snapshotNameMap: Record<string, string> = {
  FraxBP: "0xb2ac3382da625eb41fc803b57743f941a484e2a6",
  "SDL/ETH SLP": "0xc64f8a9fe7babeca66d3997c9d15558bf4817be3",
  "FraxBP-alUSD": "0x953693dcb2e9ddc0c1398c1b540b81b63cea5e16",
  "FraxBP-USX": "0x9585a54297beaa83f044866678b13d388d0180bf",
  "FraxBP-sUSD": "0x104f44551386d603217450822443456229f73ae4",
  D4: "0x702c1b8ec3a77009d5898e18da8f8959b6df2093",
  "FraxBP-USDT": "0x6ec5dd7d8e396973588f0defd79dca04f844d57c",
  "Frax 3pool": "0x13ba45c2b686c6db7c2e28bd3a9e8edd24b894ed",
  "sUSD-V3": "0x2683190e31e8ce47467c98ff1dbc018acdd43c2f",
  "WRen-sBTC": "",
  "WCUSD-V3": "0x3dc88ee38db8c7b6dceb447e4348e51bd87ced93",
  "TBTC-V3": "0xb79b4fcf7cb4a1c4064ff5b48f71a331880ab53a",
  "USD-V2": "0x7b2025bf8c5ee8baad9da8c3e3ee45e96ed8b8ea",
  alETH: "0x8b701e9b3a1887fe9b0c7936a8233b39408e69f6",
  "USDC-USX": "0x50d745c2a2918a47a363a2d32becd6bbc1a53ece",
}
const addressSnapshotNameMap: Record<string, string> = {
  "0xb2ac3382da625eb41fc803b57743f941a484e2a6": "FraxBP",
  "0xc64f8a9fe7babeca66d3997c9d15558bf4817be3": "SDL/ETH SLP",
  "0x953693dcb2e9ddc0c1398c1b540b81b63cea5e16": "FraxBP-alUSD",
  "0x9585a54297beaa83f044866678b13d388d0180bf": "FraxBP-USX",
  "0x104f44551386d603217450822443456229f73ae4": "FraxBP-sUSD",
  "0x702c1b8ec3a77009d5898e18da8f8959b6df2093": "D4",
  "0x6ec5dd7d8e396973588f0defd79dca04f844d57c": "FraxBP-USDT",
  "0x13ba45c2b686c6db7c2e28bd3a9e8edd24b894ed": "Frax 3pool",
  "0x2683190e31e8ce47467c98ff1dbc018acdd43c2f": "sUSD-V3",
  "0x3dc88ee38db8c7b6dceb447e4348e51bd87ced93": "WCUSD-V3",
  "0xb79b4fcf7cb4a1c4064ff5b48f71a331880ab53a": "TBTC-V3",
  "0x7b2025bf8c5ee8baad9da8c3e3ee45e96ed8b8ea": "USD-V2",
  "0x8b701e9b3a1887fe9b0c7936a8233b39408e69f6": "alETH",
  "0x50d745c2a2918a47a363a2d32becd6bbc1a53ece": "USDC-USX",
}

type PrivateGaugeData = {
  [key: string]: {
    tvl: number
    userBoost: number
    userShare: number
    current: {
      gaugeDailySDL: number
      userDailySDL: number
      dollarsPerSDL: number
    }
    future: {
      gaugeDailySDL: number
      userDailySDL: number
      dollarsPerSDL: number
    }
  }
}
export default function usePrivateData() {
  const [data, setData] = useState<unknown>(null)
  const [voteWeights, setVoteWeights] = useState<Record<string, number> | null>(
    null,
  )
  const gaugeMinterContract = useGaugeMinterContract()
  const userGaugesShares = useUserGaugesShares()
  const getGaugeTVL = useGaugeTVL()
  const getUserGaugeBoost = useGetUserGaugeBoost()
  const { gauges } = useContext(GaugeContext)

  useEffect(() => {
    void getSnapshotVoteData().then((r) => setVoteWeights(r))
  }, [])

  useEffect(() => {
    async function main(): Promise<void> {
      if (data || !voteWeights || !gaugeMinterContract || !userGaugesShares)
        return
      const minterRate = parseFloat(
        formatUnits(await gaugeMinterContract.rate(), 18),
      )

      const sdlRatePerDay = minterRate * 60 * 60 * 24

      const currentSDLPerChoice: Record<string, number> = Object.values(
        gauges,
      ).reduce((acc, { address, gaugeRelativeWeight }) => {
        return {
          ...acc,
          [address]:
            parseFloat(formatUnits(gaugeRelativeWeight, 18)) * sdlRatePerDay,
        }
      }, {})

      const futureSDLPerChoice: Record<string, number> = Object.keys(
        voteWeights,
      ).reduce((acc, k) => {
        return {
          ...acc,
          [k]: (voteWeights[k] * sdlRatePerDay) / 1000,
        }
      }, {})
      console.log({ currentSDLPerChoice, futureSDLPerChoice })

      let [currentUserTotalDailySDL, futureUserTotalDailySDL] = [0, 0]
      const newData = Object.values(gauges).reduce(
        (acc, { address: gaugeAddress }) => {
          const snapshotName = addressSnapshotNameMap[gaugeAddress]
          if (!snapshotName) return acc
          const futureDailyGaugeSDL = futureSDLPerChoice[snapshotName] || 0
          const currentDailyGaugeSDL = currentSDLPerChoice[gaugeAddress]
          const gaugeTvl = parseFloat(
            formatUnits(getGaugeTVL(gaugeAddress), 18),
          )

          const userGaugeBoost = parseFloat(
            formatUnits(getUserGaugeBoost(gaugeAddress) || BN_1E18, 18),
          )
          const userShare = userGaugesShares[gaugeAddress] || Zero
          const userGaugeShare = parseFloat(formatUnits(userShare, 16)) / 100

          const futureUserDailySDL =
            userGaugeShare * futureDailyGaugeSDL * userGaugeBoost
          const currentUserDailySDL =
            userGaugeShare * currentDailyGaugeSDL * userGaugeBoost

          currentUserTotalDailySDL += currentUserDailySDL
          futureUserTotalDailySDL += futureUserDailySDL

          return {
            ...acc,
            [snapshotName]: {
              tvl: Math.round(gaugeTvl),
              userBoost: Number(userGaugeBoost.toFixed(2)),
              userShare: userGaugeShare,
              current: {
                gaugeDailySDL: currentDailyGaugeSDL,
                userDailySDL: currentUserDailySDL,
                dollarsPerSDL: currentDailyGaugeSDL
                  ? gaugeTvl / currentDailyGaugeSDL
                  : 0,
              },
              future: {
                gaugeDailySDL: futureDailyGaugeSDL,
                userDailySDL: futureUserDailySDL,
                dollarsPerSDL: futureDailyGaugeSDL
                  ? gaugeTvl / futureDailyGaugeSDL
                  : 0,
              },
            },
          }
        },
        {} as PrivateGaugeData,
      )
      setData({ ...newData, futureUserTotalDailySDL, currentUserTotalDailySDL })
      const tableData = [
        [
          "Name",
          "TVL",
          "Curr. $LP per SDL",
          "Fut. $LP per SDL",
          "Fut. Gauge SDL/Day",
          "User Share %",
          "User Boost",
          "Curr. User SDL",
          "Fut. User SDL",
        ],
        [
          "Total",
          null,
          null,
          null,
          null,
          null,
          null,
          commify(currentUserTotalDailySDL.toFixed(0)),
          commify(futureUserTotalDailySDL.toFixed(0)),
        ],
        ...Object.keys(newData)
          .sort((a, b) => {
            const SORT_BY = "future" // | "current"
            // Sort by max User SDL per day, then min pool dollars per SDL, then max pool TVL
            const [infoA, infoB] = [newData[a], newData[b]]
            const {
              userDailySDL: userDailySDLA,
              dollarsPerSDL: dollarsPerSDLA,
            } = infoA[SORT_BY]
            const {
              userDailySDL: userDailySDLB,
              dollarsPerSDL: dollarsPerSDLB,
            } = infoB[SORT_BY]
            const userDailySDLDiff = userDailySDLB - userDailySDLA // 5 - 2, greater to lesser
            const poolDollarsPerSDLDiff =
              Math.round(dollarsPerSDLA) - Math.round(dollarsPerSDLB) // 2 - 5, less to greater

            if (userDailySDLDiff !== 0) {
              return userDailySDLDiff
            }
            if (dollarsPerSDLA && !dollarsPerSDLB) {
              return -1
            } else if (dollarsPerSDLB && !dollarsPerSDLA) {
              return 1
            } else {
              return poolDollarsPerSDLDiff
            }
          })
          .map((gaugeName) => {
            const info = newData[gaugeName]
            return [
              gaugeName,
              `$${commify(info.tvl.toFixed(0))}`,
              `$${commify(info.current.dollarsPerSDL.toFixed(2))}`,
              `$${commify(info.future.dollarsPerSDL.toFixed(2))}`,
              commify(info.future.gaugeDailySDL.toFixed(0)),
              `${(info.userShare * 100).toFixed(2)}%`,
              info.userBoost,
              commify(info.current.userDailySDL.toFixed(0)),
              commify(info.future.userDailySDL.toFixed(0)),
            ]
          }),
      ]
      console.log(tableData)
      console.table(tableData)
      // console.log({
      //   ...newData,
      //   futureUserTotalDailySDL,
      //   currentUserTotalDailySDL,
      // })
      // console.log(
      //   Object.keys(newData)
      //     .map((g) => [g, newData[g].dollarsPerSDL] as [string, number])
      //     .sort((a, b) => (a[1] < b[1] ? -1 : 1)),
      // )
    }
    void main()
  }, [
    data,
    voteWeights,
    gaugeMinterContract,
    userGaugesShares,
    getGaugeTVL,
    getUserGaugeBoost,
    gauges,
  ])
  return null
}

function useGetUserGaugeBoost() {
  const { account } = useActiveWeb3React()
  const [veSdlBalance, setVeSdlBalance] = useState(Zero)
  const [totalVeSdl, setTotalVeSdl] = useState(Zero)
  const { gauges } = useContext(GaugeContext)
  const votingEscrowContract = useVotingEscrowContract()

  useEffect(() => {
    const fetchVeSdlBalance = async () => {
      if (votingEscrowContract && account) {
        const veSDLBal = await votingEscrowContract["balanceOf(address)"](
          account,
        )
        setVeSdlBalance(veSDLBal)
        const totalSupply = await votingEscrowContract["totalSupply()"]()
        setTotalVeSdl(totalSupply)
      }
    }

    void fetchVeSdlBalance()
  }, [votingEscrowContract, account])

  return useCallback(
    (gaugeAddress: string) => {
      const gauge = Object.values(gauges).find(
        ({ address }) => address === gaugeAddress,
      )
      if (!gauge) return null
      const {
        gaugeBalance: userLPAmount,
        gaugeTotalSupply: totalLpAmout,
        workingBalances: workingBalance,
        workingSupply,
      } = gauge

      const boost = calculateBoost(
        userLPAmount,
        totalLpAmout,
        workingBalance,
        workingSupply,
        veSdlBalance,
        totalVeSdl,
      )
      return boost
    },
    [gauges, totalVeSdl, veSdlBalance],
  )
}

function useUserGaugesShares(): { [gaugeAddress: string]: BigNumber } | null {
  const { gauges } = useContext(GaugeContext)
  const userState = useContext(UserStateContext)

  if (!gauges || !userState) return null

  return Object.values(gauges)
    .filter(({ isKilled }) => !isKilled)
    .reduce((acc, gauge) => {
      const {
        poolName,
        gaugeTotalSupply,
        gaugeName,
        address,
        poolAddress,
        rewards,
      } = gauge
      const farmName =
        gaugeName === sushiGaugeName
          ? "SDL/WETH SLP"
          : poolName || gaugeName || ""
      const gaugeAddress = address
      const myStake =
        userState?.gaugeRewards?.[gaugeAddress]?.amountStaked || Zero
      // const gaugePoolAddress = poolAddress
      const userShare = gaugeTotalSupply.gt(Zero)
        ? myStake.mul(BN_1E18).div(gaugeTotalSupply)
        : Zero
      const sdlReward = rewards[rewards.length - 1]
      // const userSdlRewardRate = userShare
      //   .mul(sdlReward?.rate || Zero)
      //   .div(BN_1E18)
      return {
        ...acc,
        [address]: userShare,
      }
    }, {})
}

interface Response {
  data: {
    proposals: {
      choices: number[]
      scores: number[]
      scores_total: number
    }[]
  }
}

async function getSnapshotVoteData(): Promise<Record<string, number>> {
  const SNAPSHOT_API_URL = "https://hub.snapshot.org/graphql"
  /**
   * If more fields are needed, refer to https://docs.snapshot.org/graphql-api#proposals
   * and add them into the query below
   */
  const query = `{
      proposals(
          first: 1,
          skip: 0,
          where: {
            space_in: ["saddlefinance.eth"],
            title_contains: "Gauge reward allocation"
          },
          orderBy: "created",
          orderDirection: desc
        ) {
          id
          title
          body
          choices
          scores
          scores_total
        }
  }`

  const { choices, scores, scores_total } = await fetch(SNAPSHOT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  })
    .then((res) => res.json())
    .then((result: Response) => result.data.proposals[0])
  const processedResults = choices.reduce((acc, choice, i) => {
    return {
      ...acc,
      [choice]: Math.floor((scores[i] * 1000) / scores_total),
    }
  }, {})
  return processedResults
}
