import React from "react";
import emptyFace from "@/assets/images/common/empty_face.svg";
import SessionSelect from "./SessionSelect";

function CounselManagement() {
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
    <div className="inner">
      <SessionSelect options={sessionOptions} onSelect={handleSessionSelect} />
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
        <div className="empty-board">
          <img src={emptyFace} alt="empty" />
          <p className="empty-tit">업로드된 녹취록이 없습니다.</p>
          <p className="empty-info">
            [녹취록 업로드]를 선택하여 PC에 있는 녹취록을 업로드 할 수 있어요.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CounselManagement;
