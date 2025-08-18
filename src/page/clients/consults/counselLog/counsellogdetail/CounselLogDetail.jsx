import { sessionFind, sessionNoteFind, sessionNoteUpdate } from '@/api/apiCaller';
import AiPanelCommon from '@/components/AiPanelCommon';
import ToastPop from '@/components/ToastPop';
import Header from '@/layouts/Header';
import { currentSessionState, foldState, sessionNoteState, supportPanelState } from '@/recoil';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { currentRiskOptions, pastRiskOptions, riskFactorOptions, riskScaleOptions, symptomList } from './components/counselLogOptions';
import CounselLogStep from './components/CounselLogStep';
import CustomTextareaBlock from './components/CustomTextareaBlock';
import GuidePanel from './components/GuidePanel';
import HistoryPanel from './components/HistoryPanel';
import RiskSection from './components/RiskSection';
import SymptomTable from './components/SymptomTable';
import { mapSessionNoteToState as mapSessionNoteToStateUtil } from './components/sessionNoteMapper';
import './notes.scss';

function CounselLogDetail() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const clientId = query.get('clientId');
  const sessionSeq = query.get('sessionSeq');
  
  const handleStepNavClick = (e, targetId) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  // 상담일지 데이터 로컬 상태 제거 (Recoil 캐시 사용)
  // AI Panel 더미 데이터 
  const aiPanelConfigs = {
    mainProblem: {
      title: '주호소 문제 AI 생성',
      infoMessage: '주호소 문제의 내용이 생성 완료되었습니다.',
      renderComplete: () => (
        <div className="complete-cont">
          <div className="bullet-line">최근 업무에 대한 자신감 저하와 대인관계 스트레스로 인해 불면과 식욕 저하가 지속되고 있음.</div>
          <div className="bullet-line">상사의 평가에 민감하게 반응하며, “나는 늘 부족하다”는 생각에서 벗어나지 못함.</div>
          <div className="bullet-line">특히 팀 회의 이후 무기력함이 심화되어 일상생활에도 영향을 줌.</div>
        </div>
      )
    },
    sessionContent: {
      title: '상담내용 AI 생성',
      infoMessage: '상담내용이 생성 완료되었습니다.',
      renderComplete: () => (
        <div className="complete-cont">
          상담내용이 생성되었습니다.상담내용이 생성되었습니다.상담내용이 생성되었습니다.상담내용이 생성되었습니다.상담내용이 생성되었습니다.상담내용이 생성되었습니다.상담내용이 생성되었습니다.상담내용이 생성되었습니다.상담내용이 생성되었습니다.상담내용이 생성되었습니다.상담내용이 생성되었습니다.
        </div>
      )
    },
    nextPlan: {
      title: '차회기 상담 계획 AI 생성',
      infoMessage: '차회기 상담 계획이 생성 완료되었습니다.',
      renderComplete: () => (
        <div className="complete-cont">
          <div className="bullet-line">차회기에는 이완훈련 및 대인관계 기술 훈련을 진행할 예정입니다.</div>
          <div className="bullet-line">내담자가 실생활에서 적용할 수 있는 구체적 전략을 안내하고, 실습 과제를 제시합니다.</div>
        </div>
      )
    }
  };
  const [aiPanelKey, setAiPanelKey] = useState(null);
  // 상담일지 폼 상태들
  const [currentRisk, setCurrentRisk] = useState('');
  const [pastRisk, setPastRisk] = useState('');
  const [riskFactors, setRiskFactors] = useState([]);
  const [riskFactorEtc, setRiskFactorEtc] = useState('');
  const [riskScale, setRiskScale] = useState('');
  const [symptoms, setSymptoms] = useState({
    depression: null,
    anxiety: null,
    panic: null,
    ocd: null,
    adhd: null,
    ptsd: null,
  });
  const [customSymptoms, setCustomSymptoms] = useState([]);
  const [mainProblem, setMainProblem] = useState('');
  const [sessionContent, setSessionContent] = useState('');
  const [counselorOpinion, setCounselorOpinion] = useState('');
  const [observation, setObservation] = useState('');
  const [goal, setGoal] = useState('');
  const [nextPlan, setNextPlan] = useState('');
  const [concern, setConcern] = useState('');
  const [caseConcept, setCaseConcept] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [openedPanel, setOpenedPanel] = useState(null); // 'guide' | 'history' | 'ai' | null
  const [scroll, setScroll] = useState(() => typeof window !== "undefined" ? window.scrollY >= 100 : false);
  const [fold, setFold] = useRecoilState(foldState);
  const setSupportPanel = useSetRecoilState(supportPanelState);
  const [currentSession, setCurrentSession] = useRecoilState(currentSessionState);
  const [sessionNote, setSessionNote] = useRecoilState(sessionNoteState);
  
  // Toast 상태
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // 날짜 포맷팅 함수
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
      return '-';
    }
  };

  // 동적 제목 생성
  const getSessionTitle = () => {
    if (currentSession?.sessionNo) {
      return `${currentSession.sessionNo}회기 상담일지`;
    }
    return '상담일지';
  };

  // 동적 상담일시 생성
  const getSessionDateTime = () => {
    if (currentSession?.sessionDate) {
      return formatDate(currentSession.sessionDate);
    }
    return '-';
  };

  const handleOpenGuidePanel = () => {
    setOpenedPanel('guide');
    setSupportPanel(true);
  };

  const handleOpenHistoryPanel = () => {
    setOpenedPanel('history');
    setSupportPanel(true);
  };

  const handleOpenAiPanel = (key) => {
    setAiPanelKey(key);
    setOpenedPanel('ai');
    setSupportPanel(true);
  };

  const handleClosePanel = () => {
    setOpenedPanel(null);
    setSupportPanel(false);
    setAiPanelKey(null);
  };

  // Toast 표시 함수
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000); // 3초 후 자동 숨김
  };

  const handleSave = async () => {
    if (!currentSession?.sessionSeq) {
      showToastMessage('세션 정보가 없습니다.');
      return;
    }

    // 필수 입력값 검증
    // 1. 자살, 위기 상황의 긴급도 - 현재 위기 상황, 과거 위기 상황, 위험요인, 위기 단계 모두 체크
    if (!currentRisk) {
      alert('자살, 위기 상황의 긴급도를 입력하지 않았습니다. 입력 후 저장해 주세요.');
      return;
    }
    if (!pastRisk) {
      alert('자살, 위기 상황의 긴급도를 입력하지 않았습니다. 입력 후 저장해 주세요.');
      return;
    }
    if (riskFactors.length === 0) {
      alert('자살, 위기 상황의 긴급도를 입력하지 않았습니다. 입력 후 저장해 주세요.');
      return;
    }
    if (!riskScale) {
      alert('자살, 위기 상황의 긴급도를 입력하지 않았습니다. 입력 후 저장해 주세요.');
      return;
    }
    
    // 2. 현재 증상의 심각도 - 모든 증상에 대해 점수가 입력되어야 함
    const allSymptomsCompleted = Object.values(symptoms).every(v => v !== null && v !== undefined);
    if (!allSymptomsCompleted) {
      alert('현재 증상의 심각도를 입력하지 않았습니다. 입력 후 저장해 주세요.');
      return;
    }
    
    // 3. 기타 필수 텍스트 필드들
    // 모든 텍스트 필드 타입 안전성 보장 (string이 아닐 경우 빈 문자열 처리)
    const safeMainProblem = typeof mainProblem === 'string' ? mainProblem : '';
    const safeSessionContent = typeof sessionContent === 'string' ? sessionContent : '';
    const safeObservation = typeof observation === 'string' ? observation : '';
    const safeGoal = typeof goal === 'string' ? goal : '';
    const safeNextPlan = typeof nextPlan === 'string' ? nextPlan : '';
    const textRequiredFields = [
      { value: safeMainProblem.trim(), name: '주호소 문제' },
      { value: safeSessionContent.trim(), name: '상담기록' },
      { value: safeObservation.trim(), name: '객관적 관찰' },
      { value: safeGoal.trim(), name: '상담 목표' },
      { value: safeNextPlan.trim(), name: '차회기 상담 계획' }
    ];

    for (const field of textRequiredFields) {
      if (!field.value) {
        alert(`${field.name}을 입력하지 않았습니다. 입력 후 저장해 주세요.`);
        return;
      }
    }

    // 글자수 제한 검증
    const characterLimitFields = [
      { value: mainProblem, name: '주호소 문제', limit: 1000 },
      { value: sessionContent, name: '상담내용', limit: 2000 },
      { value: counselorOpinion, name: '상담사 소견', limit: 2000 },
      { value: observation, name: '객관적 관찰', limit: 1000 },
      { value: goal, name: '상담 목표', limit: 1000 },
      { value: nextPlan, name: '차회기 상담 계획', limit: 1000 },
      { value: concern, name: '고민되는 점', limit: 1000 },
      { value: caseConcept, name: '사례개념화', limit: 2000 },
      { value: riskFactorEtc, name: '위험요인 기타', limit: 100 }
    ];

    for (const field of characterLimitFields) {
      if (field.value && field.value.length > field.limit) {
        alert(`${field.name}의 내용이 입력 가능 글자수를 초과했습니다. 글자수를 줄인 후 저장해주세요.`);
        return;
      }
    }

    try {
      // 문자열 직렬화 보장: 배열이면 \n 조인, 문자열 아니면 빈 문자열
      const normalizeText = (v) => Array.isArray(v) ? v.join('\n') : (typeof v === 'string' ? v : '');

      // API 파라미터 구조에 맞춰 데이터 변환
      const notePayload = {
        sessionSeq: currentSession.sessionSeq,
        currentRiskLevel: currentRisk ? parseInt(currentRisk) : null,
        pastRiskLevel: pastRisk ? parseInt(pastRisk) : null,
        
        // 위험요인 boolean 값들로 변환
        riskNone: riskFactors.includes('1'),
        riskDiagnosis: riskFactors.includes('2'),
        riskSelfHarm: riskFactors.includes('3'),
        riskExtremeStress: riskFactors.includes('4'),
        riskHighImpulsivity: riskFactors.includes('8'),
        riskFamilyHistory: riskFactors.includes('5'),
        riskGrief: riskFactors.includes('6'),
        riskSleepChange: riskFactors.includes('7'),
        riskOtherText: riskFactors.includes('9') ? riskFactorEtc : '',
        
        crisisStageLevel: riskScale ? parseInt(riskScale) : null,
        
        // 증상 심각도
        depression: symptoms.depression,
        anxiety: symptoms.anxiety,
        panic: symptoms.panic,
        compulsion: symptoms.ocd,
        adhd: symptoms.adhd,
        ptsd: symptoms.ptsd,
        
        // 커스텀 증상 매핑 (최대 4개)
        symptom01Active: customSymptoms.length > 0 && customSymptoms[0]?.name?.trim() ? true : false,
        symptom01Name: customSymptoms.length > 0 ? (customSymptoms[0]?.name?.trim() || '') : '',
        symptom01Severity: customSymptoms.length > 0 ? (customSymptoms[0]?.score || 0) : 0,
        symptom02Active: customSymptoms.length > 1 && customSymptoms[1]?.name?.trim() ? true : false,
        symptom02Name: customSymptoms.length > 1 ? (customSymptoms[1]?.name?.trim() || '') : '',
        symptom02Severity: customSymptoms.length > 1 ? (customSymptoms[1]?.score || 0) : 0,
        symptom03Active: customSymptoms.length > 2 && customSymptoms[2]?.name?.trim() ? true : false,
        symptom03Name: customSymptoms.length > 2 ? (customSymptoms[2]?.name?.trim() || '') : '',
        symptom03Severity: customSymptoms.length > 2 ? (customSymptoms[2]?.score || 0) : 0,
        symptom04Active: customSymptoms.length > 3 && customSymptoms[3]?.name?.trim() ? true : false,
        symptom04Name: customSymptoms.length > 3 ? (customSymptoms[3]?.name?.trim() || '') : '',
        symptom04Severity: customSymptoms.length > 3 ? (customSymptoms[3]?.score || 0) : 0,
        
        // 텍스트 필드들 (항상 문자열 전송)
        chiefComplaintText: normalizeText(mainProblem),
        sessionSummaryText: normalizeText(sessionContent),
        counselorOpinionText: normalizeText(counselorOpinion),
        objectiveObservationText: normalizeText(observation),
        counselingGoalText: normalizeText(goal),
        nextSessionPlanText: normalizeText(nextPlan),
        clientConcernsText: normalizeText(concern),
        caseConceptualizationText: normalizeText(caseConcept)
      };
      
      const response = await sessionNoteUpdate(notePayload);
      
      if (response.code === 200) {
        showToastMessage('상담일지가 저장되었습니다.');
        console.log('저장 성공:', response);
        // 저장 성공 시 Recoil 캐시를 최신 값으로 업데이트하여 영속 상태 유지
        if (currentSession?.sessionSeq) {
          setSessionNote({
            sessionSeq: String(currentSession.sessionSeq),
            data: {
              ...sessionNote?.data,
              ...notePayload,
            },
            updatedAt: Date.now(),
          });
        }
      } else {
        showToastMessage('저장에 실패했습니다: ' + (response.message || '알 수 없는 오류'));
        console.error('저장 실패:', response);
      }
    } catch (error) {
      showToastMessage('저장 중 오류가 발생했습니다.');
      console.error('저장 오류:', error);
    }
  };

  const handleRiskChange = e => setCurrentRisk(e.target.value);
  const handlePastRiskChange = e => setPastRisk(e.target.value);
  const handleRiskFactorsChange = e => {
    const { value, checked } = e.target;
    setRiskFactors(prev => checked ? [...prev, value] : prev.filter(v => v !== value));
  };
  const handleRiskFactorEtcChange = e => setRiskFactorEtc(e.target.value);
  const handleRiskScaleChange = e => setRiskScale(e.target.value);
  const handleSymptomChange = (field, score) => setSymptoms(prev => ({ ...prev, [field]: score }));
  const handleCustomSymptomsChange = (newCustomSymptoms) => setCustomSymptoms(newCustomSymptoms);
  const handleMainProblemChange = value => setMainProblem(value);
  const handleSessionContentChange = value => setSessionContent(value);
  const handleCounselorOpinionChange = value => setCounselorOpinion(value);
  const handleObservationChange = value => setObservation(value);
  const handleGoalChange = value => setGoal(value);
  const handleNextPlanChange = value => setNextPlan(value);
  const handleConcernChange = value => setConcern(value);
  const handleCaseConceptChange = value => setCaseConcept(value);

  // API 데이터를 컴포넌트 상태로 매핑하는 함수 (유틸 위임)
  const mapSessionNoteToState = (data) => {
    return mapSessionNoteToStateUtil(data, {
      setCurrentRisk,
      setPastRisk,
      setRiskScale,
      setRiskFactors,
      setRiskFactorEtc,
      setSymptoms,
      setCustomSymptoms,
      setMainProblem,
      setSessionContent,
      setCounselorOpinion,
      setObservation,
      setGoal,
      setNextPlan,
      setConcern,
      setCaseConcept,
    });
  };

  // URL 파라미터로부터 세션 데이터 로딩 (새로고침 대응)
  useEffect(() => {
    const fetchSessionData = async () => {
      if (sessionSeq && clientId) {
        // 새로고침 시에는 항상 세션 데이터를 다시 가져옴
        try {
          const response = await sessionFind(clientId, sessionSeq);
          if (response.code === 200 && response.data) {
            setCurrentSession(response.data);
            // console.log('세션 데이터 로드 성공:', response.data);
          } else {
            console.error('세션 조회 실패:', response.message);
          }
        } catch (error) {
          console.error('세션 조회 오류:', error);
        }
      }
    };

    fetchSessionData();
  }, [sessionSeq, clientId]);

  // 상담일지 데이터 로딩 (전역 상태 우선 확인, 없을 때만 API 호출)
  useEffect(() => {
    const fetchSessionNoteData = async () => {
      if (currentSession?.sessionSeq) {
        // 1. 전역 상태에서 해당 sessionSeq의 데이터가 있는지 확인
        if (sessionNote?.data && String(sessionNote.sessionSeq) === String(currentSession.sessionSeq)) {
          console.log('전역 상태에서 데이터 로드 성공:', sessionNote.data);
          mapSessionNoteToState(sessionNote.data);
          return;
        }

        // 2. 전역 상태에 없으면 API 호출
        try {
          const response = await sessionNoteFind(currentSession.sessionSeq);
          if (response.code === 200 && response.data) {
            console.log('API 호출로 데이터 로드 성공:', response.data);
            setSessionNote({
              sessionSeq: String(currentSession.sessionSeq),
              data: response.data,
              updatedAt: Date.now(),
            });
            mapSessionNoteToState(response.data);
          } else {
            console.error('상담일지 조회 실패:', response.message);
          }
        } catch (error) {
          console.error('상담일지 조회 오류:', error);
        }
      } else {
        // currentSession이 없으면 초기화
        setCurrentRisk('');
        setPastRisk('');
        setRiskFactors([]);
        setRiskFactorEtc('');
        setRiskScale('');
        setSymptoms({
          depression: null,
          anxiety: null,
          panic: null,
          ocd: null,
          adhd: null,
          ptsd: null,
        });
        setMainProblem('');
        setSessionContent('');
        setCounselorOpinion('');
        setObservation('');
        setGoal('');
        setNextPlan('');
        setConcern('');
        setCaseConcept('');
      }
    };

    fetchSessionNoteData();
  }, [currentSession, sessionNote]);

  // 스크롤 이벤트
  useEffect(() => {
    const handleScroll = () => setScroll(window.scrollY >= 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Header
        title={getSessionTitle()}
        scroll={scroll}
        fold={fold}
        rightActions={
          <button className="save-btn type07 black" type="button" onClick={handleSave} style={{ display: 'block', transition: 'opacity 0.2s 50ms', opacity: scroll ? 1 : 0 }}>
            저장
          </button>
        }
      />
      <div className="inner">
        <div className="move-up">
          <strong className="page-title">{getSessionTitle()}</strong>
          <button className="save-btn type07 black" type="button" onClick={handleSave}>저장</button>
        </div>
        <div className="session-info-bar">
          <div className="info">
            <strong>상담내용</strong>
            <p>
              <span>상담일시</span> : <span>{getSessionDateTime()}</span>
            </p>
          </div>
          <a className="panel-btn cursor-pointer" onClick={handleOpenHistoryPanel}>이전 회기 기록</a>
        </div>
        <div className="form-section">
          <div className="step-nav">
            <div className="inner">
              <strong>상담일지 작성 단계</strong>
              <ul>
                <li className={currentRisk ? 'on' : ''}>
                  <a href="#step01" onClick={e => handleStepNavClick(e, 'step01')}>자살, 위기 상황의 긴급도</a>
                </li>
                <li className={Object.values(symptoms).some(v => v != null && v !== 0) ? 'on' : ''}>
                  <a href="#step02" onClick={e => handleStepNavClick(e, 'step02')}>현재 증상의 심각도</a>
                </li>
                <li className={mainProblem ? 'on' : ''}>
                  <a href="#step03" onClick={e => handleStepNavClick(e, 'step03')}>주호소 문제</a>
                </li>
                <li className={(sessionContent || counselorOpinion) ? 'on' : ''}>
                  <a href="#step04" onClick={e => handleStepNavClick(e, 'step04')}>상담기록</a>
                  <ul>
                    <li className={sessionContent ? 'on' : ''}>
                      <a href="#step04-1" onClick={e => e.preventDefault()}>상담내용</a>
                    </li>
                    <li className={counselorOpinion ? 'on' : ''}>
                      <a href="#step04-2" onClick={e => e.preventDefault()}>상담사 소견</a>
                    </li>
                  </ul>
                </li>
                <li className={observation ? 'on' : ''}>
                  <a href="#step05" onClick={e => handleStepNavClick(e, 'step05')}>객관적 관찰</a>
                </li>
                <li className={goal ? 'on' : ''}>
                  <a href="#step06" onClick={e => handleStepNavClick(e, 'step06')}>상담 목표</a>
                </li>
                <li className={nextPlan ? 'on' : ''}>
                  <a href="#step07" onClick={e => handleStepNavClick(e, 'step07')}>다음 상담 계획</a>
                </li>
                <li className={concern ? 'on' : ''}>
                  <a href="#step08" onClick={e => handleStepNavClick(e, 'step08')}>고민되는점</a>
                </li>
                <li className={caseConcept ? 'on' : ''}>
                  <a href="#step09" onClick={e => handleStepNavClick(e, 'step09')}>사례개념화</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="form-content">
            <CounselLogStep id="step01" title="자살, 위기 상황의 긴급도">
              <RiskSection
                currentRisk={currentRisk}
                pastRisk={pastRisk}
                riskFactors={riskFactors}
                riskFactorEtc={riskFactorEtc}
                riskScale={riskScale}
                onChangeCurrentRisk={handleRiskChange}
                onChangePastRisk={handlePastRiskChange}
                onChangeRiskFactors={handleRiskFactorsChange}
                onChangeRiskFactorEtc={handleRiskFactorEtcChange}
                onChangeRiskScale={handleRiskScaleChange}
                currentRiskOptions={currentRiskOptions}
                pastRiskOptions={pastRiskOptions}
                riskFactorOptions={riskFactorOptions}
                riskScaleOptions={riskScaleOptions}
                onOpenGuide={handleOpenGuidePanel}
              />
            </CounselLogStep>

            <CounselLogStep id="step02" title="현재 증상의 심각도">
              <div className="write-wrap">
                <div className="write-title">
                  <p>1. 내담자의 장애별 증상 심각도를 평정하여 주세요.</p>
                </div>
                <div className="write-area">
                  <SymptomTable
                    symptoms={symptomList}
                    values={symptoms}
                    onChange={handleSymptomChange}
                    customSymptoms={customSymptoms}
                    onCustomSymptomsChange={handleCustomSymptomsChange}
                  />
                </div>
              </div>
            </CounselLogStep>

            <CounselLogStep
              id="step03"
              title="주호소 문제"
              rightButton
              onAiClick={() => handleOpenAiPanel('mainProblem')}
            >
              <CustomTextareaBlock
                placeholder="주호소 문제를 입력해 주세요."
                value={mainProblem}
                onChange={handleMainProblemChange}
              />
            </CounselLogStep>

            <div id="step04" className="content04">
              <div className="step-title">
                  <strong className="necessary">상담기록</strong>
              </div>
              <div className="step-conts">
                <div id="step04-1" className="step-title sub">
                  <strong className="necessary">상담내용</strong>
                  <button className="type01 h36" type="button" onClick={() => handleOpenAiPanel('sessionContent')}>
                      <span>AI 생성하기</span>
                  </button>
                </div>
                <CustomTextareaBlock
                  placeholder="본 회기에서 다룬 주요 주제와 상호작용 흐름을 기술하세요"
                  className="editor-wrap"
                  value={sessionContent}
                  onChange={handleSessionContentChange}
                />
                <div id="step04-2" className="step-title sub">
                  <strong className="necessary">상담사 소견</strong>
                </div>
                <CustomTextareaBlock
                  placeholder="상담사가 내담자의 보고한 내용에 대한 해석이나 현재 상태에 대한 임상적 판단과 경과를 기술하세요."
                  className="editor-wrap"
                  value={counselorOpinion}
                  onChange={handleCounselorOpinionChange}
                />
              </div>
            </div>
            <CounselLogStep id="step05" title="객관적 관찰">
              <div className="step-conts">
                <CustomTextareaBlock
                  value={observation}
                  placeholder="내담자의 외모, 관찰 가능한 증상, 검사 결과, 가능한 진단, 행동관찰 등 객관적으로 관찰된 특이사항을 기록하세요."
                  className="editor-wrap"
                  onChange={handleObservationChange}
                />
              </div>
            </CounselLogStep>
            <CounselLogStep id="step06" title="상담 목표">
              <div className="step-conts">
                <CustomTextareaBlock
                  value={goal}
                  placeholder="내담자와 설정한 단기 또는 장기 상담 목표를 구체적으로 기술해주세요."
                  className="editor-wrap"
                  onChange={handleGoalChange}
                />
              </div>
            </CounselLogStep>
            <CounselLogStep id="step07" title="차회기 상담 계획" 
              rightButton
              onAiClick={() => handleOpenAiPanel('nextPlan')}
            >
              <div className="step-conts">
                <CustomTextareaBlock
                  value={nextPlan}
                  placeholder="다음 회기에서 다룰 주제나 전략에 대해 간단히 기술해주세요."
                  className="editor-wrap"
                  onChange={handleNextPlanChange}
                />
              </div>
            </CounselLogStep>
            <div id="step08" className="content08">
              <div className="step-title">
                <strong>고민되는 점</strong>
              </div>
              <div className="step-conts">
                <CustomTextareaBlock
                  value={concern}
                  placeholder="본 회기 진행에 있어 전문가의 도움을 받고 싶은 부분이나 고민되는 점을 적어보세요."
                  className="editor-wrap"
                  onChange={handleConcernChange}
                />
              </div>
            </div>
            <div id="step09" className="content09">
              <div className="tips">
                <p>사례개념화를 작성하면 내담자의 문제를 더 잘 이해할 수 있어요!</p>
              </div>
              <div className="step-title type01">
                <strong>사례개념화</strong>
                <div className="info">
                  <div className="info-icon" aria-label="툴팁 안내 아이콘" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}></div>
                  <div className={`tooltip${showTooltip ? " show" : ""}`}>
                    사례개념화는 내담자의 고민이나 문제를 더 잘 이해하기 위해서<br/>
                    하나의 그림처럼 정리해보는 과정이에요.
                  </div>
                </div>
              </div>
              <div className="step-conts">
                <CustomTextareaBlock
                  value={caseConcept}
                  placeholder="내담자의 고민이나 문제를 이론적 틀 안에서 이해하고, 그 문제가 비롯된 내담자의 성장 과정과 유지 요인 등을 정리해 보세요."
                  className="editor-wrap"
                  onChange={handleCaseConceptChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <GuidePanel 
        open={openedPanel === 'guide'}
        onClose={handleClosePanel}
      />
      <HistoryPanel
        open={openedPanel === 'history'}
        onClose={handleClosePanel}
      />
      <AiPanelCommon
        isCounselLog={true}
        open={openedPanel === 'ai'}
        onClose={handleClosePanel}
        status="complete"
        title={aiPanelKey && aiPanelConfigs[aiPanelKey] ? aiPanelConfigs[aiPanelKey].title : 'AI 종합 의견 생성'}
        description={'상담 녹취록을 바탕으로 AI가 생성한 내용입니다.'}
        infoMessage={aiPanelKey && aiPanelConfigs[aiPanelKey] ? aiPanelConfigs[aiPanelKey].infoMessage : 'AI 종합 의견이 생성되었습니다.'}
        keyInfo
        keyInfoText={'AI 생성을 통해 상담일지 작성 시 도움 받을 수 있어요.'}
        renderComplete={aiPanelKey && aiPanelConfigs[aiPanelKey] ? aiPanelConfigs[aiPanelKey].renderComplete : () => (
          <div className="complete-cont"></div>
        )}
      />
      <ToastPop message={toastMessage} showToast={showToast} />
    </>
  )
}

export default CounselLogDetail;