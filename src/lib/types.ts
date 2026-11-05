// Shared, client-safe types for the notes. Nothing in this file touches `fs`,
// so client components can import it freely.

export type Theme = { id: string; label: string; color: string };

export type Person = {
  name: string;
  affiliation: string;
  /** Public page for the speaker, or null when there is none. */
  link: string | null;
};

/** One agenda entry for a talk that is included in the build. */
export type Session = {
  slug: string;
  /** 1-based day number, as written in agenda.yaml. */
  day: number;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  /** "HH:MM" */
  start: string;
  end: string;
  startMin: number;
  endMin: number;
  /** Keynote, Invited talk, Panel... */
  type: string;
  speakers: Person[];
  moderator: Person | null;
  /** Official title; empty string when unknown. */
  title: string;
  topic: string;
  /** `title`, or `topic` when the title is empty. */
  heading: string;
  summary: string;
  /** Theme ids. */
  themes: string[];
};

export type DayInfo = {
  day: number;
  date: string;
  /** "Tuesday 3 November" */
  long: string;
  /** "Tue 3 Nov" */
  short: string;
};

export type EventData = {
  slug: string;
  name: string;
  fullName: string;
  kind: string;
  dates: string[];
  dateLabel: string;
  venue: string;
  agendaUrl: string | null;
  description: string;
  themes: Theme[];
  /** Included sessions only, ordered by day then start time. */
  sessions: Session[];
  /** Days that have at least one included session. */
  days: DayInfo[];
};

export type ReadingItem = {
  /** Stable id for the side panel ("reading-0", "reading-1"...). */
  id: string;
  title: string;
  url: string | null;
  /** Everything after the title: "who, year. Why read it." */
  rest: string;
};

export type Term = {
  /** GitHub anchor of the heading: "KV cache" -> "kv-cache". */
  id: string;
  name: string;
  /** Plain text. Paragraphs are separated by a blank line. */
  definition: string;
};

export type Diagram = { file: string; svg: string };

export type TalkContent = {
  oneLine: string;
  keyIdeas: string;
  reading: ReadingItem[];
  terms: Term[];
  diagrams: Diagram[];
  /** Repo-relative path, used in build error messages. */
  filePath: string;
};
