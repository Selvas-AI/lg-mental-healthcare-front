import React from 'react';

function RadioList({ name, options, value, onChange, className = '' }) {
  return (
    <ul className={className}>
      {options.map(opt => (
        <li key={opt.id}>
          <div className="input-wrap radio">
            <input
              id={opt.id}
              type="radio"
              name={name}
              value={opt.value || opt.id}
              checked={value === (opt.value || opt.id)}
              onChange={onChange} />
            <label htmlFor={opt.id}>{opt.label}</label>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default RadioList;
