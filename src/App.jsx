import { RouterProvider } from "react-router-dom";
import router from "./routes";
import { RecoilRoot } from "recoil";
import "@/styles/reset.css";
import "@/styles/font.css";
import "./App.scss";

function App() {
  return (
    <RecoilRoot>
      <div className="App">
        <RouterProvider router={router} />
      </div>
    </RecoilRoot>
  );
}

export default App;
