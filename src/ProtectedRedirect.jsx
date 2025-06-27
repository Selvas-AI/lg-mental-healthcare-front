import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ProtectedRedirect() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      navigate("/home", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);
  return null;
}

export default ProtectedRedirect;
