import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import emptyFace from "@/assets/images/common/empty_face.svg";
import TranscriptBox from "../transcript/TranscriptBox";
import { useRecoilState, useRecoilValue } from "recoil";
import { clientsState, sessionNoteState } from "@/recoil";
import { useLocation } from "react-router-dom";
import ChartBarStacked from "./ChartBarStacked";
import { sessionNoteFind } from "@/api/apiCaller";

function CounselLog({ setIsNoshow, sessionData }) {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const clientId = query.get('clientId');
  const sessionSeq = query.get('sessionSeq');
  const clients = useRecoilValue(clientsState);
  const client = clients.find(c => String(c.clientSeq) === String(clientId));
  const [sessionNote, setSessionNote] = useRecoilState(sessionNoteState);

  // 현재 세션의 상담일지 데이터를 조회하여 로컬 상태에 저장
  useEffect(() => {
    const fetchNote = async () => {
      if (!sessionSeq) return;
      try {
        const res = await sessionNoteFind(sessionSeq);
        if (res.code === 200 && res.data) {
          setSessionNote({ sessionSeq, data: res.data, updatedAt: Date.now() });
        } else {
          setSessionNote(null);
          console.error('sessionNoteFind 실패:', res.message);
        }
      } catch (err) {
        setSessionNote(null);
        console.error('sessionNoteFind 오류:', err);
      }
    };
    fetchNote();
  }, [sessionSeq]);
  
  // 상담일지 상세 페이지로 이동하는 함수
  const navigateToCounselDetail = async () => {
    // 상세로 이동 전 캐시 최신화 (없거나 다른 세션일 경우만)
    if (sessionSeq && (!sessionNote || sessionNote.sessionSeq !== sessionSeq || !sessionNote.data)) {
      try {
        const res = await sessionNoteFind(sessionSeq);
        if (res.code === 200 && res.data) {
          setSessionNote({ sessionSeq, data: res.data, updatedAt: Date.now() });
        }
      } catch (_) { /* noop */ }
    }
    const params = new URLSearchParams();
    if (clientId) params.set('clientId', clientId);
    if (sessionSeq) params.set('sessionSeq', sessionSeq);
    navigate(`/clients/consults/detail?${params.toString()}`);
  };
  
  // sessionData에서 상담일지 작성 여부 확인
  const isCounselNoteCompleted = sessionData?.todoCounselNote === true;
  const note = (sessionNote && sessionNote.sessionSeq === sessionSeq) ? sessionNote.data : null;
  const logData = note ? [{
    mainIssue: note.chiefComplaintText || note.chiefComplaintAi || '',
    content: note.sessionSummaryText || note.sessionSummaryAi || '',
    opinion: note.counselorOpinionText || '',
    observation: note.objectiveObservationText || '',
    goals: note.counselingGoalText ? [note.counselingGoalText] : [],
    nextPlan: note.nextSessionPlanText || note.nextSessionPlanAi || '',
    mind: note.clientConcernsText || '',
    caseConcept: note.caseConceptualizationText || ''
  }] : [];
  // const logData = [];

  return (
    <div className="counsel-log">
      <div className="tit-wrap">
        <strong>상담일지</strong>
        <div className="btn-wrap">
          {logData.length === 0 ? (
            <>
              <button className="type05 white h40" type="button" onClick={() => setIsNoshow(true)}>노쇼 처리</button>
              <button className="type05 h40" type="button" onClick={navigateToCounselDetail}>상담일지 작성</button>
            </>
          ) : (
            <button className="type05 h40" type="button" onClick={navigateToCounselDetail}>상담일지 상세</button>
          )}
        </div>
      </div>
      {!isCounselNoteCompleted ? (
        <div className="empty-board">
          <img src={emptyFace} alt="empty" />
          <p className="empty-tit">해당 회기 상담일지 작성 내역이 없습니다. 상담일지를 작성해주세요.</p>
          <p className="empty-info">AI를 활용하여 상담 일지를 작성할 수 있어요.</p>
        </div>
      ) : (
        <>
          <div className="dashboard">
            {/* 1. 자살, 위기 수준의 긴급도 */}
            <div className={`urgency ${client?.crisisLevel || ''}`}>
              <div className="box-tit">
                <strong>1. 자살, 위기 수준의 긴급도</strong>
                <a className="edit-btn" onClick={navigateToCounselDetail}>수정</a>
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
                <a className="edit-btn" onClick={navigateToCounselDetail}>수정</a>
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
                {logData[0]?.mainIssue}
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
                {logData[0]?.content}
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
                {logData[0]?.opinion}
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
                {logData[0]?.observation}
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
                <div className="bullet-line">{logData[0]?.goals[0]}</div>
                <div className="bullet-line">{logData[0]?.goals[1]}</div>
                <div className="bullet-line">{logData[0]?.goals[2]}</div>
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
                {logData[0]?.nextPlan}
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
              toggleable={logData[0]?.mind ? true : false}
            >
              {logData[0]?.mind ? (
                <div className="save-txt">
                  {logData[0]?.mind}
                </div>
              ) : (
                <div className="box-explain empty">
                  <p>내용이 작성되지 않았습니다.</p>
                </div>
              )}
            </TranscriptBox>
            {/* 8. 사례개념화 */}
            <TranscriptBox
              title="8. 사례개념화"
              editable={true}
              onEdit={() => {}}
              toggleable={logData[0]?.caseConcept ? true : false}
            >
              {logData[0]?.caseConcept ? (
                <div className="save-txt">
                  {logData[0]?.caseConcept}
                </div>
              ) : (
                <div className="box-explain empty">
                  <p>내용이 작성되지 않았습니다.</p>
                </div>
              )}
            </TranscriptBox>
          </div>
        </>
      )}
    </div>
  );
}

export default CounselLog;
