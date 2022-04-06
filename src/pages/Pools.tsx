import {
  ALETH_POOL_NAME,
  ARB_USD_POOL_NAME,
  BTC_POOL_NAME,
  BTC_POOL_V2_NAME,
  D4_POOL_NAME,
  FRAX_ARB_USD_POOL_V2_NAME,
  FRAX_OPT_USD_METAPOOL_NAME,
  FTM_USD_POOL_NAME,
  OPT_USD_POOL_NAME,
  POOLS_MAP,
  PoolName,
  PoolTypes,
  STABLECOIN_POOL_NAME,
  STABLECOIN_POOL_V2_NAME,
  SUSD_METAPOOL_NAME,
  SUSD_METAPOOL_V2_NAME,
  TBTC_METAPOOL_NAME,
  TBTC_METAPOOL_V2_NAME,
  USDS_ARB_USD_METAPOOL_NAME,
  VETH2_POOL_NAME,
  WCUSD_METAPOOL_NAME,
  WCUSD_METAPOOL_V2_NAME,
} from "../constants"
import { Box, Button, Container, Stack, TextField } from "@mui/material"
import React, { ReactElement, useEffect, useState } from "react"

import { BigNumber } from "ethers"
import ConfirmTransaction from "../components/ConfirmTransaction"
import Dialog from "../components/Dialog"
import PoolOverview from "../components/PoolOverview"
import ReviewMigration from "../components/ReviewMigration"
import { Search } from "@mui/icons-material"
import { Zero } from "@ethersproject/constants"
import classNames from "classnames"
import { logEvent } from "../utils/googleAnalytics"
import styles from "./Pools.module.scss"
import { useActiveWeb3React } from "../hooks"
import { useApproveAndMigrate } from "../hooks/useApproveAndMigrate"
import { useHistory } from "react-router"
import usePoolData from "../hooks/usePoolData"

