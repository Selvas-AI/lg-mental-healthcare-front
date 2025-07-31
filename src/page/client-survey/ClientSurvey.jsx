import React, { useState, useMemo } from 'react'
import './client_survey.scss'
import PrivacyPolicy from './privacyPolicy'
import SurveyForm from './SurveyForm'
import { surveyData } from './surveyData'

function ClientSurvey() {
  const [showSurvey, setShowSurvey] = useState(false)
  const [scroll, setScroll] = useState(false)
  const [answers, setAnswers] = useState({})

  const handleStartSurvey = () => {
    setShowSurvey(true)
  }

  const handleBackToPrivacy = () => {
    setShowSurvey(false)
  }

  const handleSave = () => {
    console.log('중간저장:', answers)
  }

  const handleComplete = () => {
    console.log('완료:', answers)
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
      return "wrapper gray-bg survey-detail"
    }
    return "wrapper privacy-policy"
  }

  return (
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
                    onClick={handleBackToPrivacy}
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
  )
}

export default ClientSurvey