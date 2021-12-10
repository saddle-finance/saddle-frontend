import { useCallback, useContext } from "react"
import { Context } from "../providers/ModalsProvider"

const useModal = (
  modal: React.ReactNode,
  key?: string,
): [() => void, () => void] => {
  const { onClose, onOpen } = useContext(Context)

  const handlePresent = useCallback(() => {
    onOpen(modal, key)
  }, [key, modal, onOpen])

  return [handlePresent, onClose]
}

export default useModal
