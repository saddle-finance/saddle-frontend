import { useCallback, useContext } from "react"
import { Context } from "../providers/ModalsProvider"

const useModal = (
  modal: React.ReactNode,
  key?: string,
): [() => void, () => void] => {
  const { onDismiss, onPresent } = useContext(Context)

  const handlePresent = useCallback(() => {
    onPresent(modal, key)
  }, [key, modal, onPresent])

  return [handlePresent, onDismiss]
}

export default useModal
