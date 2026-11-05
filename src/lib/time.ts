// Time and date helpers. Pure functions, safe to use on server and client.

/** "09:40" -> 580 */
export function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":");
  return Number(h) * 60 + Number(m);
}

/** 570 -> "09:30" */
export function fromMin(min: number): string {
  const h = String(Math.floor(min / 60)).padStart(2, "0");
  const m = String(min % 60).padStart(2, "0");
  return `${h}:${m}`;
}

const parts = (date: string, options: Intl.DateTimeFormatOptions) => {
  const formatter = new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "UTC" });
  const out: Record<string, string> = {};
  for (const p of formatter.formatToParts(new Date(`${date}T00:00:00Z`))) out[p.type] = p.value;
  return out;
};

/** "2026-11-03" -> "Tuesday 3 November" (no commas, whatever the ICU build). */
export function longDayLabel(date: string): string {
  const p = parts(date, { weekday: "long", day: "numeric", month: "long" });
  return `${p.weekday} ${p.day} ${p.month}`;
}

/** "2026-11-03" -> "Tue 3 Nov" */
export function shortDayLabel(date: string): string {
  const p = parts(date, { weekday: "short", day: "numeric", month: "short" });
  return `${p.weekday} ${p.day} ${p.month}`;
}
