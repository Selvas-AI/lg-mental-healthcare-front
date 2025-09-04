import React, { useEffect, useMemo, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import CustomSelect from '@/components/CustomSelect';
import { assessmentSetCreate, assessmentSetUpdateUrl, assessmentSetList, sessionList } from '@/api/apiCaller';
import EditorConfirm from '@/page/clients/components/EditorConfirm';

function SurveySendModal({ onClose, modalOpen, sessiongroupSeq, nameToSeqMap = {}, clientId, sessionSeq, onCompleted, showToastMessage, clientProfile }) {
  // step: 1, 2, 3
  const [step, setStep] = useState(1);
  
  // step01: 문진 종류 선택
  const [selectedSurveyType, setSelectedSurveyType] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [sessionNosInGroup, setSessionNosInGroup] = useState([]); // number[] 실제 회기 그룹의 회기 번호 목록
  const [sessionNoToSeq, setSessionNoToSeq] = useState({}); // { [sessionNo:number]: sessionSeq:number }
  
  // 완료 여부 상태 (실데이터 기반)
  const [isPreCompleted, setIsPreCompleted] = useState(false);
  const [isPostCompleted, setIsPostCompleted] = useState(false);
  const [completedProgSessions, setCompletedProgSessions] = useState([]); // number[]

  // 이름/생년월일(만 나이) 계산 - 마스킹 없음
  function formatBirthDate(birthDate) {
    if (!birthDate || birthDate.length !== 8) return '';
    const y = birthDate.slice(0, 4);
    const m = birthDate.slice(4, 6);
    const d = birthDate.slice(6, 8);
    return `${y}.${m}.${d}`;
  }
  function getKoreanAge(birthStr) {
    if (!birthStr || birthStr.length !== 8) return '';
    const y = birthStr.slice(0, 4);
    const m = birthStr.slice(4, 6);
    const d = birthStr.slice(6, 8);
    const birthDate = new Date(`${y}-${m}-${d}`);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const mDiff = today.getMonth() - birthDate.getMonth();
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  }
  const clientNameText = clientProfile?.clientName || '';
  const clientBirthText = (() => {
    if (!clientProfile?.birthDate) return '';
    const formatted = formatBirthDate(clientProfile.birthDate);
    const ageText = ` (만 ${getKoreanAge(clientProfile.birthDate)}세)`;
    return `${formatted}${ageText}`;
  })();

  // 회기 목록 (경과 문진용) - 동일 회기그룹의 실제 회기 번호 기반으로 옵션 생성
  const sessionOptions = useMemo(() => {
    const makeOption = (n) => {
      const seq = sessionNoToSeq?.[n];
      return {
        value: `${n}회기`,
        label: `${n}회기`,
        disabled: seq != null ? completedProgSessions.includes(seq) : false,
        // 완료 여부는 sessionSeq 기준으로 판단
        complete: seq != null ? completedProgSessions.includes(seq) : false,
      };
    };
    return sessionNosInGroup.map(makeOption);
  }, [completedProgSessions, sessionNosInGroup, sessionNoToSeq]);
  
  // step02: 필수 체크박스(항상 true, 해제 불가)
  const necessaryList = [
    { id: 'necessaryChk01', label: 'PHQ-9(우울장애)', assessmentName: 'PHQ-9' },
    { id: 'necessaryChk02', label: 'GAD-7(범불안장애)', assessmentName: 'GAD-7' },
    { id: 'necessaryChk03', label: 'K-PSS 10(스트레스)', assessmentName: 'K-PSS-10' },
    { id: 'necessaryChk04', label: 'AUDIT(알코올 사용장애)', assessmentName: 'AUDIT' },
  ];
  
  // step02: 추가 체크박스
  const extraList = [
    { id: 'extraChk01', label: 'PCL-5 PTSD(외상 후 스트레스 장애)', assessmentName: 'PCL-5 PTSD' },
    { id: 'extraChk02', label: 'PDSS(공황장애)', assessmentName: 'PDSS-SR' },
    { id: 'extraChk03', label: 'ASRS- ADHD (주의력결핍 과잉행동장애)', assessmentName: 'ASRS-ADHD' },
    { id: 'extraChk04', label: 'Y-BOCS (강박장애)', assessmentName: 'Y-BOCS' },
    { id: 'extraChk05', label: 'DSI-SS (자살사고)', assessmentName: 'DSI-SS' },
    { id: 'extraChk06', label: 'ISI (불면증)', assessmentName: 'ISI' },
  ];
  const [extraChecked, setExtraChecked] = useState({});
  
  // step03: 생성된 URL 및 정보
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [expirationTime] = useState('24');
  // 공통 확인 모달 (EditorConfirm)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('알림');
  const [confirmMessage, setConfirmMessage] = useState('');
  
  // 동일 회기그룹의 실제 회기 번호 로드
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        if (!modalOpen || !clientId || !sessiongroupSeq) return;
        const res = await sessionList(parseInt(clientId, 10));
        const arr = Array.isArray(res?.data) ? res.data : [];
        const sameGroup = arr.filter(it => String(it?.sessiongroupSeq) === String(sessiongroupSeq));
        const nos = sameGroup
          .map(it => Number(it?.sessionNo))
          .filter(n => Number.isFinite(n));
        const uniqueSorted = Array.from(new Set(nos)).sort((a, b) => b - a); // 최신(큰 번호) 우선
        setSessionNosInGroup(uniqueSorted);
        // 회기 번호 -> sessionSeq 매핑 생성
        const map = {};
        sameGroup.forEach(it => {
          const no = Number(it?.sessionNo);
          const seq = Number(it?.sessionSeq);
          if (Number.isFinite(no) && Number.isFinite(seq)) {
            // 동일 번호가 여러 개인 경우 최신 seq를 덮어씀
            map[no] = seq;
          }
        });
        setSessionNoToSeq(map);
      } catch (e) {
        console.warn('[SurveySendModal] 회기 목록 조회 실패:', e);
        setSessionNosInGroup([]);
        setSessionNoToSeq({});
      }
    };
    fetchSessions();
  }, [modalOpen, clientId, sessiongroupSeq]);

  // 옵션 변경 시 선택값이 유효하지 않으면 자동 보정
  useEffect(() => {
    if (!sessionOptions.length) return;
    const has = sessionOptions.some(opt => opt.value === selectedSession);
    // 값이 비어있으면(초기 상태) 자동 보정하지 않음
    if (!has && selectedSession) {
      const firstEnabled = sessionOptions.find(opt => !opt.disabled);
      if (firstEnabled) setSelectedSession(firstEnabled.value);
    }
  }, [sessionOptions, selectedSession]);

  // 완료 데이터 조회: 동일 sessiongroupSeq에서 submittedTime이 있는 항목 기반
  useEffect(() => {
    const fetchCompletion = async () => {
      try {
        if (!modalOpen || !clientId || !sessiongroupSeq) return;
        const res = await assessmentSetList(parseInt(clientId, 10));
        const list = Array.isArray(res?.data) ? res.data : [];
        const sameGroup = list.filter(it => String(it?.sessiongroupSeq) === String(sessiongroupSeq));
        const completed = sameGroup.filter(it => !!it?.submittedTime);

        const hasPre = completed.some(it => String(it?.questionType).toUpperCase() === 'PRE');
        const hasPost = completed.some(it => String(it?.questionType).toUpperCase() === 'POST');
        const progSessions = completed
          .filter(it => String(it?.questionType).toUpperCase() === 'PROG')
          .map(it => Number(it?.sessionSeq))
          .filter(n => Number.isFinite(n));

        setIsPreCompleted(hasPre);
        setIsPostCompleted(hasPost);
        setCompletedProgSessions(Array.from(new Set(progSessions)));
      } catch (e) {
        console.warn('[SurveySendModal] 완료 데이터 조회 실패:', e);
        setIsPreCompleted(false);
        setIsPostCompleted(false);
        setCompletedProgSessions([]);
      }
    };
    fetchCompletion();
  }, [modalOpen, clientId, sessiongroupSeq]);
  
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
    if (!selectedSurveyType) return;
    // PROG인 경우 회기 선택 필수
    if (selectedSurveyType === 'PROG') {
      const isValid = !!selectedSession && sessionOptions.some(opt => opt.value === selectedSession && !opt.disabled);
      if (!isValid) {
        setConfirmTitle('알림');
        setConfirmMessage('경과 문진은 회기를 선택해 주세요.');
        setConfirmOpen(true);
        return;
      }
    }
    setStep(2);
  };
  
  // step02: 이전 버튼
  const handleStep2Prev = () => {
    setStep(1);
  };
  
  // step02: 다음 버튼 - 검사지 선택 즉시 생성 호출
  const handleStep2Next = async () => {
    try {
      // 선택된 검사지들의 assessmentName 수집
      const selectedNames = (() => {
        const names = necessaryList.map(n => n.assessmentName);
        extraList.forEach(item => {
          if (extraChecked[item.id]) names.push(item.assessmentName);
        });
        return names;
      })();

      // name -> seq 매핑
      const assessmentSeqList = selectedNames
        .map(name => nameToSeqMap[name])
        .filter(seq => seq != null);

      if (!selectedSurveyType) {
        setConfirmTitle('알림');
        setConfirmMessage('문진 종류를 선택해 주세요.');
        setConfirmOpen(true);
        return;
      }
      if (!sessiongroupSeq) {
        setConfirmTitle('알림');
        setConfirmMessage('회기그룹 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
        setConfirmOpen(true);
        return;
      }
      if (!assessmentSeqList.length) {
        setConfirmTitle('알림');
        setConfirmMessage('선택된 검사지가 없습니다.');
        setConfirmOpen(true);
        return;
      }

      const baseUrl = `http://43.202.89.215/client-survey`;
      // '3회기' 형태에서 숫자만 추출하여 sessionNo로 사용 후 sessionSeq 매핑 (PROG 전용)
      const selectedSessionNo = (() => {
        if (typeof selectedSession === 'string') {
          const n = parseInt(selectedSession, 10);
          return Number.isFinite(n) ? n : undefined;
        }
        const n = Number(selectedSession);
        return Number.isFinite(n) ? n : undefined;
      })();
      const resolvedSessionSeq = selectedSurveyType === 'PROG'
        ? (selectedSessionNo != null ? sessionNoToSeq[selectedSessionNo] : undefined)
        : undefined;
      if (selectedSurveyType === 'PROG' && !resolvedSessionSeq) {
        setConfirmTitle('알림');
        setConfirmMessage('회기 정보를 불러오는 중 오류가 발생했습니다. 화면을 새로고침 후 다시 시도해 주세요.');
        setConfirmOpen(true);
        return;
      }
      const params = {
        clientSeq: parseInt(clientId, 10),
        sessiongroupSeq: sessiongroupSeq,
        questionType: selectedSurveyType, // PRE | PROG | POST
        sessionSeq: resolvedSessionSeq,
        urlValidityMinute: parseInt(expirationTime, 10) * 60,
        assignedUrl: baseUrl,
        assessmentSeqList,
      };

      const createRes = await assessmentSetCreate(params);
      const dataLayer = createRes?.data || createRes?.result || createRes;
      const setSeq = dataLayer?.setSeq
        ?? dataLayer?.assessmentSetSeq
        ?? dataLayer?.id
        ?? dataLayer?.assessmentSet?.setSeq;
      const token = dataLayer?.token;

      if (token) {
        const finalUrl = `${baseUrl}?token=${encodeURIComponent(token)}`;
        // setSeq가 있으면 서버에 최종 URL 업데이트, 없어도 표시용 URL은 세팅
        if (setSeq) {
          try {
            await assessmentSetUpdateUrl({ setSeq, assignedUrl: finalUrl });
          } catch (e) {
            console.warn('[SurveySendModal] assessmentSetUpdateUrl 실패:', e);
          }
        }
        setGeneratedUrl(finalUrl);
      } else {
        // 토큰이 없으면 기본 URL 유지
        setGeneratedUrl(baseUrl);
      }

      setStep(3);
      if (typeof showToastMessage === 'function') {
        showToastMessage('검사지가 생성되었습니다.');
      }
    } catch (e) {
      console.error('[SurveySendModal] 생성 실패(step2 next):', e);
      setConfirmTitle('오류');
      setConfirmMessage('생성 중 오류가 발생했습니다.');
      setConfirmOpen(true);
    }
  };
  
  // URL 복사
  const handleCopyUrl = () => {
    if (typeof showToastMessage === 'function') {
      showToastMessage('심리 검사지 전송 링크가 복사 되었습니다.');
    }
  };
  
  // 모달 닫기 및 초기화
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setSelectedSurveyType('');
      setSelectedSession('');
      setExtraChecked({});
    }, 300);
  };
  
  // 완료 버튼 - 생성은 step02에서 이미 처리됨
  const handleComplete = async () => {
    if (typeof onCompleted === 'function') {
      try {
        await onCompleted();
      } catch (_) {}
    }
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
      case 'PRE': return '사전 문진';
      case 'PROG': return `경과 문진, ${selectedSession}`;
      case 'POST': return '사후 문진';
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
                        id="PRE" 
                        type="radio" 
                        name="session" 
                        checked={selectedSurveyType === 'PRE'}
                        disabled={isPreCompleted}
                        onChange={handleSurveyTypeChange}
                      />
                      <label htmlFor="PRE">
                        <span>사전 문진</span>
                        {isPreCompleted && <span className="complete">문진 완료</span>}
                      </label>
                    </div>
                  </li>
                  <li className="flex-wrap">
                    <div className="input-wrap radio">
                      <input 
                        id="PROG" 
                        type="radio" 
                        name="session"
                        checked={selectedSurveyType === 'PROG'}
                        onChange={handleSurveyTypeChange}
                      />
                      <label htmlFor="PROG">
                        <span>경과 문진</span>
                      </label>
                    </div>
                    <CustomSelect
                      options={sessionOptions}
                      value={selectedSession}
                      onChange={setSelectedSession}
                      placeholder="회기 선택"
                      disabled={selectedSurveyType !== 'PROG'}
                      className={selectedSurveyType !== 'PROG' ? 'disabled' : ''}
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
                        id="POST" 
                        type="radio" 
                        name="session"
                        checked={selectedSurveyType === 'POST'}
                        disabled={isPostCompleted}
                        onChange={handleSurveyTypeChange}
                      />
                      <label htmlFor="POST">
                        <span>사후 문진</span>
                        {isPostCompleted && <span className="complete">문진 완료</span>}
                      </label>
                    </div>
                  </li>
                </ul>
              </div>
              <button 
                className="next-btn type10" 
                type="button" 
                onClick={handleStep1Next}
                disabled={!selectedSurveyType || (selectedSurveyType === 'PROG' && !selectedSession)}
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
                <CopyToClipboard text={generatedUrl} onCopy={handleCopyUrl}>
                  <button 
                    className="copy-btn" 
                    type="button" 
                    aria-label="URL 복사"
                  ></button>
                </CopyToClipboard>
              </div>
              <div className="survey-info">
                <strong className="info-tit">생성된 심리 검사지 정보</strong>
                <ul className="detail-info">
                  <li>
                    <div className="list-tit">내담자 이름</div>
                    <div className="list-cont">{clientNameText}{clientBirthText ? `, ${clientBirthText}` : ''}</div>
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
                              {test.label.replace(/\([^)]*\)/g, '').trim()} ({test.label.match(/\(([^)]+)\)/)?.[1] || ''})
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
        {/* 공통 확인 모달 */}
        <EditorConfirm
          open={confirmOpen}
          title={confirmTitle}
          message={confirmMessage}
          confirmText="확인"
          onConfirm={() => setConfirmOpen(false)}
          onClose={() => setConfirmOpen(false)}
        />
      </div>
    </div>
  );
}

export default SurveySendModal;
