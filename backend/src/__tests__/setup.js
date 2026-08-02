// Test environment setup: provide required env vars before any module loads
process.env.SUPABASE_URL = "https://mock.supabase.co";
process.env.SUPABASE_SECRET_KEY = "mock-secret-key";
process.env.SUPABASE_SERVICE_KEY = "mock-service-key";
process.env.ADMIN_EMAIL = "admin@littora.app";
process.env.AI_SERVICE_URL = "http://localhost:8000";
process.env.PORT = "4001";
