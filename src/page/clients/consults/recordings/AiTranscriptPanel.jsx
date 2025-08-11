import React from "react";
import AiPanelCommon from "@/components/AiPanelCommon";
import KeywordBox from "../transcript/KeywordBox";
import FrequencyBox from "../transcript/FrequencyBox";
import StressBoxSmall from "../transcript/StressBoxSmall";

function AiTranscriptPanel({ open, onClose, status = "creating", AiSummaryData }) {
  // 결과 UI 함수 정의
  const renderComplete = () => (
    <>
      <div className="complete-tit">
        <strong>1. 상담 요약</strong>
      </div>
      <div className="complete-cont">
        <div>20세 남성으로 원인 모를 불안감으로 불면증으로 호소 하고 있다. 엄마와의 부정적인 경험으로 인한 트라우마가 있으며 낮은 자존감으로 대인관계의 어려움을 겪고 있다.</div>
      </div>
      <div className="complete-tit">
        <strong>2. 고민주제</strong>
      </div>
      <div className="complete-cont">
        <div className="bullet-line">원인을 알 수 없는 불안감 호소</div>
        <div className="bullet-line">간헐적 불면증</div>
        <div className="bullet-line">낮은 자존감으로 인한 대인관계 어려움</div>
      </div>
      <div className="complete-tit"><strong>3. 키워드 분석</strong></div>
      <div className="complete-cont visual-wrap">
        <KeywordBox data={AiSummaryData.keyword} isPanel={true} />
      </div>
      <div className="complete-tit"><strong>4. 발화빈도</strong></div>
      <div className="complete-cont visual-wrap">
        <FrequencyBox data={AiSummaryData.frequency} isPanel={true} />
      </div>
      <div className="complete-tit"><strong>5. 스트레스 징후</strong></div>
      <div className="complete-cont visual-wrap">
        <StressBoxSmall data={AiSummaryData.stress?.data} labels={AiSummaryData.stress?.labels} />
        <div className="chart-data">
          <span>최고10점</span>/<span>25.12</span>
        </div>
      </div>
    </>
  );

  return (
    <AiPanelCommon
      open={open}
      onClose={onClose}
      status={status}
      title="녹취록 AI 분석"
      infoMessage={"AI 분석 자료가 생성 완료되었습니다.<br/>녹취록 AI 분석을 통해 상담 업무 도움을 받을 수 있어요."}
      description="상담 녹취록을 바탕으로 AI가 생성한 내용입니다."
      keyInfo={true}
      renderComplete={renderComplete}
    />
  );
}

export default AiTranscriptPanel;
