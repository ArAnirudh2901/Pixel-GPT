export function constructImageURL(baseUrl, params = {}) {
  if (!baseUrl) return "";

  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  );

  if (entries.length === 0) return baseUrl;

  const trValue = entries
    .map(([key, value]) => `${key}-${encodeURIComponent(String(value))}`)
    .join(",");

  try {
    const url = new URL(baseUrl);
    url.searchParams.set("tr", trValue);
    return url.toString();
  } catch {
    const hasQuery = baseUrl.includes("?");
    const base = baseUrl.split("?")[0];
    return `${base}${hasQuery ? "&" : "?"}tr=${trValue}`;
  }
}
