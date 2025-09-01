import React, { useRef, useState } from "react";

function TranscriptBox({ 
  className = "", 
  title, 
  editable, 
  onEdit, 
  toggleable = false, 
  onAIGenerate,
  children 
  }) {
  // before-create 클래스가 있으면 토글/애니메이션 비활성화
  const isBeforeCreate = className.includes("before-create");
  const [expanded, setExpanded] = useState(false);
  const boxExplainRef = useRef();

  // 8.7rem을 px로 계산하는 유틸
  const CLAMP_REM = 8.7;
  const getClampPx = () => {
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize || '16');
    return CLAMP_REM * rootFontSize;
  };

  // before-create면 토글/애니메이션 동작 자체를 막음
  const handleToggle = () => {
    if (isBeforeCreate) return;

    const box = boxExplainRef.current;
    if (!box) return;
    // 공통 스타일
    box.style.overflow = 'hidden';
    box.style.transition = "max-height 0.3s cubic-bezier(0.4,0,0.2,1)";

    if (expanded) {
      // 접기: none -> 현재 높이로 설정 후 다음 프레임에 clamp로 축소
      const current = box.scrollHeight;
      box.style.maxHeight = current + 'px';
      // reflow 강제
      // eslint-disable-next-line no-unused-expressions
      box.offsetHeight;
      requestAnimationFrame(() => {
        box.style.maxHeight = getClampPx() + 'px';
      });
      const onEnd = (e) => {
        if (e.propertyName === 'max-height') {
          box.removeEventListener('transitionend', onEnd);
          setExpanded(false);
        }
      };
      box.addEventListener('transitionend', onEnd);
    } else {
      // 펼치기: clamp -> scrollHeight로 확장, 끝나면 none으로 해제
      const start = getClampPx();
      box.style.maxHeight = start + 'px';
      requestAnimationFrame(() => {
        box.style.maxHeight = box.scrollHeight + 'px';
      });
      const onEnd = (e) => {
        if (e.propertyName === 'max-height') {
          box.style.maxHeight = 'none';
          box.removeEventListener('transitionend', onEnd);
        }
      };
      box.addEventListener('transitionend', onEnd);
      setExpanded(true);
    }
  };

  // box-explain 컨텐츠 높이 측정 및 토글버튼 표시 여부 판단
  const [showToggle, setShowToggle] = useState(false);
  React.useEffect(() => {
    const box = boxExplainRef.current;
    if (!box) return;
    // 초기 상태: clamp 높이 고정 + 숨김 스크롤 + 트랜지션 준비
    box.style.maxHeight = getClampPx() + 'px';
    box.style.overflow = 'hidden';
    box.style.transition = "max-height 0.3s cubic-bezier(0.4,0,0.2,1)";

    if (toggleable) {
      setShowToggle(box.scrollHeight > getClampPx());
    }
  }, [children, toggleable]);

  return (
    <div className={`${className} txt-box`}>
      <div className="box-tit">
        <strong>{title}</strong>
        {editable && <a className="edit-btn cursor-pointer" onClick={onEdit}>수정</a>}
      </div>
      {isBeforeCreate ? (
        <div className="create-wrap">
          <p>
            [AI 생성하기]를 선택하면<br />
            AI가 생성한 분석 자료를 확인 할 수 있어요!
          </p>
          <button className="type01 h40" type="button" onClick={() => { onAIGenerate && onAIGenerate(); }}>
            <span>AI 생성하기</span>
          </button>
        </div>
      ) : toggleable ? (
        <>
          <div
            className={`box-explain${expanded ? " expanded" : " clamped"}`}
            ref={boxExplainRef}
          >
            {children}
          </div>
          {showToggle && (
            <button
              className={`toggle-btn${expanded ? " rotate" : ""}`}
              type="button"
              aria-label="펼치기/접기"
              onClick={handleToggle}
            ></button>
          )}
        </>
      ) : (
        children
      )}
    </div>
  );
}

export default TranscriptBox;
