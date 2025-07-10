import React, { useState } from "react";

function ClientList({ clients, onSelect, fold }) {
  const [search, setSearch] = useState("");
  const filtered = clients.filter(client =>
    client.name.includes(search) || (client.engName && client.engName.includes(search))
  );

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
        <div className="list-wrap">
          <ul>
            {filtered.length > 0 ? (
              filtered.map(client => (
                <li key={client.id}>
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      onSelect && onSelect(client);
                    }}
                  >
                    {client.name}{client.nickname ? ` (${client.nickname})` : ""}
                    {client.engName ? ` (${client.engName})` : ""}
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
