import React, { useRef, useEffect, useState } from 'react';

function CustomTextarea({
  value = '',
  onChange,
  maxLength = 500,
  placeholder = '',
  className = '',
  style = {},
  ...rest
}) {
  const [text, setText] = useState(value);
  const isOver = text.length > maxLength;
  const editorRef = useRef(null);

  useEffect(() => {
    if (Array.isArray(value)) {
      // 배열 → bullet-line div로 변환
      const html = value.map(item =>
        `<div class="bullet-line">${item ? String(item).replace(/</g, "&lt;").replace(/>/g, "&gt;") : ""}</div>`
      ).join('');
      if (editorRef.current && editorRef.current.innerHTML !== html) {
        editorRef.current.innerHTML = html;
      }
      setText(value.join('\n'));
    } else {
      setText(value || '');
      if (editorRef.current && value !== editorRef.current.innerText) {
        editorRef.current.innerText = value || '';
      }
    }
  }, [value]);

  const handleInput = e => {
    // bullet-line이 있으면 배열로, 아니면 문자열
    const editor = editorRef.current;
    if (!editor) return;
    const bullets = Array.from(editor.querySelectorAll('.bullet-line'));
    if (bullets.length) {
      const arr = bullets.map(div => div.textContent);
      setText(arr.join('\n'));
      if (onChange) onChange(arr);
    } else {
      const val = editor.innerText;
      setText(val);
      if (onChange) onChange(val);
    }
  };

  const handleKeyDown = e => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const container = range.startContainer;
    const parent = container.nodeType === Node.ELEMENT_NODE
      ? container
      : container.parentElement;

    // 불릿 생성: - 입력 후 엔터
    if (e.key === 'Enter') {
      if (parent && parent.textContent.trim() === '-' && !parent.classList.contains('bullet-line')) {
        e.preventDefault();
        const bulletLine = document.createElement('div');
        bulletLine.className = 'bullet-line';
        bulletLine.innerHTML = '<br>';
        if (parent === editorRef.current) {
          editorRef.current.innerHTML = '';
          editorRef.current.appendChild(bulletLine);
        } else {
          parent.replaceWith(bulletLine);
        }
        // 커서 이동
        const newRange = document.createRange();
        newRange.selectNodeContents(bulletLine);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
        return;
      }
      // 빈 불릿 자동 해제
      if (parent && parent.classList.contains('bullet-line')) {
        setTimeout(() => {
          const newLine = window.getSelection().anchorNode?.parentElement;
          if (newLine && newLine.textContent.trim() === '') {
            newLine.classList.remove('bullet-line');
            newLine.innerHTML = '<br>';
          }
        }, 0);
      }
    }
    // 불릿 삭제
    if (e.key === 'Backspace') {
      const parentBullet = (container.nodeType === Node.ELEMENT_NODE
        ? container
        : container.parentElement)?.closest('.bullet-line');
      if (
        parentBullet &&
        parentBullet.textContent.replace(/\u200B/g, '').trim().length === 0
      ) {
        e.preventDefault();
        parentBullet.classList.remove('bullet-line');
        parentBullet.innerHTML = '<br>';
        setTimeout(() => {
          const range = document.createRange();
          const sel = window.getSelection();
          if (parentBullet.firstChild) {
            range.setStart(parentBullet, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }, 0);
      }
    }
  };

  return (
    <div className={`editor-wrap${isOver ? ' over' : ''} ${className}`} style={style}>
      <div
        className="editor"
        contentEditable
        ref={editorRef}
        data-placeholder={placeholder}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        suppressContentEditableWarning={true}
        style={{ borderColor: isOver ? 'red' : undefined }}
        {...rest}
      />
      <div className="current-info">
        <p className="warning" style={{ opacity: isOver ? 1 : 0 }}>글자수를 초과했습니다.</p>
        <p className="count">
          <span className="chk-byte">{text.length}</span> / <span className="maximum">{maxLength}</span>
        </p>
      </div>
    </div>
  );
}

export default CustomTextarea;
