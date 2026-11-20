import { createFileRoute, Link } from "@tanstack/react-router";
import { getBookingSummary } from "@/lib/booking.functions";
import { fmtWhen, rupees } from "@/lib/catalog";
import { Page, PrimaryButton, meta } from "@/components/site";
import { waLink } from "@/config";

export const Route = createFileRoute("/booking/$id")({
  loader: ({ params }) => getBookingSummary({ data: { id: params.id } }),
  head: () => meta("Your booking", "Your booking details."),
  component: Confirmation,
  errorComponent: () => <Page><p>We couldn't find this booking. Please check the link or message us.</p></Page>,
});

const headline: Record<string, string> = {
  held: "Your spot is held",
  confirmed: "You're booked in",
  waitlisted: "You're on the waiting list",
  expired: "This hold has ended",
  cancel_requested: "Cancellation requested",
  cancelled: "This booking is cancelled",
};

function Confirmation() {
  const b = Route.useLoaderData();
  if (!b) return <Page><h1 className="text-[34px]">Booking not found</h1><Link to="/" className="text-olive underline">Back to classes</Link></Page>;
  const when = b.startsAt ? fmtWhen(b.startsAt) : "";
  return (
    <Page>
      <section className="max-w-[560px] space-y-8">
        <div className="space-y-3">
          <p className="label text-primary">Booking</p>
          <h1 className="text-[34px] md:text-[44px]">{headline[b.status] ?? "Your booking"}{b.firstName ? `, ${b.firstName}` : ""}</h1>
        </div>
        <dl className="divide-y divide-hairline border-y border-hairline">
          {[["Class", b.itemName], ["When", when], ["Where", b.mode], ["Amount", rupees(b.amountPaise)], ["Reference", b.id.slice(0, 8).toUpperCase()]].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-6 py-4"><dt className="text-muted-foreground">{k}</dt><dd className="text-right">{v}</dd></div>
          ))}
        </dl>
        {b.status === "held" && <p className="rounded-[1.5rem] bg-clay p-5 text-clay-foreground">Online payment isn't switched on yet. Message us on WhatsApp within 15 minutes to pay and confirm your spot.</p>}
        {b.status === "waitlisted" && <p className="rounded-[1.5rem] bg-clay p-5 text-clay-foreground">This date is full. We'll message you if a spot opens.</p>}
        {b.status === "expired" && <p className="rounded-[1.5rem] bg-clay p-5 text-clay-foreground">The 15 minutes passed before payment, so the spot was released. You're welcome to book again.</p>}
        <div className="flex flex-wrap items-center gap-6">
          <PrimaryButton external href={waLink(`Hello! About my booking ${b.id.slice(0, 8).toUpperCase()} for ${b.itemName} on ${when}.`)}>Message us on WhatsApp</PrimaryButton>
          <Link to="/my-classes" className="text-olive underline underline-offset-4">See my classes</Link>
        </div>
      </section>
    </Page>
  );
}
