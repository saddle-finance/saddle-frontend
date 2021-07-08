import {
  ALETH_POOL_NAME,
  BTC_POOL_NAME,
  D4_POOL_NAME,
  STABLECOIN_POOL_NAME,
  VETH2_POOL_NAME,
} from "../constants"
import React, { ReactElement, useState } from "react"

import { BigNumber } from "ethers"
import Modal from "../components/Modal"
import PoolOverview from "../components/PoolOverview"
import ReviewMigration from "../components/ReviewMigration"
import TopMenu from "../components/TopMenu"
import styles from "./Pools.module.scss"
import usePoolData from "../hooks/usePoolData"

function Pools(): ReactElement | null {
  const [btcPoolData, btcUserShareData] = usePoolData(BTC_POOL_NAME)
  const [usdPoolData, usdUserShareData] = usePoolData(STABLECOIN_POOL_NAME)
  const [veth2PoolData, veth2UserShareData] = usePoolData(VETH2_POOL_NAME)
  const [alethPoolData, alethUserShareData] = usePoolData(ALETH_POOL_NAME)
  const [d4PoolData, d4UserShareData] = usePoolData(D4_POOL_NAME)
  const [currentModal, setCurrentModal] = useState<string | null>(null)

  const onMigrate = (): void => {
    setCurrentModal("migrate")
  }

  return (
    <div className={styles.poolsPage}>
      <TopMenu activeTab="pools" />
      <div className={styles.content}>
        <PoolOverview
          poolData={d4PoolData}
          poolRoute={`/pools/d4`}
          userShareData={d4UserShareData}
        />
        <PoolOverview
          poolData={alethPoolData}
          poolRoute={`/pools/aleth`}
          userShareData={alethUserShareData}
        />
        <PoolOverview
          poolData={btcPoolData}
          poolRoute={`/pools/btc`}
          userShareData={btcUserShareData}
        />
        <PoolOverview
          poolData={usdPoolData}
          poolRoute={`/pools/usd`}
          userShareData={usdUserShareData}
          outdated={true}
          onMigrate={onMigrate}
        />
        <PoolOverview
          poolData={veth2PoolData}
          poolRoute={`/pools/veth2`}
          userShareData={veth2UserShareData}
        />
      </div>
      <Modal
        isOpen={!!currentModal}
        onClose={(): void => setCurrentModal(null)}
      >
        {currentModal === "migrate" ? (
          <ReviewMigration
            onClose={(): void => void 0}
            onConfirm={() => void 0}
            data={{
              migrateAmount: {
                amount: 1000,
              },
              txnGasCost: {
                amount: 20,
                valueUSD: BigNumber.from("0x2a"),
              },
            }}
          />
        ) : null}
      </Modal>
    </div>
  )
}

export default Pools
