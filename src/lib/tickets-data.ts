import concertImg from "@/assets/event-concert.jpg";
import heroImg from "@/assets/hero-oasis.jpg";

/* ------------------------------------------------------------------ */
/*  Core types                                                         */
/* ------------------------------------------------------------------ */

export type Fixture = {
  id: string;
  date: string; // ISO (show day)
  carParksOpen: string; // e.g. "12:00"
  status: "available" | "selling-fast" | "sold-out";
};

export type ServiceId = "parking" | "pudo";

export type DirectionId = "north" | "south" | "west" | "east";

export type RouteId = "black" | "blue" | "yellow" | "grey" | "purple";

export type Direction = {
  id: DirectionId;
  label: string;
  roads: string; // main approach road(s)
  from: string; // example origins
};

export type TravelRoute = {
  id: RouteId;
  name: string;
  colour: string; // hex, matches the Transport & Travel Plan colour coding
  summary: string;
};

export type ParkingProduct = {
  id: string;
  service: "parking";
  zone: "red" | "green" | "white" | "accessible" | "purple" | "grey" | "campervan";
  name: string;
  short: string;
  location: "On-site" | "Off-site · Stevenage";
  colour: string;
  route: RouteId;
  gate: string;
  arrive: string; // arrival instructions
  depart: string; // egress instructions
  capacity: number; // working capacity (vehicles) from the TTP
  price: number;
  unit: string;
  requiresBlueBadge?: boolean;
  provisional?: boolean;
  perks: string[];
};

export type PudoProduct = {
  id: string;
  service: "pudo";
  zone: "taxi" | "private-hire" | "family";
  name: string;
  short: string;
  location: string;
  colour: string;
  price: number;
  unit: string;
  capacityNote: string;
  perks: string[];
};

export type Product = ParkingProduct | PudoProduct;

export type Event = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  venue: string;
  address: string;
  image: string;
  heroImage?: string;
  fixtures: Fixture[];
  faq: { q: string; a: string }[];
  terms: string;
};

/* ------------------------------------------------------------------ */
/*  Event                                                              */
/* ------------------------------------------------------------------ */

