import { useCallback, useContext } from "react"
import { ModalContext } from "../providers/ModalsProvider"

const useModal = (
  modal: React.ReactNode,
  key?: string,
): [() => void, () => void] => {
  const { onClose, onOpen } = useContext(ModalContext)

  const handleOpen = useCallback(() => {
    onOpen(modal, key)
  }, [key, modal, onOpen])

  return [handleOpen, onClose]
}

export default useModal
