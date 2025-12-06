import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

router.post("/:id/accept", async (req, res) => {
  const { data: issue } = await supabase
    .from("validation_issues")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (!issue) return res.status(404).json({ error: "Issue not found" });

  await supabase
    .from("providers")
    .update({
      [issue.field_name]: issue.suggested_value,
      status: "ACTIVE"
    })
    .eq("id", issue.provider_id);

  await supabase
    .from("validation_issues")
    .update({ status: "ACCEPTED" })
    .eq("id", issue.id);

  res.json({ message: "Update applied" });
});

router.post("/:id/reject", async (req, res) => {
  await supabase
    .from("validation_issues")
    .update({ status: "REJECTED" })
    .eq("id", req.params.id);

  res.json({ message: "Issue rejected" });
});

export default router;
