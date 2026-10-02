import { useState } from "react";
import {
  Car,
  CarTaxiFront,
  Check,
  Accessibility,
  AlertTriangle,
  Sparkles,
  MapPin,
  Loader2,
  LocateFixed,
  Search,
} from "lucide-react";
import {
  lookupOrigin,
  milesTo,
  milesBetween,
  directionFrom,
  VENUE,
  formatMiles,
  type Origin,
} from "@/lib/geo";
import {
  directions,
  parkingProducts,
  pudoProducts,
  recommendedParking,
  pudoRoute,
  routes,
  formatDayMonth,
  formatPrice,
  type DirectionId,
  type Fixture,
  type Product,
  type ServiceId,
} from "@/lib/tickets-data";

export type Journey = "both" | "drop-off" | "pick-up";

export type BookingState = {
  service: ServiceId | null;
  fixtureId: string | null;
  direction: DirectionId | null;
  blueBadge: boolean;
  productId: string | null;
  qty: number;
  journey: Journey;
  /** Where the customer said they're travelling from (postcode / town / GPS). */
  origin: Origin | null;
};

export const initialBooking: BookingState = {
  service: null,
  fixtureId: null,
  direction: null,
  blueBadge: false,
  productId: null,
  qty: 1,
  journey: "both",
  origin: null,
};

type Props = {
  fixtures: Fixture[];
  state: BookingState;
  onChange: (next: BookingState) => void;
  /** Called after the customer picks a direction of travel. */
  onDirectionPick?: () => void;
};

