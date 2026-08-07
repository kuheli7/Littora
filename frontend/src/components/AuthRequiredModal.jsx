import { X, ShieldAlert, LogIn } from "lucide-react";

export default function AuthRequiredModal({ isOpen, onClose, featureName = "use this feature" }) {
  if (!isOpen) return null;

  const handleSignIn = () => {
    onClose();
    window.location.href = "/login";
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px", padding: "1.75rem", textAlign: "center" }}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>

        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "rgba(47, 111, 94, 0.12)",
          color: "var(--teal)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1rem"
        }}>
          <ShieldAlert size={28} strokeWidth={1.8} />
        </div>

        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "0 0 0.5rem", color: "var(--ink)" }}>
          Sign In Required
        </h3>

        <p style={{ fontSize: "0.86rem", color: "var(--muted)", margin: "0 0 1.5rem", lineHeight: 1.5 }}>
          Please sign in to {featureName}. Guest visitors can browse statistics, maps, and historical trends.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button
            type="button"
            className="filter-btn-clear"
            onClick={onClose}
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="filter-btn-apply"
            onClick={handleSignIn}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
          >
            <LogIn size={16} />
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
