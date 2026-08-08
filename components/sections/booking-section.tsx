import { BookingForm } from "@/components/sections/booking-form";

export function BookingSection() {
  return (
    <section
      id="booking"
      className="border-b border-fg/10 px-5 py-14 content:px-14 content:py-20"
    >
      <div className="grid grid-cols-1 gap-8 content:grid-cols-[280px_1fr] content:gap-12">
        <h2 className="font-display text-[32px] uppercase text-fg">
          Tell me what you&apos;re planning.
        </h2>
        <BookingForm />
      </div>
    </section>
  );
}
