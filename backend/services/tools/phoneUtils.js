// TODO: Add phone normalization/formatting utilities
export function normalizePhone(phone) {
  if (!phone) return phone;
  return phone.replace(/[^0-9+]/g, "");
}
