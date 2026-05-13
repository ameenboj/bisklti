import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import BoutiqueGuidePage from "./BoutiqueGuidePage.jsx";
import SiteChatbot from "./SiteChatbot.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BoutiqueGuidePage />
    <SiteChatbot />
  </StrictMode>,
);
