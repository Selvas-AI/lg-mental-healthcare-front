import React, { useState } from "react";
import "../consults.scss";
import IconLoading from "@/assets/images/common/loading.svg";
import EditorModal from "../../components/EditorModal";

const SKIP_REASONS = [
  "약간의 수정이 필요해요",
  "정확하지 않아요.",
  "보완이 필요해요",
  "너무 단순해요",
  "올바른 사실이 아니에요",
  "맥락을 잘못 파악 했어요",
  "문제의 소지가 있는 표현이 있어요",
];

function AiSummaryPanel({ open, onClose }) {
  // 생성완료/생성중 상태, 생략 사유 노출 여부, 선택된 사유, 직접입력 모달 상태
  const [showSkipReason, setShowSkipReason] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [showDirectInputModal, setShowDirectInputModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showTooltip2, setShowTooltip2] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [directInput, setDirectInput] = useState("");  // 직접입력 상태

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
      <div className={"support-panel ai-create" + (open ? " on" : "")}>
        <div className="inner">
          <div className="panel-tit">
            <div className="tit-wrap">
              <strong>AI 종합 의견 생성</strong>
              <button className="close-btn" type="button" aria-label="닫기" onClick={onClose}></button>
            </div>
            <div className="info">
              <p>AI가 심리 검사 종합 의견을 생성합니다.</p>
            </div>
          </div>
          <div className="panel-cont">
            {isCreating ? (
              // 생성중
              <div className="creating">
                <img src={IconLoading} alt="로딩" />
                <p>AI가 생성하고 있습니다.</p>
              </div>
            ) : (
              // 생성완료
            <div className="complete">
              <div className="top-info">
                <p>AI 종합 의견이 생성 완료되었습니다.</p>
                {/* 재생성 시 노출되는 텍스트 / on class 추가하여 노출 */}
                <p className="key-info">
                  재생성된 내용을 확정하면 원래의 내용은 사라지고<br />
                  다시 복구할 수 없어요.
                </p>
              </div>
              <div className="con-wrap">
                <div className="complete-tit">
                  <strong>AI 종합 의견 생성 결과</strong>
                </div>
                <div className="complete-cont">
                  <div>3회기에서는 지난 1,2회기 보다 우울 점수가 낮아졌습니다. 7회기 문항 [Q. 죽음에 대해 생각해 보신 적이 있습니까?] 에서 이전과 달리 1점을 선택했기 때문에 우울 증상이 많이 완화된 것으로 보입니다.</div>
                  <br />
                  <strong>추천 방법</strong>
                  <div className="bullet-line">증상이 심화되지 않도록 마음 챙김 훈련이 필요</div>
                  <div className="bullet-line">작은 목표를 정하여 성취하는 것이 중요(예를 들어 하루에 10분 산책, 간단한 집안일 완수 등)</div>
                  <div className="bullet-line">규칙적인 생활습관을 권장하며, 수면,식사, 운동과 관련된 구체적인 습관을 가지기</div>
                </div>
              </div>
              <div className="btn-wrap">
                <div className="tooltip-wrap">
                  <button className="type04 skip-btn" type="button" onClick={handleSkip} onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>생략하기</button>
                  <div className={`tooltip${showTooltip ? " show" : ""}`}>
                    결과가 정확하지 않거나 적절하지 않은 경우에는<br />
                    생략하기를 선택 할 수 있어요.
                  </div>
                </div>
                <div className="tooltip-wrap">
                  <button className="type09" type="button" onMouseEnter={() => setShowTooltip2(true)} onMouseLeave={() => setShowTooltip2(false)}>확정하기</button>
                  <div className={`tooltip${showTooltip2 ? " show" : ""}`}>
                    <p>
                      적절한 분석인 경우에는 확정하기를 통해<br />
                      본문에 반영 할 수 있어요.<br />
                    </p>
                    <p>
                      약간의 수정이 필요한 경우에는 <br />
                      확정하기 후 수정이 가능해요.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bottom-info" style={showSkipReason ? { display: "none" } : {}}>
                <p>
                  AI는 실수 할 수 있어요. 내담자에게 적절한 내용인지 확인하세요.<br />
                  상담사님의 의견을 바탕으로 지속적으로 개선되고 있어요.
                </p>
              </div>
              <div className="skip-reason" style={showSkipReason ? { display: "block" } : {}}>
                <p className="reason-tit">생락하려는 이유가 무엇인가요? 자세히 알려주세요.</p>
                <div className="reason-wrap">
                  <ul>
                    {SKIP_REASONS.map((reason) => (
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
                  <p className={"select-complete" + (selectedReasons.length > 0 ? " on" : "")}>
                    피드백을 주셔서 감사합니다.
                  </p>
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

export default AiSummaryPanel;
