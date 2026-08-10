import { BookingForm } from "@/components/sections/booking-form";
import { Reveal } from "@/components/ui/reveal";
import { Container } from "@/components/layout/container";

export function BookingSection() {
  return (
    <section id="booking" className="border-b border-fg/10">
      <Container className="px-5 py-20 content:px-14 content:py-28">
        <Reveal className="grid grid-cols-1 gap-8 content:grid-cols-[280px_1fr] content:gap-12">
          <h2 className="font-display text-[32px] uppercase text-fg">
            Tell me what you&apos;re planning.
          </h2>
          <BookingForm />
        </Reveal>
      </Container>
    </section>
  );
}
