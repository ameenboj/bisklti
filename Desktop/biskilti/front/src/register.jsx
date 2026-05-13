import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AuthPage from "./AuthPage.jsx";
import SiteChatbot from "./SiteChatbot.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthPage mode="register" />
    <SiteChatbot />
  </StrictMode>,
);
