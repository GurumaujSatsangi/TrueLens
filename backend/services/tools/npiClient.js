import axios from "axios";

export async function getNpiData(provider) {
  try {
    const url = new URL("https://npiregistry.cms.hhs.gov/api/");
    url.searchParams.set("version", "2.1");
    const [firstName, lastName] = (provider.name || "").split(" ");
    if (firstName) url.searchParams.set("first_name", firstName);
    if (lastName) url.searchParams.set("last_name", lastName);
    if (provider.city) url.searchParams.set("city", provider.city);
    if (provider.state) url.searchParams.set("state", provider.state);
    url.searchParams.set("limit", "1");

    const res = await axios.get(url.toString());
    const json = res.data;
    if (!json.results || json.results.length === 0) return null;

    const entry = json.results[0];
    return {
      npi: entry.number,
      phone: entry.basic?.phone,
      speciality: entry.taxonomies?.[0]?.desc || null,
      address: entry.addresses?.[0] || null
    };
  } catch (err) {
    console.error("NPI lookup failed", err.message);
    return null;
  }
}
