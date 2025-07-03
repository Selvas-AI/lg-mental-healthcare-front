import React, { useState, useRef, useEffect } from "react";

function SessionSelect({ options = [], onSelect }) {
  // 현재 선택된 회기 찾기
  const initialIndex =
    options.findIndex((opt) => opt.selected) >= 0
      ? options.findIndex((opt) => opt.selected)
      : 0;
  const [selectedIdx, setSelectedIdx] = useState(initialIndex);
  const [open, setOpen] = useState(false);
  const selectBoxRef = useRef(null);
  const optionListRef = useRef(null);
  const [listHeight, setListHeight] = useState(0);

  useEffect(() => {
    if (open && optionListRef.current) {
      setListHeight(optionListRef.current.scrollHeight);
    } else {
      setListHeight(0);
    }
  }, [open, options.length]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e) {
      if (selectBoxRef.current && !selectBoxRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = (idx) => {
    setSelectedIdx(idx);
    setOpen(false);
    if (onSelect) onSelect(options[idx], idx);
  };

  const selectedOption = options[selectedIdx] || options[0];
  const isType01 = true; // type01 고정, 필요시 props로 분기

  return (
    <div className={`select-wrap type01`}>
      <div className="select-box" ref={selectBoxRef}>
        <button
          className={`select-item${open ? " on" : ""}${
            !isType01 && selectedIdx !== -1 ? " selected-custom" : ""
          }`}
          type="button"
          onClick={() => setOpen(!open)}
        >
          <span>{selectedOption.session}</span>
          <span>{selectedOption.date}</span>
        </button>
        <ul
          className="option-list"
          ref={optionListRef}
          style={{
            maxHeight: open ? Math.min(listHeight, 200) : 0,
            overflow: 'auto',
            transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)',
            pointerEvents: open ? 'auto' : 'none',
            display: 'block',
          }}
        >
          {options.map((opt, idx) => (
            <li
              key={opt.session + opt.date}
              className={selectedIdx === idx ? "on" : ""}
            >
              <a
                onClick={(e) => {
                  e.preventDefault();
                  handleSelect(idx);
                }}
              >
                <span>{opt.session}</span>
                <span>{opt.date}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SessionSelect;
