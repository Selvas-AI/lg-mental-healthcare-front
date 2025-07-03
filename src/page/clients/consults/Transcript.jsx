import React from "react";
import emptyFace from "@/assets/images/common/empty_face.svg";

function Transcript() {
  const hasTranscript = true;
  const isAIGenerated = false;
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
          <p>AI가 생성한 녹취록이 있습니다.</p>
        </div>
      )}
    </div>
  );
}

export default Transcript;
