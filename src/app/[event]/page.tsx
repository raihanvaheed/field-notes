import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { HubExplorer } from "@/components/hub-explorer";
import { SiteFooter } from "@/components/site-footer";
import { content } from "@/content";
import { getEvent, getEventParams } from "@/lib/notes";
import type { HubSession } from "@/lib/timeline";
import type { Session } from "@/lib/types";

// Static export: only the events found at build time exist.
export const dynamicParams = false;

export function generateStaticParams() {
  return getEventParams();
}

export async function generateMetadata({ params }: PageProps<"/[event]">): Promise<Metadata> {
  const { event: slug } = await params;
  const event = getEvent(slug);
  if (!event) return {};
  return { title: content.meta.hubTitle(event.name), description: event.description };
}

function toHubSession(s: Session): HubSession {
  const affiliations = [...new Set(s.speakers.map((p) => p.affiliation).filter(Boolean))];
  return {
    slug: s.slug,
    day: s.day,
    start: s.start,
    end: s.end,
    startMin: s.startMin,
    endMin: s.endMin,
    type: s.type,
    speakers: s.speakers.map((p) => p.name).join(", "),
    affiliation: affiliations.join("; "),
    line: s.topic || s.title,
    summary: s.summary,
    themes: s.themes,
  };
}

export default async function EventPage({ params }: PageProps<"/[event]">) {
  const { event: slug } = await params;
  const event = getEvent(slug);
  if (!event) notFound();

  const { site, hub } = content;

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-5 md:px-10 md:pt-10">
        <Breadcrumb
          items={[
            { label: site.mainSite.label, href: site.mainSite.href },
            { label: site.title, href: "/" },
            { label: event.name },
          ]}
        />

        <header className="mt-6 flex max-w-[820px] flex-col gap-2.5 md:mt-12 md:gap-3.5">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-signal">
            {hub.eyebrow(event.kind)}
          </p>
          <h1 className="text-[36px] font-bold leading-[1.05] md:text-[56px]">{event.name}</h1>
          <div className="accent-bar" aria-hidden="true" />
          <p className="text-[15px] leading-[1.5] text-soft md:text-[20px] md:leading-[1.45]">
            {hub.subtitle(event.fullName, event.venue, event.dateLabel)}
          </p>
          <p className="text-[13px] leading-[1.55] text-shade md:text-[15px] md:leading-[1.6]">
            {hub.disclaimer}
            {event.agendaUrl && (
              <>
                {" "}
                <a
                  href={event.agendaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-signal transition-colors hover:text-signal-hi"
                >
                  {hub.agendaLink}
                </a>
              </>
            )}
          </p>
        </header>

        <HubExplorer
          eventSlug={event.slug}
          themes={event.themes}
          sessions={event.sessions.map(toHubSession)}
          days={event.days}
        />

        <SiteFooter />
      </div>
    </main>
  );
}
