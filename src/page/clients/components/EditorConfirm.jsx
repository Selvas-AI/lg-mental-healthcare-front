import React from 'react'

function EditorConfirm({ 
  open = false,
  title = '확인',
  message = '작업을 진행하시겠습니까?',
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  onClose,
  className = ''
}) {
  if (!open) return null;

  return (
    <div className={`modal client-survey${className ? ' ' + className : ''} on`}>
      <div className="modal-dim fixed top-0 left-0 w-full h-full z-[999]" onClick={onClose}></div>
      <div className="inner z-[1000]" onClick={e => e.stopPropagation()}>
        <div className="modal-hd">
          <strong>{title}</strong>
          {onClose && (
            <button 
              className="close-btn" 
              type="button" 
              aria-label="닫기"
              onClick={onClose}
            ></button>
          )}
        </div>
        <div className="modal-info">
          {/\n|<br\s*\/?\>/i.test(message) ? (
            <p dangerouslySetInnerHTML={{ __html: message }} />
          ) : (
            <p>{message}</p>
          )}
        </div>
        <div className="btn-wrap">
          {onCancel && (
            <button 
              className="type08" 
              type="button"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}
          {onConfirm && (
            <button 
              className="type08 black" 
              type="button"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditorConfirm
