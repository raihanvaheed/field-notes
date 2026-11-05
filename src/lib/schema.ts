// zod schemas for agenda.yaml and talk frontmatter. Used by notes.ts only.
// Objects are strict, so a mistyped key fails the build instead of being ignored.
import { z } from "zod";

const idLike = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "use lower-case letters, digits and single hyphens");

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use YYYY-MM-DD");

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'use 24-hour "HH:MM", in quotes');

const nonEmpty = z.string().trim().min(1, "must not be empty");

/** A URL, or an empty string meaning "none". */
const optionalUrl = z
  .string()
  .default("")
  .refine((v) => v === "" || /^https?:\/\/\S+$/.test(v), "must be empty or an http(s) URL");

const agendaPerson = z.strictObject({
  name: nonEmpty,
  affiliation: z.string().default(""),
});

export const agendaSchema = z.strictObject({
  event: z.strictObject({
    slug: idLike,
    name: nonEmpty,
    full_name: nonEmpty,
    kind: nonEmpty,
    dates: z.array(isoDate).min(1),
    date_label: nonEmpty,
    venue: nonEmpty,
    agenda_url: optionalUrl,
    description: nonEmpty,
  }),
  themes: z
    .array(
      z.strictObject({
        id: idLike,
        label: nonEmpty,
        // Six-digit hex only: the site appends alpha digits to it (e.g. "#22d3ee24").
        color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'use a six-digit hex colour like "#22d3ee"'),
      }),
    )
    .min(1),
  sessions: z.array(
    z.strictObject({
      slug: idLike,
      day: z.number().int().min(1),
      date: isoDate,
      start: hhmm,
      end: hhmm,
      session: nonEmpty,
      speakers: z.array(agendaPerson).min(1),
      moderator: agendaPerson.nullish(),
      title: z.string().default(""),
      topic: z.string().default(""),
      summary: nonEmpty,
      themes: z.array(idLike).min(1),
      page: nonEmpty,
    }),
  ),
});

export const frontmatterSchema = z.strictObject({
  slug: idLike,
  title: z.string().default(""),
  topic: z.string().default(""),
  session: nonEmpty,
  date: isoDate,
  time: z.string().regex(/^\d{2}:\d{2}\s*[–-]\s*\d{2}:\d{2}$/, 'use "HH:MM–HH:MM", in quotes'),
  speakers: z
    .array(
      z.strictObject({
        name: nonEmpty,
        affiliation: z.string().default(""),
        link: optionalUrl,
      }),
    )
    .min(1),
  moderator: agendaPerson.nullish(),
  themes: z.array(idLike).min(1),
  diagrams: z
    .array(z.string().regex(/^[A-Za-z0-9._-]+\.svg$/, "use a bare .svg file name"))
    .default([]),
  status: z.enum(["draft", "published"]),
});

export type Agenda = z.infer<typeof agendaSchema>;
export type Frontmatter = z.infer<typeof frontmatterSchema>;
