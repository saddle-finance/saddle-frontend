import "./Modal.scss"

import React, { ReactElement, ReactNode } from "react"

interface Props {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  height?: string
}

function Modal({ isOpen, onClose, children }: Props): ReactElement | null {
  if (!isOpen) return null
  else
    return (
      // Modal container, provide the dark background
      <div
        className="modal"
        onClick={(e: React.MouseEvent<HTMLSpanElement, MouseEvent>): void => {
          if (e.target === e.currentTarget) {
            onClose()
          }
        }}
      >
        {/* Modal content */}
        <div className="modalContent">
          <span
            className="close"
            onClick={(
              e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
            ): void => {
              e.stopPropagation()
              onClose()
            }}
          >
            &times;
          </span>
          {children}
        </div>
      </div>
    )
}

export default Modal
