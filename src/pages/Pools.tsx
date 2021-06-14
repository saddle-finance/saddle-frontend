import {
  ALETH_POOL_NAME,
  BTC_POOL_NAME,
  STABLECOIN_POOL_NAME,
  VETH2_POOL_NAME,
} from "../constants"
import React, { ReactElement } from "react"

import PoolOverview from "../components/PoolOverview"
import TopMenu from "../components/TopMenu"
import styles from "./Pools.module.scss"
import usePoolData from "../hooks/usePoolData"

function Pools(): ReactElement | null {
  const [btcPoolData, btcUserShareData] = usePoolData(BTC_POOL_NAME)
  const [usdPoolData, usdUserShareData] = usePoolData(STABLECOIN_POOL_NAME)
  const [veth2PoolData, veth2UserShareData] = usePoolData(VETH2_POOL_NAME)
  const [alethPoolData, alethUserShareData] = usePoolData(ALETH_POOL_NAME)

  return (
    <div className={styles.poolsPage}>
      <TopMenu activeTab="pools" />
      <div className={styles.content}>
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
        />
        <PoolOverview
          poolData={veth2PoolData}
          poolRoute={`/pools/veth2`}
          userShareData={veth2UserShareData}
        />
      </div>
    </div>
  )
}

export default Pools
