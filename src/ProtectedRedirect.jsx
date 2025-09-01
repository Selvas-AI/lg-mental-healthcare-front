import { useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    
    if (!isLoggedIn) {
      // 로그인되지 않은 경우 로그인 페이지로 이동
      navigate("/login", { replace: true });
    } else if (location.pathname === "/") {
      // 로그인된 상태에서 루트 경로 접근 시 내담자 목록으로 이동
      navigate("/clients", { replace: true });
    }
  }, [navigate, location.pathname]);

  // 로그인 상태 확인
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  
  // 로그인되지 않은 경우 또는 루트 경로인 경우 null 반환 (리다이렉트 중)
  if (!isLoggedIn || location.pathname === "/") {
    return null;
  }

  // 로그인된 경우 자식 컴포넌트 렌더링
  return <Outlet />;
}

export default ProtectedRedirect;
