import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fmtWhen, rupees } from "@/lib/catalog";
import { isHoldExpired } from "@/lib/booking-rules";
import { Page, meta } from "@/components/site";

export const Route = createFileRoute("/_authenticated/my-classes")({
  head: () => meta("My classes", "Your upcoming and past sessions, receipts and packages."),
  component: MyClasses,
});

const label: Record<string, string> = { held: "Awaiting payment", confirmed: "Paid", waitlisted: "Waiting list", cancel_requested: "Cancel requested", cancelled: "Cancelled", expired: "Hold ended" };

function MyClasses() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["my-classes"],
    queryFn: async () => {
      const [{ data: bookings, error }, { data: packages }, { data: user }] = await Promise.all([
        supabase.from("bookings").select("id, item_name, status, amount_paise, hold_expires_at, created_at, sessions(starts_at)").order("created_at", { ascending: false }),
        supabase.from("packages").select("id, plan, classes_remaining"),
        supabase.auth.getUser(),
      ]);
      if (error) throw error;
      const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.user!.id, _role: "admin" });
      return { bookings: bookings ?? [], packages: packages ?? [], isAdmin: !!isAdmin, email: user.user?.email };
    },
  });

  async function cancel(id: string) {
    if (!confirm("Ask to cancel this booking? We'll follow up on refunds as per the policy.")) return;
    const { error } = await supabase.rpc("request_cancel", { _booking_id: id });
    if (error) alert("We couldn't send the request. Please message us instead.");
    qc.invalidateQueries({ queryKey: ["my-classes"] });
  }

  if (q.isLoading) return <Page><p className="text-muted-foreground">Loading your classes…</p></Page>;
  if (q.error || !q.data) return <Page><p role="alert">We couldn't load your classes. Please refresh.</p></Page>;
  const now = new Date();
  const rows = q.data.bookings.map((b) => ({ ...b, shown: isHoldExpired(b.status, b.hold_expires_at) ? "expired" : b.status }));
  const upcoming = rows.filter((b) => b.sessions && new Date(b.sessions.starts_at) > now);
  const past = rows.filter((b) => !b.sessions || new Date(b.sessions.starts_at) <= now);

  const Rows = ({ list, canCancel }: { list: typeof rows; canCancel: boolean }) => list.length === 0
    ? <p className="text-muted-foreground">Nothing here yet.</p>
    : <ul className="border-t border-hairline">{list.map((b) => (
      <li key={b.id} className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline py-5">
        <div>
          <p className="font-medium">{b.item_name}</p>
          <p className="text-[0.9375rem] text-muted-foreground">{b.sessions ? fmtWhen(b.sessions.starts_at) : ""} · {label[b.shown]}</p>
          <p className="text-sm text-muted-foreground">Receipt {b.id.slice(0, 8).toUpperCase()} · {rupees(b.amount_paise)} · booked {new Date(b.created_at).toLocaleDateString("en-IN")}</p>
        </div>
        {canCancel && ["confirmed", "held", "waitlisted"].includes(b.shown) && (
          <button onClick={() => cancel(b.id)} className="text-sm text-primary underline underline-offset-4">Request cancellation</button>
        )}
      </li>))}</ul>;

  return (
    <Page>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2"><h1 className="text-[34px] md:text-[44px]">My classes</h1><p className="text-muted-foreground">Signed in as {q.data.email}</p></div>
        <div className="flex gap-5 text-[0.9375rem]">
          {q.data.isAdmin && <Link to="/admin" className="text-olive underline underline-offset-4">Admin</Link>}
          <button onClick={() => supabase.auth.signOut()} className="text-muted-foreground underline underline-offset-4">Sign out</button>
        </div>
      </div>
      {q.data.packages.length > 0 && (
        <section className="space-y-4"><h2 className="text-[28px]">Packages</h2>
          {q.data.packages.map((p) => <p key={p.id}>{p.plan}: <strong>{p.classes_remaining}</strong> classes remaining</p>)}</section>
      )}
      <section className="space-y-4"><h2 className="text-[28px]">Upcoming</h2>
        {rows.length === 0 ? <p className="text-muted-foreground">No bookings yet for this email. <Link to="/" className="text-olive underline">Find a class</Link></p> : <Rows list={upcoming} canCancel />}
      </section>
      <section className="space-y-4"><h2 className="text-[28px]">Past</h2><Rows list={past} canCancel={false} /></section>
    </Page>
  );
}
