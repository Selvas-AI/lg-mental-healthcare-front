import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRecoilState } from "recoil";
import { clientsState } from "@/recoil";
import emptyFace from "@/assets/images/common/empty_face.svg";

function ClientsTable({ onSelectClient, selectedClientId, memoClient, setMemoClient, onCloseMemo }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [clients] = useRecoilState(clientsState);
  const [searchValue, setSearchValue] = useState("");
  const [filteredClients, setFilteredClients] = useState(clients);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc': 오름차순, 'desc': 내림차순

  const handleSearch = () => {
    const keyword = searchValue.trim();
    let result;
    if (!keyword) {
      result = clients;
    } else {
      result = clients.filter(client => client.name.includes(keyword));
    }
    // 검색 결과도 현재 정렬 순서에 따라 정렬
    const sortedResult = sortClientsByName(result, sortOrder);
    setFilteredClients(sortedResult);
  };

  const handleInputChange = e => {
    setSearchValue(e.target.value);
    if (!e.target.value) {
      const sortedClients = sortClientsByName(clients, sortOrder);
      setFilteredClients(sortedClients);
    }
  };

  // 정렬 함수
  const sortClientsByName = (clientList, order) => {
    return [...clientList].sort((a, b) => {
      if (order === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
  };

  // 전화번호 포맷팅 함수 (01012345678 -> 010-1234-5678)
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, ''); // 숫자만 추출
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    return phone; // 11자리가 아니면 원본 반환
  };

  // To-Do 클릭 시 정렬 토글
  const handleSortToggle = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    const sortedClients = sortClientsByName(filteredClients, newOrder);
    setFilteredClients(sortedClients);
  };

  useEffect(() => {
    const sortedClients = sortClientsByName(clients, sortOrder);
    setFilteredClients(sortedClients);
  }, [clients, sortOrder]);

  return (
    <>
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
                <input
                  type="text"
                  name="client-search"
                  placeholder="내담자 검색"
                  value={searchValue}
                  onChange={handleInputChange}
                  onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                />
                <button className="search-btn" type="button" aria-label="검색" onClick={handleSearch}></button>
              </div>
              {/* <div className="filter-wrap">
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
              </div> */}
            </div>
          </div>
          <div className={`tb-wrap${filteredClients.length === 0 ? ' empty' : ''}`}>
            {filteredClients.length === 0 && (
              <div className="empty-data">
                <img src={emptyFace} alt="empty" />
                <p className="empty-info">내담자명 검색결과가 없습니다.</p>
              </div>
            )}
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
                    <span onClick={handleSortToggle}>이름</span>
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
                {filteredClients.map((client, idx) => (
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
                        to={`/clients/sessions?clientId=${client.id || client.name}`}
                      >
                        {client.name}{client.nickname && `(${client.nickname})`}
                      </Link>
                    </td>
                    <td>{formatPhoneNumber(client.phone)}</td>
                    <td>
                      {client.session === "신규" ? (
                        "신규"
                      ) : (
                        <Link to={`/clients/consults?clientId=${client.id}`}>
                          {client.session}
                        </Link>
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
                      <button className="type12 h40" type="button" onClick={e => {
                        e.stopPropagation();
                        setMemoClient(client);
                      }}>메모확인</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>

    </>
  );
}

export default ClientsTable;
