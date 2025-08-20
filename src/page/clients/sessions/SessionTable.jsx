import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { currentSessionState } from "@/recoil";

function SessionTable({ clientId, sessionData}) {
  const navigate = useNavigate();
  const setCurrentSession = useSetRecoilState(currentSessionState);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showTooltip2, setShowTooltip2] = useState(false);

  return (
    <div className="tb-wrap">
      <table>
        <caption>회기목록</caption>
        <colgroup>
          <col style={{ width: "92px" }} />
          <col style={{ width: "68px" }} />
          <col style={{ width: "152px" }} />
          <col style={{ width: "194px" }} />
          <col style={{ width: "340px" }} />
        </colgroup>
        <thead>
          <tr>
            <th>회기</th>
            <th>상태</th>
            <th>상담 일시</th>
            <th>
              <div className="step-title">
                <span>상담 요약</span>
                <div className="info">
                  <div className="info-icon" aria-label="툴팁 안내 아이콘" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}></div>
                  <div className={`tooltip${showTooltip ? " show" : ""}`}>
                    <p>녹취록을 기반으로 AI가 생성한<br />해당회차 상담 요약입니다.</p>
                    <p>녹취록이 없거나, 생성중인 경우에는<br />제공이 어려울 수 있어요.</p>
                  </div>
                </div>
              </div>
            </th>
            <th>
              <div className="step-title">
                <span>To-Do</span>
                <div className="info">
                  <div className="info-icon" aria-label="툴팁 안내 아이콘" onMouseEnter={() => setShowTooltip2(true)} onMouseLeave={() => setShowTooltip2(false)}></div>
                  <div className={`tooltip${showTooltip2 ? " show" : ""}`}>
                    <ul>
                      <li>1. 해당 회차에서 작성하거나 확인하지 않은 업무인 경우에 TO-DO로 표시돼요.</li>
                      <li>2. AI는 도움 드리지만 자동으로 생성하지 않아요.</li>
                      <li>3. AI는 실수 할 수 있으므로 상담사 선생님이 확정을 해야 해요.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sessionData && sessionData.length > 0 ? (
            sessionData.map((session, idx) => {
              const statusText = session.sessionStatus === 'NOSCHED' ? '노쇼' : session.sessionStatus === 'PLANNED' ? '상담예정' : session.sessionStatus === 'COMPLETE' ? '상담완료' : session.sessionStatus === 'NOSHOW' ? '노쇼' : '';
              const statusClass = statusText === '노쇼' ? 'no-show' : statusText === '상담예정' ? 'scheduled' : statusText === '상담완료' ? 'completed' : '';
              
              // 날짜 포맷 변환 (2025-05-10 14:00:00 -> 2025.05.10 (토) 오후 2시)
              const formatDate = (dateStr) => {
                if (!dateStr) return '-';
                try {
                  const date = new Date(dateStr);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
                  const weekday = weekdays[date.getDay()];
                  const hour = date.getHours();
                  const minute = String(date.getMinutes()).padStart(2, '0');
                  const period = hour >= 12 ? '오후' : '오전';
                  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                  
                  return `${year}.${month}.${day} (${weekday}) ${period} ${displayHour}시${minute !== '00' ? ` ${minute}분` : ''}`;
                } catch (e) {
                  return dateStr;
                }
              };
              
              // TODO 목록 생성 (false인 값만 표시)
              const todos = [];
              if (session.todoTranscriptCreation === false) todos.push('녹음파일 등록');
              if (session.todoAiAnalysisDone === false) todos.push('녹취록 분석');
              if (session.todoAiAnalysisCheck === false) todos.push('AI 분석 확인');
              if (session.todoCounselNote === false) todos.push('상담일지 작성');
              if (session.todoPsychTestRequest === false) todos.push('심리검사 요청');
              if (session.todoCaseCenceptInital === false) todos.push('사례개념화 최초 작성');
              
              return (
                <tr key={session.sessionSeq || idx}>
                  <td>
                    <a className="cursor-pointer" onClick={() => {
                      // 현재 선택된 세션 데이터를 Recoil에 저장
                      setCurrentSession(session);
                      // 페이지 이동
                      navigate(`/clients/consults?clientId=${clientId}&sessionSeq=${session.sessionSeq}`);
                    }}>
                      {session.sessionType === 'LAST' ? '종결회기' : `${session.sessionNo}회기`}
                    </a>
                  </td>
                  <td className={statusClass}>
                    {statusText.length === 4 ? (
                      <span>
                        {statusText.slice(0, 2)}<br />{statusText.slice(2)}
                      </span>
                    ) : (
                      statusText.split(' ').map((t, i) => (
                        <span key={i}>
                          {t}
                          {i === 0 && <br />}
                        </span>
                      ))
                    )}
                  </td>
                  <td>{formatDate(session.sessionDate)}</td>
                  <td>
                    <div className="summary-wrap">{session.memo || '-'}</div>
                  </td>
                  <td>
                    <div className="flex-wrap">
                      {todos.length > 0 ? todos.map((todo, i) => (
                        <a className="cursor-pointer" key={i}>{todo}</a>
                      )) : null}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

export default SessionTable;
