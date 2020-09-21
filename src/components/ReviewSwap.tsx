import React from "react"
import "./ReviewSwap.scss"

interface Props {
  onClose: () => void
  onConfirm: () => void
}

function ReviewSwap({ onClose, onConfirm }: Props) {
  return (
    <div className="reviewSwap">
      <h3>Review Swap</h3>
      <button onClick={onConfirm}>Confirm Swap</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  )
}

export default ReviewSwap
