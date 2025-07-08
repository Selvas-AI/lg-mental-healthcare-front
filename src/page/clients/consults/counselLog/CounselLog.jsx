import React from "react";

import emptyFace from "@/assets/images/common/empty_face.svg";
import TranscriptBox from "../transcript/TranscriptBox";
import { useRecoilValue } from "recoil";
import { clientsState } from "@/recoil";
import { useLocation } from "react-router-dom";
import ChartBarStacked from "./ChartBarStacked";

function CounselLog() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const clientId = query.get('clientId');
  const clients = useRecoilValue(clientsState);
  const client = clients.find(c => String(c.id) === String(clientId));
  const logData = {
    mainIssue: "20세 남성으로 원인 모를 불안감으로 불면증을 호소 하고 있다. 엄마와의 부정적인 경험으로 인한 트라우마가 있으며 낮은 자존감으로 대인관계의 어려움을 겪고 있다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다.최대 3줄 노출 후 말줄임 처리 됩니다.최대 3줄 노출 후 말줄임 처리 됩니다.최대 3줄 노출 후 말줄임 처리 됩니다.최대 3줄 노출 후 말줄임 처리 됩니다.",
    content: "20세 남성으로 원인 모를 불안감으로 불면증을 호소 하고 있다. 엄마와의 부정적인 경험으로 인한 트라우마가 있으며 낮은 자존감으로 대인관계의 어려움을 겪고 있다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다.최대 3줄 노출 후 말줄임 처리 됩니다.최대 3줄 노출 후 말줄임 처리 됩니다.최대 3줄 노출 후 말줄임 처리 됩니다.최대 3줄 노출 후 말줄임 처리 됩니다.",
    opinion: "내담자의 완벽주의적 사고와 인정 욕구가 핵심 스트레스 요인이라 판단하였음.",
    observation: "20세 남성으로 원인 모를 불안감으로 불면증을 호소 하고 있다. 엄마와의 부정적인 경험으로 인한 트라우마가 있으며 낮은 자존감으로 대인관계의 어려움을 겪고 있다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다.최대 3줄 노출 후 말줄임 처리 됩니다.최대 3줄 노출 후 말줄임 처리 됩니다.최대 3줄 노출 후 말줄임 처리 됩니다.최대 3줄 노출 후 말줄임 처리 됩니다.",
    goals: [
      "상사의 피드백에 대한 감정적 반응을 탐색하고 조절하는 능력 향상",
      "상사의 피드백에 대한 감정적 반응을 탐색하고 조절하는 능력 향상",
      "상사의 피드백에 대한 감정적 반응을 탐색하고 조절하는 능력 향상",
    ],
    nextPlan: "20세 남성으로 원인 모를 불안감으로 불면증을 호소 하고 있다. 엄마와의 부정적인 경험으로 인한 트라우마가 있으며 낮은 자존감으로 대인관계의 어려움을 겪고 있다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다.최대 3줄 노출 후 말줄임 처리 됩니다.최대 3줄 노출 후 말줄임 처리 됩니다.최대 3줄 노출 후 말줄임 처리 됩니다.최대 3줄 노출 후 말줄임 처리 됩니다.",
    mind: "20세 남성으로 원인 모를 불안감으로 불면증을 호소 하고 있다. 엄마와의 부정적인 경험으로 인한 트라우마가 있으며 낮은 자존감으로 대인관계의 어려움을 겪고 있다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다.최대 3줄 노출 후 말줄임 처리 됩니다.최대 3줄 노출 후 말줄임 처리 됩니다.최대 3줄 노출 후 말줄임 처리 됩니다.최대 3줄 노출 후 말줄임 처리 됩니다.",
    caseConcept: "20세 남성으로 원인 모를 불안감으로 불면증을 호소 하고 있다. 엄마와의 부정적인 경험으로 인한 트라우마가 있으며 낮은 자존감으로 대인관계의 어려움을 겪고 있다. 최대 3줄 노출 후 말줄임 처리 됩니다. 최대 3줄 노출 후 말줄임 처리 됩니다.최대 3줄 노출 후 말줄임 처리 됩니다.최대 3줄 노출 후 말줄임 처리 됩니다.최대 3줄 노출 후 말줄임 처리 됩니다.최대 3줄 노출 후 말줄임 처리 됩니다.",
  };

  return (
    <div className="counsel-log">
      <div className="tit-wrap">
        <strong>상담일지</strong>
        <div className="btn-wrap">
          <button className="type05 h40" type="button">상담일지 상세</button>
        </div>
      </div>
      {logData.length ? (
        <div className="empty-board">
          <img src={emptyFace} alt="empty" />
          <p className="empty-tit">해당 회기 상담일지 작성 내역이 없습니다. 상담일지를 작성해주세요.</p>
          <p className="empty-info">AI를 활용하여 상담 일지를 작성할 수 있어요.</p>
        </div>
      ) : (
        <>
          <div className="dashboard">
            {/* 1. 자살, 위기 수준의 긴급도 */}
            <div className={`urgency ${client.danger}`}>
              <div className="box-tit">
                <strong>1. 자살, 위기 수준의 긴급도</strong>
                <a className="edit-btn" onClick={() => {}}>수정</a>
              </div>
              <div className="con-wrap">
                <div className="risk-scale">
                  <ul>
                    <li className="safe">
                      <span>양호</span>
                      <div><span>1</span></div>
                    </li>
                    <li className="caution">
                      <span>주의</span>
                      <div><span>2</span></div>
                    </li>
                    <li className="danger">
                      <span>위험</span>
                      <div><span>3</span></div>
                    </li>
                    <li className="critical">
                      <span>고위험</span>
                      <div><span>4</span></div>
                    </li>
                  </ul>
                </div>
                <div className="current-risk">
                  <span>현재 위기 상황</span>
                  <p>해당 사항 없음</p>
                </div>
                <div className="past-risk">
                  <span>과거 위기 상황</span>
                  <p>해당 사항 없음</p>
                </div>
                <div className="risk-factor">
                  <span>위험 요인</span>
                  <p>자해경험, 높은 충동성, 고립 </p>
                </div>
              </div>
            </div>
            {/* 2. 현재 증상의 심각도 */}
            <div className="severity">
              <div className="box-tit">
                <strong>2. 현재 증상의 심각도</strong>
                <a className="edit-btn" onClick={() => {}}>수정</a>
              </div>
              <div className="con-wrap">
                <ChartBarStacked />
              </div>
            </div>
          </div>
          <div className="sub-tit">
            <strong>상담 진행 기록과 향후 계획</strong>
          </div>
          <div className="dashboard">
            {/* 1. 주호소 문제 */}
            <TranscriptBox
              title="1. 주호소 문제"
              editable={true}
              onEdit={() => {}}
              toggleable={true}
            >
              <div className="save-txt">
                {logData.mainIssue}
              </div>
            </TranscriptBox>
            {/* 2. 상담 내용 */}
            <TranscriptBox
              title="2. 상담 내용"
              editable={true}
              onEdit={() => {}}
              toggleable={true}
            >
              <div className="save-txt">
                {logData.content}
              </div>
            </TranscriptBox>
            {/* 3. 상담사 소견 */}
            <TranscriptBox
              title="3. 상담사 소견"
              editable={true}
              onEdit={() => {}}
              toggleable={true}
            >
              <div className="save-txt">
                {logData.opinion}
              </div>
            </TranscriptBox>
            {/* 4. 객관적 관찰 */}
            <TranscriptBox
              title="4. 객관적 관찰"
              editable={true}
              onEdit={() => {}}
              toggleable={true}
            >
              <div className="save-txt">
                {logData.observation}
              </div>
            </TranscriptBox>
            {/* 5. 상담 목표 */}
            <TranscriptBox
              title="5. 상담 목표"
              editable={true}
              onEdit={() => {}}
              toggleable={true}
            >
              <div className="save-txt">
                <div className="bullet-line">{logData.goals[0]}</div>
                <div className="bullet-line">{logData.goals[1]}</div>
                <div className="bullet-line">{logData.goals[2]}</div>
              </div>
            </TranscriptBox>
            {/* 6. 다음 상담 계획 */}
            <TranscriptBox
              title="6. 다음 상담 계획"
              editable={true}
              onEdit={() => {}}
              toggleable={true}
            >
              <div className="save-txt">
                {logData.nextPlan}
              </div>
            </TranscriptBox>
          </div>
          <div className="sub-tit">
            <strong>내담자 이해를 위한 고찰</strong>
          </div>
          <div className="dashboard">
            {/* 7. 고민되는 점 */}
            <TranscriptBox
              title="7. 고민되는 점"
              editable={true}
              onEdit={() => {}}
              toggleable={true}
            >
              <div className="save-txt">
                {logData.mind}
              </div>
            </TranscriptBox>
            {/* 8. 사례개념화 */}
            <TranscriptBox
              title="8. 사례개념화"
              editable={true}
              onEdit={() => {}}
              toggleable={true}
            >
              <div className="save-txt">
                {logData.caseConcept}
              </div>
            </TranscriptBox>
          </div>
        </>
      )}
    </div>
  );
}

export default CounselLog;
