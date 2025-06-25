import React from "react";

function Footer({ fold }) {
  return (
    <footer className={fold ? "on" : ""}>
      <div className="inner">
        <p className="copyright">ⓒ 2025. Onshim Co., Ltd. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
