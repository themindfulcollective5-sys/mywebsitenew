import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Page, meta } from "@/components/site";

export const Route = createFileRoute("/auth")({
  head: () => meta("Sign in", "Sign in with an email link or Google to see your classes."),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) navigate({ to: "/my-classes" }); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => { if (s) navigate({ to: "/my-classes" }); });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault(); setError("");
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/auth` } });
    if (error) setError("We couldn't send the link. Please check your email and try again."); else setSent(true);
  }
  async function google() {
    setError("");
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` });
    if (r.error) setError("Google sign-in didn't work. Please try the email link instead.");
  }

  return (
    <Page>
      <section className="max-w-[440px] space-y-6">
        <h1 className="text-[34px]">Sign in</h1>
        <p className="text-muted-foreground">Use the email you booked with. No password needed.</p>
        {sent ? <p role="status" className="rounded-[1.5rem] bg-clay p-5 text-clay-foreground">Check your inbox for a sign-in link.</p> : (
          <form onSubmit={sendLink} className="space-y-3">
            <label className="sr-only" htmlFor="auth-email">Email</label>
            <input id="auth-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email"
              className="w-full rounded-2xl border border-hairline bg-background px-4 py-3 focus:border-olive focus:outline-none" />
            <button className="pill w-full bg-primary text-primary-foreground hover:bg-primary/90">Email me a sign-in link</button>
          </form>
        )}
        <button type="button" onClick={google} className="flex w-full items-center justify-center gap-[10px] rounded-full border border-[#747775] bg-[#FFFFFF] px-3 py-3 text-sm font-medium text-[#1F1F1F]">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
          Continue with Google
        </button>
        {error && <p role="alert" className="text-primary">{error}</p>}
      </section>
    </Page>
  );
}
