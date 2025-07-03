import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ClientProfile from "./ClientProfile";
import { useRecoilState, useRecoilValue } from "recoil";
import { maskingState, clientsState } from "@/recoil";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SessionList() {
  const [masked, setMasked] = useRecoilState(maskingState);
  const query = useQuery();
  const clientId = query.get("clientId");
  const navigate = useNavigate();
  const clients = useRecoilValue(clientsState);
  const client = clients.find(c => String(c.id) === String(clientId));

  // TODO: 실제 데이터 fetch 및 렌더링 구현
  return (
    <div className="inner">
      <div className="move-up">
        <strong className="page-title">회기 목록</strong>
        <div className="switch-wrap">
          <label>
            <span>개인정보 보호</span>
            <input
              role="switch"
              name="switch"
              type="checkbox"
              checked={masked}
              onChange={e => setMasked(e.target.checked)}
            />
          </label>
        </div>
      </div>
      <ClientProfile profileData={client} />
      <div style={{marginTop: "2rem"}}>
        <p>회기 리스트 UI</p>

        <button
          className="type07"
          style={{ marginTop: "2rem" }}
          onClick={() => navigate("/clients/consults?clientId=" + clientId)}
        >
          상담관리 보기
        </button>
      </div>
    </div>
  );
}

export default SessionList;
