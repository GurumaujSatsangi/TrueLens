import { runDataValidation } from "./agents/dataValidationAgent.js";
import { runQualityAssurance } from "./agents/qualityAssuranceAgent.js";
import { runDirectoryManagement } from "./agents/directoryManagementAgent.js";

export async function runValidationForProvider(provider, runId) {
  await runDataValidation(provider);
  const qa = await runQualityAssurance(provider, runId);
  const dm = await runDirectoryManagement(provider, runId);
  return { needsReview: qa.needsReview || dm.needsReview };
}
