import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useState,
} from "react"
import styles from "./ModalProvider.module.scss"

interface ModalsContextProps {
  modal?: React.ReactNode
  isOpen?: boolean
  onOpen: (content: React.ReactNode, key?: string) => void
  onClose: () => void
}

export const ModalContext = createContext<ModalsContextProps>({
  onOpen: () => undefined,
  onClose: () => undefined,
})

const ModalsProvider: React.FC = ({ children }: PropsWithChildren<unknown>) => {
  const [isOpen, setIsOpen] = useState(false)
  const [modalNode, setModalNode] = useState<React.ReactNode>()

  const handleOpen = useCallback(
    (modalContent: React.ReactNode) => {
      setModalNode(modalContent)
      setIsOpen(true)
    },
    [setModalNode, setIsOpen],
  )

  const handleClose = useCallback(() => {
    setModalNode(<div />)
    setIsOpen(false)
  }, [setModalNode, setIsOpen])

  return (
    <ModalContext.Provider
      value={{
        modal: modalNode,
        isOpen,
        onOpen: handleOpen,
        onClose: handleClose,
      }}
    >
      {children}
      {isOpen && (
        <div className={styles.modalWrapper}>
          <div className={styles.modalBackdrop} onClick={handleClose} />
          {React.isValidElement(modalNode) &&
            React.cloneElement(modalNode, {
              onClose: handleClose,
            })}
        </div>
      )}
    </ModalContext.Provider>
  )
}

export default ModalsProvider
