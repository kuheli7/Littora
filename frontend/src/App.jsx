import { useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar        from "./components/Sidebar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LoginPage      from "./pages/LoginPage.jsx";
import SetPasswordPage from "./pages/SetPasswordPage.jsx";

const DashboardPage    = lazy(() => import("./pages/DashboardPage.jsx"));
const UploadPage       = lazy(() => import("./pages/UploadPage.jsx"));
const MapPage          = lazy(() => import("./pages/MapPage.jsx"));
const HistoryPage      = lazy(() => import("./pages/HistoryPage.jsx"));
const TrendsPage       = lazy(() => import("./pages/TrendsPage.jsx"));
const AnalyticsPage    = lazy(() => import("./pages/AnalyticsPage.jsx"));
const ReportsPage      = lazy(() => import("./pages/ReportsPage.jsx"));
const CleanupPage      = lazy(() => import("./pages/CleanupPage.jsx"));
const DatasetPage      = lazy(() => import("./pages/DatasetPage.jsx"));
const SettingsPage     = lazy(() => import("./pages/SettingsPage.jsx"));

function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '300px', color: 'var(--muted)', fontSize: '0.88rem'
    }}>
      Loading...
    </div>
  );
}

import FloatingAccountMenu from "./components/FloatingAccountMenu.jsx";

// Layout wrapper: sidebar + content (used for all protected pages)
function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem("littora_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("littora_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className={`app-shell${isCollapsed ? " collapsed" : ""}`}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />
      <div className="content-area" style={{ position: "relative" }}>
        {/* Floating Account Icon in Top Right */}
        <div style={{
          position: "fixed",
          top: "1.25rem",
          right: "1.5rem",
          zIndex: 1000
        }}>
          <FloatingAccountMenu />
        </div>

        <main className="main-content">
          <Suspense fallback={<PageLoader />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"        element={<LoginPage />} />
      <Route path="/set-password" element={<SetPasswordPage />} />

      {/* Protected routes — require authentication */}
      <Route
        path="/*"
        element={
          <ProtectedRoute allowGuest={true}>
            <AppShell>
              <Routes>
                <Route path="/"          element={<DashboardPage />} />
                <Route path="/detect"    element={<UploadPage />} />
                <Route path="/trends"    element={<TrendsPage />} />
                <Route path="/map"       element={<MapPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/history"   element={<HistoryPage />} />
                <Route path="/reports"   element={<ReportsPage />} />
                <Route path="/cleanup"   element={<CleanupPage />} />
                <Route path="/dataset"   element={<DatasetPage />} />
                <Route path="/settings"  element={<SettingsPage />} />

                {/* Legacy redirect */}
                <Route path="/upload" element={<Navigate to="/detect" replace />} />
                <Route path="*"       element={<Navigate to="/" replace />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
