import React, { useState } from 'react';

function SurveySendModal({ onClose, modalOpen }) {
  // step: 1 또는 2
  const [step, setStep] = useState(1);
  // 회기 목록 배열 선언
  const sessionList = [
    { id: 'session05', label: '5회기', complete: false },
    { id: 'session04', label: '4회기', complete: false },
    { id: 'session03', label: '3회기', complete: false },
    { id: 'session02', label: '2회기', complete: true },
    { id: 'session01', label: '1회기', complete: true },
    { id: 'beforeSession', label: '사전문진', complete: true },
  ];
  // step01: 회기 선택
  const [selectedSession, setSelectedSession] = useState('');
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

  // step01: 회기 라디오 선택
  const handleSessionChange = (e) => {
    setSelectedSession(e.target.id);
  };

  // step01: 다음 버튼
  const handleNext = () => {
    setStep(2);
  };

  // step02: 취소 버튼
  const handleCancel = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setSelectedSession('');
      setExtraChecked({});
    }, 300); // 애니메이션 고려(있다면)
  };

  // step02: 전송 버튼
  const handleSend = () => {
    console.log('전송하기');
    onClose();
  };

  return (
    <div className={`modal survey-send ${modalOpen ? 'on' : ''}`}>
      <div className="modal-dim fixed top-0 left-0 w-full h-full z-[999]" onClick={handleCancel}></div>
      <div className="inner z-[1000]">
        <div className="modal-hd">
          <strong>심리 검사지 전송</strong>
          <button className="close-btn" type="button" aria-label="닫기" onClick={handleCancel}></button>
        </div>
        {/* step01: 회기 선택 */}
        {step === 1 && (
          <div className="step01">
            <div className="inner">
              <div className="tit-wrap">
                <strong>전송할 회기를 선택해 주세요.</strong>
              </div>
              <div className="item-wrap">
                <ul>
                  {sessionList.map(session => (
                    <li
                      key={session.id}
                      onClick={() => setSelectedSession(session.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="input-wrap radio">
                        <input
                          id={session.id}
                          type="radio"
                          name="session"
                          checked={selectedSession === session.id}
                          onChange={handleSessionChange}
                          onClick={e => e.stopPropagation()}
                        />
                        <label htmlFor={session.id} onClick={e => e.stopPropagation()}>{session.label}</label>
                      </div>
                      {session.complete && <span className="complete">상담완료</span>}
                    </li>
                  ))}
                </ul>
              </div>
              <button className="next-btn type10" type="button" onClick={handleNext} disabled={!selectedSession}>다음</button>
            </div>
          </div>
        )}
        {/* step02: 검사지 선택 */}
        {step === 2 && (
          <div className="step02" style={{ display: step === 2 ? 'block' : 'none' }}>
            <div className="inner">
              <div className="tit-wrap">
                <strong>내담자에게 전송할 검사지를 선택해 주세요.</strong>
              </div>
              <div className="item-wrap">
                <div className="sub-tit">
                  <strong>필수 기본 검사지</strong>
                </div>
                <ul>
                  {necessaryList.map(item => (
                    <li key={item.id} style={{cursor:'pointer'}} onClick={handleNecessaryClick}>
                      <div className="input-wrap checkbox">
                        <input id={item.id} type="checkbox" name="necessary" checked readOnly onClick={e => {handleNecessaryClick(e); e.stopPropagation();}} />
                        <label htmlFor={item.id} onClick={e => e.stopPropagation()}>{item.label}</label>
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
                    <li key={item.id} style={{cursor:'pointer'}} onClick={() => setExtraChecked(prev => ({...prev, [item.id]: !prev[item.id]}))}>
                      <div className="input-wrap checkbox">
                        <input id={item.id} type="checkbox" name="extra" checked={!!extraChecked[item.id]} onChange={handleExtraChange} onClick={e => e.stopPropagation()} />
                        <label htmlFor={item.id} onClick={e => e.stopPropagation()}>{item.label}</label>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="btn-wrap">
                <button className="cancel-btn type08" type="button" onClick={handleCancel}>취소</button>
                <button className="type08 black" type="button" onClick={handleSend}>전송하기</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SurveySendModal;
