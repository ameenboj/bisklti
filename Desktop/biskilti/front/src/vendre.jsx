import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import ActionPage from "./ActionPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ActionPage type="vendre" />
  </StrictMode>,
);
