"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import {
  formatLocationSuggestionsAvailable,
  LOCATION_AUTOCOMPLETE_COPY,
} from "@/data/booking-copy";
import {
  GEOAPIFY_ATTRIBUTION_URL,
  OPENSTREETMAP_ATTRIBUTION_URL,
  buildGeoapifyAutocompleteUrl,
  parseGeoapifySuggestions,
  type LocationSuggestion,
} from "@/lib/geoapify";
import { cn } from "@/lib/utils";

type LocationAutocompleteProps = {
  id: string;
  value: string;
  onChange: (value: string, suggestion?: LocationSuggestion) => void;
  onBlur: () => void;
  className?: string;
  invalid?: boolean;
  describedBy?: string;
  apiKey?: string;
};

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 400;

export function LocationAutocomplete({
  id,
  value,
  onChange,
  onBlur,
  className,
  invalid,
  describedBy,
  apiKey,
}: LocationAutocompleteProps) {
  const listboxId = useId();
  const suppressNextQuery = useRef(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requestFailed, setRequestFailed] = useState(false);

  useEffect(() => {
    if (suppressNextQuery.current) {
      suppressNextQuery.current = false;
      return;
    }

    const query = value.trim();
    if (!apiKey || query.length < MIN_QUERY_LENGTH) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      setRequestFailed(false);

      try {
        const response = await fetch(buildGeoapifyAutocompleteUrl(query, apiKey), {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("Geoapify autocomplete request failed");

        const payload: unknown = await response.json();
        setSuggestions(parseGeoapifySuggestions(payload));
        setActiveIndex(-1);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSuggestions([]);
        setRequestFailed(true);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [apiKey, value]);

  const expanded = isFocused && suggestions.length > 0;

  function selectSuggestion(suggestion: LocationSuggestion) {
    suppressNextQuery.current = true;
    setSuggestions([]);
    setActiveIndex(-1);
    onChange(suggestion.formatted, suggestion);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    if (!expanded) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    }
  }

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        value={value}
        className={className}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listboxId}
        aria-activedescendant={
          expanded && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
        }
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(event) => {
          setSuggestions([]);
          setActiveIndex(-1);
          setIsLoading(false);
          setRequestFailed(false);
          onChange(event.target.value);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          setActiveIndex(-1);
          onBlur();
        }}
        onKeyDown={handleKeyDown}
      />

      {expanded ? (
        <div className="absolute left-0 right-0 top-full z-40 border border-fg/15 bg-bg shadow-[0_18px_60px_rgb(0_0_0/0.65)]">
          <ul
            id={listboxId}
            role="listbox"
            aria-label={LOCATION_AUTOCOMPLETE_COPY.suggestionsLabel}
          >
            {suggestions.map((suggestion, index) => (
              <li key={suggestion.placeId} role="presentation">
                <button
                  id={`${listboxId}-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  className={cn(
                    "block w-full border-b border-fg/10 px-4 py-3 text-left transition-colors last:border-b-0",
                    index === activeIndex
                      ? "bg-violet text-ink"
                      : "bg-bg text-fg hover:bg-violet/15"
                  )}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSuggestion(suggestion)}
                >
                  <span className="block font-ui text-xs font-semibold">{suggestion.primary}</span>
                  <span
                    className={cn(
                      "mt-1 block font-body text-[11px] leading-snug",
                      index === activeIndex ? "text-ink/65" : "text-fg/50"
                    )}
                  >
                    {suggestion.secondary}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-x-1.5 px-4 py-2 font-ui text-[9px] tracking-[0.04em] text-fg/45">
            <a
              href={OPENSTREETMAP_ATTRIBUTION_URL}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-violet"
            >
              {LOCATION_AUTOCOMPLETE_COPY.openStreetMapAttribution}
            </a>
            <span aria-hidden="true">·</span>
            <a
              href={GEOAPIFY_ATTRIBUTION_URL}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-violet"
            >
              {LOCATION_AUTOCOMPLETE_COPY.geoapifyAttribution}
            </a>
          </div>
        </div>
      ) : null}

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {isLoading
          ? LOCATION_AUTOCOMPLETE_COPY.loadingStatus
          : expanded
            ? formatLocationSuggestionsAvailable(suggestions.length)
            : requestFailed
              ? LOCATION_AUTOCOMPLETE_COPY.unavailableStatus
              : ""}
      </div>

      {apiKey ? (
        <p className="mt-1.5 w-full font-ui text-[9px] tracking-[0.04em] text-fg/40">
          {requestFailed
            ? LOCATION_AUTOCOMPLETE_COPY.unavailableHelper
            : LOCATION_AUTOCOMPLETE_COPY.helper}
        </p>
      ) : null}
    </div>
  );
}
