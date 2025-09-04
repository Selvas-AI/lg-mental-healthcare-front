import React, { useRef, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { audioUploadState } from '@/recoil';
import { audioUpload } from '@/api/apiCaller';

function UploadModal({ setShowUploadModal, sessionSeq, onUploadSuccess, showToastMessage }) {
  const dropzoneRef = useRef(null);
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const setAudioUploadState = useSetRecoilState(audioUploadState);

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
  };

  // 파일 업로드 처리
  const handleFileUpload = async (file) => {
    if (!file) return;
    
    if (!sessionSeq) {
      showToastMessage && showToastMessage('회기 정보가 없습니다.');
      return;
    }

    try {
      setUploading(true);
      
      // 업로드 상태를 전역 상태에 저장
      setAudioUploadState(prev => ({
        ...prev,
        [sessionSeq]: {
          status: 'uploading',
          fileName: file.name,
          timestamp: Date.now()
        }
      }));
      
      // FormData 생성
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionSeq', sessionSeq);
      formData.append('name', file.name);

      const response = await audioUpload(formData);
      
      if (response.code === 200) {
        // 업로드 완료 후 처리 중 상태로 변경
        setAudioUploadState(prev => ({
          ...prev,
          [sessionSeq]: {
            ...prev[sessionSeq],
            status: 'processing',
            timestamp: Date.now()
          }
        }));
        
        // 부모 컴포넌트에 업로드 성공 알림 및 토스트는 부모에서 표시
        onUploadSuccess && onUploadSuccess(response.data, file);
        setShowUploadModal(false);
      } else {
        // 업로드 실패 시 상태 초기화
        setAudioUploadState(prev => {
          const newState = { ...prev };
          delete newState[sessionSeq];
          return newState;
        });
        showToastMessage && showToastMessage(`업로드 실패: ${response.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('파일 업로드 오류:', error);
      // 에러 발생 시 상태 초기화
      setAudioUploadState(prev => {
        const newState = { ...prev };
        delete newState[sessionSeq];
        return newState;
      });
      showToastMessage && showToastMessage('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  // 파일 선택
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
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
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="modal upload on">
      <div className="modal-dim fixed top-0 left-0 w-full h-full z-[999]" onClick={handleCloseUploadModal}></div>
      <div className="inner z-[1000]" style={{ maxWidth: 'initial' }}>
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
          <label className="fake-upload-btn" htmlFor="fileInput">
            {uploading ? '업로드 중...' : '녹취록 업로드'}
          </label>
          <input
            className="file-input cursor-pointer"
            type="file"
            id="fileInput"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={uploading}
            accept="audio/*"
          />
          <p>{uploading ? '파일을 업로드하고 있습니다...' : '또는 파일을 여기에 끌어 놓으세요.'}</p>
        </div>
      </div>
    </div>
  );
}

export default UploadModal;