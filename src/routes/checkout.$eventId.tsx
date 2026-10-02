import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  CreditCard,
  ShieldCheck,
  Check,
  Clock,
  MapPin,
  CalendarDays,
  Compass,
  Navigation,
  QrCode,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { AppleLogo, GoogleG } from "@/components/pay-icons";
import { getEvent, formatDate, formatPrice, type DirectionId, type ServiceId } from "@/lib/tickets-data";
import { summarise, directionLabel, fixtureFor, type CheckoutSearch, type BookingSummary } from "@/lib/booking";
import type { Journey } from "@/components/booking-panel";

const DIRS: DirectionId[] = ["north", "south", "west", "east"];

export const Route = createFileRoute("/checkout/$eventId")({
  validateSearch: (s: Record<string, unknown>): CheckoutSearch => ({
    service: s.service === "parking" || s.service === "pudo" ? (s.service as ServiceId) : undefined,
    fixture: typeof s.fixture === "string" ? s.fixture : undefined,
    direction: DIRS.includes(s.direction as DirectionId) ? (s.direction as DirectionId) : undefined,
    product: typeof s.product === "string" ? s.product : undefined,
    qty: Math.min(4, Math.max(1, Number(s.qty) || 1)),
    journey: ["both", "drop-off", "pick-up"].includes(String(s.journey)) ? (s.journey as Journey) : undefined,
    badge: s.badge === true || s.badge === "true" ? true : undefined,
  }),
  loader: ({ params }) => {
    const event = getEvent(params.eventId);
    if (!event) throw notFound();
    return { event };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `Checkout: ${loaderData.event.name}` }, { name: "robots", content: "noindex" }]
      : [],
  }),
  component: CheckoutPage,
  errorComponent: ({ error }) => <div className="p-8">{error.message}</div>,
  notFoundComponent: () => <div className="p-8">Event not found</div>,
});

