import React, { useState, useEffect, useRef } from "react";
import { createPortal } from 'react-dom';
import IconLoading from "@/assets/images/common/loading.svg";
import CharacterImg from "@/assets/images/common/character.svg";
import CharacterBkImg from "@/assets/images/common/character_bk.svg";
import EditorModal from '../page/clients/components/EditorModal';
import { dislikeCodeList, dislikeFind, assessmentSetUpdateOverallInsightDislike, assessmentSetFind } from '@/api/apiCaller';

function AiPanelCommon({
  open,
  onClose,
  status = "complete", // creating, analyzing, error, complete
  title,
  description,
  infoMessage,
  keyInfo,
  keyInfoText,
  renderComplete, // 완료시 결과 영역 렌더 함수
  isRecordings = false,
  isCounselLog = false,
  onConfirm, // 확정하기 콜백
  onSkip, // 생략하기 콜백
  sessionSeq, // dislike API 호출용
  setSeq, // AI 종합 의견 패널 전용(assessmentSet용)
  showToastMessage, // 토스트 표시 콜백
  currentFieldKeys, // { codeKey: 'counselingSummaryCode', textKey: 'counselingSummaryText' } 등
  openSkipTrigger, // 외부에서 생략 사유 UI 열기 트리거
  hideBottomActions = false, // 하단 공용 버튼 숨김 여부
  skipAnchorEl, // 생략 사유 UI를 렌더링할 외부 앵커 엘리먼트 (있으면 해당 위치에 포털로 렌더)
}) {
  const [showSkipReason, setShowSkipReason] = useState(false);
  const [selectedReason, setSelectedReason] = useState(''); // 단일 선택으로 변경
  const [showDirectInputModal, setShowDirectInputModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showTooltip2, setShowTooltip2] = useState(false);
  const [directInput, setDirectInput] = useState("");  // 직접입력 상태
  const [skipReasons, setSkipReasons] = useState([]); // 동적으로 로드
  const [existingSkip, setExistingSkip] = useState(null); // { code, text } or null

  // dislikeCodeList API 호출하여 skipReasons 로드
  useEffect(() => {
    const loadSkipReasons = async () => {
      try {
        const response = await dislikeCodeList();
        if (response.code === 200 && response.data) {
          setSkipReasons(response.data);
        }
      } catch (error) {
        console.error('skipReasons 로드 실패:', error);
      }
    };
    loadSkipReasons();
  }, []);

  // 패널이 열릴 때 dislikeFind로 기존 생략 데이터 조회
  useEffect(() => {
    const fetchExistingSkip = async () => {
      if (!open) return;
      try {
        // AI 종합 의견 생성 패널: assessmentSet 기반 조회로 복원
        if (isRecordings && setSeq) {
          const resp = await assessmentSetFind(parseInt(setSeq, 10));
          const data = resp?.data ?? null;
          const codeValue = data?.aiOverallInsightDislikeCode ?? null;
          const textValue = data?.aiOverallInsightDislikeText ?? null;
          if ((codeValue && String(codeValue).trim() !== '') || (textValue && String(textValue).trim() !== '')) {
            setExistingSkip({ code: codeValue, text: textValue });
            if (codeValue) setSelectedReason(codeValue);
            else if (textValue) setSelectedReason('__direct__');
            else setSelectedReason('');
            if (textValue) setDirectInput(String(textValue));
            return;
          }
          setExistingSkip(null);
          setSelectedReason('');
          return;
        }

        // 그 외 패널: session 기반 dislikeFind + currentFieldKeys 사용
        if (!sessionSeq || !currentFieldKeys) return;
        const resp = await dislikeFind(sessionSeq);
        const data = resp?.data ?? null;
        if (data && (currentFieldKeys.codeKey || currentFieldKeys.textKey)) {
          const codeValue = currentFieldKeys.codeKey ? data[currentFieldKeys.codeKey] : undefined;
          const textValue = currentFieldKeys.textKey ? data[currentFieldKeys.textKey] : undefined;
          if ((codeValue && String(codeValue).trim() !== '') || (textValue && String(textValue).trim() !== '')) {
            setExistingSkip({ code: codeValue, text: textValue });
            if (codeValue) setSelectedReason(codeValue);
            else if (textValue) setSelectedReason('__direct__');
            if (textValue) setDirectInput(String(textValue));
            return;
          }
        }
        setExistingSkip(null);
        setSelectedReason('');
      } catch (e) {
        setExistingSkip(null);
        setShowSkipReason(false);
        setSelectedReason('');
      }
    };
    fetchExistingSkip();
  }, [open, sessionSeq, currentFieldKeys, isRecordings, setSeq]);

  // 외부 트리거로 생략 사유 UI 열기
  const prevTriggerRef = useRef(null);
  const [isFirstMount, setIsFirstMount] = useState(true);
  
  useEffect(() => {
    if (!open) return;
    
    // 첫 마운트 시점은 무시
    if (isFirstMount) {
      prevTriggerRef.current = openSkipTrigger;
      setIsFirstMount(false);
      return;
    }
    
    // 트리거 값이 변경되었을 때만 열기
    if (prevTriggerRef.current !== openSkipTrigger && openSkipTrigger != null) {
      setShowSkipReason(true);
      prevTriggerRef.current = openSkipTrigger;
    }
  }, [openSkipTrigger, open, isFirstMount]);

  const handleSaveDirectInput = async (value) => {
    const text = String(value ?? directInput).trim();
    if (!text) return;
    try {
      // AI 종합 의견 생성 패널 전용 전담 API 호출 (assessmentSet 기반)
      if (isRecordings && setSeq) {
        await assessmentSetUpdateOverallInsightDislike({
          setSeq: parseInt(setSeq, 10),
          aiOverallInsightDislikeCode: null,
          aiOverallInsightDislikeText: text,
        });
        if (typeof showToastMessage === 'function') {
          showToastMessage('피드백이 전송되었습니다.');
        }
        if (typeof onClose === 'function') {
          onClose();
        }
      } else if (onSkip) {
        // 기타 패널은 기존 onSkip 경로 유지 (sessionSeq 기반)
        onSkip(null, text);
      }
    } catch (e) {
      console.error('직접입력 생략 사유 전송 실패:', e);
    } finally {
      setSelectedReason('__direct__');
      setShowDirectInputModal(false);
      setDirectInput("");
      setShowSkipReason(false);
    }
  };

  // 생략하기 버튼 클릭 - 조회는 하지 않고 단순 펼침만 수행
  const handleSkip = () => {
    setShowSkipReason(true);
  };

  // 확정하기 버튼 클릭
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  // 생략 사유 선택 (단일 선택, 즉시 API 호출)
  const handleReasonClick = async (reason) => {
    setSelectedReason(reason.code);
    try {
      // AI 종합 의견 생성 패널 전용 전담 API 호출 (assessmentSet 기반)
      if (isRecordings && setSeq) {
        await assessmentSetUpdateOverallInsightDislike({
          setSeq: parseInt(setSeq, 10),
          aiOverallInsightDislikeCode: reason.code,
          aiOverallInsightDislikeText: null,
        });
        if (typeof showToastMessage === 'function') {
          showToastMessage('피드백이 전송되었습니다.');
        }
        if (typeof onClose === 'function') {
          onClose();
        }
      } else if (onSkip) {
        // 기타 패널은 기존 onSkip 경로 유지 (sessionSeq 기반)
        onSkip(reason.code, null);
      }
    } catch (e) {
      console.error('생략 사유 전송 실패:', e);
    } finally {
      setShowSkipReason(false);
    }
  };

  // 직접입력 버튼 클릭
  const handleDirectInput = () => {
    if (existingSkip?.text) {
      setDirectInput(String(existingSkip.text));
    }
    setShowDirectInputModal(true);
  };

  // 직접입력 모달 닫기
  const handleCloseDirectInput = () => {
    setShowDirectInputModal(false);
  };

  return (
    <>
      <div className={"support-panel ai-create" + (open ? " on" : "") }>
        <div className="inner">
          <div className="panel-tit">
            <div className="tit-wrap">
              <strong>{title}</strong>
              <button className="close-btn" type="button" aria-label="닫기" onClick={onClose}></button>
            </div>
            <div className="info">
              <p>{description}</p>
            </div>
          </div>
          <div className="panel-cont">
            {status === "creating" && (
              <div className="creating">
                <img src={IconLoading} alt="로딩" />
                <p>AI가 생성하고 있습니다.</p>
              </div>
            )}
            {status === "analyzing" && (
              <div className="analyzing">
                <img src={CharacterImg} alt="ixi 캐릭터" />
                <p>
                  앗! 아직 AI 분석 중입니다.<br />
                  최대 <span>24</span>시간 후 확인 할 수 있어요!
                </p>
              </div>
            )}
            {status === "error" && (
              <div className="create-error">
                <img src={CharacterBkImg} alt="ixi 캐릭터" />
                <p>
                  시스템 오류로 결과가 생성되지 않았습니다.<br />
                  서비스 운영자에게 문의 바랍니다.
                </p>
              </div>
            )}
            {status === "complete" && (
              <div className="complete" style={{ paddingBottom: '2.4rem' }}>
                <div className="top-info">
                  <p dangerouslySetInnerHTML={{ __html: infoMessage }}></p>
                  {keyInfo && (
                    <p
                      className="key-info"
                      style={{ display: "block", fontWeight: "bold" }}
                      dangerouslySetInnerHTML={{ __html: keyInfoText }}
                    />
                  )}
                </div>
                {renderComplete && <div className="con-wrap">
                  {isRecordings ? <div className="complete-tit">
                    <strong>AI 종합 의견 생성 결과</strong>
                  </div> : isCounselLog ? <div className="complete-tit">
                    <strong>AI 생성 결과</strong>
                  </div> : null}
                  {renderComplete()}
                </div>}
                {!hideBottomActions && (
                  <div className="btn-wrap">
                    <div className="tooltip-wrap">
                      <button className="type04 skip-btn" type="button" onClick={handleSkip} onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>생략하기</button>
                      <div className={`tooltip${showTooltip ? " show" : ""}`}>
                        결과가 정확하지 않거나 적절하지 않은 경우에는<br />생략하기를 선택 할 수 있어요.
                      </div>
                    </div>
                    <div className="tooltip-wrap">
                      <button className="type09" type="button" onClick={handleConfirm} onMouseEnter={() => setShowTooltip2(true)} onMouseLeave={() => setShowTooltip2(false)}>확정하기</button>
                      <div className={`tooltip${showTooltip2 ? " show" : ""}`}>
                        <p>적절한 분석인 경우에는 확정하기를 통해<br />본문에 반영 할 수 있어요.<br /></p>
                        <p>약간의 수정이 필요한 경우에는 <br />확정하기 후 수정이 가능해요.</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="bottom-info" style={showSkipReason ? { display: "none" } : {}}>
                  <p>
                    AI는 실수 할 수 있어요. 내담자에게 적절한 내용인지 확인하세요.<br />상담사님의 의견을 바탕으로 지속적으로 개선되고 있어요.
                  </p>
                </div>
                {showSkipReason && (() => {
                  const content = (
                    <div className="skip-reason" style={{ display: "block" }}>
                      <p className="reason-tit">생락하려는 이유가 무엇인가요? 자세히 알려주세요.</p>
                      {null}
                      <div className="reason-wrap">
                        <ul>
                          {skipReasons.map((reason) => (
                            <li key={reason.code}>
                              <a
                                className={"link-btn cursor-pointer" + (selectedReason === reason.code ? " on" : "")}
                                onClick={() => handleReasonClick(reason)}
                              >
                                {reason.value}
                              </a>
                            </li>
                          ))}
                          <li>
                            <a
                              className={"link-btn cursor-pointer" + (selectedReason === '__direct__' ? ' on' : '')}
                              onClick={handleDirectInput}
                            >
                              직접입력
                            </a>
                          </li>
                        </ul>
                        <p className={"select-complete" + (selectedReason ? " on" : "")}>피드백을 주셔서 감사합니다.</p>
                      </div>
                    </div>
                  );
                  
                  // skipAnchorEl이 유효한 DOM 요소인지 확인 후 포털 렌더링
                  if (skipAnchorEl && skipAnchorEl.nodeType === Node.ELEMENT_NODE) {
                    return createPortal(content, skipAnchorEl);
                  } else {
                    return content;
                  }
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* 직접입력 모달 */}
      {showDirectInputModal && (
        <EditorModal
          open={showDirectInputModal}
          onClose={handleCloseDirectInput}
          onSave={handleSaveDirectInput}
          title="자유롭게 구체적인 내용을 기재해 주세요."
          className="direct-input"
          placeholder="기대했던 내용은 무엇인가요? 어떻게 개선 할 수 있을까요?"
          maxLength={200}
          initialValue={directInput}
          saveDisabled={false}
        />
      )}
    </>
  );
}

export default AiPanelCommon;
