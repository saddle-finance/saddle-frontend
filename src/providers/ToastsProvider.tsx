import React, { ReactElement, useCallback, useMemo, useState } from "react"

import Toast from "../components/Toast"
import ToastsContainer from "../components/ToastsContainer"
import { createPortal } from "react-dom"
import { nanoid } from "@reduxjs/toolkit"

const autoDismissAfterMs = 10 * 1000

export const ToastsContext = React.createContext<{ addToast: AddToast }>({
  addToast: () => {
    throw new Error("To add a toast, wrap the app in a ToastsProvider.")
  },
})
export type AddToast = (content: ToastContent, options?: {}) => void
export interface ToastObject {
  id: string
  content: ToastContent
  autoDismiss: boolean
  remove: () => void
}
interface ToastContent {
  type: "info" | "success" | "error"
  title: string
}
export default function ToastsProvider({
  children,
}: React.PropsWithChildren<{}>): ReactElement {
  const [toasts, setToasts] = useState<ToastObject[]>([])
  const addToast = useCallback((content, options = {}) => {
    const { autoDismiss = true } = options
    const toastId = nanoid()
    const removeToast = (): void => {
      // O(n) is the best we can do here and is fine given the use case
      setToasts((prevToasts) => prevToasts.filter(({ id }) => id !== toastId))
    }
    let timeoutHandle: ReturnType<typeof setTimeout>
    if (autoDismiss) {
      timeoutHandle = setTimeout(removeToast, autoDismissAfterMs)
    }

    // create toast object
    const toast = {
      id: toastId,
      content,
      autoDismiss,
      remove: (): void => {
        removeToast()
        timeoutHandle && clearTimeout(timeoutHandle)
      },
    }
    // add toast to list
    setToasts((prevToasts) => [...prevToasts, toast])
  }, [])
  const contextValue = useMemo(
    () => ({
      addToast,
    }),
    [addToast],
  )

  return (
    <ToastsContext.Provider value={contextValue}>
      {children}

      {createPortal(
        <ToastsContainer>
          {toasts.map(({ id, remove, content: { type, title } }) => (
            <Toast key={id} type={type} title={title} onClick={remove} />
          ))}
        </ToastsContainer>,
        document.body,
      )}
    </ToastsContext.Provider>
  )
}