function CheckoutPage() {
  const { event } = Route.useLoaderData();
  const search = Route.useSearch();
  const [step, setStep] = useState<1 | 2>(1);
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [reg, setReg] = useState("");
  const [orderRef] = useState(() => `OK27-${Math.floor(100000 + Math.random() * 900000)}`);

  const [secondsLeft, setSecondsLeft] = useState(10 * 60);
  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [done]);
  const mmss = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;
  const timeLow = secondsLeft <= 120;

  useEffect(() => {
    if (done) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [done]);

  const fixture = fixtureFor(search.fixture);
  const qty = search.qty ?? 1;
  const summary = summarise({ productId: search.product ?? null, direction: search.direction ?? null, qty });
  const isPudo = summary?.product.service === "pudo";
  const isTaxi = summary?.product.id === "taxi";
  const free = (summary?.total ?? 0) === 0;
  const passWord = qty === 1 ? "pass" : "passes";
  const journeyLabel =
    search.journey === "drop-off" ? "Drop-off only" : search.journey === "pick-up" ? "Pick-up only" : "Drop-off & pick-up";

  const backLink = (
    <Link
      to="/"
      className="flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors"
    >
      <ChevronLeft className="size-3.5" />
      Back to booking
    </Link>
  );

  if (!summary || !fixture) {
    return (
      <div className="min-h-screen bg-white">
        <SiteHeader containerClassName="max-w-5xl px-4" back={backLink} />
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-2">Nothing selected yet</h1>
          <p className="text-muted-foreground mb-6">
            Choose Parking or PUDO, your date and where you&apos;re travelling from to continue.
          </p>
          <Link
            to="/"
            className="inline-flex bg-accent-blue text-white font-medium px-5 py-3 rounded-xl"
          >
            Back to booking
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-surface">
        <SiteHeader containerClassName="max-w-5xl px-4" back={backLink} />
        <div className="max-w-lg mx-auto px-4 py-14 sm:py-20">
          <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04),0_16px_40px_-16px_rgba(16,24,40,0.14)]">
            <div className="mx-auto mb-5 grid place-items-center size-20 rounded-full bg-success/10">
              <div className="size-16 rounded-full bg-success/15 grid place-items-center motion-safe:animate-in motion-safe:zoom-in-75 motion-safe:fade-in motion-safe:duration-500">
                <Check className="size-8 text-success" strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">You&apos;re booked in!</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Your {summary.product.name} {passWord} and route directions are on their way to{" "}
              <span className="font-semibold text-foreground">{email || "your email"}</span>.
            </p>

            {/* Pass */}
            <div className="rounded-xl border border-border overflow-hidden text-left mb-6">
              <div className="px-4 py-3 text-white flex items-center justify-between gap-3" style={{ background: summary.product.colour }}>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-white/80">
                    {isPudo ? "PUDO pass" : "Parking pass"}
                  </p>
                  <p className="font-bold leading-tight truncate">{summary.product.name}</p>
                </div>
                <QrCode className="size-10 shrink-0 opacity-90" />
              </div>
              <div className="p-4 grid grid-cols-2 gap-3 text-sm bg-white">
                <PassFact label="Show date" value={formatDate(fixture.date)} />
                <PassFact label="Opens" value={`${fixture.carParksOpen} (TBC)`} />
                <PassFact label={isPudo ? "Location" : "Entry"} value={summary.gate} />
                <PassFact label="Vehicle" value={reg ? reg.toUpperCase() : isTaxi ? "Any licensed taxi" : "-"} />
              </div>
              <div className="px-4 py-3 border-t border-border bg-surface text-sm">
                <p className="flex items-center gap-1.5 font-semibold mb-1" style={{ color: summary.route.colour }}>
                  <Navigation className="size-3.5" /> Follow the {summary.route.name}
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">{summary.arrive}</p>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border bg-white px-4 py-2.5 text-sm">
                <span className="text-muted-foreground">
                  {qty} {passWord} · {orderRef}
                </span>
                <span className="font-bold tabular-nums">{formatPrice(summary.total)}</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Add your pass to your wallet
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                <button
                  type="button"
                  className="h-11 px-4 bg-black text-white rounded-lg flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition"
                >
                  <AppleLogo />
                  <span className="text-sm font-medium">Add to Apple Wallet</span>
                </button>
                <button
                  type="button"
                  className="h-11 px-4 bg-black text-white rounded-lg flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition"
                >
                  <GoogleG />
                  <span className="text-sm font-medium">Add to Google Wallet</span>
                </button>
              </div>
            </div>

            <Link
              to="/"
              className="w-full inline-flex items-center justify-center bg-accent-blue text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-accent-blue/25 hover:opacity-90 transition"
            >
              Book another night
            </Link>
          </div>

          <p className="flex items-center justify-center gap-1.5 mt-5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-success" />
            We&apos;ll send live route updates on the day by SMS.
          </p>
        </div>
      </div>
    );
  }

  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (email !== confirmEmail) {
      setEmailError("Email addresses do not match.");
      return;
    }
    setEmailError("");
    if (free) setDone(true);
    else setStep(2);
  };

  return (
    <div className="min-h-screen bg-surface pb-12">
      <SiteHeader containerClassName="max-w-5xl px-4" back={backLink} cartCount={qty} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <StepIndicator step={1} label="Your details" active={step === 1} completed={step > 1} />
          {!free && (
            <>
              <div
                className={`w-8 sm:w-12 h-0.5 rounded-full mx-2 sm:mx-3 transition-colors ${step > 1 ? "bg-success" : "bg-border"}`}
              />
              <StepIndicator step={2} label="Payment" active={step === 2} completed={false} />
            </>
          )}
          <span className="ml-auto pl-4 text-sm text-muted-foreground whitespace-nowrap hidden sm:block">
            Step <span className="font-semibold text-foreground">{step}</span> of {free ? 1 : 2}
          </span>
        </div>

        <div className="-mt-3 mb-6">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              timeLow ? "border-orange-200 bg-orange-50 text-orange-700" : "border-border bg-white text-muted-foreground"
            }`}
          >
            <Clock className={`size-3.5 shrink-0 ${timeLow ? "animate-pulse" : ""}`} />
            Space held for
            <span className="tabular-nums font-semibold text-foreground">{mmss}</span>
          </span>
        </div>

        <div className="grid md:grid-cols-[1fr_340px] gap-6">
          <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_16px_40px_-16px_rgba(16,24,40,0.14)]">
            {step === 1 ? (
              <>
                {!free && (
                  <>
                    <p className="text-sm font-semibold text-center mb-4">Express checkout</p>
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <button
                        type="button"
                        aria-label="Pay with Apple Pay"
                        onClick={() => setDone(true)}
                        className="h-12 bg-black text-white rounded-full flex items-center justify-center gap-1 hover:opacity-90 transition"
                      >
                        <AppleLogo className="h-[18px] w-auto fill-current" />
                        <span className="text-[17px] font-medium">Pay</span>
                      </button>
                      <button
                        type="button"
                        aria-label="Pay with Google Pay"
                        onClick={() => setDone(true)}
                        className="h-12 bg-white border border-[#dadce0] rounded-full flex items-center justify-center gap-1.5 hover:bg-surface transition"
                      >
                        <GoogleG className="size-[19px]" />
                        <span className="text-[17px] font-medium text-[#5f6368]">Pay</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs font-medium text-muted-foreground">OR</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  </>
                )}
                <h1 className="text-2xl font-bold mb-1">Your details</h1>
                <p className="text-sm text-muted-foreground mb-6">
                  We&apos;ll send your {passWord} and live route updates here.
                </p>
                <form onSubmit={submitDetails} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="First name" name="firstName" placeholder="Liam" required />
                    <Field label="Last name" name="lastName" placeholder="Smith" required />
                    <Field
                      label="Email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
                    />
                    <Field
                      label="Confirm email"
                      name="confirmEmail"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail((e.target as HTMLInputElement).value)}
                    />
                    <Field label="Mobile (for on-the-day updates)" name="phone" type="tel" placeholder="+44 7000 000000" required />
                    <Field label="Home postcode" name="postcode" placeholder="SG1 2AX" required />
                    {!isTaxi && (
                      <Field
                        label={isPudo ? "Driver's vehicle registration" : "Vehicle registration"}
                        name="reg"
                        placeholder="AB12 CDE"
                        required={!isPudo}
                        value={reg}
                        onChange={(e) => setReg((e.target as HTMLInputElement).value)}
                        className="uppercase"
                      />
                    )}
                    <Field label="Concert ticket order no. (optional)" name="ticketRef" placeholder="e.g. 12-34567/UK" />
                  </div>
                  {search.badge && summary.product.id === "accessible" && (
                    <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <input type="checkbox" required className="mt-0.5 size-4" />
                      I hold a valid Blue Badge and will display it on arrival.
                    </label>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Your postcode helps us plan traffic across the road network. It isn&apos;t used for marketing.
                  </p>
                  {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                  <button
                    type="submit"
                    className="group w-full bg-accent-blue text-white font-semibold py-3.5 rounded-xl mt-2 flex items-center justify-center gap-2 shadow-lg shadow-accent-blue/25 hover:opacity-90 transition"
                  >
                    {free ? "Confirm free pass" : "Continue to payment"}
                    <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold mb-1">Payment</h1>
                <p className="text-sm text-muted-foreground mb-6">Enter your card details.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setDone(true);
                  }}
                  className="space-y-4"
                >
                  <label className="block">
                    <FieldLabel label="Card number" />
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        name="card"
                        placeholder="4242 4242 4242 4242"
                        className="w-full h-11 bg-surface border border-border rounded-lg pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
                      />
                    </div>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Expiry" name="exp" placeholder="mm/yy" />
                    <Field label="CVC" name="cvc" placeholder="•••" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-success font-medium">
                    <ShieldCheck className="size-3.5" />
                    Encrypted end-to-end · We never store card details
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-accent-blue text-white font-semibold py-3.5 rounded-xl mt-1 flex items-center justify-center gap-2 shadow-lg shadow-accent-blue/25 hover:opacity-90 transition"
                  >
                    <Lock className="size-4" />
                    Pay <span className="tabular-nums">{formatPrice(summary.total)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-sm text-muted-foreground py-1.5 flex items-center justify-center gap-1 hover:text-foreground transition-colors"
                  >
                    <ChevronLeft className="size-3.5" />
                    Back to your details
                  </button>
                </form>
              </>
            )}
          </div>

          <OrderSummary
            eventName={event.name}
            image={event.heroImage ?? event.image}
            date={formatDate(fixture.date)}
            opens={fixture.carParksOpen}
            direction={directionLabel(search.direction)}
            summary={summary}
            qty={qty}
            journey={isPudo ? journeyLabel : undefined}
          />
        </div>
      </div>
    </div>
  );
}

function OrderSummary({
  eventName,
  image,
  date,
  opens,
  direction,
  summary,
  qty,
  journey,
}: {
  eventName: string;
  image: string;
  date: string;
  opens: string;
  direction: string;
  summary: BookingSummary;
  qty: number;
  journey?: string;
}) {
  return (
    <aside>
      <div className="md:sticky md:top-24 bg-white border border-border rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.04),0_16px_40px_-16px_rgba(16,24,40,0.14)]">
        <div className="relative h-28">
          <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          <p className="absolute inset-x-0 bottom-0 p-4 font-bold text-sm leading-tight text-white line-clamp-2">
            {eventName}
          </p>
        </div>

        <div className="px-5 py-4 border-b border-border space-y-2">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0 text-foreground/50" />
            {date} · opens {opens} (TBC)
          </p>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Compass className="size-3.5 shrink-0 text-foreground/50" />
            {direction}
          </p>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0 text-foreground/50" />
            {summary.gate}
          </p>
          <p className="flex items-center gap-2 text-xs font-semibold" style={{ color: summary.route.colour }}>
            <Navigation className="size-3.5 shrink-0" />
            {summary.route.name}
          </p>
        </div>

        <div className="p-5">
          <div className="mb-5 pb-5 border-b border-border">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-md bg-surface border border-border text-xs font-semibold tabular-nums">
                  {qty}
                </span>
                <span className="size-3 rounded-[4px]" style={{ background: summary.product.colour }} />
                {summary.product.name}
              </span>
              <span className="font-medium tabular-nums">{formatPrice(summary.subtotal)}</span>
            </div>
            {journey && <p className="text-xs text-muted-foreground mt-1.5 pl-8">{journey}</p>}
          </div>
          <div className="space-y-2 text-sm">
            <Row label="Subtotal" value={formatPrice(summary.subtotal)} />
            <Row label="Booking fee" value={summary.fee ? formatPrice(summary.fee) : "£0.00"} muted />
            <div className="pt-3 mt-2 border-t border-border flex items-baseline justify-between font-bold">
              <span>Total</span>
              <span className="text-lg tabular-nums">{formatPrice(summary.total)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-success font-medium">
            <ShieldCheck className="size-3.5" />
            Secure checkout · Instant e-pass delivery
          </div>
        </div>
      </div>
    </aside>
  );
}

function PassFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">{label}</p>
      <p className="font-semibold text-sm leading-snug">{value}</p>
    </div>
  );
}

function StepIndicator({
  step,
  label,
  active,
  completed,
}: {
  step: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`size-7 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors ${
          completed
            ? "bg-success text-white"
            : active
              ? "bg-accent-blue text-white"
              : "border-2 border-border text-muted-foreground"
        }`}
      >
        {completed ? <Check className="size-3.5" strokeWidth={3} /> : step}
      </div>
      <span className={`text-sm font-medium whitespace-nowrap ${active ? "text-foreground" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  );
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
      {label}
      {required && <span className="text-accent-blue"> *</span>}
    </span>
  );
}

function Field({
  label,
  onChange,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <FieldLabel label={label} required={props.required} />
      <input
        {...props}
        onChange={onChange}
        className={`w-full h-11 bg-surface border border-border rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all ${className}`}
      />
    </label>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={`flex justify-between ${muted ? "text-muted-foreground" : ""}`}>
      <span>{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}
