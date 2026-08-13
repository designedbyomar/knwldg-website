import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { StatsStrip } from "@/components/sections/stats-strip";
import { EventsGrid } from "@/components/sections/events-grid";
import { CapabilitiesGallery } from "@/components/sections/capabilities-gallery";
import { GenrePanel } from "@/components/sections/genre-panel";
import { BookingSection } from "@/components/sections/booking-section";

export default function Home() {
  return (
    <>
      <Nav />
      {/* tabIndex={-1} is load-bearing: without it several browsers scroll to
          the target but leave keyboard focus behind, which is the exact failure
          the skip link exists to fix. */}
      <main id="main-content" tabIndex={-1} className="outline-none">
        <Hero />
        <StatsStrip />
        <EventsGrid />
        <CapabilitiesGallery />
        <GenrePanel />
        <BookingSection />
      </main>
      <Footer />
    </>
  );
}
