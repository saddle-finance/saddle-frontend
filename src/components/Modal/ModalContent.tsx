import React, { PropsWithChildren, ReactElement } from "react"
import styles from "./ModalContent.module.scss"

export default function ModalContent({
  children,
}: PropsWithChildren<unknown>): ReactElement {
  return <div className={styles.modalContent}>{children}</div>
}
