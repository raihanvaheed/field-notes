import Link from "next/link";
import { content } from "@/content";
import { fullLabel, shortLabel } from "@/lib/names";
import { fromMin } from "@/lib/time";
import { timeWindow } from "@/lib/timeline";
import type { DayInfo, Session } from "@/lib/types";

/**
 * A slim bar showing where a talk sat in its day: one segment per included
 * session, positioned by time. The current talk is highlighted; the rest link
 * to their pages.
 */
export function DayStrip({
  eventSlug,
  day,
  sessions,
  currentSlug,
}: {
  eventSlug: string;
  day: DayInfo;
  /** Every included session of that day. */
  sessions: Session[];
  currentSlug: string;
}) {
  const { t0, t1 } = timeWindow(sessions);
  const span = t1 - t0;

  return (
    <section aria-label={content.talk.dayStripLabel(day.day)} className="max-w-[760px]">
      <div className="mb-1.5 flex justify-between text-[12px] tabular-nums text-muted">
        <span>
          {content.hub.day(day.day)} · {day.short}
        </span>
        <span>
          {fromMin(t0)} – {fromMin(t1)}
        </span>
      </div>
      <div className="relative h-10 border border-rule bg-surface">
        {sessions.map((s) => {
          const current = s.slug === currentSlug;
          const style = {
            left: `${(((s.startMin - t0) / span) * 100).toFixed(2)}%`,
            width: `${((((s.endMin - s.startMin) / span) * 100) - 0.4).toFixed(2)}%`,
          };
          const full = `${fullLabel(s)}, ${s.start}–${s.end}`;
          const inner = (
            <>
              <span aria-hidden="true" className="min-w-0 truncate">
                {shortLabel(s)}
              </span>
              <span className="sr-only">{full}</span>
            </>
          );
          const base =
            "absolute bottom-1 top-1 box-border flex items-center overflow-hidden whitespace-nowrap px-1.5 text-[11px] no-underline";

          return current ? (
            <span
              key={s.slug}
              aria-current="page"
              className={`${base} bg-signal font-semibold text-on-signal`}
              style={style}
            >
              {inner}
            </span>
          ) : (
            <Link
              key={s.slug}
              href={`/${eventSlug}/${s.slug}`}
              title={full}
              className={`${base} bg-track text-soft hover:bg-surface-hi hover:text-ink`}
              style={style}
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
