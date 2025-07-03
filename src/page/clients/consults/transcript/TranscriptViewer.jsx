import React, { useState } from "react";

function TranscriptViewer({ transcriptContent, aiAnalysisContent }) {
  const [activeTab, setActiveTab] = useState("transcript");

  return (
    <div className="transcript-viewer">
      <div className="tab-menu type02">
        <ul className="tab-list" role="tablist">
          <li
            className={activeTab === "transcript" ? "on" : ""}
            role="tab"
            tabIndex={0}
            onClick={() => setActiveTab("transcript")}
          >
            <a>녹음내용</a>
          </li>
          <li
            className={activeTab === "ai" ? "on" : ""}
            role="tab"
            tabIndex={0}
            onClick={() => setActiveTab("ai")}
          >
            <a>AI 분석</a>
          </li>
        </ul>
      </div>
      <div className="tab-panels">
        {activeTab === "transcript" && (
          <div className="tab-panel transcript-panel on" role="tabpanel">
            {transcriptContent || <p>녹음내용이 없습니다.</p>}
          </div>
        )}
        {activeTab === "ai" && (
          <div className="tab-panel ai-panel on" role="tabpanel">
            {aiAnalysisContent || <p>AI 분석 데이터가 없습니다.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default TranscriptViewer;
