import { createFileRoute } from "@tanstack/react-router";
import { event } from "@/lib/tickets-data";
import { EventPage } from "@/components/event-page";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Oasis Live '27 Knebworth: Official Parking & PUDO" },
      {
        name: "description",
        content: "Pre-book on-site parking, Park & Walk and Pick Up / Drop Off for Oasis at Knebworth Park, September 2027.",
      },
      { property: "og:title", content: "Oasis Live '27 Knebworth: Official Parking & PUDO" },
      {
        property: "og:description",
        content: "Pre-book on-site parking, Park & Walk and Pick Up / Drop Off for Oasis at Knebworth Park, September 2027.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return <EventPage event={event} />;
}
