import { NextResponse } from "next/server";
import { checkBookingRateLimit } from "@/lib/booking-rate-limit";
import { bookingSchema, type BookingFormValues } from "@/lib/validations/booking-schema";
import { getResendClient } from "@/lib/resend";

export const runtime = "nodejs";

// Submissions faster than this are almost certainly automated, not a human
// filling out an 8-field form.
const MIN_SUBMIT_MS = 1200;

const RATE_LIMIT_ERROR = "Too many booking attempts. Please try again later.";
const SERVICE_UNAVAILABLE_ERROR =
  "Booking service is temporarily unavailable. Please try again later.";

function formatBookingEmail(data: BookingFormValues): string {
  const lines = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : null,
    `Event type: ${data.eventType}`,
    `Event date: ${data.eventDate}`,
    data.venue ? `Venue / City: ${data.venue}` : null,
    data.venuePlaceId ? `Geoapify place ID: ${data.venuePlaceId}` : null,
    data.guestCount ? `Guest count: ${data.guestCount}` : null,
    data.servicesNeeded ? `Services needed: ${data.servicesNeeded}` : null,
    data.budget ? `Budget: ${data.budget}` : null,
    data.eventDetails ? `\nDetails:\n${data.eventDetails}` : null,
  ];
  return lines.filter((line): line is string => Boolean(line)).join("\n");
}

export async function POST(request: Request) {
  const rateLimit = await checkBookingRateLimit(request);

  if (rateLimit.outcome === "unavailable") {
    return NextResponse.json(
      { error: SERVICE_UNAVAILABLE_ERROR },
      { status: 503, headers: rateLimit.headers }
    );
  }

  if (rateLimit.outcome === "limited") {
    return NextResponse.json(
      { error: RATE_LIMIT_ERROR },
      { status: 429, headers: rateLimit.headers }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400, headers: rateLimit.headers }
    );
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid submission" },
      { status: 400, headers: rateLimit.headers }
    );
  }

  const data = parsed.data;

  // Honeypot and submit-speed checks: pretend success without sending so bots
  // don't learn anything from the response, but real users never trip these.
  const isHoneypotFilled = Boolean(data.company);
  const isTooFast =
    data.formRenderedAt !== undefined && Date.now() - data.formRenderedAt < MIN_SUBMIT_MS;
  if (isHoneypotFilled || isTooFast) {
    return NextResponse.json({ ok: true }, { headers: rateLimit.headers });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.BOOKING_FROM_EMAIL;
  const toEmail = process.env.BOOKING_TO_EMAIL;
  if (!apiKey || !fromEmail || !toEmail) {
    console.error("[booking] email configuration is unavailable");
    return NextResponse.json(
      { error: SERVICE_UNAVAILABLE_ERROR },
      { status: 503, headers: rateLimit.headers }
    );
  }

  try {
    await getResendClient().emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: data.email,
      subject: `New booking inquiry - ${data.name} (${data.eventType})`,
      text: formatBookingEmail(data),
    });
  } catch {
    console.error("[booking] email provider request failed");
    return NextResponse.json(
      { error: "Failed to send booking inquiry" },
      { status: 500, headers: rateLimit.headers }
    );
  }

  return NextResponse.json({ ok: true }, { headers: rateLimit.headers });
}
