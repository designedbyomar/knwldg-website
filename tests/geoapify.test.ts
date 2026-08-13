import { describe, expect, it } from "vitest";
import {
  buildGeoapifyAutocompleteUrl,
  parseGeoapifySuggestions,
} from "@/lib/geoapify";

describe("Geoapify location autocomplete", () => {
  it("limits searches to the United States and biases them toward the Northeast", () => {
    const url = new URL(buildGeoapifyAutocompleteUrl("Society Room", "test-key"));

    expect(url.origin + url.pathname).toBe(
      "https://api.geoapify.com/v1/geocode/autocomplete"
    );
    expect(url.searchParams.get("text")).toBe("Society Room");
    expect(url.searchParams.get("filter")).toBe("countrycode:us");
    expect(url.searchParams.get("bias")).toBe("rect:-80.6,37,-66,47.5");
    expect(url.searchParams.get("limit")).toBe("6");
    expect(url.searchParams.get("apiKey")).toBe("test-key");
  });

  it("normalizes valid results and removes duplicate place IDs", () => {
    const payload = {
      results: [
        {
          place_id: "venue-1",
          name: "The Society Room of Hartford",
          formatted: "The Society Room of Hartford, 31 Pratt Street, Hartford, CT 06103",
          address_line2: "31 Pratt Street, Hartford, CT 06103",
        },
        {
          place_id: "venue-1",
          formatted: "Duplicate result",
        },
        {
          place_id: "city-1",
          city: "Hartford",
          formatted: "Hartford, CT, United States",
        },
        { place_id: "missing-address" },
      ],
    };

    expect(parseGeoapifySuggestions(payload)).toEqual([
      {
        placeId: "venue-1",
        formatted: "The Society Room of Hartford, 31 Pratt Street, Hartford, CT 06103",
        primary: "The Society Room of Hartford",
        secondary: "31 Pratt Street, Hartford, CT 06103",
      },
      {
        placeId: "city-1",
        formatted: "Hartford, CT, United States",
        primary: "Hartford",
        secondary: "Hartford, CT, United States",
      },
    ]);
  });

  it("returns no suggestions for malformed responses", () => {
    expect(parseGeoapifySuggestions(null)).toEqual([]);
    expect(parseGeoapifySuggestions({ results: "not-an-array" })).toEqual([]);
  });
});
