// WhatsApp notifications: switched off until a provider API key is added as the
// WHATSAPP_API_KEY secret. Nothing is sent while it is missing.
export type WhatsAppTemplate = "booking_confirmed" | "reminder_day_before" | "cancellation";

export const WHATSAPP_TEMPLATES: Record<WhatsAppTemplate, (d: { name: string; className: string; when: string }) => string> = {
  booking_confirmed: (d) => `Hi ${d.name}, your spot for ${d.className} on ${d.when} is confirmed. See you on the mat.`,
  reminder_day_before: (d) => `Hi ${d.name}, a gentle reminder: ${d.className} is tomorrow, ${d.when}.`,
  cancellation: (d) => `Hi ${d.name}, your booking for ${d.className} on ${d.when} has been cancelled.`,
};

export async function sendWhatsApp(_to: string, template: WhatsAppTemplate, data: { name: string; className: string; when: string }) {
  const key = process.env["WHATSAPP_API_KEY"];
  const text = WHATSAPP_TEMPLATES[template](data);
  if (!key) return { sent: false as const, reason: "not_configured" as const, text };
  // Placeholder: call the chosen WhatsApp provider here once it is picked.
  return { sent: false as const, reason: "provider_not_implemented" as const, text };
}
