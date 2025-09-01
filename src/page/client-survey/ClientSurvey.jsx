import React, { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import './client_survey.scss'
import PrivacyPolicy from './PrivacyPolicy'
import SurveyForm from './SurveyForm'
import SurveyModal from './SurveyModal'
import { clientExamSet, clientExamTempSave, clientExamSave } from '../../api/apiCaller'

function ClientSurvey() {
  const location = useLocation()
  const [showSurvey, setShowSurvey] = useState(false)
  const [scroll, setScroll] = useState(false)
  const [answers, setAnswers] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('start') // 'start', 'complete', 'incomplete', 'save', 'exit'
  const [hasIntermediateData, setHasIntermediateData] = useState(false)
  const [userName, setUserName] = useState('홍길동') // 사용자 이름
  const [examSetData, setExamSetData] = useState(null) // 검사 세트 데이터
  const [currentAssessmentIndex, setCurrentAssessmentIndex] = useState(0) // 현재 검사지 인덱스
  const [modalOverrideTitle, setModalOverrideTitle] = useState('')
  const [modalOverrideMessage, setModalOverrideMessage] = useState('')
  const [pendingScrollSeq, setPendingScrollSeq] = useState(null)
  const [scrollTargetSeq, setScrollTargetSeq] = useState(null)

  // 답변 데이터를 API 파라미터 구조로 변환
  const convertAnswersToApiFormat = (answers) => {
    const result = []
    
    if (!examSetData?.itemList) return result
    
    Object.entries(answers).forEach(([key, value]) => {
      // key가 "questionSeq_subSeq" 형태인지 확인 (하위항목)
      const isSubQuestion = key.includes('_')
      const questionSeq = isSubQuestion ? parseInt(key.split('_')[0]) : parseInt(key)
      
      // 해당 질문이 속한 검사지와 setItemSeq 찾기
      let targetSetItemSeq = null
      let targetQuestionItemSeq = null
      
      examSetData.itemList.forEach(item => {
        const questions = item.assessmentInfo?.questions || []
        const question = questions.find(q => q.questionSeq === questionSeq)
        
        if (question) {
          targetSetItemSeq = item.setItemSeq
          // 선택된 점수에 해당하는 questionItemSeq 찾기
          const selectedItem = question.questionitems?.find(qItem => qItem.itemScore === value)
          if (selectedItem) {
            targetQuestionItemSeq = selectedItem.questionItemSeq
          }
        }
      })
      
      if (targetSetItemSeq && targetQuestionItemSeq) {
        result.push({
          setItemSeq: targetSetItemSeq,
          questionSeq: questionSeq,
          answerItemSeq: targetQuestionItemSeq
        })
      }
    })
    
    return result
  }

  // 중간저장 데이터 확인 및 설정 함수
  const checkAndSetIntermediateData = (examSetResponse) => {
    if (!examSetResponse?.itemList) {
      setHasIntermediateData(false)
      return
    }

    const savedAnswers = {}
    let hasAnyAnswer = false

    // 모든 검사지의 질문들을 순회하며 answerQuestionitemSeq 확인
    examSetResponse.itemList.forEach(item => {
      const questions = item.assessmentInfo?.questions || []
      questions.forEach(question => {
        if (question.answerQuestionitemSeq !== null && question.answerQuestionitemSeq !== undefined) {
          // answerQuestionitemSeq가 있으면 해당 선택지의 itemScore 찾기
          const selectedItem = question.questionitems?.find(qItem => 
            qItem.questionItemSeq === question.answerQuestionitemSeq
          )
          if (selectedItem) {
            savedAnswers[question.questionSeq] = selectedItem.itemScore
            hasAnyAnswer = true
          }
        }
      })
    })

    if (hasAnyAnswer) {
      console.log('중간저장 데이터 발견:', savedAnswers)
      setHasIntermediateData(true)
      setAnswers(savedAnswers)
    } else {
      console.log('중간저장 데이터 없음')
      setHasIntermediateData(false)
    }
  }

  // 초기 모달 표시 함수
  const showInitialModal = () => {
    // override 초기화
    setModalOverrideTitle('')
    setModalOverrideMessage('')
    setModalType('start')
    setShowModal(true)
  }

  // URL에서 token 파라미터 추출 함수
  const getTokenFromUrl = () => {
    const urlParams = new URLSearchParams(location.search)
    return urlParams.get('token')
  }

  // clientExamSet API 호출 함수
  const fetchExamSet = async () => {
    try {
      const token = getTokenFromUrl()
      if (!token) {
        console.error('URL에 token 파라미터가 없습니다.')
        return
      }

      const response = await clientExamSet({ token })
      setExamSetData(response.data)
      
      // 응답 데이터에서 사용자 이름 설정 (있는 경우)
      if (response.data?.clientName) {
        setUserName(response.data.clientName)
      }
      
      // 중간저장 데이터 확인 및 설정
      checkAndSetIntermediateData(response.data)
    } catch (error) {
      console.error('clientExamSet 호출 실패:', error)
    }
  }

  // 컴포넌트 마운트 시 검사 세트 조회 및 모달 표시
  useEffect(() => {
    fetchExamSet()
    showInitialModal()
  }, [])

  // URL 변경 감지하여 모달 다시 표시
  useEffect(() => {
    // 현재 경로가 ClientSurvey 경로이고, 모달이 닫혀있고, 설문이 시작되지 않은 상태라면 모달 표시
    if (location.pathname.includes('client-survey') && !showModal && !showSurvey) {
      showInitialModal()
    }
  }, [location.pathname])

  const handleStartSurvey = () => {
    setShowSurvey(true)
    setShowModal(false)
  }

  const handleBackToPrivacy = () => {
    setShowSurvey(false)
  }

  const handleSave = async () => {
    try {
      // 답변 데이터를 API 파라미터 구조로 변환
      const apiParams = convertAnswersToApiFormat(answers)
      
      if (apiParams.length === 0) {
        console.warn('저장할 답변 데이터가 없습니다.')
        return
      }
      
      // API 호출
      const token = getTokenFromUrl()
      await clientExamTempSave({ token, params: apiParams })
      console.log('중간저장 성공:', apiParams)
      
      // 모달 상태 강제 리셋 후 새로운 모달 표시
      setShowModal(false)
      setTimeout(() => {
        // override 초기화 후 save 모달 표시
        setModalOverrideTitle('')
        setModalOverrideMessage('')
        setModalType('save')
        setShowModal(true)
        console.log('중간저장 모달 상태 설정 완료')
      }, 100)
    } catch (error) {
      console.error('중간저장 실패:', error)
      // 에러 발생 시에도 모달 표시 (사용자에게 알림)
      setShowModal(false)
      setTimeout(() => {
        setModalOverrideTitle('저장 실패')
        setModalOverrideMessage('중간저장에 실패했습니다. 다시 시도해주세요.')
        setModalType('save')
        setShowModal(true)
      }, 100)
    }
  }

  // 다음 검사지 이동 시 조용한 자동 저장 (모달 없음)
  const handleAutoSave = async () => {
    try {
      // 답변 데이터를 API 파라미터 구조로 변환
      const apiParams = convertAnswersToApiFormat(answers)
      
      if (apiParams.length === 0) {
        console.warn('자동저장할 답변 데이터가 없습니다.')
        return
      }
      
      // API 호출 (조용한 자동 저장)
      const token = getTokenFromUrl()
      await clientExamTempSave({ token, params: apiParams })
      console.log('자동저장 성공:', apiParams)
    } catch (e) {
      console.warn('자동 저장 실패:', e)
    }
  }

  const handleComplete = async () => {
    // examSetData에서 총 문항 수 계산
    let totalQuestions = 0
    if (examSetData && examSetData.itemList) {
      examSetData.itemList.forEach(item => {
        if (item.assessmentInfo && item.assessmentInfo.questions) {
          totalQuestions += item.assessmentInfo.questions.length
        }
      })
    }
    
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
    
    try {
      // 최종 제출 API 호출
      const apiParams = convertAnswersToApiFormat(answers)
      if (apiParams.length === 0) {
        console.warn('제출할 답변 데이터가 없습니다.')
        return
      }
      
      const token = getTokenFromUrl()
      await clientExamSave({ token, params: apiParams })
      console.log('완료 저장 성공:', apiParams)
      
      // 모달 상태 강제 리셋 후 새로운 모달 표시
      setShowModal(false)
      setTimeout(() => {
        setModalType('complete')
        setShowModal(true)
        console.log('완료 모달 상태 설정 완료')
      }, 100)
    } catch (error) {
      console.error('완료 저장 실패:', error)
      setShowModal(false)
      setTimeout(() => {
        setModalOverrideTitle('제출 실패')
        setModalOverrideMessage('제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
        setModalType('save')
        setShowModal(true)
      }, 100)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setModalOverrideTitle('')
    setModalOverrideMessage('')
  }

  const handleModalCancel = () => {
    setShowModal(false)
    setModalOverrideTitle('')
    setModalOverrideMessage('')
    // 그만두기 클릭 시 중간 저장 데이터는 API에서 관리됨
    window.history.back()
  }

  const handleModalStart = () => {
    setShowModal(false)
    setModalOverrideTitle('')
    setModalOverrideMessage('')
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
    if (modalType === 'incomplete') {
      // 모달 확인 시에만 스크롤 트리거
      if (pendingScrollSeq !== null && pendingScrollSeq !== undefined) {
        setScrollTargetSeq(pendingScrollSeq)
        setPendingScrollSeq(null)
      }
      // incomplete용 override는 확인 후 초기화
      setModalOverrideTitle('')
      setModalOverrideMessage('')
      return
    }
    if (modalType === 'complete') {
      // 완료 후 이전 페이지로 이동
      window.history.back()
    }
  }

  // SurveyForm에서 미답변 발견 시 모달 표시 요청을 처리
  const handleShowIncompleteModal = (message, questionSeq) => {
    setModalType('incomplete')
    setModalOverrideTitle('검사를 모두 완료해 주세요.')
    setModalOverrideMessage(message || '아직 응답하지 않은 문항이 있습니다. 모든 문항에 응답 후 진행해 주세요.')
    setPendingScrollSeq(questionSeq ?? null)
    setShowModal(true)
  }

  const handleModalContinue = () => {
    setShowModal(false)
    setModalOverrideTitle('')
    setModalOverrideMessage('')
    // 계속하기 - 모달만 닫고 검사 계속
  }

  const handleModalExit = () => {
    setShowModal(false)
    setModalOverrideTitle('')
    setModalOverrideMessage('')
    // 나가기 - 동의 화면으로 복귀
    setShowSurvey(false)
  }

  // questionType 표시 텍스트 생성 (괄호 안에 표시)
  const questionTypeText = useMemo(() => {
    const qt = examSetData?.questionType
    if (!qt) return ''
    if (qt === 'PRE') return '사전 문진'
    if (qt === 'PROG') {
      const seq = examSetData?.sessionSeq
      return `경과 문진${seq ? ` ${seq}회기` : ''}`
    }
    if (qt === 'POST') return '사후 문진'
    return ''
  }, [examSetData])

  // 백 버튼 클릭 시 나가기 모달 표시
  const handleBackToPrivacyWithModal = () => {
    // override 초기화 후 consent 모달 표시
    setModalOverrideTitle('')
    setModalOverrideMessage('')
    setModalType('consent')
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
          overrideTitle={modalOverrideTitle || undefined}
          overrideMessage={modalOverrideMessage || undefined}
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
                      {questionTypeText ? ` ${questionTypeText}` : ''}
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
                    </div>
                  </div>
                </div>
              </header>
              <SurveyForm 
                surveyData={examSetData} 
                currentAssessmentIndex={currentAssessmentIndex}
                onBack={handleBackToPrivacyWithModal}
                onScrollChange={setScroll}
                answers={answers}
                onAnswersChange={setAnswers}
                onSave={handleSave}
                onAutoSave={handleAutoSave}
                onComplete={handleComplete}
                onPrevAssessment={() => setCurrentAssessmentIndex(prev => Math.max(0, prev - 1))}
                onNextAssessment={() => setCurrentAssessmentIndex(prev => prev + 1)}
                onShowIncompleteModal={handleShowIncompleteModal}
                scrollTargetSeq={scrollTargetSeq}
                onScrollTargetConsumed={() => setScrollTargetSeq(null)}
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