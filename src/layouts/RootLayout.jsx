import React, { useEffect, useCallback, useState } from "react";
import { useRecoilState } from "recoil";
import { foldState, supportPanelState } from "@/recoil";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet, useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { recordingsTabState } from "@/recoil/commonAtom";
import { sessionFind } from "@/api/apiCaller";

const MOBILE_WIDTH = 1280;
const RootLayout = () => {
  const location = useLocation();
  const [fold, setFold] = useRecoilState(foldState);
  const [supportPanel, setSupportPanel] = useRecoilState(supportPanelState);
  const [scroll, setScroll] = useState(() => typeof window !== "undefined" ? window.scrollY >= 100 : false);
  const activeTab = useRecoilValue(recordingsTabState);
  const isRecordingsPage = location.pathname.startsWith('/clients/recordings') || location.pathname.startsWith('/clients/sessions') || location.pathname.startsWith('/mypage');
  const showFooter = !isRecordingsPage || activeTab === 'aianalysis';
  const [sessionNumber, setSessionNumber] = useState('');
  const [dynamicTitle, setDynamicTitle] = useState('');

  // main, footer의 className을 상태별로 조합
  function getMainClass() {
    let cls = "main";
    if (fold) cls += " folded";
    else cls += " unfolded";
    const supportPaths = ["/clients/sessions"];
    const consultPaths = ["/clients/consults", "/clients/recordings"];
    if (supportPanel && supportPaths.some(path => location.pathname.startsWith(path))) cls += " support-open";
    if (supportPanel && consultPaths.some(path => location.pathname.startsWith(path))) cls += " support-open-consults";
    return cls;
  }

  function getFooterClass() {
    let cls = "footer";
    if (fold) cls += " folded";
    else cls += " unfolded";
    const consultPaths = ["/clients/consults", "/clients/recordings"];
    if (supportPanel && consultPaths.some(path => location.pathname.startsWith(path))) cls += " support-open-consults";
    return cls;
  }

  // fold 상태 체크 (반응형)
  useEffect(() => {
    const handleResize = () => {
      setFold(window.innerWidth <= MOBILE_WIDTH);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 스크롤 이벤트
  useEffect(() => {
    const handleScroll = () => setScroll(window.scrollY >= 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // main 스타일 초기화
    setSupportPanel(false);
  }, [location.pathname, setSupportPanel]);

  // 상세 페이지에서 브로드캐스트하는 동적 타이틀 수신
  useEffect(() => {
    const handler = (e) => {
      const t = e?.detail?.title || '';
      if (
        location.pathname.startsWith('/clients/consults/psychologicalTestDetail') ||
        location.pathname.startsWith('/clients/consults/sessionAssessments')
      ) {
        setDynamicTitle(t);
      }
    };
    window.addEventListener('page-title', handler);
    return () => window.removeEventListener('page-title', handler);
  }, [location.pathname]);

  const handleMenuClick = () => {
    setFold((prev) => !prev);
  };

  useEffect(() => {
    // 특정 경로에서는 스크롤 이동하지 않음
    const excludePaths = [
      '/clients/consults/psychologicalTestDetail', // 심리검사 상세
      '/clients/consults/sessionAssessments',      // 세션 통합 검사 결과
    ];
    
    const shouldScrollToTop = !excludePaths.some(path => location.pathname.startsWith(path));
    
    if (shouldScrollToTop) {
      // 즉시 상단으로 이동 (smooth 애니메이션 무시)
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  // 경로에 따라 페이지별 클래스명 매칭
  const pageClass = (() => {
    if (location.pathname.startsWith("/clients/recordings")) return "recordings";
    if (location.pathname.startsWith("/clients/consults/detail")) return "notes gray-bg";
    if (
      location.pathname.startsWith("/clients/consults/psychologicalTestDetail") ||
      location.pathname.startsWith("/clients/consults/sessionAssessments")
    ) return "survey-detail gray-bg";
    if (location.pathname.startsWith("/clients/consults")) return "consults";
    if (location.pathname.startsWith("/clients/sessions")) return "sessions";
    if (location.pathname.startsWith("/clients")) return "clients";
    return "";
  })();

  // 녹취록 페이지에서 회기 번호 가져오기
  useEffect(() => {
    const fetchSessionNumber = async () => {
      if (location.pathname === '/clients/recordings') {
        const query = new URLSearchParams(location.search);
        const sessionSeq = query.get('sessionSeq');
        const clientId = query.get('clientId');
        
        if (sessionSeq && clientId) {
          try {
            const response = await sessionFind(clientId, sessionSeq);
            if (response.code === 200 && response.data?.sessionNo) {
              setSessionNumber(response.data.sessionNo);
            }
          } catch (error) {
            console.error('회기 정보 조회 실패:', error);
          }
        }
      } else {
        setSessionNumber(''); // 다른 페이지에서는 초기화
      }
    };
    fetchSessionNumber();
  }, [location.pathname, location.search]);

  // 페이지별 타이틀 매핑
  const getPageTitle = () => {
    const pathTitleMap = {
      '/': '홈',
      '/schedule': '스케줄 관리',
      '/clients': '내담자 관리',
      '/document': '문서 관리',
      '/mypage': '마이페이지',
      '/support': '고객지원',
      '/clients/consults': '상담관리',
      '/clients/sessions': '회기 목록',
      '/clients/recordings': sessionNumber ? `${sessionNumber}회기 녹취록` : '녹취록',
      '/clients/consults/detail': '3회기 상담일지',
      '/clients/consults/psychologicalTestDetail': dynamicTitle || 'PHQ-9 우울 검사 결과',
      '/clients/consults/sessionAssessments': dynamicTitle || '세션 통합 검사 결과',
    };
    return pathTitleMap[location.pathname] || '';
  };
  const pageTitle = getPageTitle();

  return (
    <div className={`wrapper ${pageClass}`}>
      {/* /clients/consults/detail 경로에서는 Header 렌더링 안함 */}
      {location.pathname !== '/clients/consults/detail' && (
        <Header scroll={scroll} title={pageTitle} fold={fold} />
      )}
      <Sidebar fold={fold} onToggleFold={handleMenuClick} />
      <main className={getMainClass()}>
        <Outlet />
      </main>
      {showFooter && <Footer className={getFooterClass()} fold={fold} />}
    </div>
  );
};

export default RootLayout;