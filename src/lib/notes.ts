// Server-only: reads events/ at build time with `fs`, validates everything, and
// hands the rest of the app plain data. Never import this from a client
// component (it uses `fs`, so the bundler would refuse anyway).
//
// Anything invalid throws, and a throw fails `next build`.
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import { agendaSchema, frontmatterSchema, type Agenda, type Frontmatter } from "./schema";
import { longDayLabel, shortDayLabel, toMin } from "./time";
import type {
  DayInfo,
  EventData,
  ReadingItem,
  Session,
  TalkContent,
  Term,
} from "./types";

const ROOT = process.cwd();
const EVENTS_DIR = path.join(ROOT, "events");

const includeDrafts = () => process.env.FIELD_NOTES_DRAFTS === "1";

const rel = (p: string) => path.relative(ROOT, p) || p;

// --------------------------------------------------------------------------
// Small helpers
// --------------------------------------------------------------------------

function fail(file: string, message: string): never {
  throw new Error(`[field-notes] ${rel(file)}: ${message}`);
}

function readText(file: string, what: string): string {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return fail(file, `${what} is missing or unreadable`);
  }
}

function parseYamlFile(file: string, source: string): unknown {
  try {
    return parseYaml(source);
  } catch (error) {
    return fail(file, `invalid YAML: ${(error as Error).message}`);
  }
}

function validate<T extends z.ZodType>(schema: T, data: unknown, file: string): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) fail(file, `invalid:\n${z.prettifyError(result.error)}`);
  return result.data;
}

/** GitHub's heading anchor: lower case, spaces to hyphens, other punctuation dropped. */
export function githubAnchor(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_\s-]/gu, "")
    .replace(/ /g, "-");
}

// --------------------------------------------------------------------------
// Talk files
// --------------------------------------------------------------------------

function splitFrontmatter(raw: string, file: string): { data: unknown; body: string } {
  const match = raw
    .replace(/^﻿/, "")
    .match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n([\s\S]*))?$/);
  if (!match) fail(file, "missing frontmatter (the file must start with a --- block)");
  return { data: parseYamlFile(file, match[1]), body: match[2] ?? "" };
}

const SECTIONS = ["In one line", "Key ideas", "Worth reading", "Terms"] as const;
type SectionName = (typeof SECTIONS)[number];

/** Splits a talk body at its `##` headings, ignoring any inside fenced code. */
function splitSections(body: string, file: string): Partial<Record<SectionName, string>> {
  const lines: Partial<Record<SectionName, string[]>> = {};
  let current: SectionName | null = null;
  let fence: string | null = null;

  for (const line of body.split(/\r?\n/)) {
    const fenceMatch = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fenceMatch) {
      if (fence === null) fence = fenceMatch[1][0];
      else if (fenceMatch[1][0] === fence) fence = null;
    }

    const heading = fence === null ? line.match(/^##\s+(.+?)\s*$/) : null;
    if (heading) {
      const name = heading[1] as SectionName;
      if (!SECTIONS.includes(name)) {
        fail(file, `unknown section "## ${heading[1]}" (expected: ${SECTIONS.join(", ")})`);
      }
      if (lines[name]) fail(file, `section "## ${name}" appears twice`);
      lines[name] = [];
      current = name;
      continue;
    }

    if (current) lines[current]!.push(line);
    else if (line.trim() !== "") fail(file, "text before the first ## section");
  }

  const out: Partial<Record<SectionName, string>> = {};
  for (const name of SECTIONS) if (lines[name]) out[name] = lines[name]!.join("\n").trim();
  return out;
}

function parseReading(text: string, file: string): ReadingItem[] {
  const entries: string[] = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const bullet = trimmed.match(/^[-*]\s+(.*)$/);
    if (bullet) entries.push(bullet[1]);
    else if (entries.length) entries[entries.length - 1] += ` ${trimmed}`;
    else fail(file, `"## Worth reading" must be a bullet list (found: "${trimmed}")`);
  }

  return entries.map((entry, index) => {
    const id = `reading-${index}`;
    const linked = entry.match(/^\[(.+?)\]\(([^)\s]+)\)\s*:?\s*(.*)$/);
    if (linked) return { id, title: linked[1].trim(), url: linked[2], rest: linked[3].trim() };
    const split = entry.indexOf(": ");
    if (split === -1) return { id, title: entry.trim(), url: null, rest: "" };
    return { id, title: entry.slice(0, split).trim(), url: null, rest: entry.slice(split + 2).trim() };
  });
}

