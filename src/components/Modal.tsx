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
      <div className="modal" onClick={onClose}>
        {/* Modal content */}
        <div className="modalContent">
          <span className="close" onClick={onClose}>
            &times;
          </span>
          {children}
        </div>
      </div>
    )
}

export default Modal
