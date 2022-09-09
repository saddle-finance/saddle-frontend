import { MinichefData, getMinichefRewardsPoolsData } from "../utils/minichef"
import React, { ReactElement, useContext, useEffect, useState } from "react"

import { BasicPoolsContext } from "./BasicPoolsProvider"
import { useActiveWeb3React } from "../hooks"

export const MinichefContext = React.createContext<MinichefData | null>(null)

export default function MinichefProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const { chainId, library } = useActiveWeb3React()
  const pools = useContext(BasicPoolsContext)
  const [rewardsData, setRewardsData] = useState<MinichefData | null>(null)
  useEffect(() => {
    async function fetchTokens() {
      if (!chainId || !library || !pools) {
        setRewardsData(null)
        return
      }
      const poolsData = Object.values(pools || {}).map(
        ({ poolAddress, lpToken, miniChefRewardsPid, lpTokenSupply }) => ({
          poolAddress,
          lpToken,
          miniChefRewardsPid,
          lpTokenSupply,
        }),
      )
      const rewardsData = await getMinichefRewardsPoolsData(
        library,
        chainId,
        poolsData,
      )
      setRewardsData(rewardsData)
    }
    void fetchTokens()
  }, [chainId, library, pools])
  return (
    <MinichefContext.Provider value={rewardsData}>
      {children}
    </MinichefContext.Provider>
  )
}
