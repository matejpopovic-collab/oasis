/** The event booking page. Rendered at "/" (homepage) and at /events/$eventId. */
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  CalendarDays,
  MapPin,
  Car,
  CarTaxiFront,
  Footprints,
  Navigation,
  LogOut,
  Route as RouteIcon,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TrustBadges } from "@/components/trust-badges";
import { TravelMap } from "@/components/travel-map";
import { BookingPanel, initialBooking, type BookingState } from "@/components/booking-panel";
import { type Event, formatPrice, formatDayMonth, pudoRoute, recommendedParking, getProduct, routes } from "@/lib/tickets-data";
import { summarise, toSearch, fixtureFor } from "@/lib/booking";

export function EventPage({ event }: { event: Event }) {
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingState>(initialBooking);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const summary = summarise(booking);
  const ready = !!summary && !!booking.fixtureId;

  // What the map should emphasise, even before a product is chosen.
  const recommended = booking.direction ? getProduct(recommendedParking(booking.direction, booking.blueBadge)[0]) : undefined;
  const previewRoute =
    summary?.route.id ??
    (booking.direction
      ? booking.service === "pudo"
        ? pudoRoute(booking.direction)
        : recommended && recommended.service === "parking"
          ? recommended.route
          : null
      : null);
  const previewZone = summary?.product.zone ?? (booking.service === "parking" ? recommended?.zone : null) ?? null;

  const goCheckout = () => {
    if (!ready) return;
    navigate({ to: "/checkout/$eventId", params: { eventId: event.id }, search: toSearch(booking) });
  };

  const [title, subtitle] = event.name.split(" - ");
  const firstFixture = event.fixtures[0];
  const lastFixture = event.fixtures[event.fixtures.length - 1];
  const fixture = fixtureFor(booking.fixtureId);

  const ctaLabel = !booking.service
    ? "Choose Parking or PUDO"
    : !booking.fixtureId
      ? "Pick a date"
      : !booking.direction
        ? "Tell us where you're coming from"
        : !booking.productId
          ? booking.service === "parking"
            ? "Choose a car park"
            : "Choose a drop-off option"
          : "Continue to checkout";

  return (
    <div className="min-h-screen bg-surface pb-28 lg:pb-0">
      <SiteHeader containerClassName="max-w-6xl px-4" cartCount={ready ? booking.qty : 0} />

      {/* Hero */}
      <section className="relative w-full overflow-hidden bg-black">
        {/* Photo sits on the right; black on the left carries the text */}
        <div className="absolute inset-y-0 right-0 w-full md:w-[62%] lg:w-[58%]">
          <img
            src={event.heroImage ?? event.image}
            alt=""
            width={1581}
            height={1054}
            className="size-full object-cover object-[center_25%]"
          />
          {/* Fade the photo's left edge into the black */}
          <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-black via-black/30 via-35% to-transparent" />
          {/* Soft fade at the bottom where the planner card overlaps */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent via-40% to-transparent" />
          {/* On mobile the text sits over the photo, so darken it */}
          <div className="absolute inset-0 md:hidden bg-black/60" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24 md:pt-32 pb-36 md:pb-48">
          <div className="md:max-w-[46%] lg:max-w-[50%]">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm font-medium uppercase tracking-wider text-white/85 mb-4">
            <CalendarDays className="size-4 shrink-0" />
            {formatDayMonth(firstFixture.date)} – {formatDayMonth(lastFixture.date)} 2027 · 6 nights
            <MapPin className="size-4 shrink-0 ml-1" />
            {event.venue}
          </p>
          <h1>
            <span className="event-hero-title block">{title}</span>
            <span className="block mt-2 text-lg sm:text-2xl font-bold tracking-tight text-white">
              {subtitle} · Official Parking &amp; PUDO
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-sm sm:text-base leading-relaxed text-white/80">{event.tagline}</p>
          </div>
        </div>
      </section>

      {/* Journey planner: chooser + map across the full content width, overlapping the hero */}
      <section className="relative z-20 -mt-24 md:-mt-36 px-4 max-w-6xl mx-auto" aria-labelledby="planner-title">
        <div className="bg-white rounded-3xl border border-border shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] overflow-clip grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* Chooser */}
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-blue mb-2">Plan your journey</p>
            <h2 id="planner-title" className="text-2xl sm:text-3xl font-bold tracking-tight mb-1.5">
              Book parking or PUDO
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              Four quick choices and we&apos;ll put you on the route that gets you in and out fastest. One pass per
              vehicle, per show date.
            </p>
            <BookingPanel fixtures={event.fixtures} state={booking} onChange={setBooking} />
          </div>

          {/* Map, route and total, pinned beside the chooser on desktop */}
          <div className="bg-surface border-t lg:border-t-0 lg:border-l border-border p-6 sm:p-8 lg:p-10">
            <div className="lg:sticky lg:top-24">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <RouteIcon className="size-4 text-accent-blue" /> Your route to Knebworth
                </h3>
                {previewRoute && (
                  <span
                    className="text-[11px] font-bold uppercase tracking-wide text-white rounded-full px-2.5 py-1"
                    style={{ background: routes[previewRoute].colour }}
                  >
                    {routes[previewRoute].name}
                  </span>
                )}
              </div>
              <TravelMap activeRoute={previewRoute} activeZone={previewZone} direction={booking.direction} />

              {summary ? (
                <div className="mt-5 rounded-2xl border border-border bg-white overflow-hidden">
                  <div
                    className="px-4 py-2.5 text-white text-sm font-semibold flex items-center gap-2"
                    style={{ background: summary.route.colour }}
                  >
                    <Navigation className="size-4" />
                    {summary.product.name}: follow the {summary.route.name}
                  </div>
                  <div className="p-4 grid sm:grid-cols-3 gap-4">
                    <RouteFact icon={<Navigation className="size-3.5" />} label="Arriving" text={summary.arrive} />
                    <RouteFact
                      icon={<Footprints className="size-3.5" />}
                      label={summary.product.service === "parking" ? "Entry" : "Drop-off point"}
                      text={summary.gate}
                    />
                    <RouteFact icon={<LogOut className="size-3.5" />} label="Leaving" text={summary.depart} />
                  </div>
                </div>
              ) : (
                <p className="mt-5 rounded-2xl border border-dashed border-border bg-white/60 px-4 py-3.5 text-sm text-muted-foreground">
                  {booking.direction
                    ? "Choose an option to see your arrival, entry and exit directions."
                    : "Tell us where you're travelling from and your route will light up on the map."}
                </p>
              )}

              {/* Total + CTA (desktop; smaller screens use the sticky bar) */}
              <div className="hidden lg:flex items-center justify-between gap-6 mt-5 rounded-2xl bg-black text-white p-4 pl-5">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-white/60 truncate">
                    {summary && fixture
                      ? `${booking.qty} × ${summary.product.name} · ${formatDayMonth(fixture.date)}`
                      : "Parking from"}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">
                    {summary ? formatPrice(summary.subtotal) : formatPrice(15)}
                  </p>
                  {summary && summary.fee > 0 && (
                    <p className="text-[11px] text-white/60">+ {formatPrice(summary.fee)} booking fee</p>
                  )}
                </div>
                <button
                  onClick={goCheckout}
                  disabled={!ready}
                  className="shrink-0 bg-white text-black font-semibold px-5 py-3 rounded-xl hover:bg-white/90 transition flex items-center gap-1.5 disabled:bg-white/15 disabled:text-white/60 disabled:cursor-not-allowed text-sm"
                >
                  {ctaLabel}
                  {ready && <ChevronRight className="size-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supporting content */}
      <section className="px-4 max-w-6xl mx-auto pt-14 md:pt-20">
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          <ServiceExplainer
            icon={<Car className="size-5" />}
            title="Parking"
            text="On-site car parks (Red, Green, White and Accessible) plus off-site Park & Walk in Stevenage (Purple, Grey). Each has its own route and gate."
          />
          <ServiceExplainer
            icon={<CarTaxiFront className="size-5" />}
            title="Pick Up / Drop Off"
            text="Taxis at Gunnels Wood Road. Private hire and friends & family at 9 Yards Retail Park. All off-site in Stevenage, with a signed walk to the venue."
          />
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-10 mb-12">
          <div>
            <h2 className="font-bold text-xl mb-3">About parking at Knebworth &apos;27</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line mb-8">{event.description}</p>
            <div className="flex flex-col divide-y divide-border sm:grid sm:grid-cols-3 sm:gap-4 sm:divide-y-0 py-2 sm:py-6 border border-border bg-white rounded-xl px-5">
              <Fact label="Show dates" value="11–12, 18–19, 25–26 Sep" />
              <Fact label="Car parks open" value="12:00 (TBC)" />
              <Fact label="Egress target" value="2.5 hours" />
            </div>
          </div>
          <div className="bg-warning/10 border border-warning/30 rounded-2xl p-6 self-start">
            <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
              <AlertTriangle className="size-4 text-warning shrink-0" />
              Important information
            </h2>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
              <li>Pre-booked only. There is no pay-on-the-day parking or drop-off at the venue.</li>
              <li>Controlled Parking Zones will operate on residential streets. Unbooked vehicles will be turned away or fined.</li>
              <li>No taxis, private hire or drop-offs are permitted on site. All PUDO is in Stevenage.</li>
              <li>On show days the A1(M) J7 roundabout serves the venue only, with no through access to Stevenage.</li>
              <li>Follow the signed route for the car park on your pass, even if your sat-nav suggests another road.</li>
            </ul>
          </div>
        </div>

        <div className="max-w-3xl">
          <h2 className="font-bold text-xl mb-3">Frequently asked</h2>
          <div className="border-y border-border divide-y divide-border mb-8">
            {event.faq.map((f: { q: string; a: string }, i: number) => {
              const open = openFaq === i;
              return (
                <div key={i}>
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between py-4 text-left cursor-pointer"
                  >
                    <span className="font-medium text-sm">{f.q}</span>
                    <ChevronDown
                      className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  {open && <p className="text-sm text-muted-foreground pb-4 max-w-prose">{f.a}</p>}
                </div>
              );
            })}
          </div>

          <details className="border border-border rounded-xl p-4 bg-white">
            <summary className="font-medium text-sm cursor-pointer">Terms & conditions</summary>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{event.terms}</p>
          </details>
        </div>
      </section>

      <TrustBadges className="mt-16 bg-white" />
      <SiteFooter containerClassName="max-w-6xl px-4" />

      {/* Mobile / tablet sticky CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-border px-4 py-3 z-40 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase font-medium text-muted-foreground tracking-wider">
              {summary ? summary.product.name : "Parking from"}
            </p>
            <p className="text-xl font-bold text-accent-blue">
              {summary ? formatPrice(summary.subtotal) : formatPrice(15)}
            </p>
          </div>
          <button
            onClick={goCheckout}
            disabled={!ready}
            className="flex-1 bg-accent-blue text-white font-semibold py-3 rounded-xl disabled:opacity-40 flex items-center justify-center gap-1.5 text-sm"
          >
            {ready ? "Continue" : ctaLabel}
            {ready && <ChevronRight className="size-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceExplainer({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border p-5 bg-white">
      <div className="flex items-center gap-2 mb-2 text-accent-blue">
        {icon}
        <h3 className="font-bold text-sm text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}

function RouteFact({ icon, label, text }: { icon: React.ReactNode; label: string; text: string }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mb-1">
        {icon}
        {label}
      </p>
      <p className="text-xs leading-relaxed">{text}</p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 sm:block sm:py-0">
      <p className="text-[10px] uppercase font-medium text-muted-foreground tracking-wider sm:mb-1">{label}</p>
      <p className="text-base font-semibold text-right sm:text-left">{value}</p>
    </div>
  );
}