function parseTerms(text: string, file: string): Term[] {
  const terms: { name: string; lines: string[] }[] = [];
  for (const line of text.split("\n")) {
    const heading = line.match(/^###\s+(.+?)\s*$/);
    if (heading) terms.push({ name: heading[1], lines: [] });
    else if (terms.length) terms[terms.length - 1].lines.push(line);
    else if (line.trim() !== "") fail(file, `text before the first "### term" under "## Terms"`);
  }

  const seen = new Set<string>();
  return terms.map(({ name, lines }) => {
    const id = githubAnchor(name);
    if (!id) fail(file, `term "${name}" has no usable anchor`);
    if (seen.has(id)) fail(file, `two terms share the anchor #${id}`);
    seen.add(id);
    const definition = lines
      .join("\n")
      .trim()
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " "))
      .join("\n\n");
    if (!definition) fail(file, `term "${name}" has no definition`);
    return { id, name, definition };
  });
}

const UNSAFE_SVG = /<script|<foreignObject|<iframe|<object|<embed|\son[a-z]+\s*=|javascript:/i;

function readDiagram(eventDir: string, talkFile: string, name: string) {
  const file = path.join(eventDir, "diagrams", name);
  if (!fs.existsSync(file)) fail(talkFile, `diagram "${name}" is listed but ${rel(file)} does not exist`);
  const svg = fs.readFileSync(file, "utf8").trim();
  if (!/^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg[\s>]/.test(svg)) fail(file, "not an SVG file");
  // Inline SVG is accepted because it comes from this repo, but a script in one
  // (say, from a contributed correction) would run on the site's origin.
  if (UNSAFE_SVG.test(svg)) fail(file, "contains a script, event handler or embedded object");
  return { file: name, svg };
}

// --------------------------------------------------------------------------
// Loading
// --------------------------------------------------------------------------

type LoadedEvent = { data: EventData; talks: Record<string, TalkContent> };

function checkSameAsAgenda(
  file: string,
  fm: Frontmatter,
  s: Agenda["sessions"][number],
  agendaFile: string,
) {
  const problems: string[] = [];
  const same = (field: string, a: unknown, b: unknown) => {
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      problems.push(`${field}: talk says ${JSON.stringify(a)}, agenda says ${JSON.stringify(b)}`);
    }
  };
  const time = fm.time.replace(/\s/g, "").replace("-", "–");
  same("slug", fm.slug, s.slug);
  same("date", fm.date, s.date);
  same("time", time, `${s.start}–${s.end}`);
  same("session", fm.session, s.session);
  same("title", fm.title, s.title);
  same("topic", fm.topic, s.topic);
  same("themes", [...fm.themes].sort(), [...s.themes].sort());
  same("speakers", fm.speakers.map((p) => p.name), s.speakers.map((p) => p.name));
  same("moderator", fm.moderator?.name ?? null, s.moderator?.name ?? null);
  if (problems.length) {
    fail(file, `does not match its entry in ${rel(agendaFile)}:\n  - ${problems.join("\n  - ")}`);
  }
}

