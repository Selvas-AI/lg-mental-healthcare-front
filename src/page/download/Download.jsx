import React from 'react';
import './Download.css';
import imgLogo from '@/assets/images/logo.svg';
import txtLogo from '@/assets/images/onshim.svg';

// APK 파일 다운로드 페이지
const Download = () => {
  const handleAndroidDownload = async () => {
    try {
      // 환경변수에서 APK 다운로드 URL 가져오기 (HTTPS 사용)
      const apkUrl = process.env.REACT_APP_APK_DOWNLOAD_URL || 'https://43.202.89.215/app-onshim-20250922104100.apk';
      
      // HTTPS 프로토콜 확인
      if (!apkUrl.startsWith('https://')) {
        console.warn('보안 경고: HTTPS 연결을 사용하는 것을 권장합니다.');
      }
      
      const link = document.createElement('a');
      link.href = apkUrl;
      link.download = 'onshim-app.apk';
      link.rel = 'noopener noreferrer'; // 보안 강화
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('APK 다운로드 중 오류 발생:', error);
      alert('다운로드 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="download-page">
      <div className="download-container">
        <div className="logo">
          <img className="img-logo" src={imgLogo} alt="Onshim 이미지 로고" />
          <img className="txt-logo" src={txtLogo} alt="Onshim 텍스트 로고" />
        </div>
        {/* Android 섹션 */}
        <div className="download-section">
          <button className="download-btn android-btn" onClick={handleAndroidDownload}>
            <svg className="platform-icon" width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zM20.5 8c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zM15.53 2.16l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z" fill="currentColor"/>
            </svg>
            <span>Android APK 다운로드</span>
          </button>
          <p className="usage-text">
            다운로드 후 설정 → 보안 → 알 수 없는 소스 허용 후 설치하세요
          </p>
        </div>

        {/* iOS 섹션 */}
        <div className="download-section">
          <button className="download-btn ios-btn disabled" disabled>
            <svg className="platform-icon" width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="currentColor"/>
            </svg>
            <span>iOS 준비 중</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Download;
