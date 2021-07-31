import React, { ReactElement } from "react"
import styles from "./Version.module.scss"

function Version(): ReactElement | null {
  return (
    <div className={styles.version}>
      VERSION {process.env.REACT_APP_GIT_SHA}
    </div>
  )
}

export default Version
