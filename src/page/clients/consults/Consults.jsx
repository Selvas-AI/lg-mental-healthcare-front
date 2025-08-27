import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { maskingState, clientsState, supportPanelState, currentSessionState, sessionDataState, editorConfirmState } from "@/recoil";
import { useLocation, useNavigate } from 'react-router-dom';
import { sessionMngFind, sessionFind, clientFind, sessionCurrentUpdate, sessionList, audioFind, audioDelete } from '@/api/apiCaller';
import { useClientManager } from '@/hooks/useClientManager';
import './consults.scss';

import ClientProfile from './../components/ClientProfile';
import CounselManagement from './components/CounselManagement';
import PsychologicalTest from './psychologicalTest/PsychologicalTest';
import DailyManagement from './daily/DailyManagement';
import DocumentBox from './document/DocumentBox';
import ClientRegisterModal from './../components/ClientRegisterModal';
import UploadModal from './components/UploadModal';
import AiPanelCommon from '@/components/AiPanelCommon';
import SurveySendModal from './psychologicalTest/components/SurveySendModal';
import ToastPop from '@/components/ToastPop';
import EditorModal from '../components/EditorModal';
import RecordSelectModal from '../sessions/RecordSelectModal';
import EditorConfirm from '../components/EditorConfirm';

const TAB_LIST = [
  { label: '상담관리', component: CounselManagement, panelClass: 'counsel'},
  { label: '심리검사', component: PsychologicalTest, panelClass: 'survey' },
  { label: '일상관리', component: DailyManagement, panelClass: 'daily' },
  { label: '문서함', component: DocumentBox, panelClass: 'document' },
];

