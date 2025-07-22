import React from 'react';
import emptyFace from '@/assets/images/common/empty_face.svg';
import SymptomChangePanel from './components/SymptomChangePanel';

function PsychologicalTest({ onOpenSurveySendModal }) {
  // 상태(추후 props/상태관리로 대체)
  const hasSurveyData = true; // 심리검사 데이터 유무
  const isAIGenerated = true; // AI 종합 의견 생성 여부

  return (
    <div className="inner">
      {/* 데이터 없음(empty) */}
      {!hasSurveyData && (
        <div className="empty-board">
          <img src={emptyFace} alt="empty" />
          <p className="empty-info">아직 전송된 심리 검사지가 없어요.<br />내담자에게 필요한 심리 검사지를 전송해보세요.</p>
          <button className="type05" type="button" onClick={onOpenSurveySendModal}>심리검사지 전송</button>
        </div>
      )}
      {/* 데이터만 있고 AI 미생성 */}
      {hasSurveyData && !isAIGenerated && (
        <div className="total-opinion create">
          <div className="tit-wrap">
            <strong>AI 종합 의견</strong>
          </div>
          <div className="create-board">
            <strong>AI가 실시된 심리검사 종합 의견을 생성할 준비가 되었습니다.</strong>
            <button className="type01 h40" type="button">
              <span>AI 생성하기</span>
            </button>
          </div>
        </div>
      )}
      {/* 데이터+AI 생성 */}
      {hasSurveyData && isAIGenerated && (
        <>
          <div className="total-opinion">
            <div className="tit-wrap">
              <strong>AI 종합 의견</strong>
              <button className="type01 h40" type="button">
                <span>AI 생성하기</span>
              </button>
            </div>
            <div className="txt-box">
              <div>지난 1,2 회기 보다 우울 점수가 올라 상담사의 주의 깊은 관심이 필요합니다. 7회기 문항 [Q. 죽음에 대해 생각해 보신 적이 있습니까?] 에서 5점을 선택했기 때문에 ‘자살’과 관련된 적극적인 개입이 필요합니다.</div>
              <br />
              <strong>추천방법</strong>
              <div className="bullet-line">증상이 심화되지 않도록 마음 챙김 훈련이 필요</div>
              <div className="bullet-line">작은 목표를 정하여 성취하는 것이 중요(예를 들어 하루에 10분 산책, 간단한 집안일 완수 등)</div>
              <div className="bullet-line">규칙적인 생활습관을 권장하며, 수면,식사, 운동과 관련된 구체적인 습관을 가지기</div>
            </div>
          </div>
          <SymptomChangePanel onOpenSurveySendModal={onOpenSurveySendModal} />
        </>
      )}

    </div>
  );
}

export default PsychologicalTest;
