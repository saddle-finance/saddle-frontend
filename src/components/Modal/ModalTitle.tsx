import React, { ReactElement } from "react"
import style from "./ModalTitle.module.scss"

interface Props {
  title: string
}

export default function ModalTitle({ title }: Props): ReactElement {
  return <div className={style.modalTitle}>{title}</div>
}
