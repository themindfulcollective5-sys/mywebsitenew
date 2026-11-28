import { createFileRoute } from "@tanstack/react-router";
import { Page, Section, Note, Teacher, PrimaryButton, Footer, FooterButton, meta } from "@/components/site";
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
        <h1 className="text-[34px] md:text-[52px]">Hi, I'm Azhakeswari</h1>
        <p className="text-lg text-muted-foreground">I teach small, friendly online classes where you only have to show up.</p>
      </section>
      <div className="space-y-8">
        <Teacher bio="I came to yoga when work stress was taking over my days. Slowly, my focus sharpened, my sleep deepened, and I felt calmer in my own skin. Now I teach small, friendly classes where you only have to show up." />
      </div>
      <Section title="Let's talk, one on one" intro="I'll understand you first. Then we'll find the class that fits.">
        <Note>
          <p>Before you pick a class, let's have a conversation. Tell me how you've been sleeping, what feels heavy, and what your body needs right now. I'll listen first, and we'll find the practice that fits your life.</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <PrimaryButton external href={consultationLink}>Chat with me on WhatsApp</PrimaryButton>
            <a href={telLink} className="pill border border-primary text-primary hover:bg-primary hover:text-primary-foreground">Call me</a>
          </div>
        </Note>
      </Section>
    </Page>
    <Footer title="Let's find your starting point together." text="A personal conversation, wherever you are."
      action={<FooterButton href={consultationLink}>Message me on WhatsApp</FooterButton>} small="Online" />
  </>);
}