import React, { useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logoImg from "@/assets/images/logo.svg";
import txtLogoImg from "@/assets/images/onshim.svg";

const Sidebar = ({ fold, onToggleFold }) => {
  const txtLogoRef = useRef(null);
  const navigate = useNavigate();

  // 메뉴 버튼 클릭 시 fold 토글
  const handleMenuClick = () => {
    onToggleFold();
  };

  return (
    <nav className="lnb">
      <div className={`inner${fold ? " fold" : ""}`}>
        <div className="top">
          <h1 className="logo">
            <a href="#">
              <img className="img-logo" src={logoImg} alt="Onshim 이미지 로고" />
              <img
                className="txt-logo"
                src={txtLogoImg}
                alt="Onshim 텍스트 로고"
                ref={txtLogoRef}
                style={{ display: fold ? "none" : undefined }}
              />
            </a>
          </h1>
          <button className="menu-btn" type="button" aria-label="메뉴" onClick={handleMenuClick}></button>
        </div>
        <div className="menu">
          <ul className="list">
            {[
              { name: "홈", path: "/" },
              { name: "스케줄 관리", path: "/schedule" },
              { name: "내담자 관리", path: "/clients" },
              { name: "문서 관리", path: "/document" },
              { name: "마이페이지", path: "/mypage" },
              { name: "고객지원", path: "/support" },
            ].map((item) => (
              <li
                key={item.path}
                className={window.location.pathname === item.path ? "on" : undefined}
                style={{ width: "100%", cursor: "pointer" }}
                onClick={() => {
                  if (window.location.pathname !== item.path) {
                    navigate(item.path);
                  }
                }}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-item ${item.path === "/" ? "home" : item.path.replace("/", "")}${isActive ? " on" : ""}`
                  }
                  end={item.path === "/"}
                  style={{ display: "block", width: "100%", height: "100%" }}
                >
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Sidebar;