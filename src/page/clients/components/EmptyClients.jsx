import React from 'react'
import emptyFace from "@/assets/images/common/empty_face.svg";

function EmptyClients({ onRegister }) {
  return (
    <div className="con-wrap empty">
      <div className="empty-clients">
        <img src={emptyFace} alt="empty" />
        <p className="empty-info">관리중인 내담자가 없습니다.</p>
        <button className="type11 h44" type="button" onClick={onRegister}>
          내담자 등록
        </button>
      </div>
    </div>
  );
}

export default EmptyClients