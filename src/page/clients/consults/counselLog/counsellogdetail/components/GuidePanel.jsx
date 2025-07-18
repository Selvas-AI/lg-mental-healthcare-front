import React, { useEffect, useRef, useState } from 'react';

const tabs = [
  {
    label: '양호',
    score: '1점',
    items: [
      ['자살에 대한 취약성', '없음'],
      ['호소하는 증상', '없음'],
      ['자살 사고', '없음'],
      ['과거 자살행동', '없음'],
      ['충동성', '없음'],
      ['보호요인', '없음'],
      ['자살계획', '없음'],
      ['자살방법', '없음'],
      ['실행의지', '없음'],
    ],
  },
  {
    label: '주의',
    score: '2점',
    items: [
      ['자살에 대한 취약성', '위험요인 적음'],
      ['호소하는 증상', '경미한 우울한 기분'],
      ['자살 사고', '간헐적 자살 사고의 빈도, 강도와 기간'],
      ['과거 자살행동', '없음'],
      ['충동성', '자기조절력 좋음'],
      ['보호요인', '식별 가능한 보호요인이 존재'],
      ['자살계획', '모호함'],
      ['자살방법', '덜 치명적이거나 없음'],
      ['실행의지', '없음'],
    ],
  },
  {
    label: '위험',
    score: '3점',
    items: [
      ['자살에 대한 취약성', '위험요인 몇 개 있음'],
      ['호소하는 증상', '간헐적인 우울한 기분'],
      ['자살 사고', '자살사고의 높은 빈도와 중간 정도의 강도와 기간'],
      ['과거 자살행동', '있음'],
      ['충동성', '자기조절력 좋음'],
      ['보호요인', '식별 가능한 보호요인이 존재'],
      ['자살계획', '구체적'],
      ['자살방법', '치명적'],
      ['실행의지', '없음'],
    ],
  },
  {
    label: '고위험',
    score: '4점',
    items: [
      ['자살에 대한 취약성', '위험요인 다수 있음'],
      ['호소하는 증상', '심각한 우울한 기분'],
      ['자살 사고', '높은 강도의 강렬하고 지속적인 자살사고'],
      ['과거 자살행동', '있음'],
      ['충동성', '손상된 자기조절력'],
      ['보호요인', '보호요인이 적거나 없음'],
      ['자살계획', '구체적'],
      ['자살방법', '치명적'],
      ['실행의지', '있음'],
    ],
  },
];

function GuidePanel({ open, onClose }) {
  const [activeTab, setActiveTab] = useState(0);
  const tabRefs = useRef([]);
  const indicatorRef = useRef(null);

  // 탭 이동 시 indicator 위치/크기 갱신
  useEffect(() => {
    const $tab = tabRefs.current[activeTab];
    const $indicator = indicatorRef.current;
    if ($tab && $indicator) {
      $indicator.style.width = $tab.offsetWidth + 'px';
      $indicator.style.left = $tab.offsetLeft + 'px';
    }
  }, [activeTab, open]);

  return (
    <div className={"support-panel risk-guide" + (open ? " on" : "")}>
      <div className="inner">
        <div className="panel-tit">
          <div className="tit-wrap">
            <strong>위기 사례 구분 단계 평정 가이드</strong>
            <button className="close-btn" type="button" aria-label="닫기" onClick={onClose}></button>
          </div>
          <div className="info">
            <p>아래 표를 참고하여 내담자의 위기 단계를 평정해 보세요.</p>
          </div>
        </div>
        <div className="panel-cont">
          <div className="tab-menu">
            <div className="tab-list-wrap">
              <ul className="tab-list" role="tablist">
                {tabs.map((tab, idx) => (
                  <li
                    key={tab.label}
                    className={`cursor-pointer ${activeTab === idx ? 'on' : ''}`}
                    role="tab"
                    ref={el => tabRefs.current[idx] = el}
                  >
                    <a
                      onClick={e => { e.preventDefault(); setActiveTab(idx); }}
                    >
                      <span>{tab.label}</span>
                      <span>({tab.score})</span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="tab-indicator" ref={indicatorRef}></div>
            </div>
            <div className="tab-cont">
              {tabs.map((tab, idx) => (
                <div
                  className={`tab-panel${activeTab === idx ? ' on' : ''}`}
                  role="tabpanel"
                  key={tab.label}
                  style={{ display: activeTab === idx ? 'block' : 'none' }}
                >
                  <div className="inner">
                    <div className="list-tit">
                      <span>{tab.label}</span>
                      <span>({tab.score})</span>
                    </div>
                    <div className="list-wrap">
                      <ul>
                        {tab.items.map(([k, v], i) => (
                          <li key={i}>
                            <div>{k}</div>
                            <div>{v}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuidePanel