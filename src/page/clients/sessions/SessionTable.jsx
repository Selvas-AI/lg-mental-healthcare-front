import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function SessionTable({ clientId, sessionDummyData }) {
  const navigate = useNavigate();
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
                    <p>약녹취록이 없거나, 생성중인 경우에는<br />제공이 어려울 수 있어요.</p>
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
          {sessionDummyData && sessionDummyData.map((row, idx) => (
            <tr key={idx}>
              <td>
                <a onClick={() => navigate(`/clients/consults?clientId=${clientId}`)}>{row.session}회기</a>
              </td>
              <td className={row.status.className}>{row.status.text.split(" ").map((t, i) => (
                <span key={i}>
                  {t}
                  {i === 0 && <br />}
                </span>
              ))}</td>
              <td>{row.date}</td>
              <td>
                <div className="summary-wrap">{row.summary}</div>
              </td>
              <td>
                <div className="flex-wrap">
                  {row.todos.map((todo, i) => (
                    <a href="#" key={i}>{todo}</a>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SessionTable;
