import React, { useState } from "react";
import { Link } from "react-router-dom";

function ClientsTable({ clients, onSelectClient, selectedClientId }) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="con-wrap">
      <div className="tb-controls">
        <div className="left">
          <div className="raido-toggle">
            <div className="toggle-btn">
              <input id="radio03" type="radio" name="raidoToggle" defaultChecked />
              <label htmlFor="radio03">진행중</label>
            </div>
            <div className="toggle-btn">
              <input id="radio04" type="radio" name="raidoToggle" />
              <label htmlFor="radio04">종결</label>
            </div>
          </div>
        </div>
        <div className="right">
          <div className="input-wrap search">
            <input type="text" name="client-search" placeholder="내담자 검색" />
            <button className="search-btn" type="button" aria-label="검색"></button>
          </div>
          <div className="filter-wrap">
            <button className="filter-btn" type="button">
              필터<span className="chk-num">(2)</span>
            </button>
            <div className="filter-pop">
              <div className="inner">
                <div className="tit-wrap">
                  <span>필터<span className="chk-num">(2)</span></span>
                </div>
                <div className="list-wrap">
                  <ul>
                    <li>
                      <div className="input-wrap checkbox">
                        <input id="noRecording" type="checkbox" name="filter" />
                        <label htmlFor="noRecording">녹취록 없음</label>
                      </div>
                    </li>
                    <li>
                      <div className="input-wrap checkbox">
                        <input id="aiUnchecked" type="checkbox" name="filter" />
                        <label htmlFor="aiUnchecked">녹취록 AI분석 미확인</label>
                      </div>
                    </li>
                    <li>
                      <div className="input-wrap checkbox">
                        <input id="noSessionLog" type="checkbox" name="filter" />
                        <label htmlFor="noSessionLog">상담일지 미작성</label>
                      </div>
                    </li>
                    <li>
                      <div className="input-wrap checkbox">
                        <input id="noCaseFormulation" type="checkbox" name="filter" />
                        <label htmlFor="noCaseFormulation">사례개념화 미작성</label>
                      </div>
                    </li>
                    <li>
                      <div className="input-wrap checkbox">
                        <input id="caseAiSuggested" type="checkbox" name="filter" />
                        <label htmlFor="caseAiSuggested">사례개념화 AI추천</label>
                      </div>
                    </li>
                    <li>
                      <div className="input-wrap checkbox">
                        <input id="psychTestRequest" type="checkbox" name="filter" />
                        <label htmlFor="psychTestRequest">심리검사 요청</label>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="btn-wrap">
                  <button type="button">초기화</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="tb-wrap">
        <table>
          <caption>내담자 리스트</caption>
          <colgroup>
            <col style={{ width: "156px" }} />
            <col style={{ width: "208px" }} />
            <col style={{ width: "104px" }} />
            <col style={{ width: "452px" }} />
            <col style={{ width: "120px" }} />
          </colgroup>
          <thead>
            <tr>
              <th className="sorting">
                <span>이름</span>
              </th>
              <th>전화번호</th>
              <th>회기</th>
              <th>
                <div className="step-title">
                  <span>To-Do</span>
                  <div className="info">
                    <div
                      className="info-icon"
                      aria-label="툴팁 안내 아이콘"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    ></div>
                    <div
                      className={`tooltip${showTooltip ? " show" : ""}`}
                    >
                      <ul>
                        <li>1. 해당 회차에서 작성하거나 확인하지 않은 업무인 경우에 TO-DO로 표시돼요.</li>
                        <li>2. AI는 도움 드리지만 자동으로 생성하지 않아요.</li>
                        <li>3. AI는 실수 할 수 있으므로 상담사 선생님이 확정을 해야 해요.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </th>
              <th>메모</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, idx) => (
              <tr
                key={client.id || idx}
                className={
                  [client.isNew ? "new" : "", selectedClientId === client.id ? "selected" : ""].join(" ").trim()
                }
                onClick={() => onSelectClient && onSelectClient(client.id)}
                style={{ cursor: onSelectClient ? "pointer" : undefined }}
              >
                <td>
                  <Link
                    to={`/clients/session?clientId=${client.id || client.name}`}
                  >
                    {client.name}({client.nickname})
                  </Link>
                </td>
                <td>{client.contact}</td>
                <td>
                  {client.session === "신규" ? (
                    "신규"
                  ) : (
                    <a>{client.session}</a>
                  )}
                </td>
                <td>
                  <div className="flex-wrap">
                    {client.todos && client.todos.length > 0 ? (
                      client.todos.map((todo, i) => (
                        <a key={i}>{todo}</a>
                      ))
                    ) : (
                      "-"
                    )}
                  </div>
                </td>
                <td>
                  <button className="type12 h40" type="button">메모확인</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClientsTable;
