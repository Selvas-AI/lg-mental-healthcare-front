import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ClientProfile from "../components/ClientProfile";
import ClientList from "./ClientList";
import { useRecoilValue, useSetRecoilState, useRecoilState } from "recoil";
import { maskingState, clientsState, foldState, supportPanelState } from "@/recoil";
import "./sessions.scss";

import ClientRegisterModal from "../components/ClientRegisterModal";
import emptyFace from "@/assets/images/common/empty_face.svg";
import TimelinePanel from "./TimelinePanel";
import SessionTable from "./SessionTable";
import RecordSelectModal from "./RecordSelectModal";
//! 회기 더미 데이터
import sessionDummyData from "./sessionDummyData";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Sessions() {
  const [masked, setMasked] = useRecoilState(maskingState);
  const query = useQuery();
  const clientId = query.get("clientId");
  const navigate = useNavigate();
  const clients = useRecoilValue(clientsState);
  const client = clients.find(c => String(c.clientSeq) === String(clientId));
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [recordSelectOpen, setRecordSelectOpen] = useState(false);
  const fold = useRecoilValue(foldState);
  const setSupportPanel = useSetRecoilState(supportPanelState);

  const onSave = (clientData) => {
    if (editClient) {
      // TODO: 수정 로직 구현
    } else {
      // TODO: 등록 로직 구현
    }
    setRegisterOpen(false);
  };

  const handleSelectClient = (client) => {
    navigate(`/clients/sessions?clientId=${client.clientSeq}`, { replace: true });
  };

  const handleRecordSelect = (recordData) => {
    // TODO: 선택된 녹음파일로 회기 등록 처리
    console.log('선택된 녹음파일:', recordData);
    setRecordSelectOpen(false);
  };

  // TODO: 실제 데이터 fetch 및 렌더링 구현
  return (
    <>
      <ClientList
        clients={clients}
        onSelect={handleSelectClient}
        fold={fold}
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
        />
        {isEmpty ? null : (
          <div className="btn-wrap">
            <div className="left">
              <button 
                className="type11 h40 white" 
                type="button"
                onClick={() => setRecordSelectOpen(true)}
              >
                회기 등록
              </button>
              <button className="type05 white" type="button">종결</button>
            </div>
            <button className="type05" type="button" onClick={() => {
              setTimelineOpen(true);
              setSupportPanel(true);
              }}>타임라인 보기</button>
          </div>
        )}
        <div className={isEmpty ? "con-wrap empty" : "con-wrap"}>
          {isEmpty ? (
            <>
              <img src={emptyFace} alt="empty"/>
              <p className="empty-info">예정, 완료한 상담이 없습니다.<br/>내담자와의 예약 일정을 확인해 보세요.</p>
              <button className="type05 h44" type="button">스케줄 관리</button>
            </>
          ) : (
            <SessionTable 
              clientId={clientId}
              sessionDummyData={sessionDummyData}
            />
          )}
        </div>
      </div>
      <ClientRegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSave={onSave}
        mode={editClient ? "edit" : "register"}
        initialData={editClient}
      />
      <TimelinePanel
        open={timelineOpen}
        onClose={() => {
          setTimelineOpen(false);
          setSupportPanel(false);
        }}
        isEmpty={isEmpty}
        sessionDummyData={sessionDummyData}
      />
      <RecordSelectModal
        open={recordSelectOpen}
        onClose={() => setRecordSelectOpen(false)}
        onSave={handleRecordSelect}
      />
    </>
  );
}

export default Sessions;
