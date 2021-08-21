import {
  ALETH_POOL_NAME,
  BTC_POOL_NAME,
  BTC_POOL_V2_NAME,
  D4_POOL_NAME,
  POOLS_MAP,
  PoolName,
  PoolTypes,
  STABLECOIN_POOL_NAME,
  STABLECOIN_POOL_V2_NAME,
  SUSD_POOL_NAME,
  VETH2_POOL_NAME,
} from "../constants"
import React, { ReactElement, useState } from "react"

import ConfirmTransaction from "../components/ConfirmTransaction"
import Modal from "../components/Modal"
import PoolOverview from "../components/PoolOverview"
import ReviewMigration from "../components/ReviewMigration"
import TopMenu from "../components/TopMenu"
import { Zero } from "@ethersproject/constants"
import classNames from "classnames"
import { logEvent } from "../utils/googleAnalytics"
import styles from "./Pools.module.scss"
import { useApproveAndMigrateUSD } from "../hooks/useApproveAndMigrateUSD"
import usePoolData from "../hooks/usePoolData"

function Pools(): ReactElement | null {
  const [d4PoolData, d4UserShareData] = usePoolData(D4_POOL_NAME)
  const [alethPoolData, alethUserShareData] = usePoolData(ALETH_POOL_NAME)
  const [btcPoolData, btcUserShareData] = usePoolData(BTC_POOL_NAME)
  const [btcPoolV2Data, btcV2UsersShareData] = usePoolData(BTC_POOL_V2_NAME)
  const [usdPoolV2Data, usdV2UserShareData] = usePoolData(
    STABLECOIN_POOL_V2_NAME,
  )
  const [usdPoolData, usdUserShareData] = usePoolData(STABLECOIN_POOL_NAME)
  const [susdPoolData, susdUserShareData] = usePoolData(SUSD_POOL_NAME)
  const [veth2PoolData, veth2UserShareData] = usePoolData(VETH2_POOL_NAME)
  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const approveAndMigrateUSD = useApproveAndMigrateUSD()
  const [activeMigration, setActiveMigration] = useState<PoolName | null>(null)
  const [filter, setFilter] = useState<PoolTypes | "all" | "outdated">("all")
  const handleClickMigrate = (poolName: PoolName) => {
    setActiveMigration(poolName)
    setCurrentModal("migrate")
  }

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
    } else if (poolName === SUSD_POOL_NAME) {
      return {
        name: SUSD_POOL_NAME,
        poolData: susdPoolData,
        userShareData: susdUserShareData,
        poolRoute: "/pools/susd",
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
            ({ type, migration, isOutdated }) =>
              filter === "all" ||
              type === filter ||
              (filter === "outdated" && (migration || isOutdated)),
          )
          .map(
            ({ name, migration, isOutdated }) =>
              [getPropsForPool(name), migration, isOutdated] as const,
          )
          .sort(
            ([a, aMigration, aIsOutdated], [b, bMigration, bIsOutdated]) => {
              // 1. active pools
              // 2. user pools
              // 3. higher TVL pools
              if (aMigration || bMigration || aIsOutdated || bIsOutdated) {
                return aMigration || aIsOutdated ? 1 : -1
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
            },
          )
          .map(([poolProps, migrationPool]) => (
            <PoolOverview
              key={poolProps.name}
              {...poolProps}
              onClickMigrate={
                migrationPool
                  ? () => handleClickMigrate(migrationPool)
                  : undefined
              }
            />
          ))}
      </div>
      <Modal
        isOpen={!!currentModal}
        onClose={(): void => setCurrentModal(null)}
      >
        {currentModal === "migrate" ? (
          <ReviewMigration
            onClose={(): void => {
              setCurrentModal(null)
              setActiveMigration(null)
            }}
            onConfirm={async (): Promise<void> => {
              setCurrentModal("confirm")
              logEvent("migrate", {
                pool: activeMigration,
              })
              await approveAndMigrateUSD(usdUserShareData?.lpTokenBalance)
              setCurrentModal(null)
              setActiveMigration(null)
            }}
            migrationAmount={usdUserShareData?.lpTokenBalance}
          />
        ) : null}
        {currentModal === "confirm" ? <ConfirmTransaction /> : null}
      </Modal>
    </div>
  )
}

export default Pools
