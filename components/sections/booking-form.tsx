"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema, type BookingFormValues } from "@/lib/validations/booking-schema";
import { EVENT_TYPE_OPTIONS, BUDGET_OPTIONS } from "@/data/budget-options";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { getBusinessTodayIso } from "@/lib/business-date";
import { cn } from "@/lib/utils";

const labelClasses =
  "block font-ui text-[11px] uppercase tracking-[0.06em] text-fg/50 mb-2.5";
const inputClasses =
  "w-full border-0 border-b-2 border-fg/15 bg-transparent pb-2.5 font-body text-sm text-fg outline-none transition-colors focus-visible:border-magenta focus:border-magenta";

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClasses}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-magenta">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function BookingForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [renderedAt] = useState(() => Date.now());
  const [minDateIso] = useState(() => getBusinessTodayIso());
  const isSubmitting = status === "submitting";

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { company: "", eventDate: "", venue: "", venuePlaceId: "" },
  });

  async function onSubmit(data: BookingFormValues) {
    setStatus("submitting");
    setErrorMessage("");
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, formRenderedAt: renderedAt }),
      });
      if (!res.ok) {
        const responseBody: unknown = await res.json().catch(() => null);
        const serverMessage =
          responseBody &&
          typeof responseBody === "object" &&
          "error" in responseBody &&
          typeof responseBody.error === "string"
            ? responseBody.error
            : null;

        if ((res.status === 429 || res.status === 503) && serverMessage) {
          setErrorMessage(serverMessage);
        } else {
          setErrorMessage(
            "Something went wrong sending that. Try again, or email hello@djknwldg.com directly."
          );
        }
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setErrorMessage(
        "Something went wrong sending that. Try again, or email hello@djknwldg.com directly."
      );
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="max-w-[600px] border border-fg/15 px-8 py-10"
      >
        <div className="font-display text-2xl uppercase text-fg">Got it.</div>
        <p className="mt-3 font-body text-sm leading-relaxed text-fg/65">
          Your inquiry is in. Expect a reply within 24 hours &mdash; usually much sooner.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-busy={isSubmitting}
      className="max-w-[600px]"
    >
      <fieldset disabled={isSubmitting} className="contents">
      {/* Honeypot — hidden from sighted users, left for bots to fill. */}
      <div className="absolute h-px w-px overflow-hidden opacity-0" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" type="text" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      <div className="mb-5.5 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
        <Field id="name" label="Name" error={errors.name?.message}>
          <input id="name" type="text" className={inputClasses} {...register("name")} />
        </Field>
        <Field id="email" label="Email" error={errors.email?.message}>
          <input id="email" type="email" className={inputClasses} {...register("email")} />
        </Field>
        <Field id="phone" label="Phone" error={errors.phone?.message}>
          <input id="phone" type="tel" className={inputClasses} {...register("phone")} />
        </Field>
        <Field id="eventType" label="Event Type" error={errors.eventType?.message}>
          <select id="eventType" className={inputClasses} defaultValue="" {...register("eventType")}>
            <option value="" disabled>
              Select one
            </option>
            {EVENT_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field id="eventDate" label="Event Date" error={errors.eventDate?.message}>
          <Controller
            name="eventDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                id="eventDate"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={Boolean(errors.eventDate)}
                describedBy={errors.eventDate ? "eventDate-error" : undefined}
                minDateIso={minDateIso}
              />
            )}
          />
        </Field>
        <Field id="venue" label="Venue / City / Address" error={errors.venue?.message}>
          <Controller
            name="venue"
            control={control}
            render={({ field }) => (
              <LocationAutocomplete
                id="venue"
                value={field.value ?? ""}
                onChange={(value, suggestion) => {
                  field.onChange(value);
                  setValue("venuePlaceId", suggestion?.placeId ?? "", { shouldDirty: true });
                }}
                onBlur={field.onBlur}
                className={inputClasses}
                invalid={Boolean(errors.venue)}
                describedBy={errors.venue ? "venue-error" : undefined}
                apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}
              />
            )}
          />
          <input type="hidden" {...register("venuePlaceId")} />
        </Field>
        <Field id="guestCount" label="Guest Count" error={errors.guestCount?.message}>
          <input id="guestCount" type="text" className={inputClasses} {...register("guestCount")} />
        </Field>
        <Field id="servicesNeeded" label="Services Needed" error={errors.servicesNeeded?.message}>
          <input
            id="servicesNeeded"
            type="text"
            className={inputClasses}
            {...register("servicesNeeded")}
          />
        </Field>
      </div>

      <fieldset className="mb-7">
        <legend className={labelClasses}>Budget</legend>
        <Controller
          name="budget"
          control={control}
          render={({ field }) => (
            <div role="radiogroup" aria-label="Budget" className="flex flex-wrap gap-2.5">
              {BUDGET_OPTIONS.map((option) => (
                <Chip
                  key={option}
                  as="button"
                  variant="interactive"
                  role="radio"
                  aria-checked={field.value === option}
                  selected={field.value === option}
                  onClick={() => field.onChange(option)}
                >
                  {option}
                </Chip>
              ))}
            </div>
          )}
        />
      </fieldset>

      <Field id="eventDetails" label="Event Details" error={errors.eventDetails?.message}>
        <textarea
          id="eventDetails"
          rows={3}
          className={cn(inputClasses, "resize-none pb-3")}
          {...register("eventDetails")}
        />
      </Field>

      </fieldset>

      <div aria-live="polite" aria-atomic="true">
        {status === "error" ? (
          <p className="mt-5 font-ui text-xs text-magenta">{errorMessage}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className={cn("mt-8 px-8 py-3.5 text-[13px]", isSubmitting && "opacity-60")}
      >
        {isSubmitting ? "Sending..." : "Request Availability"}
      </Button>
    </form>
  );
}
