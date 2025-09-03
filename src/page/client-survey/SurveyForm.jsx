import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react'

function SurveyForm({ surveyData, currentAssessmentIndex, onBack, onScrollChange, hasIntermediateData, answers, onAnswersChange, onSave, onAutoSave, onComplete, onPrevAssessment, onNextAssessment, onShowIncompleteModal, scrollTargetSeq, onScrollTargetConsumed }) {

  // 실제 API 데이터 구조에서 필요한 정보 추출
  const processedData = useMemo(() => {
    if (!surveyData || !surveyData.itemList || surveyData.itemList.length === 0) {
      return { assessmentName: '', associatedDisorder: '', description: '', questions: [], totalQuestions: 0, totalAssessments: 0, isLastAssessment: true }
    }

    // 현재 검사지 정보 사용
    const currentItem = surveyData.itemList[currentAssessmentIndex] || surveyData.itemList[0]
    const assessmentInfo = currentItem.assessmentInfo
    
    return {
      assessmentName: assessmentInfo.assessmentName || '',
      associatedDisorder: assessmentInfo.associatedDisorder || '',
      description: assessmentInfo.clientNotice || '',
      questions: assessmentInfo.questions || [],
      totalQuestions: assessmentInfo.questions ? assessmentInfo.questions.length : 0,
      totalAssessments: surveyData.itemList.length,
      isLastAssessment: currentAssessmentIndex >= surveyData.itemList.length - 1
    }
  }, [surveyData, currentAssessmentIndex])

  // 헤더와 동일한 questionType 텍스트 계산
  const questionTypeText = useMemo(() => {
    const qt = surveyData?.questionType
    if (!qt) return ''
    if (qt === 'PRE') return '사전 문진'
    if (qt === 'PROG') {
      // const seq = surveyData?.sessionSeq
      // return `경과 문진${seq ? ` ${seq}회기` : ''}`
      return '경과 문진'
    }
    if (qt === 'POST') return '사후 문진'
    return ''
  }, [surveyData])

  // 특정 문항으로 스크롤이 일어난 직후에는 상단 스크롤을 생략하기 위한 플래그
  const didScrollToTargetRef = useRef(false)
  const targetScrollForIndexRef = useRef(null)

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

  // 현재 검사지의 미답변 항목 검증
  const validateCurrentAssessment = () => {
    const currentQuestions = processedData.questions
    const unansweredQuestions = []
    
    currentQuestions.forEach((question, index) => {
      if (answers[question.questionSeq] === undefined) {
        unansweredQuestions.push({ questionSeq: question.questionSeq, index: index + 1 })
      }
    })
    
    return unansweredQuestions
  }

  // 미답변 항목으로 스크롤
  const scrollToQuestion = (questionSeq) => {
    const questionElement = document.querySelector(`[name="question${questionSeq}"]`)
    if (questionElement) {
      const questionContainer = questionElement.closest('li')
      if (questionContainer) {
        questionContainer.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  // 상단 스크롤 유틸: window와 흔한 스크롤 컨테이너 모두 처리
  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    } catch (_) {}
    try { document.documentElement.scrollTop = 0 } catch (_) {}
    try { document.body.scrollTop = 0 } catch (_) {}
    const selectors = ['.survey-list', '.con-wrap', '.wrap', '.container']
    selectors.forEach(sel => {
      const el = document.querySelector(sel)
      if (el && typeof el.scrollTop === 'number') {
        el.scrollTop = 0
      }
    })
  }

  // 부모로부터 스크롤 대상이 전달되면 스크롤 수행 후 소비 콜백 호출
  // 이 효과가 먼저 실행되어야 다음 상단 스크롤 효과와 충돌하지 않음
  useEffect(() => {
    if (scrollTargetSeq !== null && scrollTargetSeq !== undefined) {
      scrollToQuestion(scrollTargetSeq)
      didScrollToTargetRef.current = true
      targetScrollForIndexRef.current = currentAssessmentIndex
      if (onScrollTargetConsumed) onScrollTargetConsumed()
    }
  }, [scrollTargetSeq, onScrollTargetConsumed, currentAssessmentIndex])

  // 검사지 변경 시 기본적으로 맨 위로 스크롤
  // 단, 바로 직전에 특정 문항으로 스크롤했다면 이번 렌더에서는 상단 스크롤을 생략
  useLayoutEffect(() => {
    // 같은 검사지에서 방금 타겟 스크롤 했던 경우에는 상단 스크롤 생략
    if (didScrollToTargetRef.current && targetScrollForIndexRef.current === currentAssessmentIndex) {
      return
    }
    // DOM 반영 이후에 상단 스크롤 실행
    requestAnimationFrame(() => {
      scrollToTop()
      didScrollToTargetRef.current = false
      targetScrollForIndexRef.current = null
    })
  }, [currentAssessmentIndex])

  // 다음 검사지로 이동
  const handleNext = () => {
    const unanswered = validateCurrentAssessment()
    
    if (unanswered.length > 0) {
      // 미답변 항목이 있으면 모달 표시를 부모에 요청 (스크롤은 확인 시 부모가 트리거)
      const firstUnanswered = unanswered[0]
      if (onShowIncompleteModal) {
        onShowIncompleteModal(`${firstUnanswered.index}번 항목을 답변하지 않았습니다.`, firstUnanswered.questionSeq)
      }
      return
    }
    
    // 모든 항목 답변 완료 시
    if (processedData.isLastAssessment) {
      // 마지막 검사지면 완료 처리
      onComplete()
    } else {
      // 중간저장 후 다음 검사지로 이동
      // 자동 저장(모달 없이)
      if (onAutoSave) {
        onAutoSave()
      } else if (onSave) {
        // 하위 호환: onAutoSave가 없을 경우엔 기존 onSave 사용
        onSave()
      }
      onNextAssessment()
    }
  }

  // 이전 검사지로 이동
  const handlePrev = () => {
    onPrevAssessment()
  }

  //! 중간저장과 완료 핸들러는 props로 받아서 사용
  //! onSave와 onComplete를 직접 사용

  // 질문 템플릿 타입 추론 (실제 API 스키마 기반)
  const inferQuestionType = (question, assessmentInfo) => {
    // 1) basicFlag가 true면 기본 질문유형 (짧은 선택지)
    if (assessmentInfo?.basicFlag === true) return 'default'
    
    // 2) basicFlag가 false이고 questionText에 A., B., C. 패턴이 있으면 하위항목형
    if (assessmentInfo?.basicFlag === false) {
      const hasSubItemPattern = /[A-Z]\.\s/.test(question.questionText)
      if (hasSubItemPattern) return 'type01'
      
      // 3) basicFlag가 false이고 하위항목 패턴이 없으면 긴 선택지 세로 나열형
      return 'type02'
    }
    
    // 기본값
    return 'default'
  }

  // Default 템플릿 렌더링 (기본 질문유형 - 짧은 선택지)
  const renderDefaultQuestion = (question, index) => (
    <li key={question.questionSeq}>
      <p className="question">{index + 1}. {question.questionText}</p>
      <div className="answer">
        <ul>
          {question.questionitems.map((item, itemIndex) => (
            <li key={item.questionItemSeq}>
              <div className="input-wrap radio type01">
                <input
                  id={`answer${itemIndex + 1}_q${question.questionSeq}`}
                  type="radio"
                  name={`question${question.questionSeq}`}
                  value={item.itemScore}
                  checked={answers[question.questionSeq] === item.itemScore}
                  onChange={(e) => handleAnswerChange(question.questionSeq, null, parseInt(e.target.value))}
                />
                <label htmlFor={`answer${itemIndex + 1}_q${question.questionSeq}`}>{item.itemScore}</label>
              </div>
              <span>{item.itemText}</span>
            </li>
          ))}
        </ul>
      </div>
    </li>
  )

  // Type01 템플릿 렌더링 (하위항목형 - A., B., C. 패턴)
  const renderType01Question = (question, index) => {
    // questionText에서 주제와 하위항목 분리
    const match = question.questionText.match(/^(.+?)\s+([A-Z])\.\s(.+)$/)
    if (match) {
      const [, mainTitle, subItemLabel, subItemText] = match
      
      return (
        <li key={question.questionSeq} className="template01">
          {/* 첫 번째 하위항목일 때만 주제 제목 표시 */}
          {subItemLabel === 'A' && (
            <p className="question">{index + 1}. {mainTitle}</p>
          )}
          <div className="answer-wrap">
            <div className="answer">
              <p className="sub-question">{subItemLabel}. {subItemText}</p>
              <ul>
                {question.questionitems.map((item, itemIndex) => (
                  <li key={item.questionItemSeq}>
                    <div className="input-wrap radio type01">
                      <input
                        id={`answer${itemIndex + 1}_q${question.questionSeq}`}
                        type="radio"
                        name={`question${question.questionSeq}`}
                        value={item.itemScore}
                        checked={answers[question.questionSeq] === item.itemScore}
                        onChange={(e) => handleAnswerChange(question.questionSeq, null, parseInt(e.target.value))}
                      />
                      <label htmlFor={`answer${itemIndex + 1}_q${question.questionSeq}`}>{item.itemScore}</label>
                    </div>
                    <span>{item.itemText}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </li>
      )
    }
    
    // 패턴이 매치되지 않을 경우 기본 렌더링
    return (
      <li key={question.questionSeq} className="template01">
        <p className="question">{index + 1}. {question.questionText}</p>
        <div className="answer">
          <ul>
            {question.questionitems.map((item, itemIndex) => (
              <li key={item.questionItemSeq}>
                <div className="input-wrap radio type01">
                  <input
                    id={`answer${itemIndex + 1}_q${question.questionSeq}`}
                    type="radio"
                    name={`question${question.questionSeq}`}
                    value={item.itemScore}
                    checked={answers[question.questionSeq] === item.itemScore}
                    onChange={(e) => handleAnswerChange(question.questionSeq, null, parseInt(e.target.value))}
                  />
                  <label htmlFor={`answer${itemIndex + 1}_q${question.questionSeq}`}>{item.itemScore}</label>
                </div>
                <span>{item.itemText}</span>
              </li>
            ))}
          </ul>
        </div>
      </li>
    )
  }

  // Type02 템플릿 렌더링 (긴 선택지 세로 나열형)
  const renderType02Question = (question, index) => (
    <li key={question.questionSeq} className="template02">
      <p className="question">{index + 1}. {question.questionText}</p>
      <div className="answer">
        <ul>
          {question.questionitems.map((item, itemIndex) => (
            <li key={item.questionItemSeq}>
              <div className="input-wrap radio type01">
                <input
                  id={`answer${itemIndex + 1}_q${question.questionSeq}`}
                  type="radio"
                  name={`question${question.questionSeq}`}
                  value={item.itemScore}
                  checked={answers[question.questionSeq] === item.itemScore}
                  onChange={(e) => handleAnswerChange(question.questionSeq, null, parseInt(e.target.value))}
                />
                <label htmlFor={`answer${itemIndex + 1}_q${question.questionSeq}`}>{item.itemScore}</label>
              </div>
              <span>{item.itemText}</span>
            </li>
          ))}
        </ul>
      </div>
    </li>
  )

  // 질문 렌더링 분기
  const renderQuestion = (question, index) => {
    const currentItem = surveyData.itemList[currentAssessmentIndex]
    const assessmentInfo = currentItem?.assessmentInfo
    const type = inferQuestionType(question, assessmentInfo)
    
    switch (type) {
      case 'type01':
        return renderType01Question(question, index)
      case 'type02':
        return renderType02Question(question, index)
      case 'default':
      default:
        return renderDefaultQuestion(question, index)
    }
  }

  return (
    <div className="inner">
      <div className="title-wrap">
        <button className="back-btn" type="button" aria-label="뒤로가기" onClick={onBack}></button>
        <strong>{questionTypeText ? ` ${questionTypeText}` : ''}</strong>
      </div>
      <div className="con-wrap">
        <div className="survey-list">
          <div className="top-info">
            <div>
              <div className="tit-wrap">
                <strong>{processedData.assessmentName ? `${processedData.assessmentName}${processedData.associatedDisorder ? ' ' + processedData.associatedDisorder : ''}` : '문항 응답'}검사</strong>
                <span className="total">총 {processedData.totalQuestions}문항</span>
              </div>
              <div className="btn-wrap">
                <button className="type07" type="button" onClick={onSave}>중간저장</button>
                {/* <button className="type07 black" type="button" onClick={onComplete}>완료</button> */}
              </div>
            </div>
            <p style={{ paddingTop: '0' }}>{processedData.description}</p>
          </div>
          <div className="list-wrap">
            <ul>
              {processedData.questions.map((question, index) => 
                renderQuestion(question, index)
              )}
            </ul>
          </div>
          
          {/* 이전/다음 버튼 */}
          <div className="btn-wrap navigation-buttons" style={{ marginTop: '40px', textAlign: 'center' }}>
            <button 
              className="type07" 
              type="button" 
              onClick={handlePrev}
              disabled={currentAssessmentIndex === 0}
            >
              이전 검사지
            </button>
            <button 
              className={`type07 ${processedData.isLastAssessment ? 'green' : 'black'}`} 
              type="button"
              onClick={handleNext}
            >
              {processedData.isLastAssessment ? '완료' : '다음 검사지'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SurveyForm
