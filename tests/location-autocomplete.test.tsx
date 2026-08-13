// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import type { LocationSuggestion } from "@/lib/geoapify";

const results = [
  {
    place_id: "venue-1",
    name: "The Society Room of Hartford",
    formatted: "The Society Room of Hartford, 31 Pratt Street, Hartford, CT 06103",
    address_line2: "31 Pratt Street, Hartford, CT 06103",
  },
  {
    place_id: "venue-2",
    name: "Infinity Music Hall",
    formatted: "Infinity Music Hall, 32 Front Street, Hartford, CT 06103",
    address_line2: "32 Front Street, Hartford, CT 06103",
  },
];

function responseWith(payload: unknown): Response {
  return {
    ok: true,
    json: vi.fn().mockResolvedValue(payload),
  } as unknown as Response;
}

function ControlledAutocomplete({
  onSelection,
  onBlur = vi.fn(),
}: {
  onSelection?: (suggestion?: LocationSuggestion) => void;
  onBlur?: () => void;
}) {
  const [value, setValue] = useState("");

  return (
    <LocationAutocomplete
      id="event-location"
      value={value}
      apiKey="test-key"
      onBlur={onBlur}
      onChange={(nextValue, suggestion) => {
        setValue(nextValue);
        onSelection?.(suggestion);
      }}
    />
  );
}

async function enterQuery(query = "Hartford") {
  const input = screen.getByRole("combobox", { name: "" });
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: query } });

  await act(async () => {
    await vi.advanceTimersByTimeAsync(400);
  });

  return input;
}

describe("LocationAutocomplete interactions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("announces loading and available results, then supports keyboard selection", async () => {
    let resolveRequest!: (response: Response) => void;
    const request = new Promise<Response>((resolve) => {
      resolveRequest = resolve;
    });
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(request));
    const onSelection = vi.fn();

    render(<ControlledAutocomplete onSelection={onSelection} />);
    const input = await enterQuery();

    expect(screen.getByRole("status")).toHaveTextContent("Finding locations");

    await act(async () => {
      resolveRequest(responseWith({ results }));
      await request;
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      "2 location suggestions available"
    );
    expect(
      screen.getByRole("link", { name: "© OpenStreetMap contributors" })
    ).toHaveAttribute("href", "https://www.openstreetmap.org/copyright");
    expect(screen.getByRole("link", { name: "Powered by Geoapify" })).toHaveAttribute(
      "href",
      "https://www.geoapify.com/"
    );
    expect(screen.getAllByRole("link")).toHaveLength(2);
    expect(input).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    const firstOption = screen.getByRole("option", {
      name: /The Society Room of Hartford/,
    });
    expect(firstOption).toHaveAttribute("aria-selected", "true");
    expect(input).toHaveAttribute("aria-activedescendant", firstOption.id);

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(input).toHaveValue(results[0].formatted);
    expect(onSelection).toHaveBeenLastCalledWith(
      expect.objectContaining({ placeId: "venue-1", formatted: results[0].formatted })
    );
    expect(input).toHaveAttribute("aria-expanded", "false");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("cancels an in-flight request when the query changes", async () => {
    const signals: AbortSignal[] = [];
    const fetchMock = vi.fn((_url: string | URL | Request, init?: RequestInit) => {
      const signal = init?.signal;
      if (!signal) throw new Error("Expected an abort signal");
      signals.push(signal);

      return new Promise<Response>((_resolve, reject) => {
        signal.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<ControlledAutocomplete />);
    const input = await enterQuery("Hartford");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fireEvent.change(input, { target: { value: "Hartford Marriott" } });

    expect(signals[0].aborted).toBe(true);
    expect(screen.getByRole("status")).toHaveTextContent("");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(signals[1].aborted).toBe(false);
  });

  it("closes results on Escape and blur while preserving typed text", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(responseWith({ results })));
    const onBlur = vi.fn();

    render(<ControlledAutocomplete onBlur={onBlur} />);
    const input = await enterQuery();

    expect(input).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveValue("Hartford");

    fireEvent.change(input, { target: { value: "Hartford CT" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(input).toHaveAttribute("aria-expanded", "true");

    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledOnce();
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveValue("Hartford CT");
  });

  it("allows mouse selection without triggering the input blur handler", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(responseWith({ results })));
    const onBlur = vi.fn();
    const onSelection = vi.fn();

    render(<ControlledAutocomplete onBlur={onBlur} onSelection={onSelection} />);
    await enterQuery();

    const option = screen.getByRole("option", { name: /Infinity Music Hall/ });
    expect(fireEvent.mouseDown(option)).toBe(false);
    fireEvent.click(option);

    expect(onBlur).not.toHaveBeenCalled();
    expect(onSelection).toHaveBeenLastCalledWith(
      expect.objectContaining({ placeId: "venue-2" })
    );
    expect(screen.getByRole("combobox")).toHaveValue(results[1].formatted);
  });

  it("announces request failures and keeps manual form submission available", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const submitted = vi.fn();

    function ManualEntryForm() {
      const [value, setValue] = useState("");
      return (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitted(value);
          }}
        >
          <label htmlFor="manual-location">Location</label>
          <LocationAutocomplete
            id="manual-location"
            value={value}
            apiKey="test-key"
            onBlur={vi.fn()}
            onChange={setValue}
          />
          <button type="submit">Send inquiry</button>
        </form>
      );
    }

    render(<ManualEntryForm />);
    const input = screen.getByRole("combobox", { name: "Location" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "My backyard in New Haven" } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Location suggestions are unavailable. Continue entering the location manually."
    );
    expect(screen.getByText("Suggestions unavailable; manual entry still works.")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Send inquiry" }));

    expect(submitted).toHaveBeenCalledWith("My backyard in New Haven");
  });
});
