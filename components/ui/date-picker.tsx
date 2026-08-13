"use client";

import * as React from "react";
import { format, isValid, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  id: string;
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
  describedBy?: string;
  minDateIso?: string;
};

export function DatePicker({
  id,
  value,
  onChange,
  onBlur,
  invalid,
  describedBy,
  minDateIso,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const parsedDate = value ? parseISO(value) : undefined;
  const selectedDate = parsedDate && isValid(parsedDate) ? parsedDate : undefined;
  const parsedMinDate = minDateIso ? parseISO(minDateIso) : undefined;
  const minDate = parsedMinDate && isValid(parsedMinDate) ? parsedMinDate : undefined;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) onBlur?.();
  }

  function handleSelect(date: Date | undefined) {
    if (!date || (minDate && date < minDate)) return;
    onChange(format(date, "yyyy-MM-dd"));
    setOpen(false);
    onBlur?.();
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          aria-describedby={describedBy}
          data-invalid={invalid || undefined}
          className={cn(
            "flex w-full items-center justify-between border-0 border-b-2 border-fg/15 bg-transparent pb-2.5 text-left font-body text-sm outline-none transition-colors hover:border-fg/30 focus-visible:border-magenta",
            // /50 is the muted-text floor: 5.28:1 on black. /45 measured
            // 4.41:1 and failed 1.4.3 by a hair. See DESIGN.md > Colors.
            selectedDate ? "text-fg" : "text-fg/50",
            invalid && "border-magenta"
          )}
        >
          <span>{selectedDate ? format(selectedDate, "MMM d, yyyy") : "Select a date"}</span>
          <CalendarIcon aria-hidden className="size-4 text-violet" strokeWidth={1.8} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" aria-label="Choose event date">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={minDate ? { before: minDate } : undefined}
          startMonth={minDate}
          defaultMonth={selectedDate && (!minDate || selectedDate >= minDate) ? selectedDate : minDate}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
