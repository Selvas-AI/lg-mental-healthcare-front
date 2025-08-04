import React, { useState, useMemo, useEffect } from 'react'
import './client_survey.scss'
import PrivacyPolicy from './PrivacyPolicy'
import SurveyForm from './SurveyForm'
import SurveyModal from './SurveyModal'
import { surveyData } from './surveyData'

function ClientSurvey() {
  const [showSurvey, setShowSurvey] = useState(false)
  const [scroll, setScroll] = useState(false)
  const [answers, setAnswers] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('start') // 'start', 'complete', 'incomplete', 'save', 'exit'
  const [hasIntermediateData, setHasIntermediateData] = useState(false)
  const [userName, setUserName] = useState('홍길동') // 사용자 이름

  // 중간 저장 데이터 확인 함수
  const checkIntermediateData = () => {
    // localStorage에서 중간 저장 데이터 확인
    const savedData = localStorage.getItem('survey_intermediate_data')
    return savedData ? JSON.parse(savedData) : null
  }

  // 컴포넌트 마운트 시 중간 저장 데이터 확인
  useEffect(() => {
    const intermediateData = checkIntermediateData()
    if (intermediateData && Object.keys(intermediateData).length > 0) {
      setHasIntermediateData(true)
      setAnswers(intermediateData)
    }
    setShowModal(true)
  }, [])

  const handleStartSurvey = () => {
    setShowSurvey(true)
    setShowModal(false)
  }

  const handleBackToPrivacy = () => {
    setShowSurvey(false)
  }

  const handleSave = () => {
    console.log('중간저장:', answers)
    console.log('중간저장 모달 표시 시도')
    console.log('현재 showModal 상태:', showModal)
    console.log('현재 modalType:', modalType)
    
    // localStorage에 중간 저장 데이터 저장
    localStorage.setItem('survey_intermediate_data', JSON.stringify(answers))
    
    // 모달 상태 강제 리셋 후 새로운 모달 표시
    setShowModal(false)
    setTimeout(() => {
      setModalType('save')
      setShowModal(true)
      console.log('중간저장 모달 상태 설정 완료')
    }, 100)
  }

  const handleComplete = () => {
    // 모든 문항이 응답되었는지 확인
    const totalQuestions = surveyData.totalQuestions || surveyData.questions.length
    const answeredQuestions = Object.keys(answers).length
    
    console.log('총 문항 수:', totalQuestions)
    console.log('응답한 문항 수:', answeredQuestions)
    console.log('응답 데이터:', answers)
    
    if (answeredQuestions < totalQuestions) {
      // 미응답 모달 표시
      console.log('미응답 모달 표시')
      setModalType('incomplete')
      setShowModal(true)
      return
    }
    
    console.log('완료:', answers)
    console.log('현재 showModal 상태:', showModal)
    console.log('현재 modalType:', modalType)
    
    // 완료 시 중간 저장 데이터 삭제
    localStorage.removeItem('survey_intermediate_data')
    
    // 모달 상태 강제 리셋 후 새로운 모달 표시
    setShowModal(false)
    setTimeout(() => {
      setModalType('complete')
      setShowModal(true)
      console.log('완료 모달 상태 설정 완료')
    }, 100)
  }

  const handleModalClose = () => {
    setShowModal(false)
    // 모달을 닫으면 이전 페이지로 이동
    window.history.back()
  }

  const handleModalCancel = () => {
    setShowModal(false)
    // 그만두기 클릭 시 중간 저장 데이터 삭제 여부 확인 후 처리
    if (hasIntermediateData) {
      localStorage.removeItem('survey_intermediate_data')
    }
    window.history.back()
  }

  const handleModalStart = () => {
    setShowModal(false)
    if (hasIntermediateData) {
      // 중간 저장 데이터가 있으면 바로 검사 화면으로
      handleStartSurvey()
    } else {
      // 첫 검사면 동의서 화면으로 (showSurvey는 false 상태 유지)
      // PrivacyPolicy 컴포넌트가 렌더링됨
    }
  }

  const handleModalConfirm = () => {
    setShowModal(false)
    if (modalType === 'complete') {
      // 완료 후 이전 페이지로 이동
      window.history.back()
    }
  }

  const handleModalContinue = () => {
    setShowModal(false)
    // 계속하기 - 모달만 닫고 검사 계속
  }

  const handleModalExit = () => {
    setShowModal(false)
    // 나가기 - 이전 페이지로 이동
    window.history.back()
  }

  // 백 버튼 클릭 시 나가기 모달 표시
  const handleBackToPrivacyWithModal = () => {
    setModalType('exit')
    setShowModal(true)
  }

  // fade 스타일 최적화
  const fadeStyle = useMemo(() => ({
    opacity: scroll ? 1 : 0,
    transition: 'opacity 0.2s',
    transitionDelay: scroll ? '50ms' : '0ms',
    pointerEvents: scroll ? 'auto' : 'none'
  }), [scroll])

  // 렌더링되는 컴포넌트에 따라 className 결정
  const getWrapperClassName = () => {
    if (showSurvey) {
      return "wrapper gray-bg survey-detail client-survey"
    }
    return "wrapper privacy-policy"
  }

  return (
    <>
      {showModal && (
        <SurveyModal 
          modalType={modalType}
          hasIntermediateData={hasIntermediateData}
          userName={userName}
          onClose={handleModalClose}
          onCancel={handleModalCancel}
          onStart={handleModalStart}
          onConfirm={handleModalConfirm}
          onContinue={handleModalContinue}
          onExit={handleModalExit}
        />
      )}
      <div className={getWrapperClassName()}>
        <main>
          {showSurvey ? (
            <>
              <header className={`survey-form ${scroll ? 'scroll' : ''}`}>
                <div className="inner">
                  <div className="left">
                    <button 
                      className="back-btn" 
                      type="button" 
                      aria-label="뒤로가기" 
                      onClick={handleBackToPrivacyWithModal}
                      style={fadeStyle}
                    ></button>
                    <strong 
                      className="page-title"
                      style={{...fadeStyle, display: 'block !important'}}
                    >
                      {surveyData.title}
                    </strong>
                  </div>
                  <div className="right">
                    <div className="btn-wrap">
                      <button 
                        className="type07" 
                        type="button" 
                        onClick={handleSave}
                        style={fadeStyle}
                      >
                        중간저장
                      </button>
                      <button 
                        className="type07 black" 
                        type="button" 
                        onClick={handleComplete}
                        style={fadeStyle}
                      >
                        완료
                      </button>
                    </div>
                  </div>
                </div>
              </header>
              <SurveyForm 
                surveyData={surveyData} 
                onBack={handleBackToPrivacy}
                onScrollChange={setScroll}
                answers={answers}
                onAnswersChange={setAnswers}
                onSave={handleSave}
                onComplete={handleComplete}
              />
            </>
          ) : (
            <PrivacyPolicy onStartSurvey={handleStartSurvey} />
          )}
        </main>
        {showSurvey && (
          <footer>
            <div className="inner">
              <p className="copyright">ⓒ 2025. Onshim Co., Ltd. All rights reserved.</p>
            </div>
          </footer>
        )}
      </div>
    </>
  )

}

export default ClientSurvey