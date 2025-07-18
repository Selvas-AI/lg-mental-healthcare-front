import React, { useState, useRef } from 'react';

function SymptomTable({ symptoms = [], values, onChange }) {
  const SCORE_LABELS = [
    { label: '증상 없음', score: 0 },
    { label: '낮음', score: 1 },
    { label: '약간 낮음', score: 2 },
    { label: '보통', score: 3 },
    { label: '약간 높음', score: 4 },
    { label: '매우 높음', score: 5 },
  ];

  // 커스텀 증상 상태 관리
  const [customSymptoms, setCustomSymptoms] = useState([]);
  const inputRefs = useRef({});

  // 커스텀 증상 추가
  const handleAddCustomSymptom = () => {
    const id = Date.now() + Math.random().toString(36).slice(2, 6);
    setCustomSymptoms(prev => [
      ...prev,
      { id, name: '', editing: true, error: false, score: undefined }
    ]);
    setTimeout(() => {
      if (inputRefs.current[id]) inputRefs.current[id].focus();
    }, 0);
  };

  // 커스텀 증상 입력 변경
  const handleCustomInputChange = (id, value) => {
    setCustomSymptoms(prev => prev.map(s =>
      s.id === id ? { ...s, name: value, error: value.length > 5 } : s
    ));
  };

  // 커스텀 증상 blur/입력 완료
  const handleCustomInputBlur = (id) => {
    setCustomSymptoms(prev => prev.map(s => {
      if (s.id !== id) return s;
      const val = s.name.trim();
      if (val && val.length <= 5) {
        return { ...s, name: val, editing: false, error: false };
      }
      return { ...s, error: val.length > 5 };
    }));
  };

  // 엔터키 입력 시 blur
  const handleCustomInputKeyDown = (id, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputRefs.current[id]) inputRefs.current[id].blur();
    }
  };

  // 텍스트 클릭 시 다시 인풋 전환
  const handleEditCustomSymptom = (id) => {
    setCustomSymptoms(prev => prev.map(s =>
      s.id === id ? { ...s, editing: true } : s
    ));
    setTimeout(() => {
      if (inputRefs.current[id]) {
        inputRefs.current[id].focus();
        const val = inputRefs.current[id].value;
        inputRefs.current[id].setSelectionRange(val.length, val.length);
      }
    }, 0);
  };

  // 삭제 버튼 클릭
  const handleRemoveCustomSymptom = (id) => {
    setCustomSymptoms(prev => prev.filter(s => s.id !== id));
  };

  // 커스텀 증상 점수 선택
  const handleCustomScoreChange = (id, score) => {
    setCustomSymptoms(prev => prev.map(s =>
      s.id === id ? { ...s, score } : s
    ));
  };

  return (
    <>
      <div className="tb-wrap">
        <table>
          <caption>현재 증상의 심각도</caption>
          <thead>
            <tr>
              <th>증상</th>
              {SCORE_LABELS.map((item, idx) => (
                <th key={idx}>
                  {item.label}<br />({item.score}점)
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {symptoms.map(symptom => (
              <tr key={symptom.field}>
                <th>{symptom.name}</th>
                {SCORE_LABELS.map((item, idx) => (
                  <td key={idx}>
                    <div className="input-wrap radio">
                      <input
                        id={`${symptom.field}${item.score}`}
                        type="radio"
                        name={symptom.field}
                        value={item.score}
                        checked={values[symptom.field] == item.score}
                        onChange={() => onChange(symptom.field, item.score)} />
                      <label htmlFor={`${symptom.field}${item.score}`}></label>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
            {/* 커스텀 증상 행 */}
            {customSymptoms.map((symptom, idx) => (
              <tr className="custom-symptom" key={symptom.id}>
                <th className="new-th">
                  {symptom.editing ? (
                    <div className="symptom-input-wrap">
                      <input
                        ref={el => inputRefs.current[symptom.id] = el}
                        type="text"
                        className={`symptom-input${symptom.error ? ' error' : ''}`}
                        maxLength={5}
                        placeholder="증상명"
                        value={symptom.name}
                        onChange={e => handleCustomInputChange(symptom.id, e.target.value)}
                        onBlur={() => handleCustomInputBlur(symptom.id)}
                        onKeyDown={e => handleCustomInputKeyDown(symptom.id, e)}
                        style={{ fontWeight: '400' }}
                      />
                      <p className="error-txt" style={{ display: symptom.error ? 'block' : 'none' }}>최대 5글자 입력 가능</p>
                    </div>
                  ) : (
                    <div className="input-completed">
                      <button className="remove-symptom" type="button" aria-label="행 삭제" onClick={() => handleRemoveCustomSymptom(symptom.id)}></button>
                      <span className="editable-text" onClick={() => handleEditCustomSymptom(symptom.id)}>{symptom.name}</span>
                    </div>
                  )}
                </th>
                {SCORE_LABELS.map((item, sidx) => (
                  <td key={sidx}>
                    <div className="input-wrap radio">
                      <input
                        id={`custom-${symptom.id}-${item.score}`}
                        type="radio"
                        name={`custom-${symptom.id}`}
                        value={item.score}
                        checked={symptom.score == item.score}
                        onChange={() => handleCustomScoreChange(symptom.id, item.score)}
                        // disabled={symptom.editing}
                      />
                      <label htmlFor={`custom-${symptom.id}-${item.score}`}></label>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="signs-add-btn" type="button" onClick={handleAddCustomSymptom}>
        <span>증상 추가</span>
      </button>
    </>
  );
}

export default SymptomTable;