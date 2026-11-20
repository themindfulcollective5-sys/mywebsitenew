import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SESSION_KINDS, fmtWhen, isMaternity, rupees } from "@/lib/catalog";
import { isHoldExpired } from "@/lib/booking-rules";
import { Page, meta } from "@/components/site";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => meta("Admin", "Studio roster and bookings."),
  component: Admin,
});

const field = "rounded-2xl border border-hairline bg-background px-3 py-2 focus:border-olive focus:outline-none";
type Answers = Record<string, string | boolean | undefined>;

async function load() {
  const { data: u } = await supabase.auth.getUser();
  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: u.user!.id, _role: "admin" });
  if (!isAdmin) return null;
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const { data, error } = await supabase.from("sessions")
    .select("id, class_key, class_name, starts_at, duration_min, capacity, mode, bookings(id, item_name, status, amount_paise, hold_expires_at, attended, payment_id, created_at, customers(name, phone, email), intake_answers(answers))")
    .gte("starts_at", start.toISOString()).order("starts_at").limit(200);
  if (error) throw error;
  return data ?? [];
}
type S = NonNullable<Awaited<ReturnType<typeof load>>>[number];
type B = S["bookings"][number];
const answersOf = (b: B): Answers => {
  const ia = b.intake_answers as unknown;
  const one = Array.isArray(ia) ? ia[0] : ia;
  return ((one as { answers?: Answers } | null)?.answers ?? {}) as Answers;
};
const shown = (b: B) => (isHoldExpired(b.status, b.hold_expires_at) ? "expired" : b.status);
const counts = (b: B) => ["confirmed", "cancel_requested"].includes(shown(b)) || shown(b) === "held";

function Admin() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin"], queryFn: load });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin"] });
  const [editing, setEditing] = useState<S | "new" | null>(null);
  const [err, setErr] = useState("");

  async function update(id: string, patch: { status?: "confirmed" | "cancelled" | "held"; attended?: boolean }) {
    setErr("");
    const { error } = await supabase.from("bookings").update(patch).eq("id", id);
    if (error) setErr("That change didn't save. Please try again.");
    refresh();
  }

  function exportCsv(sessions: S[]) {
    const head = ["Session", "Date", "Booking", "Name", "Phone", "Email", "Status", "Amount", "Attended", "Answers"];
    const rows = sessions.flatMap((s) => s.bookings.map((b) => [s.class_name, fmtWhen(s.starts_at), b.item_name, b.customers?.name, b.customers?.phone, b.customers?.email, shown(b), (b.amount_paise / 100).toString(), b.attended ? "yes" : "no", JSON.stringify(answersOf(b))]));
    const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  if (q.isLoading) return <Page><p className="text-muted-foreground">Loading…</p></Page>;
  if (q.error) return <Page><p role="alert">We couldn't load the roster. Please refresh.</p></Page>;
  if (q.data === null) return <Page><h1 className="text-[34px]">Admins only</h1><p className="text-muted-foreground">This page is for the studio owner.</p></Page>;
  const sessions = q.data ?? [];
  const today = new Date().toDateString();
  const todays = sessions.filter((s) => new Date(s.starts_at).toDateString() === today);
  const later = sessions.filter((s) => new Date(s.starts_at).toDateString() !== today);

  const SessionCard = ({ s }: { s: S }) => {
    const taken = s.bookings.filter(counts).length;
    return (
      <article className="space-y-4 rounded-[1.5rem] border border-hairline p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="font-serif text-xl text-olive">{s.class_name}</p><p className="text-sm text-muted-foreground">{fmtWhen(s.starts_at)} · {s.duration_min} min · {taken}/{s.capacity} booked</p></div>
          <button onClick={() => setEditing(s)} className="text-sm text-olive underline underline-offset-4">Edit</button>
        </div>
        {s.bookings.length === 0 ? <p className="text-sm text-muted-foreground">No bookings yet.</p> : (
          <ul className="divide-y divide-hairline">
            {s.bookings.map((b) => { const a = answersOf(b); const st = shown(b); return (
              <li key={b.id} className="space-y-2 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{b.customers?.name} {isMaternity(s.class_key) && <span className="ml-2 rounded-full bg-clay px-2 py-0.5 text-xs text-clay-foreground">{s.class_key === "prenatal" ? `Prenatal · ${a["pregnancyWeeks"] ?? "?"} wks` : `Postnatal · ${a["monthsSinceBirth"] ?? "?"} mo`}{a["doctorCleared"] ? " · cleared" : ""}</span>}</p>
                    <p className="text-sm text-muted-foreground">{b.customers?.phone} · {b.item_name} · {rupees(b.amount_paise)} · <strong>{st.replace("_", " ")}</strong></p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <label className="flex items-center gap-1"><input type="checkbox" checked={b.attended} onChange={(e) => update(b.id, { attended: e.target.checked })} /> Attended</label>
                    {st !== "confirmed" && st !== "cancelled" && <button onClick={() => update(b.id, { status: "confirmed" })} className="text-olive underline">Mark paid</button>}
                    {st !== "cancelled" && <button onClick={() => update(b.id, { status: "cancelled" })} className="text-primary underline">Cancel</button>}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Sleep: {String(a["sleep"] ?? "–")} · Stress: {String(a["stress"] ?? "–")} · Goal: {String(a["goal"] ?? "–")}{a["health"] ? ` · Health: ${String(a["health"])}` : ""}</p>
              </li>); })}
          </ul>
        )}
      </article>
    );
  };

  return (
    <Page>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[34px] md:text-[44px]">Studio admin</h1>
        <div className="flex gap-3">
          <button onClick={() => setEditing("new")} className="pill bg-primary text-primary-foreground hover:bg-primary/90">Add session</button>
          <button onClick={() => exportCsv(sessions)} className="pill border border-primary text-primary">Export CSV</button>
        </div>
      </div>
      {err && <p role="alert" className="text-primary">{err}</p>}
      {editing && <SessionForm s={editing === "new" ? null : editing} onDone={() => { setEditing(null); refresh(); }} />}
      <section className="space-y-4"><h2 className="text-[28px]">Today's roster</h2>
        {todays.length === 0 ? <p className="text-muted-foreground">No sessions today.</p> : todays.map((s) => <SessionCard key={s.id} s={s} />)}</section>
      <section className="space-y-4"><h2 className="text-[28px]">Upcoming</h2>
        {later.length === 0 ? <p className="text-muted-foreground">No upcoming sessions. Add one above.</p> : later.map((s) => <SessionCard key={s.id} s={s} />)}</section>
    </Page>
  );
}

