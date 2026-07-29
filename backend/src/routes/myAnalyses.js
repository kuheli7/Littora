import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listAnalysesByUser } from "../services/supabaseClient.js";

const router = Router();

/**
 * GET /api/my-analyses
 * Requires: Authorization: Bearer <jwt>
 * Returns analyses belonging to the authenticated user only.
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const limit  = parseInt(req.query.limit,  10) || 100;
    const offset = parseInt(req.query.offset, 10) || 0;
    const analyses = await listAnalysesByUser(req.user.id, { limit, offset });
    res.json(analyses);
  } catch (err) {
    console.error("My analyses failed:", err.message);
    res.status(500).json({ error: "Could not fetch your analyses", details: err.message });
  }
});

export default router;
