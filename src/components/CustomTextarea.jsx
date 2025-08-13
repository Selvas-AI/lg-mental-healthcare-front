import React, { useRef, useEffect, useState } from 'react';

// 불릿 라인 식별용 특수 마커 (저장/전송 문자열에서만 사용, 화면에는 표시되지 않음)
const BULLET_MARK = '::BLT:: ';

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
  const fromInputRef = useRef(false);

  useEffect(() => {
    if (fromInputRef.current) {
      fromInputRef.current = false;
      return;
    }
    if (Array.isArray(value)) {
      const str = value.join('\n');
      // 마커 기반 렌더링: 마커가 있는 줄만 불릿 처리
      const html = str.split('\n').map(lineRaw => {
        const line = lineRaw || '';
        const isBullet = line.startsWith(BULLET_MARK);
        const text = isBullet ? line.slice(BULLET_MARK.length) : line;
        const safe = String(text).replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return isBullet ? `<div class=\"bullet-line\">${safe}</div>` : `<div>${safe}</div>`;
      }).join('');
      if (editorRef.current && editorRef.current.innerHTML !== html) {
        editorRef.current.innerHTML = html;
      }
      setText(str);
    } else {
      const str = value || '';
      // 문자열에 줄바꿈이 있으면 불릿 라인으로 렌더, 없으면 일반 텍스트로 렌더
      if (editorRef.current) {
        if (str.includes('\n')) {
          const html = str.split('\n').map(lineRaw => {
            const line = lineRaw || '';
            const isBullet = line.startsWith(BULLET_MARK);
            const text = isBullet ? line.slice(BULLET_MARK.length) : line;
            const safe = String(text).replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return isBullet ? `<div class=\"bullet-line\">${safe}</div>` : `<div>${safe}</div>`;
          }).join('');
          if (editorRef.current.innerHTML !== html) {
            editorRef.current.innerHTML = html;
          }
        } else {
          // 단일 라인 처리: 마커가 있으면 불릿, 없으면 평문
          const isBullet = str.startsWith(BULLET_MARK);
          const text = isBullet ? str.slice(BULLET_MARK.length) : str;
          if (isBullet) {
            const safe = String(text).replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const html = `<div class=\"bullet-line\">${safe}</div>`;
            if (editorRef.current.innerHTML !== html) editorRef.current.innerHTML = html;
          } else if (editorRef.current.innerText !== text) {
            editorRef.current.innerText = text;
          }
        }
      }
      setText(str);
    }
  }, [value]);

  const handleInput = e => {
    const editor = editorRef.current;
    if (!editor) return;
    // DOM → 문자열 직렬화: bullet-line에는 마커를 접두로 붙이고, 일반 라인은 그대로
    const lines = Array.from(editor.children || []);
    if (lines.length) {
      const str = lines.map(div => {
        const text = div.textContent || '';
        return div.classList?.contains('bullet-line') ? `${BULLET_MARK}${text}` : text;
      }).join('\n');
      setText(str);
      fromInputRef.current = true;
      if (onChange) onChange(str);
    } else {
      const val = editor.innerText;
      setText(val);
      fromInputRef.current = true;
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

        // 변경 통지 (문자열로 일원화, 불릿은 마커 접두로 기록)
        const nodes = Array.from(editorRef.current.children || []);
        const strNow = nodes.map(div => div.classList?.contains('bullet-line') ? `${BULLET_MARK}${div.textContent || ''}` : (div.textContent || '')).join('\n');
        fromInputRef.current = true;
        setText(strNow);
        onChange && onChange(strNow);
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
