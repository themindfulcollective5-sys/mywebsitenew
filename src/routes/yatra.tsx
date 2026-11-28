import { createFileRoute } from "@tanstack/react-router";
import { Page, Hero, PrimaryButton, TextLink, Section, List, Teacher, Footer, FooterButton, meta } from "@/components/site";
import { waLink } from "@/config";

export const Route = createFileRoute("/yatra")({
  head: () => meta("Yatra", "Mindful journeys to sacred places, with daily yoga, breath, and quiet reflection."),
  component: Yatra,
});

const ask = waLink("Hello! I'd like to know about the next Yatra.");
function Yatra() {
  return (<>
    <Page>
      <Hero label="Yatra · Mindful travel" title="Travel slowly, arrive within" text="Small-group journeys to sacred places, with daily practice and time to simply be."
        cta={<PrimaryButton href={ask} external>Ask about the next Yatra</PrimaryButton>} link={<TextLink href="#journey">What to expect</TextLink>}  />
      <Section id="journey" title="What to expect" intro="Every Yatra keeps the pace gentle and the group small.">
        <List rows={[
          { title: "Daily practice", desc: "Morning yoga and pranayama wherever we are." },
          { title: "Sacred places", desc: "Visits with time to sit, listen, and reflect." },
          { title: "Sound and silence", desc: "Evening sound meditation and quiet hours." },
          { title: "Simple stays", desc: "Clean, calm places to rest and eat well." },
        ]} />
      </Section>
      <Section title="Upcoming journeys" intro="Dates and places will be shared soon.">
        <List rows={[{ title: "Next Yatra", desc: "Destination to be announced", right: "Coming soon" }]} />
      </Section>
      <Teacher bio="A Yatra is practice in motion. We walk, breathe, and sit together, and let the place teach us something new." />
    </Page>
    <Footer title="Come along on the next journey." text="Message us to hear first when dates open." action={<FooterButton href={ask}>Message on WhatsApp</FooterButton>} />
  </>);
}
