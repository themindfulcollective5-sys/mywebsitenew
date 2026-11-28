import { createFileRoute } from "@tanstack/react-router";
import { Page, Hero, PrimaryButton, TextLink, Finder, Section, List, Num, Teacher, Footer, FooterButton, meta } from "@/components/site";
import { waLink } from "@/config";

export const Route = createFileRoute("/employee-wellness")({
  head: () => meta("Employee wellness", "Yoga, breathwork, and sound meditation sessions for teams, online or on-site."),
  component: Wellness,
});

const pilot = waLink("Hello! I'd like to request a pilot wellness session for my team.");
const ps = "per session";
function Wellness() {
  return (<>
    <Page>
      <Hero label="Employee wellness" title="Wellbeing at work" text="Calm, focus, and energy for your team, through yoga, breathwork, and sound meditation."
        cta={<PrimaryButton href={pilot} external>Request a pilot session</PrimaryButton>} link={<TextLink href="#sessions">See sessions</TextLink>}  />
      <Finder title="What does your team need?" intro="Choose one, and we will suggest a session." options={[
        { chip: "Stress", name: "Desk yoga and stress relief", desc: "Release tension without leaving the desk.", meta: "₹6,000 to ₹8,000 per session · 45 min · online" },
        { chip: "Focus", name: "Pranayama focus break", desc: "A short breathwork reset for sharper attention.", meta: "₹4,000 to ₹6,000 per session · 30 min" },
        { chip: "Sleep", name: "Sound meditation on-site", desc: "Deep rest that carries into the night.", meta: "₹12,000 to ₹18,000 per session · 60 min" },
        { chip: "Desk posture", name: "Yoga on-site", desc: "Open the hips, back, and shoulders.", meta: "₹8,000 to ₹12,000 per session · 60 min" },
      ]} />
      <Section id="sessions" title="Sessions for your team" intro="Sample rates. Final rates depend on group size, location, and equipment.">
        <List rows={[
          { title: "Desk yoga and stress relief", desc: "45 min · online · up to 30 people", right: "₹6,000 to ₹8,000", unit: ps },
          { title: "Yoga on-site", desc: "60 min · up to 20 people", right: "₹8,000 to ₹12,000", unit: ps },
          { title: "Pranayama focus break", desc: "30 min · up to 30 people", right: "₹4,000 to ₹6,000", unit: ps },
          { title: "Sound meditation on-site", desc: "60 min · up to 20 people", right: "₹12,000 to ₹18,000", unit: ps },
          { title: "Live awareness talk", desc: "Sleep, stress, desk posture · 45 min", right: "₹5,000 to ₹8,000", unit: ps },
        ]} />
      </Section>
      <Section title="Simple to set up" intro="No equipment or experience needed from your team.">
        <List rows={["Tell us your goal", "Pick your sessions", "We come to you, or go online", "Share feedback"].map((t, i) => ({ title: t, lead: <Num n={i + 1} /> }))} />
      </Section>
      <Section title="Plans that fit your rhythm">
        <List rows={[
          { title: "Pilot session", desc: "Try one session with your team.", right: "Special rate" },
          { title: "Monthly plan", desc: "4 sessions.", right: "Save 10%" },
          { title: "Quarterly plan", desc: "12 sessions over 3 months.", right: "Save 15%" },
          { title: "Annual wellness program", desc: "A year-long plan built around your team.", right: "Custom quote" },
        ]} />
      </Section>
      <Teacher bio="I know how heavy a workday can feel. My sessions for teams are short, practical, and easy to join, whatever the fitness level." />
    </Page>
    <Footer title="Start with a pilot session" text="Tell us your team size and what you would like to improve. We will suggest a plan."
      action={<FooterButton href={pilot}>Request a pilot session</FooterButton>} small="Online" />
  </>);
}
