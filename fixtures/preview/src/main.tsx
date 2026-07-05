import * as React from "react";
import { createRoot } from "react-dom/client";

import { PreviewApp } from "./preview-app";
import "./preview.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Missing #root element for astro-ui-m8 preview fixture");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <PreviewApp />
  </React.StrictMode>,
);
