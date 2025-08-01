import React, { useState } from 'react';
import CustomSelect from '@/components/CustomSelect';

function SurveySendModal({ onClose, modalOpen }) {
  // step: 1, 2, 3
  const [step, setStep] = useState(1);
  
  // step01: 문진 종류 선택
  const [selectedSurveyType, setSelectedSurveyType] = useState('');
  const [selectedSession, setSelectedSession] = useState('3회기');
  
  // 회기 목록 (경과 문진용)
  const sessionOptions = [
    { value: '4회기', label: '4회기', disabled: false },
    { value: '3회기', label: '3회기', disabled: false },
    { value: '2회기', label: '2회기', disabled: true, complete: true },
    { value: '1회기', label: '1회기', disabled: true, complete: true },
  ];
  
  // step02: 필수 체크박스(항상 true, 해제 불가)
  const necessaryList = [
    { id: 'necessaryChk01', label: 'PHQ-9(우울장애)' },
    { id: 'necessaryChk02', label: 'GAD-7(범불안장애)' },
    { id: 'necessaryChk03', label: 'K-PSS 10(스트레스)' },
    { id: 'necessaryChk04', label: 'AUDIT(알코올 사용장애)' },
  ];
  
  // step02: 추가 체크박스
  const extraList = [
    { id: 'extraChk01', label: 'PCL-5 PTSD(외상 후 스트레스 장애)' },
    { id: 'extraChk02', label: 'PDSS(공황장애)' },
    { id: 'extraChk03', label: 'ASRS- ADHD (주의력결핍 과잉행동장애)' },
    { id: 'extraChk04', label: 'Y-BOCS (강박장애)' },
    { id: 'extraChk05', label: 'DSI-SS (자살사고)' },
    { id: 'extraChk06', label: 'ISI (불면증)' },
  ];
  const [extraChecked, setExtraChecked] = useState({});
  
  // step03: 생성된 URL 및 정보
  const [generatedUrl] = useState('https://abcd.com/counsel/%sdf%sdfsg%dfgas%sdf%sdfsg%dfgas%sdf%sdfsg%dfgas%sdf%sdfsg%dfgas');
  const [expirationTime] = useState('24');
  
  // step01: 문진 종류 선택
  const handleSurveyTypeChange = (e) => {
    setSelectedSurveyType(e.target.id);
  };
  

  
  // step02: 필수 체크박스 해제 방지
  const handleNecessaryClick = (e) => {
    if (!e.target.checked) {
      e.preventDefault();
    }
  };
  
  // step02: 추가 체크박스
  const handleExtraChange = (e) => {
    setExtraChecked({ ...extraChecked, [e.target.id]: e.target.checked });
  };
  
  // step01: 다음 버튼
  const handleStep1Next = () => {
    if (selectedSurveyType) {
      setStep(2);
    }
  };
  
  // step02: 이전 버튼
  const handleStep2Prev = () => {
    setStep(1);
  };
  
  // step02: 다음 버튼
  const handleStep2Next = () => {
    setStep(3);
  };
  
  // URL 복사
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(generatedUrl).then(() => {
      alert('URL이 복사되었습니다.');
    });
  };
  
  // 모달 닫기 및 초기화
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setSelectedSurveyType('');
      setSelectedSession('3회기');
      setExtraChecked({});
    }, 300);
  };
  
  // 완료 버튼
  const handleComplete = () => {
    console.log('심리 검사지 생성 완료');
    handleClose();
  };
  
  // 선택된 검사지 목록 생성
  const getSelectedTests = () => {
    const selected = [...necessaryList];
    extraList.forEach(item => {
      if (extraChecked[item.id]) {
        selected.push(item);
      }
    });
    return selected;
  };
  
  // 문진 종류 텍스트 반환
  const getSurveyTypeText = () => {
    switch (selectedSurveyType) {
      case 'session05': return '사전 문진';
      case 'session04': return `경과 문진, ${selectedSession}`;
      case 'session03': return '사후 문진';
      default: return '';
    }
  };

  return (
    <div className={`modal survey-create ${modalOpen ? 'on' : ''}`}>
      <div className="modal-dim fixed top-0 left-0 w-full h-full z-[999]" onClick={handleClose}></div>
      <div className="inner z-[1000]">
        <div className="modal-hd">
          <strong>심리 검사지 생성</strong>
          <button className="close-btn" type="button" aria-label="닫기" onClick={handleClose}></button>
        </div>
        
        {/* step01: 문진 종류 선택 */}
        {step === 1 && (
          <div className="step01">
            <div className="inner">
              <div className="tit-wrap">
                <strong>생성할 문진 종류를 선택해 주세요.</strong>
              </div>
              <div className="item-wrap">
                <ul>
                  <li>
                    <div className="input-wrap radio">
                      <input 
                        id="session05" 
                        type="radio" 
                        name="session" 
                        disabled
                        checked={selectedSurveyType === 'session05'}
                        onChange={handleSurveyTypeChange}
                      />
                      <label htmlFor="session05">
                        <span>사전 문진</span>
                        <span className="complete">문진 완료</span>
                      </label>
                    </div>
                  </li>
                  <li className="flex-wrap">
                    <div className="input-wrap radio">
                      <input 
                        id="session04" 
                        type="radio" 
                        name="session"
                        checked={selectedSurveyType === 'session04'}
                        onChange={handleSurveyTypeChange}
                      />
                      <label htmlFor="session04">
                        <span>경과 문진</span>
                      </label>
                    </div>
                    <CustomSelect
                      options={sessionOptions}
                      value={selectedSession}
                      onChange={setSelectedSession}
                      disabled={selectedSurveyType !== 'session04'}
                      className={selectedSurveyType !== 'session04' ? 'disabled' : ''}
                      getOptionValue={(option) => option.value}
                      getOptionLabel={(option) => option.label}
                      renderOption={(option) => (
                        option.complete ? (
                          <>
                            <span>{option.label}</span>
                            <span className="complete">문진 완료</span>
                          </>
                        ) : (
                          option.label
                        )
                      )}
                    />
                  </li>
                  <li>
                    <div className="input-wrap radio">
                      <input 
                        id="session03" 
                        type="radio" 
                        name="session"
                        checked={selectedSurveyType === 'session03'}
                        onChange={handleSurveyTypeChange}
                      />
                      <label htmlFor="session03">
                        <span>사후 문진</span>
                      </label>
                    </div>
                  </li>
                </ul>
              </div>
              <button 
                className="next-btn type10" 
                type="button" 
                onClick={handleStep1Next}
                disabled={!selectedSurveyType}
              >
                다음
              </button>
            </div>
          </div>
        )}
        
        {/* step02: 검사지 선택 */}
        {step === 2 && (
          <div className="step02" style={{ display: step === 2 ? 'block' : 'none' }}>
            <div className="inner">
              <div className="tit-wrap">
                <strong>내담자에게 요청할 검사지를 선택해 주세요.</strong>
              </div>
              <div className="item-wrap">
                <div className="sub-tit">
                  <strong>필수 기본 검사지</strong>
                </div>
                <ul>
                  {necessaryList.map(item => (
                    <li key={item.id}>
                      <div className="input-wrap checkbox">
                        <input 
                          id={item.id} 
                          type="checkbox" 
                          name="necessary" 
                          checked 
                          readOnly
                          onClick={handleNecessaryClick}
                        />
                        <label htmlFor={item.id}>{item.label}</label>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="item-wrap">
                <div className="sub-tit">
                  <strong>추가 검사지</strong>
                </div>
                <ul>
                  {extraList.map(item => (
                    <li key={item.id}>
                      <div className="input-wrap checkbox">
                        <input 
                          id={item.id} 
                          type="checkbox" 
                          name="extra"
                          checked={!!extraChecked[item.id]}
                          onChange={handleExtraChange}
                        />
                        <label htmlFor={item.id}>{item.label}</label>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="btn-wrap">
                <button className="prev-btn type08" type="button" onClick={handleStep2Prev}>이전</button>
                <button className="next-btn type08 black" type="button" onClick={handleStep2Next}>다음</button>
              </div>
            </div>
          </div>
        )}
        
        {/* step03: 생성 완료 및 정보 */}
        {step === 3 && (
          <div className="step03" style={{ display: step === 3 ? 'block' : 'none' }}>
            <div className="inner">
              <div className="tit-wrap">
                <strong>생성한 심리 검사지는 <span>{expirationTime}</span>시간 뒤에 만료됩니다.</strong>
              </div>
              <div className="url-wrap">
                <input 
                  className="url-box" 
                  name="url-input" 
                  type="text" 
                  readOnly 
                  value={generatedUrl}
                />
                <button 
                  className="copy-btn" 
                  type="button" 
                  aria-label="URL 복사"
                  onClick={handleCopyUrl}
                ></button>
              </div>
              <div className="survey-info">
                <strong className="info-tit">생성된 심리 검사지 정보</strong>
                <ul className="detail-info">
                  <li>
                    <div className="list-tit">내담자 이름</div>
                    <div className="list-cont">김마음(알렉스), 1995.04.23</div>
                  </li>
                  <li>
                    <div className="list-tit">문진 종류</div>
                    <div className="list-cont">{getSurveyTypeText()}</div>
                  </li>
                  <li>
                    <div className="list-tit">검사지 종류</div>
                    <div className="list-cont">
                      <ul className="detail-item">
                        {getSelectedTests().map((test, index) => {
                          const isNecessary = necessaryList.some(item => item.id === test.id);
                          return (
                            <li key={test.id} className={isNecessary ? 'necessary' : ''}>
                              {isNecessary && '*'}{test.label.replace(/\([^)]*\)/g, '').trim()} ({test.label.match(/\(([^)]+)\)/)?.[1] || ''})
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
              <button className="complete-btn type10" type="button" onClick={handleComplete}>완료</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SurveySendModal;
