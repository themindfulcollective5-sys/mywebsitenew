import { createFileRoute } from "@tanstack/react-router";
import { Page, Section, Note, Teacher, PhotoPlaceholder, PrimaryButton, Footer, FooterButton, meta } from "@/components/site";
import { telLink, waLink } from "@/config";

export const Route = createFileRoute("/guide")({
  head: () => meta("Your Guide", "A one-on-one conversation with your online yoga and sound meditation teacher to find your starting point."),
  component: Guide,
});

function Guide() {
  const consultationLink = waLink("Hi! I'd like a one-on-one consultation.");
  return (<>
    <Page>
      <section className="max-w-[640px] space-y-5">
        <p className="label text-primary">Your guide</p>
        <h1 className="text-[34px] md:text-[52px]">Let's talk, one on one</h1>
        <p className="text-lg text-muted-foreground">Not sure which class is right for you? Tell me what's going on, and we'll find your starting point together.</p>
      </section>
      <Section title="One-on-one consultation">
        <Note>
          <p>A personal conversation to understand you better: your sleep, your stress, your body, your goals. Then we choose the right class together.</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <PrimaryButton external href={consultationLink}>Message me on WhatsApp</PrimaryButton>
            <a href={telLink} className="pill border border-primary text-primary hover:bg-primary hover:text-primary-foreground">Call me</a>
          </div>
        </Note>
      </Section>
      <div className="space-y-8">
        <Teacher bio="I came to yoga when work stress was taking over my days. Slowly, my focus sharpened, my sleep deepened, and I felt calmer in my own skin. Now I teach small, friendly classes where you only have to show up." />
        <PhotoPlaceholder caption="Photo: [your photo]" />
      </div>
    </Page>
    <Footer title="Let's find your starting point together." text="A personal conversation, wherever you are."
      action={<FooterButton href={consultationLink}>Message me on WhatsApp</FooterButton>} small="Online" />
  </>);
}