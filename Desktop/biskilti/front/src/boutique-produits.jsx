import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import BoutiqueProductsPage from "./BoutiqueProductsPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BoutiqueProductsPage />
  </StrictMode>,
);
