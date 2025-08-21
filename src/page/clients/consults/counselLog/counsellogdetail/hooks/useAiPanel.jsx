import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { supportPanelState } from '@/recoil';
import { dislikeUpdate } from '@/api/apiCaller';

export const useAiPanel = (sessionSeq, showToastMessage) => {
  const [aiPanelKey, setAiPanelKey] = useState(null);
  const [openedPanel, setOpenedPanel] = useState(null);
  const [aiGeneratedData, setAiGeneratedData] = useState({
    nextPlan: null
  });
  const setSupportPanel = useSetRecoilState(supportPanelState);

  // AI Panel 동적 설정 생성
  const getAiPanelConfigs = () => ({
    mainProblem: {
      title: '주호소 문제 AI 생성',
      infoMessage: '주호소 문제의 내용이 생성 완료되었습니다.',
      renderComplete: () => (
        <div className="complete-cont">
          <div className="bullet-line">최근 업무에 대한 자신감 저하와 대인관계 스트레스로 인해 불면과 식욕 저하가 지속되고 있음.</div>
          <div className="bullet-line">상사의 평가에 민감하게 반응하며, "나는 늘 부족하다"는 생각에서 벗어나지 못함.</div>
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
      renderComplete: () => {
        if (aiGeneratedData.nextPlan?.llm_answer) {
          return (
            <div className="complete-cont">
              <div className="ai-generated-content">
                <div className="ai-answer">
                  {aiGeneratedData.nextPlan.llm_answer}
                </div>
                <br/>
                {aiGeneratedData.nextPlan.llm_feedback && (
                  <div>{aiGeneratedData.nextPlan.llm_feedback}</div>
                )}
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
  const handleAiConfirm = (setNextPlan) => {
    if (aiPanelKey === 'nextPlan' && aiGeneratedData.nextPlan?.llm_answer) {
      // 차회기 상담 계획 텍스트를 nextPlan 상태에 반영
      setNextPlan(aiGeneratedData.nextPlan.llm_answer);
      showToastMessage('AI 생성 내용이 반영되었습니다.');
      handleClosePanel();
    }
  };

  // AI 패널 생략하기 콜백
  const handleAiSkip = async (nextSessionPlanCode, nextSessionPlanText) => {
    if (!sessionSeq) {
      showToastMessage('세션 정보가 없습니다.');
      return;
    }

    try {
      const params = {
        sessionSeq: sessionSeq,
        nextSessionPlanCode,
        nextSessionPlanText
      };

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
