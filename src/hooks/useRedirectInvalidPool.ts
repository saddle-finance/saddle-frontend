import { useContext, useEffect } from "react"
import { useHistory, useParams } from "react-router-dom"

import { BasicPoolsContext } from "../providers/BasicPoolsProvider"

export default function useRedirectInvalidPool() {
  const { poolName } = useParams<{ poolName: string }>()
  const basicPools = useContext(BasicPoolsContext)
  const history = useHistory() as { replace: (path: string) => void }
  useEffect(() => {
    if (poolName && basicPools != null) {
      if (!basicPools[poolName]) {
        console.error(`Invalid pool name: ${poolName}`)
        history.replace("/pools")
      }
    }
  }, [basicPools, poolName, history])
}
