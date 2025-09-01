import React from 'react'

function ToastPop({ message, showToast }) {
  return (
    <div className={`toast-pop ${showToast ? 'active' : ''}`}>{message}</div>
  )
}

export default ToastPop