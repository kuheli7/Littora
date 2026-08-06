import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ScanLine, TrendingUp, MapPin, BarChart3,
  Clock, FileText, Recycle, Database, Settings, LogOut, Shield, LogIn
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import logo from "../assets/logo.png";
import navbarEarth from "../assets/navbar_image_earth.jpg";
import navbarDark from "../assets/navbar_image_dark.jpg";

const NAV_ITEMS = [
  { to: "/",          label: "Dashboard",             icon: LayoutDashboard, end: true },
  { to: "/detect",    label: "Detect Waste",           icon: ScanLine,        end: false },
  { to: "/trends",    label: "Historical Trends",      icon: TrendingUp,      end: false },
  { to: "/map",       label: "Beach Map",              icon: MapPin,          end: false },
  { to: "/analytics", label: "Analytics",              icon: BarChart3,       end: false },
  { to: "/history",   label: "Detection History",      icon: Clock,           end: false },
  { to: "/reports",   label: "Reports",                icon: FileText,        end: false },
  { to: "/cleanup",   label: "Cleanup Recommendations",icon: Recycle,         end: false },
  { to: "/dataset",   label: "Dataset Explorer",       icon: Database,        end: false },
  { to: "/settings",  label: "Settings",               icon: Settings,        end: false },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const navbarImage = theme === "dark" ? navbarDark : navbarEarth;

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  const handleSignIn = () => {
    onClose();
    navigate("/login");
  };

  // Derive a display name: first part of email or "User"
  const displayName = user ? (user.email?.split("@")[0] ?? "User") : "Guest Visitor";
  const initial     = user ? (displayName[0]?.toUpperCase() ?? "U") : "G";

  return (
    <>
      {isOpen && (
        <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`sidebar${isOpen ? " open" : ""}`} aria-label="Primary navigation">
        {/* Logo Header */}
        <div className="sidebar-logo">
          <img src={logo} alt="Littora Logo" className="sidebar-logo-img" />
          <div>
            <div className="sidebar-wordmark">LITTORA</div>
            <div className="sidebar-tagline">AI Beach Waste Detection</div>
          </div>
        </div>

        {/* User info strip */}
        <div className="sidebar-user-strip">
          <div className="sidebar-user-avatar">{initial}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{displayName}</div>
            <div className="sidebar-user-email">{user ? user.email : "Sign in for full access"}</div>
          </div>
          {user && isAdmin && (
            <span className="sidebar-admin-badge" title="Admin">
              <Shield size={11} />
            </span>
          )}
        </div>

        {/* Navigation List */}
        <nav className="sidebar-nav" aria-label="Sections">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
              onClick={onClose}
            >
              <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Navbar Image Illustration */}
        <div className="sidebar-navbar-image-container">
          <img src={navbarImage} alt="Coastal Illustration" className="sidebar-navbar-img" />
        </div>

        {/* Auth / Logout Button */}
        {user ? (
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={16} strokeWidth={1.8} />
            <span>Logout</span>
          </button>
        ) : (
          <button className="sidebar-logout" onClick={handleSignIn} style={{ color: "var(--teal)" }}>
            <LogIn size={16} strokeWidth={1.8} />
            <span>Sign In</span>
          </button>
        )}
      </aside>
    </>
  );
}
