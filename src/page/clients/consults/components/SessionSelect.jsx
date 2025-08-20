import React, { useState, useRef, useEffect } from "react";
import CustomSelect from '@/components/CustomSelect';

function SessionSelect({ options = [], onSelect, onEdit }) {
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

  // 날짜 포맷 변환 함수 (2025-05-10 14:00:00 -> 2025.05.10 (토) 오후 2시)
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
      const weekday = weekdays[date.getDay()];
      const hour = date.getHours();
      const minute = String(date.getMinutes()).padStart(2, '0');
      const period = hour >= 12 ? '오후' : '오전';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      
      return `${year}.${month}.${day}(${weekday}) ${period} ${displayHour}시${minute !== '00' ? ` ${minute}분` : ''}`;
    } catch (e) {
      return dateStr;
    }
  };

  const selectedOption = options[selectedIdx] || options[0];
  
  // 가장 최신 회기인지 확인 (sessionNo가 가장 높은 회기)
  const isLatestSession = () => {
    if (!selectedOption || !options.length) return false;
    const maxSessionNo = Math.max(...options.map(opt => opt.sessionNo));
    return selectedOption.sessionNo === maxSessionNo;
  };

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
      <span className="datetime-info">{formatDate(selectedOption?.sessionDate)}</span>
      {isLatestSession() && (
        <a className="edit-btn cursor-pointer" onClick={() => onEdit && onEdit(selectedOption)}>수정</a>
      )}
    </div>
  );
}

export default SessionSelect;