export const event: Event = {
  id: "oasis-knebworth-27",
  name: "Oasis Live '27 - Knebworth Park",
  tagline:
    "Official pre-booked parking and Pick Up / Drop Off for all six Knebworth nights. Tell us where you're coming from and we'll put you on the right route.",
  description:
    "Oasis return to Knebworth Park across three weekends in September 2027. With more than 60,000 fans on site each night, every parking space and drop-off slot is pre-sold so traffic can be planned before anyone sets off.\n\nOn-site car parks are deliberately capped at what the roads around the venue can clear within a 2.5-hour egress target, not at how much land there is. Each car park has its own dedicated route and gate, so picking the car park that matches the direction you're travelling from is the single biggest thing you can do to get in and out quickly.\n\nTaxis, private hire and friends & family drop-offs all operate off-site in Stevenage, linked to the venue by a dedicated signed walking route. No PUDO vehicles enter the site.",
  venue: "Knebworth Park",
  address: "Knebworth, Hertfordshire SG1 2AX",
  image: concertImg,
  heroImage: heroImg,
  fixtures: [
    { id: "sat-11", date: "2027-09-11T12:00:00Z", carParksOpen: "12:00", status: "selling-fast" },
    { id: "sun-12", date: "2027-09-12T12:00:00Z", carParksOpen: "12:00", status: "selling-fast" },
    { id: "sat-18", date: "2027-09-18T12:00:00Z", carParksOpen: "12:00", status: "available" },
    { id: "sun-19", date: "2027-09-19T12:00:00Z", carParksOpen: "12:00", status: "available" },
    { id: "sat-25", date: "2027-09-25T12:00:00Z", carParksOpen: "12:00", status: "available" },
    { id: "sun-26", date: "2027-09-26T12:00:00Z", carParksOpen: "12:00", status: "available" },
  ],
  faq: [
    {
      q: "Why do you ask where I'm travelling from?",
      a: "Every car park and drop-off area has its own dedicated route and gate. Matching your car park to your direction of travel keeps you off other people's routes, spreads traffic across the road network and is how we hit the 2.5-hour egress target. You can still pick any car park, but you'll be signed along that car park's route on the day.",
    },
    {
      q: "Can I just turn up and pay on the day?",
      a: "No. All parking and PUDO is pre-booked only. There is no pay-on-the-day parking, and Controlled Parking Zones will be in force on residential streets around Knebworth and Stevenage.",
    },
    {
      q: "Where do taxis and lifts drop me off?",
      a: "All Pick Up / Drop Off is off-site in Stevenage. Taxis use the dedicated rank on Gunnels Wood Road; private hire and friends & family use two separate zones at 9 Yards Retail Park. From each one, follow the signed walking route to the venue.",
    },
    {
      q: "Which way will I leave after the show?",
      a: "You leave by the same route you arrived on, except Red (exits A1(M) northbound) and Green (exits via Old Knebworth Lane). The A1(M) J7 roundabout will only serve the venue on show days, with no access into Stevenage except for emergency vehicles.",
    },
    {
      q: "I have a Blue Badge. Where do I park?",
      a: "Book the Accessible Car Park. It's on-site with its own approach, the Yellow Route (B656 northbound from Welwyn), so it stays clear of coach and campervan traffic. Please bring your Blue Badge. It will be checked on entry.",
    },
    {
      q: "Is my pass valid for more than one night?",
      a: "Each pass is for one show date and one vehicle. If you're going to more than one night, make a booking for each date.",
    },
  ],
  terms:
    "Passes are valid for one vehicle on the selected show date only and must be shown (printed or on your phone) on entry. Vehicles must follow the signed route for the booked car park or PUDO area. Off-site Purple (Fairlands) parking is subject to final permissions; if it is unavailable you will be moved to an equivalent facility or refunded in full. Accessible parking requires a valid Blue Badge. Passes are non-transferable and may not be resold above face value. Car-park opening times are provisional and will be confirmed in your pre-event email.",
};

export const events: Event[] = [event];
export const getEvent = (id: string) => events.find((e) => e.id === id);

/* ------------------------------------------------------------------ */
/*  Directions & routes (from the Proposed Transport & Travel Plan)    */
/* ------------------------------------------------------------------ */

export const directions: Direction[] = [
  { id: "north", label: "From the North", roads: "A1(M) southbound", from: "Peterborough, Huntingdon, A14, the North" },
  { id: "south", label: "From the South", roads: "A1(M) northbound", from: "London, M25, Hatfield, Welwyn" },
  { id: "west", label: "From the West", roads: "A505 / B656 via Hitchin", from: "Luton, Hitchin, Bedford, M1" },
  { id: "east", label: "From the East", roads: "A10 / A602", from: "Hertford, Ware, Cambridge, Essex (A120)" },
];

export const routes: Record<RouteId, TravelRoute> = {
  black: { id: "black", name: "Black Route", colour: "#111827", summary: "A1(M) corridor to J7, Gates 1, 1A and 2" },
  blue: { id: "blue", name: "Blue Route", colour: "#2563eb", summary: "B656 southbound from Hitchin" },
  yellow: { id: "yellow", name: "Yellow Route", colour: "#eab308", summary: "B656 northbound from Welwyn" },
  grey: { id: "grey", name: "Grey Route", colour: "#6b7280", summary: "A1(M) J8, then A602 and A1072 into Stevenage" },
  purple: { id: "purple", name: "Purple Route", colour: "#7c3aed", summary: "A10 to A602, then Broadhall Way or Six Hills Way" },
};

/* ------------------------------------------------------------------ */
/*  Parking products                                                   */
/* ------------------------------------------------------------------ */

