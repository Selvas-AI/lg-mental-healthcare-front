import React, { useRef, useState } from "react";

function TranscriptBox({ 
  className = "", 
  title, 
  editable, 
  onEdit, 
  toggleable = false, 
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

  return (
    <div className={`${className} txt-box`}>
      <div className="box-tit">
        <strong>{title}</strong>
        {editable && <a className="edit-btn" onClick={onEdit}>수정</a>}
      </div>
      {toggleable ? (
        <>
          <div
            className={`box-explain${!isBeforeCreate && expanded ? " expanded" : !isBeforeCreate ? " clamped" : ""}`}
            ref={boxExplainRef}
            style={
              !isBeforeCreate
                ? { maxHeight: expanded ? boxExplainRef.current?.scrollHeight : "8.7rem", transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1)" }
                : { minHeight: 'unset', maxHeight: 'unset', overflow: 'unset', transition: 'none' }
            }
          >
            {children}
          </div>
          {!isBeforeCreate && (
            <button
              className={`toggle-btn${expanded ? " rotate" : ""}`}
              type="button"
              aria-label="펼치기/접기"
              onClick={handleToggle}
            ></button>
          )}
        </>
      ) : (
        // box-explain 구조 없이 바로 children만 노출
        children
      )}
    </div>
  );
}

export default TranscriptBox;
