import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { ThemeDots } from "@/components/theme-dots";
import { content } from "@/content";
import { getEvents } from "@/lib/notes";
import type { EventData } from "@/lib/types";

// Same border, hover and focus treatment as the portfolio's project cards, minus the image.
const cardStyle =
  "group flex flex-1 flex-col border border-rule p-6 outline-none transition-colors hover:border-signal focus-visible:border-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-signal";

function EventCard({ event }: { event: EventData }) {
  const { site } = content;
  return (
    <Link href={`/${event.slug}`} className={cardStyle}>
      <h2 className="text-[1.25rem] font-semibold">{event.name}</h2>

      <p className="mt-2 text-[0.8125rem] text-shade transition-colors group-hover:text-ink group-focus-visible:text-ink">
        {event.venue} · {event.dateLabel}
      </p>

      <p className="mt-4 text-[0.9375rem]">{event.description}</p>

      <p className="mt-4 text-[0.8125rem] text-signal">{site.sessionCount(event.sessions.length)}</p>

      <div className="mt-3 flex items-center gap-2">
        <ThemeDots themes={event.themes} size={9} gap={6} />
      </div>

      <p className="mt-auto flex items-center gap-2 pt-4 text-[0.9375rem] font-semibold text-ink">
        {site.cardLink}
        <ArrowRightIcon size={16} className="shrink-0 text-shade" />
      </p>
    </Link>
  );
}

export default function HomePage() {
  const { site } = content;
  const events = getEvents();

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-[72rem] px-6 py-12 md:px-16 md:py-16">
        <header className="flex max-w-[820px] flex-col gap-3.5">
          <h1 className="text-[36px] font-bold leading-[1.05] md:text-[56px]">{site.title}</h1>
          <div className="accent-bar" aria-hidden="true" />
          <p className="text-[15px] leading-[1.5] text-soft md:text-[20px] md:leading-[1.45]">
            {site.homeIntro}
          </p>
          <a
            href={site.mainSite.href}
            className="mt-1 inline-flex items-center gap-2 self-start text-[0.9375rem] text-signal transition-colors hover:text-signal-hi"
          >
            <ArrowLeftIcon size={16} />
            {site.mainSite.label}
          </a>
        </header>

        <section className="mt-12 md:mt-14">
          {events.length === 0 ? (
            <p className="text-[1.0625rem] text-shade">{site.homeEmpty}</p>
          ) : (
            <ul className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
              {events.map((event) => (
                <li key={event.slug} className="flex">
                  <EventCard event={event} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
