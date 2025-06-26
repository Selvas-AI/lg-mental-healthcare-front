import React, { useMemo } from "react";

function Header({ scroll, title, fold }) {
  const fadeStyle = useMemo(() => ({
    opacity: scroll ? 1 : 0,
    display: 'block',
    transition: 'opacity 0.2s',
    transitionDelay: scroll ? '50ms' : '0ms',
    pointerEvents: scroll ? 'auto' : 'none',
  }), [scroll]);

  return (
    <header className={[scroll ? 'scroll' : '', fold ? 'on' : ''].filter(Boolean).join(' ')}>
      <div className="inner">
        <div className="left">
          <button className="back-btn" type="button" aria-label="뒤로가기"></button>
          {title && (
            <strong className="page-title" style={fadeStyle}>{title}</strong>
          )}
        </div>
        <div className="right">
          <div className="switch-wrap" style={fadeStyle}>
            <label>
              <span>개인정보 보호</span>
              <input role="switch" name="switch" type="checkbox" defaultChecked />
            </label>
          </div>
          <div className="btn-wrap">
            <button className="search-btn" type="button" aria-label="검색"></button>
            <button className="alarm-btn" type="button" aria-label="알림"></button>
            <button
              className="mypage-btn"
              type="button"
              aria-label="마이페이지"
            ></button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
