import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ClientProfile from "../components/ClientProfile";
import ClientList from "./ClientList";
import { useRecoilValue, useSetRecoilState, useRecoilState } from "recoil";
import { maskingState, clientsState, foldState, supportPanelState, sessionDataState, currentSessionState } from "@/recoil";
import { clientSearch, clientFind, sessionList, clientUpdateMemo, sessionCreate, sessionCurrentUpdate, sessionGroupComplete, timelineList } from '../../../api/apiCaller';
import { useClientManager } from '@/hooks/useClientManager';
import ToastPop from "@/components/ToastPop";
import "./sessions.scss";

import ClientRegisterModal from "../components/ClientRegisterModal";
import EditorModal from "../components/EditorModal";
import emptyFace from "@/assets/images/common/empty_face.svg";
import TimelinePanel from "./TimelinePanel";
import SessionTable from "./SessionTable";
import RecordSelectModal from "./RecordSelectModal";
import EditorConfirm from "../components/EditorConfirm";

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
  // 내담자 관리 커스텀 훅 사용
  const { saveClient, saveMemo, toastMessage, showToast, showToastMessage } = useClientManager();
  const [sessionStatus, setSessionStatus] = useState(1); // 1: 진행중, 0: 종결
  const [clientListData, setClientListData] = useState([]); // ClientList 전용 데이터
  const [sessionData, setSessionData] = useRecoilState(sessionDataState); // 회기 데이터 (Recoil)
  const setCurrentSession = useSetRecoilState(currentSessionState); // 현재 선택된 세션
  const [sessionLoading, setSessionLoading] = useState(false); // 회기 데이터 로딩 상태
  const [memoModalOpen, setMemoModalOpen] = useState(false); // 메모 수정 모달 상태
  const [endConfirmOpen, setEndConfirmOpen] = useState(false); // 종결 확인 모달 상태
  // 타임라인 최신 그룹 캐시 및 회기별 요약 맵(sessionSeq 기준)
  const [timelineRows, setTimelineRows] = useState([]);
  const [summaryBySessionSeq, setSummaryBySessionSeq] = useState({});

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

  // 회기 데이터 불러오기 (clientId가 있을 때만)
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!clientId) {
        setSessionData([]);
        setIsEmpty(true);
        return;
      }

      setSessionLoading(true);
      try {
        const response = await sessionList(parseInt(clientId));
        if (response.code === 200 && Array.isArray(response.data)) {
          setSessionData(response.data);
          setIsEmpty(response.data.length === 0);
        } else {
          setSessionData([]);
          setIsEmpty(true);
        }
      } catch (error) {
        console.error('회기 목록 조회 실패:', error);
        setSessionData([]);
        setIsEmpty(true);
      } finally {
        setSessionLoading(false);
      }
    };

    fetchSessionData();
  }, [clientId]);

  // 타임라인 최신 그룹을 한 번만 조회해서 캐시 (clientId 변경 시)
  useEffect(() => {
    const fetchTimelineOnce = async () => {
      if (!clientId) { setTimelineRows([]); setSummaryBySessionSeq({}); return; }
      try {
        const res = await timelineList(parseInt(clientId, 10));
        if (res.code === 200 && Array.isArray(res.data)) {
          const list = res.data;
          if (list.length === 0) { setTimelineRows([]); setSummaryBySessionSeq({}); return; }
          // 최신 그룹(패널용)
          const latestGroupSeq = Math.max(...list.map(r => r.sessiongroupSeq || 0));
          const latestGroupRows = list.filter(r => r.sessiongroupSeq === latestGroupSeq);
          setTimelineRows(latestGroupRows);
          // 전체 데이터 기준으로 sessionSeq → 요약 맵 생성 (테이블용)
          const mapAll = {};
          list.forEach(row => {
            const key = row.sessionSeq != null ? String(row.sessionSeq) : '';
            if (key) mapAll[key] = row.counselingSummaryText || '';
          });
          setSummaryBySessionSeq(mapAll);
        } else {
          setTimelineRows([]);
          setSummaryBySessionSeq({});
        }
      } catch (e) {
        setTimelineRows([]);
        setSummaryBySessionSeq({});
      }
    };
    fetchTimelineOnce();
  }, [clientId]);

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
    // ClientList 데이터 업데이트를 위한 추가 함수들
    const additionalUpdates = {
      updateClientList: (updatedClient) => {
        setClientListData(prevListData => 
          prevListData.map(client => 
            client.clientSeq === updatedClient.clientSeq 
              ? updatedClient
              : client
          )
        );
      },
      addToClientList: (newClient) => {
        // 새 내담자 등록 시 현재 sessionStatus에 맞는 경우에만 추가
        if (newClient.sessionStatus === sessionStatus) {
          setClientListData(prevListData => [...prevListData, newClient]);
        }
      }
    };

    const result = await saveClient(clientData, editClient, additionalUpdates);
    if (result.success) {
      setRegisterOpen(false);
      setEditClient(null);
    }
  };

  const handleSelectClient = (client) => {
    navigate(`/clients/sessions?clientId=${client.clientSeq}`, { replace: true });
  };

  const handleRecordSelect = async (recordData) => {
    try {
      const sessionData = {
        clientSeq: parseInt(clientId),
        sessionDate: recordData.sessionDate,
      };
      
      const response = await sessionCreate(sessionData);
      
      if (response.code === 200) {
        // 회기 등록 성공 시 회기 목록 다시 불러오기
        const sessionResponse = await sessionList(parseInt(clientId));
        if (sessionResponse.code === 200 && Array.isArray(sessionResponse.data)) {
          setSessionData(sessionResponse.data);
          setIsEmpty(sessionResponse.data.length === 0);
        }
        
        showToastMessage('회기가 등록되었습니다.');
      } else {
        showToastMessage(response.message || '회기 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('회기 등록 오류:', error);
      showToastMessage('회기 등록 중 오류가 발생했습니다.');
    } finally {
      setRecordSelectOpen(false);
    }
  };

  // 메모 수정 모달 열기
  const handleEditMemo = () => {
    setMemoModalOpen(true);
  };

  // 메모 저장 처리
  const handleMemoSave = async (memoValue) => {
    // ClientList 데이터 업데이트를 위한 추가 함수
    const additionalUpdates = {
      updateClientList: (clientSeq, memo) => {
        setClientListData(prevListData => 
          prevListData.map(client => 
            client.clientSeq === clientSeq 
              ? { ...client, memo }
              : client
          )
        );
      }
    };

    const result = await saveMemo(clientId, memoValue, additionalUpdates);
    if (result.success) {
      setMemoModalOpen(false);
    }
  };

  // 종결 처리 모달 열기
  const handleSessionEnd = () => {
    if (!clientId) return;
    setEndConfirmOpen(true);
  };

  // 종결 처리
  const handleSessionEndConfirm = async () => {
    if (!clientId) return;
    try {
      // 가장 최신 회기 정보 확인
      if (!Array.isArray(sessionData) || sessionData.length === 0) {
        showToastMessage('종결 처리할 회기 정보가 없습니다.');
        return;
      }
      const latest = sessionData[0];
      if (!latest?.sessionSeq) {
        showToastMessage('회기 식별자(sessionSeq)를 확인할 수 없습니다.');
        return;
      }
      if (latest?.sessionType === 'LAST') {
        showToastMessage('이미 종결된 회기입니다.');
        return;
      }

      const response = await sessionGroupComplete(parseInt(clientId, 10));

      if (response.code === 200) {
        // 회기 목록 다시 불러오기
        const sessionResponse = await sessionList(parseInt(clientId));
        if (sessionResponse.code === 200 && Array.isArray(sessionResponse.data)) {
          setSessionData(sessionResponse.data);
          setIsEmpty(sessionResponse.data.length === 0);
        }
        showToastMessage('종결 처리가 완료되었습니다.');
      } else {
        showToastMessage(response.message || '종결 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('종결 처리 오류:', error);
      showToastMessage('종결 처리 중 오류가 발생했습니다.');
    } finally {
      setEndConfirmOpen(false);
    }
  };

  // 가장 최근 회기가 종결 회기인지 확인
  const isLastSessionEnded = () => {
    if (!sessionData || sessionData.length === 0) return false;
    // 가장 최근 회기 (첫 번째 요소)의 sessionType이 'LAST'인지 확인
    return sessionData[0]?.sessionType === 'LAST';
  };

  return (
    <>
      <ClientList
        clients={clientListData}
        onSelect={handleSelectClient}
        fold={fold}
        sessionStatus={sessionStatus}
        onStatusChange={handleStatusChange}
        masked={masked}
        selectedClientSeq={clientId}
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
          onEditMemo={handleEditMemo}
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
              <button 
                className="type05 white" 
                type="button"
                disabled={isLastSessionEnded()}
                onClick={handleSessionEnd}
                style={isLastSessionEnded() ? { pointerEvents: 'none', color: '#b6b6b6', backgroundColor: '#eeeeee' } : {}}
              >
                진행중 회기 종결
              </button>
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
              <p className="empty-info">작성 완료한 상담일지가 없습니다.<br/>해당 회기를 생성하고 상담일지 작성(녹취록 분석)을 진행 할 수 있어요.</p>
              <button className="type11 h44" type="button" onClick={() => setRecordSelectOpen(true)}>회기 등록</button>
            </>
          ) : (
            <SessionTable 
              clientId={clientId}
              sessionData={sessionData}
              loading={sessionLoading}
              summaryBySessionSeq={summaryBySessionSeq}
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
        clientSeq={clientId}
        prefetchedTimeline={timelineRows}
      />
      <RecordSelectModal
        open={recordSelectOpen}
        onClose={() => setRecordSelectOpen(false)}
        onSave={handleRecordSelect}
      />
      <EditorModal
        open={memoModalOpen}
        onClose={() => setMemoModalOpen(false)}
        onSave={handleMemoSave}
        title="내담자 메모"
        className="client-memo"
        placeholder="예 : 충동행동이 있으며, 항정신성 약물을 복용 중임"
        maxLength={500}
        initialValue={client?.memo || ""}
      />
      <EditorConfirm
        open={endConfirmOpen}
        onClose={() => setEndConfirmOpen(false)}
        onCancel={() => setEndConfirmOpen(false)}
        onConfirm={handleSessionEndConfirm}
        title="진행중 회기 종결"
        message="진행중인 회기를 종결하시겠습니까?"
      />
    </>
  );
}

export default Sessions;
