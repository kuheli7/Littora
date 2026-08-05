import { useStats } from "../context/StatsContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import PollutionMap from "../components/PollutionMap.jsx";

const LEGEND = [
  { label: "Low",      color: "#2E7D32" },
  { label: "Moderate", color: "#F9A825" },
  { label: "High",     color: "#EF6C00" },
  { label: "Severe",   color: "#C62828" },
];

export default function MapPage() {
  const { stats } = useStats();
  const { isAdmin } = useAuth();

  return (
    <div className="map-page-container">
      <div className="map-page-header">
        <h1>Pollution Map</h1>
        <p>
          {isAdmin
            ? "Admin View — System-wide geolocated hotspots from all users' submitted beach analyses."
            : "Geolocated hotspots from your submitted beach analyses — attach location on upload to populate this map."
          }
        </p>
      </div>

      <div className="map-legend">
        <span className="map-legend-label">Severity</span>
        {LEGEND.map((l) => (
          <div key={l.label} className="map-legend-item">
            <div className="legend-dot" style={{ background: l.color }} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>

      <PollutionMap locations={stats.locations} />
    </div>
  );
}
