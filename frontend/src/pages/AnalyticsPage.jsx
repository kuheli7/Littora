import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { useStats } from "../context/StatsContext.jsx";

const PIE_COLORS = ["#2f6f5e", "#c97b3d", "#a13d3d", "#3d6ea1", "#7c3d8a", "#f0b060"];

export default function AnalyticsPage() {
  const { stats } = useStats();

  const wasteComposition = useMemo(() => {
    const aggregate = stats.aggregateDetections || {};
    const total = Object.values(aggregate).reduce((s, v) => s + v, 0) || 1;
    
    return [
      { name: "Plastic Bottles", count: aggregate.bottle || 0 },
      { name: "Plastic Bags",    count: aggregate.bag || 0 },
      { name: "Metal Cans",      count: aggregate.can || 0 },
      { name: "Food Wrappers",   count: aggregate.wrapper || 0 },
    ].map(w => ({
      ...w,
      pct: `${((w.count / total) * 100).toFixed(1)}%`
    }));
  }, [stats.aggregateDetections]);

  const beachData = useMemo(() => {
    const locMap = {};
    (stats.locations || []).forEach(loc => {
      const label = loc.location_label || "Coastal Site";
      locMap[label] = (locMap[label] || 0) + 1;
    });

    const entries = Object.entries(locMap).map(([beach, detections]) => ({ beach, detections }));
    if (entries.length === 0) {
      return [
        { beach: "Zone A", detections: stats.totalAnalyses || 0 }
      ];
    }
    return entries.slice(0, 5);
  }, [stats.locations, stats.totalAnalyses]);

  return (
    <div className="page-container">
      <div className="page-heading">
        <h1>Analytics</h1>
        <p>Deep-dive into waste detection patterns and beach pollution data.</p>
      </div>

      <div className="charts-row" style={{ padding: 0 }}>
        <div className="chart-card">
          <div className="chart-card-title">Top Locations by Detections</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={beachData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-lt)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="beach" type="category" tick={{ fontSize: 11 }} width={90} />
              <Tooltip />
              <Bar dataKey="detections" fill="var(--teal)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Waste Composition</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={wasteComposition}
                dataKey="count"
                nameKey="name"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={2}
              >
                {wasteComposition.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="full-card">
        <div className="full-card-title">Top Waste Types</div>
        <table>
          <thead>
            <tr>
              <th>Waste Type</th>
              <th>Count</th>
              <th>Percentage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {wasteComposition.map(w => (
              <tr key={w.name}>
                <td style={{ fontWeight: 500 }}>{w.name}</td>
                <td>{w.count.toLocaleString()}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      height: '6px', borderRadius: '3px',
                      width: `${Math.min(parseFloat(w.pct) || 5, 100)}%`,
                      background: 'var(--teal)',
                      minWidth: '6px',
                      maxWidth: '120px'
                    }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{w.pct}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--green)', fontWeight: 600, fontSize: '0.8rem' }}>Active Tracking</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
