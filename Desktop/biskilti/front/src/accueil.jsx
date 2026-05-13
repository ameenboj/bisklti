import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AccueilPage from "./AccueilPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AccueilPage />
  </StrictMode>,
);
