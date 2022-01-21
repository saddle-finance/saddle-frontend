import {
  BTC_POOL_V2_NAME,
  PoolTypes,
  STABLECOIN_POOL_V2_NAME,
  TEST_POOLS_MAP,
  TestPoolName,
} from "../constants"
import React, { ReactElement, useEffect, useState } from "react"

import { BigNumber } from "ethers"
import ConfirmTransaction from "../components/ConfirmTransaction"
import Modal from "../components/Modal"
import PoolOverview from "../components/PoolOverview"
import ReviewMigration from "../components/ReviewMigration"
import { Zero } from "@ethersproject/constants"
import classNames from "classnames"
import { logEvent } from "../utils/googleAnalytics"
import styles from "./Pools.module.scss"
import { useActiveWeb3React } from "../hooks"
import { useApproveAndMigrate } from "../hooks/useApproveAndMigrate"
import usePoolData from "../hooks/usePoolData"

function TestPools(): ReactElement | null {
  const { account, chainId } = useActiveWeb3React()
  const [btcPoolV2Data, btcV2UsersShareData] = usePoolData(BTC_POOL_V2_NAME)
  const [usdPoolV2Data, usdV2UserShareData] = usePoolData(
    STABLECOIN_POOL_V2_NAME,
  )
  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const approveAndMigrate = useApproveAndMigrate()
  const [activeMigration, setActiveMigration] = useState<{
    poolName: TestPoolName | null
    lpTokenBalance: BigNumber
    lpTokenName: string
  }>({ poolName: null, lpTokenBalance: Zero, lpTokenName: "" })
  const [filter, setFilter] = useState<PoolTypes | "all" | "outdated">("all")
  const handleClickMigrate = (
    poolName: TestPoolName,
    lpTokenBalance: BigNumber,
    lpTokenName: string,
  ) => {
    setActiveMigration({ poolName, lpTokenBalance, lpTokenName })
    setCurrentModal("migrate")
  }

  useEffect(() => {
    setActiveMigration({
      poolName: null,
      lpTokenBalance: Zero,
      lpTokenName: "",
    })
  }, [account, chainId])

  function getPropsForPool(poolName: TestPoolName) {
    if (poolName === BTC_POOL_V2_NAME) {
      return {
        name: BTC_POOL_V2_NAME,
        poolData: btcPoolV2Data,
        userShareData: btcV2UsersShareData,
        poolRoute: "/pools/btcv2",
      }
    } else if (poolName === STABLECOIN_POOL_V2_NAME) {
      return {
        name: STABLECOIN_POOL_V2_NAME,
        poolData: usdPoolV2Data,
        userShareData: usdV2UserShareData,
        poolRoute: "/pools/usdv2",
      }
    }
  }
  return (
    <div className={styles.poolsPage}>
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
        {Object.values(TEST_POOLS_MAP)
          .filter(({ addresses }) => (chainId ? addresses[chainId] : false))
          .map(
            ({ name, type, isOutdated }) =>
              [getPropsForPool(name), isOutdated, type] as const,
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
                        TEST_POOLS_MAP[poolProps.poolData.name].name,
                        poolProps.userShareData?.lpTokenBalance ?? Zero,
                        TEST_POOLS_MAP[poolProps.poolData.name].lpToken.symbol,
                      )
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
      </Modal>
    </div>
  )
}

export default TestPools
