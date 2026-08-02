import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listAnalysesByUser, deleteAnalysisForUser } from "../services/supabaseClient.js";

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

/**
 * DELETE /api/my-analyses/:id
 * Requires: Authorization: Bearer <jwt>
 * Deletes an analysis only if it belongs to the requesting user.
 */
router.delete("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Analysis ID is required" });
  try {
    await deleteAnalysisForUser(id, req.user.id);
    res.json({ message: "Analysis deleted", id });
  } catch (err) {
    console.error("Delete my-analysis failed:", err.message);
    const status = err.message === "Not found or not yours" ? 403 : 500;
    res.status(status).json({ error: err.message });
  }
});

export default router;
