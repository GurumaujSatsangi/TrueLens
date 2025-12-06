// Main frontend helper
console.log('TrueLens frontend loaded');

export async function fetchJSON(url, opts){
  const res = await fetch(url, opts);
  return res.json();
}
