import {
  ALETH_POOL_NAME,
  BTC_POOL_NAME,
  D4_POOL_NAME,
  STABLECOIN_POOL_NAME,
  VETH2_POOL_NAME,
} from "../constants"
import { POOLS_MAP, PoolName, PoolTypes } from "../constants"
import React, { ReactElement, useState } from "react"

import PoolOverview from "../components/PoolOverview"
import TopMenu from "../components/TopMenu"
import classNames from "classnames"
import styles from "./Pools.module.scss"
import usePoolData from "../hooks/usePoolData"

function Pools(): ReactElement | null {
  const [d4PoolData, d4UserShareData] = usePoolData(D4_POOL_NAME)
  const [alethPoolData, alethUserShareData] = usePoolData(ALETH_POOL_NAME)
  const [btcPoolData, btcUserShareData] = usePoolData(BTC_POOL_NAME)
  const [usdPoolData, usdUserShareData] = usePoolData(STABLECOIN_POOL_NAME)
  const [veth2PoolData, veth2UserShareData] = usePoolData(VETH2_POOL_NAME)
  const [filter, setFilter] = useState<PoolTypes | "all">("all")

  function getPropsForPool(poolName: PoolName) {
    if (poolName === D4_POOL_NAME) {
      return {
        poolData: d4PoolData,
        userShareData: d4UserShareData,
        poolRoute: "/pools/d4",
      }
    } else if (poolName === ALETH_POOL_NAME) {
      return {
        poolData: alethPoolData,
        userShareData: alethUserShareData,
        poolRoute: "/pools/aleth",
      }
    } else if (poolName === BTC_POOL_NAME) {
      return {
        poolData: btcPoolData,
        userShareData: btcUserShareData,
        poolRoute: "/pools/btc",
      }
    } else if (poolName === STABLECOIN_POOL_NAME) {
      return {
        poolData: usdPoolData,
        userShareData: usdUserShareData,
        poolRoute: "/pools/usd",
      }
    } else {
      return {
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
        <li
          className={classNames(styles.filterTab, {
            [styles.selected]: filter === "all",
          })}
          onClick={(): void => setFilter("all")}
        >
          ALL
        </li>
        <li
          className={classNames(styles.filterTab, {
            [styles.selected]: filter === PoolTypes.BTC,
          })}
          onClick={(): void => setFilter(PoolTypes.BTC)}
        >
          BTC
        </li>
        <li
          className={classNames(styles.filterTab, {
            [styles.selected]: filter === PoolTypes.USD,
          })}
          onClick={(): void => setFilter(PoolTypes.USD)}
        >
          USD
        </li>
        <li
          className={classNames(styles.filterTab, {
            [styles.selected]: filter === PoolTypes.ETH,
          })}
          onClick={(): void => setFilter(PoolTypes.ETH)}
        >
          ETH
        </li>
        {/* <li
          className={classNames(styles.outdated, styles.filterTab, {
            [styles.selected]: filter === "outdated",
          })}
          onClick={(): void => setFilter("outdated")}
        >
          OUTDATED
        </li> */}
      </ul>

      <div className={styles.content}>
        {Object.values(POOLS_MAP)
          .filter(({ type }) => filter === "all" || type === filter)
          .map(({ name }, index) => (
            <PoolOverview key={index} {...getPropsForPool(name)} />
          ))}
      </div>
    </div>
  )
}

export default Pools
