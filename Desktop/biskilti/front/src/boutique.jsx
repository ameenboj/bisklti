import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import BoutiquePage from "./BoutiquePage.jsx";
import SiteChatbot from "./SiteChatbot.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BoutiquePage />
    <SiteChatbot />
  </StrictMode>,
);
