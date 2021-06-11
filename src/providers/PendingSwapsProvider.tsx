import React, { ReactElement } from "react"
import usePendingSwapData, { PendingSwap } from "../hooks/usePendingSwapData"

export const PendingSwapsContext = React.createContext<PendingSwap[]>([])

export default function PendingSwapsProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const pendingSwaps = usePendingSwapData()

  return (
    <PendingSwapsContext.Provider value={pendingSwaps}>
      {children}
    </PendingSwapsContext.Provider>
  )
}
