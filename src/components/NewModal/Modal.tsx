import React, { PropsWithChildren } from "react"
import styles from "./Modal.module.scss"

const Modal: React.FC = ({ children }: PropsWithChildren<unknown>) => {
  return (
    <div className={styles.responsiveWrapper}>
      <div className={styles.modal}>{children}</div>
    </div>
  )
}

export default Modal
