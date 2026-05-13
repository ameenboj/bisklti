import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import LocationHowPage from "./LocationHowPage.jsx";
import SiteChatbot from "./SiteChatbot.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LocationHowPage />
    <SiteChatbot />
  </StrictMode>,
);
