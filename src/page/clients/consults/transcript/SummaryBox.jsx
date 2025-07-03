import React from "react";
import TranscriptBox from "./TranscriptBox";

function SummaryBox({ summary, onEdit }) {
  return (
    <TranscriptBox
      className="summary"
      title="1. 상담요약"
      editable
      onEdit={onEdit}
      toggleable={true}
    >
      <div className="save-txt">{summary}</div>
    </TranscriptBox>
  );
}

export default SummaryBox;
