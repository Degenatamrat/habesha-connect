import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark";

import App from "./App.tsx";
import { ErrorFallback } from "./ErrorFallback.tsx";
import "./main.css";
import "./styles/theme.css";
import "./index.css";

import { getDbTest } from "./api";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ErrorBoundary>
);

getDbTest();
