import React, { useEffect, useRef, useState } from 'react';

function EditorModal({
  open = true,
  onClose,
  onSave,
  title = '',
  className = '',
  placeholder = '',
  maxLength = 500,
  initialValue = '',
  saveDisabled = false,
}) {
  const [value, setValue] = useState(initialValue || '');
  const editorRef = useRef(null);
  const isOver = value.length > maxLength;

  useEffect(() => {
    if (editorRef.current) {
      // 개행 문자를 <br> 태그로 변환하여 표시
      editorRef.current.innerHTML = (initialValue || '').replace(/\n/g, '<br>');
    }
    setValue(initialValue || '');
  }, [initialValue, open]);

  if (!open) return null;

  return (
    <div className={`modal ${className} on`}>
      <div className="modal-dim fixed top-0 left-0 w-full h-full z-[999]" onClick={onClose}></div>
      <div className="inner z-[1000]" onClick={e => e.stopPropagation()}>
        <div className="modal-hd">
          <strong>{title}</strong>
          <button className="close-btn" type="button" aria-label="닫기" onClick={onClose}></button>
        </div>
        <div className="editor-wrap">
          <div
            className="editor"
            contentEditable
            data-placeholder={placeholder}
            onInput={e => setValue(e.currentTarget.innerText)}
            ref={editorRef}
            suppressContentEditableWarning={true}
            style={isOver ? { borderColor: 'red', minHeight: '100px' } : { minHeight: '100px' }}
          />
          <div className="current-info">
            <p className="warning" style={isOver ? { opacity: 1 } : { opacity: 0 }}>글자수를 초과했습니다.</p>
            <p className="count">
              <span className="chk-byte">{value.length}</span> / <span className="maximum">{maxLength}</span>
            </p>
          </div>
        </div>
        <div className="btn-wrap">
          <button className="type08" type="button" onClick={onClose}>취소</button>
          <button className="type08 black" type="button" disabled={isOver || saveDisabled} onClick={() => onSave && onSave(value)}>저장</button>
        </div>
      </div>
    </div>
  );
}

export default EditorModal;