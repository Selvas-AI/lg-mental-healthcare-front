import { RouterProvider } from "react-router-dom";
import router from "./routes";
import "@/styles/reset.css";
import "@/styles/font.css";
import "./App.scss";

function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
;
