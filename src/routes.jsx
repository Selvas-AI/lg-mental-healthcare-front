import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";

import Home from "./page/home/home.jsx";
import Schedule from "./page/schedule/schedule.jsx";
import Clients from "./page/clients/clients.jsx";
import Document from "./page/document/document.jsx";
import MyPage from "./page/mypage/mypage.jsx";
import Support from "./page/support/support.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "", element: <Home /> },
      { path: "schedule", element: <Schedule /> },
      { path: "clients", element: <Clients /> },
      { path: "document", element: <Document /> },
      { path: "mypage", element: <MyPage /> },
      { path: "support", element: <Support /> },
    ],
  },
]);

export default router;
