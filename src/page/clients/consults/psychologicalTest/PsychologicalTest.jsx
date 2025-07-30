import React, { useState } from 'react';
import emptyFace from '@/assets/images/common/empty_face.svg';
import SymptomChangePanel from './components/SymptomChangePanel';

function PsychologicalTest({ onOpenSurveySendModal, setShowAiSummary, setSupportPanel }) {
  // 상태(추후 props/상태관리로 대체)
  const [hasSurveyData] = useState(true); // 심리검사 데이터 유무
  const [isAIGenerated] = useState(true); // AI 종합 의견 생성 여부
  const [hasSurvey] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('https://abcd.com/counsel/%sdf%sdfsg%dfgas%sdf%sdfsg%dfgas%sdf%sdfsg%dfgas%sdf%sdfsg%dfgas');

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(generatedUrl).then(() => {
      alert('URL이 복사되었습니다.');
    });
  };

  const handleRemoveUrl = () => {
    setGeneratedUrl('');
  };

  const handleAIGenerate = () => {
    if (setShowAiSummary && setSupportPanel) {
      setShowAiSummary(true);
      setSupportPanel(true);
    }
  };

  return (
    <div className="inner">
      {/* 데이터 없음(empty) */}
      {!hasSurveyData && (
        <div className="empty-board">
          {hasSurvey ? (
            <>
              <img src={emptyFace} alt="empty" />
              <p className="empty-info">아직 생성한 심리 검사지가 없어요.<br />내담자에게 필요한 심리 검사지를 만들어보세요.</p>
              <button className="type05" type="button" onClick={onOpenSurveySendModal}>심리 검사지 생성</button>
            </>
          ) : (
            <>
              <img src={emptyFace} alt="empty" />
              <p className="empty-info">내담자의 심리 검사지 입력을 기다리고 있어요.<br />(링크 만료 : <span className="datetime">YY-MM-DD HH:MM</span>)</p>
              <button className="type05 h44" type="button" onClick={onOpenSurveySendModal}>심리 검사지 생성</button>
              <div className="url-wrap">
                <input className="url-box" name="url-input" type="text" readonly value={generatedUrl} />
                <button onClick={handleCopyUrl} className="copy-btn" type="button" aria-label="URL "></button>
                <button onClick={handleRemoveUrl} className="remove-btn" type="button" aria-label="URL "></button>
              </div>
            </>
          )}
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
            <button className="type01 h40" type="button" onClick={handleAIGenerate}>
              <span>AI 생성하기</span>
            </button>
          </div>
        </div>
      )}
      {/* 데이터+AI 생성 */}
      {hasSurveyData && isAIGenerated && (
        <>
          <div className="total-opinion">
            {/* 신규 생성 링크 없는 경우 / 있는 경우 */}
            {!generatedUrl ? (
              <div className="survey-create">
                <strong>내담자에게 필요한 심리 검사지를 만들어 보세요.</strong>
                <button className="type05 h44" type="button" onClick={onOpenSurveySendModal}>심리 검사지 생성</button>
              </div>
            ) : (
              <div className="survey-create type01">
                <div className="txt-wrap">
                  <strong>경과 문진, 1회기 심리 검사지</strong>
                  <p>만료 <span className="datetime">YY-MM-DD HH:MM</span></p>
                </div>
                <div className="url-wrap">
                  <input className="url-box" name="url-input" type="text" readOnly value={generatedUrl} />
                  <button onClick={handleCopyUrl} className="copy-btn" type="button" aria-label="URL 복사"></button>
                  <button onClick={handleRemoveUrl} className="remove-btn" type="button" aria-label="URL 삭제"></button>
                </div>
              </div>
            )}
            <div className="tit-wrap">
              <strong>AI 종합 의견</strong>
              <button className="type01 h40" type="button" onClick={handleAIGenerate}>
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
