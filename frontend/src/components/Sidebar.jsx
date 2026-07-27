import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, ScanLine, TrendingUp, MapPin, BarChart3,
  Clock, FileText, Recycle, Database, Settings, LogOut
} from "lucide-react";
import logo from "../assets/logo.png";
import navbarImage from "../assets/navbar_image.png";

const NAV_ITEMS = [
  { to: "/",         label: "Dashboard",                icon: LayoutDashboard, end: true },
  { to: "/detect",   label: "Detect Waste",             icon: ScanLine,        end: false },
  { to: "/trends",   label: "Historical Trends",        icon: TrendingUp,      end: false },
  { to: "/map",      label: "Beach Map",                icon: MapPin,          end: false },
  { to: "/analytics",label: "Analytics",               icon: BarChart3,       end: false },
  { to: "/history",  label: "Detection History",       icon: Clock,           end: false },
  { to: "/reports",  label: "Reports",                  icon: FileText,        end: false },
  { to: "/cleanup",  label: "Cleanup Recommendations", icon: Recycle,         end: false },
  { to: "/dataset",  label: "Dataset Explorer",         icon: Database,        end: false },
  { to: "/settings", label: "Settings",                 icon: Settings,        end: false },
];

export default function Sidebar({ isOpen, onClose }) {
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

        {/* Logout Button */}
        <button className="sidebar-logout">
          <LogOut size={16} strokeWidth={1.8} />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}



