import { useEffect, useState } from "react"

import { SUPPORTED_WALLETS } from "../constants"
import { find } from "lodash"
import { uauth } from "../connectors"
import { useConnect } from "wagmi"

export const useUDName = (): string => {
  const connector = useConnect()
  const [udUserName, setUdUserName] = useState<string>("")
  const connectorName = find(SUPPORTED_WALLETS, ["connector", connector])?.name

  useEffect(() => {
    const checkUDName = async () => {
      if (connectorName === "Unstoppable Domains") {
        try {
          const udUser = await uauth.uauth.user()
          setUdUserName(udUser.sub)
        } catch (e) {
          setUdUserName("")
        }
      }
    }
    void checkUDName()

    return () => {
      setUdUserName("")
    }
  }, [connectorName])

  return udUserName
}
