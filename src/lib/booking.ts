import {
  BOOKING_FEE,
  directions,
  event,
  getProduct,
  pudoArrive,
  pudoRoute,
  routes,
  type DirectionId,
  type Product,
  type ServiceId,
  type TravelRoute,
} from "@/lib/tickets-data";
import type { BookingState, Journey } from "@/components/booking-panel";

export type BookingSummary = {
  product: Product;
  route: TravelRoute;
  arrive: string;
  depart: string;
  gate: string;
  subtotal: number;
  fee: number;
  total: number;
};

export function summarise(state: {
  productId: string | null;
  direction: DirectionId | null;
  qty: number;
}): BookingSummary | null {
  if (!state.productId || !state.direction) return null;
  const product = getProduct(state.productId);
  if (!product) return null;
  const subtotal = product.price * state.qty;
  const fee = subtotal > 0 ? BOOKING_FEE : 0;
  if (product.service === "parking") {
    return {
      product,
      route: routes[product.route],
      arrive: product.arrive,
      depart: product.depart,
      gate: product.gate,
      subtotal,
      fee,
      total: subtotal + fee,
    };
  }
  const route = routes[pudoRoute(state.direction)];
  return {
    product,
    route,
    arrive: pudoArrive(state.direction, product),
    depart: `After the show, walk back along the signed pedestrian route to ${product.location}. Your driver leaves Stevenage by the ${route.name}.`,
    gate: product.location,
    subtotal,
    fee,
    total: subtotal + fee,
  };
}

/** URL search params used to hand the booking to checkout. */
export type CheckoutSearch = {
  service?: ServiceId;
  fixture?: string;
  direction?: DirectionId;
  product?: string;
  qty?: number;
  journey?: Journey;
  badge?: boolean;
};

export function toSearch(s: BookingState): CheckoutSearch {
  return {
    service: s.service ?? undefined,
    fixture: s.fixtureId ?? undefined,
    direction: s.direction ?? undefined,
    product: s.productId ?? undefined,
    qty: s.qty,
    journey: s.service === "pudo" ? s.journey : undefined,
    badge: s.blueBadge || undefined,
  };
}

export const directionLabel = (id?: DirectionId | null) => directions.find((d) => d.id === id)?.label ?? "";
export const fixtureFor = (id?: string | null) => event.fixtures.find((f) => f.id === id);
