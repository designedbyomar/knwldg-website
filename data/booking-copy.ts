export const LOCATION_AUTOCOMPLETE_COPY = {
  suggestionsLabel: "Venue and location suggestions",
  openStreetMapAttribution: "© OpenStreetMap contributors",
  geoapifyAttribution: "Powered by Geoapify",
  loadingStatus: "Finding locations",
  unavailableStatus:
    "Location suggestions are unavailable. Continue entering the location manually.",
  unavailableHelper: "Suggestions unavailable; manual entry still works.",
  helper: "Start typing a venue, city, or address.",
} as const;

export function formatLocationSuggestionsAvailable(count: number) {
  return `${count} location suggestions available`;
}
