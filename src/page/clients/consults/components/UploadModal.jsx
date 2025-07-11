import React, { useRef, useState } from 'react';

function UploadModal({ setShowUploadModal }) {
  const dropzoneRef = useRef(null);
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
  };

  // 파일 선택
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(`"${file.name}" 파일이 선택되었습니다.`);
      setShowUploadModal(false);
      // 업로드 처리 로직 추가
    }
  };

  // 드래그 오버
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  // 드래그 리브
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  // 드롭
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      alert(`"${files[0].name}" 파일이 드래그로 업로드되었습니다.`);
      setShowUploadModal(false);
      // 업로드 처리 로직 추가
    }
  };

  return (
    <div className="modal upload on">
      <div className="modal-dim fixed top-0 left-0 w-full h-full z-[999]" onClick={handleCloseUploadModal}></div>
      <div className="inner z-[1000]">
        <div className="modal-hd">
          <strong>녹음 파일 업로드</strong>
          <button className="close-btn cursor-pointer" type="button" aria-label="닫기" onClick={handleCloseUploadModal}></button>
        </div>
        <div
          className={`dropzone${dragOver ? ' dragover' : ''}`}
          ref={dropzoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label className="fake-upload-btn" htmlFor="fileInput">녹취록 업로드</label>
          <input
            className="file-input cursor-pointer"
            type="file"
            id="fileInput"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <p>또는 파일을 여기에 끌어 놓으세요.</p>
        </div>
      </div>
    </div>
  );
}

export default UploadModal;