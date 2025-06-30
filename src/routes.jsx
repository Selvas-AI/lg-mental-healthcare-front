import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";

import Home from "./page/home/home.jsx";
import Schedule from "./page/schedule/schedule.jsx";
import Clients from "./page/clients/clients.jsx";
import Consults from "./page/clients/consults/Consults.jsx";
import Document from "./page/document/document.jsx";
import MyPage from "./page/mypage/mypage.jsx";
import Support from "./page/support/support.jsx";
import Login from "./page/login/login.jsx";
import SignUp from "./page/login/signUp.jsx";
import ProtectedRedirect from "./ProtectedRedirect.jsx";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signUp",
    element: <SignUp />,
  },
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <ProtectedRedirect /> },
      { path: "home", element: <Home /> },
      { path: "schedule", element: <Schedule /> },
      // 내담자 관리
      { path: "clients", element: <Clients /> },
      { path: "clients/consults", element: <Consults /> },
      // 문서 관리
      { path: "document", element: <Document /> },
      // 마이페이지
      { path: "mypage", element: <MyPage /> },
      // 고객지원
      { path: "support", element: <Support /> },
    ],
  },
]);

export default router;
