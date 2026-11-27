import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, Hero, PrimaryButton, TextLink, Finder, Section, List, Note, Teacher, Footer, FooterButton, meta } from "@/components/site";
import { Button } from "@/components/ui/button";
import { findItem, rupees } from "@/lib/catalog";
import { waLink } from "@/config";

export const Route = createFileRoute("/")({
  head: () => meta("Classes", "Small-group yoga, breath and sound meditation classes for every body and every mood."),
  component: Classes,
});

const classes = [
  { key: "beginner", label: "GROUP CLASS", desc: "Hatha-based. Your first class, zero pressure." },
  { key: "pranayama", label: "BREATH", schedule: "Weekend", desc: "A steady breath to begin with." },
  { key: "prenatal", label: "YOGA", desc: "Move with your baby, not against it." },
  { key: "postnatal", label: "YOGA", desc: "Rebuild strength, one breath at a time." },
  { key: "sound", label: "SOUND", schedule: "Every Sunday", desc: "Let sound settle you." },
  { key: "slow-friday", label: "FRIDAY REST", schedule: "Fridays", desc: "Yin yoga to close your week." },
];
function Classes() {
  return (<>
    <Page>
      <Hero label="Yoga · Breath · Sound" title="Find your pace, find your calm" text="Small-group classes for every body and every mood."
        cta={<PrimaryButton href="#finder">Find my class</PrimaryButton>} link={<TextLink href="/awareness">Watch free talks</TextLink>}
        caption="Photo: soft morning light, mats, a plant" />
      <Finder id="finder" title="How do you feel today?" intro="Choose one, and we will suggest a class." options={[
        { chip: "I can't sleep", name: "Yoga nidra", desc: "Deep rest, even when your mind won't stop.", meta: "₹499 per session · Weekend reset" },
        { chip: "My back feels stiff", name: "Yin yoga", desc: "Slow, gentle movement at your own pace.", meta: "₹499 per session · Take it slow Friday" },
        { chip: "I can't focus", name: "Pranayama", desc: "A steady breath to begin with.", meta: "₹299 per session · Weekend reset" },
        { chip: "I overthink", name: "Journaling", desc: "Get thoughts on paper, not on loop.", meta: "₹299 per session · Weekend reset" },
        { chip: "I feel anxious", name: "Sound meditation", desc: "Let sound settle you.", meta: "₹899 per session · Every Sunday" },
      ]} />
      <Section title="Classes">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {classes.map((c) => {
            const item = findItem(c.key);
            if (!item) return null;
            return (
              <article key={c.key} className="flex min-w-0 flex-col rounded-[1.5rem] border border-hairline p-5">
                <p className="label text-primary uppercase">{c.label}</p>
                <h3 className="mt-3 text-2xl">{item.name}</h3>
                {c.schedule && <p className="mt-3 text-sm text-muted-foreground">{c.schedule}</p>}
                <span className="mt-3 self-start rounded-full bg-clay px-3 py-1 text-xs text-clay-foreground">Online</span>
                <p className="mt-4 text-[0.9375rem] text-muted-foreground">{c.desc}</p>
                <div className="mt-auto pt-6">
                  <p className="text-lg text-foreground">{rupees(item.pricePaise)} <span className="text-sm text-muted-foreground">{item.unit}</span></p>
                  <Button asChild className="pill mt-4 h-auto w-full rounded-full shadow-none">
                    <Link to="/book/$item" params={{ item: item.key }} aria-label={`Book ${item.name}`}>Book</Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </Section>
      <Section title="Packages and special sessions">
        <List rows={[
          { title: "Beginner · Tuesday and Thursday", desc: "2 days a week · 8 to 10 classes a month", right: "₹3,599", unit: "per month", book: "beginner-2x" },
          { title: "Beginner · Monday, Wednesday and Friday", desc: "3 days a week · 12 to 15 classes a month", right: "₹4,599", unit: "per month", book: "beginner-3x" },
          { title: "Sound meditation · every Sunday", desc: "4 Sundays a month", right: "₹3,499", unit: "per month", book: "sound-monthly" },
          { title: "Weekend reset · Saturday and Sunday", desc: "Pick your sessions: Yoga, Yin, Nidra ₹499 · Pranayama, Journaling ₹299", right: "₹499", unit: "per session", book: "weekend-reset" },
          { title: "Yoga Nidra", desc: "Guided deep rest on the weekend", right: "₹499", unit: "per session", book: "nidra" },
          { title: "The art of letting go", desc: "1.5 hours of Yin, sound meditation, and journaling", right: "₹1,299", unit: "per session", book: "letting-go" },
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
