import {
  ALETH_POOL_NAME,
  BTC_POOL_NAME,
  D4_POOL_NAME,
  STABLECOIN_POOL_NAME,
  STABLECOIN_POOL_V2_NAME,
  VETH2_POOL_NAME,
} from "../constants"
import { POOLS_MAP, PoolName, PoolTypes } from "../constants"
import React, { ReactElement, useState } from "react"

import PoolOverview from "../components/PoolOverview"
import TopMenu from "../components/TopMenu"
import { Zero } from "@ethersproject/constants"
import classNames from "classnames"
import styles from "./Pools.module.scss"
import usePoolData from "../hooks/usePoolData"

function Pools(): ReactElement | null {
  const [d4PoolData, d4UserShareData] = usePoolData(D4_POOL_NAME)
  const [alethPoolData, alethUserShareData] = usePoolData(ALETH_POOL_NAME)
  const [btcPoolData, btcUserShareData] = usePoolData(BTC_POOL_NAME)
  const [usdPoolV2Data, usdV2UserShareData] = usePoolData(
    STABLECOIN_POOL_V2_NAME,
  )
  const [usdPoolData, usdUserShareData] = usePoolData(STABLECOIN_POOL_NAME)
  const [veth2PoolData, veth2UserShareData] = usePoolData(VETH2_POOL_NAME)
  const [filter, setFilter] = useState<PoolTypes | "all" | "outdated">("all")

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
    <div className={styles.poolsPage}>
      <TopMenu activeTab="pools" />
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
      <div className={styles.content}>
        {Object.values(POOLS_MAP)
          .filter(
            ({ type, migration }) =>
              filter === "all" ||
              type === filter ||
              (filter === "outdated" && migration),
          )
          .map(
            ({ name, migration }) =>
              [getPropsForPool(name), migration] as const,
          )
          .sort(([a, aMigration], [b, bMigration]) => {
            // 1. active pools
            // 2. user pools
            // 3. higher TVL pools
            if (aMigration || bMigration) {
              return aMigration ? 1 : -1
            } else if (
              (a.userShareData?.usdBalance || Zero).gt(Zero) ||
              (b.userShareData?.usdBalance || Zero).gt(Zero)
            ) {
              return (a.userShareData?.usdBalance || Zero).gt(
                b.userShareData?.usdBalance || Zero,
              )
                ? -1
                : 1
            } else {
              return (a.poolData?.reserve || Zero).gt(
                b.poolData?.reserve || Zero,
              )
                ? -1
                : 1
            }
          })
          .map(([poolProps]) => (
            <PoolOverview key={poolProps.name} {...poolProps} />
          ))}
      </div>
    </div>
  )
}

export default Pools
