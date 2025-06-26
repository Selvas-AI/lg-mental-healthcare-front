import React, { useRef, useLayoutEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { maskingState } from '@/recoil';
import './consults.scss';

import ClientProfile from './ClientProfile';
import CounselManagement from './CounselManagement';
import PsychologicalTest from './PsychologicalTest';
import DailyManagement from './DailyManagement';
import DocumentBox from './DocumentBox';

const TAB_LIST = [
  { label: '상담관리', component: CounselManagement, panelClass: 'counsel-management' },
  { label: '심리검사', component: PsychologicalTest, panelClass: 'psychological-test' },
  { label: '일상관리', component: DailyManagement, panelClass: 'daily-management' },
  { label: '문서함', component: DocumentBox, panelClass: 'document-box' },
];

function Consults() {
  const [masked, setMasked] = useRecoilState(maskingState);
  const [activeTab, setActiveTab] = useState(0);
  const tabListRef = useRef([]);
  const tabIndicatorRef = useRef(null);

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
      <ClientProfile />
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
            <ActiveComponent />
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

export default Consults;

