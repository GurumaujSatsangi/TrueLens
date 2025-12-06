import express from "express";
import multer from "multer";
import { parse } from "csv-parse/sync";
import { supabase } from "../supabaseClient.js";

const router = express.Router();
const upload = multer();

router.post("/providers", upload.single("file"), async (req, res) => {
  try {
    const csvBuffer = req.file.buffer;
    // Convert buffer to string and strip UTF-8 BOM if present
    const csvText = csvBuffer.toString("utf8").replace(/^\uFEFF/, "");
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      trim: true,
      // relax_quotes allows fields that contain unescaped quotes to be parsed more leniently
      relax_quotes: true
    });

    const rows = records.map(r => ({
      provider_code: r.provider_id || null,
      name: r.name,
      phone: r.phone,
      email: r.email,
      address_line1: r.address_line1,
      city: r.city,
      state: r.state,
      zip: r.zip,
      speciality: r.speciality,
      license_number: r.license_number,
      license_state: r.license_state
    }));

    const { error } = await supabase.from("providers").insert(rows);
    if (error) throw error;

    res.json({ imported: rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "CSV upload failed" });
  }
});

export default router;
