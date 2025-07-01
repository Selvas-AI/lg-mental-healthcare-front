

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ClientsTable from "./components/ClientsTable";
import "./clients.scss";
import EmptyClients from "./components/EmptyClients";

function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([
    {
      name: "가길동(알렉스)",
      phone: "010-1234-5678",
      session: "1회기",
      todos: ["심리검사 요청", "녹취록 분석", "상담일지 작성", "사례개념화 최초 작성"],
    },
    {
      name: "나길동(니니동)",
      phone: "010-1234-5678",
      session: "2회기",
      todos: ["녹취록 분석", "상담일지 작성", "사례개념화 최초 작성"],
    },
    {
      name: "김마음(카이막)",
      phone: "010-1234-5678",
      session: "4회기",
      todos: ["상담일지 작성", "사례개념화 최초 작성"],
    },
    {
      name: "라길동(라떼길)",
      phone: "010-1234-5678",
      session: "6회기",
      todos: ["사례개념화 최초 작성"],
    },
    {
      name: "마길동(고양이)",
      phone: "010-1234-5678",
      session: "99회기",
      todos: ["상담일지 작성"],
    },
    {
      name: "사길동",
      phone: "010-1234-5678",
      session: "신규",
      todos: [],
      isNew: true,
    },
    {
      name: "바길동(강아지)",
      phone: "010-1234-5678",
      session: "99회기",
      todos: ["상담일지 작성"],
    },
  ]);

  const handleRegister = () => {
    // TODO: 내담자 등록 로직
  };

  return (
    <div className="inner">
      <div className="move-up">
        <strong className="page-title">내담자 관리</strong>
        <div className="switch-wrap">
          <label>
            <span>개인정보 보호</span>
            <input role="switch" name="switch" type="checkbox" defaultChecked />
          </label>
        </div>
      </div>
      <div className="tb-info">
        <p className="total">전체 <span className="total-num">{clients.length}</span></p>
        <button className="type11 h40" type="button" onClick={handleRegister}>
          내담자 등록
        </button>
      </div>
      {clients.length === 0 ? (
        <EmptyClients onRegister={handleRegister} />
      ) : (
        <ClientsTable clients={clients} />
      )}
      <div className="pagination" role="navigation">
        <div className="pagination-inner">
          <div className="page-links">
            <a className="on" title="1 페이지">1</a>
          </div>
        </div>
      </div>
      <button
        className="type07"
        style={{ marginTop: "2rem" }}
        onClick={() => navigate("/clients/consults")}
      >
        상담관리 보기
      </button>
    </div>
  );
}

export default Clients;