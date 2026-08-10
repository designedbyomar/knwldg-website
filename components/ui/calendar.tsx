"use client";

import * as React from "react";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayPicker, getDefaultClassNames, type DayButton } from "react-day-picker";
import { cn } from "@/lib/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  components,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn(
        "group/calendar bg-bg p-3 font-ui text-fg [--cell-size:2.75rem]",
        className
      )}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-3", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex h-(--cell-size) items-center justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          "flex size-(--cell-size) items-center justify-center text-fg/70 transition-colors hover:bg-violet/15 hover:text-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magenta/70 disabled:pointer-events-none disabled:opacity-25",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          "flex size-(--cell-size) items-center justify-center text-fg/70 transition-colors hover:bg-violet/15 hover:text-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magenta/70 disabled:pointer-events-none disabled:opacity-25",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-(--cell-size) items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        caption_label: cn(
          "text-xs font-semibold uppercase tracking-[0.08em] text-fg",
          defaultClassNames.caption_label
        ),
        dropdowns: cn(
          "flex h-(--cell-size) items-center justify-center gap-1.5 text-xs font-semibold",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative border border-fg/20 focus-within:border-magenta",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn("absolute inset-0 bg-bg opacity-0", defaultClassNames.dropdown),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex size-(--cell-size) items-center justify-center text-[10px] font-medium uppercase tracking-[0.08em] text-fg/40 select-none",
          defaultClassNames.weekday
        ),
        week: cn("mt-1 flex w-full", defaultClassNames.week),
        day: cn(
          "relative size-(--cell-size) p-0 text-center select-none",
          defaultClassNames.day
        ),
        outside: cn("text-fg/30", defaultClassNames.outside),
        disabled: cn("pointer-events-none opacity-25", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...iconProps }) => {
          if (orientation === "left") {
            return <ChevronLeftIcon className={cn("size-4", className)} {...iconProps} />;
          }
          if (orientation === "right") {
            return <ChevronRightIcon className={cn("size-4", className)} {...iconProps} />;
          }
          return <ChevronDownIcon className={cn("size-4", className)} {...iconProps} />;
        },
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <button
      ref={ref}
      type="button"
      data-day={day.date.toLocaleDateString()}
      className={cn(
        "flex size-(--cell-size) items-center justify-center text-xs text-fg transition-colors hover:bg-violet/15 hover:text-violet focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magenta/70",
        modifiers.today && !modifiers.selected && "text-orchid underline decoration-orchid/70 underline-offset-4",
        modifiers.outside && "text-fg/30",
        modifiers.disabled && "pointer-events-none opacity-25",
        modifiers.selected && "bg-violet font-semibold text-ink hover:bg-violet hover:text-ink",
        className
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
