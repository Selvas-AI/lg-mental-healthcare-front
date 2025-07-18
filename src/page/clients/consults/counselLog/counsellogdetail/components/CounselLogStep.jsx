import React from 'react';

function CounselLogStep({ id, title, children, subTitle, rightButton = false, className = '', tips, info, onAiClick }) {
  // id가 step01, step02 등일 때 content01, content02 클래스 자동 부여
  let stepClass = '';
  if (id && /^step\d+$/.test(id)) {
    const num = id.replace('step', '').padStart(2, '0');
    stepClass = `content${num}`;
  }
  return (
    <div id={id} className={`content-step ${stepClass} ${className}`.trim()}>
      {tips && <div className="tips"><p>{tips}</p></div>}
      <div className={`step-title${subTitle ? ' sub' : ''}${info ? ' type01' : ''}`}>
        <strong className={subTitle ? '' : 'necessary'}>{title}</strong>
        {rightButton && (
          <button className="type01 h36" type="button" onClick={onAiClick}>
            <span>AI 생성하기</span>
          </button>
        )}
        {info && (
          <div className="info">
            <div className="info-icon" aria-label="툴팁 안내 아이콘"></div>
            <div className="tooltip">{info}</div>
          </div>
        )}
      </div>
      <div className="step-conts">{children}</div>
    </div>
  );
}

export default CounselLogStep;
