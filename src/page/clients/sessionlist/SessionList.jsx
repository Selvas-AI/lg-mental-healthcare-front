import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ClientProfile from "../components/ClientProfile";
import ClientList from "./ClientList";
import { useRecoilState, useRecoilValue } from "recoil";
import { maskingState, clientsState } from "@/recoil";
import "./sessions.scss";

import ClientRegisterModal from "../components/ClientRegisterModal";
import emptyFace from "@/assets/images/common/empty_face.svg";

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
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const onSave = (clientData) => {
    if (editClient) {
      // TODO: 수정 로직 구현
    } else {
      // TODO: 등록 로직 구현
    }
    setRegisterOpen(false);
  };

  // TODO: 실제 데이터 fetch 및 렌더링 구현
  return (
    <>
      <ClientList
        clients={clients}
        onSelect={client => {
          navigate(`/clients/session?clientId=${client.id}`);
        }}
      />
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
        <ClientProfile 
          profileData={client} 
          onEdit={clientData => {
            setEditClient(clientData);
            setRegisterOpen(true);
          }}
          isEmpty={isEmpty}
        />
        <div className={isEmpty ? "con-wrap empty" : "con-wrap"}>
          <img src={emptyFace} alt="empty"/>
          <p className="empty-info">예정, 완료한 상담이 없습니다.<br/>내담자와의 예약 일정을 확인해 보세요.</p>
          <button className="type05 h44" type="button">스케줄 관리</button>
        </div>


        <button
          className="type07"
          style={{ marginTop: "2rem" }}
          onClick={() => navigate("/clients/consults?clientId=" + clientId)}
        >
          상담관리 보기
        </button>
      </div>
      <ClientRegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSave={onSave}
        mode={editClient ? "edit" : "register"}
        initialData={editClient}
      />
    </>
  );
}

export default SessionList;
