import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import ProtectedRedirect from "./ProtectedRedirect.jsx";

import Home from "./page/home/home.jsx";
import Schedule from "./page/schedule/schedule.jsx";
import Clients from "./page/clients/clients.jsx";
import Consults from "./page/clients/consults/Consults.jsx";
import Recordings from './page/clients/consults/recordings/Recordings';
import Sessions from "./page/clients/sessions/Sessions.jsx";
import Document from "./page/document/document.jsx";
import MyPage from "./page/mypage/mypage.jsx";
import Support from "./page/support/support.jsx";
import Login from "./page/login/login.jsx";
import SignUp from "./page/login/signUp.jsx";
import CounselLogDetail from "./page/clients/consults/counselLog/counsellogdetail/CounselLogDetail.jsx";
import PsychologicalTestDetail from "./page/clients/consults/psychologicalTest/components/PsychologicalTestDetail.jsx";
import SessionAssessmentsDetail from "./page/clients/consults/document/SessionAssessmentsDetail.jsx";
import ClientSurvey from "./page/client-survey/ClientSurvey.jsx";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signUp",
    element: <SignUp />,
  },
  // 내담자 심리검사지 
  {
    path: "/client-survey",
    element: <ClientSurvey />,
  },
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <ProtectedRedirect />,
        children: [
          { index: true, element: null }, // 루트 경로는 ProtectedRedirect에서 /clients로 리다이렉트
          // { path: "home", element: <Home /> },
          // { path: "schedule", element: <Schedule /> },
          // 내담자 관리
          { path: "clients", element: <Clients /> },
          // 상담 관리
          { path: "clients/consults", element: <Consults /> },
          // 심리검사지 상세 
          { path: "clients/consults/psychologicalTestDetail", element: <PsychologicalTestDetail /> },
          // 세션 통합 검사 결과 (문서함 결과보기에서 진입)
          { path: "clients/consults/sessionAssessments", element: <SessionAssessmentsDetail /> },
          // 상담 녹취록
          { path: "clients/recordings", element: <Recordings /> },
          // 상담일지 상세
          { path: "clients/consults/detail", element: <CounselLogDetail /> },
          // 회기 목록
          { path: "clients/sessions", element: <Sessions/> },
          // 문서 관리
          // { path: "document", element: <Document /> },
          // 마이페이지
          { path: "mypage", element: <MyPage /> },
          // 고객지원
          // { path: "support", element: <Support /> },
        ],
      },
    ],

  },
]);

export default router;
