import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import BoutiqueProductsPage from "./BoutiqueProductsPage.jsx";
import SiteChatbot from "./SiteChatbot.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BoutiqueProductsPage />
    <SiteChatbot />
  </StrictMode>,
);
