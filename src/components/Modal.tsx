import React from "react"
import "./Modal.scss"

import ConfirmTransaction from "./ConfirmTransaction"

interface Props {
  isOpen: boolean
  onClose: () => void
  height?: string
}

function Modal({ isOpen, onClose, height }: Props) {
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
          <ConfirmTransaction />
        </div>
      </div>
    )
}

export default Modal
