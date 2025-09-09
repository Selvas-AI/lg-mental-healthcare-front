import React, { useState, useEffect, useRef, useMemo } from 'react';
import SymptomResult from './SymptomResult';

function SymptomChangePanel({ data, onOpenSurveySendModal, hideSendButton }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const targetIdRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // 데이터가 없으면 렌더링하지 않음
  const navigationItems = useMemo(() => (
    Array.isArray(data) ? data.map(item => ({ id: item.id, label: item.caption })) : []
  ), [data]);

  // 스크롤 위치에 따른 selectedIndex 자동 업데이트
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const elementId = entry.target.id;
          const index = navigationItems.findIndex(item => item.id === elementId);
          if (index === -1) return;

          // 네비게이팅 중에는 목표 섹션이 중앙에 왔을 때만 선택 반영
          if (isNavigating) {
            if (targetIdRef.current && elementId !== targetIdRef.current) {
              return; // 목표가 아니면 무시
            }
            // 목표 섹션 도달: 선택 반영 후 락 해제
            setSelectedIndex(index);
            setIsNavigating(false);
            targetIdRef.current = null;
            return;
          }

          // 평상시(수동 스크롤)에는 관찰된 섹션으로 선택 반영
          setSelectedIndex(index);
        });
      },
      {
        // 실제 스크롤이 윈도우에서 일어나는 경우가 많으므로 viewport 기준으로 관찰
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
  }, [navigationItems, isNavigating]);

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
      {/* 로컬 스크롤 컨테이너 */}
      <div className="changes-scroll" ref={scrollContainerRef}>
        <div className="move-control">
          <ul>
          {navigationItems.map((item, idx) => (
            <li key={item.id}>
              <a
                className={`cursor-pointer${selectedIndex === idx ? ' on' : ''}`}
                onClick={() => {
                  // 클릭 시에는 스크롤만 수행하고, 실제 선택 반영은 IntersectionObserver가 담당
                  setIsNavigating(true);
                  targetIdRef.current = item.id;
                  document.getElementById(item.id)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                  });
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
    </div>
  );
}

export default SymptomChangePanel;