export function BookingPanel({ fixtures, state, onChange, onDirectionPick }: Props) {
  const set = (patch: Partial<BookingState>) => onChange({ ...state, ...patch });

  const step2 = state.service !== null;
  const step3 = step2 && state.fixtureId !== null;
  const step4 = step3 && state.direction !== null;

  return (
    <div className="space-y-8">
      {/* 1. Service */}
      <Step n={1} title="How are you getting there?" done={step2}>
        <div className="grid grid-cols-2 gap-2">
          <ServiceCard
            active={state.service === "parking"}
            onClick={() => set({ service: "parking", productId: null })}
            icon={<Car className="size-5" />}
            title="Parking"
            text="On-site or Park & Walk"
          />
          <ServiceCard
            active={state.service === "pudo"}
            onClick={() => set({ service: "pudo", productId: null, blueBadge: false })}
            icon={<CarTaxiFront className="size-5" />}
            title="PUDO"
            text="Pick Up / Drop Off"
          />
        </div>
      </Step>

      {/* 2. Date */}
      <Step n={2} title="Which night are you attending?" done={step3} disabled={!step2}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {fixtures.map((f) => {
            const active = state.fixtureId === f.id;
            const soldOut = f.status === "sold-out";
            return (
              <button
                key={f.id}
                type="button"
                disabled={!step2 || soldOut}
                onClick={() => set({ fixtureId: f.id })}
                className={`relative text-left rounded-xl border px-3 py-2.5 transition-all cursor-pointer disabled:cursor-not-allowed ${
                  active
                    ? "border-accent-blue bg-accent-blue/5 ring-2 ring-accent-blue/20"
                    : "border-border hover:border-foreground/30"
                } ${soldOut ? "opacity-40" : ""}`}
              >
                <p className="text-sm font-semibold">{formatDayMonth(f.date)}</p>
                <p
                  className={`text-[11px] font-medium mt-0.5 ${
                    f.status === "selling-fast"
                      ? "text-warning"
                      : soldOut
                        ? "text-danger"
                        : "text-success"
                  }`}
                >
                  {f.status === "selling-fast"
                    ? "Selling fast"
                    : soldOut
                      ? "Sold out"
                      : "Available"}
                </p>
              </button>
            );
          })}
        </div>
      </Step>

      {/* 3. Direction */}
      <Step n={3} title="Where are you travelling from?" done={step4} disabled={!step3}>
        <OriginLookup
          disabled={!step3}
          origin={state.origin}
          onFound={(origin) => {
            set({ origin, direction: origin.direction, productId: null });
            onDirectionPick?.();
          }}
          onClear={() => set({ origin: null })}
        />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mt-4 mb-2">
          {state.origin
            ? "Your approach (change if you're taking a different road)"
            : "Or pick your direction"}
        </p>
        <div className="grid sm:grid-cols-2 gap-2">
          {directions.map((d) => {
            const active = state.direction === d.id;
            return (
              <button
                key={d.id}
                type="button"
                disabled={!step3}
                onClick={() => {
                  set({ direction: d.id, productId: null });
                  onDirectionPick?.();
                }}
                className={`w-full flex items-start gap-3 text-left rounded-xl border px-3 py-2.5 transition-all cursor-pointer disabled:cursor-not-allowed ${
                  active
                    ? "border-accent-blue bg-accent-blue/5 ring-2 ring-accent-blue/20"
                    : "border-border hover:border-foreground/30"
                }`}
              >
                <span
                  className={`size-6 mt-px rounded-full grid place-items-center text-[11px] font-bold shrink-0 ${
                    active
                      ? "bg-accent-blue text-white"
                      : "bg-surface border border-border text-muted-foreground"
                  }`}
                  aria-hidden
                >
                  {d.id[0].toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{d.label}</span>
                  <span className="block text-xs font-medium text-foreground/70">{d.roads}</span>
                  <span className="block text-xs text-muted-foreground truncate">{d.from}</span>
                </span>
              </button>
            );
          })}
          {state.service === "parking" && (
            <label
              className={`sm:col-span-2 flex items-center gap-2.5 rounded-xl border border-dashed px-3 py-2.5 text-sm cursor-pointer ${
                !step3 ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={state.blueBadge}
                onChange={(e) => set({ blueBadge: e.target.checked, productId: null })}
                className="size-4 accent-[var(--accent-blue)]"
              />
              <Accessibility className="size-4 text-sky-600" />I have a Blue Badge
            </label>
          )}
        </div>
      </Step>

      {/* 4. Option */}
      <Step
        n={4}
        title={state.service === "pudo" ? "Choose your drop-off option" : "Choose your car park"}
        done={!!state.productId}
        disabled={!step4}
      >
        {step4 && state.service === "parking" && state.direction && (
          <ParkingOptions state={state} set={set} />
        )}
        {step4 && state.service === "pudo" && state.direction && (
          <PudoOptions state={state} set={set} />
        )}
        {!step4 && (
          <p className="text-xs text-muted-foreground">
            Pick a date and your direction of travel. We'll match you to the car park or drop-off
            area on your route.
          </p>
        )}
      </Step>
    </div>
  );
}

function ParkingOptions({
  state,
  set,
}: {
  state: BookingState;
  set: (p: Partial<BookingState>) => void;
}) {
  const rec = recommendedParking(state.direction!, state.blueBadge);
  const available = parkingProducts.filter((p) => !p.requiresBlueBadge || state.blueBadge);
  const best = rec.map((id) => available.find((p) => p.id === id)!).filter(Boolean);
  const others = available.filter((p) => !rec.includes(p.id));
  const origin = state.origin;
  const dist = (id: string) => (origin ? milesTo(origin, id) : null);
  const nearest = origin
    ? [...available].sort((a, b) => (dist(a.id) ?? Infinity) - (dist(b.id) ?? Infinity))[0]
    : undefined;

  return (
    <div className="space-y-4">
      {origin && nearest && (
        <div className="rounded-xl bg-surface border border-border px-3 py-2.5 text-xs leading-relaxed">
          <p className="flex items-center gap-1.5 font-semibold text-foreground">
            <MapPin className="size-3.5 text-accent-blue" /> From {origin.label}
          </p>
          <p className="text-muted-foreground mt-0.5">
            Closest car park as the crow flies:{" "}
            <span className="font-semibold text-foreground">{nearest.name}</span> (
            {formatMiles(dist(nearest.id)!)}).
            {best[0] && best[0].id !== nearest.id && (
              <>
                {" "}
                We recommend <span className="font-semibold text-foreground">
                  {best[0].name}
                </span>{" "}
                because it's signed along your approach road, so it's usually the quicker drive in
                and out.
              </>
            )}
          </p>
        </div>
      )}
      <div>
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-success mb-2">
          <Sparkles className="size-3.5" /> Best for your route
        </p>
        <div className="space-y-2">
          {best.map((p, i) => (
            <OptionCard
              key={p.id}
              product={p}
              state={state}
              set={set}
              badge={i === 0 ? "Recommended" : undefined}
              miles={dist(p.id)}
              closest={p.id === nearest?.id}
            />
          ))}
        </div>
      </div>
      <details className="group">
        <summary className="text-xs font-semibold text-muted-foreground cursor-pointer select-none list-none flex items-center gap-1">
          <span className="group-open:rotate-90 transition-transform">▸</span> Other car parks (
          {others.length})
        </summary>
        <p className="flex gap-1.5 text-[11px] text-warning mt-2 mb-2">
          <AlertTriangle className="size-3.5 shrink-0 mt-px" />
          These are signed from a different direction. Expect a longer drive in and out.
        </p>
        <div className="space-y-2">
          {others.map((p) => (
            <OptionCard
              key={p.id}
              product={p}
              state={state}
              set={set}
              miles={dist(p.id)}
              closest={p.id === nearest?.id}
            />
          ))}
        </div>
      </details>
      {state.productId && <QtyRow state={state} set={set} label="Vehicles" max={4} />}
    </div>
  );
}

function PudoOptions({
  state,
  set,
}: {
  state: BookingState;
  set: (p: Partial<BookingState>) => void;
}) {
  const r = routes[pudoRoute(state.direction!)];
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        All drop-offs are off-site in Stevenage. Coming{" "}
        {state.direction === "north" || state.direction === "west"
          ? "from the north/west"
          : "from the south/east"}
        , your driver follows the{" "}
        <span className="font-semibold" style={{ color: r.colour }}>
          {r.name}
        </span>
        .
      </p>
      <div className="space-y-2">
        {pudoProducts.map((p) => (
          <OptionCard
            key={p.id}
            product={p}
            state={state}
            set={set}
            miles={state.origin ? milesTo(state.origin, p.id) : null}
          />
        ))}
      </div>
      {state.productId && (
        <>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Journey
            </p>
            <div className="grid grid-cols-3 gap-1 p-1 bg-surface border border-border rounded-xl">
              {(["drop-off", "pick-up", "both"] as Journey[]).map((j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => set({ journey: j })}
                  className={`rounded-lg py-1.5 text-xs font-semibold capitalize transition cursor-pointer ${
                    state.journey === j
                      ? "bg-white shadow-sm text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {j === "both" ? "Both" : j.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>
          <QtyRow state={state} set={set} label="Vehicles" max={4} />
        </>
      )}
    </div>
  );
}

function OptionCard({
  product,
  state,
  set,
  badge,
  miles,
  closest,
}: {
  product: Product;
  state: BookingState;
  set: (p: Partial<BookingState>) => void;
  badge?: string;
  miles?: number | null;
  closest?: boolean;
}) {
  const active = state.productId === product.id;
  return (
    <button
      type="button"
      onClick={() => set({ productId: product.id, qty: Math.max(1, state.qty) })}
      className={`w-full flex items-start gap-3 text-left rounded-xl border p-3 transition-all cursor-pointer ${
        active
          ? "border-accent-blue bg-accent-blue/5 ring-2 ring-accent-blue/20"
          : "border-border hover:border-foreground/30"
      }`}
    >
      <span
        className="mt-0.5 size-4 rounded-[5px] shrink-0 border border-black/10"
        style={{ background: product.colour }}
        aria-hidden
      />
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold">{product.name}</span>
          {badge && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-success bg-success/10 rounded-full px-1.5 py-0.5">
              {badge}
            </span>
          )}
          {closest && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-accent-blue bg-accent-blue/10 rounded-full px-1.5 py-0.5">
              Closest to you
            </span>
          )}
          {product.service === "parking" && product.provisional && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-warning bg-warning/10 rounded-full px-1.5 py-0.5">
              Provisional
            </span>
          )}
        </span>
        <span className="block text-xs text-muted-foreground mt-0.5">
          {product.service === "parking" ? `${product.location} · ${product.short}` : product.short}
          {miles != null && (
            <span className="font-medium text-foreground/70"> · {formatMiles(miles)} away</span>
          )}
        </span>
      </span>
      <span className="text-right shrink-0">
        <span className="block text-sm font-bold text-accent-blue">
          {formatPrice(product.price)}
        </span>
        <span className="block text-[10px] text-muted-foreground">{product.unit}</span>
      </span>
      {active && <Check className="size-4 text-accent-blue shrink-0 mt-0.5" />}
    </button>
  );
}

