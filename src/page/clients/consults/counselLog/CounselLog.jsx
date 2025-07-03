import React from "react";
import emptyFace from "@/assets/images/common/empty_face.svg";

function CounselLog() {
  return (
    <div className="counsel-log">
      <div className="tit-wrap">
        <strong>상담일지</strong>
        <div className="btn-wrap">
          <button className="type05 h40" type="button">상담일지 상세</button>
        </div>
      </div>
      <div className="empty-board">
        <img src={emptyFace} alt="empty" />
        <p className="empty-tit">해당 회기 상담일지 작성 내역이 없습니다. 상담일지를 작성해주세요.</p>
        <p className="empty-info">AI를 활용하여 상담 일지를 작성할 수 있어요.</p>
      </div>
    </div>
  );
}

export default CounselLog;
