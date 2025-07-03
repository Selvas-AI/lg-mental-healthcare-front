import React, { useEffect, useRef, useState } from 'react'

function ClientMemo({ onClose, initialMemo = "" }) {
  const [memo, setMemo] = useState(initialMemo);
  const maxLength = 500;
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerText = initialMemo;
    }
    setMemo(initialMemo);
  }, [initialMemo]);

  const handleInput = e => {
    setMemo(e.target.innerText);
  };

  const isOver = memo.length > maxLength;

  return (
    <div className="modal client-memo on">
      <div className="modal-dim fixed top-0 left-0 w-full h-full z-[999]" onClick={onClose}></div>
      <div className="inner z-[1000]" onClick={e => e.stopPropagation()}>
        <div className="modal-hd">
            <strong>내담자 메모</strong>
            <button className="close-btn" type="button" aria-label="닫기" onClick={onClose}></button>
        </div>
        <div className="editor-wrap">
          <div
            className="editor"
            contentEditable
            data-placeholder="예 : 충동행동이 있으며, 항정신성 약물을 복용 중임"
            onInput={handleInput}
            ref={editorRef}
            suppressContentEditableWarning={true}
            style={isOver ? { borderColor: 'red' } : {}}
          />
          <div className="current-info">
            <p className="warning" style={isOver ? { opacity: 1 } : { opacity: 0 }}>글자수를 초과했습니다.</p>
            <p className="count">
              <span className="chk-byte">{memo.length}</span> / <span className="maximum">{maxLength}</span>
            </p>
          </div>
        </div>
        <div className="btn-wrap">
          <button className="type08" type="button" onClick={onClose}>취소</button>
          <button className="type08 black" type="button" disabled={isOver}>저장</button>
        </div>
      </div>
    </div>
  )
}

export default ClientMemo