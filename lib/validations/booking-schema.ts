import { z } from "zod";
import { BUDGET_OPTIONS } from "@/data/budget-options";
import { EVENT_TYPE_OPTIONS } from "@/data/budget-options";

const eventTypeTuple = EVENT_TYPE_OPTIONS as [string, ...string[]];
const budgetTuple = BUDGET_OPTIONS as [string, ...string[]];

export const bookingSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  eventType: z.enum(eventTypeTuple, { message: "Select an event type" }),
  eventDate: z.string().trim().min(1, "Event date is required"),
  venue: z.string().trim().max(160).optional().or(z.literal("")),
  guestCount: z.string().trim().max(20).optional().or(z.literal("")),
  servicesNeeded: z.string().trim().max(300).optional().or(z.literal("")),
  budget: z.enum(budgetTuple).optional(),
  eventDetails: z.string().trim().max(2000).optional().or(z.literal("")),
  // Honeypot: accepts any value so a filled field doesn't surface as a visible
  // validation error (which would tip bots off) - the route silently drops
  // the submission instead when this is non-empty.
  company: z.string().optional(),
  // Client-set timestamp used server-side to reject submissions sent implausibly fast.
  formRenderedAt: z.number().optional(),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
