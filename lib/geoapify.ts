export const GEOAPIFY_AUTOCOMPLETE_ENDPOINT =
  "https://api.geoapify.com/v1/geocode/autocomplete";

export const GEOAPIFY_ATTRIBUTION_URL = "https://www.geoapify.com/";
export const OPENSTREETMAP_ATTRIBUTION_URL =
  "https://www.openstreetmap.org/copyright";

// Broad Northeast bounds, used as a preference rather than a restriction so
// inquiries elsewhere in the United States still work.
const NORTHEAST_BIAS = "rect:-80.6,37,-66,47.5";

export type LocationSuggestion = {
  placeId: string;
  formatted: string;
  primary: string;
  secondary: string;
};

type GeoapifyResult = {
  place_id?: unknown;
  name?: unknown;
  formatted?: unknown;
  address_line1?: unknown;
  address_line2?: unknown;
  city?: unknown;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function buildGeoapifyAutocompleteUrl(query: string, apiKey: string): string {
  const url = new URL(GEOAPIFY_AUTOCOMPLETE_ENDPOINT);
  url.search = new URLSearchParams({
    text: query,
    format: "json",
    filter: "countrycode:us",
    bias: NORTHEAST_BIAS,
    lang: "en",
    limit: "6",
    apiKey,
  }).toString();
  return url.toString();
}

export function parseGeoapifySuggestions(payload: unknown): LocationSuggestion[] {
  if (!payload || typeof payload !== "object" || !("results" in payload)) return [];

  const results = (payload as { results?: unknown }).results;
  if (!Array.isArray(results)) return [];

  const seen = new Set<string>();
  const suggestions: LocationSuggestion[] = [];

  for (const raw of results as GeoapifyResult[]) {
    if (!raw || typeof raw !== "object") continue;

    const formatted = text(raw.formatted);
    const placeId = text(raw.place_id);
    if (!formatted || !placeId || seen.has(placeId)) continue;

    const primary =
      text(raw.name) || text(raw.address_line1) || text(raw.city) || formatted;
    const addressLine2 = text(raw.address_line2);
    const secondary = addressLine2 && addressLine2 !== primary ? addressLine2 : formatted;

    seen.add(placeId);
    suggestions.push({ placeId, formatted, primary, secondary });
  }

  return suggestions;
}
