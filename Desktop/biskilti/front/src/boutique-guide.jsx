import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import BoutiqueGuidePage from "./BoutiqueGuidePage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BoutiqueGuidePage />
  </StrictMode>,
);
