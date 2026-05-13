import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import CategoryPage from "./CategoryPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CategoryPage type="accessoires" />
  </StrictMode>,
);