function Consults() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const clientId = query.get('clientId');
  const sessionSeq = query.get('sessionSeq');
  const tabParam = query.get('tab');
  const clients = useRecoilValue(clientsState);
  const setClients = useSetRecoilState(clientsState);
  const client = clients.find(c => String(c.clientSeq) === String(clientId));
  const [masked, setMasked] = useRecoilState(maskingState);
  const setCurrentSession = useSetRecoilState(currentSessionState);
  const setSessionDataRecoil = useSetRecoilState(sessionDataState);
  const [editOpen, setEditOpen] = useState(false);
  
  // URL 쿼리 파라미터에서 탭 인덱스 가져오기 (기본값: 0)
  const getTabIndexFromParam = (tabParam) => {
    const tabMap = {
      'counsel': 0,
      'survey': 1, 
      'daily': 2,
      'document': 3
    };
    return tabMap[tabParam] !== undefined ? tabMap[tabParam] : 0;
  };

  // 녹취파일 삭제 확정 처리 (모달 확인 버튼에서 호출)
  const handleConfirmDeleteAudio = async () => {
    try {
      if (!sessionSeq) {
        showToastMessage('sessionSeq를 확인할 수 없습니다.');
        setConfirmOpen(false);
        return;
      }
      const res = await audioDelete(Number(sessionSeq));
      if (res?.code === 200) {
        setAudioData(null); // Transcript에서 audioFileExists를 false로 유도
        showToastMessage('녹취파일이 삭제되었습니다.');
      } else {
        showToastMessage(res?.message || '삭제에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } catch (e) {
      console.error('녹취파일 삭제 오류:', e);
      showToastMessage('삭제 중 오류가 발생했습니다.');
    } finally {
      setConfirmOpen(false);
    }
  };

  // 회기 일시 수정 트리거 (SessionSelect에서 호출)
  const handleOpenEdit = () => {
    setEditOpen(true);
  };

  // 회기 일시 수정 저장 처리
  const handleEditSave = async (recordData) => {
    try {
      if (!clientId) return;
      if (!sessionSeq) {
        showToastMessage('회기 식별자(sessionSeq)를 확인할 수 없습니다.');
        return;
      }
      // 새 API 스펙에 맞춘 요청 바디 구성
      // POST /api/session/update
      // body: { sessionSeq, sessionDate, sessionStatus?, sessionType?, memo? }
      const payload = {
        sessionSeq: parseInt(sessionSeq, 10),
        sessionDate: recordData?.sessionDate,
        ...(recordData?.sessionStatus ? { sessionStatus: recordData.sessionStatus } : {}),
        ...(recordData?.sessionType ? { sessionType: recordData.sessionType } : {}),
        ...(recordData?.memo ? { memo: recordData.memo } : {}),
      };
      // undefined 필드는 axios가 직렬화 시 포함하지 않지만, 방어적으로 정리 필요 시 아래와 같이 필터링 가능
      // const payload = Object.fromEntries(Object.entries(rawPayload).filter(([_, v]) => v !== undefined));
      const res = await sessionCurrentUpdate(payload);
      if (res?.code === 200) {
        // 수정 성공 후 최신 회기 목록으로 Recoil 상태 갱신
        const listRes = await sessionList(parseInt(clientId, 10));
        if (listRes?.code === 200 && Array.isArray(listRes.data)) {
          setSessionDataRecoil(listRes.data);
        }
        showToastMessage('회기 일시가 수정되었습니다.');
      } else {
        console.warn('회기 일시 수정 실패', res);
        showToastMessage(res?.message || '회기 일시 수정에 실패했습니다.');
      }
    } catch (e) {
      console.error('회기 일시 수정 중 오류', e);
      showToastMessage('회기 일시 수정 중 오류가 발생했습니다.');
    } finally {
      setEditOpen(false);
    }
  };
  
  const [activeTab, setActiveTab] = useState(getTabIndexFromParam(tabParam));
  const tabListRef = useRef([]);
  const tabIndicatorRef = useRef(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAiSummary, setShowAiSummary] = useState(false);
  const setSupportPanel = useSetRecoilState(supportPanelState);
  const [showSurveySendModal, setShowSurveySendModal] = useState(false);
  const [sessionMngData, setSessionMngData] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [audioData, setAudioData] = useState(null); // 오디오 데이터 상태
  const [memoModalOpen, setMemoModalOpen] = useState(false); // 메모 수정 모달 상태
  const [confirmOpen, setConfirmOpen] = useState(false); // 공통 확인 모달 (녹취파일 삭제 등)
  const [globalEditorConfirm, setGlobalEditorConfirm] = useRecoilState(editorConfirmState);
  
  // 내담자 관리 커스텀 훅 사용
  const { saveClient, saveMemo, toastMessage, showToast, showToastMessage } = useClientManager();
  
  // clientId가 있을 때 특정 내담자 데이터 조회 (새로고침 대응)
  useEffect(() => {
    const fetchClientData = async () => {
      if (clientId && !client) {
        try {
          const response = await clientFind({ clientSeq: parseInt(clientId) });
          if (response.code === 200 && response.data) {
            setClients(prevClients => {
              const exists = prevClients.find(c => c.clientSeq === response.data.clientSeq);
              if (!exists) {
                return [...prevClients, response.data];
              }
              // 기존 데이터를 최신 데이터로 업데이트
              return prevClients.map(client => 
                client.clientSeq === response.data.clientSeq 
                  ? response.data 
                  : client
              );
            });
          }
        } catch (error) {
          console.error('내담자 조회 실패:', error);
        }
      }
    };

    fetchClientData();
  }, [clientId, client, setClients]);
  
  // 스크롤 위치 복원 처리
  useLayoutEffect(() => {
    const restoreScrollY = query.get('restoreScrollY');
    if (restoreScrollY) {
      // 히스토리 상태를 직접 조작하여 URL에서 스크롤 복원 파라미터 제거
      const newQuery = new URLSearchParams(location.search);
      newQuery.delete('restoreScrollY');
      newQuery.delete('targetRow');
      const cleanUrl = `${location.pathname}?${newQuery.toString()}`;
      
      // pushState로 현재 히스토리 엔트리를 직접 수정 (새 엔트리 생성하지 않음)
      window.history.replaceState(window.history.state, '', cleanUrl);
      
      // 스크롤 위치 복원 (지연 실행으로 DOM 렌더링 완료 후 실행)
      setTimeout(() => {
        window.scrollTo({ top: parseInt(restoreScrollY), behavior: 'instant' });
      }, 100);
    }
  }, [location.search]);

  useLayoutEffect(() => {
    const currentTab = tabListRef.current[activeTab];
    const indicator = tabIndicatorRef.current;
    if (currentTab && indicator) {
      const tabWidth = currentTab.offsetWidth;
      const tabLeft = currentTab.offsetLeft; 
      indicator.style.width = tabWidth + 'px';
      indicator.style.left = tabLeft + 'px';
    }
  }, [activeTab]);

  // sessionSeq가 있을 때 상담관리 데이터와 회기 데이터, 오디오 데이터 병렬 조회
  useEffect(() => {
    const fetchSessionData = async () => {
      if (sessionSeq && clientId) {
        try {
          // 세 API를 병렬로 호출
          const [sessionMngResponse, sessionResponse, audioResponse] = await Promise.all([
            sessionMngFind(sessionSeq),           // Transcript용 상담관리 데이터
            sessionFind(clientId, sessionSeq),   // TODO 관리용 회기 데이터
            audioFind(sessionSeq).catch(() => null) // 오디오 데이터 (에러 시 null)
          ]);
          
          // 상담관리 데이터 설정
          if (sessionMngResponse.code === 200) {
            setSessionMngData(sessionMngResponse.data);
          } else {
            console.error('상담관리 조회 실패:', sessionMngResponse.message);
            setSessionMngData(null);
          }
          
          // 회기 데이터 설정
          if (sessionResponse.code === 200) {
            setSessionData(sessionResponse.data);
            setCurrentSession(sessionResponse.data);
          } else {
            console.error('회기 조회 실패:', sessionResponse.message);
            setSessionData(null);
            setCurrentSession(null);
          }
          
          // 오디오 데이터 설정
          if (audioResponse?.code === 200) {
            setAudioData(audioResponse.data);
          } else {
            setAudioData(null);
          }
        } catch (error) {
          console.error('데이터 조회 오류:', error);
          setSessionMngData(null);
          setSessionData(null);
          setAudioData(null);
        }
      } else {
        setSessionMngData(null);
        setSessionData(null);
        setAudioData(null);
        setCurrentSession(null);
      }
    };

    fetchSessionData();
  }, [sessionSeq, clientId]);

  const ActiveComponent = TAB_LIST[activeTab].component;

  const onSave = async (clientData) => {
    const result = await saveClient(clientData, editClient);
    if (result.success) {
      setRegisterOpen(false);
      setEditClient(null);
    }
  };

  // 메모 수정 모달 열기
  const handleEditMemo = () => {
    setMemoModalOpen(true);
  };

  // 메모 저장 처리
  const handleMemoSave = async (memoValue) => {
    const result = await saveMemo(clientId, memoValue);
    if (result.success) {
      setMemoModalOpen(false);
    }
  };


  return (
    <>
      <div className="inner">
        <div className="move-up">
          <strong className="page-title">상담관리</strong>
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
        <div className="tab-menu type01">
          <div className="tab-list-wrap">
            <ul className="tab-list" role="tablist">
              {TAB_LIST.map((tab, idx) => (
                <li
                  key={tab.label}
                  role="tab"
                  ref={el => tabListRef.current[idx] = el}
                  className={activeTab === idx ? 'on' : ''}
                  tabIndex={0}
                  onClick={() => {
                    const tabNames = ['counsel', 'survey', 'daily', 'document'];
                    const newQuery = new URLSearchParams(location.search);
                    newQuery.set('tab', tabNames[idx]);
                    navigate(`${location.pathname}?${newQuery.toString()}`, { replace: true });
                    setActiveTab(idx);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <a>{tab.label}</a>
                </li>
              ))}
            </ul>
            <div className="tab-indicator" ref={tabIndicatorRef}></div>
          </div>
          <div className="tab-cont">
            <div className={`tab-panel ${TAB_LIST[activeTab].panelClass} on`} role="tabpanel">
              <ActiveComponent 
                setShowUploadModal={setShowUploadModal} 
                onOpenSurveySendModal={() => setShowSurveySendModal(true)}
                setShowAiSummary={setShowAiSummary}
                setSupportPanel={setSupportPanel}
                sessionMngData={activeTab === 0 ? sessionMngData : undefined}
                sessionData={activeTab === 0 ? sessionData : undefined}
                audioData={activeTab === 0 ? audioData : undefined}
                onOpenEdit={handleOpenEdit}
                onRequestAudioDelete={() => setConfirmOpen(true)}
                showToastMessage={showToastMessage}
              />
            </div>
          </div>
        </div>
        <div className="floating-btn" onClick={() => {
          setShowAiSummary(true);
          setSupportPanel(true);
        }} style={{cursor:'pointer'}}></div>
      </div>
      <ClientRegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSave={onSave}
        mode={editClient ? "edit" : "register"}
        initialData={editClient}
      />
      {showUploadModal && (
        <UploadModal
          setShowUploadModal={setShowUploadModal}
          sessionSeq={sessionSeq}
          showToastMessage={showToastMessage}
          onUploadSuccess={async (audioInfo, file) => {
            try {
              // 업로드 성공 토스트 (부모에서 표시)
              showToastMessage(`"${file?.name || '파일'}" 파일이 성공적으로 업로드되었습니다.`);

              // 업로드 직후 최신 세션/오디오 정보 재조회하여 상태 갱신
              if (sessionSeq && clientId) {
                const [sessionResponse, audioResponse] = await Promise.all([
                  sessionFind(clientId, sessionSeq).catch(() => null),
                  audioFind(sessionSeq).catch(() => null),
                ]);
                if (sessionResponse?.code === 200) {
                  setSessionData(sessionResponse.data);
                  setCurrentSession(sessionResponse.data);
                }
                if (audioResponse?.code === 200) {
                  setAudioData(audioResponse.data);
                } else if (audioInfo) {
                  // fallback: 업로드 응답 데이터로 즉시 세팅
                  setAudioData(audioInfo);
                }
              } else if (audioInfo) {
                setAudioData(audioInfo);
              }
            } catch (e) {
              console.error('업로드 후 상태 갱신 오류:', e);
            }
          }}
        />
      )}
      {/* AI 종합 의견 생성 패널 UI */}
      <AiPanelCommon
        isRecordings={true}
        open={showAiSummary}
        onClose={() => {
          setShowAiSummary(false);
          setSupportPanel(false);
        }}
        status="complete"
        title="AI 종합 의견 생성"
        description="AI가 심리 검사 종합 의견을 생성합니다."
        infoMessage="AI 종합 의견이 생성 완료되었습니다."
        keyInfo
        keyInfoText="재생성된 내용을 확정하면 원래의 내용은 사라지고<br />다시 복구할 수 없어요."
        renderComplete={() => (
          <>
            <div className="complete-cont">
              <div>3회기에서는 지난 1,2회기 보다 우울 점수가 낮아졌습니다. 7회기 문항 [Q. 죽음에 대해 생각해 보신 적이 있습니까?] 에서 이전과 달리 1점을 선택했기 때문에 우울 증상이 많이 완화된 것으로 보입니다.</div>
              <br />
              <strong>추천 방법</strong>
              <div className="bullet-line">증상이 심화되지 않도록 마음 챙김 훈련이 필요</div>
              <div className="bullet-line">작은 목표를 정하여 성취하는 것이 중요(예를 들어 하루에 10분 산책, 간단한 집안일 완수 등)</div>
              <div className="bullet-line">규칙적인 생활습관을 권장하며, 수면,식사, 운동과 관련된 구체적인 습관을 가지기</div>
            </div>
          </>
        )}
      />
      {showSurveySendModal && (
        <SurveySendModal modalOpen={showSurveySendModal} onClose={() => setShowSurveySendModal(false)} />
      )}
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
      <RecordSelectModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleEditSave}
        initialSessionDate={sessionData?.sessionDate}
      />
      {/* 공통 확인 모달: .inner 바깥 영역 */}
      <EditorConfirm
        open={confirmOpen}
        title="삭제 확인"
        message="녹취파일을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleConfirmDeleteAudio}
        onCancel={() => setConfirmOpen(false)}
        onClose={() => setConfirmOpen(false)}
      />
      {/* 전역 EditorConfirm (다른 페이지/컴포넌트에서 텍스트만 바꿔 열기) */}
      <EditorConfirm
        open={globalEditorConfirm.open}
        title={globalEditorConfirm.title || '안내'}
        message={globalEditorConfirm.message || ''}
        confirmText={globalEditorConfirm.confirmText || '확인'}
        onConfirm={() => setGlobalEditorConfirm(prev => ({ ...prev, open: false }))}
        onClose={() => setGlobalEditorConfirm(prev => ({ ...prev, open: false }))}
      />
      <ToastPop message={toastMessage} showToast={showToast} />
    </>
  );
}

export default Consults;