function Pools(): ReactElement | null {
  const { account, chainId } = useActiveWeb3React()
  const [d4PoolData, d4UserShareData] = usePoolData(D4_POOL_NAME)
  const [alethPoolData, alethUserShareData] = usePoolData(ALETH_POOL_NAME)
  const [btcPoolData, btcUserShareData] = usePoolData(BTC_POOL_NAME)
  const [btcPoolV2Data, btcV2UsersShareData] = usePoolData(BTC_POOL_V2_NAME)
  const [usdPoolV2Data, usdV2UserShareData] = usePoolData(
    STABLECOIN_POOL_V2_NAME,
  )
  const [usdPoolData, usdUserShareData] = usePoolData(STABLECOIN_POOL_NAME)
  const [susdPoolData, susdUserShareData] = usePoolData(SUSD_METAPOOL_NAME)
  const [susdPoolV2Data, susdV2UserShareData] = usePoolData(
    SUSD_METAPOOL_V2_NAME,
  )
  const [tbtcPoolData, tbtcUserShareData] = usePoolData(TBTC_METAPOOL_NAME)
  const [tbtcPoolV2Data, tbtcV2UserShareData] = usePoolData(
    TBTC_METAPOOL_V2_NAME,
  )
  const [veth2PoolData, veth2UserShareData] = usePoolData(VETH2_POOL_NAME)
  const [wcusdPoolData, wcusdUserShareData] = usePoolData(WCUSD_METAPOOL_NAME)
  const [wcusdPoolV2Data, wcusdV2UserShareData] = usePoolData(
    WCUSD_METAPOOL_V2_NAME,
  )
  const [arbUsdPoolData, arbUsdUserShareData] = usePoolData(ARB_USD_POOL_NAME)
  const [ftmUsdPoolData, ftmUsdUserShareData] = usePoolData(FTM_USD_POOL_NAME)
  const [optUsdPoolData, optUsdUserShareData] = usePoolData(OPT_USD_POOL_NAME)
  const [fraxOptUsdPoolData, fraxOptUsdUserShareData] = usePoolData(
    FRAX_OPT_USD_METAPOOL_NAME,
  )
  const [fraxArbUsdPoolV2Data, fraxArbUsdV2UserShareData] = usePoolData(
    FRAX_ARB_USD_POOL_V2_NAME,
  )
  const [usdsArbUsdPoolData, usdsArbUsdUserShareData] = usePoolData(
    USDS_ARB_USD_METAPOOL_NAME,
  )
  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const approveAndMigrate = useApproveAndMigrate()
  const [activeMigration, setActiveMigration] = useState<{
    poolName: PoolName | null
    lpTokenBalance: BigNumber
    lpTokenName: string
  }>({ poolName: null, lpTokenBalance: Zero, lpTokenName: "" })
  const [filter, setFilter] = useState<PoolTypes | "all" | "outdated">("all")
  const handleClickMigrate = (
    poolName: PoolName,
    lpTokenBalance: BigNumber,
    lpTokenName: string,
  ) => {
    setActiveMigration({ poolName, lpTokenBalance, lpTokenName })
    setCurrentModal("migrate")
  }

  const history = useHistory()
  useEffect(() => {
    setActiveMigration({
      poolName: null,
      lpTokenBalance: Zero,
      lpTokenName: "",
    })
  }, [account, chainId])

  function getPropsForPool(poolName: PoolName) {
    if (poolName === D4_POOL_NAME) {
      return {
        name: D4_POOL_NAME,
        poolData: d4PoolData,
        userShareData: d4UserShareData,
        poolRoute: "/pools/d4",
      }
    } else if (poolName === ALETH_POOL_NAME) {
      return {
        name: ALETH_POOL_NAME,
        poolData: alethPoolData,
        userShareData: alethUserShareData,
        poolRoute: "/pools/aleth",
      }
    } else if (poolName === BTC_POOL_NAME) {
      return {
        name: BTC_POOL_NAME,
        poolData: btcPoolData,
        userShareData: btcUserShareData,
        poolRoute: "/pools/btc",
      }
    } else if (poolName === BTC_POOL_V2_NAME) {
      return {
        name: BTC_POOL_V2_NAME,
        poolData: btcPoolV2Data,
        userShareData: btcV2UsersShareData,
        poolRoute: "/pools/btcv2",
      }
    } else if (poolName === STABLECOIN_POOL_NAME) {
      return {
        name: STABLECOIN_POOL_NAME,
        poolData: usdPoolData,
        userShareData: usdUserShareData,
        poolRoute: "/pools/usd",
      }
    } else if (poolName === STABLECOIN_POOL_V2_NAME) {
      return {
        name: STABLECOIN_POOL_V2_NAME,
        poolData: usdPoolV2Data,
        userShareData: usdV2UserShareData,
        poolRoute: "/pools/usdv2",
      }
    } else if (poolName === SUSD_METAPOOL_NAME) {
      return {
        name: SUSD_METAPOOL_NAME,
        poolData: susdPoolData,
        userShareData: susdUserShareData,
        poolRoute: "/pools/susd",
      }
    } else if (poolName === SUSD_METAPOOL_V2_NAME) {
      return {
        name: SUSD_METAPOOL_V2_NAME,
        poolData: susdPoolV2Data,
        userShareData: susdV2UserShareData,
        poolRoute: "/pools/susdv2",
      }
    } else if (poolName === TBTC_METAPOOL_NAME) {
      return {
        name: TBTC_METAPOOL_NAME,
        poolData: tbtcPoolData,
        userShareData: tbtcUserShareData,
        poolRoute: "/pools/tbtc",
      }
    } else if (poolName === TBTC_METAPOOL_V2_NAME) {
      return {
        name: TBTC_METAPOOL_V2_NAME,
        poolData: tbtcPoolV2Data,
        userShareData: tbtcV2UserShareData,
        poolRoute: "/pools/tbtcv2",
      }
    } else if (poolName === WCUSD_METAPOOL_NAME) {
      return {
        name: WCUSD_METAPOOL_NAME,
        poolData: wcusdPoolData,
        userShareData: wcusdUserShareData,
        poolRoute: "/pools/wcusd",
      }
    } else if (poolName === WCUSD_METAPOOL_V2_NAME) {
      return {
        name: WCUSD_METAPOOL_V2_NAME,
        poolData: wcusdPoolV2Data,
        userShareData: wcusdV2UserShareData,
        poolRoute: "/pools/wcusdv2",
      }
    } else if (poolName === ARB_USD_POOL_NAME) {
      return {
        name: ARB_USD_POOL_NAME,
        poolData: arbUsdPoolData,
        userShareData: arbUsdUserShareData,
        poolRoute: "/pools/arbusd",
      }
    } else if (poolName === FTM_USD_POOL_NAME) {
      return {
        name: FTM_USD_POOL_NAME,
        poolData: ftmUsdPoolData,
        userShareData: ftmUsdUserShareData,
        poolRoute: "/pools/ftmusd",
      }
    } else if (poolName === OPT_USD_POOL_NAME) {
      return {
        name: OPT_USD_POOL_NAME,
        poolData: optUsdPoolData,
        userShareData: optUsdUserShareData,
        poolRoute: "/pools/optusd",
      }
    } else if (poolName === FRAX_OPT_USD_METAPOOL_NAME) {
      return {
        name: FRAX_OPT_USD_METAPOOL_NAME,
        poolData: fraxOptUsdPoolData,
        userShareData: fraxOptUsdUserShareData,
        poolRoute: "/pools/frax-optusd",
      }
    } else if (poolName === FRAX_ARB_USD_POOL_V2_NAME) {
      return {
        name: FRAX_ARB_USD_POOL_V2_NAME,
        poolData: fraxArbUsdPoolV2Data,
        userShareData: fraxArbUsdV2UserShareData,
        poolRoute: "/pools/frax-arbusdv2",
      }
    } else if (poolName === USDS_ARB_USD_METAPOOL_NAME) {
      return {
        name: USDS_ARB_USD_METAPOOL_NAME,
        poolData: usdsArbUsdPoolData,
        userShareData: usdsArbUsdUserShareData,
        poolRoute: "/pools/usds-arbusd",
      }
    } else {
      return {
        name: VETH2_POOL_NAME,
        poolData: veth2PoolData,
        userShareData: veth2UserShareData,
        poolRoute: "/pools/veth2",
      }
    }
  }
  return (
    <Container sx={{ pb: 5 }}>
      <Stack direction="row" alignItems="center">
        {false && (
          <Box flex={1}>
            <TextField
              variant="standard"
              placeholder="Pool or token"
              InputProps={{
                startAdornment: <Search />,
              }}
            />
          </Box>
        )}
        <ul className={styles.filters}>
          {[
            ["all", "ALL"] as const,
            [PoolTypes.BTC, "BTC"] as const,
            [PoolTypes.ETH, "ETH"] as const,
            [PoolTypes.USD, "USD"] as const,
            ["outdated", "OUTDATED"] as const,
          ].map(([filterKey, text]) => (
            <li
              key={filterKey}
              className={classNames(styles.filterTab, {
                [styles.selected]: filter === filterKey,
                [styles.outdated]: filterKey === "outdated",
              })}
              onClick={(): void => setFilter(filterKey)}
            >
              {text}
            </li>
          ))}
        </ul>

        {false && (
          <Box flex={1}>
            <Button
              variant="contained"
              color="secondary"
              sx={{ float: "right" }}
              onClick={() => history.push("/pools/create")}
            >
              Create Pool
            </Button>
          </Box>
        )}
      </Stack>

      <Stack spacing={3}>
        {Object.values(POOLS_MAP)
          .filter(({ addresses }) => (chainId ? addresses[chainId] : false))
          .map(
            ({ name, type, isOutdated }) =>
              [getPropsForPool(name), isOutdated, type] as const,
          )
          .filter(
            ([poolProps, isOutdated, type]) =>
              filter === "all" ||
              type === filter ||
              (filter === "outdated" &&
                (isOutdated || poolProps.poolData.isMigrated)),
          )
          .sort(([a, aIsOutdated], [b, bIsOutdated]) => {
            // 1. user pools
            // 2. active pools
            // 3. higher TVL pools
            if (
              (a.userShareData?.usdBalance || Zero).gt(Zero) ||
              (b.userShareData?.usdBalance || Zero).gt(Zero)
            ) {
              return (a.userShareData?.usdBalance || Zero).gt(
                b.userShareData?.usdBalance || Zero,
              )
                ? -1
                : 1
            } else if (
              a.poolData.isMigrated ||
              b.poolData.isMigrated ||
              aIsOutdated ||
              bIsOutdated
            ) {
              return a.poolData.isMigrated || aIsOutdated ? 1 : -1
            } else {
              return (a.poolData?.reserve || Zero).gt(
                b.poolData?.reserve || Zero,
              )
                ? -1
                : 1
            }
          })
          .map(([poolProps]) => (
            <PoolOverview
              key={poolProps.name}
              {...poolProps}
              onClickMigrate={
                poolProps.poolData.isMigrated
                  ? () =>
                      handleClickMigrate(
                        POOLS_MAP[poolProps.poolData.name].name,
                        poolProps.userShareData?.lpTokenBalance ?? Zero,
                        POOLS_MAP[poolProps.poolData.name].lpToken.symbol,
                      )
                  : undefined
              }
            />
          ))}
      </Stack>
      <Dialog
        open={!!currentModal}
        onClose={(): void => setCurrentModal(null)}
        hideClose={currentModal === "confirm"}
      >
        {currentModal === "migrate" ? (
          <ReviewMigration
            onClose={(): void => {
              setCurrentModal(null)
              setActiveMigration({
                poolName: null,
                lpTokenBalance: Zero,
                lpTokenName: "",
              })
            }}
            onConfirm={async (): Promise<void> => {
              setCurrentModal("confirm")
              logEvent("migrate", {
                pool: activeMigration.poolName,
              })
              try {
                await approveAndMigrate(
                  activeMigration.poolName,
                  activeMigration.lpTokenBalance,
                )
              } catch (err) {
                console.error(err)
              }
              setCurrentModal(null)
              setActiveMigration({
                poolName: null,
                lpTokenBalance: Zero,
                lpTokenName: "",
              })
            }}
            lpTokenName={activeMigration.lpTokenName}
            migrationAmount={activeMigration.lpTokenBalance}
          />
        ) : null}
        {currentModal === "confirm" ? <ConfirmTransaction /> : null}
      </Dialog>
    </Container>
  )
}

export default Pools
