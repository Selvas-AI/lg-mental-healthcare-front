import React, { useEffect, useCallback, useState } from "react";
import { useRecoilState } from "recoil";
import { foldState, supportPanelState } from "@/recoilLayout";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet, useLocation } from "react-router-dom";

const MOBILE_WIDTH = 1280;
const FOLDED_WIDTH = 7.6;
const UNFOLDED_WIDTH = 18;
const SUPPORT_PANEL_WIDTH = 36;

const RootLayout = () => {
  const location = useLocation();
  const [fold, setFold] = useRecoilState(foldState);
  const [supportPanel, setSupportPanel] = useRecoilState(supportPanelState);
  const [scroll, setScroll] = useState(() => typeof window !== "undefined" ? window.scrollY >= 100 : false);

  // main, footer width 조정
  const updateMainWidth = useCallback(() => {
    const main = document.querySelector("main");
    const footer = document.querySelector("footer");
    if (!main || !footer) return;
    // 회기목록에서 supportPanel이 열려있고, sidebar가 접혀있으면 26.6/62.6, 그 외는 37/62.6
    let leftWidth;
    let rightWidth = supportPanel ? SUPPORT_PANEL_WIDTH : 0;
    if (fold && supportPanel && location.pathname.startsWith("/clients/sessions")) {
      leftWidth = 26.6;
    } else if (supportPanel && location.pathname.startsWith("/clients/sessions")) {
      leftWidth = 37;
    } else {
      leftWidth = fold ? FOLDED_WIDTH : UNFOLDED_WIDTH;
    }
    const newWidth = `calc(100% - ${leftWidth}rem - ${rightWidth}rem)`;
    const newMargin = `${leftWidth}rem`;
    main.style.width = newWidth;
    main.style.marginLeft = newMargin;
    // footer.style.width = newWidth;
  }, [fold, supportPanel, location.pathname]);

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

  // fold/supportPanel 상태 변경 시 main/footer width 조정
  useEffect(() => {
    updateMainWidth();
  }, [fold, supportPanel, updateMainWidth]);

  // /clients/sessions 경로에서만 supportPanel(main영역) 유지
  useEffect(() => {
    if (!location.pathname.startsWith("/clients/sessions")) {
      setSupportPanel(false);
    }
  }, [location.pathname, setSupportPanel]);

  const handleMenuClick = () => {
    setFold((prev) => !prev);
  };

  // 경로에 따라 페이지별 클래스명 매칭
  const pageClass = (() => {
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
  };
  const pageTitle = pathTitleMap[location.pathname] || '';

  return (
    <div className={`wrapper ${pageClass}`}>
      <Header scroll={scroll} title={pageTitle} fold={fold} />
      <Sidebar fold={fold} onToggleFold={handleMenuClick} />
      <main className={`${fold ? " on" : ""}`}>
        <Outlet />
      </main>
      <Footer fold={fold}/>
    </div>
  );
};

export default RootLayout;