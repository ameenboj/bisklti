import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import LocationPage from "./LocationPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LocationPage />
  </StrictMode>,
);