function QtyRow({
  state,
  set,
  label,
  max,
}: {
  state: BookingState;
  set: (p: Partial<BookingState>) => void;
  label: string;
  max: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => set({ qty: Math.max(1, state.qty - 1) })}
          disabled={state.qty <= 1}
          className="size-8 border border-border rounded-full flex items-center justify-center text-lg disabled:opacity-30 hover:border-accent-blue transition-colors cursor-pointer"
          aria-label="Remove vehicle"
        >
          −
        </button>
        <span className="w-5 text-center font-bold tabular-nums text-sm">{state.qty}</span>
        <button
          type="button"
          onClick={() => set({ qty: Math.min(max, state.qty + 1) })}
          disabled={state.qty >= max}
          className="size-8 border border-border rounded-full flex items-center justify-center text-lg disabled:opacity-30 hover:border-accent-blue transition-colors cursor-pointer"
          aria-label="Add vehicle"
        >
          +
        </button>
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  done,
  disabled,
  children,
}: {
  n: number;
  title: string;
  done?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={disabled ? "opacity-45" : ""} aria-disabled={disabled}>
      <h4 className="flex items-center gap-2.5 text-base font-semibold mb-3">
        <span
          className={`size-6 rounded-full grid place-items-center text-xs font-bold shrink-0 ${
            done ? "bg-success text-white" : "bg-foreground text-white"
          }`}
        >
          {done ? <Check className="size-3" strokeWidth={3} /> : n}
        </span>
        {title}
      </h4>
      {children}
    </section>
  );
}

