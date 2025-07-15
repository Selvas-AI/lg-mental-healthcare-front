import React from "react";
import emptyFace from "@/assets/images/common/empty_face.svg";

import KeywordBox from "./KeywordBox";
import FrequencyBox from "./FrequencyBox";
import StressBox from "./StressBox";
import { useNavigate } from "react-router-dom";
import TranscriptBox from "./TranscriptBox";

function Transcript({ setShowUploadModal }) {
  const navigate = useNavigate();
  const hasTranscript = true;
  const isAIGenerated = false;
  const TranscriptData = {
    summary: "20세 남성으로 원인 모를 불안감으로 불면증을 호소 하고 있다. 엄마와의 부정적인 경험으로 인한 트라우마가 있으며 낮은 자존감으로 대인관계의 어려움을 겪고 있다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다.",
    issues: [
      "원인을 알 수 없는 불안감 호소",
      "간헐적 불면증",
      // "낮은 자존감으로 인한 대인관계 어려움",
      // "예시 텍스트",
      // "예시 텍스트",
      // "예시 텍스트"
    ],
    keyword: [
      { text: '힘들어', freq: 18, x: 240, y: 70 },
      { text: '트라우마', freq: 16, x: 370, y: 70 },
      { text: '죽고싶은', freq: 12, x: 155, y: 100 },
      { text: '괴롭힘', freq: 12, x: 100, y: 50 },
      { text: '우울감', freq: 11, x: 50, y: 100 },
      { text: '잘했다', freq: 10, x: 35, y: 35 },
      { text: '엄마', freq: 9, x: 165, y: 35 },
      { text: '후회', freq: 8, x: 308, y: 110 },
      { text: '사랑', freq: 8, x: 310, y: 25 }
    ],
    frequency: {
      counselor: { minutes: 12},
      client: { minutes: 45}
    },
    stress: {
      data: [1.5, 3.2, 2.8, 1.5, 4.5, 3, 1.5],
      labels: ["00:00", "15:00", "17:12", "22:00", "25:12", "30:00", "55:12"]
    }
  };

  const handleAIGenerate = () => {
    navigate('/clients/recordings');
  };

  const handleUpload = () => {
    if (setShowUploadModal) setShowUploadModal(true);
  };
  return (
    <div className="transcript">
      <div className="tit-wrap">
        <strong>녹취록</strong>
        <div className="btn-wrap">
          <button className="upload-btn type03 h40" type="button" onClick={handleUpload}>
            녹취록 업로드
          </button>
          <button className="type05" type="button" onClick={handleAIGenerate}>
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
            <TranscriptBox
              className="summary"
              title="1. 상담요약"
              editable={true}
              onEdit={() => {}}
              toggleable={true}
            >
              <div className="save-txt">{TranscriptData.summary}</div>
            </TranscriptBox>
            {/* 고민주제 */}
            <TranscriptBox
              className="issue"
              title="2. 고민주제"
              editable={true}
              onEdit={() => {}}
              toggleable={true}
            >
              <div className="save-txt">
                {TranscriptData.issues.map((issue, idx) => (
                  <div className="bullet-line" key={idx}>{issue}</div>
                ))}
              </div>
            </TranscriptBox>
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
              data={TranscriptData.stress.data}
              labels={TranscriptData.stress.labels}
              onAIGenerate={handleAIGenerate}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Transcript;
