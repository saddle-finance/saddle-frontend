import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useState,
} from "react"
import styles from "./ModalProvider.module.scss"

interface ModalsContext {
  content?: React.ReactNode
  isOpen?: boolean
  onPresent: (content: React.ReactNode, key?: string) => void
  onClose: () => void
}

export const Context = createContext<ModalsContext>({
  onPresent: () => undefined,
  onClose: () => undefined,
})

const ModalsProvider: React.FC = ({ children }: PropsWithChildren<unknown>) => {
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState<React.ReactNode>()
  const [, setModalKey] = useState<string>()

  const handlePresent = useCallback(
    (modalContent: React.ReactNode, key?: string) => {
      setModalKey(key)
      setContent(modalContent)
      setIsOpen(true)
    },
    [setContent, setIsOpen, setModalKey],
  )

  const handleClose = useCallback(() => {
    setContent(undefined)
    setIsOpen(false)
  }, [setContent, setIsOpen])

  return (
    <Context.Provider
      value={{
        content,
        isOpen,
        onPresent: handlePresent,
        onClose: handleClose,
      }}
    >
      {children}
      {isOpen && (
        <div className={styles.modalWrapper}>
          <div className={styles.modalBackdrop} onClick={handleClose} />
          {React.isValidElement(content) &&
            React.cloneElement(content, {
              onClose: handleClose,
            })}
        </div>
      )}
    </Context.Provider>
  )
}

export default ModalsProvider
