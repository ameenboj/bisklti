import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import MyAccountPage from "./MyAccountPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MyAccountPage />
  </StrictMode>,
);
