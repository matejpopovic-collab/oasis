import { routes, type DirectionId, type RouteId } from "@/lib/tickets-data";

type Props = {
  /** Route to emphasise; others are dimmed. */
  activeRoute?: RouteId | null;
  /** Zone id (product.zone) to emphasise. */
  activeZone?: string | null;
  /** Direction the customer is arriving from. */
  direction?: DirectionId | null;
  className?: string;
};

/*
 * Schematic (not to scale) of the Knebworth / Stevenage road network as
 * described in the Proposed Transport & Travel Plan. A1(M) runs north-south
 * between Knebworth Park (west) and Stevenage (east).
 */
const ROUTE_PATHS: Record<RouteId, string> = {
  // A1(M) from north (J8) and south (J6) converging on J7, then west to Gate 1
  black: "M470 18 L470 260 M470 482 L470 260 L360 262",
  // Hitchin -> B656 south -> White (west)
  blue: "M150 18 L175 120 L200 215 L215 250",
  // Welwyn -> B656 north -> Accessible
  yellow: "M360 482 L300 420 L250 350",
  // A1(M) J8 -> A602 -> A1072 -> Stevenage grey zone
  grey: "M470 18 L470 110 L540 118 L590 150 L610 140",
  // A10 -> A602 -> Stevenage from the east -> Fairlands (purple)
  purple: "M782 482 L782 330 L720 300 L680 280 L645 270",
};

const PUDO_ZONES = ["taxi", "private-hire", "family"];
const ROUTE_END: Partial<Record<RouteId, [number, number]>> = { grey: [610, 140], purple: [645, 270] };

const ZONES: { id: string; label: string; x: number; y: number; w: number; h: number; colour: string }[] = [
  { id: "red", label: "Red", x: 290, y: 170, w: 78, h: 44, colour: "#dc2626" },
  { id: "green", label: "Green", x: 300, y: 300, w: 78, h: 44, colour: "#16a34a" },
  { id: "white", label: "White", x: 186, y: 222, w: 64, h: 40, colour: "#94a3b8" },
  { id: "campervan", label: "Camper", x: 150, y: 270, w: 64, h: 34, colour: "#64748b" },
  { id: "accessible", label: "Access.", x: 228, y: 318, w: 60, h: 34, colour: "#0ea5e9" },
  { id: "grey", label: "Grey P&W", x: 580, y: 118, w: 82, h: 36, colour: "#6b7280" },
  { id: "purple", label: "Purple P&W", x: 596, y: 256, w: 92, h: 36, colour: "#7c3aed" },
  { id: "taxi", label: "Taxi rank", x: 520, y: 170, w: 70, h: 30, colour: "#111827" },
  { id: "private-hire", label: "Hire A", x: 598, y: 196, w: 50, h: 28, colour: "#0891b2" },
  { id: "family", label: "Family B", x: 652, y: 196, w: 58, h: 28, colour: "#f59e0b" },
];

const ARRIVALS: Record<DirectionId, { x: number; y: number; label: string; anchor: "start" | "middle" | "end" }> = {
  north: { x: 470, y: 12, label: "▼ From the North · A1(M)", anchor: "middle" },
  south: { x: 470, y: 496, label: "▲ From the South · A1(M)", anchor: "middle" },
  west: { x: 20, y: 60, label: "From the West · Hitchin ▶", anchor: "start" },
  east: { x: 780, y: 496, label: "◀ From the East · A10", anchor: "end" },
};

