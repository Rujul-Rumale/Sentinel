import React from 'react'
import './ErrorModal.css'

export default function ErrorModal({ show, message, onClose }) {
  if (!show) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Connection Issue</h3>
        </div>
        <div className="modal-body">
          <p>{message || "The API key was invalidated or timed out. Please check your configuration."}</p>
        </div>
        <div className="modal-footer">
          <button onClick={onClose}>Dismiss</button>
        </div>
      </div>
    </div>
  )
}
