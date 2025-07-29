import React, { useState } from "react";
import Transcript from "../transcript/Transcript";
import CounselLog from "../counselLog/CounselLog";
import SessionSelect from "./SessionSelect";
import warningFace from "@/assets/images/common/warning_face.svg";
//상담관리
function CounselManagement({ setShowUploadModal }) {
  const [isNoshow, setIsNoshow] = useState(false);
  const sessionOptions = [
    { session: "1회기"},
    { session: "2회기"},
    { session: "3회기", selected: true },
    { session: "4회기"},
    { session: "5회기"},
    { session: "6회기"},
    { session: "7회기"},
  ];

  function handleSessionSelect(option, idx) {
    // TODO: 선택 시 동작 구현
  }

  return (
    <>
      <div className="inner">
        <SessionSelect options={sessionOptions} onSelect={handleSessionSelect} />
        {!isNoshow ? 
        <>
          <Transcript setShowUploadModal={setShowUploadModal} />
          <CounselLog setIsNoshow={setIsNoshow} />
        </> : 
        <>
          <div className="noshow">
              <img src={warningFace} alt="warning"/>
              <strong>해당 회기는 ‘노쇼' 상태입니다.</strong>
              <p className="explain">노쇼 처리된 회기는 아래 기능이 제한됩니다.</p>
              <ul>
                  <li>1. 녹취록 업로드</li>
                  <li>2. 상담일지 작성</li>
              </ul>
              <p className="explain">녹취록 업로드 또는 상담일지를 작성하려면<br/>‘노쇼 해제'를 선택해 주세요.</p>
              <button className="noshow-release-btn type05" type="button" onClick={() => setIsNoshow(false)}>노쇼 해제</button>
          </div>
        </>}
      </div>
    </>
  );
}

export default CounselManagement;
