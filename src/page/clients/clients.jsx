import { useRecoilState } from "recoil";
import ClientsTable from "./components/ClientsTable";
import "./clients.scss";
import EmptyClients from "./components/EmptyClients";
import { clientsState } from "@/recoil";
import { useState } from "react";
import ClientRegisterModal from "./components/ClientRegisterModal";
import EditorModal from "./components/EditorModal";

function Clients() {
  const [memoClient, setMemoClient] = useState(null);
  const handleCloseMemo = () => setMemoClient(null);
  const [clients, setClients] = useRecoilState(clientsState);
  const [registerOpen, setRegisterOpen] = useState(false);
  const handleRegister = () => setRegisterOpen(true);
  const handleCloseRegister = () => setRegisterOpen(false);
  const handleSaveRegister = () => {
    // TODO: 저장 처리
    setRegisterOpen(false);
  }

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
        <EditorModal
          open={true}
          onClose={handleCloseMemo}
          onSave={() => handleCloseMemo()}
          title="내담자 메모"
          className="client-memo"
          placeholder="예 : 충동행동이 있으며, 항정신성 약물을 복용 중임"
          maxLength={500}
          initialValue={memoClient.memo || ""}
        />
      )}
      {registerOpen && (
        <ClientRegisterModal open={registerOpen} onClose={handleCloseRegister} onSave={handleSaveRegister} />
      )}
    </>
  );
}

export default Clients;