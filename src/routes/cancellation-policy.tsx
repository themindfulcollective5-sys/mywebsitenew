import { createFileRoute } from "@tanstack/react-router";
import { Page, meta } from "@/components/site";

export const Route = createFileRoute("/cancellation-policy")({
  head: () => meta("Cancellation and refunds", "How cancellations and refunds work."),
  component: CancellationPolicy,
});

// Placeholder wording: edit the lines in square brackets.
function CancellationPolicy() {
  return (
    <Page>
      <section className="max-w-[640px] space-y-6">
        <h1 className="text-[34px] md:text-[44px]">Cancellation and refunds</h1>
        <ul className="list-disc space-y-3 pl-5">
        <li>Cancel at least [24 hours] before your session for a full refund.</li>
        <li>Cancellations within [24 hours] can move to another date once.</li>
        <li>Monthly packages: [add your package refund wording here].</li>
        <li>Refunds go back to the original payment method within [5 to 7] working days.</li>
        </ul>
      </section>
    </Page>
  );
}
