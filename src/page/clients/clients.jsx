import { useRecoilState } from "recoil";
import ClientsTable from "./components/ClientsTable";
import "./clients.scss";
import EmptyClients from "./components/EmptyClients";
import { clientsState } from "@/recoil";
import { useState, useEffect } from "react";
import ClientRegisterModal from "./components/ClientRegisterModal";
import EditorModal from "./components/EditorModal";
import ToastPop from "@/components/ToastPop";
import { clientSearch } from "@/api/apiCaller";
import { useClientManager } from "@/hooks/useClientManager";

function Clients() {
  const [memoClient, setMemoClient] = useState(null);
  const handleCloseMemo = () => setMemoClient(null);
  const [clients, setClients] = useRecoilState(clientsState);
  const [registerOpen, setRegisterOpen] = useState(false);
  const handleRegister = () => setRegisterOpen(true);
  const handleCloseRegister = () => setRegisterOpen(false);
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || null);
  const [loading, setLoading] = useState(false);
  const [totalClientsExist, setTotalClientsExist] = useState(false); // 전체 내담자 존재 여부
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  // 내담자 관리 커스텀 훅 사용
  const { saveClient, saveMemo } = useClientManager();
  
  const handleSaveRegister = async (formData) => {
    // 추가 업데이트 함수 (내담자 목록 새로고침)
    const additionalUpdates = {
      refreshClientList: async () => {
        await loadClients();
      }
    };

    const result = await saveClient(formData, null, additionalUpdates);
    if (result.success) {
      setRegisterOpen(false);
      // 내담자 목록 새로고침
      await loadClients();
    }
  };

  // 전체 내담자 존재 여부 확인 (진행중 + 종결)
  const checkTotalClientsExist = async () => {
    try {
      // 진행중 내담자 확인
      const activeResponse = await clientSearch({
        clientName: '',
        sessionStatus: 1
      });
      
      // 종결 내담자 확인
      const completedResponse = await clientSearch({
        clientName: '',
        sessionStatus: 0
      });
      
      const activeCount = (activeResponse.code === 200 && activeResponse.data) ? activeResponse.data.length : 0;
      const completedCount = (completedResponse.code === 200 && completedResponse.data) ? completedResponse.data.length : 0;
      
      setTotalClientsExist(activeCount > 0 || completedCount > 0);
    } catch (error) {
      console.error('전체 내담자 확인 오류:', error);
      setTotalClientsExist(false);
    }
  };

  // 내담자 목록 로드 (ClientsTable에서 직접 처리하므로 여기서는 전체 존재 여부만 확인)
  const loadClients = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.warn('로그인이 필요합니다.');
      return;
    }

    setLoading(true);
    try {
      await checkTotalClientsExist();
    } catch (error) {
      console.error('내담자 목록 로드 오류:', error);
      setToastMessage('내담자 목록을 불러오는데 실패했습니다.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 내담자 목록 로드
  useEffect(() => {
    loadClients();
  }, []);

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
        {!totalClientsExist ? (
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
        onSave={async (memoValue) => {
          const result = await saveMemo(memoClient.clientSeq, memoValue);
          if (result.success) {
            handleCloseMemo();
          }
        }}
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
      <ToastPop message={toastMessage} showToast={showToast} />
    </>
  );
}

export default Clients;