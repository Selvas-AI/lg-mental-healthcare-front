import React from "react";
import emptyFace from "@/assets/images/common/empty_face.svg";

import SummaryBox from "./SummaryBox";
import IssueBox from "./IssueBox";
import KeywordBox from "./KeywordBox";
import FrequencyBox from "./FrequencyBox";
import StressBox from "./StressBox";

function Transcript() {
  const hasTranscript = false;
  const isAIGenerated = true;
  const TranscriptData = {
    summary: "20세 남성으로 원인 모를 불안감으로 불면증을 호소 하고 있다. 엄마와의 부정적인 경험으로 인한 트라우마가 있으며 낮은 자존감으로 대인관계의 어려움을 겪고 있다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다.",
    issues: [
      "원인을 알 수 없는 불안감 호소",
      "간헐적 불면증",
      "낮은 자존감으로 인한 대인관계 어려움",
      "예시 텍스트",
      "예시 텍스트",
      "예시 텍스트"
    ],
    keyword: [],
    frequency: {
      counselor: { minutes: 12},
      client: { minutes: 45}
    },
    stress: []
  };

  const handleAIGenerate = () => {
    console.log("AI 생성하기");
  };
  return (
    <div className="transcript">
      <div className="tit-wrap">
        <strong>녹취록</strong>
        <div className="btn-wrap">
          <button className="upload-btn type03 h40" type="button">
            녹취록 업로드
          </button>
          <button className="type05" type="button">
            녹취록 상세
          </button>
        </div>
      </div>
      {!hasTranscript && !isAIGenerated && (
        <div className="empty-board">
          <img src={emptyFace} alt="empty" />
          <p className="empty-tit">업로드된 녹취록이 없습니다.</p>
          <p className="empty-info">
            [녹취록 업로드]를 선택하여 PC에 있는 녹취록을 업로드 할 수 있어요.
          </p>
        </div>
      )}
      {hasTranscript && (
        <div className="transcript-board">
          <div className="create-board">
            <strong>AI가 녹취록 생성을 완료 하였습니다.</strong>
            <ul>
              <li>1. 상담요약</li>
              <li>2. 고민주제</li>
              <li>3. 키워드 분석</li>
              <li>4. 발화빈도</li>
              <li>5. 스트레스 징후</li>
            </ul>
            <button className="type01 h40" type="button">
              <span>AI 생성하기</span>
            </button>
          </div>
        </div>
      )}
      {isAIGenerated && (
        <div className="transcript-board">
          <div className="dashboard">
            {/* 상담요약 */}
            <SummaryBox
              summary={TranscriptData.summary}
              onEdit={() => {}}
            />
            {/* 고민주제 */}
            <IssueBox
              issues={TranscriptData.issues}
              onEdit={() => {}}
            />
            {/* 키워드 분석 */}
            <KeywordBox
              data={TranscriptData.keyword}
              onAIGenerate={handleAIGenerate}
            />
            {/* 발화빈도 */}
            <FrequencyBox
              data={TranscriptData.frequency}
            />
            {/* 스트레스 징후 */}
            <StressBox
              data={TranscriptData.stress}
              onAIGenerate={handleAIGenerate}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Transcript;
