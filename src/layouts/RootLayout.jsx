import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

const MOBILE_WIDTH = 1280;
const FOLDED_WIDTH = 7.6;
const UNFOLDED_WIDTH = 18;
const SUPPORT_PANEL_WIDTH = 36;

const RootLayout = () => {
  const [fold, setFold] = useState(window.innerWidth <= MOBILE_WIDTH);
  const [supportPanel, setSupportPanel] = useState(false);
  const [scroll, setScroll] = useState(window.scrollY >= 100);

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
  const handleResize = useCallback(() => {
    const shouldFold = window.innerWidth <= MOBILE_WIDTH;
    setFold(shouldFold);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  // 스크롤 이벤트
  useEffect(() => {
    function handleScroll() {
      setScroll(window.scrollY >= 100);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // fold/supportPanel/scroll 상태 변경 시 main/footer width 조정
  useEffect(() => {
    updateMainWidth();
  }, [fold, supportPanel, updateMainWidth]);

  // 최초 진입 시 fold/scroll 상태 및 main/footer width 세팅
  useEffect(() => {
    setFold(window.innerWidth <= MOBILE_WIDTH);
    setScroll(window.scrollY >= 100);
    updateMainWidth();
  }, []);

  const handleMenuClick = () => {
    setFold((prev) => !prev);
  };

  useEffect(() => {
    console.log('fold changed:', fold);
  }, [fold]);
  // support-panel on/off 토글 함수 (예시)
  const toggleSupportPanel = () => setSupportPanel((v) => !v);

  return (
    <div className="wrapper">
      <Header scroll={scroll} />
      <Sidebar fold={fold} onToggleFold={handleMenuClick} />
      <main className={`consults${fold ? " on" : ""}`}>
        <Outlet />
      </main>
      <Footer />
      {/* support-panel 토글 버튼/패널은 필요에 따라 구현 */}
    </div>
  );
};

export default RootLayout;