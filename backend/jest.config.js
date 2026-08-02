export default {
  testEnvironment: "node",
  transform: {},         // ESM — no transform needed (Node native ESM)
  extensionsToTreatAsEsm: [],
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverage: false,
  // Suppress dotenv errors — tests use mocked env
  setupFiles: ["./src/__tests__/setup.js"],
};
