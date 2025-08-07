import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ClientProfile from "../components/ClientProfile";
import ClientList from "./ClientList";
import { useRecoilValue, useSetRecoilState, useRecoilState } from "recoil";
import { maskingState, clientsState, foldState, supportPanelState } from "@/recoil";
import { clientSearch, clientUpdate, clientCreate, clientFind } from '../../../api/apiCaller';
import ToastPop from "@/components/ToastPop";
import "./sessions.scss";

import ClientRegisterModal from "../components/ClientRegisterModal";
import emptyFace from "@/assets/images/common/empty_face.svg";
import TimelinePanel from "./TimelinePanel";
import SessionTable from "./SessionTable";
import RecordSelectModal from "./RecordSelectModal";
//! 회기 더미 데이터
import sessionDummyData from "./sessionDummyData";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Sessions() {
  const [masked, setMasked] = useRecoilState(maskingState);
  const query = useQuery();
  const clientId = query.get("clientId");
  const navigate = useNavigate();
  const clients = useRecoilValue(clientsState);
  const setClients = useSetRecoilState(clientsState);
  const client = clients.find(c => String(c.clientSeq) === String(clientId));
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [recordSelectOpen, setRecordSelectOpen] = useState(false);
  const fold = useRecoilValue(foldState);
  const setSupportPanel = useSetRecoilState(supportPanelState);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [sessionStatus, setSessionStatus] = useState(1); // 1: 진행중, 0: 종결
  const [clientListData, setClientListData] = useState([]); // ClientList 전용 데이터

  // 페이지 로드 시 내담자 목록 fetch
  useEffect(() => {
    const fetchData = async () => {
      // URL 파라미터로 특정 내담자에 접근하는 경우 - 항상 최신 데이터 조회
      if (clientId) {
        try {
          const findResponse = await clientFind({ clientSeq: parseInt(clientId) });
          if (findResponse.code === 200 && findResponse.data) {
            setClients(prevClients => {
              const exists = prevClients.find(c => c.clientSeq === findResponse.data.clientSeq);
              if (!exists) {
                return [...prevClients, findResponse.data];
              }
              // 기존 데이터를 최신 데이터로 업데이트
              return prevClients.map(client => 
                client.clientSeq === findResponse.data.clientSeq 
                  ? findResponse.data 
                  : client
              );
            });
          }
        } catch (error) {
          console.error('특정 내담자 조회 실패:', error);
        }
      }
      
      // ClientList 데이터 초기화
      if (clientListData.length === 0) {
        try {
          const response = await clientSearch({
            clientName: '',
            sessionStatus: sessionStatus
          });
          if (response.code === 200 && Array.isArray(response.data)) {
            setClientListData(response.data);
            
            // 전체 clients 데이터가 비어있는 경우에만 초기화
            if (clients.length === 0 && !clientId) {
              setClients(response.data);
            }
          } else {
            setClientListData([]);
          }
        } catch (error) {
          setClientListData([]);
        }
      }
    };

    fetchData();
    
  }, [clientId, sessionStatus]);

  // sessionStatus 변경 핸들러 (진행중/종결 라디오 버튼 클릭 시)
  // ClientList만 업데이트하고 현재 선택된 내담자 정보는 유지
  const handleStatusChange = async (status) => {
    setSessionStatus(status);
    try {
      const response = await clientSearch({
        clientName: '',
        sessionStatus: status
      });
      
      if (response.code === 200 && Array.isArray(response.data)) {
        setClientListData(response.data); // ClientList 전용 데이터만 업데이트
      } else {
        setClientListData([]);
      }
    } catch (error) {
      setClientListData([]);
    }
  };

  const onSave = async (clientData) => {
    try {
      if (editClient) {
        // 내담자 정보 수정 - 변경된 필드만 전송
        const updateData = { clientSeq: editClient.clientSeq };
        
        // 변경된 필드만 포함
        if (clientData.name !== editClient.clientName) {
          updateData.clientName = clientData.name;
        }
        if ((clientData.nickname || '') !== (editClient.nickname || '')) {
          updateData.nickname = clientData.nickname || '';
        }
        
        const newBirthDate = `${clientData.birthYear}${clientData.birthMonth.padStart(2, '0')}${clientData.birthDay.padStart(2, '0')}`;
        if (newBirthDate !== editClient.birthDate) {
          updateData.birthDate = newBirthDate;
        }
        
        const newGender = clientData.gender === 'female' ? 'F' : clientData.gender === 'male' ? 'M' : clientData.gender;
        if (newGender !== editClient.gender) {
          updateData.gender = newGender;
        }
        
        if (clientData.phoneNumber !== editClient.contactNumber) {
          updateData.contactNumber = clientData.phoneNumber;
        }
        if ((clientData.address || '') !== (editClient.address || '')) {
          updateData.address = clientData.address || '';
        }
        
        const newEmail = clientData.emailId && clientData.emailDomain ? `${clientData.emailId}@${clientData.emailDomain}` : '';
        if (newEmail !== (editClient.email || '')) {
          updateData.email = newEmail;
        }
        
        if ((clientData.job || '') !== (editClient.job || '')) {
          updateData.job = clientData.job || '';
        }
        if ((clientData.memo || '') !== (editClient.memo || '')) {
          updateData.memo = clientData.memo || '';
        }
        
        // 보호자 정보 변경 확인 (의미있는 데이터만 비교)
        const hasValidGuardianData = (guardians) => {
          if (!Array.isArray(guardians) || guardians.length === 0) return false;
          return guardians.some(g => g.relation || g.name || g.phone);
        };
        
        const currentHasGuardians = hasValidGuardianData(editClient.guardian);
        const newHasGuardians = hasValidGuardianData(clientData.guardians);
        
        // 의미있는 보호자 데이터가 변경된 경우만 전송
        if (currentHasGuardians !== newHasGuardians || 
            (newHasGuardians && JSON.stringify(editClient.guardian || []) !== JSON.stringify(clientData.guardians || []))) {
          updateData.guardian = newHasGuardians ? clientData.guardians : null;
        }
        

        
        const response = await clientUpdate(updateData);
        if (response.code === 200) {
          // 내담자 정보 수정 후 clientFind로 해당 내담자만 최신 데이터로 동기화
          try {
            const findResponse = await clientFind({ clientSeq: editClient.clientSeq });
            if (findResponse.code === 200 && findResponse.data) {
              // clients 상태 업데이트
              setClients(prevClients => 
                prevClients.map(client => 
                  client.clientSeq === editClient.clientSeq 
                    ? findResponse.data
                    : client
                )
              );
              
              // ClientList 데이터도 동시에 업데이트
              setClientListData(prevListData => 
                prevListData.map(client => 
                  client.clientSeq === editClient.clientSeq 
                    ? findResponse.data
                    : client
                )
              );
            }
          } catch (refreshError) {
            // 실패 시 로컬 데이터로 폴백
            const updatedClient = { ...editClient, ...updateData };
            setClients(prevClients => 
              prevClients.map(client => 
                client.clientSeq === editClient.clientSeq 
                  ? updatedClient
                  : client
              )
            );
            setClientListData(prevListData => 
              prevListData.map(client => 
                client.clientSeq === editClient.clientSeq 
                  ? updatedClient
                  : client
              )
            );
          }
          setToastMessage('내담자 정보가 수정되었습니다.');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2000);
        } else {
          setToastMessage(response.message || '내담자 정보 수정에 실패했습니다.');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2000);
        }
      } else {
        const registerData = {
          clientName: clientData.name,
          nickname: clientData.nickname || '',
          birthDate: `${clientData.birthYear}${clientData.birthMonth.padStart(2, '0')}${clientData.birthDay.padStart(2, '0')}`,
          gender: clientData.gender === 'female' ? 'F' : clientData.gender === 'male' ? 'M' : clientData.gender,
          contactNumber: clientData.phoneNumber,
          address: clientData.address || '',
          email: clientData.emailId && clientData.emailDomain ? `${clientData.emailId}@${clientData.emailDomain}` : '',
          job: clientData.job || '',
          guardian: clientData.guardians || null,
          memo: clientData.memo || ''
        };
        
        const response = await clientCreate(registerData);
        if (response.code === 200) {
          setClients(prevClients => [...prevClients, response.data]);
          setToastMessage('내담자가 등록되었습니다.');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2000);
        } else {
          setToastMessage(response.message || '내담자 등록에 실패했습니다.');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2000);
        }
      }
      setRegisterOpen(false);
      setEditClient(null);
    } catch (error) {
      setToastMessage('처리 중 오류가 발생했습니다.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const handleSelectClient = (client) => {
    navigate(`/clients/sessions?clientId=${client.clientSeq}`, { replace: true });
  };

  const handleRecordSelect = (recordData) => {
    // TODO: 선택된 녹음파일로 회기 등록 처리
    console.log('선택된 녹음파일:', recordData);
    setRecordSelectOpen(false);
  };

  return (
    <>
      <ClientList
        clients={clientListData}
        onSelect={handleSelectClient}
        fold={fold}
        sessionStatus={sessionStatus}
        onStatusChange={handleStatusChange}
      />
      <div className="inner">
        <div className="move-up">
          <strong className="page-title">회기 목록</strong>
          <div className="switch-wrap">
            <label>
              <span>개인정보 보호</span>
              <input
                role="switch"
                name="switch"
                type="checkbox"
                checked={masked}
                onChange={e => setMasked(e.target.checked)}
              />
            </label>
          </div>
        </div>
        <ClientProfile 
          profileData={client} 
          onEdit={clientData => {
            setEditClient(clientData);
            setRegisterOpen(true);
          }}
        />
        {isEmpty ? null : (
          <div className="btn-wrap">
            <div className="left">
              <button 
                className="type11 h40 white" 
                type="button"
                onClick={() => setRecordSelectOpen(true)}
              >
                회기 등록
              </button>
              <button className="type05 white" type="button">종결</button>
            </div>
            <button className="type05" type="button" onClick={() => {
              setTimelineOpen(true);
              setSupportPanel(true);
              }}>타임라인 보기</button>
          </div>
        )}
        <div className={isEmpty ? "con-wrap empty" : "con-wrap"}>
          {isEmpty ? (
            <>
              <img src={emptyFace} alt="empty"/>
              <p className="empty-info">예정, 완료한 상담이 없습니다.<br/>내담자와의 예약 일정을 확인해 보세요.</p>
              <button className="type05 h44" type="button">스케줄 관리</button>
            </>
          ) : (
            <SessionTable 
              clientId={clientId}
              sessionDummyData={sessionDummyData}
            />
          )}
        </div>
      </div>
      <ToastPop message={toastMessage} showToast={showToast} />
      <ClientRegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSave={onSave}
        mode={editClient ? "edit" : "register"}
        initialData={editClient}
      />
      <TimelinePanel
        open={timelineOpen}
        onClose={() => {
          setTimelineOpen(false);
          setSupportPanel(false);
        }}
        isEmpty={isEmpty}
        sessionDummyData={sessionDummyData}
      />
      <RecordSelectModal
        open={recordSelectOpen}
        onClose={() => setRecordSelectOpen(false)}
        onSave={handleRecordSelect}
      />
    </>
  );
}

export default Sessions;
