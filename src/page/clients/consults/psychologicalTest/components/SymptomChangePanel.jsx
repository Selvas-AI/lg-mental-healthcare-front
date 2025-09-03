import React, { useState, useEffect } from 'react';
import SymptomResult from './SymptomResult';

function SymptomChangePanel({ data, onOpenSurveySendModal, hideSendButton }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 데이터가 없으면 렌더링하지 않음
  const navigationItems = Array.isArray(data) ? data.map(item => ({ id: item.id, label: item.caption })) : [];

  // 스크롤 위치에 따른 selectedIndex 자동 업데이트
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elementId = entry.target.id;
            const index = navigationItems.findIndex(item => item.id === elementId);
            if (index !== -1) {
              setSelectedIndex(index);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-50% 0px -50% 0px', // 요소가 화면 중앙에 올 때 트리거
        threshold: 0
      }
    );

    // 모든 섹션 요소들을 관찰
    navigationItems.forEach(item => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [navigationItems]);

  // 데이터 없으면 훅 호출 이후에 렌더링 중단
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  return (
    <div className="changes">
      <div className="tit-wrap">
        <strong>증상별 변화 알아보기</strong>
        {/* {!hideSendButton && (
          <button className="type05" type="button" onClick={onOpenSurveySendModal}>심리 검사지 전송</button>
        )} */}
      </div>
      <div className="move-control">
        <ul>
          {navigationItems.map((item, idx) => (
            <li key={item.id}>
              <a
                className={`cursor-pointer${selectedIndex === idx ? ' on' : ''}`}
                onClick={() => {
                  setSelectedIndex(idx);
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      {/* 증상별 변화 알아보기 */}
      <div className="sticky-area">
        {data.map(d => (
          <SymptomResult key={d.id} {...d} />
        ))}
      </div>
    </div>
  );
}

export default SymptomChangePanel;
