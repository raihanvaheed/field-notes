import type { Session } from "./types";

// Lower-case name parts that belong to the surname that follows them
// ("Khaled El Emam" -> "El Emam").
const PARTICLES = new Set([
  "al", "bin", "da", "das", "de", "del", "della", "den", "der", "di", "do", "dos", "du",
  "el", "ibn", "la", "le", "ter", "van", "von",
]);

/** A short label for tight spaces: "Joaquin Vanschoren" -> "Vanschoren". */
export function surname(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  let start = parts.length - 1;
  while (start > 0 && PARTICLES.has(parts[start - 1].toLowerCase().replace(/\.$/, ""))) start -= 1;
  return parts.slice(start).join(" ");
}

/** Speaker names, joined: "Alan Forster, Kathy Malas, Danina Kapetanovic". */
export function speakerNames(session: Pick<Session, "speakers">): string {
  return session.speakers.map((p) => p.name).join(", ");
}

/** A short label for a session in tight spaces: a surname, or the session type for a panel. */
export function shortLabel(session: Pick<Session, "speakers" | "type">): string {
  return session.speakers.length === 1 ? surname(session.speakers[0].name) : session.type;
}

/** A full label for assistive technology: the speaker's name, or "Panel: names". */
export function fullLabel(session: Pick<Session, "speakers" | "type">): string {
  return session.speakers.length === 1
    ? session.speakers[0].name
    : `${session.type}: ${speakerNames(session)}`;
}
