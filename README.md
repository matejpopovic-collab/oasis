# Oasis Live '27 Knebworth: Parking & PUDO

Pre-booked parking and Pick Up / Drop Off for the six Oasis nights at Knebworth Park
(Sat/Sun 11–12, 18–19, 25–26 September 2027). Forked from `tickets-live-erewash`.

## Booking flow
1. **Service**: Parking or PUDO
2. **Date**: one of the six show nights
3. **Direction**: North (A1(M) southbound), South (A1(M) northbound), West (Hitchin/B656), East (A10/A602), plus an optional Blue Badge toggle
4. **Option**: the car park or drop-off area on that route is recommended, and the rest sit under "Other car parks"

The route map highlights the matching route (Black, Blue, Yellow, Grey or Purple) and zone
from the Proposed Transport & Travel Plan (Knebworth 2027 Traffic Management Concepts).

## Where things live
- `src/lib/tickets-data.ts`: event, fixtures, directions, routes, parking and PUDO products, recommendation rules
- `src/lib/booking.ts`: price and route summary, checkout URL params
- `src/components/booking-panel.tsx`: the 4-step selector
- `src/components/travel-map.tsx`: schematic route map (SVG)
- `src/routes/events.$eventId.tsx`: booking page
- `src/routes/checkout.$eventId.tsx`: details, payment, confirmation pass

Prices, car-park opening times and the ticket-reference format are placeholders.

## Run
```
npm install
npm run dev
```
