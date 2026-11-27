// The single price list. Server code reads prices from here; the browser never sends a price.
export type IntakeKind = "general" | "prenatal" | "postnatal";
export type CatalogItem = {
  key: string;
  name: string;
  /** Which scheduled sessions this item books into. */
  sessionKey: string;
  pricePaise: number;
  unit: string;
  kind: IntakeKind;
};

export const CATALOG: CatalogItem[] = [
  { key: "beginner", name: "Beginner Hatha Yoga", sessionKey: "beginner", pricePaise: 49900, unit: "per session", kind: "general" },
  { key: "beginner-2x", name: "Beginner, 2 days a week", sessionKey: "beginner", pricePaise: 359900, unit: "per month", kind: "general" },
  { key: "beginner-3x", name: "Beginner, 3 days a week", sessionKey: "beginner", pricePaise: 459900, unit: "per month", kind: "general" },
  { key: "prenatal", name: "Prenatal Yoga", sessionKey: "prenatal", pricePaise: 69900, unit: "per session", kind: "prenatal" },
  { key: "postnatal", name: "Postnatal Yoga", sessionKey: "postnatal", pricePaise: 69900, unit: "per session", kind: "postnatal" },
  { key: "sound", name: "Sound Meditation", sessionKey: "sound", pricePaise: 89900, unit: "per session", kind: "general" },
  { key: "sound-monthly", name: "Sound meditation monthly", sessionKey: "sound", pricePaise: 349900, unit: "per month", kind: "general" },
  { key: "weekend-reset", name: "Weekend reset", sessionKey: "weekend-reset", pricePaise: 49900, unit: "per session", kind: "general" },
  { key: "nidra", name: "Yoga Nidra", sessionKey: "weekend-reset", pricePaise: 49900, unit: "per session", kind: "general" },
  { key: "pranayama", name: "Pranayama", sessionKey: "weekend-reset", pricePaise: 29900, unit: "per session", kind: "general" },
  { key: "journaling", name: "Brain Dump (Journaling)", sessionKey: "weekend-reset", pricePaise: 29900, unit: "per session", kind: "general" },
  { key: "letting-go", name: "The Art of Letting Go", sessionKey: "letting-go", pricePaise: 129900, unit: "per session", kind: "general" },
  { key: "slow-friday", name: "Take It Slow Friday", sessionKey: "slow-friday", pricePaise: 49900, unit: "per session", kind: "general" },
];

export const SESSION_KINDS = [
  { key: "beginner", name: "Beginner Hatha Yoga" },
  { key: "prenatal", name: "Prenatal Yoga" },
  { key: "postnatal", name: "Postnatal Yoga" },
  { key: "sound", name: "Sound meditation" },
  { key: "weekend-reset", name: "Weekend reset" },
  { key: "letting-go", name: "The art of letting go" },
  { key: "slow-friday", name: "Take it slow Friday" },
];

export const findItem = (key: string) => CATALOG.find((c) => c.key === key);
export const rupees = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;
export const fmtWhen = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
export const isMaternity = (sessionKey: string) => sessionKey === "prenatal" || sessionKey === "postnatal";