function loadEvent(folder: string): LoadedEvent | null {
  const eventDir = path.join(EVENTS_DIR, folder);
  const agendaFile = path.join(eventDir, "agenda.yaml");
  const agenda = validate(agendaSchema, parseYamlFile(agendaFile, readText(agendaFile, "agenda.yaml")), agendaFile);
  const ev = agenda.event;

  if (ev.slug !== folder) {
    fail(agendaFile, `event.slug "${ev.slug}" must equal the folder name "${folder}"`);
  }

  const themeIds = new Set<string>();
  for (const theme of agenda.themes) {
    if (themeIds.has(theme.id)) fail(agendaFile, `theme "${theme.id}" is defined twice`);
    themeIds.add(theme.id);
  }

  const sessionSlugs = new Set<string>();
  const sessions: Session[] = [];
  const talks: Record<string, TalkContent> = {};

  for (const s of agenda.sessions) {
    if (sessionSlugs.has(s.slug)) fail(agendaFile, `session "${s.slug}" appears twice`);
    sessionSlugs.add(s.slug);

    const where = `session "${s.slug}"`;
    if (ev.dates[s.day - 1] !== s.date) {
      fail(agendaFile, `${where}: day ${s.day} must be ${ev.dates[s.day - 1] ?? "a day listed in event.dates"}, but date is ${s.date}`);
    }
    if (toMin(s.end) <= toMin(s.start)) fail(agendaFile, `${where}: end must be after start`);
    for (const id of s.themes) {
      if (!themeIds.has(id)) fail(agendaFile, `${where}: theme "${id}" is not defined in this event`);
    }
    if (!s.topic.trim() && !s.title.trim()) fail(agendaFile, `${where}: needs a title or a topic`);

    const pageFile = path.resolve(eventDir, s.page);
    if (!pageFile.startsWith(`${eventDir}${path.sep}`)) fail(agendaFile, `${where}: page must stay inside the event folder`);
    if (!fs.existsSync(pageFile)) fail(agendaFile, `${where}: page "${s.page}" does not exist`);

    const { data, body } = splitFrontmatter(readText(pageFile, "talk file"), pageFile);
    const fm = validate(frontmatterSchema, data, pageFile);

    for (const id of fm.themes) {
      if (!themeIds.has(id)) fail(pageFile, `theme "${id}" is not defined in ${rel(agendaFile)}`);
    }
    checkSameAsAgenda(pageFile, fm, s, agendaFile);

    // Drafts are checked above, but never rendered or published.
    if (fm.status !== "published" && !includeDrafts()) continue;

    const sections = splitSections(body, pageFile);
    for (const required of ["In one line", "Key ideas"] as const) {
      if (!sections[required]) fail(pageFile, `missing the "## ${required}" section`);
    }

    const diagrams = fm.diagrams.map((name) => readDiagram(eventDir, pageFile, name));

    talks[s.slug] = {
      oneLine: sections["In one line"]!,
      keyIdeas: sections["Key ideas"]!,
      reading: sections["Worth reading"] ? parseReading(sections["Worth reading"], pageFile) : [],
      terms: sections["Terms"] ? parseTerms(sections["Terms"], pageFile) : [],
      diagrams,
      filePath: rel(pageFile),
    };

    sessions.push({
      slug: s.slug,
      day: s.day,
      date: s.date,
      start: s.start,
      end: s.end,
      startMin: toMin(s.start),
      endMin: toMin(s.end),
      type: s.session,
      speakers: fm.speakers.map((p) => ({
        name: p.name,
        affiliation: p.affiliation,
        link: p.link || null,
      })),
      moderator: fm.moderator
        ? { name: fm.moderator.name, affiliation: fm.moderator.affiliation, link: null }
        : null,
      title: s.title.trim(),
      topic: s.topic.trim(),
      heading: s.title.trim() || s.topic.trim(),
      summary: s.summary.trim(),
      themes: s.themes,
    });
  }

  // A talk file the agenda doesn't mention would never show up anywhere.
  const listed = new Set(agenda.sessions.map((s) => path.resolve(eventDir, s.page)));
  const talksDir = path.join(eventDir, "talks");
  if (fs.existsSync(talksDir)) {
    for (const name of fs.readdirSync(talksDir)) {
      const full = path.join(talksDir, name);
      if (name.endsWith(".md") && !name.startsWith("_") && !listed.has(full)) {
        console.warn(`[field-notes] ${rel(full)} is not listed in ${rel(agendaFile)}, so it is skipped`);
      }
    }
  }

  if (sessions.length === 0) return null;

  sessions.sort((a, b) => a.day - b.day || a.startMin - b.startMin);

  for (let i = 1; i < sessions.length; i++) {
    const a = sessions[i - 1];
    const b = sessions[i];
    if (a.day === b.day && b.startMin < a.endMin) {
      fail(agendaFile, `sessions "${a.slug}" and "${b.slug}" overlap on day ${a.day}`);
    }
  }

  const days: DayInfo[] = [];
  for (const s of sessions) {
    if (!days.some((d) => d.day === s.day)) {
      days.push({ day: s.day, date: s.date, long: longDayLabel(s.date), short: shortDayLabel(s.date) });
    }
  }

  return {
    talks,
    data: {
      slug: ev.slug,
      name: ev.name,
      fullName: ev.full_name,
      kind: ev.kind,
      dates: ev.dates,
      dateLabel: ev.date_label,
      venue: ev.venue,
      agendaUrl: ev.agenda_url || null,
      description: ev.description,
      themes: agenda.themes,
      sessions,
      days,
    },
  };
}

