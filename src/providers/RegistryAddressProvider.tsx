import {
  CHILD_GAUGE_FACTORY_NAME,
  useMasterRegistry,
} from "../hooks/useContract"
import {
  EMPTY_LOADABLE,
  LoadableType,
  useLoadingState,
} from "../utils/loadable"
import React, { ReactElement, useEffect } from "react"
import { ChainId } from "../constants"
import { parseBytes32String } from "ethers/lib/utils"
import { useActiveWeb3React } from "../hooks"

export type RegistryAddress = LoadableType<Partial<Record<string, string>>>

export const RegistryAddressContext = React.createContext<RegistryAddress>({
  ...EMPTY_LOADABLE,
  data: {},
})

export default function RegistryAddressProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const { chainId } = useActiveWeb3React()
  const masterRegistry = useMasterRegistry()
  const { state, onStart, onSuccess, onFailure } = useLoadingState<
    Partial<Record<string, string>>
  >({})

  useEffect(() => {
    onStart()
  }, [onStart])

  useEffect(() => {
    async function fetchAddressesFromRegistry(): Promise<void> {
      if (!masterRegistry) {
        console.error(
          "Master Registry not available. Unable to retrieve contract addresses",
        )
        return
      }

      try {
        const addresses: Partial<Record<string, string>> = {}
        if (chainId !== ChainId.MAINNET && chainId !== ChainId.HARDHAT) {
          const childGaugeFactoryAddress =
            await masterRegistry.resolveNameToLatestAddress(
              CHILD_GAUGE_FACTORY_NAME,
            )
          addresses[parseBytes32String(CHILD_GAUGE_FACTORY_NAME)] =
            childGaugeFactoryAddress
          onSuccess(addresses)
        }
      } catch (error) {
        const errorMessage =
          "Unable to retrieve and set addresses from MasterRegistry"
        console.error(errorMessage)
        onFailure(error as Error)
      }
    }
    void fetchAddressesFromRegistry()
  }, [chainId, masterRegistry, onFailure, onSuccess])
  return (
    <RegistryAddressContext.Provider value={state}>
      {children}
    </RegistryAddressContext.Provider>
  )
}
