import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";

import Home from "./page/home/home.jsx";
import Schedule from "./page/schedule/schedule.jsx";
import Clients from "./page/clients/clients.jsx";
import Document from "./page/document/document.jsx";
import MyPage from "./page/mypage/mypage.jsx";
import Support from "./page/support/support.jsx";
import Consults from "./page/consults/Consults.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "", element: <Home /> },
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
