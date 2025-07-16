import React from 'react';

function CheckboxList({ name, options, values = [], onChange, className = '', etcInput, etcValue, onEtcChange }) {
  return (
    <ul className={className}>
      {options.map(opt => (
        <li key={opt.id}>
          <div className="input-wrap checkbox">
            <input
              id={opt.id}
              type="checkbox"
              name={name}
              value={opt.value || opt.id}
              checked={values.includes(opt.value || opt.id)}
              onChange={onChange}
            />
            <label htmlFor={opt.id}>{opt.label}</label>
          </div>
          {/* 기타 항목이면 input-wrap dim 텍스트 입력란 추가 */}
          {opt.id === 'riskFactor09' && (
            <div className="input-wrap dim">
              <input
                type="text"
                placeholder="위험 요인 입력"
                value={etcValue || ''}
                onChange={onEtcChange}
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default CheckboxList;