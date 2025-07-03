import React from "react";
import TranscriptBox from "./TranscriptBox";

function KeywordBox({ data, onAIGenerate }) {
  const hasData = Array.isArray(data) && data.length > 0;
  return (
    <TranscriptBox
      className={`keyword box${!hasData ? ' before-create' : ''}`}
      title="3. 키워드 분석"
      toggleable={false}
    >
      {!hasData ? (
        <div className="create-wrap">
          <p>
            [AI 생성하기]를 선택하면<br />
            AI가 생성한 분석 자료를 확인 할 수 있어요!
          </p>
          <button className="type01 h40" type="button" onClick={onAIGenerate}>
            <span>AI 생성하기</span>
          </button>
        </div>
      ) : (
        <div className="keyword-list">
          {data.map((keyword, idx) => (
            <span className="keyword-item" key={idx}>{keyword}</span>
          ))}
        </div>
      )}
    </TranscriptBox>
  );
}

export default KeywordBox;
