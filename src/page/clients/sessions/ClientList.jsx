import React, { useState } from "react";

function ClientList({ clients, onSelect, fold, sessionStatus, onStatusChange, masked }) {
  const [search, setSearch] = useState("");
  
  // 이름 마스킹 함수
  const maskName = (name) => {
    if (!name) return '';
    if (name.length <= 1) return '*';
    if (name.length === 2) return name[0] + '*';
    const mid = Math.floor(name.length / 2);
    return name.slice(0, mid) + '*' + name.slice(mid + 1);
  };
  
  const filtered = clients.filter(client => {
    const clientName = client.clientName || '';
    const nickname = client.nickname || '';
    return clientName.includes(search) || nickname.includes(search);
  });

  return (
    <div className={"client-list" + (fold ? " on" : "")}>
      <div className="inner">
        <div className="tit-wrap">
          <strong>내담자 목록</strong>
        </div>
        <div className="input-wrap search">
          <input
            type="text"
            name="clientSearch"
            placeholder="내담자 검색"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="search-btn" type="button" aria-label="검색"></button>
        </div>
        <div className="raido-toggle type01">
          <div className="toggle-btn">
            <input 
              id="ongoing" 
              type="radio" 
              name="clientToggle" 
              checked={sessionStatus === 1}
              onChange={() => onStatusChange && onStatusChange(1)}
            />
            <label htmlFor="ongoing">진행중</label>
          </div>
          <div className="toggle-btn">
            <input 
              id="closed" 
              type="radio" 
              name="clientToggle" 
              checked={sessionStatus === 0}
              onChange={() => onStatusChange && onStatusChange(0)}
            />
            <label htmlFor="closed">종결</label>
          </div>
        </div>
        <div className="list-wrap">
          <ul>
            {filtered.length > 0 ? (
              filtered.map(client => (
                <li key={client.clientSeq}>
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      onSelect && onSelect(client);
                    }}
                  >
                    {masked ? maskName(client.clientName) : client.clientName}{client.nickname ? ` (${client.nickname})` : ""}
                  </a>
                </li>
              ))
            ) : (
              <></>
            )}
          </ul>
          <p className="empty-txt" style={{ display: filtered.length === 0 ? "block" : "none" }}>
            내담자명<br />
            결과가 없습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ClientList;
