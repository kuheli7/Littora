# ⚙️ Littora Backend — Node.js & Express API Server

The backend of **Littora** serves as the central orchestration API between the React frontend, the Python AI Inference Service, and Supabase (PostgreSQL & Storage).

---

## 🌟 Responsibilities

- **📷 Image Storage Orchestration**: Receives multipart image uploads from the browser, forwards them to the AI service for inference, uploads image buffers to Supabase Storage (`beach-waste-images`), and persists analysis records.
- **🔒 JWT Authentication & Middleware**:
  - `requireAuth`: Verifies Bearer JWT tokens with Supabase Auth (`supabase.auth.getUser(token)`).
  - `requireAdmin`: Enforces admin privileges by matching `req.user.email` against `ADMIN_EMAIL`.
- **📧 Email Notifications**: Automated report emailing via Nodemailer.
- **📊 Analytics Aggregation**: Provides endpoints for statistics, beach waste counts, severity breakdowns, and user history.

---

## 📁 Directory Structure

```text
backend/
├── src/
│   ├── index.js           → Express application setup & middleware initialization
│   ├── middleware/
│   │   └── auth.js        → requireAuth and requireAdmin middleware
│   ├── routes/
│   │   ├── admin.js       → /api/admin endpoints (manage all user analyses)
│   │   ├── analyses.js    → /api/analyses endpoints
│   │   ├── analyze.js     → /api/analyze multipart upload & AI orchestration
│   │   ├── auth.js        → /api/auth login & logout endpoints
│   │   ├── email.js       → /api/email send report endpoint
│   │   ├── myAnalyses.js  → /api/my-analyses authenticated user history
│   │   └── stats.js       → /api/stats summary metrics
│   ├── services/
│   │   ├── aiService.js       → HTTP client forwarding to Python FastAPI
│   │   ├── emailService.js    → Nodemailer configuration & transport
│   │   └── supabaseClient.js  → Supabase client, storage upload & DB queries
│   └── __tests__/         → Jest integration and route unit tests
├── .env.example           → Environment variable template
└── package.json
```

---

## 🚀 Environment Setup & Running

### 1. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
PORT=4000
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_STORAGE_BUCKET=beach-waste-images
AI_SERVICE_URL=http://localhost:8000
ADMIN_EMAIL=admin@littora.org
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Dev Server
```bash
npm run dev
```
*Server runs on `http://localhost:4000`.*

### 4. Run Test Suite
```bash
npm test
```
*Executes Jest tests for auth routes, analyze endpoint, and middleware.*
