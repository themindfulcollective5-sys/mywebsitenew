import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { createBooking, listSessionsForItem } from "@/lib/booking.functions";
import { fmtWhen, rupees } from "@/lib/catalog";
import { Page, meta } from "@/components/site";

export const Route = createFileRoute("/book/$item")({
  loader: ({ params }) => listSessionsForItem({ data: { item: params.item } }),
  head: ({ loaderData }) => meta(`Reserve ${loaderData?.item?.name ?? "a class"}`, "Choose a date, share a little about yourself, and reserve your spot."),
  component: Book,
  errorComponent: () => <Page><p>We couldn't load the schedule. Please refresh the page.</p></Page>,
});

const field = "w-full rounded-2xl border border-hairline bg-background px-4 py-3 text-foreground focus:border-olive focus:outline-none";

function Q({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-2"><span className="text-[0.9375rem] text-foreground">{label}</span>{children}</label>;
}

function Book() {
  const { item, sessions } = Route.useLoaderData();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState("");
  const [f, setF] = useState({ name: "", phone: "", email: "", sleep: "", stress: "", health: "", goal: "", pregnancyWeeks: "", monthsSinceBirth: "" });
  const [cleared, setCleared] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  if (!item) return <Page><h1 className="text-[34px]">Class not found</h1><Link to="/" className="text-olive underline">Back to classes</Link></Page>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!item) return;
    if (!sessionId) return setError("Please choose a date.");
    if (item.kind !== "general" && !cleared) return setError("Please confirm your doctor has cleared you.");
    if (!consent) return setError("Please tick the consent box.");
    setBusy(true);
    try {
      const answers = { sleep: f.sleep, stress: f.stress, health: f.health, goal: f.goal, doctorCleared: cleared,
        ...(item.kind === "prenatal" ? { pregnancyWeeks: f.pregnancyWeeks } : {}),
        ...(item.kind === "postnatal" ? { monthsSinceBirth: f.monthsSinceBirth } : {}) };
      const r = await createBooking({ data: { item: item.key, sessionId, name: f.name, phone: f.phone, email: f.email, answers, consent: true } });
      navigate({ to: "/booking/$id", params: { id: r.id } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg.startsWith("[") ? "Some details look incomplete. Please check the form." : msg || "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <Page>
      <form onSubmit={submit} className="max-w-[560px] space-y-12">
        <div className="space-y-3">
          <p className="label text-primary">Reserve your spot</p>
          <h1 className="text-[34px] md:text-[44px]">{item.name}</h1>
          <p className="text-muted-foreground">{rupees(item.pricePaise)} {item.unit}</p>
        </div>

        <fieldset className="space-y-4">
          <legend className="mb-4 font-serif text-2xl text-olive">1. Choose a date</legend>
          {sessions.length === 0 ? (
            <p className="rounded-[1.5rem] bg-clay p-5 text-clay-foreground">No dates are open right now. Message us and we'll let you know when the next one opens.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {sessions.map((s) => (
                <label key={s.id} className={`cursor-pointer rounded-2xl border px-4 py-3 ${sessionId === s.id ? "border-olive bg-olive text-olive-foreground" : "border-hairline hover:border-olive"}`}>
                  <input type="radio" name="session" value={s.id} className="sr-only" checked={sessionId === s.id} onChange={() => setSessionId(s.id)} />
                  <span className="block">{fmtWhen(s.starts_at)}</span>
                  <span className="text-sm opacity-80">{s.spotsLeft > 0 ? `${s.spotsLeft} spots left` : "Full · join the waiting list"}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-4 font-serif text-2xl text-olive">2. Your details</legend>
          <Q label="Name"><input required maxLength={100} className={field} value={f.name} onChange={set("name")} autoComplete="name" /></Q>
          <Q label="Phone (WhatsApp)"><input required type="tel" maxLength={18} className={field} value={f.phone} onChange={set("phone")} autoComplete="tel" /></Q>
          <Q label="Email"><input required type="email" maxLength={255} className={field} value={f.email} onChange={set("email")} autoComplete="email" /></Q>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-4 font-serif text-2xl text-olive">3. A little about you</legend>
          <Q label="How have you been sleeping?">
            <select required className={field} value={f.sleep} onChange={set("sleep")}>
              <option value="">Choose one</option><option>Well</option><option>On and off</option><option>Poorly</option>
            </select>
          </Q>
          <Q label="Your stress level this week, 1 (calm) to 5 (very high)">
            <select required className={field} value={f.stress} onChange={set("stress")}>
              <option value="">Choose one</option>{[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}
            </select>
          </Q>
          <Q label="Any injuries or health notes we should know about?"><textarea maxLength={1000} rows={3} className={field} value={f.health} onChange={set("health")} placeholder="Optional" /></Q>
          <Q label="What would you most like from this class?"><input required maxLength={200} className={field} value={f.goal} onChange={set("goal")} placeholder="For example, better sleep" /></Q>
          {item.kind === "prenatal" && <Q label="How many weeks pregnant are you?"><input required inputMode="numeric" maxLength={3} className={field} value={f.pregnancyWeeks} onChange={set("pregnancyWeeks")} /></Q>}
          {item.kind === "postnatal" && <Q label="How many months since birth?"><input required inputMode="numeric" maxLength={3} className={field} value={f.monthsSinceBirth} onChange={set("monthsSinceBirth")} /></Q>}
          {item.kind !== "general" && (
            <label className="flex gap-3"><input type="checkbox" className="mt-1 size-4 accent-[var(--olive)]" checked={cleared} onChange={(e) => setCleared(e.target.checked)} /><span>My doctor has cleared me for this class.</span></label>
          )}
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-4 font-serif text-2xl text-olive">4. Consent and payment</legend>
          <label className="flex gap-3">
            <input type="checkbox" className="mt-1 size-4 accent-[var(--olive)]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>I agree that my details and answers are used only to plan my class safely. See the <Link to="/privacy" className="text-olive underline">privacy note</Link> and <Link to="/cancellation-policy" className="text-olive underline">cancellation policy</Link>.</span>
          </label>
          {error && <p role="alert" className="rounded-2xl border border-primary px-4 py-3 text-primary">{error}</p>}
          <button disabled={busy || sessions.length === 0} className="pill bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {busy ? "Reserving…" : `Reserve and pay ${rupees(item.pricePaise)}`}
          </button>
          <p className="text-sm text-muted-foreground">Your spot is held for 15 minutes while you pay.</p>
        </fieldset>
      </form>
    </Page>
  );
}
