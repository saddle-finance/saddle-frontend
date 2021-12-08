import { useCallback, useContext } from "react"
import { Context } from "../providers/ModalsProvider"

const useModal = (
  modal: React.ReactNode,
  key?: string,
): [() => void, () => void] => {
  const { onClose, onPresent } = useContext(Context)

  const handlePresent = useCallback(() => {
    onPresent(modal, key)
  }, [key, modal, onPresent])

  return [handlePresent, onClose]
}

export default useModal