export function TravelMap({ activeRoute, activeZone, direction, className = "" }: Props) {
  const dim = (r: RouteId) => (activeRoute && activeRoute !== r ? 0.18 : 1);
  const zoneDim = (z: string) => (activeZone && activeZone !== z ? 0.35 : 1);

  return (
    <figure className={className}>
      <svg
        viewBox="0 0 800 510"
        role="img"
        aria-label="Schematic map of the approach routes to Knebworth Park"
        className="w-full h-auto rounded-xl border border-border bg-[#f8fafc]"
      >
        {/* Stevenage town */}
        <ellipse cx="620" cy="200" rx="140" ry="110" fill="#e2e8f0" opacity="0.7" />
        <text x="700" y="110" fontSize="13" fontWeight="700" fill="#475569" letterSpacing="0.08em">
          STEVENAGE
        </text>

        {/* Knebworth Park estate */}
        <rect x="140" y="150" width="270" height="215" rx="28" fill="#dcfce7" opacity="0.8" />
        <text x="398" y="356" textAnchor="end" fontSize="12" fontWeight="700" fill="#166534" letterSpacing="0.08em">
          KNEBWORTH PARK
        </text>

        {/* Base road network */}
        <g stroke="#cbd5e1" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M470 18 L470 482" />
          <path d="M150 18 L215 250 L300 420 L360 482" />
          <path d="M470 110 L540 118 L620 150 L720 300 L782 330 L782 482" />
          <path d="M470 260 L560 250 L640 270" />
        </g>
        <g fontSize="11" fontWeight="600" fill="#64748b">
          <text x="480" y="60">A1(M)</text>
          <text x="112" y="100" transform="rotate(-75 112 100)">B656</text>
          <text x="690" y="250">A602</text>
          <text x="790" y="420" transform="rotate(90 790 420)">A10</text>
        </g>

        {/* Pedestrian walking route (Stevenage -> venue) */}
        <path
          d="M560 210 C 500 225, 430 235, 360 250"
          stroke="#0f172a"
          strokeWidth="2"
          strokeDasharray="4 5"
          fill="none"
          opacity={activeRoute === "grey" || activeRoute === "purple" ? 1 : 0.45}
        />
        <text x="505" y="240" fontSize="10" fill="#0f172a" opacity="0.7">
          walking route
        </text>

        {/* Coloured event routes */}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {(Object.keys(ROUTE_PATHS) as RouteId[]).map((r) => (
            <path
              key={r}
              d={ROUTE_PATHS[r]}
              stroke={routes[r].colour}
              strokeWidth={activeRoute === r ? 7 : 4}
              opacity={dim(r)}
              style={{ transition: "opacity .25s, stroke-width .25s" }}
            />
          ))}
        </g>

        {/* Junctions */}
        {[
          { y: 110, l: "J8" },
          { y: 260, l: "J7" },
          { y: 420, l: "J6" },
        ].map((j) => (
          <g key={j.l}>
            <circle cx="470" cy={j.y} r="11" fill="white" stroke="#334155" strokeWidth="2.5" />
            <text x="470" y={j.y + 4} fontSize="9" fontWeight="800" textAnchor="middle" fill="#334155">
              {j.l}
            </text>
          </g>
        ))}

        {/* Final leg from route end to the chosen PUDO zone */}
        {activeRoute && activeZone && PUDO_ZONES.includes(activeZone) && ROUTE_END[activeRoute] && (() => {
          const z = ZONES.find((zz) => zz.id === activeZone)!;
          const [x, y] = ROUTE_END[activeRoute]!;
          return (
            <path
              d={`M${x} ${y} L${z.x + z.w / 2} ${z.y + z.h / 2}`}
              stroke={routes[activeRoute].colour}
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
          );
        })()}

        {/* Arena */}
        <g>
          <circle cx="330" cy="258" r="26" fill="#0f172a" />
          <text x="330" y="262" fontSize="10" fontWeight="800" textAnchor="middle" fill="white">
            ARENA
          </text>
        </g>

        {/* Zones */}
        {ZONES.map((z) => {
          const on = activeZone === z.id;
          return (
            <g key={z.id} opacity={zoneDim(z.id)} style={{ transition: "opacity .25s" }}>
              <rect
                x={z.x}
                y={z.y}
                width={z.w}
                height={z.h}
                rx="8"
                fill={z.colour}
                stroke={on ? "#0f172a" : "white"}
                strokeWidth={on ? 3 : 2}
              />
              <text
                x={z.x + z.w / 2}
                y={z.y + z.h / 2 + 4}
                fontSize="10.5"
                fontWeight="700"
                textAnchor="middle"
                fill="white"
              >
                {z.label}
              </text>
            </g>
          );
        })}

        {/* Arrival labels */}
        {(Object.keys(ARRIVALS) as DirectionId[]).map((d) => {
          const a = ARRIVALS[d];
          const on = direction === d;
          return (
            <text
              key={d}
              x={a.x}
              y={a.y}
              fontSize="11"
              fontWeight={on ? 800 : 600}
              textAnchor={a.anchor}
              fill={on ? "#0f172a" : "#94a3b8"}
            >
              {a.label}
            </text>
          );
        })}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
        {(Object.keys(routes) as RouteId[]).map((r) => (
          <span key={r} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-1 w-5 rounded-full" style={{ background: routes[r].colour }} />
            {routes[r].name}
          </span>
        ))}
        <span className="ml-auto italic">Schematic, not to scale</span>
      </figcaption>
    </figure>
  );
}
