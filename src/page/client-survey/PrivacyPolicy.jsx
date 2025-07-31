import React, { useState } from 'react'
import PrivacyPolicyDetail from './privacyPolicyDetail'

function PrivacyPolicy({ onStartSurvey }) {
  const [participationChecked, setParticipationChecked] = useState(false)
  const [privacyChecked, setPrivacyChecked] = useState(false)
  const [showDetail, setShowDetail] = useState(false)

  const handleBackClick = () => {
    // 뒤로가기 로직
    window.history.back()
  }

  const handleDetailClick = () => {
    setShowDetail(true)
  }

  const handleStartTest = () => {
    if (onStartSurvey) {
      onStartSurvey()
    }
  }

  const isStartEnabled = participationChecked && privacyChecked

  // 상세 보기 화면 표시
  if (showDetail) {
    return <PrivacyPolicyDetail onBack={() => setShowDetail(false)} />
  }

  return (
    <div className="inner">
      <div className="hd-wrap">
        <button className="back-btn" type="button" aria-label="뒤로가기" onClick={handleBackClick}></button>
      </div>
      <div className="tit-wrap">
        <strong>검사 참여 및 개인정보 수집·이용에 대한 동의</strong>
      </div>
      <div className="con-wrap">
        <div className="item">
          {/* 필수 항목에 necessary class 추가 */}
          <div className="con-tit necessary">
            <strong>1. 검사 참여 동의</strong>
          </div>
          <div className="con-info">
            <p className="top-info">
              상기 상담 서비스 관련 정보와 자료는 익명화하여 서비스의 제공, 심리 관련 서비스의 개발과 상담연구, 통계, 빅데이터 활용 내지 연구를 위한 제3자에 대한 양도 등을 위하여 활용할 수 있습니다.<br />
              <br />
              안내 드린 내용에 모두 동의하신다면, 체크 박스를 선택해 주세요.
            </p>
            <div className="input-wrap checkbox">
              <input
                id="participation"
                type="checkbox"
                name="participation"
                checked={participationChecked}
                onChange={(e) => setParticipationChecked(e.target.checked)} />
              <label htmlFor="participation">검사 참여에 동의합니다.</label>
            </div>
          </div>
        </div>
        <div className="item">
          <div className="con-tit necessary">
            <strong>2. 개인정보 수집·이용에 대한 동의</strong>
          </div>
          <div className="con-info">
            <p className="top-info">
              하기와 같은 개인정보 수집 · 이용에 동의하신다면, 체크 박스를 선택해주세요.<br />
              <br />
              • 수집 항목: 이름, 연락처, 성별, 생년월일<br />
              • 수집 목적: 심리 검사 분석<br />
              • 보유 기간: 수집일로부터 1년(자세한 내용은 동의서 본문 참고)
            </p>
            <div className="input-wrap checkbox">
              <input
                id="privacy"
                type="checkbox"
                name="privacy"
                checked={privacyChecked}
                onChange={(e) => setPrivacyChecked(e.target.checked)} />
              <label htmlFor="privacy">개인정보 수집·이용에 동의합니다.</label>
              <a className="detail-btn cursor-pointer" onClick={handleDetailClick}>보기</a>
            </div>
          </div>
        </div>
      </div>
      <div className="btn-wrap">
        <button
          className="type10"
          type="button"
          disabled={!isStartEnabled}
          onClick={handleStartTest}
        >
          검사 시작하기
        </button>
      </div>
    </div>
  )
}

export default PrivacyPolicy