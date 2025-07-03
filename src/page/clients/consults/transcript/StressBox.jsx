import React from "react";
import TranscriptBox from "./TranscriptBox";

function StressBox({ data, onAIGenerate }) {
  const hasData = Array.isArray(data) && data.length > 0;
  return (
    <TranscriptBox
      className={`stress box${!hasData ? ' before-create' : ''}`}
      title="5. 스트레스 징후"
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
        <div className="stress-list">
          {data.map((item, idx) => (
            <span className="stress-item" key={idx}>{item}</span>
          ))}
        </div>
      )}
    </TranscriptBox>
  );
}

export default StressBox;
