import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { EventPage } from "@/components/event-page";
import { getEvent } from "@/lib/tickets-data";

export const Route = createFileRoute("/events/$eventId")({
  loader: ({ params }) => {
    const event = getEvent(params.eventId);
    if (!event) throw notFound();
    return { event };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `Parking & PUDO: ${loaderData.event.name}` },
          { name: "description", content: loaderData.event.tagline },
          { property: "og:title", content: `Parking & PUDO: ${loaderData.event.name}` },
          { property: "og:description", content: loaderData.event.tagline },
        ]
      : [],
  }),
  component: EventRoute,
  errorComponent: ({ error }) => <div className="p-8">{error.message}</div>,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Event not found</h1>
        <Link to="/" className="text-accent-blue mt-2 inline-block">
          Back to home
        </Link>
      </div>
    </div>
  ),
});

function EventRoute() {
  const { event } = Route.useLoaderData();
  return <EventPage event={event} />;
}

/** The event booking page. Also rendered as the homepage (see routes/index.tsx). */
