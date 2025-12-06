import { supabase } from "../../supabaseClient.js";

export async function runDirectoryManagement(provider, runId) {
  const { data: issues } = await supabase
    .from("validation_issues")
    .select("*")
    .eq("provider_id", provider.id)
    .eq("status", "OPEN");

  let needsReview = false;

  for (const issue of issues) {
    if (issue.confidence > 0.9) {
      await supabase
        .from("providers")
        .update({
          [issue.field_name]: issue.suggested_value,
          status: "ACTIVE",
          last_validated_at: new Date().toISOString()
        })
        .eq("id", provider.id);

      await supabase
        .from("validation_issues")
        .update({ status: "ACCEPTED" })
        .eq("id", issue.id);
    } else {
      needsReview = true;
      await supabase
        .from("providers")
        .update({ status: "NEEDS_REVIEW" })
        .eq("id", provider.id);
    }
  }

  return { needsReview };
}