function ServiceCard({
  active,
  onClick,
  icon,
  title,
  text,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all cursor-pointer ${
        active
          ? "border-accent-blue bg-accent-blue/5 ring-2 ring-accent-blue/20"
          : "border-border hover:border-foreground/30"
      }`}
    >
      <span className={active ? "text-accent-blue" : "text-muted-foreground"}>{icon}</span>
      <span className="text-sm font-bold">{title}</span>
      <span className="text-[11px] text-muted-foreground leading-tight">{text}</span>
    </button>
  );
}

const DIRECTION_WORD = {
  north: "the North",
  south: "the South",
  east: "the East",
  west: "the West",
} as const;

function OriginLookup({
  disabled,
  origin,
  onFound,
  onClear,
}: {
  disabled?: boolean;
  origin: Origin | null;
  onFound: (o: Origin) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<"search" | "gps" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || busy) return;
    setBusy("search");
    setError(null);
    try {
      const o = await lookupOrigin(query);
      if (o) onFound(o);
      else
        setError("We couldn't find that. Try a full UK postcode (e.g. SW1A 1AA) or a town name.");
    } catch {
      setError("Postcode lookup isn't responding. Pick your direction below instead.");
    } finally {
      setBusy(null);
    }
  };

  const locate = () => {
    if (!navigator.geolocation || busy) return;
    setBusy("gps");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        onFound({
          ...p,
          label: "your current location",
          miles: milesBetween(p, VENUE),
          direction: directionFrom(p),
        });
        setBusy(null);
      },
      () => {
        setError("We couldn't get your location. Enter a postcode instead.");
        setBusy(null);
      },
      { timeout: 10000, maximumAge: 300000 },
    );
  };

  return (
    <div>
      <form onSubmit={search} className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Postcode or town you're travelling from</span>
          <MapPin
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            aria-hidden
          />
          <input
            type="text"
            inputMode="text"
            autoComplete="postal-code"
            placeholder="Postcode or town, e.g. SG1 2AX"
            value={query}
            disabled={disabled}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-white pl-9 pr-3 py-2.5 text-sm uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue disabled:cursor-not-allowed"
          />
        </label>
        <button
          type="submit"
          disabled={disabled || !query.trim() || !!busy}
          className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-white px-4 text-sm font-semibold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          {busy === "search" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
          Find
        </button>
      </form>
      <button
        type="button"
        onClick={locate}
        disabled={disabled || !!busy}
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-blue hover:underline disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
      >
        {busy === "gps" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <LocateFixed className="size-3.5" />
        )}
        Use my current location
      </button>
      {error && (
        <p className="flex gap-1.5 text-xs text-danger mt-2" role="alert">
          <AlertTriangle className="size-3.5 shrink-0 mt-px" /> {error}
        </p>
      )}
      {origin && !error && (
        <p className="flex items-start gap-1.5 text-xs text-success mt-2" role="status">
          <Check className="size-3.5 shrink-0 mt-px" strokeWidth={3} />
          <span>
            <span className="font-semibold">{origin.label}</span> is about{" "}
            {formatMiles(origin.miles)} from Knebworth, so you'll be arriving from{" "}
            {DIRECTION_WORD[origin.direction]}.{" "}
            <button
              type="button"
              onClick={onClear}
              className="underline text-muted-foreground cursor-pointer"
            >
              Clear
            </button>
          </span>
        </p>
      )}
    </div>
  );
}
