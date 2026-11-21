import { createFileRoute } from "@tanstack/react-router";
import { Page, Hero, PrimaryButton, TextLink, Finder, Section, List, Note, Teacher, Footer, FooterButton, meta } from "@/components/site";
import { waLink } from "@/config";

export const Route = createFileRoute("/")({
  head: () => meta("Classes", "Small-group yoga, breath and sound meditation classes for every body and every mood."),
  component: Classes,
});

const ps = "per session";
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
      <Section title="Classes and packages" intro="Drop in for a session, or commit to a rhythm.">
        <List rows={[
          { title: "Beginner yoga", desc: "Hatha-based. Your first class, zero pressure.", right: "₹499", unit: ps, book: "beginner" },
          { title: "Beginner, 2 days a week", desc: "8 to 10 classes a month.", right: "₹3,599", unit: "per month", book: "beginner-2x" },
          { title: "Beginner, 3 days a week", desc: "12 to 15 classes a month.", right: "₹4,599", unit: "per month", book: "beginner-3x" },
          { title: "Prenatal yoga", desc: "Move with your baby, not against it.", right: "₹699", unit: ps, book: "prenatal" },
          { title: "Postnatal yoga", desc: "Rebuild strength, one breath at a time.", right: "₹699", unit: ps, book: "postnatal" },
          { title: "Sound meditation", desc: "Every Sunday.", right: "₹899", unit: ps, book: "sound" },
          { title: "Sound meditation monthly", desc: "4 Sundays a month.", right: "₹3,499", unit: "per month", book: "sound-monthly" },
        ]} />
      </Section>
      <Section title="Slow down, on your terms" intro="Weekend reset runs on Saturday and Sunday. Pick the sessions you want.">
        <List rows={[
          { title: "Weekend reset", desc: "Yoga, Yin, Nidra ₹499 · Pranayama, Journaling ₹299.", right: "From ₹299", unit: ps, book: "weekend-reset" },
          { title: "The art of letting go", desc: "1.5 hours of Yin, sound meditation, and journaling.", right: "₹1,299", unit: ps, book: "letting-go" },
          { title: "Take it slow Friday", desc: "Yin yoga to close your week.", right: "₹499", unit: ps, book: "slow-friday" },
        ]} />
      </Section>
      <Note><p className="font-serif text-xl">Not sure about a class?</p><p className="mt-1">Every class has a short, free talk explaining why it helps and what to expect. Open Awareness in the menu to watch.</p></Note>
      <Teacher bio="I came to yoga when work stress was taking over my days. Slowly, my focus sharpened, my sleep deepened, and I felt calmer in my own skin. Now I teach small, friendly classes where you only have to show up." />
    </Page>
    <Footer title="There is always a place for you on the mat." text="Message us the class you would like, whenever you are ready."
      action={<FooterButton href={waLink("Hello! I'd like to join a class.")}>Message on WhatsApp</FooterButton>}
      small="6:15 am to 7:15 am · Online and offline" />
  </>);
}
