import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { STUDIO_NAME, waLink } from "@/config";

const tabs = [
  { to: "/", label: "Classes" },
  { to: "/awareness", label: "Awareness" },
  { to: "/employee-wellness", label: "Employee wellness" },
  { to: "/retreats", label: "Retreats" },
  { to: "/yatra", label: "Yatra" },
] as const;

const linkCls = "text-sm text-olive underline decoration-hairline underline-offset-4 hover:decoration-primary";

export function SiteHeader() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    const check = async (id: string | null) => {
      if (!active) return;
      setUserId(id);
      if (!id) { setIsAdmin(false); return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", id).eq("role", "admin").maybeSingle();
      if (active) setIsAdmin(!!data);
    };
    supabase.auth.getSession().then(({ data }) => check(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => { void check(session?.user.id ?? null); });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <header className="border-b border-hairline">
      <div className="mx-auto flex max-w-[860px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 md:flex-nowrap">
        <Link to="/" className="font-serif text-xl text-olive">{STUDIO_NAME}</Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:order-3 md:flex-nowrap">
          {userId ? (
            <>
              <Link to="/my-classes" className={linkCls}>My classes</Link>
              {isAdmin && <Link to="/admin" className={linkCls}>Admin</Link>}
              <button type="button" onClick={signOut} className={linkCls}>Sign out</button>
            </>
          ) : (
            <Link to="/auth" className={linkCls}>Sign in</Link>
          )}
          <a href={waLink("Hello! I'd like to know more.")} target="_blank" rel="noreferrer"
            className="pill border border-primary px-4 py-2 text-sm text-primary hover:bg-primary hover:text-primary-foreground">
            Message us
          </a>
        </div>
        <nav aria-label="Main" className="-mx-5 w-[calc(100%+2.5rem)] overflow-x-auto px-5 md:order-2 md:mx-0 md:w-auto md:px-0">
          <ul className="flex gap-5 whitespace-nowrap text-[0.9375rem]">
            {tabs.map((t) => (
              <li key={t.to}>
                <Link to={t.to} activeOptions={{ exact: true }}
                  className="block border-b border-transparent py-1 text-muted-foreground hover:text-foreground"
                  activeProps={{ className: "!border-primary !text-foreground" }}>
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <main className="mx-auto max-w-[860px] space-y-16 px-5 pt-12 pb-16 md:space-y-20 md:pt-16">{children}</main>;
}

export function Hero(p: { label: string; title: string; text: string; cta: ReactNode; link: ReactNode; caption: string }) {
  return (
    <section className="space-y-8">
      <div className="max-w-[640px] space-y-5">
        <p className="label text-primary">{p.label}</p>
        <h1 className="text-[34px] md:text-[52px]">{p.title}</h1>
        <p className="text-lg text-muted-foreground">{p.text}</p>
        <div className="flex flex-wrap items-center gap-6 pt-2">
          {p.cta}
          {p.link}
        </div>
      </div>
      <PhotoPlaceholder caption={p.caption} />
    </section>
  );
}

export function PhotoPlaceholder({ caption }: { caption: string }) {
  return (
    <figure className="photo-placeholder relative aspect-[16/9] overflow-hidden rounded-[1.5rem]">
      <span aria-hidden className="absolute -top-10 -right-10 size-36 rounded-full bg-primary/80 md:size-48" />
      <figcaption className="absolute bottom-4 left-5 text-sm text-clay-foreground">{caption}</figcaption>
    </figure>
  );
}

export const PrimaryButton = ({ href, children, external }: { href: string; children: ReactNode; external?: boolean }) => (
  <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    className="pill bg-primary text-primary-foreground hover:bg-primary/90">{children}</a>
);

export const TextLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} className="text-[0.9375rem] text-olive underline decoration-hairline underline-offset-4 hover:decoration-primary">{children}</a>
);

export function Section(p: { id?: string | undefined; title: string; intro?: string | undefined; children: ReactNode }) {
  return (
    <section id={p.id} className="scroll-mt-8 space-y-6">
      <div className="space-y-2">
        <h2 className="text-[28px] md:text-[34px]">{p.title}</h2>
        {p.intro && <p className="text-muted-foreground">{p.intro}</p>}
      </div>
      {p.children}
    </section>
  );
}

export type Row = { title: string; desc?: string; right?: string; unit?: string; lead?: ReactNode; href?: string; book?: string };

export function List({ rows }: { rows: Row[] }) {
  return (
    <ul className="border-t border-hairline">
      {rows.map((r) => {
        const inner = (
          <div className="flex items-start justify-between gap-6 py-5">
            <div className="flex gap-4">
              {r.lead}
              <div>
                <p className="font-medium text-foreground">{r.title}</p>
                {r.desc && <p className="text-[0.9375rem] text-muted-foreground">{r.desc}</p>}
              </div>
            </div>
            {r.right && (
              <div className="shrink-0 text-right">
                <p className="text-foreground">{r.right}</p>
                {r.unit && <p className="text-xs text-muted-foreground">{r.unit}</p>}
                {r.book && (
                  <Link to="/book/$item" params={{ item: r.book }}
                    className="mt-2 inline-block rounded-full border border-primary px-3 py-1 text-xs text-primary hover:bg-primary hover:text-primary-foreground">
                    Reserve your spot
                  </Link>
                )}
              </div>
            )}
          </div>
        );
        return (
          <li key={r.title} className="border-b border-hairline">
            {r.href ? <a href={r.href} target="_blank" rel="noreferrer" className="block hover:bg-clay/40">{inner}</a> : inner}
          </li>
        );
      })}
    </ul>
  );
}

export const PlayIcon = () => (
  <span aria-hidden className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border border-primary text-primary">
    <svg viewBox="0 0 10 10" className="ml-0.5 size-2.5 fill-current"><path d="M2 1l7 4-7 4z" /></svg>
  </span>
);
export const Num = ({ n }: { n: number }) => (
  <span aria-hidden className="mt-0.5 font-serif text-lg text-primary">{n}</span>
);

export type FinderOption = { chip: string; name: string; desc: string; meta: string };

export function Finder({ id, title, intro, options }: { id?: string; title: string; intro: string; options: FinderOption[] }) {
  const [sel, setSel] = useState<number | null>(null);
  const s = sel === null ? null : options[sel];
  return (
    <Section id={id} title={title} intro={intro}>
      <div className="flex flex-wrap gap-2" role="group" aria-label={title}>
        {options.map((o, i) => (
          <button key={o.chip} type="button" aria-pressed={sel === i} onClick={() => setSel(i)}
            className={`rounded-full border px-4 py-2 text-[0.9375rem] transition-colors ${
              sel === i ? "border-olive bg-olive text-olive-foreground" : "border-hairline text-foreground hover:border-olive"}`}>
            {o.chip}
          </button>
        ))}
      </div>
      <div aria-live="polite">
        {s && (
          <div className="border-l-2 border-primary py-1 pl-5">
            <p className="label text-primary">Try</p>
            <p className="font-serif text-2xl text-olive">{s.name}</p>
            <p className="text-muted-foreground">{s.desc}</p>
            <p className="mt-1 text-sm text-foreground">{s.meta}</p>
          </div>
        )}
      </div>
    </Section>
  );
}

export const Note = ({ children }: { children: ReactNode }) => (
  <aside className="rounded-[1.5rem] bg-clay p-6 text-clay-foreground md:p-8">{children}</aside>
);

export function Teacher({ bio }: { bio: string }) {
  return (
    <section className="flex flex-col gap-6 border-t border-hairline pt-12 sm:flex-row sm:items-start">
      <div className="photo-placeholder size-28 shrink-0 rounded-full" role="img" aria-label="Photo of Azhakeswari to add" />
      <div className="space-y-2">
        <h2 className="text-[28px]">Azhakeswari</h2>
        <p className="label text-muted-foreground">Yoga and sound meditation teacher · 6 years of experience</p>
        <p className="max-w-[60ch]">{bio}</p>
      </div>
    </section>
  );
}

export function Footer(p: { title: string; text: string; action: ReactNode; small?: string }) {
  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="mx-auto max-w-[860px] space-y-5 px-5 py-16">
        <h2 className="max-w-[20ch] text-[30px] !text-footer-foreground md:text-[40px]">{p.title}</h2>
        <p className="max-w-[60ch] opacity-85">{p.text}</p>
        <div className="pt-2">{p.action}</div>
        {p.small && <p className="text-sm opacity-75">{p.small}</p>}
        <p className="flex flex-wrap gap-x-5 gap-y-2 pt-8 text-xs opacity-75">
          <span>© {STUDIO_NAME}</span>
          <Link to="/cancellation-policy" className="underline underline-offset-4">Cancellation and refunds</Link>
          <Link to="/privacy" className="underline underline-offset-4">Privacy</Link>
        </p>
      </div>
    </footer>
  );
}

export const FooterButton = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer" className="pill bg-clay text-clay-foreground hover:bg-clay-deep">{children}</a>
);

export function EmailForm({ button }: { button: string }) {
  const [done, setDone] = useState(false);
  if (done) return <p role="status">Thank you. We will be in touch.</p>;
  return (
    <form className="flex max-w-md flex-col gap-3 sm:flex-row" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
      <label className="sr-only" htmlFor="email">Email</label>
      <input id="email" type="email" required placeholder="Your email"
        className="flex-1 rounded-full border border-footer-foreground/30 bg-transparent px-5 py-3 text-footer-foreground placeholder:text-footer-foreground/60 focus:border-footer-foreground focus:outline-none" />
      <button className="pill bg-clay text-clay-foreground hover:bg-clay-deep">{button}</button>
    </form>
  );
}

export const meta = (title: string, description: string) => ({
  meta: [
    { title: `${title} · ${STUDIO_NAME}` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} · ${STUDIO_NAME}` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});
