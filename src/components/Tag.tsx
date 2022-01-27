import React, { ReactElement } from "react"
import classNames from "classnames"
import styles from "./Tag.module.scss"

type Props = {
  size: "small" | "large"
  kind: "disabled" | "primary" | "error" | "warning"
}

export default function Tag(
  props: React.PropsWithChildren<Props>,
): ReactElement {
  const { size, kind, ...tagProps } = props
  return (
    <span
      className={classNames(styles.tag, styles[kind], styles[size])}
      {...tagProps}
    />
  )
}
