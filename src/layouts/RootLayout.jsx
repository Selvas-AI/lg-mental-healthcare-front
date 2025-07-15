import React, { useEffect, useCallback, useState } from "react";
import { useRecoilState } from "recoil";
import { foldState, supportPanelState } from "@/recoil";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet, useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { recordingsTabState } from "@/recoil/commonAtom";

const MOBILE_WIDTH = 1280;
const RootLayout = () => {
  const location = useLocation();
  const [fold, setFold] = useRecoilState(foldState);
  const [supportPanel, setSupportPanel] = useRecoilState(supportPanelState);
  const [scroll, setScroll] = useState(() => typeof window !== "undefined" ? window.scrollY >= 100 : false);
  const activeTab = useRecoilValue(recordingsTabState);
  const isRecordingsPage = location.pathname.startsWith('/clients/recordings');
  const showFooter = !isRecordingsPage || activeTab === 'aianalysis';

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
    const supportPaths = ["/clients/sessions"];
    const consultPaths = ["/clients/consults", "/clients/recordings"];
    if (supportPanel && supportPaths.some(path => location.pathname.startsWith(path))) cls += " support-open";
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

  const handleMenuClick = () => {
    setFold((prev) => !prev);
  };

  // 경로에 따라 페이지별 클래스명 매칭
  const pageClass = (() => {
    if (location.pathname.startsWith("/clients/recordings")) return "recordings";
    if (location.pathname.startsWith("/clients/consults")) return "consults";
    if (location.pathname.startsWith("/clients/sessions")) return "sessions";
    if (location.pathname.startsWith("/clients")) return "clients";
    return "";
  })();

  // 페이지별 타이틀 매핑
  const pathTitleMap = {
    '/': '홈',
    '/schedule': '스케줄 관리',
    '/clients': '내담자 관리',
    '/document': '문서 관리',
    '/mypage': '마이페이지',
    '/support': '고객지원',
    '/clients/consults': '상담관리',
    '/clients/sessions': '회기 목록',
    '/clients/recordings': '3회기 녹취록',
  };
  const pageTitle = pathTitleMap[location.pathname] || '';

  return (
    <div className={`wrapper ${pageClass}`}>
      <Header scroll={scroll} title={pageTitle} fold={fold} />
      <Sidebar fold={fold} onToggleFold={handleMenuClick} />
      <main className={getMainClass()}>
        <Outlet />
      </main>
      {showFooter && <Footer className={getFooterClass()} fold={fold} />}
    </div>
  );
};

export default RootLayout;