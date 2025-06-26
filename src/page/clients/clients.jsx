

import { useNavigate } from "react-router-dom";

export default function Clients() {
  const navigate = useNavigate();

  return (
    <>
      <div className="move-up">
        <strong className="page-title">내담자 관리</strong>
        <div className="switch-wrap">
          <label>
            <span>개인정보 보호</span>
            <input role="switch" name="switch" type="checkbox" defaultChecked />
          </label>
        </div>
      </div>

      <button className="type07" style={{marginTop: '2rem'}} onClick={() => navigate('/clients/consults')}>
        상담관리 보기
      </button>
    </>
  );
}
