import React from 'react'

function SurveyModal({ 
  modalType = 'start', // 'start', 'complete', 'incomplete', 'save', 'exit'
  hasIntermediateData = false,
  userName = '홍길동',
  onClose, 
  onCancel, 
  onStart,
  onConfirm,
  onContinue,
  onExit,
}) {
  // 모달 타입별 설정
  const getModalConfig = () => {
    switch (modalType) {
      case 'complete':
        return {
          className: 'modal client-survey type01',
          title: `${userName}님의 검사가 완료되어 제출 되었습니다.`,
          message: '검사 결과는 담당 상담사님께 문의해 주세요.',
          buttons: [
            { text: '확인', className: 'type10', onClick: onConfirm }
          ]
        }
      case 'incomplete':
        return {
          className: 'modal client-survey type01',
          title: '검사를 모두 완료해 주세요.',
          message: '아직 응답하지 않은 문항이 있습니다. 모든 문항에 응답 후 검사지를 제출해 주세요.',
          buttons: [
            { text: '확인', className: 'type10', onClick: onConfirm }
          ]
        }
      case 'save':
        return {
          className: 'modal client-survey',
          title: '검사가 중간 저장 되었습니다. 검사를 이어 하시겠습니까?',
          message: '지금 중단해도 검사는 나중에 이어서 계속 진행하실 수 있습니다.',
          buttons: [
            { text: '나가기', className: 'type08', onClick: onExit },
            { text: '계속하기', className: 'type08 black', onClick: onContinue }
          ]
        }
      case 'exit':
        return {
          className: 'modal client-survey',
          title: '검사를 그만하시겠습니까?',
          message: '지금 중단해도 검사는 나중에 이어서 계속 진행하실 수 있습니다.',
          buttons: [
            { text: '나가기', className: 'type08', onClick: onExit },
            { text: '계속하기', className: 'type08 black', onClick: onContinue }
          ]
        }
      default: // 'start'
        return {
          className: 'modal client-survey',
          title: hasIntermediateData 
            ? '검사를 이어서 실시하시겠습니까?' 
            : 'PHQ-9 우울 검사를 실시하겠습니까?',
          message: hasIntermediateData 
            ? '이전에 중간 저장한 문항 이후 부터 검사를 다시 시작합니다.'
            : '검사는 중간에 잠시 멈출 수 있으며, 나중에 이어서 계속 진행하실 수 있습니다.<br />최종 응답을 제출한 후에는 답안을 수정할 수 없습니다.',
          buttons: [
            { text: '그만두기', className: 'type08', onClick: onCancel },
            { text: '시작하기', className: 'type08 black', onClick: onStart }
          ]
        }
    }
  }

  const config = getModalConfig()

  return (
    <div className={config.className + ' on'}>
      <div className="inner">
        <div className="modal-hd">
          <strong>{config.title}</strong>
          <button 
            className="close-btn" 
            type="button" 
            aria-label="닫기"
            onClick={onClose}
          ></button>
        </div>
        <div className="modal-info">
          {config.message.includes('<br />') ? (
            <p dangerouslySetInnerHTML={{ __html: config.message }} />
          ) : (
            <p>{config.message}</p>
          )}
        </div>
        <div className="btn-wrap">
          {config.buttons.map((button, index) => (
            <button 
              key={index}
              className={button.className} 
              type="button"
              onClick={button.onClick}
            >
              {button.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SurveyModal
