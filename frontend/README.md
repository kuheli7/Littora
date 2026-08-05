# 💻 Littora Frontend — React 18 + Vite Web Application

The frontend of **Littora** is a responsive, feature-rich Single Page Application (SPA) built with **React 18**, **Vite**, and **Vanilla CSS tokens** with full dark-mode and theme customization.

---

## 🌟 Features

- **🎨 Dual Theme Engine**:
  - **Earth Theme**: Warm sand tones (`#f7f2e8`), watercolor botanical artwork accents.
  - **Dark Theme**: High-contrast dark mode (`#0a0f1e` deep navy, `#00d4aa` glowing cyan).
- **🔒 Session & Authentication**:
  - Integrated with **Supabase Auth** via `AuthContext`.
  - Implements **Standard Supabase Sliding Sessions** (seamless background token rotation without artificial hard cutoffs).
  - Protected routes (`ProtectedRoute`) supporting role-based access control (User / Admin).
- **📊 Interactive Reports & PDF Export**:
  - Generates compact, professionally formatted **PDF Reports** (`Daily`, `Weekly`, `Monthly`, `Custom`).
  - Powered by `jsPDF` + `html2canvas` with **75% JPEG compression** (~200KB download size).
- **⚙️ Complete Settings Engine**:
  - Multi-language interface switching (English, Hindi, Tamil).
  - Custom date formatters (`DD MMM YYYY`, `MM/DD/YYYY`, `YYYY-MM-DD`).
  - Dynamic table pagination (`10`, `25`, `50` rows per page).
- **📍 Interactive Beach Pollution Map**:
  - Powered by Leaflet & React-Leaflet for location tracking and hotspot markers.

---

## 📁 Directory Structure

```text
frontend/
├── src/
│   ├── assets/        → Theme artwork & images (Earth & Dark navbar assets)
│   ├── components/    → UI components (Navbar, Sidebar, ProtectedRoute, HistoryTable, ResultPanel, etc.)
│   ├── context/       → Global React contexts:
│   │   ├── AuthContext.jsx       → Supabase Auth & sliding session state
│   │   ├── ThemeContext.jsx      → Earth / Dark theme state & tokens
│   │   ├── SettingsContext.jsx   → Language, date format, pagination settings
│   │   └── StatsContext.jsx      → Global analytics & stats caching
│   ├── pages/         → Page views:
│   │   ├── Dashboard.jsx         → Analytics overview & stats cards
│   │   ├── DetectPage.jsx        → Photo upload & real-time AI detection
│   │   ├── HistoryPage.jsx       → Filterable table of past analyses
│   │   ├── MapPage.jsx           → Interactive beach pollution map
│   │   ├── ReportsPage.jsx       → Report generator & PDF exporter
│   │   ├── SettingsPage.jsx      → Preferences & account management
│   │   ├── AdminDashboard.jsx    → Admin overview across all users
│   │   └── LoginPage.jsx         → Sign in / Sign up tabbed form
│   ├── utils/         → Helper utilities:
│   │   └── generatePdfReport.js  → Optimized PDF report rendering engine
│   ├── index.css      → Global CSS design system, utility tokens & theme variables
│   └── main.jsx       → React root mount point
├── package.json
└── vitest.config.js   → Vitest testing configuration
```

---

## 🚀 Development & Testing

### Installation
```bash
npm install
```

### Run Local Dev Server
```bash
npm run dev
```
*App runs at `http://localhost:5173`.*

### Run Unit Tests
```bash
npm test
```
*Executes Vitest suite (112+ tests covering auth, components, pages, and theme state).*

### Production Build
```bash
npm run build
```
