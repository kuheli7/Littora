import { useState, useMemo, useEffect } from "react";
import { Download, Eye, Trash2, Loader2, X, User } from "lucide-react";
import ResultPanel from "./ResultPanel.jsx";

const PAGE_SIZE = 10;

function toResultShape(item) {
  if (!item) return { detections: {}, total_waste: 0, pollution_score: 0, severity: "Low" };
  const detections = {};
  if (Array.isArray(item.detections)) {
    for (const d of item.detections) {
      detections[d.waste_type || d.type] = d.count;
    }
  } else if (item.detections && typeof item.detections === "object") {
    Object.assign(detections, item.detections);
  }
  return {
    detections,
    total_waste: item.total_waste || 0,
    pollution_score: item.pollution_score || 0,
    severity: item.severity || "Low",
    boxes: item.boxes || [],
  };
}

/**
 * HistoryTable — sortable + paginated table of analyses.
 * Filter is now managed by the parent (HistoryPage) and applied before
 * passing data in, so this component only handles sort + pagination.
 */
export default function HistoryTable({ history, showUser = false, onDeleteRequest, deletingId, onViewRequest }) {
  const [sortField, setSortField] = useState("date");
  const [sortDir,   setSortDir]   = useState("desc");
  const [page,      setPage]      = useState(0);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    setPage(0);
  }, [history]);

  const sorted = useMemo(() => {
    const mul = sortDir === "asc" ? 1 : -1;
    return [...(history || [])].sort((a, b) => {
      if (sortField === "date")
        return mul * (new Date(a.created_at) - new Date(b.created_at));
      if (sortField === "score")
        return mul * ((a.pollution_score || 0) - (b.pollution_score || 0));
      return 0;
    });
  }, [history, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages - 1);
  const paged      = sorted.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  function toggleSort(field) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
    setPage(0);
  }

  const sortIcon = (field) =>
    sortField !== field ? " ↕" : sortDir === "asc" ? " ↑" : " ↓";

  if (!history || history.length === 0) {
    return (
      <div className="history">
        <div className="history-header">
          <p className="section-title" style={{ margin: 0 }}>Analysis Records</p>
        </div>
        <p className="empty-state">No analyses match the selected filter.</p>
      </div>
    );
  }

  return (
    <div className="history">
      <div className="history-header">
        <p className="section-title" style={{ margin: 0 }}>Analysis Records</p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span className="page-info">{sorted.length} entries</span>
          <button className="export-btn">
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Photo</th>
            <th
              id="sort-date"
              className="sortable"
              onClick={() => toggleSort("date")}
            >
              Date{sortIcon("date")}
            </th>
            <th>Location</th>
            <th>Top Waste Type</th>
            <th>Confidence</th>
            <th
              id="sort-score"
              className="sortable"
              onClick={() => toggleSort("score")}
            >
              Score{sortIcon("score")}
            </th>
            <th>Severity</th>
            {showUser && <th>User</th>}
            <th className="th-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paged.map((row) => (
            <tr key={row.id}>
              <td>
                {row.image_url ? (
                  <img
                    src={row.image_url}
                    alt="Beach analysis thumbnail"
                    className="thumb"
                    loading="lazy"
                  />
                ) : (
                  <div className="thumb-placeholder" title="No image">🖼</div>
                )}
              </td>
              <td>
                {new Date(row.created_at).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </td>
              <td>
                <span className="location-text">
                  {row.location_label || "Unknown location"}
                </span>
              </td>
              <td>
                <span className={`waste-badge waste-${(row.topType || row.waste_type || 'unknown').toLowerCase()}`}>
                  {row.topType || row.waste_type || 'Unknown'}
                </span>
              </td>
              <td>
                <span className="confidence-high">90.4%</span>
              </td>
              <td>{row.pollution_score}</td>
              <td>
                <span className={`severity-badge severity-${row.severity?.toLowerCase()}`}>
                  {row.severity}
                </span>
              </td>
              {showUser && (
                <td>
                  <span
                    className="admin-card-user"
                    title={row.user_name ? `${row.user_name} (${row.user_email || ""})` : (row.user_email || row.user_id || "Anonymous")}
                    style={{ fontSize: "0.78rem", fontWeight: 600 }}
                  >
                    👤 {row.user_name || (row.user_email
                      ? row.user_email.split("@")[0]
                      : row.user_id
                        ? row.user_id.slice(0, 8) + "…"
                        : "Anon")}
                  </span>
                </td>
              )}
              <td className="td-actions">
                <div className="action-buttons-cell">
                  <button
                    className="action-btn action-view"
                    title="View analysis detail"
                    aria-label="View analysis detail"
                    onClick={() => onViewRequest ? onViewRequest(row) : setSelectedRow(row)}
                  >
                    <Eye size={16} />
                  </button>
                  {onDeleteRequest && (
                    <button
                      className="action-btn action-delete"
                      title="Delete analysis"
                      aria-label="Delete analysis"
                      disabled={deletingId === row.id}
                      onClick={() => onDeleteRequest(row.id)}
                    >
                      {deletingId === row.id
                        ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                        : <Trash2 size={15} />}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            className="pagination-btn"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
          >
            ← Prev
          </button>
          <span className="page-info">
            {safePage + 1} / {totalPages}
          </span>
          <button
            type="button"
            className="pagination-btn"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage >= totalPages - 1}
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Detail Modal Preview ── */}
      {selectedRow && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Photo analysis detail"
          onClick={() => setSelectedRow(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedRow(null)}
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {selectedRow.image_url && (
              <img
                src={selectedRow.image_url}
                alt="Full-size beach analysis"
                className="modal-img"
              />
            )}

            <div className="modal-body">
              {showUser && (selectedRow.user_name || selectedRow.user_email || selectedRow.user_id) && (
                <div className="admin-card-user" style={{ marginBottom: "0.5rem", fontSize: "0.85rem" }}>
                  <User size={14} style={{ display: "inline", marginRight: "4px" }} />
                  Uploaded by: <strong title={selectedRow.user_email || selectedRow.user_id}>
                    {selectedRow.user_name || (selectedRow.user_email ? selectedRow.user_email.split("@")[0] : (selectedRow.user_id?.slice(0, 12) + "…"))}
                  </strong>
                </div>
              )}
              <ResultPanel result={toResultShape(selectedRow)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
