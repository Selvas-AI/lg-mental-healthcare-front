import React, { useEffect, useState, useRef, useCallback } from "react";
import AiPanelCommon from "@/components/AiPanelCommon";
// import KeywordBox from "../transcript/KeywordBox";
import KeywordBubblePack from "../transcript/KeywordBubblePack";
import FrequencyBox from "../transcript/FrequencyBox";
import StressBoxSmall from "../transcript/StressBoxSmall";
import { dislikeUpdate } from '@/api/apiCaller';

function AiTranscriptPanel({ open, onClose, status = "creating", AiSummaryData, sessionSeq, onConfirm: onConfirmCallback, showToastMessage, initialStep }) {
  // 현재 단계 상태 (1: 상담요약, 2: 고민주제, 3: 키워드분석, 4: 발화빈도, 5: 스트레스징후)
  const [currentStep, setCurrentStep] = useState(1);
  // 패널 표시 상태(loading/complete 등) 관리
  const [panelStatus, setPanelStatus] = useState(status);
  
  // llm_answer/llm_feedback 구조에서 텍스트만 추출하는 헬퍼
  const extractTextParts = (value) => {
  if (!value) return { answer: '', feedback: '' };
  if (typeof value === 'string') {
    // JSON 문자열인지 시도
    try {
      const obj = JSON.parse(value);
      if (typeof obj === 'object' && (obj.llm_answer || obj.llm_feedback)) {
        return { answer: obj.llm_answer || '', feedback: obj.llm_feedback || '' };
      }
      // 파싱 성공했지만 원하는 구조가 아니면 원래 문자열 반환
      return { answer: value, feedback: '' };
    } catch {
      // JSON 파싱 실패 시 원래 문자열 반환
      return { answer: value, feedback: '' };
    }
  }
  if (typeof value === 'object') {
    const answer = value.llm_answer || '';
    const feedback = value.llm_feedback || '';
    if (answer || feedback) return { answer, feedback };
  }
  return { answer: '', feedback: '' };
};

  // 각 단계별 데이터 존재 여부 확인
  const steps = [
    { id: 1, title: "1. 상담 요약", data: AiSummaryData?.summary, field: "summary" },
    { id: 2, title: "2. 고민주제", data: AiSummaryData?.issue, field: "issue" },
    { id: 3, title: "3. 키워드 분석", data: AiSummaryData?.keyword, field: "keyword" },
    { id: 4, title: "4. 발화빈도", data: AiSummaryData?.frequency, field: "frequency" },
    { id: 5, title: "5. 스트레스 징후", data: AiSummaryData?.stress, field: "stress" }
  ];

  // 현재 스텝에 따른 dislikeFind 조회 키 매핑
  const getCurrentFieldKeys = () => {
    const targetStepId = typeof skipTargetStep === 'number' ? skipTargetStep : currentStep;
    switch (targetStepId) {
      case 1: // 상담 요약
        return { codeKey: 'counselingSummaryCode', textKey: 'counselingSummaryAi' };
      case 2: // 고민주제
        return { codeKey: 'concernTopicCode', textKey: 'concernTopicAi' };
      case 3: // 키워드 분석
        return { codeKey: 'keywordAnalysisCode', textKey: 'keywordAnalysisText' };
      case 4: // 발화빈도 (스펙 미확인으로 조회 키 미전달)
        return null;
      case 5: // 스트레스 징후
        return { codeKey: 'stressIndicatorsCode', textKey: 'stressIndicatorsText' };
      default:
        return null;
    }
  };
  
  // 단계별 데이터 존재 여부 확인 (rawMngData 기준으로 확인)
  const hasStepData = (step) => {
    const raw = AiSummaryData?.rawMngData;
    switch (step.field) {
      case "summary":
        return !!(raw?.counselingSummaryAi || raw?.counselingSummaryText || AiSummaryData?.summary);
      case "issue":
        return !!(raw?.concernTopicAi || raw?.concernTopicText || AiSummaryData?.issue);
      case "keyword":
        return (
          (Array.isArray(raw?.parsedKeyword) && raw.parsedKeyword.length > 0) ||
          (Array.isArray(AiSummaryData?.keyword) && AiSummaryData.keyword.length > 0)
        );
      case "frequency":
        return (
          (raw?.parsedFrequency && ((raw.parsedFrequency.counselor?.minutes > 0) || (raw.parsedFrequency.client?.minutes > 0))) ||
          (AiSummaryData?.frequency && (AiSummaryData.frequency.counselor?.minutes > 0 || AiSummaryData.frequency.client?.minutes > 0))
        );
      case "stress":
        return (
          (raw?.parsedStress && Array.isArray(raw.parsedStress.data) && raw.parsedStress.data.length > 0) ||
          (Array.isArray(AiSummaryData?.stress?.data) && AiSummaryData.stress.data.length > 0)
        );
      default:
        return false;
    }
  };
  
  // 확정하기 핸들러 (특정 스텝을 지정할 수 있도록 개선)
  const handleConfirm = (targetStepId) => {
    const stepId = typeof targetStepId === 'number' ? targetStepId : currentStep;
    const currentStepData = steps.find(step => step.id === stepId);
    if (currentStepData && hasStepData(currentStepData) && onConfirmCallback) {
      // rawMngData에서 해당 단계의 실제 데이터 가져오기
      let stepData;
      switch (currentStepData.field) {
        case "summary": {
          const src = AiSummaryData.rawMngData?.counselingSummaryAi || AiSummaryData.summary || AiSummaryData.rawMngData?.counselingSummaryText || '';
          const { answer, feedback } = extractTextParts(src);
          stepData = [answer, feedback].filter(Boolean).join('\n\n');
          break;
        }
        case "issue": {
          const src = AiSummaryData.rawMngData?.concernTopicAi || AiSummaryData.issue || AiSummaryData.rawMngData?.concernTopicText || '';
          const { answer, feedback } = extractTextParts(src);
          stepData = [answer, feedback].filter(Boolean).join('\n\n');
          break;
        }
        case "keyword":
          stepData = AiSummaryData.rawMngData?.parsedKeyword || AiSummaryData.keyword || [];
          break;
        case "frequency":
          stepData = AiSummaryData.rawMngData?.parsedFrequency || AiSummaryData.frequency || { counselor: { minutes: 0 }, client: { minutes: 0 } };
          break;
        case "stress":
          stepData = AiSummaryData.rawMngData?.parsedStress || AiSummaryData.stress || { data: [], labels: [] };
          break;
        default:
          stepData = currentStepData.data;
      }
      
      // 콜백을 통해 AiAnalysis 데이터 업데이트
      onConfirmCallback(currentStepData.field, stepData);
      // 사용자 피드백
      if (typeof showToastMessage === 'function') {
        showToastMessage('AI 생성 내용이 반영되었습니다.');
      }
      
      // 확정 후에는 항상 패널을 닫음 (요청사항)
      onClose();
      return;
    }
    // 데이터가 없을 경우 안내
    if (typeof showToastMessage === 'function') {
      showToastMessage('반영할 수 있는 데이터가 없습니다.');
    }
  };
  
  // 생략하기 핸들러
  const handleSkip = async (reasonCode, reasonText) => {
    try {
      const targetStepId = typeof skipTargetStep === 'number' ? skipTargetStep : currentStep;
      const currentStepData = steps.find(step => step.id === targetStepId);
      if (sessionSeq && currentStepData) {
        // 로딩 상태 진입
        setPanelStatus('creating');
        const params = { sessionSeq: parseInt(sessionSeq) };
        switch (currentStepData.field) {
          case 'summary':
            if (reasonCode != null && reasonCode !== '') params.counselingSummaryCode = reasonCode;
            if (reasonText != null && reasonText !== '') params.counselingSummaryText = reasonText;
            break;
          case 'issue':
            if (reasonCode != null && reasonCode !== '') params.concernTopicCode = reasonCode;
            if (reasonText != null && reasonText !== '') params.concernTopicText = reasonText;
            break;
          case 'keyword':
            if (reasonCode != null && reasonCode !== '') params.keywordAnalysisCode = reasonCode;
            if (reasonText != null && reasonText !== '') params.keywordAnalysisText = reasonText;
            break;
          case 'frequency':
            // 서버 스펙 미확인: 발화빈도는 생략 피드백 전송을 건너뜀
            break;
          case 'stress':
            if (reasonCode != null && reasonCode !== '') params.stressIndicatorsCode = reasonCode;
            if (reasonText != null && reasonText !== '') params.stressIndicatorsText = reasonText;
            break;
          default:
            break;
        }

        // 매핑된 파라미터가 존재하는 경우에만 호출 (sessionSeq 외 추가 필드 존재 여부 확인)
        if (Object.keys(params).length > 1) {
          const response = await dislikeUpdate(params);
          if (response?.code === 200) {
            if (typeof showToastMessage === 'function') {
              showToastMessage('피드백이 전송되었습니다.');
            }
            // 성공 시 패널 닫기 (다음 스텝 이동하지 않음)
            onClose();
            return;
          } else {
            if (typeof showToastMessage === 'function') {
              showToastMessage('피드백 전송에 실패했습니다.');
            }
          }
        } else {
          // 전송할 매핑이 없을 때 안내
          if (typeof showToastMessage === 'function') {
            showToastMessage('전송할 피드백 항목이 없습니다.');
          }
        }
      }
    } catch (error) {
      console.error('생략 사유 전송 실패:', error);
      if (typeof showToastMessage === 'function') {
        showToastMessage('피드백 전송 중 오류가 발생했습니다.');
      }
    } finally {
      // 실패/미전송 시 상태 복구
      setPanelStatus('complete');
      // 생략 대상 초기화
      setSkipTargetStep(null);
    }
  };
  
  // 스텝별 생략 UI 트리거를 위한 토큰 상태 (값이 변경되면 열림)
  const [skipTriggerToken, setSkipTriggerToken] = useState(0);
  // 생략 대상을 지정하기 위한 별도 상태 (현재 화면에 보이는 스텝과 무관하게 생략 UI를 열기 위함)
  const [skipTargetStep, setSkipTargetStep] = useState(null);

  const openSkipForStep = (stepId) => {
    // 현재 렌더링 단계는 유지하고, 생략 대상만 지정하여 하위 항목이 사라지지 않도록 함
    setSkipTargetStep(stepId);
    setSkipTriggerToken(prev => prev + 1);
  };

  const confirmForStep = (stepId) => {
    handleConfirm(stepId);
  };

  // 섹션별 버튼 툴팁 상태
  const [hoverSkipStep, setHoverSkipStep] = useState(null);
  const [hoverConfirmStep, setHoverConfirmStep] = useState(null);

  // 스텝별 '생략 사유' 포털 앵커 관리
  const skipAnchorRefs = useRef({});
  const setSkipAnchorRef = useCallback((stepId, el) => {
    if (el && skipAnchorRefs.current[stepId] !== el) {
      skipAnchorRefs.current[stepId] = el;
    } else if (!el && skipAnchorRefs.current[stepId]) {
      delete skipAnchorRefs.current[stepId];
    }
  }, []);

  // 개별 스텝 렌더링 함수 (메모이제이션으로 불필요한 리렌더링 방지)
  const renderStep = useCallback((stepId) => {
    const stepData = steps.find(step => step.id === stepId);
    if (!stepData) return null;
    const hasData = hasStepData(stepData);
    
    switch (stepId) {
      case 1: // 상담 요약
        return (
          <React.Fragment key={`step-${stepId}`}>
            <div className="complete-tit">
              <strong>1. 상담 요약</strong>
            </div>
            {hasData ? (
              <div className="complete-cont">
                {(() => {
                  const src = AiSummaryData.rawMngData?.counselingSummaryAi || AiSummaryData.summary || AiSummaryData.rawMngData?.counselingSummaryText;
                  const { answer, feedback } = extractTextParts(src);
                  if (!answer && !feedback) {
                    return <div className="">데이터가 없습니다.</div>;
                  }
                  return (
                    <div className="ai-generated-content">
                      {(answer || feedback) && (
                        <div className="ai-answer">
                          {answer}
                          {feedback && (
                            <>
                              <br />
                              <br />
                              {feedback}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="complete-cont">
                <div className="">데이터가 없습니다.</div>
              </div>
            )}
            <div className="btn-wrap">
              <div className="tooltip-wrap">
                <button
                  className="type04 skip-btn"
                  type="button"
                  onClick={() => openSkipForStep(stepId)}
                  onMouseEnter={() => setHoverSkipStep(stepId)}
                  onMouseLeave={() => setHoverSkipStep(null)}
                >생략하기</button>
                <div className={`tooltip${hoverSkipStep === stepId ? " show" : ""}`}>
                  결과가 정확하지 않거나 적절하지 않은 경우에는<br />생략하기를 선택 할 수 있어요.
                </div>
              </div>
              <div className="tooltip-wrap">
                <button
                  className="type09"
                  type="button"
                  onClick={() => confirmForStep(stepId)}
                  onMouseEnter={() => setHoverConfirmStep(stepId)}
                  onMouseLeave={() => setHoverConfirmStep(null)}
                >확정하기</button>
                <div className={`tooltip${hoverConfirmStep === stepId ? " show" : ""}`}>
                  <p>적절한 분석인 경우에는 확정하기를 통해<br />본문에 반영 할 수 있어요.<br /></p>
                  <p>약간의 수정이 필요한 경우에는 <br />확정하기 후 수정이 가능해요.</p>
                </div>
              </div>
            </div>
            <div className="skip-reason-anchor" ref={(el) => setSkipAnchorRef(stepId, el)} />
          </React.Fragment>
        );
        
      case 2: // 고민주제
        return (
          <React.Fragment key={`step-${stepId}`}>
            <div className="complete-tit">
              <strong>2. 고민주제</strong>
            </div>
            {hasData ? (
              <div className="complete-cont">
                {(() => {
                  const src = AiSummaryData.rawMngData?.concernTopicAi || AiSummaryData.issue || AiSummaryData.rawMngData?.concernTopicText;
                  const { answer, feedback } = extractTextParts(src);
                  if (!answer && !feedback) {
                    return <div className="">데이터가 없습니다.</div>;
                  }
                  return (
                    <div className="ai-generated-content">
                      {(answer || feedback) && (
                        <div className="ai-answer">
                          {answer}
                          {feedback && (
                            <>
                              <br />
                              <br />
                              {feedback}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="complete-cont">
                <div className="">데이터가 없습니다.</div>
              </div>
            )}
            <div className="btn-wrap">
              <div className="tooltip-wrap">
                <button
                  className="type04 skip-btn"
                  type="button"
                  onClick={() => openSkipForStep(stepId)}
                  onMouseEnter={() => setHoverSkipStep(stepId)}
                  onMouseLeave={() => setHoverSkipStep(null)}
                >생략하기</button>
                <div className={`tooltip${hoverSkipStep === stepId ? " show" : ""}`}>
                  결과가 정확하지 않거나 적절하지 않은 경우에는<br />생략하기를 선택 할 수 있어요.
                </div>
              </div>
              <div className="tooltip-wrap">
                <button
                  className="type09"
                  type="button"
                  onClick={() => confirmForStep(stepId)}
                  onMouseEnter={() => setHoverConfirmStep(stepId)}
                  onMouseLeave={() => setHoverConfirmStep(null)}
                >확정하기</button>
                <div className={`tooltip${hoverConfirmStep === stepId ? " show" : ""}`}>
                  <p>적절한 분석인 경우에는 확정하기를 통해<br />본문에 반영 할 수 있어요.<br /></p>
                  <p>약간의 수정이 필요한 경우에는 <br />확정하기 후 수정이 가능해요.</p>
                </div>
              </div>
            </div>
            <div className="skip-reason-anchor" ref={(el) => setSkipAnchorRef(stepId, el)} />
          </React.Fragment>
        );
        
      case 3: // 키워드 분석
        return (
          <React.Fragment key={`step-${stepId}`}>
            <div className="complete-tit"><strong>3. 키워드 분석</strong></div>
            {hasData ? (
              <div className="complete-cont visual-wrap">
                <KeywordBubblePack data={AiSummaryData.rawMngData?.parsedKeyword || AiSummaryData.keyword} />
              </div>
            ) : (
              <div className="complete-cont">
                <div className="">데이터가 없습니다.</div>
              </div>
            )}
            <div className="btn-wrap">
              <div className="tooltip-wrap">
                <button
                  className="type04 skip-btn"
                  type="button"
                  onClick={() => openSkipForStep(stepId)}
                  onMouseEnter={() => setHoverSkipStep(stepId)}
                  onMouseLeave={() => setHoverSkipStep(null)}
                >생략하기</button>
                <div className={`tooltip${hoverSkipStep === stepId ? " show" : ""}`}>
                  결과가 정확하지 않거나 적절하지 않은 경우에는<br />생략하기를 선택 할 수 있어요.
                </div>
              </div>
              <div className="tooltip-wrap">
                <button
                  className="type09"
                  type="button"
                  onClick={() => confirmForStep(stepId)}
                  onMouseEnter={() => setHoverConfirmStep(stepId)}
                  onMouseLeave={() => setHoverConfirmStep(null)}
                >확정하기</button>
                <div className={`tooltip${hoverConfirmStep === stepId ? " show" : ""}`}>
                  <p>적절한 분석인 경우에는 확정하기를 통해<br />본문에 반영 할 수 있어요.<br /></p>
                  <p>약간의 수정이 필요한 경우에는 <br />확정하기 후 수정이 가능해요.</p>
                </div>
              </div>
            </div>
            <div className="skip-reason-anchor" ref={(el) => setSkipAnchorRef(stepId, el)} />
          </React.Fragment>
        );
        
      case 4: // 발화빈도
        return (
          <React.Fragment key={`step-${stepId}`}>
            <div className="complete-tit"><strong>4. 발화빈도</strong></div>
            {hasData ? (
              <div className="complete-cont visual-wrap">
                <FrequencyBox data={AiSummaryData.rawMngData?.parsedFrequency || AiSummaryData.frequency} isPanel={true} />
              </div>
            ) : (
              <div className="complete-cont">
                <div className="">데이터가 없습니다.</div>
              </div>
            )}
            <div className="btn-wrap">
              <div className="tooltip-wrap">
                <button
                  className="type04 skip-btn"
                  type="button"
                  onClick={() => openSkipForStep(stepId)}
                  onMouseEnter={() => setHoverSkipStep(stepId)}
                  onMouseLeave={() => setHoverSkipStep(null)}
                >생략하기</button>
                <div className={`tooltip${hoverSkipStep === stepId ? " show" : ""}`}>
                  결과가 정확하지 않거나 적절하지 않은 경우에는<br />생략하기를 선택 할 수 있어요.
                </div>
              </div>
              <div className="tooltip-wrap">
                <button
                  className="type09"
                  type="button"
                  onClick={() => confirmForStep(stepId)}
                  onMouseEnter={() => setHoverConfirmStep(stepId)}
                  onMouseLeave={() => setHoverConfirmStep(null)}
                >확정하기</button>
                <div className={`tooltip${hoverConfirmStep === stepId ? " show" : ""}`}>
                  <p>적절한 분석인 경우에는 확정하기를 통해<br />본문에 반영 할 수 있어요.<br /></p>
                  <p>약간의 수정이 필요한 경우에는 <br />확정하기 후 수정이 가능해요.</p>
                </div>
              </div>
            </div>
            <div className="skip-reason-anchor" ref={(el) => setSkipAnchorRef(stepId, el)} />
          </React.Fragment>
        );
        
      case 5: // 스트레스 징후
        return (
          <React.Fragment key={`step-${stepId}`}>
            <div className="complete-tit"><strong>5. 스트레스 징후</strong></div>
            {hasData ? (
              <div className="complete-cont visual-wrap">
                <StressBoxSmall data={AiSummaryData.rawMngData?.parsedStress?.data || AiSummaryData.stress?.data} labels={AiSummaryData.rawMngData?.parsedStress?.labels || AiSummaryData.stress?.labels} />
                <div className="chart-data">
                  <span>최고10점</span>/<span>25.12</span>
                </div>
              </div>
            ) : (
              <div className="complete-cont">
                <div className="">데이터가 없습니다.</div>
              </div>
            )}
            <div className="btn-wrap">
              <div className="tooltip-wrap">
                <button
                  className="type04 skip-btn"
                  type="button"
                  onClick={() => openSkipForStep(stepId)}
                  onMouseEnter={() => setHoverSkipStep(stepId)}
                  onMouseLeave={() => setHoverSkipStep(null)}
                >생략하기</button>
                <div className={`tooltip${hoverSkipStep === stepId ? " show" : ""}`}>
                  결과가 정확하지 않거나 적절하지 않은 경우에는<br />생략하기를 선택 할 수 있어요.
                </div>
              </div>
              <div className="tooltip-wrap">
                <button
                  className="type09"
                  type="button"
                  onClick={() => confirmForStep(stepId)}
                  onMouseEnter={() => setHoverConfirmStep(stepId)}
                  onMouseLeave={() => setHoverConfirmStep(null)}
                >확정하기</button>
                <div className={`tooltip${hoverConfirmStep === stepId ? " show" : ""}`}>
                  <p>적절한 분석인 경우에는 확정하기를 통해<br />본문에 반영 할 수 있어요.<br /></p>
                  <p>약간의 수정이 필요한 경우에는 <br />확정하기 후 수정이 가능해요.</p>
                </div>
              </div>
            </div>
            <div className="skip-reason-anchor" ref={(el) => setSkipAnchorRef(stepId, el)} />
          </React.Fragment>
        );
        
      default:
        return null;
    }
  }, [AiSummaryData, hoverSkipStep, hoverConfirmStep, setSkipAnchorRef, currentStep]);

  // 현재 단계까지의 누적 UI 렌더링
  const renderCurrentStep = () => {
    // 데이터 유무와 상관없이 1~현재 스텝까지 모두 렌더링
    const stepsToRender = [];
    for (let i = 1; i <= currentStep; i++) {
      const stepData = steps.find(step => step.id === i);
      if (!stepData) continue;
      const stepElement = renderStep(i);
      if (stepElement) stepsToRender.push(stepElement);
    }
    if (stepsToRender.length === 0) {
      return <div className="complete-cont">해당 데이터가 없습니다.</div>;
    }
    return <>{stepsToRender}</>;
  };

  // 패널이 열릴 때 시작 스텝 설정 (기본 1단계)
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (open) {
      const start = Number(initialStep) || 1;
      setCurrentStep(start);
      setInitialized(true);
      // 패널이 열릴 때 표시 상태를 complete로 맞춰 결과 영역과 버튼이 보이도록 함
      setPanelStatus('complete');
    } else {
      setInitialized(false);
    }
  }, [open, initialStep]);
  
  return (
    <AiPanelCommon
      open={open}
      onClose={onClose}
      status={panelStatus}
      title="녹취록 AI 분석"
      infoMessage={"AI 분석 자료가 생성 완료되었습니다.<br/>녹취록 AI 분석을 통해 상담 업무 도움을 받을 수 있어요."}
      description="상담 녹취록을 바탕으로 AI가 생성한 내용입니다."
      keyInfo={true}
      renderComplete={renderCurrentStep}
      onConfirm={handleConfirm}
      onSkip={handleSkip}
      sessionSeq={sessionSeq}
      currentFieldKeys={initialized ? getCurrentFieldKeys() : null}
      openSkipTrigger={skipTriggerToken}
      hideBottomActions={true}
      skipAnchorEl={skipAnchorRefs.current[(typeof skipTargetStep === 'number' ? skipTargetStep : currentStep)]}
    />
  );
}

export default AiTranscriptPanel;
