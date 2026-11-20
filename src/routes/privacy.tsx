import { createFileRoute } from "@tanstack/react-router";
import { Page, meta } from "@/components/site";

export const Route = createFileRoute("/privacy")({
  head: () => meta("Privacy", "How we look after your details."),
  component: Privacy,
});

// Placeholder wording: edit the lines in square brackets.
function Privacy() {
  return (
    <Page>
      <section className="max-w-[640px] space-y-6">
        <h1 className="text-[34px] md:text-[44px]">Privacy</h1>
        <ul className="list-disc space-y-3 pl-5">
        <li>We collect your name, phone, email and your answers to a few wellbeing questions.</li>
        <li>We use them only to plan your class safely and to contact you about your bookings.</li>
        <li>Only the teacher can see your answers. We never sell or share your details.</li>
        <li>To see or delete your details, message us. [Edit this wording as needed.]</li>
        </ul>
      </section>
    </Page>
  );
}
