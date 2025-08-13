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

  // before-create면 토글/애니메이션 동작 자체를 막음
  const handleToggle = () => {
    if (isBeforeCreate) return;

    const box = boxExplainRef.current;
    if (!box) return;
    if (expanded) {
      // 접기: 현재 높이에서 8.7rem로 부드럽게 축소
      box.style.maxHeight = box.scrollHeight + "px";
      requestAnimationFrame(() => {
        box.style.transition = "max-height 0.3s cubic-bezier(0.4,0,0.2,1)";
        box.style.maxHeight = "8.7rem";
      });
      setTimeout(() => {
        setExpanded(false);
      }, 300);
    } else {
      // 펼치기: 8.7rem에서 scrollHeight로 부드럽게 확장
      box.style.transition = "max-height 0.3s cubic-bezier(0.4,0,0.2,1)";
      box.style.maxHeight = box.scrollHeight + "px";
      setExpanded(true);
    }
  };

  // box-explain 컨텐츠 높이 측정 및 토글버튼 표시 여부 판단
  const [showToggle, setShowToggle] = useState(false);
  React.useEffect(() => {
    if (toggleable && boxExplainRef.current) {
      // 8.7rem = 139.2px
      setShowToggle(boxExplainRef.current.scrollHeight > 87);
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
          <button className="type01 h40" type="button" onClick={onAIGenerate}>
            <span>AI 생성하기</span>
          </button>
        </div>
      ) : toggleable ? (
        <>
          <div
            className={`box-explain${expanded ? " expanded" : " clamped"}`}
            ref={boxExplainRef}
            style={{ maxHeight: expanded ? boxExplainRef.current?.scrollHeight : "8.7rem", transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1)" }}
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
