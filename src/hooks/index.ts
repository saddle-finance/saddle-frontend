import { injectedMetaMaskProvider, injectedTallyProvider } from "../connectors"
import { useEffect, useState } from "react"

import { ChainId } from "../constants/networks"
import { NetworkContextName } from "../constants"
import { Web3Provider } from "@ethersproject/providers"
import { Web3ReactContextInterface } from "@web3-react/core/dist/types"
import { isMobile } from "react-device-detect"
import { useWeb3React as useWeb3ReactCore } from "@web3-react/core"

export function useActiveWeb3React(): Web3ReactContextInterface<Web3Provider> & {
  chainId?: ChainId
} {
  const context = useWeb3ReactCore<Web3Provider>()
  const contextNetwork = useWeb3ReactCore<Web3Provider>(NetworkContextName)
  return context.active ? context : contextNetwork
}

export function useEagerConnect(): boolean {
  const { activate, active } = useWeb3ReactCore() // specifically using useWeb3ReactCore because of what this hook does
  const [tried, setTried] = useState(false)

  useEffect(() => {
    if (window.ethereum) {
      if (window.ethereum.isTally) {
        void injectedTallyProvider.isAuthorized().then((isAuthorized) => {
          if (isAuthorized) {
            activate(injectedTallyProvider, undefined, true).catch(() => {
              setTried(true)
            })
          } else {
            if (isMobile && window.ethereum) {
              activate(injectedTallyProvider, undefined, true).catch(() => {
                setTried(true)
              })
            } else {
              setTried(true)
            }
          }
        })
      } else if (window.ethereum?.isMetaMask) {
        void injectedMetaMaskProvider.isAuthorized().then((isAuthorized) => {
          if (isAuthorized) {
            activate(injectedMetaMaskProvider, undefined, true).catch(() => {
              setTried(true)
            })
          } else {
            if (isMobile) {
              activate(injectedMetaMaskProvider, undefined, true).catch(() => {
                setTried(true)
              })
            } else {
              setTried(true)
            }
          }
        })
      }
    } else {
      setTried(true)
    }
  }, [activate]) // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true)
    }
  }, [active])

  return tried
}

/**
 * Use for network and injected - logs user in
 * and out after checking what network theyre on
 * @param {boolean} suppress Suppress useEffect behaviour
 */
export function useInactiveListener(suppress = false): void {
  const { active, error, activate } = useWeb3ReactCore() // specifically using useWeb3React because of what this hook does

  useEffect(() => {
    const { ethereum } = window

    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleChainChanged = (): void => {
        if (ethereum.isTally) {
          // eat errors
          activate(injectedTallyProvider, undefined, true).catch((error) => {
            console.error("Failed to activate after chain changed", error)
          })
        } else if (ethereum.isMetaMask) {
          // eat errors
          activate(injectedMetaMaskProvider, undefined, true).catch((error) => {
            console.error("Failed to activate after chain changed", error)
          })
        }
      }

      const handleAccountsChanged = (accounts: string[]): void => {
        if (accounts.length > 0) {
          if (ethereum.isTally) {
            // eat errors
            activate(injectedTallyProvider, undefined, true).catch((error) => {
              console.error("Failed to activate after accounts changed", error)
            })
          } else if (ethereum.isMetaMask) {
            // eat errors
            activate(injectedMetaMaskProvider, undefined, true).catch(
              (error) => {
                console.error(
                  "Failed to activate after accounts changed",
                  error,
                )
              },
            )
          }
        }
      }

      ethereum.on("chainChanged", handleChainChanged)
      ethereum.on("accountsChanged", handleAccountsChanged)

      return (): void => {
        if (ethereum.removeListener) {
          ethereum.removeListener("chainChanged", handleChainChanged)
          ethereum.removeListener("accountsChanged", handleAccountsChanged)
        }
      }
    }
    return undefined
  }, [active, error, suppress, activate])
}
