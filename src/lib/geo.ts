import type { DirectionId } from "@/lib/tickets-data";

/*
 * Postcode / town lookup and distance helpers.
 * Geocoding uses postcodes.io (free, no API key, CORS enabled, UK only).
 */

export type LatLng = { lat: number; lng: number };

export type Origin = LatLng & {
  /** What we matched, e.g. "SW1A 1AA · Westminster" or "Hitchin". */
  label: string;
  /** Straight-line miles to the venue. */
  miles: number;
  /** Approach direction derived from the compass bearing. */
  direction: DirectionId;
};

/** Knebworth Park arena (approx.). */
export const VENUE: LatLng = { lat: 51.8735, lng: -0.2135 };

/**
 * Approximate car-park locations. PLACEHOLDERS: replace with surveyed
 * coordinates from the Transport & Travel Plan before launch.
 */
export const CAR_PARK_COORDS: Record<string, LatLng> = {
  red: { lat: 51.8795, lng: -0.2125 },
  green: { lat: 51.8675, lng: -0.2135 },
  white: { lat: 51.8745, lng: -0.2285 },
  campervan: { lat: 51.8765, lng: -0.2305 },
  accessible: { lat: 51.8705, lng: -0.2225 },
  purple: { lat: 51.8965, lng: -0.1775 },
  grey: { lat: 51.9025, lng: -0.2025 },
  // PUDO
  taxi: { lat: 51.8985, lng: -0.2105 },
  "private-hire": { lat: 51.8935, lng: -0.2075 },
  family: { lat: 51.8935, lng: -0.2075 },
};

const toRad = (d: number) => (d * Math.PI) / 180;

export function milesBetween(a: LatLng, b: LatLng): number {
  const R = 3958.8;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Compass bearing (0 = north) from `from` to `to`. */
export function bearing(from: LatLng, to: LatLng): number {
  const y = Math.sin(toRad(to.lng - from.lng)) * Math.cos(toRad(to.lat));
  const x =
    Math.cos(toRad(from.lat)) * Math.sin(toRad(to.lat)) -
    Math.sin(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.cos(toRad(to.lng - from.lng));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/**
 * Which approach someone uses, based on where they are relative to the venue.
 * Sectors are tuned to the road network rather than a plain N/E/S/W split:
 *   North 340–25°  A1(M) southbound (Peterborough, Huntingdon, the North)
 *   East   25–150° A10 / A602 (Cambridge, Ware, Hertford, Essex)
 *   South 150–225° A1(M) northbound (London, M25, Welwyn)
 *   West  225–340° B656 via Hitchin (Luton, Bedford, M1)
 *   ...except 310–340° beyond 60 miles, which is A1(M) traffic (North).
 */
export function directionFrom(origin: LatLng): DirectionId {
  const b = bearing(VENUE, origin);
  if (b >= 340 || b < 25) return "north";
  // Long-distance traffic from the north-west (Leeds, Sheffield, the North East)
  // comes down the A1(M), not through Hitchin.
  if (b >= 310 && milesBetween(VENUE, origin) > 60) return "north";
  if (b < 150) return "east";
  if (b < 225) return "south";
  return "west";
}

export function milesTo(origin: LatLng, productId: string): number | null {
  const c = CAR_PARK_COORDS[productId];
  return c ? milesBetween(origin, c) : null;
}

export const formatMiles = (m: number) => (m < 10 ? `${m.toFixed(1)} mi` : `${Math.round(m)} mi`);

const API = "https://api.postcodes.io";
const FULL_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
const OUTCODE = /^[A-Z]{1,2}\d[A-Z\d]?$/i;

async function getJson(url: string) {
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("lookup-failed");
  return res.json();
}

/** Resolve a UK postcode, postcode district (e.g. "SG1") or town name. */
export async function lookupOrigin(raw: string): Promise<Origin | null> {
  const q = raw.trim();
  if (!q) return null;

  let hit: { lat: number; lng: number; label: string } | null = null;

  if (FULL_POSTCODE.test(q)) {
    const j = await getJson(`${API}/postcodes/${encodeURIComponent(q.replace(/\s+/g, ""))}`);
    const r = j?.result;
    if (r?.latitude != null)
      hit = {
        lat: r.latitude,
        lng: r.longitude,
        label: `${r.postcode} · ${r.admin_district ?? r.region ?? ""}`.trim(),
      };
  } else if (OUTCODE.test(q)) {
    const j = await getJson(`${API}/outcodes/${encodeURIComponent(q)}`);
    const r = j?.result;
    if (r?.latitude != null) {
      const area = Array.isArray(r.admin_district) ? r.admin_district[0] : r.admin_district;
      hit = {
        lat: r.latitude,
        lng: r.longitude,
        label: `${r.outcode.toUpperCase()}${area ? ` · ${area}` : ""}`,
      };
    }
  }

  if (!hit) {
    const j = await getJson(`${API}/places?q=${encodeURIComponent(q)}&limit=5`);
    const list: {
      name_1: string;
      county_unitary?: string;
      region?: string;
      latitude: number;
      longitude: number;
      local_type?: string;
    }[] = j?.result ?? [];
    // Prefer towns/cities/villages over hamlets or other features with the same name.
    const rank = (t?: string) =>
      t === "City" ? 0 : t === "Town" ? 1 : t === "Village" ? 2 : t === "Suburban Area" ? 3 : 4;
    // Exact name matches first ("Brighton" before "New Brighton"), then bigger places.
    const exact = (n: string) => (n.toLowerCase() === q.toLowerCase() ? 0 : 1);
    const r = [...list].sort(
      (a, b) => exact(a.name_1) - exact(b.name_1) || rank(a.local_type) - rank(b.local_type),
    )[0];
    if (r)
      hit = {
        lat: r.latitude,
        lng: r.longitude,
        label: [r.name_1, r.county_unitary ?? r.region].filter(Boolean).join(", "),
      };
  }

  if (!hit) return null;
  return { ...hit, miles: milesBetween(hit, VENUE), direction: directionFrom(hit) };
}
