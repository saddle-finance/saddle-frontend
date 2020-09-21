import React, { ReactNode } from "react"
import "./Modal.scss"

interface Props {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  height?: string
}

function Modal({ isOpen, onClose, children, height }: Props) {
  if (!isOpen) return null
  else
    return (
      // Modal container, provide the dark background
      <div className="modal">
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