export const parkingProducts: ParkingProduct[] = [
  {
    id: "red",
    service: "parking",
    zone: "red",
    name: "Red Car Park",
    short: "North car park",
    location: "On-site",
    colour: "#dc2626",
    route: "black",
    gate: "Gate 1 / Gate 1A",
    arrive:
      "Follow the Black Route. From the north, use the A1(M) southbound hard shoulder from J8 to J7, then cross the J7 roundabout into Gate 1A. From the south, come up the A1(M) to J7 and enter at Gate 1.",
    depart: "Exit onto the A1(M) northbound.",
    capacity: 5000,
    price: 35,
    unit: "per car",
    perks: ["Short walk to the arena", "Dedicated J8 to J7 hard-shoulder lane"],
  },
  {
    id: "green",
    service: "parking",
    zone: "green",
    name: "Green Car Park",
    short: "South car park",
    location: "On-site",
    colour: "#16a34a",
    route: "black",
    gate: "Gate 1 / Gate 2",
    arrive:
      "Follow the Black Route. Take the A1(M) northbound hard shoulder from J6 to J7 and enter at Gate 1, or at the new Gate 2 direct from the A1(M) if signed.",
    depart: "Exit via Old Knebworth Lane.",
    capacity: 4000,
    price: 35,
    unit: "per car",
    perks: ["Short walk to the arena", "Dedicated J6 to J7 hard-shoulder lane"],
  },
  {
    id: "white",
    service: "parking",
    zone: "white",
    name: "White Car Park",
    short: "West car park",
    location: "On-site",
    colour: "#94a3b8",
    route: "blue",
    gate: "West gate (B656)",
    arrive: "Follow the Blue Route: B656 southbound from Hitchin into the West car parks.",
    depart: "Leave the way you came, B656 northbound towards Hitchin.",
    capacity: 3200,
    price: 35,
    unit: "per car",
    perks: ["Separate from A1(M) traffic", "Next to the campervan field"],
  },
  {
    id: "campervan",
    service: "parking",
    zone: "campervan",
    name: "Campervan Field",
    short: "West (White zone)",
    location: "On-site",
    colour: "#64748b",
    route: "blue",
    gate: "West gate (B656)",
    arrive:
      "Follow the Blue Route: B656 southbound from Hitchin. Campervans arrive before the coaches, so set up your pitch before heading into the arena.",
    depart: "Leave the way you came, B656 northbound towards Hitchin.",
    capacity: 1800,
    price: 120,
    unit: "per van",
    perks: ["Arrive early and set up camp", "One pitch per van"],
  },
  {
    id: "accessible",
    service: "parking",
    zone: "accessible",
    name: "Accessible Car Park",
    short: "Blue Badge holders",
    location: "On-site",
    colour: "#0ea5e9",
    route: "yellow",
    gate: "Accessible gate (B656)",
    arrive:
      "Follow the Yellow Route: B656 northbound from Welwyn. It stays clear of coach and campervan traffic. Have your Blue Badge ready at the gate.",
    depart: "Leave the way you came, B656 southbound towards Welwyn.",
    capacity: 800,
    price: 20,
    unit: "per car",
    requiresBlueBadge: true,
    perks: ["Closest parking to the arena", "Step-free route to the viewing platform"],
  },
  {
    id: "purple",
    service: "parking",
    zone: "purple",
    name: "Purple Park & Walk",
    short: "Fairlands, Stevenage",
    location: "Off-site · Stevenage",
    colour: "#7c3aed",
    route: "purple",
    gate: "Fairlands entrance",
    arrive:
      "Follow the Purple Route: A10 onto the A602, entering Stevenage from the west, then Broadhall Way or Six Hills Way as signed. Walk to the venue on the signed pedestrian route.",
    depart: "Leave the way you came, A602 towards the A10.",
    capacity: 4880,
    price: 20,
    unit: "per car",
    provisional: true,
    perks: ["Avoids the A1(M) completely", "Quick getaway after the show"],
  },
  {
    id: "grey",
    service: "parking",
    zone: "grey",
    name: "Grey Park & Walk",
    short: "Stevenage town sites",
    location: "Off-site · Stevenage",
    colour: "#6b7280",
    route: "grey",
    gate: "Allocated site on booking",
    arrive:
      "Follow the Grey Route: A1(M) J8, then A602 and A1072 into your allocated Stevenage Park & Walk site. Walk to the venue on the signed pedestrian route.",
    depart: "Leave the way you came, back to A1(M) J8.",
    capacity: 2400,
    price: 15,
    unit: "per car",
    perks: ["Lowest price", "Town-centre food and drink nearby"],
  },
];

