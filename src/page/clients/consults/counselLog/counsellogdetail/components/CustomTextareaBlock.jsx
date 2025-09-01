import CustomTextarea from '@/components/CustomTextarea';
import React from 'react';

function CustomTextareaBlock({ placeholder, value, onChange, className = '', rightButton }) {
  return (
    <div className="write-wrap">
      <CustomTextarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={className} />
      {rightButton}
    </div>
  );
}

export default CustomTextareaBlock;
