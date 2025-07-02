import { useRecoilState } from "recoil";
import ClientsTable from "./components/ClientsTable";
import "./clients.scss";
import EmptyClients from "./components/EmptyClients";
import { clientsState } from "@/recoil";
import { useState } from "react";

import ClientMemo from "./components/clientMemo";

function Clients() {
  const [memoClient, setMemoClient] = useState(null);
  const handleCloseMemo = () => setMemoClient(null);
  const [clients, setClients] = useRecoilState(clientsState);

  const handleRegister = () => {
    // TODO: 내담자 등록 로직
  };

  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || null);

  return (
    <>
      <div className="inner">
        <div className="move-up">
          <strong className="page-title">내담자 관리</strong>
          <div className="switch-wrap">
            <label>
              <span>개인정보 보호</span>
              <input role="switch" name="switch" type="checkbox" defaultChecked />
            </label>
          </div>
        </div>
        <div className="tb-info">
          <p className="total">전체 <span className="total-num">{clients.length}</span></p>
          <button className="type11 h40" type="button" onClick={handleRegister}>
            내담자 등록
          </button>
        </div>
        {clients.length === 0 ? (
          <EmptyClients onRegister={handleRegister} />
        ) : (
          <ClientsTable
            clients={clients}
            onSelectClient={setSelectedClientId}
            selectedClientId={selectedClientId}
            memoClient={memoClient}
            setMemoClient={setMemoClient}
            onCloseMemo={handleCloseMemo}
          />
        )}
        <div className="pagination" role="navigation">
          <div className="pagination-inner">
            <div className="page-links">
              <a className="on" title="1 페이지">1</a>
            </div>
          </div>
        </div>
      </div>
      {memoClient && (
        <ClientMemo
          onClose={handleCloseMemo}
          initialMemo={memoClient.memo || ""}
        />
      )}
    </>
  );
}

export default Clients;