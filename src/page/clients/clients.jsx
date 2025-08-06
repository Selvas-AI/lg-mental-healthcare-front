import { useRecoilState } from "recoil";
import ClientsTable from "./components/ClientsTable";
import "./clients.scss";
import EmptyClients from "./components/EmptyClients";
import { clientsState } from "@/recoil";
import { useState, useEffect } from "react";
import ClientRegisterModal from "./components/ClientRegisterModal";
import EditorModal from "./components/EditorModal";
import ToastPop from "@/components/ToastPop";
import { clientSearch, clientCreate } from "@/api/apiCaller";

function Clients() {
  const [memoClient, setMemoClient] = useState(null);
  const handleCloseMemo = () => setMemoClient(null);
  const [clients, setClients] = useRecoilState(clientsState);
  const [registerOpen, setRegisterOpen] = useState(false);
  const handleRegister = () => setRegisterOpen(true);
  const handleCloseRegister = () => setRegisterOpen(false);
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSaveRegister = async (formData) => {
    try {
      const clientData = {
        // 필수 필드
        clientName: formData.name,
        gender: formData.gender === 'male' ? 'M' : 'F',
        birthDate: `${formData.birthYear}${formData.birthMonth.padStart(2, '0')}${formData.birthDay.padStart(2, '0')}`,
        
        // 선택 필드 (빈 값이 아닌 경우만 전송)
        ...(formData.nickname && { nickname: formData.nickname }),
        ...(formData.phoneNumber && { contactNumber: formData.phoneNumber }),
        ...(formData.address && { address: formData.address }),
        ...(formData.emailId && formData.emailDomain && { 
          email: `${formData.emailId}@${formData.emailDomain}` 
        }),
        ...(formData.job && { job: formData.job }),
        ...(formData.memo && { memo: formData.memo }),
        
        // 보호자 정보 (빈 값이 아닌 경우만 전송)
        ...(formData.guardians && formData.guardians.length > 0 && 
            formData.guardians.some(g => g.name || g.relation || g.phone) && {
          guardian: formData.guardians
            .filter(g => g.name || g.relation || g.phone) // 빈 보호자 제거
            .map(g => ({
              guardianRelation: g.relation || '',
              guardianName: g.name || '',
              guardianContact: g.phone || ''
            }))
        })
      };
      
      console.log('전송할 내담자 데이터:', clientData);
      
      const response = await clientCreate(clientData);
      
      if (response.code === 200) {
        setRegisterOpen(false);
        setToastMessage('신규 내담자가 등록되었습니다.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
        
        // 내담자 목록 새로고침
        await loadClients();
      } else if (response.code === 320) {
        // 중복된 사용자 에러
        setToastMessage('이미 등록된 내담자입니다.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        setToastMessage(response.message || '내담자 등록에 실패했습니다.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      console.error('내담자 등록 오류:', error);
      setToastMessage('내담자 등록 중 오류가 발생했습니다.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  }

  // 내담자 목록 로드
  const loadClients = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.warn('로그인이 필요합니다.');
      return;
    }

    setLoading(true);
    try {
      // 전체 내담자 목록 조회 (진행중)
      const response = await clientSearch({
        clientName: '',
        sessionStatus: 1  // 진행중
      });
      
      if (response.code === 200) {
        setClients(response.data || []);
        // 첫 번째 내담자를 기본 선택
        if (response.data && response.data.length > 0) {
          setSelectedClientId(response.data[0].id);
        }
      } else {
        console.error('내담자 목록 조회 실패:', response.message);
      }
    } catch (error) {
      console.error('내담자 목록 로드 오류:', error);
      setToastMessage('내담자 목록을 불러오는데 실패했습니다.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
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
        onSave={() => {
          handleCloseMemo(); 
          setToastMessage('내담자 메모가 저장 되었습니다.');
          setShowToast(true); 
          setTimeout(() => setShowToast(false), 2000);
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