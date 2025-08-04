import React, { useState, useEffect, useMemo } from 'react'

function SurveyForm({ surveyData, onBack, onScrollChange, answers, onAnswersChange, onSave, onComplete }) {

  // 컴포넌트 렌더링 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const isScrolled = scrollTop > 100 // 100px 이상 스크롤 시 header 표시
      if (onScrollChange) {
        onScrollChange(isScrolled)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [onScrollChange])

  const handleAnswerChange = (questionId, subQuestionId, value) => {
    const key = subQuestionId ? `${questionId}_${subQuestionId}` : questionId
    if (onAnswersChange) {
      onAnswersChange(prev => ({
        ...prev,
        [key]: value
      }))
    }
  }

  //! 중간저장과 완료 핸들러는 props로 받아서 사용
  //! onSave와 onComplete를 직접 사용

  // Default 템플릿 렌더링
  const renderDefaultQuestion = (question, index) => (
    <li key={question.id}>
      <p className="question">{index + 1}. {question.question}</p>
      <div className="answer">
        <ul>
          {question.options.map((option, optionIndex) => (
            <li key={optionIndex}>
              <div className="input-wrap radio type01">
                <input
                  id={`answer${optionIndex + 1}_q${question.id}`}
                  type="radio"
                  name={`question${question.id}`}
                  value={option.value}
                  checked={answers[question.id] === option.value}
                  onChange={(e) => handleAnswerChange(question.id, null, parseInt(e.target.value))}
                />
                <label htmlFor={`answer${optionIndex + 1}_q${question.id}`}>{option.value}</label>
              </div>
              <span>{option.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </li>
  )

  // Type01 템플릿 렌더링 (복합 질문)
  const renderType01Question = (question, index) => (
    <li key={question.id} className="template01">
      <p className="question">{index + 1}. {question.question}</p>
      <div className="answer-wrap">
        {question.subQuestions.map((subQuestion) => (
          <div key={subQuestion.id} className="answer">
            <p className="sub-question">{subQuestion.id}. {subQuestion.question}</p>
            <ul>
              {subQuestion.options.map((option, optionIndex) => (
                <li key={optionIndex}>
                  <div className="input-wrap radio type01">
                    <input
                      id={`answer${optionIndex + 1}_q${question.id}_${subQuestion.id}`}
                      type="radio"
                      name={`question${question.id}_${subQuestion.id}`}
                      value={option.value}
                      checked={answers[`${question.id}_${subQuestion.id}`] === option.value}
                      onChange={(e) => handleAnswerChange(question.id, subQuestion.id, parseInt(e.target.value))}
                    />
                    <label htmlFor={`answer${optionIndex + 1}_q${question.id}_${subQuestion.id}`}>{option.value}</label>
                  </div>
                  <span>{option.label}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </li>
  )

  // Type02 템플릿 렌더링 (긴 설명 옵션)
  const renderType02Question = (question, index) => (
    <li key={question.id} className="template02">
      <p className="question">{index + 1}. {question.question}</p>
      <div className="answer">
        <ul>
          {question.options.map((option, optionIndex) => (
            <li key={optionIndex}>
              <div className="input-wrap radio type01">
                <input
                  id={`answer${optionIndex + 1}_q${question.id}`}
                  type="radio"
                  name={`question${question.id}`}
                  value={option.value}
                  checked={answers[question.id] === option.value}
                  onChange={(e) => handleAnswerChange(question.id, null, parseInt(e.target.value))}
                />
                <label htmlFor={`answer${optionIndex + 1}_q${question.id}`}>{option.value}</label>
              </div>
              <span>{option.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </li>
  )

  // 질문 타입에 따른 렌더링 함수 선택
  const renderQuestion = (question, index) => {
    switch (question.type) {
      case 'default':
        return renderDefaultQuestion(question, index)
      case 'type01':
        return renderType01Question(question, index)
      case 'type02':
        return renderType02Question(question, index)
      default:
        return null
    }
  }

  return (
    <div className="inner">
      <div className="title-wrap">
        <button className="back-btn" type="button" aria-label="뒤로가기" onClick={onBack}></button>
        <strong>{surveyData.title}</strong>
      </div>
      <div className="con-wrap">
        <div className="survey-list">
          <div className="top-info">
            <div>
              <div className="tit-wrap">
                <strong>문항 응답</strong>
                <span className="total">총 {surveyData.totalQuestions}문항</span>
              </div>
              <div className="btn-wrap">
                <button className="type07" type="button" onClick={onSave}>중간저장</button>
                <button className="type07 black" type="button" onClick={onComplete}>완료</button>
              </div>
            </div>
            <p style={{ paddingTop: '0' }}>{surveyData.description}</p>
          </div>
          <div className="list-wrap">
            <ul>
              {surveyData.questions.map((question, index) => 
                renderQuestion(question, index)
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SurveyForm
