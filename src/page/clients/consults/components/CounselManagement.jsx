import React, { useState } from "react";
import Transcript from "../transcript/Transcript";
import CounselLog from "../counselLog/CounselLog";
import SessionSelect from "./SessionSelect";

//상담관리
function CounselManagement({ setShowUploadModal }) {
  const sessionOptions = [
    { session: "7회기", date: "2025.04.19(토) 오전 10시" },
    { session: "6회기", date: "2025.04.19(토) 오전 10시" },
    { session: "5회기", date: "2025.04.19(토) 오전 10시" },
    { session: "4회기", date: "2025.04.19(토) 오전 10시" },
    { session: "3회기", date: "2025.04.19(토) 오전 10시", selected: true },
    { session: "2회기", date: "2025.04.19(토) 오전 10시" },
    { session: "1회기", date: "2025.04.19(토) 오전 10시" },
  ];

  function handleSessionSelect(option, idx) {
    // TODO: 선택 시 동작 구현
  }

  return (
    <>
      <div className="inner">
        <SessionSelect options={sessionOptions} onSelect={handleSessionSelect} />
        <Transcript setShowUploadModal={setShowUploadModal} />
        <CounselLog />
      </div>
    </>
  );
}

export default CounselManagement;
