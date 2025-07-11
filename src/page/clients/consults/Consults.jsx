import React, { useRef, useLayoutEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { maskingState, clientsState } from "@/recoil";
import { useLocation } from 'react-router-dom';
import './consults.scss';

import ClientProfile from './../components/ClientProfile';
import CounselManagement from './components/CounselManagement';
import PsychologicalTest from './psychologicalTest/PsychologicalTest';
import DailyManagement from './daily/DailyManagement';
import DocumentBox from './document/DocumentBox';
import ClientRegisterModal from './../components/ClientRegisterModal';
import UploadModal from './components/UploadModal';

const TAB_LIST = [
  { label: '상담관리', component: CounselManagement, panelClass: 'counsel' },
  { label: '심리검사', component: PsychologicalTest, panelClass: 'test' },
  { label: '일상관리', component: DailyManagement, panelClass: 'daily' },
  { label: '문서함', component: DocumentBox, panelClass: 'document' },
];

function Consults() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const clientId = query.get('clientId');
  const clients = useRecoilValue(clientsState);
  const client = clients.find(c => String(c.id) === String(clientId));
  const [masked, setMasked] = useRecoilState(maskingState);
  const [activeTab, setActiveTab] = useState(0);
  const tabListRef = useRef([]);
  const tabIndicatorRef = useRef(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // 탭 indicator 이동 효과
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
                  onClick={() => setActiveTab(idx)}
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
              <ActiveComponent setShowUploadModal={setShowUploadModal}/>
            </div>
          </div>
        </div>
        <div className="floating-btn"></div>
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
    </>
  );
}

export default Consults;

