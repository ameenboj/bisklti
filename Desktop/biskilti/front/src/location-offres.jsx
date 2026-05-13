import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import LocationOffersPage from "./LocationOffersPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LocationOffersPage />
  </StrictMode>,
);