/* ------------------------------------------------------------------ */
/*  PUDO products                                                      */
/* ------------------------------------------------------------------ */

export const pudoProducts: PudoProduct[] = [
  {
    id: "family",
    service: "pudo",
    zone: "family",
    name: "Friends & Family Drop Off",
    short: "9 Yards Retail Park · Zone B",
    location: "9 Yards Retail Park, Stevenage",
    colour: "#f59e0b",
    price: 10,
    unit: "per vehicle",
    capacityNote: "Dedicated dwell area for lifts",
    perks: ["For someone giving you a lift", "Driver stays with the vehicle"],
  },
  {
    id: "private-hire",
    service: "pudo",
    zone: "private-hire",
    name: "Private Hire",
    short: "9 Yards Retail Park · Zone A",
    location: "9 Yards Retail Park, Stevenage",
    colour: "#0891b2",
    price: 5,
    unit: "per booking",
    capacityNote: "Separate from family drop-off",
    perks: ["Uber, Bolt and pre-booked minicabs", "Give your driver the pass QR"],
  },
  {
    id: "taxi",
    service: "pudo",
    zone: "taxi",
    name: "Taxi Rank",
    short: "Gunnels Wood Road",
    location: "Gunnels Wood Road, Stevenage",
    colour: "#111827",
    price: 0,
    unit: "free pass",
    capacityNote: "Staging for about 300 taxis",
    perks: ["Licensed hackney carriages", "The pass gets you a queue slot after the show"],
  },
];

export const allProducts: Product[] = [...parkingProducts, ...pudoProducts];

export const getProduct = (id: string) => allProducts.find((p) => p.id === id);

/* ------------------------------------------------------------------ */
/*  Recommendation logic                                               */
/* ------------------------------------------------------------------ */

/** Best-match car parks per direction, in order. */
const parkingByDirection: Record<DirectionId, string[]> = {
  north: ["red", "grey"],
  south: ["green", "purple"],
  west: ["white", "campervan"],
  east: ["purple", "green"],
};

export function recommendedParking(direction: DirectionId, blueBadge: boolean): string[] {
  const base = parkingByDirection[direction];
  return blueBadge ? ["accessible", ...base] : base;
}

/** PUDO: Grey Route if arriving from the North (and West), Purple Route from the South (and East). */
export function pudoRoute(direction: DirectionId): RouteId {
  return direction === "north" || direction === "west" ? "grey" : "purple";
}

export function pudoArrive(direction: DirectionId, product: PudoProduct): string {
  const r = routes[pudoRoute(direction)];
  const lead =
    r.id === "grey"
      ? "Follow the Grey Route: A1(M) J8, then A602 and A1072 into Stevenage"
      : "Follow the Purple Route: A10 onto the A602 into Stevenage via Broadhall Way or Six Hills Way";
  return `${lead}, then signs for ${product.location}. Walk to the venue on the signed pedestrian route.`;
}

/* ------------------------------------------------------------------ */
/*  Formatting helpers                                                 */
/* ------------------------------------------------------------------ */

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export const formatDayMonth = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

export const formatPrice = (n: number) =>
  n === 0 ? "Free" : new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

export const BOOKING_FEE = 1.5;
