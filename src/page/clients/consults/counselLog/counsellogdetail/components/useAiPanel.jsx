import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { supportPanelState } from '@/recoil';
import { dislikeUpdate } from '@/api/apiCaller';

export const useAiPanel = (sessionSeq, showToastMessage) => {
  const [aiPanelKey, setAiPanelKey] = useState(null);
  const [openedPanel, setOpenedPanel] = useState(null);
  const [aiGeneratedData, setAiGeneratedData] = useState({
    nextPlan: null,
    mainProblem: null,
    sessionContent: null
  });
  const setSupportPanel = useSetRecoilState(supportPanelState);

  // AI Panel 동적 설정 생성
  const getAiPanelConfigs = () => ({
    mainProblem: {
      title: '주호소 문제 AI 생성',
      infoMessage: '주호소 문제의 내용이 생성 완료되었습니다.',
      renderComplete: () => {
        if (aiGeneratedData.mainProblem?.llm_answer) {
          return (
            <div className="complete-cont">
              <div className="ai-generated-content">
                <div className="ai-answer" style={{ whiteSpace: 'pre-wrap' }}>
                  {aiGeneratedData.mainProblem.llm_answer}
                </div>
                {/* llm_feedback은 추후 사용 예정
                <br/>
                {aiGeneratedData.mainProblem.llm_feedback && (
                  <div className="ai-feedback" style={{ whiteSpace: 'pre-wrap' }}>
                    {aiGeneratedData.mainProblem.llm_feedback}
                  </div>
                )}
                */}
              </div>
            </div>
          );
        }
        return (
          <div className="complete-cont">
            -
          </div>
        );
      }
    },
    sessionContent: {
      title: '상담내용 AI 생성',
      infoMessage: '상담내용이 생성 완료되었습니다.',
      renderComplete: () => {
        if (aiGeneratedData.sessionContent?.llm_answer) {
          return (
            <div className="complete-cont">
              <div className="ai-generated-content">
                <div className="ai-answer" style={{ whiteSpace: 'pre-wrap' }}>
                  {aiGeneratedData.sessionContent.llm_answer}
                </div>
                {/* llm_feedback은 추후 사용 예정
                <br/>
                {aiGeneratedData.sessionContent.llm_feedback && (
                  <div className="ai-feedback" style={{ whiteSpace: 'pre-wrap' }}>
                    {aiGeneratedData.sessionContent.llm_feedback}
                  </div>
                )}
                */}
              </div>
            </div>
          );
        }
        return (
          <div className="complete-cont">
            -
          </div>
        );
      }
    },
    nextPlan: {
      title: '다음 상담 계획 AI 생성',
      infoMessage: '다음 상담 계획이 생성 완료되었습니다.',
      renderComplete: () => {
        if (aiGeneratedData.nextPlan?.llm_answer) {
          return (
            <div className="complete-cont">
              <div className="ai-generated-content">
                <div className="ai-answer">
                  {aiGeneratedData.nextPlan.llm_answer}
                </div>
                {/* llm_feedback은 추후 사용 예정
                <br/>
                {aiGeneratedData.nextPlan.llm_feedback && (
                  <div>{aiGeneratedData.nextPlan.llm_feedback}</div>
                )}
                */}
              </div>
            </div>
          );
        }
        return (
          <div className="complete-cont">
            -
          </div>
        );
      }
    }
  });

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

  // AI 패널 확정하기 콜백
  const handleAiConfirm = (setNextPlan, setMainProblem, setSessionContent) => {
    if (aiPanelKey === 'nextPlan' && aiGeneratedData.nextPlan?.llm_answer) {
      // 다음 상담 계획 텍스트를 nextPlan 상태에 반영 (llm_answer만 사용)
      let content = aiGeneratedData.nextPlan.llm_answer;
      // llm_feedback은 추후 사용 예정
      // if (aiGeneratedData.nextPlan.llm_feedback) {
      //   content += '\n' + aiGeneratedData.nextPlan.llm_feedback;
      // }
      setNextPlan(content);
      showToastMessage('AI 생성 내용이 반영되었습니다.');
      handleClosePanel();
    } else if (aiPanelKey === 'mainProblem' && aiGeneratedData.mainProblem?.llm_answer) {
      // 주호소 문제 텍스트를 mainProblem 상태에 반영 (llm_answer만 사용)
      let content = aiGeneratedData.mainProblem.llm_answer;
      // llm_feedback은 추후 사용 예정
      // if (aiGeneratedData.mainProblem.llm_feedback) {
      //   content += '\n' + aiGeneratedData.mainProblem.llm_feedback;
      // }
      setMainProblem(content);
      showToastMessage('AI 생성 내용이 반영되었습니다.');
      handleClosePanel();
    } else if (aiPanelKey === 'sessionContent' && aiGeneratedData.sessionContent?.llm_answer) {
      // 상담내용 텍스트를 sessionContent 상태에 반영 (llm_answer만 사용)
      let content = aiGeneratedData.sessionContent.llm_answer;
      // llm_feedback은 추후 사용 예정
      // if (aiGeneratedData.sessionContent.llm_feedback) {
      //   content += '\n' + aiGeneratedData.sessionContent.llm_feedback;
      // }
      setSessionContent(content);
      showToastMessage('AI 생성 내용이 반영되었습니다.');
      handleClosePanel();
    }
  };

  // AI 패널 생략하기 콜백
  const handleAiSkip = async (nextSessionPlanCode, nextSessionPlanText, chiefComplaintCode, chiefComplaintText, sessionSummaryCode, sessionSummaryText) => {
    if (!sessionSeq) {
      showToastMessage('세션 정보가 없습니다.');
      return;
    }

    try {
      let params = {
        sessionSeq: sessionSeq
      };

      // 패널 타입에 따라 파라미터 설정
      if (aiPanelKey === 'nextPlan') {
        if (nextSessionPlanCode != null && nextSessionPlanCode !== '') {
          params.nextSessionPlanCode = nextSessionPlanCode;
        }
        if (nextSessionPlanText != null && nextSessionPlanText !== '') {
          params.nextSessionPlanText = nextSessionPlanText;
        }
      } else if (aiPanelKey === 'mainProblem') {
        if (chiefComplaintCode != null && chiefComplaintCode !== '') {
          params.chiefComplaintCode = chiefComplaintCode;
        }
        if (chiefComplaintText != null && chiefComplaintText !== '') {
          params.chiefComplaintText = chiefComplaintText;
        }
      } else if (aiPanelKey === 'sessionContent') {
        if (sessionSummaryCode != null && sessionSummaryCode !== '') {
          params.sessionSummaryCode = sessionSummaryCode;
        }
        if (sessionSummaryText != null && sessionSummaryText !== '') {
          params.sessionSummaryText = sessionSummaryText;
        }
      }

      const response = await dislikeUpdate(params);
      if (response.code === 200) {
        showToastMessage('피드백이 전송되었습니다.');
        handleClosePanel();
      } else {
        showToastMessage('피드백 전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('dislikeUpdate 오류:', error);
      showToastMessage('피드백 전송 중 오류가 발생했습니다.');
    }
  };

  return {
    aiPanelKey,
    openedPanel,
    aiGeneratedData,
    setAiGeneratedData,
    getAiPanelConfigs,
    handleOpenAiPanel,
    handleClosePanel,
    handleAiConfirm,
    handleAiSkip,
    setOpenedPanel
  };
};
