import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, Hero, PrimaryButton, TextLink, Finder, Section, List, Note, Teacher, Footer, FooterButton, meta } from "@/components/site";
import { Button } from "@/components/ui/button";
import { findItem, rupees } from "@/lib/catalog";
import { waLink } from "@/config";

export const Route = createFileRoute("/")({
  head: () => meta("Classes", "Small-group yoga, breath and sound meditation classes for every body and every mood."),
  component: Classes,
});

type Tile = { key: string; label?: string; schedule?: string; duration?: string; q: string; title?: string; sub?: string };
const classes: Tile[] = [
  { key: "beginner", label: "YOGA", duration: "45 min", q: "What if your first class felt nothing like you feared?" },
  { key: "pranayama", label: "BREATH", schedule: "Weekend", duration: "30 min", q: "Ever noticed how your breath changes when you're stressed?" },
  { key: "prenatal", label: "YOGA", duration: "45 min", q: "You're caring for two. Who's caring for you?" },
  { key: "postnatal", label: "YOGA", duration: "45 min", q: "Your body changed. When did you last feel at home in it?" },
  { key: "sound", label: "SOUND", schedule: "Every Sunday", duration: "45 min", q: "When did your mind last go completely quiet?" },
  { key: "slow-friday", label: "FRIDAY REST", schedule: "Fridays", duration: "45 min", q: "What if your week ended with rest, not rush?" },
  { key: "journaling", label: "WEEKEND", title: "Brain Dump", sub: "(Journaling)", schedule: "Weekend", duration: "30 min", q: "Where do your thoughts go when they won't stop?" },
];
function Classes() {
  return (<>
    <Page>
      <Hero label="Yoga · Breath · Sound" title="Find your pace, find your calm" text="Small-group classes for every body and every mood."
        cta={<PrimaryButton href="#finder">Find my class</PrimaryButton>} link={<TextLink href="/awareness">Watch free talks</TextLink>}
        caption="Photo: soft morning light, mats, a plant" />
      <Finder id="finder" title="How do you feel today?" intro="Choose one, and we will suggest a class." options={[
        { chip: "I can't sleep", name: "Yoga Nidra", desc: "Deep rest, even when your mind won't stop.", meta: "Weekend" },
        { chip: "My back feels stiff", name: "Yin Yoga", desc: "Slow, gentle movement at your own pace.", meta: "Take It Slow Friday · Fridays" },
        { chip: "I can't focus", name: "Pranayama", desc: "A steady breath to begin with.", meta: "Weekend" },
        { chip: "I overthink", name: "Brain Dump (Journaling)", desc: "Get thoughts on paper, not on loop.", meta: "Weekend" },
        { chip: "I feel anxious", name: "Sound Meditation", desc: "Let sound settle you.", meta: "Every Sunday" },
      ]} />
      <Section title="Classes">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {classes.map((c, i) => {
            const item = findItem(c.key);
            if (!item) return null;
            const last = i === classes.length - 1;
            return (
              <article key={c.key} className={`flex min-w-0 flex-col rounded-[1.5rem] border border-hairline p-5${last ? " sm:col-span-2" : ""}`}>
                {c.label && <p className="label text-primary uppercase">{c.label}</p>}
                <h3 className={`${c.label ? "mt-3 " : ""}text-2xl`}>{c.title ?? item.name}</h3>
                {c.sub && <p className="text-sm text-muted-foreground">{c.sub}</p>}
                {c.schedule && <p className="mt-3 text-sm text-muted-foreground">{c.schedule}</p>}
                <p className="mt-4 font-serif text-lg italic text-olive">{c.q}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-clay px-3 py-1 text-xs text-clay-foreground">Online</span>
                  {c.duration && <span className="rounded-full bg-clay px-3 py-1 text-xs text-clay-foreground">{c.duration}</span>}
                </div>
                <div className="mt-auto pt-6">
                  <p className="text-lg text-foreground">{rupees(item.pricePaise)} <span className="text-sm text-muted-foreground">{item.unit}</span></p>
                  <Button asChild className="pill mt-4 h-auto w-full rounded-full shadow-none">
                    <Link to="/book/$item" params={{ item: item.key }} aria-label={`Reserve your spot for ${item.name}`}>Reserve your spot</Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </Section>
      <Section title="Find your rhythm" intro="Choose the days that fit your week.">
        <List rows={[
          { title: "Beginner Hatha Yoga · Tuesday and Thursday", desc: "8 to 10 classes a month", right: "₹3,599", unit: "per month", book: "beginner-2x" },
          { title: "Beginner Hatha Yoga · Monday, Wednesday and Friday", desc: "12 to 15 classes a month", right: "₹4,599", unit: "per month", book: "beginner-3x" },
          { title: "Sound Meditation · monthly", desc: "Every Sunday, 4 sessions a month", right: "₹3,499", unit: "per month", book: "sound-monthly" },
        ]} />
      </Section>
      <Section title="Go deeper" intro="Sessions to look forward to.">
        <List rows={[
          { title: "Yoga Nidra", desc: "When was the last time you truly rested? · 45 min · Weekend", right: "₹499", unit: "per session", book: "nidra" },
          { title: "The Art of Letting Go", desc: "When did you last let go of something you've carried for years? · 1.5 hours", right: "₹1,299", unit: "per session", book: "letting-go" },
        ]} />
      </Section>
      <Note><p className="font-serif text-xl">Not sure about a class?</p><p className="mt-1">Every class has a short, free talk explaining why it helps and what to expect. Open Awareness in the menu to watch.</p></Note>
      <Teacher bio="I came to yoga when work stress was taking over my days. Slowly, my focus sharpened, my sleep deepened, and I felt calmer in my own skin. Now I teach small, friendly classes where you only have to show up." />
    </Page>
    <Footer title="There is always a place for you on the mat." text="Message us the class you would like, whenever you are ready."
      action={<FooterButton href={waLink("Hello! I'd like to join a class.")}>Message on WhatsApp</FooterButton>}
      small="6:15 am to 7:15 am · Online" />
  </>);
}
