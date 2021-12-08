import React, { PropsWithChildren } from "react"
import style from "./ModalAction.module.scss"

const ModalActions: React.FC = ({ children }: PropsWithChildren<unknown>) => {
  const childrenLength = React.Children.toArray(children).length
  return (
    <div className={style.modalActions}>
      {React.Children.map(children, (child, i) => (
        <>
          <div className={style.modalAction}>{child}</div>
          {i < childrenLength - 1 && <div />}
        </>
      ))}
    </div>
  )
}

export default ModalActions
