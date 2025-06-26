import React, { useEffect, useState, useCallback } from "react";
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
  const [fold, setFold] = useState(() => typeof window !== "undefined" ? window.innerWidth <= MOBILE_WIDTH : false);
  const [supportPanel, setSupportPanel] = useState(false);
  const [scroll, setScroll] = useState(() => typeof window !== "undefined" ? window.scrollY >= 100 : false);

  // main, footer width 조정
  const updateMainWidth = useCallback(() => {
    const main = document.querySelector("main");
    const footer = document.querySelector("footer");
    if (!main || !footer) return;
    let leftWidth = fold ? FOLDED_WIDTH : UNFOLDED_WIDTH;
    let rightWidth = supportPanel ? SUPPORT_PANEL_WIDTH : 0;
    const newWidth = `calc(100% - ${leftWidth}rem - ${rightWidth}rem)`;
    const newMargin = `${leftWidth}rem`;
    main.style.width = newWidth;
    main.style.marginLeft = newMargin;
    footer.style.width = newWidth;
  }, [fold, supportPanel]);

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

  const handleMenuClick = () => {
    setFold((prev) => !prev);
  };

  // 페이지별 타이틀 매핑
  const pathTitleMap = {
    '/': '홈',
    '/schedule': '스케줄 관리',
    '/clients': '내담자 관리',
    '/document': '문서 관리',
    '/mypage': '마이페이지',
    '/support': '고객지원',
    '/clients/consults': '상담관리',
  };
  const pageTitle = pathTitleMap[location.pathname] || '';

  return (
    <div className="wrapper consults">
      <Header scroll={scroll} title={pageTitle} fold={fold} />
      <Sidebar fold={fold} onToggleFold={handleMenuClick} />
      <main className={`${fold ? " on" : ""}`}>
        <Outlet />
      </main>
      <Footer fold={fold} />
    </div>
  );
};

export default RootLayout;