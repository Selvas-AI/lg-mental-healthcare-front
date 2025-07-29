import React, { useState, useRef, useEffect } from "react";
import CustomSelect from '@/components/CustomSelect';

function SessionSelect({ options = [], onSelect }) {
  // 현재 선택된 회기 찾기
  const initialIndex =
    options.findIndex((opt) => opt.selected) >= 0
      ? options.findIndex((opt) => opt.selected)
      : 0;
  const [selectedIdx, setSelectedIdx] = useState(initialIndex);

  const handleSelect = (idx) => {
    setSelectedIdx(idx);
    if (onSelect) onSelect(options[idx], idx);
  };

  const selectedOption = options[selectedIdx] || options[0];

  return (
    <div className="top-info">
      <CustomSelect
        options={options}
        value={selectedOption}
        onChange={(option) => {
          const idx = options.findIndex(opt => opt === option);
          handleSelect(idx);
        }}
        type="type01"
        getOptionValue={(option) => option}
        getOptionLabel={(option) => option}
        renderSelected={(option) => (
          <>
            <span>{option.session}</span>
            <span>{option.date}</span>
          </>
        )}
        renderOption={(option) => (
          <>
            <span>{option.session}</span>
            <span>{option.date}</span>
          </>
        )}
      />
      <span className="datetime-info">2025.04.19(토) 오전 10시</span>
      <a className="edit-btn cursor-pointer" >수정</a>
    </div>
  );
}

export default SessionSelect;
