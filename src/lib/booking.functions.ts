import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { findItem } from "./catalog";
import { holdExpiry, isHoldExpired, tooManyHolds } from "./booking-rules";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listSessionsForItem = createServerFn({ method: "GET" })
  .inputValidator((d: { item: string }) => z.object({ item: z.string().max(40) }).parse(d))
  .handler(async ({ data }) => {
    const item = findItem(data.item);
    if (!item) return { item: null, sessions: [] };
    const sb = publicClient();
    const { data: rows, error } = await sb.from("sessions").select("id, starts_at, duration_min, capacity, mode")
      .eq("class_key", item.sessionKey).gt("starts_at", new Date().toISOString()).order("starts_at").limit(20);
    if (error) throw new Error("We couldn't load the schedule. Please try again.");
    const sessions = await Promise.all((rows ?? []).map(async (s) => {
      const { data: taken } = await sb.rpc("session_spots_taken", { _session_id: s.id });
      return { ...s, spotsLeft: Math.max(0, s.capacity - (taken ?? 0)) };
    }));
    return { item, sessions };
  });

const bookingSchema = z.object({
  item: z.string().max(40),
  sessionId: z.string().uuid(),
  name: z.string().trim().min(1, "Please add your name").max(100),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{7,17}$/, "Please add a valid phone number"),
  email: z.string().trim().toLowerCase().email("Please add a valid email").max(255),
  answers: z.object({
    sleep: z.string().max(40),
    stress: z.string().max(10),
    health: z.string().max(1000),
    goal: z.string().max(200),
    pregnancyWeeks: z.string().max(10).optional(),
    monthsSinceBirth: z.string().max(10).optional(),
    doctorCleared: z.boolean().optional(),
  }),
  consent: z.literal(true, { errorMap: () => ({ message: "Please tick the consent box" }) }),
});

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((d: z.input<typeof bookingSchema>) => bookingSchema.parse(d))
  .handler(async ({ data }) => {
    const item = findItem(data.item);
    if (!item) throw new Error("This class is not available.");
    if (item.kind !== "general" && !data.answers.doctorCleared) throw new Error("Please confirm your doctor has cleared you.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: session } = await supabaseAdmin.from("sessions").select("id, starts_at, class_key").eq("id", data.sessionId).maybeSingle();
    if (!session || session.class_key !== item.sessionKey || new Date(session.starts_at) <= new Date())
      throw new Error("That date is no longer available. Please choose another.");
    const { data: existing } = await supabaseAdmin.from("customers").select("id").eq("email", data.email).maybeSingle();
    let customerId = existing?.id;
    if (!customerId) {
      const { data: created, error: cErr } = await supabaseAdmin.from("customers")
        .insert({ email: data.email, name: data.name, phone: data.phone }).select("id").single();
      if (created) customerId = created.id;
      else {
        // Another request may have created it at the same moment.
        const { data: again } = await supabaseAdmin.from("customers").select("id").eq("email", data.email).maybeSingle();
        if (!again || (cErr && !again)) throw new Error("We couldn't save your details. Please try again.");
        customerId = again.id;
      }
    }
    const nowIso = new Date().toISOString();
    const { data: sameEmailOrPhone } = await supabaseAdmin.from("customers").select("id")
      .or(`email.eq.${JSON.stringify(data.email)},phone.eq.${JSON.stringify(data.phone)}`);
    const ids = new Set((sameEmailOrPhone ?? []).map((c) => c.id));
    ids.add(customerId);
    const { data: holds } = await supabaseAdmin.from("bookings").select("customer_id, customers(email, phone)")
      .in("customer_id", [...ids]).eq("status", "held").gt("hold_expires_at", nowIso);
    const byEmail = (holds ?? []).filter((h) => h.customers?.email === data.email).length;
    const byPhone = (holds ?? []).filter((h) => h.customers?.phone === data.phone).length;
    if (tooManyHolds(byEmail, byPhone)) throw new Error("You already have bookings waiting for payment. Please finish or wait a few minutes.");
    const { data: reserved, error: bErr } = await supabaseAdmin.rpc("reserve_booking", {
      _session_id: session.id, _customer_id: customerId, _item_key: item.key, _item_name: item.name,
      _amount_paise: item.pricePaise, _hold_expires_at: holdExpiry(new Date()).toISOString(),
    });
    const booking = reserved?.[0] ? { id: reserved[0].booking_id } : null;
    if (bErr || !booking) throw new Error("We couldn't reserve your spot. Please try again.");
    await supabaseAdmin.from("intake_answers").insert({ booking_id: booking.id, answers: data.answers });
    return { id: booking.id };
  });

export const getBookingSummary = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: b } = await supabaseAdmin.from("bookings")
      .select("id, item_name, status, amount_paise, hold_expires_at, sessions(starts_at, mode), customers(name)")
      .eq("id", data.id).maybeSingle();
    if (!b) return null;
    return {
      id: b.id, itemName: b.item_name, amountPaise: b.amount_paise,
      status: isHoldExpired(b.status, b.hold_expires_at) ? "expired" : b.status,
      startsAt: b.sessions?.starts_at ?? null, mode: b.sessions?.mode ?? "", firstName: (b.customers?.name ?? "").split(" ")[0],
    };
  });
