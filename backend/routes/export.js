import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

router.get("/export", async (req, res) => {
  const { data: providers, error } = await supabase
    .from("providers")
    .select("*");

  if (error) return res.status(500).json({ error: "Export failed" });

  let csv = "name,phone,email,address_line1,city,state,zip,speciality,license_number\n";

  providers.forEach(p => {
    csv += `"${p.name}","${p.phone || ""}","${p.email || ""}","${p.address_line1 || ""}","${p.city || ""}","${p.state || ""}","${p.zip || ""}","${p.speciality || ""}","${p.license_number || ""}"\n`;
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=truelens_export.csv");
  res.send(csv);
});

export default router;
