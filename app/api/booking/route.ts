import { NextResponse } from "next/server";
import { bookingSchema, type BookingFormValues } from "@/lib/validations/booking-schema";
import { getResendClient } from "@/lib/resend";

// Submissions faster than this are almost certainly automated, not a human
// filling out an 8-field form.
const MIN_SUBMIT_MS = 1200;

const TO_EMAIL = process.env.BOOKING_TO_EMAIL ?? "hello@djknwldg.com";
const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL ?? "KNWLDG Bookings <onboarding@resend.dev>";

function formatBookingEmail(data: BookingFormValues): string {
  const lines = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : null,
    `Event type: ${data.eventType}`,
    `Event date: ${data.eventDate}`,
    data.venue ? `Venue / City: ${data.venue}` : null,
    data.guestCount ? `Guest count: ${data.guestCount}` : null,
    data.servicesNeeded ? `Services needed: ${data.servicesNeeded}` : null,
    data.budget ? `Budget: ${data.budget}` : null,
    data.eventDetails ? `\nDetails:\n${data.eventDetails}` : null,
  ];
  return lines.filter((line): line is string => Boolean(line)).join("\n");
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  const data = parsed.data;

  // Honeypot and submit-speed checks: pretend success without sending so bots
  // don't learn anything from the response, but real users never trip these.
  const isHoneypotFilled = Boolean(data.company);
  const isTooFast =
    data.formRenderedAt !== undefined && Date.now() - data.formRenderedAt < MIN_SUBMIT_MS;
  if (isHoneypotFilled || isTooFast) {
    return NextResponse.json({ ok: true });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured; booking email not sent.", data);
    return NextResponse.json({ error: "Booking service not configured" }, { status: 500 });
  }

  try {
    await getResendClient().emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: data.email,
      subject: `New booking inquiry - ${data.name} (${data.eventType})`,
      text: formatBookingEmail(data),
    });
  } catch (error) {
    console.error("Failed to send booking email", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
