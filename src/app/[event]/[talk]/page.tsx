import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { DayStrip } from "@/components/day-strip";
import { NoteMarkdown } from "@/components/note-markdown";
import { NearbyTalks, TalkNav } from "@/components/talk-nav";
import { MobileBar, SideRail, TalkPanels } from "@/components/talk-panels";
import { content } from "@/content";
import { speakerNames } from "@/lib/names";
import { getTalk, getTalkParams } from "@/lib/notes";
import type { Person } from "@/lib/types";

// Static export: only the talks found at build time exist.
export const dynamicParams = false;

export function generateStaticParams() {
  return getTalkParams();
}

export async function generateMetadata({ params }: PageProps<"/[event]/[talk]">): Promise<Metadata> {
  const { event: eventSlug, talk: talkSlug } = await params;
  const page = getTalk(eventSlug, talkSlug);
  if (!page) return {};
  return {
    title: content.meta.talkTitle(speakerNames(page.session), page.session.heading, page.event.name),
    description: page.session.summary,
  };
}

const linkClass = "text-signal transition-colors hover:text-signal-hi";

/** Splits `text` around the highlighted phrases, wrapping each in its style. */
function Legend({ legend }: { legend: { text: string; dashed: string; blue: string } }) {
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const phrases = [legend.dashed, legend.blue].filter(Boolean).map(escape);
  const parts = phrases.length ? legend.text.split(new RegExp(`(${phrases.join("|")})`)) : [legend.text];

  return (
    <>
      {parts.map((part, i) =>
        part !== "" && part === legend.dashed ? (
          <span key={i} className="border-b border-dashed border-signal text-soft">
            {part}
          </span>
        ) : part !== "" && part === legend.blue ? (
          <span key={i} className="text-signal underline underline-offset-[3px]">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

function PersonLine({ person, label }: { person: Person; label?: string }) {
  return (
    <p className="text-[15px] md:text-[16px]">
      {label && <span className="text-muted">{label}: </span>}
      {person.link ? (
        <a
          href={person.link}
          target="_blank"
          rel="noopener noreferrer"
          className="ext-link font-semibold"
        >
          {person.name}
        </a>
      ) : (
        <span className="font-semibold">{person.name}</span>
      )}
      {person.affiliation && <span className="text-shade"> · {person.affiliation}</span>}
    </p>
  );
}

export default async function TalkPage({ params }: PageProps<"/[event]/[talk]">) {
  const { event: eventSlug, talk: talkSlug } = await params;
  const page = getTalk(eventSlug, talkSlug);
  if (!page) notFound();

  const { event, session, content: notes, previous, next } = page;
  const { site, talk } = content;
  const themes = session.themes.map((id) => event.themes.find((t) => t.id === id)!);
  const day = event.days.find((d) => d.day === session.day)!;
  const sameDay = event.sessions.filter((s) => s.day === session.day);
  const hasPanels = notes.terms.length > 0 || notes.reading.length > 0;
  const idPrefix = `${event.slug}-${session.slug}`;
  const sourceUrl = `${site.repoBlobBase}/events/${event.slug}/talks/${session.slug}.md`;

  return (
    <main className="flex-1">
      <TalkPanels terms={notes.terms} reading={notes.reading}>
        <div className="mx-auto w-full max-w-[1240px] px-4 pb-[calc(68px+env(safe-area-inset-bottom)+32px)] pt-5 md:px-10 md:pt-10 lg:pb-20">
          <Breadcrumb
            items={[
              { label: site.mainSite.label, href: site.mainSite.href },
              { label: site.title, href: "/" },
              { label: event.name, href: `/${event.slug}` },
              { label: speakerNames(session) },
            ]}
          />

          <div className="mt-[18px] md:hidden">
            <NearbyTalks eventSlug={event.slug} current={session} previous={previous} next={next} />
          </div>

          <div className="mt-7 hidden md:block">
            <DayStrip
              eventSlug={event.slug}
              day={day}
              sessions={sameDay}
              currentSlug={session.slug}
            />
          </div>

          <div className="mt-[18px] flex items-start gap-12 md:mt-10">
            <article className="min-w-0 flex-[0_1_760px]">
              <header className="flex flex-col gap-2.5 md:gap-3.5">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-signal md:text-[13px]">
                  <span className="md:hidden">{content.hub.day(session.day)} · </span>
                  {session.type} · {session.start}–{session.end}
                </p>
                <h1 className="text-[30px] font-bold leading-[1.12] md:text-[44px] md:leading-[1.1]">
                  {session.heading}
                </h1>

                <div className="flex flex-col gap-1 md:mt-1">
                  {session.speakers.map((person) => (
                    <PersonLine key={person.name} person={person} />
                  ))}
                  {session.moderator && (
                    <PersonLine person={session.moderator} label={talk.moderator} />
                  )}
                </div>

                <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                  {themes.map((theme) => (
                    <li key={theme.id}>
                      {/* A plain link: the hub reads #theme from the URL when the page loads. */}
                      <a
                        href={`/${event.slug}#${theme.id}`}
                        className="inline-flex min-h-9 items-center gap-[7px] border border-rule px-3 text-[13px] text-soft no-underline transition-colors hover:border-signal hover:text-ink"
                      >
                        <span
                          aria-hidden="true"
                          className="size-2 rounded-full"
                          style={{ background: theme.color }}
                        />
                        {theme.label}
                      </a>
                    </li>
                  ))}
                </ul>

                {hasPanels && (
                  <>
                    <p className="mt-1.5 hidden text-[13px] leading-normal text-muted lg:block">
                      <Legend legend={talk.legend.desktop} />
                    </p>
                    <p className="text-[12px] leading-normal text-muted lg:hidden">
                      <Legend legend={talk.legend.phone} />
                    </p>
                  </>
                )}
              </header>

              <section
                aria-labelledby="one-line"
                className="mt-[18px] border-y border-rule py-[18px] md:mt-10 md:py-6"
              >
                <h2
                  id="one-line"
                  className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-shade md:mb-2.5 md:text-[13px]"
                >
                  {talk.oneLineLabel}
                </h2>
                <NoteMarkdown
                  variant="lead"
                  source={notes.oneLine}
                  talk={notes}
                  idPrefix={idPrefix}
                />
              </section>

              <div className="mt-[18px] md:mt-10">
                <NoteMarkdown source={notes.keyIdeas} talk={notes} idPrefix={idPrefix} />
              </div>

              <TalkNav eventSlug={event.slug} current={session} previous={previous} next={next} />

              <p className="mt-7 text-[12px] leading-[1.6] text-muted md:text-[13px]">
                {talk.footer}{" "}
                <a href={`mailto:${site.corrections.email}`} className={linkClass}>
                  {site.corrections.label}
                </a>
                {" · "}
                <a href={sourceUrl} className={linkClass}>
                  {talk.sourceLink}
                </a>
              </p>
            </article>

            <SideRail />
          </div>
        </div>

        <MobileBar />
      </TalkPanels>
    </main>
  );
}
