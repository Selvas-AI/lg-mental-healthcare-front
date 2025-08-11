import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { maskingState, clientsState, supportPanelState } from "@/recoil";
import { useLocation, useNavigate } from 'react-router-dom';
import { sessionNoteFind } from '@/api/apiCaller';
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
  const client = clients.find(c => String(c.clientSeq) === String(clientId));
  const [masked, setMasked] = useRecoilState(maskingState);
  
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

  // sessionSeq가 있을 때 상담관리 데이터 조회
  useEffect(() => {
    const fetchSessionMngData = async () => {
      if (sessionSeq) {
        try {
          const response = await sessionNoteFind(sessionSeq);
          if (response.code === 200) {
            setSessionMngData(response.data);
          } else {
            console.error('상담관리 조회 실패:', response.message);
            setSessionMngData(null);
          }
        } catch (error) {
          console.error('상담관리 조회 오류:', error);
          setSessionMngData(null);
        }
      } else {
        setSessionMngData(null);
      }
    };

    fetchSessionMngData();
  }, [sessionSeq]);

  const ActiveComponent = TAB_LIST[activeTab].component;

  const onSave = (clientData) => {
    if (editClient) {
      // TODO: 수정 로직 구현
    } else {
      // TODO: 등록 로직 구현
    }
    setRegisterOpen(false);
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
        <UploadModal setShowUploadModal={setShowUploadModal} />
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
    </>
  );
}

export default Consults;

