import React, { useEffect, useState, useRef } from "react";
import AiPanelCommon from "@/components/AiPanelCommon";
import { dislikeUpdate } from '@/api/apiCaller';

function AiTranscriptPanel({ open, onClose, status = "creating", AiSummaryData, sessionSeq, onConfirm: onConfirmCallback, showToastMessage, panelType = "summary" }) {
  // 패널 표시 상태(loading/complete 등) 관리
  const [panelStatus, setPanelStatus] = useState(status);
  // 오픈시 로딩 타이머
  const openTimerRef = useRef(null);

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

  // 패널 타입에 따른 데이터 설정
  const panelConfig = {
    summary: { title: "1. 상담 요약", field: "summary", data: AiSummaryData?.summary },
    issue: { title: "2. 고민주제", field: "issue", data: AiSummaryData?.issue }
  };
  
  const currentPanel = panelConfig[panelType] || panelConfig.summary;

  // 패널 타입에 따른 dislikeFind 조회 키 매핑
  const getCurrentFieldKeys = () => {
    switch (panelType) {
      case 'summary':
        return { codeKey: 'counselingSummaryCode', textKey: 'counselingSummaryText' };
      case 'issue':
        return { codeKey: 'concernTopicCode', textKey: 'concernTopicText' };
      default:
        return null;
    }
  };
  
  // 현재 패널 데이터 존재 여부 확인
  const hasCurrentPanelData = () => {
    const raw = AiSummaryData?.rawMngData;
    switch (panelType) {
      case "summary":
        return !!(raw?.counselingSummaryAi || raw?.counselingSummaryText || AiSummaryData?.summary);
      case "issue":
        return !!(raw?.concernTopicAi || raw?.concernTopicText || AiSummaryData?.issue);
      default:
        return false;
    }
  };
  
  // 확정하기 핸들러
  const handleConfirm = () => {
    if (hasCurrentPanelData() && onConfirmCallback) {
      // rawMngData에서 해당 패널의 실제 데이터 가져오기
      let stepData;
      switch (panelType) {
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
        default:
          stepData = currentPanel.data;
      }
      
      // 콜백을 통해 AiAnalysis 데이터 업데이트
      onConfirmCallback(currentPanel.field, stepData);
      // 사용자 피드백
      if (typeof showToastMessage === 'function') {
        showToastMessage('AI 생성 내용이 반영되었습니다.');
      }
      
      // 확정 후에는 항상 패널을 닫음
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
      if (sessionSeq) {
        // 로딩 상태 진입
        setPanelStatus('creating');
        const params = { sessionSeq: parseInt(sessionSeq) };
        switch (panelType) {
          case 'summary':
            if (reasonCode != null && reasonCode !== '') params.counselingSummaryCode = reasonCode;
            if (reasonText != null && reasonText !== '') params.counselingSummaryText = reasonText;
            break;
          case 'issue':
            if (reasonCode != null && reasonCode !== '') params.concernTopicCode = reasonCode;
            if (reasonText != null && reasonText !== '') params.concernTopicText = reasonText;
            break;
          default:
            break;
        }

        // 매핑된 파라미터가 존재하는 경우에만 호출
        if (Object.keys(params).length > 1) {
          const response = await dislikeUpdate(params);
          if (response?.code === 200) {
            if (typeof showToastMessage === 'function') {
              showToastMessage('피드백이 전송되었습니다.');
            }
            onClose();
            return;
          } else {
            if (typeof showToastMessage === 'function') {
              showToastMessage('피드백 전송에 실패했습니다.');
            }
          }
        } else {
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
      setPanelStatus('complete');
    }
  };
  
  // 생략 UI 트리거를 위한 토큰 상태
  const [skipTriggerToken, setSkipTriggerToken] = useState(0);

  const openSkip = () => {
    setSkipTriggerToken(prev => prev + 1);
  };

  // 버튼 툴팁 상태
  const [hoverSkip, setHoverSkip] = useState(false);
  const [hoverConfirm, setHoverConfirm] = useState(false);

  // '생략 사유' 포털 앵커 관리
  const skipAnchorRef = useRef(null);

  // 현재 패널 렌더링 함수
  const renderCurrentPanel = () => {
    const hasData = hasCurrentPanelData();
    
    return (
      <React.Fragment>
        <div className="complete-tit">
          <strong>{currentPanel.title}</strong>
        </div>
        {hasData ? (
          <div className="complete-cont">
            {(() => {
              let src;
              switch (panelType) {
                case 'summary':
                  src = AiSummaryData.rawMngData?.counselingSummaryAi || AiSummaryData.summary || AiSummaryData.rawMngData?.counselingSummaryText;
                  break;
                case 'issue':
                  src = AiSummaryData.rawMngData?.concernTopicAi || AiSummaryData.issue || AiSummaryData.rawMngData?.concernTopicText;
                  break;
                default:
                  src = '';
              }
              
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
              onClick={openSkip}
              onMouseEnter={() => setHoverSkip(true)}
              onMouseLeave={() => setHoverSkip(false)}
            >생략하기</button>
            <div className={`tooltip${hoverSkip ? " show" : ""}`}>
              결과가 정확하지 않거나 적절하지 않은 경우에는<br />생략하기를 선택 할 수 있어요.
            </div>
          </div>
          <div className="tooltip-wrap">
            <button
              className="type09"
              type="button"
              onClick={handleConfirm}
              onMouseEnter={() => setHoverConfirm(true)}
              onMouseLeave={() => setHoverConfirm(false)}
            >확정하기</button>
            <div className={`tooltip${hoverConfirm ? " show" : ""}`}>
              <p>적절한 분석인 경우에는 확정하기를 통해<br />본문에 반영 할 수 있어요.<br /></p>
              <p>약간의 수정이 필요한 경우에는 <br />확정하기 후 수정이 가능해요.</p>
            </div>
          </div>
        </div>
        <div className="skip-reason-anchor" ref={skipAnchorRef} />
      </React.Fragment>
    );
  };

  // 패널 오픈 시마다 2초 로딩 처리
  useEffect(() => {
    if (open) {
      setPanelStatus('creating');
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      openTimerRef.current = setTimeout(() => {
        setPanelStatus('complete');
        openTimerRef.current = null;
      }, 2000);
    } else {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
        openTimerRef.current = null;
      }
      setPanelStatus('complete');
    }
    return () => {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
        openTimerRef.current = null;
      }
    };
  }, [open]);
  
  return (
    <AiPanelCommon
      open={open}
      onClose={onClose}
      status={panelStatus}
      title="녹취록 AI 분석"
      infoMessage={"AI 분석 자료가 생성 완료되었습니다.<br/>녹취록 AI 분석을 통해 상담 업무 도움을 받을 수 있어요."}
      description="상담 녹취록을 바탕으로 AI가 생성한 내용입니다."
      keyInfo={true}
      renderComplete={renderCurrentPanel}
      onConfirm={handleConfirm}
      onSkip={handleSkip}
      sessionSeq={sessionSeq}
      currentFieldKeys={getCurrentFieldKeys()}
      openSkipTrigger={skipTriggerToken}
      hideBottomActions={true}
      skipAnchorEl={skipAnchorRef.current}
    />
  );
}

export default AiTranscriptPanel;
