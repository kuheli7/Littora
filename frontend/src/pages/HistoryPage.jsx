import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, ImageOff } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import PhotoGallery from "../components/PhotoGallery.jsx";
import HistoryTable from "../components/HistoryTable.jsx";

const API_BASE   = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const SEVERITIES = ["All", "Low", "Moderate", "High", "Severe"];

export default function HistoryPage() {
  const { getToken } = useAuth();

  const [history,     setHistory]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [filter,      setFilter]      = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const loadMyAnalyses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const { data } = await axios.get(`${API_BASE}/api/my-analyses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(data);
    } catch (err) {
      setError(err.response?.data?.error || "Could not load your history.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { loadMyAnalyses(); }, [loadMyAnalyses]);

  // Robust case-insensitive filter state shared by both gallery and table
  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return history.filter((r) => {
      const itemSeverity = (r.severity || "").toString().trim().toLowerCase();
      const matchesSeverity =
        filter === "All" || itemSeverity === filter.toLowerCase();
      const matchesSearch =
        !query ||
        (r.location_label && r.location_label.toLowerCase().includes(query)) ||
        (r.severity && r.severity.toLowerCase().includes(query));
      return matchesSeverity && matchesSearch;
    });
  }, [history, filter, searchQuery]);

  const countLabel =
    filter === "All" && !searchQuery.trim()
      ? `${filtered.length} of your analyses`
      : `${filtered.length} matching analyses`;

  return (
    <div className="page-container">
      <div className="page-heading">
        <h1>My History</h1>
        <p>Browse the photos <strong>you</strong> have uploaded and analyzed.</p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="result-placeholder">
          <div className="login-spinner" style={{ margin: "0 auto" }} />
          <p>Loading your analyses…</p>
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
          <p>You haven&apos;t uploaded any photos yet.</p>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
            Head to <strong>Detect Waste</strong> to upload your first beach photo.
          </p>
        </div>
      )}

      {/* Filters + content */}
      {!loading && !error && history.length > 0 && (
        <>
          {/* Shared filter & search controls */}
          <div className="history-controls">
            <p className="section-title" style={{ margin: 0 }}>
              {countLabel}
            </p>
            <div className="history-filters-wrap">
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  aria-label="Search location or severity"
                  className="search-input"
                  placeholder="Search location or severity..."
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
            <PhotoGallery items={filtered} />
          </section>

          {/* Detailed records table */}
          <section>
            <p className="section-title">Detailed Records</p>
            <HistoryTable history={filtered} />
          </section>
        </>
      )}
    </div>
  );
}
