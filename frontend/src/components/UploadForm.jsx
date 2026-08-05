import { useState } from "react";
import { UploadCloud, Camera, MapPin } from "lucide-react";

const BEACH_PRESETS = {
  marina: { label: "🌊 Marina Beach, Chennai", latitude: 13.0499, longitude: 80.2824, locationLabel: "Marina Beach, Chennai" },
  puri:   { label: "🌊 Puri Beach, Odisha", latitude: 19.7983, longitude: 85.8249, locationLabel: "Puri Beach, Odisha" },
  udupi:  { label: "🌊 Malpe Beach, Udupi", latitude: 13.3489, longitude: 74.7037, locationLabel: "Malpe Beach, Udupi" },
  auto:   { label: "📍 Device GPS (Auto-detect)", latitude: null, longitude: null, locationLabel: null },
};

export default function UploadForm({ onUpload, loading }) {
  const [file,          setFile]          = useState(null);
  const [previewUrl,    setPreviewUrl]    = useState(null);
  const [dragging,      setDragging]      = useState(false);
  const [selectedBeach, setSelectedBeach] = useState("marina");
  // idle | fetching | granted | denied
  const [locStatus,     setLocStatus]     = useState("idle");

  function applyFile(selected) {
    if (!selected || !selected.type.startsWith("image/")) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setLocStatus("idle");
  }

  function handleFileChange(e)  { applyFile(e.target.files[0]); }
  function handleDragOver(e)    { e.preventDefault(); setDragging(true); }
  function handleDragLeave(e)   { e.preventDefault(); setDragging(false); }
  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    applyFile(e.dataTransfer.files[0]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;

    if (selectedBeach !== "auto") {
      const preset = BEACH_PRESETS[selectedBeach];
      onUpload(file, {
        latitude:      preset.latitude,
        longitude:     preset.longitude,
        locationLabel: preset.locationLabel,
      });
      return;
    }

    if (!navigator.geolocation) {
      onUpload(file, null);
      return;
    }

    setLocStatus("fetching");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocStatus("granted");
        onUpload(file, { latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      },
      () => {
        setLocStatus("denied");
        onUpload(file, null);
      },
      { timeout: 6000, maximumAge: 60000 }
    );
  }

  const isBusy   = loading || locStatus === "fetching";
  const btnLabel =
    locStatus === "fetching" ? "Getting location…"
    : loading               ? "Analyzing…"
    :                         "Analyze photo";

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label
        htmlFor="image-input"
        className={`upload-label${dragging ? " drag-over" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Selected beach photo" className="upload-preview" />
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon-wrap">
              <UploadCloud size={24} strokeWidth={1.8} />
            </div>
            <span className="upload-label-text">
              Drag &amp; drop or click to browse
            </span>
            <span className="upload-hint">Supports: JPG, PNG, JPEG (Max 10MB)</span>
          </div>
        )}
      </label>

      <input
        id="image-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        hidden
      />

      {/* Beach Location Selector */}
      <div className="beach-selector-container" style={{ margin: "0.85rem 0" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", fontWeight: 600, color: "var(--muted)", marginBottom: "0.35rem" }}>
          <MapPin size={14} style={{ color: "var(--teal)" }} /> Target Beach Location:
        </label>
        <select
          value={selectedBeach}
          onChange={(e) => setSelectedBeach(e.target.value)}
          className="settings-select"
          style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px" }}
        >
          {Object.entries(BEACH_PRESETS).map(([key, item]) => (
            <option key={key} value={key}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="upload-btn" disabled={!file || isBusy}>
        <UploadCloud size={18} strokeWidth={2} />
        {btnLabel}
      </button>

      <div className="upload-divider">Or capture image</div>
      <button
        type="button"
        className="camera-btn"
        onClick={() => alert('Camera capture coming soon!')}
      >
        <Camera size={16} strokeWidth={1.8} />
        Open Camera
      </button>

      {selectedBeach === "auto" && locStatus === "denied" && (
        <p className="loc-note" style={{ color: "var(--muted)" }}>
          📍 Location access denied — uploaded without coordinates.
        </p>
      )}
      {selectedBeach === "auto" && locStatus === "granted" && (
        <p className="loc-note" style={{ color: "var(--teal)" }}>
          📍 Location attached to this photo.
        </p>
      )}
    </form>
  );
}
