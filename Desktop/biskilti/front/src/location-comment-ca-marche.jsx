import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import LocationHowPage from "./LocationHowPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LocationHowPage />
  </StrictMode>,
);
