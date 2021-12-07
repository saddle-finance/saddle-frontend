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
  onDismiss: () => void
}

export const Context = createContext<ModalsContext>({
  onPresent: () => undefined,
  onDismiss: () => undefined,
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

  const handleDismiss = useCallback(() => {
    setContent(undefined)
    setIsOpen(false)
  }, [setContent, setIsOpen])

  return (
    <Context.Provider
      value={{
        content,
        isOpen,
        onPresent: handlePresent,
        onDismiss: handleDismiss,
      }}
    >
      {children}
      {isOpen && (
        <div className={styles.modalWrapper}>
          <div className={styles.modalBackdrop} onClick={handleDismiss} />
          {React.isValidElement(content) &&
            React.cloneElement(content, {
              onDismiss: handleDismiss,
            })}
        </div>
      )}
    </Context.Provider>
  )
}

// export const useModal = (): ModalsContext => useContext(Context)
export default ModalsProvider
