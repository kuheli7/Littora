import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Trash2, Shield, BarChart3, ImageIcon, AlertTriangle,
  Loader2, X, CheckCircle, RefreshCw, Users, TrendingUp
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function severityColor(s) {
  if (!s) return "var(--muted)";
  const m = { Low: "#16a34a", Moderate: "#e6a545", High: "#ea580c", Severe: "#dc2626" };
  return m[s] ?? "var(--muted)";
}

export default function AdminDashboard() {
  const { getToken } = useAuth();

  const [analyses, setAnalyses]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [error,    setError]      = useState(null);
  const [deleting, setDeleting]   = useState(null);   // id of item being deleted
  const [confirm,  setConfirm]    = useState(null);   // id pending confirmation
  const [toast,    setToast]      = useState(null);   // { type, message }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAnalyses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const { data } = await axios.get(`${API_BASE}/api/admin/analyses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalyses(data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load analyses.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { loadAnalyses(); }, [loadAnalyses]);

  const handleDeleteConfirm = async () => {
    const id = confirm;
    setConfirm(null);
    setDeleting(id);
    try {
      const token = await getToken();
      await axios.delete(`${API_BASE}/api/admin/analyses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      showToast("success", "Analysis deleted successfully.");
    } catch (err) {
      showToast("error", err.response?.data?.error || "Delete failed.");
    } finally {
      setDeleting(null);
    }
  };

  // Computed stats
  const totalWaste = analyses.reduce((s, a) => s + (a.total_waste || 0), 0);
  const uniqueUsers = new Set(analyses.map((a) => a.user_id).filter(Boolean)).size;
  const avgScore = analyses.length
    ? Math.round(analyses.reduce((s, a) => s + (a.pollution_score || 0), 0) / analyses.length)
    : 0;

  return (
    <div className="page-container">
      {/* ── Header ── */}
      <div className="page-heading">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Shield size={28} style={{ color: "var(--teal)" }} />
          <div>
            <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
            <p style={{ margin: 0 }}>Full access — manage all uploaded analyses</p>
          </div>
        </div>
        <button
          className="admin-refresh-btn"
          onClick={loadAnalyses}
          disabled={loading}
          title="Refresh"
        >
          <RefreshCw size={15} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {/* ── Stats Bar ── */}
      <div className="admin-stats-bar">
        <div className="admin-stat-card">
          <div className="admin-stat-icon"><ImageIcon size={20} /></div>
          <div>
            <div className="admin-stat-val">{analyses.length}</div>
            <div className="admin-stat-lbl">Total Analyses</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon"><TrendingUp size={20} /></div>
          <div>
            <div className="admin-stat-val">{totalWaste.toLocaleString()}</div>
            <div className="admin-stat-lbl">Total Waste Items</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon"><BarChart3 size={20} /></div>
          <div>
            <div className="admin-stat-val">{avgScore}</div>
            <div className="admin-stat-lbl">Avg Pollution Score</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon"><Users size={20} /></div>
          <div>
            <div className="admin-stat-val">{uniqueUsers}</div>
            <div className="admin-stat-lbl">Unique Contributors</div>
          </div>
        </div>
      </div>

      {/* ── Error state ── */}
      {error && (
        <div className="admin-error-banner">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* ── Loading state ── */}
      {loading && !error && (
        <div className="admin-loading">
          <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "var(--teal)" }} />
          <p>Loading all analyses…</p>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && analyses.length === 0 && (
        <div className="admin-empty">
          <ImageIcon size={48} strokeWidth={1.2} />
          <p>No analyses have been uploaded yet.</p>
        </div>
      )}

      {/* ── Image Grid ── */}
      {!loading && analyses.length > 0 && (
        <>
          <p className="section-title" style={{ marginBottom: "1rem" }}>
            {analyses.length} total {analyses.length === 1 ? "record" : "records"}
          </p>
          <div className="admin-grid">
            {analyses.map((item) => (
              <div key={item.id} className="admin-card">
                {/* Image */}
                <div className="admin-card-img-wrap">
                  <img
                    src={item.image_url}
                    alt={`Analysis ${item.id}`}
                    className="admin-card-img"
                    loading="lazy"
                  />
                  {/* Severity badge */}
                  <span
                    className="admin-severity-badge"
                    style={{ background: severityColor(item.severity) }}
                  >
                    {item.severity ?? "—"}
                  </span>
                  {/* Delete overlay button */}
                  <button
                    className="admin-delete-overlay-btn"
                    onClick={() => setConfirm(item.id)}
                    disabled={deleting === item.id}
                    title="Delete this analysis"
                    aria-label="Delete analysis"
                  >
                    {deleting === item.id
                      ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                      : <Trash2 size={16} />
                    }
                  </button>
                </div>

                {/* Card body */}
                <div className="admin-card-body">
                  <div className="admin-card-meta">
                    <span className="admin-card-waste">
                      🗑️ {item.total_waste ?? 0} items
                    </span>
                    <span className="admin-card-score">
                      Score: <strong>{item.pollution_score ?? 0}</strong>
                    </span>
                  </div>
                  {item.location_label && (
                    <div className="admin-card-location">📍 {item.location_label}</div>
                  )}
                  <div className="admin-card-date">
                    {new Date(item.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                  {item.user_id && (
                    <div className="admin-card-user" title={item.user_id}>
                      👤 {item.user_id.slice(0, 8)}…
                    </div>
                  )}
                  {!item.user_id && (
                    <div className="admin-card-user anon">👤 Anonymous</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Confirmation Modal ── */}
      {confirm && (
        <div className="admin-modal-backdrop" onClick={() => setConfirm(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-icon">
              <AlertTriangle size={32} style={{ color: "#dc2626" }} />
            </div>
            <h2 className="admin-modal-title">Delete this analysis?</h2>
            <p className="admin-modal-body">
              This will permanently remove the image, detection data, and all
              associated records. This action <strong>cannot be undone</strong>.
            </p>
            <div className="admin-modal-actions">
              <button
                className="admin-modal-cancel"
                onClick={() => setConfirm(null)}
              >
                <X size={15} /> Cancel
              </button>
              <button
                id="admin-confirm-delete-btn"
                className="admin-modal-delete"
                onClick={handleDeleteConfirm}
              >
                <Trash2 size={15} /> Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toast && (
        <div className={`admin-toast admin-toast-${toast.type}`}>
          {toast.type === "success"
            ? <CheckCircle size={16} />
            : <AlertTriangle size={16} />
          }
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
