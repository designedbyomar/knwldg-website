import { Resend } from "resend";

let client: Resend | null = null;

// Resend's constructor throws immediately if given no API key, so this stays
// lazy - the route only calls it after confirming RESEND_API_KEY is set.
export function getResendClient(): Resend {
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}
