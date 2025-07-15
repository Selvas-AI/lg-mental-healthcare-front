import React, { useState } from "react";
import loadingImg from "@/assets/images/common/loading.svg";
import characterImg from "@/assets/images/common/character.svg";
import characterBkImg from "@/assets/images/common/character_bk.svg";
import KeywordBox from "../transcript/KeywordBox";
import FrequencyBox from "../transcript/FrequencyBox";
import StressBoxSmall from "../transcript/StressBoxSmall";
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

function AiCreatePanel({ open, onClose, status = "creating", AiSummaryData }) {
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
              <strong>녹취록 AI 분석</strong>
              <button className="close-btn" type="button" aria-label="닫기" onClick={onClose}></button>
            </div>
            <div className="info">
              <p>상담 녹취록을 바탕으로 AI가 생성한 내용입니다.</p>
            </div>
          </div>
          <div className="panel-cont">
            {status === "creating" && (
              <div className="creating">
                <img src={loadingImg} alt="로딩" />
                <p>AI가 생성하고 있습니다.</p>
              </div>
            )}
            {status === "analyzing" && (
              <div className="analyzing">
                <img src={characterImg} alt="ixi 캐릭터" />
                <p>
                  앗! 아직 AI 분석 중입니다.<br />
                  최대 <span>24</span>시간 후 확인 할 수 있어요!
                </p>
              </div>
            )}
            {status === "error" && (
              <div className="create-error">
                <img src={characterBkImg} alt="ixi 캐릭터" />
                <p>
                  시스템 오류로 결과가 생성되지 않았습니다.<br />
                  서비스 운영자에게 문의 바랍니다.
                </p>
              </div>
            )}
            {status === "complete" && (
              <div className="complete">
                {/* 실제 분석 결과 데이터 바인딩 필요. 샘플 마크업은 아래와 같이 구현 */}
                <div className="top-info">
                  <p>
                    AI 분석 자료가 생성 완료되었습니다.<br />
                    녹취록 AI 분석을 통해 상담 업무 도움을 받을 수 있어요.
                  </p>
                </div>
                <div className="con-wrap">
                  <div className="complete-tit">
                    <strong>1. 상담 요약</strong>
                  </div>
                  <div className="complete-cont">
                    <div>20세 남성으로 원인 모를 불안감으로 불면증으로 호소 하고 있다. 엄마와의 부정적인 경험으로 인한 트라우마가 있으며 낮은 자존감으로 대인관계의 어려움을 겪고 있다.</div>
                  </div>
                  <div className="complete-tit">
                    <strong>2. 고민주제</strong>
                  </div>
                  <div className="complete-cont">
                    <div className="bullet-line">원인을 알 수 없는 불안감 호소</div>
                    <div className="bullet-line">간헐적 불면증</div>
                    <div className="bullet-line">낮은 자존감으로 인한 대인관계 어려움</div>
                  </div>
                  <div className="complete-tit">
                    <strong>3. 키워드 분석</strong>
                  </div>
                  <div className="complete-cont visual-wrap">
                    <KeywordBox
                      data={AiSummaryData.keyword}
                      isPanel={true}
                    />
                  </div>
                  <div className="complete-tit">
                    <strong>4. 발화빈도</strong>
                  </div>
                  <div className="complete-cont visual-wrap">
                    <FrequencyBox
                      data={AiSummaryData.frequency}
                      isPanel={true}
                    />
                  </div>
                  <div className="complete-tit">
                    <strong>5. 스트레스 징후</strong>
                  </div>
                  <div className="complete-cont visual-wrap">
                    <StressBoxSmall
                      data={AiSummaryData.stress.data}
                      labels={AiSummaryData.stress.labels}
                    />
                    <div className="chart-data">
                      <span>최고5점</span>/<span>25.12</span>
                    </div>
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

export default AiCreatePanel;
