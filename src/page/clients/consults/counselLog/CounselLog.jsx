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
  const BULLET_MARK = '::BLT:: ';
  const renderSaveText = (content) => {
    if (!content && content !== 0) return <div className="save-txt" />;
    if (typeof content !== 'string') return <div className="save-txt">{content}</div>;
    if (!content.includes(BULLET_MARK)) {
      // 마커 없으면 단순 줄바꿈 처리
      const lines = content.split('\n');
      return (
        <div className="save-txt">
          {lines.map((l, i) => (
            <React.Fragment key={i}>
              {l}
              {i < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
      );
    }
    // 마커가 있으면 마커 기준으로 불릿 처리
    const blocks = [];
    const lines = content.split('\n');
    lines.forEach((line, li) => {
      if (line.includes(BULLET_MARK)) {
        const parts = line.split(BULLET_MARK).filter(Boolean);
        parts.forEach((txt, pi) => {
          blocks.push(<div key={`${li}-${pi}`} className="bullet-line">{txt}</div>);
        });
      } else {
        blocks.push(<div key={`p-${li}`}>{line}</div>);
      }
    });
    return <div className="save-txt">{blocks}</div>;
  };
  const crisisClass = (level) => {
    switch (Number(level)) {
      case 1: return 'safe';
      case 2: return 'caution';
      case 3: return 'danger';
      case 4: return 'critical';
      default: return '';
    }
  };
  const riskLevelText = (level) => {
    switch (Number(level)) {
      case 1: return '해당 사항 없음';
      case 2: return '자살 사고';
      case 3: return '자살계획';
      case 4: return '자살 시도';
      default: return '';
    }
  };
  const riskFactorsText = (n) => {
    if (!n) return '';
    const items = [];
    if (n.riskNone) return '해당 사항 없음';
    if (n.riskDiagnosis) items.push('진단 경험');
    if (n.riskSelfHarm) items.push('자해 경험');
    if (n.riskExtremeStress) items.push('최근 극심한 스트레스');
    if (n.riskHighImpulsivity) items.push('높은 충동성');
    if (n.riskFamilyHistory) items.push('가족력');
    if (n.riskGrief) items.push('고립');
    if (n.riskSleepChange) items.push('최근 수면변화');
    if (n.riskOtherText && String(n.riskOtherText).trim()) items.push(String(n.riskOtherText).trim());
    return items.join(', ');
  };
  const buildSeverity = (n) => {
    const labels = [];
    const values = [];
    if (!n) return { labels, values };
    const entries = [
      ['우울', Number(n.depression)],
      ['불안', Number(n.anxiety)],
      ['공황', Number(n.panic)],
      ['강박', Number(n.compulsion)],
      ['ADHD', Number(n.adhd)],
      ['PTSD', Number(n.ptsd)],
    ];
    entries.forEach(([label, val]) => {
      if (!Number.isNaN(val) && val >= 1) {
        labels.push(label);
        values.push(val);
      }
    });
    // 추가 증상 01~04 동적 매핑
    for (let i = 1; i <= 4; i++) {
      const active = n[`symptom0${i}Active`];
      const name = (n[`symptom0${i}Name`] || '').toString().trim();
      const sevRaw = n[`symptom0${i}Severity`];
      const sev = Number(sevRaw);
      if (active && name && !Number.isNaN(sev) && sev >= 1) {
        labels.push(name);
        values.push(sev);
      }
    }
    return { labels, values };
  };
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
  const navigateToCounselDetail = async (scrollTarget = null) => {
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
    if (scrollTarget) params.set('scrollTo', scrollTarget);
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
            <div className={`urgency ${crisisClass(note?.crisisStageLevel)}`}>
              <div className="box-tit">
                <strong>1. 자살, 위기 수준의 긴급도</strong>
                <a className="edit-btn cursor-pointer" onClick={() => navigateToCounselDetail('step01')}>수정</a>
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
                  <p>{riskLevelText(note?.currentRiskLevel)}</p>
                </div>
                <div className="past-risk">
                  <span>과거 위기 상황</span>
                  <p>{riskLevelText(note?.pastRiskLevel)}</p>
                </div>
                <div className="risk-factor">
                  <span>위험 요인</span>
                  <p>{riskFactorsText(note)}</p>
                </div>
              </div>
            </div>
            {/* 2. 현재 증상의 심각도 */}
            <div className="severity">
              <div className="box-tit">
                <strong>2. 현재 증상의 심각도</strong>
                <a className="edit-btn cursor-pointer" onClick={() => navigateToCounselDetail('step02')}>수정</a>
              </div>
              <div className="con-wrap">
                {(() => { const sev = buildSeverity(note); return (
                  <ChartBarStacked labels={sev.labels} values={sev.values} />
                ); })()}
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
              onEdit={() => navigateToCounselDetail('step03')}
              toggleable={true}
            >
              {renderSaveText(logData[0]?.mainIssue)}
            </TranscriptBox>
            {/* 2. 상담 내용 */}
            <TranscriptBox
              title="2. 상담 내용"
              editable={true}
              onEdit={() => navigateToCounselDetail('step04')}
              toggleable={true}
            >
              {renderSaveText(logData[0]?.content)}
            </TranscriptBox>
            {/* 3. 상담사 소견 */}
            <TranscriptBox
              title="3. 상담사 소견"
              editable={true}
              onEdit={() => navigateToCounselDetail('step04')}
              toggleable={true}
            >
              {renderSaveText(logData[0]?.opinion)}
            </TranscriptBox>
            {/* 4. 객관적 관찰 */}
            <TranscriptBox
              title="4. 객관적 관찰"
              editable={true}
              onEdit={() => navigateToCounselDetail('step05')}
              toggleable={true}
            >
              {renderSaveText(logData[0]?.observation)}
            </TranscriptBox>
            {/* 5. 상담 목표 */}
            <TranscriptBox
              title="5. 상담 목표"
              editable={true}
              onEdit={() => navigateToCounselDetail('step06')}
              toggleable={true}
            >
              {renderSaveText((logData[0]?.goals || []).join('\n'))}
            </TranscriptBox>
            {/* 6. 다음 상담 계획 */}
            <TranscriptBox
              title="6. 다음 상담 계획"
              editable={true}
              onEdit={() => navigateToCounselDetail('step07')}
              toggleable={true}
            >
              {renderSaveText(logData[0]?.nextPlan)}
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
              onEdit={() => navigateToCounselDetail('step08')}
              toggleable={logData[0]?.mind ? true : false}
            >
              {logData[0]?.mind ? (
                renderSaveText(logData[0]?.mind)
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
              onEdit={() => navigateToCounselDetail('step09')}
              toggleable={logData[0]?.caseConcept ? true : false}
            >
              {logData[0]?.caseConcept ? (
                renderSaveText(logData[0]?.caseConcept)
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
