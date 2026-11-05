import Link from "next/link";
import { content } from "@/content";
import { fullLabel, shortLabel, speakerNames } from "@/lib/names";
import type { Session } from "@/lib/types";

type Neighbours = {
  eventSlug: string;
  current: Session;
  previous: Session | null;
  next: Session | null;
};

/** "13:00", or "Day 1 · 15:30" when the neighbour is on another day. */
const when = (neighbour: Session, current: Session) =>
  neighbour.day === current.day
    ? neighbour.start
    : `${content.hub.day(neighbour.day)} · ${neighbour.start}`;

const cell =
  "flex flex-col gap-1 border border-rule text-ink no-underline transition-colors hover:border-signal";

/** Previous and next talk in time order, at the end of the page. */
export function TalkNav({ eventSlug, current, previous, next }: Neighbours) {
  const { talk } = content;
  if (!previous && !next) return null;

  return (
    <nav
      aria-label={talk.moreTalksLabel}
      className="mt-14 grid grid-cols-2 gap-3 border-t border-rule pt-[22px] md:gap-4"
    >
      {previous ? (
        <Link href={`/${eventSlug}/${previous.slug}`} className={`${cell} px-4 py-3.5`}>
          <span className="text-[12px] text-shade">
            ← {talk.previous} · {when(previous, current)}
          </span>
          <span className="text-[15px] font-semibold">{speakerNames(previous)}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={`/${eventSlug}/${next.slug}`} className={`${cell} px-4 py-3.5 text-right`}>
          <span className="text-[12px] text-shade">
            {talk.next} · {when(next, current)} →
          </span>
          <span className="text-[15px] font-semibold">{speakerNames(next)}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

/** The compact version at the top of the page on a phone. */
export function NearbyTalks({ eventSlug, current, previous, next }: Neighbours) {
  const { talk } = content;
  if (!previous && !next) return null;

  const label = (kind: string, s: Session) => `${kind}: ${fullLabel(s)}, ${s.start}–${s.end}`;

  return (
    <nav aria-label={talk.nearbyTalksLabel} className="grid grid-cols-2 gap-2 md:hidden">
      {previous ? (
        <Link
          href={`/${eventSlug}/${previous.slug}`}
          aria-label={label(talk.previous, previous)}
          className={`${cell} min-h-11 gap-0.5 px-2.5 py-2 text-[12px]`}
        >
          <span className="text-muted">← {when(previous, current)}</span>
          <span className="text-[14px]">{shortLabel(previous)}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/${eventSlug}/${next.slug}`}
          aria-label={label(talk.next, next)}
          className={`${cell} min-h-11 gap-0.5 px-2.5 py-2 text-right text-[12px]`}
        >
          <span className="text-muted">{when(next, current)} →</span>
          <span className="text-[14px]">{shortLabel(next)}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
