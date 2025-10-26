import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles/tailwind.css";
import "./styles/index.css";

// ⚙️ HTTPS hardening – jamais de ReferenceError
import enforceHttps from "./utils/sslSecurity";

// Feature flag via .env (ne casse pas la preview Rocket)
const FORCE_HTTPS = import.meta.env?.VITE_FORCE_HTTPS === "true";

// Appliquer seulement en prod sur ton domaine
try {
  enforceHttps({
    enabled: FORCE_HTTPS,
    domains: ["trading-mvp.com", "www.trading-mvp.com"],
    excludeHosts: ["localhost", "127.0.0.1", "rockettra3991.builtwithrocket.new"]
  });
} catch (e) {
  console.warn("[ssl] enforceHttps skipped:", e);
}

// 🧠 root mount + garde-fou UI
ReactDOM?.createRoot(document.getElementById("root"))?.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);