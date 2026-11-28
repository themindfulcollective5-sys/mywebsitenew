import { createFileRoute } from "@tanstack/react-router";
import { Page, Hero, PrimaryButton, TextLink, Section, List, Teacher, Footer, EmailForm, meta } from "@/components/site";

export const Route = createFileRoute("/retreats")({
  head: () => meta("Retreats", "Small-group retreats bringing yoga, sound meditation, and journaling together."),
  component: Retreats,
});

const glance = [["Where", "To be announced"], ["When", "Dates to be announced"], ["Group size", "Small group"], ["Price", "To be announced"]];
function Retreats() {
  return (<>
    <Page>
      <Hero label="Retreats" title="A few days to slow all the way down" text="Small-group retreats that bring yoga, sound meditation, and journaling together, away from the usual noise."
        cta={<PrimaryButton href="#join">Keep me posted</PrimaryButton>} link={<TextLink href="#day">See a sample day</TextLink>}  />
      <Section title="At a glance">
        <dl className="grid grid-cols-2 border-t border-l border-hairline">
          {glance.map(([k, v]) => (
            <div key={k} className="border-r border-b border-hairline p-5">
              <dt className="label text-muted-foreground">{k}</dt><dd className="mt-1 font-serif text-lg text-olive">{v}</dd>
            </div>
          ))}
        </dl>
      </Section>
      <Section title="What a retreat holds">
        <List rows={[
          { title: "Yoga and Yin", desc: "Morning movement and slow evening holds." },
          { title: "Sound meditation", desc: "Bowls and quiet to settle the nervous system." },
          { title: "Journaling", desc: "Gentle prompts to notice what you carry." },
          { title: "Pranayama and Yoga nidra", desc: "Breath to begin the day, deep rest to end it." },
        ]} />
      </Section>
      <Section id="day" title="A sample day" intro="This is a sample only. The final schedule may change.">
        <List rows={[
          { title: "Morning", desc: "Pranayama and a slow yoga flow." },
          { title: "Midday", desc: "A simple meal and free time outdoors." },
          { title: "Afternoon", desc: "Journaling and a walk in silence." },
          { title: "Evening", desc: "Yin yoga, sound meditation, and yoga nidra." },
        ]} />
      </Section>
      <Teacher bio="Retreats are where the practice can really sink in. I keep groups small so everyone gets space, quiet, and attention." />
    </Page>
    <div id="join"><Footer title="Want to be there?" text="Leave your email and I'll send you the dates and details before anyone else." action={<EmailForm button="Keep me posted" />} /></div>
  </>);
}
