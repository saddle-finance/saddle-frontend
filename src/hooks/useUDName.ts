import { useEffect, useState } from "react"

import { SUPPORTED_WALLETS } from "../constants"
import { find } from "lodash"
import { uauth } from "../connectors"
import { useActiveWeb3React } from "."

export const useUDName = (): string => {
  const { connector } = useActiveWeb3React()
  const [udUser, setUdUser] = useState<string>("")

  const connectorName = find(SUPPORTED_WALLETS, ["connector", connector])?.name
  useEffect(() => {
    const checkUDName = async () => {
      if (connectorName === "Unstoppable Domains") {
        try {
          const udUserRes = await uauth.uauth.user()
          setUdUser(udUserRes.sub)
        } catch (e) {
          setUdUser("")
        }
      }
    }
    void checkUDName()

    return () => {
      setUdUser("")
    }
  }, [connectorName])

  return udUser
}
