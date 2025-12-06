import { supabase } from "../../supabaseClient.js";

export async function runQualityAssurance(provider, runId) {
  const { data: sources } = await supabase
    .from("provider_sources")
    .select("*")
    .eq("provider_id", provider.id);

  if (!sources || sources.length === 0) return { needsReview: false };

  const npiSource = sources.find(s => s.source_type === "NPI_API");
  if (!npiSource) return { needsReview: false };

  const suggested = {};
  const npiPhone = npiSource.raw_data.phone;
  if (npiPhone && npiPhone !== provider.phone) {
    suggested.phone = {
      oldValue: provider.phone,
      suggestedValue: npiPhone,
      confidence: 0.9
    };
  }

  const npiSpec = npiSource.raw_data.speciality;
  if (npiSpec && npiSpec !== provider.speciality) {
    suggested.speciality = {
      oldValue: provider.speciality,
      suggestedValue: npiSpec,
      confidence: 0.85
    };
  }

  // Prepare issue rows for bulk insert
  const issueRows = Object.entries(suggested).map(([fieldName, s]) => ({
    provider_id: provider.id,
    run_id: runId,
    field_name: fieldName,
    old_value: s.oldValue,
    suggested_value: s.suggestedValue,
    confidence: s.confidence,
    severity: s.confidence > 0.9 ? "HIGH" : "MEDIUM",
    status: "OPEN"
  }));

  if (issueRows.length === 0) return { needsReview: false };

  try {
    const { data: inserted, error: insertErr } = await supabase.from("validation_issues").insert(issueRows);
    if (insertErr) {
      console.error("Failed to insert validation issues for provider", provider.id, insertErr.message || insertErr);
      // If insert failed, do not mark as needs review (keeps counts consistent)
      return { needsReview: false };
    }

    return { needsReview: inserted && inserted.length > 0 };
  } catch (err) {
    console.error("Unexpected error inserting validation issues", err);
    return { needsReview: false };
  }
}
