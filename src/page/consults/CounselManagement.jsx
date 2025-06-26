import React from 'react';

function CounselManagement() {
  return (
    <div className="transcript">
      <div className="tit-wrap">
        <strong>녹취록</strong>
        <div className="btn-wrap">
          <button className="upload-btn type03 h40" type="button">녹취록 업로드</button>
          <button className="type05" type="button">녹취록 상세</button>
        </div>
      </div>
      <div className="empty-board">
        <img src="/assets/images/common/empty_face.svg" alt="empty" />
        <p className="empty-tit">업로드된 녹취록이 없습니다.</p>
        <p className="empty-info">[녹취록 업로드]를 선택하여 PC에 있는 녹취록을 업로드 할 수 있어요.</p>
      </div>
    </div>
  );
}

export default CounselManagement;
