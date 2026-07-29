import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { StatsProvider } from "./context/StatsContext.jsx";
import { AuthProvider }  from "./context/AuthContext.jsx";
import App from "./App.jsx";
import "./index.css";

/**
 * InviteRedirectHandler — runs at root level.
 * Checks the URL hash for Supabase invite/recovery tokens on every
 * page load and immediately redirects to /set-password before React
 * tries to render the protected shell.
 */
function InviteRedirectHandler({ children }) {
  const hash = window.location.hash;
  if (
    hash.includes("type=invite") ||
    hash.includes("type=recovery")
  ) {
    // Rewrite the URL to /set-password keeping the full hash
    window.history.replaceState(null, "", "/set-password" + hash);
  }
  return children;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <InviteRedirectHandler>
        <AuthProvider>
          <StatsProvider>
            <App />
          </StatsProvider>
        </AuthProvider>
      </InviteRedirectHandler>
    </BrowserRouter>
  </React.StrictMode>
);
