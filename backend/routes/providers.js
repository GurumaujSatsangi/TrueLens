import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { status, search, limit } = req.query;

  let query = supabase
    .from("providers")
    .select("*, validation_issues(count)")
    .order("name");

  if (status) query = query.eq("status", status);
  if (limit) query = query.limit(Number(limit));
  if (search) query = query.ilike("name", `%${search}%`);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const providers = data.map(p => ({
    ...p,
    issues_count: p.validation_issues[0]?.count || 0
  }));

  res.json({ providers });
});

router.get("/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error) return res.status(500).json({ error: "Provider not found" });
  res.json(data);
});

router.get("/:id/issues", async (req, res) => {
  const { data, error } = await supabase
    .from("validation_issues")
    .select("*")
    .eq("provider_id", req.params.id);

  if (error) return res.status(500).json({ error: "Issues not found" });
  res.json({ issues: data });
});

export default router;
