import React, { useState, useRef, useEffect } from 'react';

/**
 * 공용 커스텀 셀렉트 컴포넌트
 * @param {Array} options - 선택 옵션 배열
 * @param {*} value - 현재 선택된 값
 * @param {Function} onChange - 선택 변경 콜백 함수
 * @param {string} placeholder - 플레이스홀더 텍스트
 * @param {boolean} disabled - 비활성화 상태
 * @param {string} className - 추가 CSS 클래스
 * @param {string} type - select-wrap 타입 (type01, type02 등)
 * @param {Function} renderSelected - 선택된 값 렌더링 함수 (option) => JSX
 * @param {Function} renderOption - 옵션 렌더링 함수 (option, index) => JSX
 * @param {number} maxHeight - 옵션 리스트 최대 높이 (기본값: 200)
 * @param {Function} getOptionValue - 옵션에서 값을 추출하는 함수 (기본값: option => option)
 * @param {Function} getOptionLabel - 옵션에서 라벨을 추출하는 함수 (기본값: option => option)
 */
const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "선택하세요",
  disabled = false,
  className = "",
  type = "",
  renderSelected,
  renderOption,
  maxHeight = 200,
  getOptionValue = (option) => option,
  getOptionLabel = (option) => option,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 드롭다운 토글
  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // 옵션 선택
  const handleOptionSelect = (option) => {
    const optionValue = getOptionValue(option);
    onChange(optionValue);
    setIsOpen(false);
  };

  // 선택된 값 찾기
  const selectedOption = options.find(option => getOptionValue(option) === value);

  // 선택된 값 렌더링
  const renderSelectedContent = () => {
    if (renderSelected && selectedOption) {
      return renderSelected(selectedOption);
    }
    if (selectedOption) {
      return getOptionLabel(selectedOption);
    }
    return placeholder;
  };

  // 옵션 리스트 렌더링
  const renderOptionContent = (option, index) => {
    if (renderOption) {
      return renderOption(option, index);
    }
    return getOptionLabel(option);
  };

  return (
    <div 
      className={`select-wrap ${type} ${disabled ? 'disabled' : ''} ${className}`}
      ref={selectRef}
    >
      <div className="select-box">
        <button 
          className={`select-item${isOpen ? " on" : ""}`} 
          onClick={handleToggle}
          disabled={disabled}
        >
          {renderSelectedContent()}
        </button>
        <ul 
          className="option-list" 
          style={{ 
            maxHeight: isOpen ? Math.min(options.length * 40, maxHeight) : 0,
            // overflow: 'hidden',
            transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1)',
            display: 'block'
          }}
        >
          {options.map((option, index) => (
            <li 
              key={index}
            >
              <a className="cursor-pointer" onClick={() => handleOptionSelect(option)}>{renderOptionContent(option, index)}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CustomSelect;
