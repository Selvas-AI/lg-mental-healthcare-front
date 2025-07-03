import React from "react";
import emptyFace from "@/assets/images/common/empty_face.svg";

function Transcript() {
  const hasTranscript = false;
  const isAIGenerated = true;
  return (
    <div className="transcript">
      <div className="tit-wrap">
        <strong>녹취록</strong>
        <div className="btn-wrap">
          <button className="upload-btn type03 h40" type="button">
            녹취록 업로드
          </button>
          <button className="type05" type="button">
            녹취록 상세
          </button>
        </div>
      </div>
      {!hasTranscript && !isAIGenerated && (
        <div className="empty-board">
          <img src={emptyFace} alt="empty" />
          <p className="empty-tit">업로드된 녹취록이 없습니다.</p>
          <p className="empty-info">
            [녹취록 업로드]를 선택하여 PC에 있는 녹취록을 업로드 할 수 있어요.
          </p>
        </div>
      )}
      {hasTranscript && (
        <div className="transcript-board">
          <div className="create-board">
            <strong>AI가 녹취록 생성을 완료 하였습니다.</strong>
            <ul>
              <li>1. 상담요약</li>
              <li>2. 고민주제</li>
              <li>3. 키워드 분석</li>
              <li>4. 발화빈도</li>
              <li>5. 스트레스 징후</li>
            </ul>
            <button className="type01 h40" type="button">
              <span>AI 생성하기</span>
            </button>
          </div>
        </div>
      )}
      {isAIGenerated && (
        <div className="transcript-board">
          <div className="dashboard">
            <div className="summary txt-box">
              <div className="box-tit">
                <strong>1. 상담요약</strong>
                <a className="edit-btn" href="#">수정</a>
              </div>
              <div className="box-explain">
                <div className="save-txt">
                  20세 남성으로 원인 모를 불안감으로 불면증을 호소 하고 있다. 엄마와의 부정적인 경험으로 인한 트라우마가 있으며 낮은 자존감으로 대인관계의 어려움을 겪고 있다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다.
                </div>
              </div>
              <button className="toggle-btn" type="button" aria-label="펼치기/접기"></button>
            </div>
            <div className="issue txt-box">
              <div className="box-tit">
                <strong>2. 고민주제</strong>
                <a className="edit-btn" href="#">수정</a>
              </div>
              <div className="box-explain">
                <div className="save-txt">
                  <div className="bullet-line">원인을 알 수 없는 불안감 호소</div>
                  <div className="bullet-line">간헐적 불면증</div>
                  <div className="bullet-line">낮은 자존감으로 인한 대인관계 어려움</div>
                  <div className="bullet-line">예시 텍스트</div>
                  <div className="bullet-line">예시 텍스트</div>
                  <div className="bullet-line">예시 텍스트</div>
                </div>
              </div>
              <button className="toggle-btn" type="button" aria-label="펼치기/접기"></button>
            </div>
            <div className="keyword box before-create">
              <div className="box-tit">
                <strong>3. 키워드 분석</strong>
              </div>
              <div className="create-wrap">
                <p>
                  [AI 생성하기]를 선택하면<br />
                  AI가 생성한 분석 자료를 확인 할 수 있어요!
                </p>
                <button className="type01 h40" type="button">
                  <span>AI 생성하기</span>
                </button>
              </div>
            </div>
            <div className="frequency box">
              <div className="box-tit">
                <strong>4. 발화빈도</strong>
              </div>
              <div className="con-wrap">
                <div className="bar-wrap">
                  <div className="legend">
                    <span className="counselor">발화자1</span>
                    <span className="client">발화자2</span>
                  </div>
                  <div className="bar-labels">
                    <div>
                      <span>12분</span>
                      <div className="value counselor-pct">0%</div>
                    </div>
                    <div>
                      <span>45분</span>
                      <div className="value client-pct">0%</div>
                    </div>
                  </div>
                  <div className="bar-container">
                    <div className="bar-counselor"></div>
                    <div className="bar-client"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="stress box before-create">
              <div className="box-tit">
                <strong>5. 스트레스 징후</strong>
              </div>
              <div className="create-wrap">
                <p>
                  [AI 생성하기]를 선택하면<br />
                  AI가 생성한 분석 자료를 확인 할 수 있어요!
                </p>
                <button className="type01 h40" type="button">
                  <span>AI 생성하기</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transcript;
