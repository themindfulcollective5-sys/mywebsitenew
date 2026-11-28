import { createFileRoute } from "@tanstack/react-router";
import { Page, Hero, PrimaryButton, TextLink, Finder, Section, List, Note, Teacher, Footer, EmailForm, PlayIcon, meta } from "@/components/site";

export const Route = createFileRoute("/awareness")({
  head: () => meta("Awareness", "Free recorded talks on why movement, breath, and rest matter."),
  component: Awareness,
});

const f = "Free · recorded · watch anytime";
function Awareness() {
  return (<>
    <Page>
      <Hero label="Awareness sessions" title="Understand it first, then begin" text="Short recorded talks on why movement, breath, and rest matter. Free, and yours to watch anytime."
        cta={<PrimaryButton href="#talks">Start with a talk</PrimaryButton>} link={<TextLink href="#topic">Browse by topic</TextLink>}  />
      <Finder id="topic" title="What would you like to understand?" intro="Choose a topic, and we will suggest a talk." options={[
        { chip: "Everyday wellness", name: "Why wellness matters every day", desc: "Small habits, big difference.", meta: f },
        { chip: "Pregnancy", name: "Pregnancy awareness", desc: "What to know before, during, and after.", meta: f },
        { chip: "Yin yoga", name: "Why Yin Yoga?", desc: "Hold less, release more.", meta: f },
        { chip: "Hatha yoga", name: "Why Hatha Yoga?", desc: "The foundation of every practice.", meta: f },
        { chip: "Breathwork", name: "Why Pranayama?", desc: "Change how you feel in five minutes.", meta: f },
      ]} />
      <Section id="talks" title="All recorded talks" intro="Free to watch on YouTube.">
        <List rows={[
          { title: "Why wellness matters every day", desc: "Small habits, big difference" },
          { title: "Pregnancy awareness", desc: "What to know before, during, and after" },
          { title: "Why Yin Yoga?", desc: "Hold less, release more" },
          { title: "Why Hatha Yoga?", desc: "The foundation of every practice" },
          { title: "Why Pranayama?", desc: "Change how you feel in five minutes" },
        ].map((r) => ({ ...r, lead: <PlayIcon />, right: "Free · recorded" }))} />
      </Section>
      <Section title="What should we talk about next?" intro="These are coming soon. Tell us which one you need most.">
        <List rows={["Why can't I sleep?", "Why does my back always feel stiff?", "Why can't I stop overthinking?", "What does my breath have to do with anxiety?"].map((t) => ({ title: t, right: "Coming soon" }))} />
      </Section>
      <Note><p className="font-serif text-xl">Want it live for your team?</p><p className="mt-1">Awareness talks can be given live for companies and groups. See <a className="underline underline-offset-4" href="/employee-wellness">Employee wellness</a> for details.</p></Note>
      <Teacher bio="I record these talks to explain, in simple words, why these practices help and how to begin. No jargon, and no pressure to join a class." />
    </Page>
    <Footer title="Get new talks by email" text="We will write only when a new talk is ready." action={<EmailForm button="Notify me" />} />
  </>);
}
