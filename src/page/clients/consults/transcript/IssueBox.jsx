import React from "react";
import TranscriptBox from "./TranscriptBox";

function IssueBox({ issues = [], onEdit }) {
  return (
    <TranscriptBox
      className="issue"
      title="2. 고민주제"
      editable
      onEdit={onEdit}
      toggleable={true}
    >
      <div className="save-txt">
        {issues.map((issue, idx) => (
          <div className="bullet-line" key={idx}>{issue}</div>
        ))}
      </div>
    </TranscriptBox>
  );
}

export default IssueBox;
