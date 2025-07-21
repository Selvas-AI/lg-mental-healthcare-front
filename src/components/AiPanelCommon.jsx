import React, { useState } from "react";
import IconLoading from "@/assets/images/common/loading.svg";
import CharacterImg from "@/assets/images/common/character.svg";
import CharacterBkImg from "@/assets/images/common/character_bk.svg";
import EditorModal from '../page/clients/components/EditorModal';

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
}) {
  const [showSkipReason, setShowSkipReason] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [showDirectInputModal, setShowDirectInputModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showTooltip2, setShowTooltip2] = useState(false);
  const [directInput, setDirectInput] = useState("");  // 직접입력 상태
  const skipReasons = [
    "약간의 수정이 필요해요",
    "정확하지 않아요.",
    "보완이 필요해요",
    "너무 단순해요",
    "올바른 사실이 아니에요",
    "맥락을 잘못 파악 했어요",
    "문제의 소지가 있는 표현이 있어요",
  ];

  const handleSaveDirectInput = () => {
    // TODO: 저장 처리
    setShowDirectInputModal(false);
    setDirectInput("");
  };

  // 생략하기 버튼 클릭
  const handleSkip = () => {
    setShowSkipReason(true);
  };

    // 생략 사유 토글
  const handleReasonClick = (reason) => {
    setSelectedReasons((prev) => {
      if (prev.includes(reason)) {
        return prev.filter((r) => r !== reason);
      } else {
        return [...prev, reason];
      }
    });
  };

    // 직접입력 버튼 클릭
  const handleDirectInput = () => {
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
              <div className="complete">
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
                <div className="btn-wrap">
                  <div className="tooltip-wrap">
                    <button className="type04 skip-btn" type="button" onClick={handleSkip} onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>생략하기</button>
                    <div className={`tooltip${showTooltip ? " show" : ""}`}>
                      결과가 정확하지 않거나 적절하지 않은 경우에는<br />생략하기를 선택 할 수 있어요.
                    </div>
                  </div>
                  <div className="tooltip-wrap">
                    <button className="type09" type="button" onMouseEnter={() => setShowTooltip2(true)} onMouseLeave={() => setShowTooltip2(false)}>확정하기</button>
                    <div className={`tooltip${showTooltip2 ? " show" : ""}`}>
                      <p>적절한 분석인 경우에는 확정하기를 통해<br />본문에 반영 할 수 있어요.<br /></p>
                      <p>약간의 수정이 필요한 경우에는 <br />확정하기 후 수정이 가능해요.</p>
                    </div>
                  </div>
                </div>
                <div className="bottom-info" style={showSkipReason ? { display: "none" } : {}}>
                  <p>
                    AI는 실수 할 수 있어요. 내담자에게 적절한 내용인지 확인하세요.<br />상담사님의 의견을 바탕으로 지속적으로 개선되고 있어요.
                  </p>
                </div>
                <div className="skip-reason" style={showSkipReason ? { display: "block" } : {}}>
                  <p className="reason-tit">생락하려는 이유가 무엇인가요? 자세히 알려주세요.</p>
                  <div className="reason-wrap">
                    <ul>
                      {skipReasons.map((reason) => (
                        <li key={reason}>
                          <a
                            className={"link-btn cursor-pointer" + (selectedReasons.includes(reason) ? " on" : "")}
                            onClick={() => handleReasonClick(reason)}
                          >
                            {reason}
                          </a>
                        </li>
                      ))}
                      <li>
                        <a
                          className={"link-btn cursor-pointer"}
                          onClick={handleDirectInput}
                        >
                          직접입력
                        </a>
                      </li>
                    </ul>
                    <p className={"select-complete" + (selectedReasons.length > 0 ? " on" : "")}>피드백을 주셔서 감사합니다.</p>
                  </div>
                </div>
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
          saveDisabled={directInput.length === 0 || directInput.length > 200}
        />
      )}
    </>
  );
}

export default AiPanelCommon;
