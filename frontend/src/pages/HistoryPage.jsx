import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, ImageOff, Shield, AlertTriangle, Trash2, X, CheckCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import PhotoGallery from "../components/PhotoGallery.jsx";
import HistoryTable from "../components/HistoryTable.jsx";

const API_BASE   = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const SEVERITIES = ["All", "Low", "Moderate", "High", "Severe"];

export default function HistoryPage() {
  const { getToken, isAdmin } = useAuth();

  const [history,     setHistory]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [filter,      setFilter]      = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Delete state
  const [confirm,  setConfirm]  = useState(null); // analysis id awaiting confirmation
  const [deleting, setDeleting] = useState(null); // id currently being deleted
  const [toast,    setToast]    = useState(null);  // { type, message }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAnalyses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const endpoint = isAdmin
        ? `${API_BASE}/api/admin/analyses`
        : `${API_BASE}/api/my-analyses`;
      const { data } = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(data);
    } catch (err) {
      setError(err.response?.data?.error || "Could not load history.");
    } finally {
      setLoading(false);
    }
  }, [getToken, isAdmin]);

  useEffect(() => { loadAnalyses(); }, [loadAnalyses]);

  const handleDeleteConfirm = async () => {
    const id = confirm;
    setConfirm(null);
    setDeleting(id);
    try {
      const token = await getToken();
      // Admin uses the admin delete endpoint; users use their own
      const endpoint = isAdmin
        ? `${API_BASE}/api/admin/analyses/${id}`
        : `${API_BASE}/api/my-analyses/${id}`;
      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory((prev) => prev.filter((a) => a.id !== id));
      showToast("success", "Analysis deleted successfully.");
    } catch (err) {
      showToast("error", err.response?.data?.error || "Delete failed.");
    } finally {
      setDeleting(null);
    }
  };

  // Robust case-insensitive filter
  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return history.filter((r) => {
      const itemSeverity = (r.severity || "").toString().trim().toLowerCase();
      const matchesSeverity =
        filter === "All" || itemSeverity === filter.toLowerCase();
      const matchesSearch =
        !query ||
        (r.location_label && r.location_label.toLowerCase().includes(query)) ||
        (r.severity && r.severity.toLowerCase().includes(query)) ||
        (isAdmin && r.user_email && r.user_email.toLowerCase().includes(query)) ||
        (isAdmin && r.user_id && r.user_id.toLowerCase().includes(query));
      return matchesSeverity && matchesSearch;
    });
  }, [history, filter, searchQuery, isAdmin]);

  const countLabel = isAdmin
    ? filter === "All" && !searchQuery.trim()
      ? `${filtered.length} total analyses (all users)`
      : `${filtered.length} matching analyses`
    : filter === "All" && !searchQuery.trim()
      ? `${filtered.length} of your analyses`
      : `${filtered.length} matching analyses`;

  return (
    <div className="page-container">
      <div className="page-heading">
        {isAdmin ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Shield size={22} style={{ color: "var(--teal)" }} />
              <h1 style={{ margin: 0 }}>All Users&apos; History</h1>
            </div>
            <p>Admin view — browsing uploads from <strong>all users</strong>.</p>
          </>
        ) : (
          <>
            <h1>My History</h1>
            <p>Browse the photos <strong>you</strong> have uploaded and analyzed.</p>
          </>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="result-placeholder">
          <div className="login-spinner" style={{ margin: "0 auto" }} />
          <p>{isAdmin ? "Loading all analyses…" : "Loading your analyses…"}</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="admin-error-banner" style={{ marginBottom: "1.5rem" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && history.length === 0 && (
        <div className="result-placeholder" style={{ marginTop: "3rem" }}>
          <ImageOff size={48} strokeWidth={1.2} />
          {isAdmin ? (
            <p>No analyses have been uploaded by any user yet.</p>
          ) : (
            <>
              <p>You haven&apos;t uploaded any photos yet.</p>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                Head to <strong>Detect Waste</strong> to upload your first beach photo.
              </p>
            </>
          )}
        </div>
      )}

      {/* Filters + content */}
      {!loading && !error && history.length > 0 && (
        <>
          <div className="history-controls">
            <p className="section-title" style={{ margin: 0 }}>
              {countLabel}
            </p>
            <div className="history-filters-wrap">
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  aria-label="Search"
                  className="search-input"
                  placeholder={isAdmin ? "Search location, severity, or email…" : "Search location or severity…"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="filter-bar">
                {SEVERITIES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`filter-pill${filter === s ? " active" : ""}`}
                    onClick={() => setFilter(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Photo gallery */}
          <section style={{ marginBottom: "0.5rem" }}>
            <p className="section-title">Photo Gallery</p>
            <PhotoGallery
              items={filtered}
              showUser={isAdmin}
              deletingId={deleting}
              onDeleteRequest={(id) => setConfirm(id)}
            />
          </section>

          {/* Detailed records table */}
          <section>
            <p className="section-title">Detailed Records</p>
            <HistoryTable
              history={filtered}
              showUser={isAdmin}
              deletingId={deleting}
              onDeleteRequest={(id) => setConfirm(id)}
            />
          </section>
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
              This will permanently remove the image and all associated data.
              This action <strong>cannot be undone</strong>.
            </p>
            <div className="admin-modal-actions">
              <button className="admin-modal-cancel" onClick={() => setConfirm(null)}>
                <X size={15} /> Cancel
              </button>
              <button
                id="history-confirm-delete-btn"
                className="admin-modal-delete"
                onClick={handleDeleteConfirm}
              >
                <Trash2 size={15} /> Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
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
