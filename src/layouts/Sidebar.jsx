import React, { useRef } from "react";
import { NavLink } from "react-router-dom";
import logoImg from "@/assets/images/logo.svg";
import txtLogoImg from "@/assets/images/onshim.svg";

const menuItems = [
  { name: "홈", path: "/home" },
  { name: "스케줄 관리", path: "/schedule" },
  { name: "내담자 관리", path: "/clients" },
  { name: "문서 관리", path: "/document" },
  { name: "마이페이지", path: "/mypage" },
  { name: "고객지원", path: "/support" },
];

const Sidebar = ({ fold, onToggleFold }) => {
  const txtLogoRef = useRef(null);

  // 메뉴 버튼 클릭 시 fold 토글
  const handleMenuClick = () => {
    onToggleFold();
  };

  return (
    <nav className="lnb">
      <div className={`inner${fold ? " fold" : ""}`}>
        <div className="top">
          <h1 className="logo">
            <NavLink to="/home">
              <img className="img-logo" src={logoImg} alt="Onshim 이미지 로고" />
              <img
                className="txt-logo"
                src={txtLogoImg}
                alt="Onshim 텍스트 로고"
                ref={txtLogoRef}
                style={{ display: fold ? "none" : "" }}
              />
            </NavLink>
          </h1>
          <button className="menu-btn" type="button" aria-label="메뉴" onClick={handleMenuClick}></button>
        </div>
        <div className="menu">
          <ul className="list">
            {menuItems.map((item) => {
              const { pathname } = window.location;
              const isActive = item.path === "/home"
                ? pathname === "/home"
                : pathname.startsWith(item.path);
              return (
                <li className={isActive ? "on" : undefined} key={item.path} style={{ width: "100%", cursor: "pointer", position: "relative" }}>
                  <NavLink
                    to={item.path}
                    end={item.path === "/home"}
                    className={`sidebar-item ${item.path === "/home" ? "home" : item.path.replace("/", "")}`}
                    style={{ display: "block", width: "100%", height: "100%", position: "absolute", left: "1.2rem", top: "1.2rem", zIndex: 1}}
                  >
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Sidebar;