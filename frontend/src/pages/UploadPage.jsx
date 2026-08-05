import { useState } from "react";
import axios from "axios";
import { ImageOff } from "lucide-react";
import { useStats } from "../context/StatsContext.jsx";
import { useAuth }  from "../context/AuthContext.jsx";
import UploadForm  from "../components/UploadForm.jsx";
import ResultPanel from "../components/ResultPanel.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export default function UploadPage() {
  const { loadStats }  = useStats();
  const { getToken }   = useAuth();
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  async function handleUpload(file, coords) {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", file);
    if (coords) {
      formData.append("latitude",  coords.latitude);
      formData.append("longitude", coords.longitude);
    }

    try {
      // Attach JWT so the upload is tagged with the current user's id
      const token = await getToken();
      const headers = { "Content-Type": "multipart/form-data" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const { data } = await axios.post(`${API_BASE}/api/analyze`, formData, { headers });
      setResult(data);
      loadStats();
    } catch (err) {
      setError(
        err.response?.data?.error || "Analysis failed — is the backend running?"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-heading">
        <h1>Detect Waste</h1>
        <p>Upload or capture a beach photo to detect waste using AI.</p>
      </div>

      <div className="upload-layout">
        {/* Left — upload form & feature image with bounding boxes */}
        <div className="upload-pane">
          <div className="upload-card">
            <div className="upload-card-title">Upload &amp; Detection View</div>
            <UploadForm
              onUpload={handleUpload}
              loading={loading}
              result={result}
              onReset={() => setResult(null)}
            />
            {error && (
              <p className="error" style={{ marginTop: "0.85rem" }}>
                ⚠️ {error}
              </p>
            )}
          </div>
        </div>

        {/* Right — result statistics & charts */}
        <div>
          <div className="upload-card">
            <div className="upload-card-title">Detection Result &amp; Analytics</div>
            {result ? (
              <ResultPanel result={result} />
            ) : (
              <div className="result-placeholder" style={{ boxShadow: 'none', background: 'transparent', padding: '3rem 1rem' }}>
                <ImageOff size={44} strokeWidth={1.4} />
                <p>Your analysis breakdown and charts will appear here after you upload and analyze a photo.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
