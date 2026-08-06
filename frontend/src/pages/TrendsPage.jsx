import { useState, useMemo } from "react";
import { useStats } from "../context/StatsContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid
} from "recharts";
import { TrendingUp, Trash2, ImageIcon, Target } from "lucide-react";

const BASE_MONTHLY_DATA = [
  { month: "Jan", detections: 5124, waste: 7245, forecast: 5500, previous: 4800 },
  { month: "Feb", detections: 3842, waste: 6653, forecast: 4200, previous: 3600 },
  { month: "Mar", detections: 4102, waste: 9812, forecast: 4400, previous: 3900 },
  { month: "Apr", detections: 4650, waste: 8420, forecast: 4900, previous: 4300 },
  { month: "May", detections: 5411, waste: 12161, forecast: 5800, previous: 5100 },
  { month: "Jun", detections: 6842, waste: 15293, forecast: 7100, previous: 6200 },
];

const BASE_WASTE_TYPE_DATA = [
  { month: "01 Jun", "Plastic Bottle": 400, "Plastic Bag": 240, Wrapper: 180, Can: 120, Glass: 80, Foam: 60, Metal: 45, Other: 30 },
  { month: "08 Jun", "Plastic Bottle": 520, "Plastic Bag": 280, Wrapper: 200, Can: 140, Glass: 100, Metal: 55, Other: 35 },
  { month: "15 Jun", "Plastic Bottle": 610, "Plastic Bag": 320, Wrapper: 220, Can: 160, Glass: 115, Metal: 65, Other: 40 },
  { month: "22 Jun", "Plastic Bottle": 740, "Plastic Bag": 380, Wrapper: 260, Can: 180, Glass: 130, Metal: 75, Other: 45 },
  { month: "30 Jun", "Plastic Bottle": 890, "Plastic Bag": 430, Wrapper: 300, Can: 210, Glass: 150, Metal: 85, Other: 50 },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM"];

function generateHeatmap() {
  return DAYS.map(day => ({
    day,
    hours: HOURS.map(hour => ({
      hour,
      value: Math.floor(Math.random() * 100)
    }))
  }));
}

const WASTE_COLORS = {
  "Plastic Bottle": "#0077B6",
  "Plastic Bag":    "#4CC9F0",
  "Wrapper":        "#F8961E",
  "Can":            "#90BE6D",
  "Glass":          "#577590",
  "Foam":           "#F94144",
  "Metal":          "#9C89B8",
  "Other":          "#ADB5BD",
};

function getHeatmapColor(val, isDark) {
  if (!val || val === 0) return isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const alpha = Math.max(0.12, (val / 100)).toFixed(2);
  return isDark
    ? `rgba(0, 212, 170, ${alpha})`
    : `rgba(14, 140, 134, ${alpha})`;
}

export default function TrendsPage() {
  const { stats } = useStats();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const linePrimary  = isDark ? "#00D4AA" : "#0E8C86";
  const lineForecast = isDark ? "#5EEAD4" : "#4DB6AC";
  const linePrevious = isDark ? "#94A3B8" : "#A1887F";

  const [dateRange, setDateRange] = useState("last30");
  const [beach, setBeach] = useState("all");
  const [wasteType, setWasteType] = useState("all");

  const [activeDateRange, setActiveDateRange] = useState("last30");
  const [activeBeach, setActiveBeach] = useState("all");
  const [activeWasteType, setActiveWasteType] = useState("all");

  const handleApply = () => {
    setActiveDateRange(dateRange);
    setActiveBeach(beach);
    setActiveWasteType(wasteType);
  };

  const handleClear = () => {
    setDateRange("last30");
    setBeach("all");
    setWasteType("all");
    setActiveDateRange("last30");
    setActiveBeach("all");
    setActiveWasteType("all");
  };

  const multiplier = useMemo(() => {
    let mult = 1.0;
    if (activeBeach === "marina") mult *= 0.45;
    else if (activeBeach === "juhu") mult *= 0.35;
    else if (activeBeach === "goa") mult *= 0.20;

    if (activeWasteType === "plastic") mult *= 0.5;
    else if (activeWasteType === "bags") mult *= 0.3;
    else if (activeWasteType === "foam") mult *= 0.2;

    if (activeDateRange === "last90") mult *= 2.5;
    else if (activeDateRange === "last365") mult *= 8.0;

    return mult;
  }, [activeBeach, activeWasteType, activeDateRange]);

  const monthlyData = useMemo(() => {
    return BASE_MONTHLY_DATA.map(d => ({
      month: d.month,
      detections: Math.round(d.detections * multiplier),
      waste: Math.round(d.waste * multiplier),
      forecast: Math.round(d.forecast * multiplier),
      previous: Math.round(d.previous * multiplier),
    }));
  }, [multiplier]);

  const wasteTypeData = useMemo(() => {
    return BASE_WASTE_TYPE_DATA.map(d => {
      const res = { month: d.month };
      Object.keys(WASTE_COLORS).forEach(k => {
        res[k] = Math.round((d[k] || 0) * multiplier);
      });
      return res;
    });
  }, [multiplier]);

  const heatmapData = useMemo(() => generateHeatmap(), []);

  return (
    <div className="page-container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div className="page-heading">
        <h1>Historical Trends &amp; Analytics</h1>
        <p>Monitor seasonal pollution shifts, waste category composition, and day/time detection density.</p>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar-card">
        <div className="filter-group">
          <label className="filter-label">Date Range</label>
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="filter-select">
            <option value="last30">Last 30 Days</option>
            <option value="last90">Last 90 Days</option>
            <option value="last365">Last 1 Year</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Beach Location</label>
          <select value={beach} onChange={e => setBeach(e.target.value)} className="filter-select">
            <option value="all">All Beaches</option>
            <option value="marina">Marina Beach, Chennai</option>
            <option value="juhu">Juhu Beach, Mumbai</option>
            <option value="goa">Baga Beach, Goa</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Waste Type</label>
          <select value={wasteType} onChange={e => setWasteType(e.target.value)} className="filter-select">
            <option value="all">All Categories</option>
            <option value="plastic">Plastic Bottles</option>
            <option value="bags">Plastic Bags</option>
            <option value="foam">Foam &amp; Packaging</option>
          </select>
        </div>
        <div className="filter-actions">
          <button className="filter-btn filter-btn-apply" onClick={handleApply}>Apply Filters</button>
          <button className="filter-btn filter-btn-clear" onClick={handleClear}>Reset</button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="trend-metric-cards">
        <div className="trend-metric-card">
          <div className="trend-metric-icon" style={{ background: 'rgba(14,140,134,0.12)' }}>
            <TrendingUp size={20} color="var(--primary)" />
          </div>
          <div>
            <div className="trend-metric-value">{(stats.totalAnalyses || 128).toLocaleString()}</div>
            <div className="trend-metric-label">Total Detections</div>
            <div className="trend-metric-delta" style={{ color: 'var(--green)', fontSize: '0.68rem', fontWeight: 600 }}>↑ 19.4% from last month</div>
          </div>
        </div>

        <div className="trend-metric-card">
          <div className="trend-metric-icon" style={{ background: 'rgba(200,159,101,0.12)' }}>
            <Trash2 size={20} color="var(--sand-gold)" />
          </div>
          <div>
            <div className="trend-metric-value">{(stats.totalWasteAllTime || 2840).toLocaleString()}</div>
            <div className="trend-metric-label">Total Waste Items</div>
            <div className="trend-metric-delta" style={{ color: 'var(--green)', fontSize: '0.68rem', fontWeight: 600 }}>↑ 21.4% from last month</div>
          </div>
        </div>

        <div className="trend-metric-card">
          <div className="trend-metric-icon" style={{ background: 'rgba(123,183,217,0.12)' }}>
            <ImageIcon size={20} color="var(--sky)" />
          </div>
          <div>
            <div className="trend-metric-value">22.1</div>
            <div className="trend-metric-label">Avg. Items / Photo</div>
            <div className="trend-metric-delta" style={{ color: 'var(--red)', fontSize: '0.68rem', fontWeight: 600 }}>↓ 4.8% from last month</div>
          </div>
        </div>

        <div className="trend-metric-card">
          <div className="trend-metric-icon" style={{ background: 'rgba(217,119,87,0.12)' }}>
            <Target size={20} color="var(--coral)" />
          </div>
          <div>
            <div className="trend-metric-value">91.3%</div>
            <div className="trend-metric-label">AI Accuracy</div>
            <div className="trend-metric-delta" style={{ color: 'var(--green)', fontSize: '0.68rem', fontWeight: 600 }}>↑ 2.1% from last month</div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="charts-row" style={{ padding: 0 }}>
        <div className="chart-card">
          <div className="chart-card-title">Detections Over Time</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-lt)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="detections" stroke={linePrimary} strokeWidth={2.5} dot={{ r: 4 }} name="Total Detections" />
              <Line type="monotone" dataKey="forecast" stroke={lineForecast} strokeWidth={2} strokeDasharray="5 5" dot={false} name="Forecast" />
              <Line type="monotone" dataKey="previous" stroke={linePrevious} strokeWidth={1.8} dot={false} name="Previous Year" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <div className="chart-card-title">Waste Category Trend (by Count)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={wasteTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-lt)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {Object.entries(WASTE_COLORS).map(([key, color]) => (
                <Bar key={key} dataKey={key} stackId="a" fill={color} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap */}
      <div className="chart-card" style={{ marginBottom: '1.5rem' }}>
        <div className="chart-card-title">Heatmap — Detections by Day &amp; Time</div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '20px' }}>
            {DAYS.map(d => (
              <div key={d} style={{ height: '28px', display: 'flex', alignItems: 'center', fontSize: '0.7rem', color: 'var(--muted)', width: '28px' }}>{d}</div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
              {HOURS.map(h => (
                <div key={h} style={{ flex: 1, fontSize: '0.65rem', color: 'var(--muted)', textAlign: 'center' }}>{h}</div>
              ))}
            </div>
            {heatmapData.map(row => (
              <div key={row.day} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                {row.hours.map(cell => (
                  <div
                    key={cell.hour}
                    style={{
                      flex: 1,
                      height: '28px',
                      borderRadius: '4px',
                      background: getHeatmapColor(cell.value, isDark),
                    }}
                    title={`${row.day} ${cell.hour}: ${cell.value}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