const toLocal = (iso: string) => { const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };

function SessionForm({ s, onDone }: { s: S | null; onDone: () => void }) {
  const [v, setV] = useState({ class_key: s?.class_key ?? "beginner", starts_at: s ? toLocal(s.starts_at) : "", duration_min: s?.duration_min ?? 60, capacity: s?.capacity ?? 10, mode: s?.mode ?? "Online and offline" });
  const [err, setErr] = useState("");
  async function save(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    if (!v.starts_at) return setErr("Please choose a date and time.");
    const kind = SESSION_KINDS.find((k) => k.key === v.class_key)!;
    const row = { class_key: v.class_key, class_name: kind.name, starts_at: new Date(v.starts_at).toISOString(), duration_min: Number(v.duration_min), capacity: Number(v.capacity), mode: v.mode, price_paise: 0 };
    const { error } = s ? await supabase.from("sessions").update(row).eq("id", s.id) : await supabase.from("sessions").insert(row);
    if (error) return setErr("The session didn't save. Please check the details.");
    onDone();
  }
  return (
    <form onSubmit={save} className="grid gap-3 rounded-[1.5rem] bg-clay p-5 text-clay-foreground sm:grid-cols-2">
      <p className="font-serif text-xl sm:col-span-2">{s ? "Edit session" : "New session"}</p>
      <label className="space-y-1"><span className="text-sm">Class</span><select className={`${field} w-full`} value={v.class_key} onChange={(e) => setV({ ...v, class_key: e.target.value })}>{SESSION_KINDS.map((k) => <option key={k.key} value={k.key}>{k.name}</option>)}</select></label>
      <label className="space-y-1"><span className="text-sm">Date and time</span><input type="datetime-local" className={`${field} w-full`} value={v.starts_at} onChange={(e) => setV({ ...v, starts_at: e.target.value })} /></label>
      <label className="space-y-1"><span className="text-sm">Minutes</span><input type="number" min={15} className={`${field} w-full`} value={v.duration_min} onChange={(e) => setV({ ...v, duration_min: Number(e.target.value) })} /></label>
      <label className="space-y-1"><span className="text-sm">Capacity</span><input type="number" min={1} className={`${field} w-full`} value={v.capacity} onChange={(e) => setV({ ...v, capacity: Number(e.target.value) })} /></label>
      <label className="space-y-1 sm:col-span-2"><span className="text-sm">Where</span><input className={`${field} w-full`} value={v.mode} onChange={(e) => setV({ ...v, mode: e.target.value })} /></label>
      {err && <p role="alert" className="sm:col-span-2">{err}</p>}
      <div className="flex gap-3 sm:col-span-2"><button className="pill bg-primary text-primary-foreground">Save</button><button type="button" onClick={onDone} className="underline">Close</button></div>
    </form>
  );
}
