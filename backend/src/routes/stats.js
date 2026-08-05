import { Router } from "express";
import { getStats, supabase } from "../services/supabaseClient.js";

const router = Router();

// GET /api/stats — aggregated dashboard data
// Returns: totalAnalyses, totalWasteAllTime, avgScore, severityCounts,
//          aggregateDetections, locations (with coords), history (full list)
router.get("/", async (req, res) => {
  try {
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const { data } = await supabase.auth.getUser(token);
      if (data?.user) {
        const adminEmail = process.env.ADMIN_EMAIL;
        // If regular user, pass userId to getStats to scope stats to user's uploads
        if (!adminEmail || data.user.email !== adminEmail) {
          userId = data.user.id;
        }
      }
    }

    const stats = await getStats(userId);
    res.json(stats);
  } catch (err) {
    console.error("Stats failed:", err.message);
    res.status(500).json({ error: "Could not fetch stats", details: err.message });
  }
});

export default router;