function loadAll(): LoadedEvent[] {
  if (!fs.existsSync(EVENTS_DIR)) return [];

  const folders = fs
    .readdirSync(EVENTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_") && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort();

  const loaded: LoadedEvent[] = [];
  for (const folder of folders) {
    const event = loadEvent(folder);
    if (event) loaded.push(event);
  }

  // Newest first: by last day of the event, then by name.
  const lastDay = (e: LoadedEvent) => [...e.data.dates].sort().at(-1) ?? "";
  return loaded.sort((a, b) => lastDay(b).localeCompare(lastDay(a)) || a.data.name.localeCompare(b.data.name));
}

// A production build with nothing to publish fails, with this message. Next
// itself cannot export a dynamic route that has no pages, and its own error
// ("returned an empty array from generateStaticParams()") says nothing useful.
//
// It is raised here, in the one function every read of events/ goes through,
// because each route's generateStaticParams() calls it before returning, so this
// is always the first thing the build reports. It only applies to production
// builds: `next dev` (and typegen and lint) never reach it, and dev keeps its
// empty home page.
export const NOTHING_PUBLISHED =
  "No published talks yet. Publish at least one talk (set status: published), or preview drafts with: FIELD_NOTES_DRAFTS=1 pnpm build";

// Production builds read the files once. In `next dev`, re-read on every call so
// edits to events/ show up on refresh (those files are outside what dev watches).
let cache: LoadedEvent[] | null = null;
function all(): LoadedEvent[] {
  if (process.env.NODE_ENV !== "production") return loadAll();
  if (!cache) {
    const loaded = loadAll();
    if (loaded.length === 0 && !includeDrafts()) throw new Error(NOTHING_PUBLISHED);
    cache = loaded;
  }
  return cache;
}

// --------------------------------------------------------------------------
// Public API
// --------------------------------------------------------------------------

/** Events that have at least one included talk, newest first. */
export function getEvents(): EventData[] {
  return all().map((e) => e.data);
}

export function getEvent(slug: string): EventData | null {
  return all().find((e) => e.data.slug === slug)?.data ?? null;
}

export type TalkPage = {
  event: EventData;
  session: Session;
  content: TalkContent;
  /** Neighbours in time order across all days, included talks only. */
  previous: Session | null;
  next: Session | null;
};

export function getTalk(eventSlug: string, talkSlug: string): TalkPage | null {
  const loaded = all().find((e) => e.data.slug === eventSlug);
  if (!loaded) return null;
  const index = loaded.data.sessions.findIndex((s) => s.slug === talkSlug);
  if (index === -1) return null;
  const sessions = loaded.data.sessions;
  return {
    event: loaded.data,
    session: sessions[index],
    content: loaded.talks[talkSlug],
    previous: sessions[index - 1] ?? null,
    next: sessions[index + 1] ?? null,
  };
}

/** For `generateStaticParams` of /[event]. */
export function getEventParams(): { event: string }[] {
  return getEvents().map((e) => ({ event: e.slug }));
}

/** For `generateStaticParams` of /[event]/[talk]. */
export function getTalkParams(): { event: string; talk: string }[] {
  return getEvents().flatMap((e) => e.sessions.map((s) => ({ event: e.slug, talk: s.slug })));
}
