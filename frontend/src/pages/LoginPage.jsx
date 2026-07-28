import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogIn, Eye, EyeOff, Waves, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import logo from "../assets/logo.png";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const from = location.state?.from?.pathname || "/";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* Animated coastal background */}
      <div className="login-bg">
        <div className="login-bg-gradient" />
        <div className="login-bg-waves">
          <Waves size={600} className="login-bg-wave-icon" />
        </div>
      </div>

      {/* Card */}
      <div className="login-card-wrap">
        <div className="login-card">
          {/* Brand */}
          <div className="login-brand">
            <img src={logo} alt="Littora" className="login-logo" />
            <div>
              <div className="login-brand-name">LITTORA</div>
              <div className="login-brand-sub">AI Beach Waste Detection</div>
            </div>
          </div>

          <h1 className="login-heading">Welcome back</h1>
          <p className="login-subheading">
            Sign in to access your personal beach monitoring dashboard.
          </p>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {/* Error banner */}
            {error && (
              <div className="login-error-banner">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="login-field">
              <label htmlFor="login-email" className="login-label">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="login-password" className="login-label">
                Password
              </label>
              <div className="login-input-wrap">
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input login-input-pw"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="login-pw-toggle"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit-btn"
              className="login-submit-btn"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <span className="login-spinner" aria-hidden="true" />
              ) : (
                <LogIn size={17} />
              )}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="login-footer-note">
            Don&apos;t have an account?{" "}
            <span className="login-footer-link">Contact your administrator.</span>
          </p>
        </div>

        {/* Decorative side panel */}
        <div className="login-panel-side">
          <div className="login-panel-inner">
            <h2 className="login-panel-title">
              Protecting our<br />
              <span className="login-panel-accent">coastlines</span><br />
              with AI.
            </h2>
            <p className="login-panel-desc">
              Upload beach photos, detect waste, track pollution trends — all in one place.
            </p>
            <div className="login-panel-stats">
              <div className="login-stat-item">
                <span className="login-stat-num">4+</span>
                <span className="login-stat-lbl">Waste categories detected</span>
              </div>
              <div className="login-stat-item">
                <span className="login-stat-num">AI</span>
                <span className="login-stat-lbl">Powered inference engine</span>
              </div>
              <div className="login-stat-item">
                <span className="login-stat-num">∞</span>
                <span className="login-stat-lbl">Beaches monitored</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
