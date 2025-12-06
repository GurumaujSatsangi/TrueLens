import { supabase } from "../../supabaseClient.js";
import { getNpiData } from "../tools/npiClient.js";

export async function runDataValidation(provider) {
  const npiData = await getNpiData(provider);

  if (npiData) {
    try {
      const { data, error } = await supabase.from("provider_sources").insert({
        provider_id: provider.id,
        source_type: "NPI_API",
        raw_data: npiData
      });
      if (error) {
        console.error('Failed to insert provider_sources for', provider.id, error.message || error);
      }
    } catch (err) {
      console.error('Unexpected error inserting provider_sources', err);
    }
  }

  return { npiData };
}
