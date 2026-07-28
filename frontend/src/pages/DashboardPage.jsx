import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, ScanLine, TrendingUp, Leaf, LogIn } from "lucide-react";
import { useStats } from "../context/StatsContext.jsx";
import { useAuth }  from "../context/AuthContext.jsx";
import StatCards          from "../components/StatCards.jsx";
import TrendChart         from "../components/TrendChart.jsx";
import WasteBreakdownChart from "../components/WasteBreakdownChart.jsx";
import dashboardBg        from "../assets/dashboard_bg.png";

export default function DashboardPage() {
  const { stats }   = useStats();
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const scrollToStats = () => {
    const el = document.getElementById("analytics-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Display initial letter of the logged-in user's email
  const userInitial = user?.email?.[0]?.toUpperCase() ?? null;

  return (
    <div className="dashboard-light-container">
      {/* ── Hero Banner (Reference Image 1 Aesthetic) ── */}
      <div
        className="dashboard-hero-light"
        style={{ backgroundImage: `url(${dashboardBg})` }}
      >
        <div className="hero-light-overlay">
          {/* Top-right overlay action */}
          <div className="hero-top-actions">
            {user ? (
              /* Logged-in: show user avatar */
              <div className="hero-user-avatar" title={user.email}>
                {userInitial}
              </div>
            ) : (
              /* Not logged in: Login button */
              <button
                className="btn-login-overlay"
                onClick={() => navigate("/login")}
                id="hero-login-btn"
              >
                <LogIn size={15} />
                <span>Login</span>
              </button>
            )}
          </div>
          <div className="hero-light-main">
            <h1 className="hero-title-light">
              AI-Powered<br />
              <span className="hero-title-accent">Beach Waste</span><br />
              Detection
            </h1>

            <p className="hero-subtitle-light">
              Detect, classify and analyze beach waste for a cleaner tomorrow.
            </p>

            <div className="hero-cta-row">
              <Link to="/detect" className="btn-hero-primary-pill">
                Start Detection <ArrowRight size={18} />
              </Link>
              <button onClick={scrollToStats} className="btn-hero-outline-pill">
                <BarChart3 size={17} /> View Dashboard
              </button>
            </div>

            {/* Bottom 3 feature circle cards */}
            <div className="hero-features-circle-trio">
              <div className="feature-circle-item">
                <div className="feature-circle-icon">
                  <ScanLine size={20} />
                </div>
                <div className="feature-circle-text">
                  <h3>Smart Detection</h3>
                  <p>AI model detects and classifies waste in beach images</p>
                </div>
              </div>

              <div className="feature-circle-item">
                <div className="feature-circle-icon">
                  <TrendingUp size={20} />
                </div>
                <div className="feature-circle-text">
                  <h3>Real-time Analysis</h3>
                  <p>Get instant results and insights on waste types and counts</p>
                </div>
              </div>

              <div className="feature-circle-item">
                <div className="feature-circle-icon">
                  <Leaf size={20} />
                </div>
                <div className="feature-circle-text">
                  <h3>Data for Impact</h3>
                  <p>Track trends and contribute to a cleaner environment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Analytics & Monitoring Section ── */}
      <div id="analytics-section" className="dashboard-light-body">
        <div className="section-header-badge">
          <h2>Live Monitoring &amp; Analytics</h2>
        </div>

        <StatCards
          totalAnalyses={stats.totalAnalyses}
          totalWasteAllTime={stats.totalWasteAllTime}
          avgScore={stats.avgScore}
          severityCounts={stats.severityCounts}
        />

        <div className="charts-row">
          <TrendChart history={stats.history} />
          <WasteBreakdownChart aggregateDetections={stats.aggregateDetections} />
        </div>
      </div>
    </div>
  );
}
