"use client";

import Link from "next/link";
import { useState } from "react";
import { content } from "@/content";
import {
  ONE_COLUMN,
  TWO_COLUMNS,
  axisTicks,
  groupDays,
  placeSessions,
  threadPaths,
  timeWindow,
  type Placed,
} from "@/lib/timeline";
import type { DayInfo } from "@/lib/types";
import type { HubModel } from "./hub-explorer";
import { ThemeDots } from "./theme-dots";

type Status = { text: string; color: string };

const chipBase =
  "inline-flex min-h-11 cursor-pointer items-center gap-2 border px-4 font-[inherit] text-[15px] transition-[background-color,border-color] duration-150 motion-reduce:transition-none";

/** The hub from 1024px up: theme chips, then a timeline with threads. */
export function DesktopHub({ model, status }: { model: HubModel; status: Status }) {
  const { hub } = content;
  const { themes, active, selected } = model;

  return (
    <div className="hidden lg:block">
      <section aria-labelledby="themes-heading" className="mt-12">
        <h2 id="themes-heading" className="mb-1.5 text-[22px] font-semibold">
          {hub.themesHeading}
        </h2>
        <p role="status" className="mb-4 text-[15px] leading-[1.5]" style={{ color: status.color }}>
          {status.text}
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          {themes.map((t) => {
            const lit = active.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                className={chipBase}
                aria-pressed={selected === t.id}
                onClick={() => model.pick(t.id)}
                onMouseEnter={() => model.hoverTheme(t.id)}
                onMouseLeave={() => model.hoverTheme(null)}
                onFocus={() => model.hoverTheme(t.id)}
                onBlur={() => model.hoverTheme(null)}
                style={
                  lit
                    ? { borderColor: t.color, background: `${t.color}24`, color: "var(--ink)" }
                    : { borderColor: "var(--rule)", background: "transparent", color: "var(--soft)" }
                }
              >
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-full"
                  style={{ background: t.color }}
                />
                <span>{t.label}</span>
                <span className="text-[13px] text-shade">{t.count}</span>
              </button>
            );
          })}
          {selected && (
            <button
              type="button"
              onClick={model.clear}
              className="min-h-11 cursor-pointer border border-transparent bg-transparent px-3.5 font-[inherit] text-[14px] text-shade underline hover:text-ink"
            >
              {hub.clear}
            </button>
          )}
        </div>
      </section>

      <Timeline model={model} />
    </div>
  );
}

/**
 * One column per day, two days side by side around a centre time axis.
 * One day: a single column with the axis on the left.
 * Three or more days: tabs choose a pair of days (1-2, 3-4, ...), and a lone
 * last day gets the single-column layout.
 */
function Timeline({ model }: { model: HubModel }) {
  const { hub } = content;
  const groups = groupDays(model.days);
  const [groupIndex, setGroupIndex] = useState(0);
  const group = groups[Math.min(groupIndex, groups.length - 1)];

  return (
    <section aria-label={hub.timelineLabel} className="mt-10">
      {groups.length > 1 && (
        <div role="group" aria-label={hub.dayTabsLabel} className="mb-5 flex flex-wrap gap-2">
          {groups.map((g, i) => {
            const on = g === group;
            return (
              <button
                key={g[0].day}
                type="button"
                aria-pressed={on}
                onClick={() => setGroupIndex(i)}
                className="min-h-11 cursor-pointer border px-4 font-[inherit] text-[15px]"
                style={
                  on
                    ? { background: "var(--signal)", color: "var(--on-signal)", borderColor: "var(--signal)", fontWeight: 600 }
                    : { background: "transparent", color: "var(--soft)", borderColor: "var(--rule)" }
                }
              >
                {hub.dayGroup(g[0].day, g[g.length - 1].day)}
              </button>
            );
          })}
        </div>
      )}

      <TimelineBody model={model} days={group} />
    </section>
  );
}

function DayHeading({ day }: { day: DayInfo }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[20px] font-semibold">{content.hub.day(day.day)}</span>
      <span className="text-[14px] text-shade">{day.long}</span>
    </div>
  );
}

function TimelineBody({ model, days }: { model: HubModel; days: DayInfo[] }) {
  const { hub } = content;
  const layout = days.length === 2 ? TWO_COLUMNS : ONE_COLUMN;
  const visible = model.sessions.filter((s) => days.some((d) => d.day === s.day));
  const { t0, t1, height } = timeWindow(visible);
  const placed = placeSessions(visible, t0, days[0].day);
  const ticks = axisTicks(t0, t1);
  const twoColumns = layout.columns === 2;

  const threads = (
    <svg
      className="threads pointer-events-none absolute left-0 top-0 h-full w-full overflow-visible transition-opacity duration-200 motion-reduce:transition-none"
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ opacity: model.active.length ? 1 : 0 }}
    >
      {model.active.map((id) => {
        const theme = model.themeById.get(id);
        if (!theme) return null;
        const members = placed.filter((p) => p.themes.includes(id));
        const [solid, faintA, faintB] = threadPaths(theme.index, members, layout);
        return (
          <g key={id}>
            <path className="s1" d={faintA} stroke={theme.color} />
            <path className="s2" d={faintB} stroke={theme.color} />
            <path className="s0" d={solid} stroke={theme.color} />
          </g>
        );
      })}
    </svg>
  );

  const cards = placed.map((p) => (
    <TimelineCard key={p.slug} model={model} placed={p} cardPct={layout.cardPct} />
  ));

  if (twoColumns) {
    return (
      <div>
        <div
          className="mb-[22px] grid items-end border-b border-rule pb-3.5"
          style={{ gridTemplateColumns: "43fr 14fr 43fr" }}
        >
          <DayHeading day={days[0]} />
          <div className="text-center text-[12px] uppercase tracking-[0.08em] text-muted">
            {hub.timeAxis}
          </div>
          <DayHeading day={days[1]} />
        </div>

        <div className="relative" style={{ height }}>
          <div aria-hidden="true" className="absolute bottom-0 left-1/2 top-0 w-px bg-rule" />
          {ticks.map((k) => (
            <div
              key={k.label}
              aria-hidden="true"
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-paper px-1.5 py-0.5 text-[11px] tabular-nums text-muted"
              style={{ top: k.top }}
            >
              {k.label}
            </div>
          ))}
          {threads}
          {cards}
        </div>
      </div>
    );
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: "64px minmax(0, 1fr)" }}>
      <div className="mb-[22px] flex items-end border-b border-rule pb-3.5 text-[12px] uppercase tracking-[0.08em] text-muted">
        {hub.timeAxis}
      </div>
      <div className="mb-[22px] border-b border-rule pb-3.5 pl-4">
        <DayHeading day={days[0]} />
      </div>

      <div className="relative" style={{ height }}>
        <div aria-hidden="true" className="absolute bottom-0 right-0 top-0 w-px bg-rule" />
        {ticks.map((k) => (
          <div
            key={k.label}
            aria-hidden="true"
            className="absolute right-0 -translate-y-1/2 bg-paper py-0.5 pl-1.5 pr-2.5 text-[11px] tabular-nums text-muted"
            style={{ top: k.top }}
          >
            {k.label}
          </div>
        ))}
      </div>
      <div className="relative ml-4" style={{ height }}>
        {threads}
        {cards}
      </div>
    </div>
  );
}

function TimelineCard({
  model,
  placed,
  cardPct,
}: {
  model: HubModel;
  placed: Placed;
  cardPct: number;
}) {
  const { hub } = content;
  const { active, themeById } = model;
  const hovered = model.hoveredCard === placed.slug;
  const sharesActive = active.length === 0 || placed.themes.some((id) => active.includes(id));
  const firstActive = active.find((id) => placed.themes.includes(id));
  const borderColor = active.length && firstActive ? themeById.get(firstActive)!.color : "var(--rule)";
  const cardThemes = placed.themes.map((id) => themeById.get(id)!);
  const minutes = placed.endMin - placed.startMin;
  const showAffiliation = !hovered && minutes >= 60 && placed.affiliation !== "";

  return (
    <Link
      href={`/${model.eventSlug}/${placed.slug}`}
      onMouseEnter={() => model.hoverCard(placed.slug)}
      onMouseLeave={() => model.hoverCard(null)}
      onFocus={() => model.hoverCard(placed.slug)}
      onBlur={() => model.hoverCard(null)}
      className="absolute box-border flex flex-col gap-1 overflow-hidden border bg-surface px-3.5 py-3 text-ink no-underline transition-[opacity,border-color] duration-200 motion-reduce:transition-none"
      style={{
        top: placed.top,
        [placed.col === 0 ? "left" : "right"]: 0,
        width: `${cardPct}%`,
        ...(hovered ? { minHeight: placed.height } : { height: placed.height }),
        opacity: sharesActive ? 1 : 0.4,
        zIndex: hovered ? 5 : 1,
        boxShadow: hovered ? "0 14px 36px rgba(0, 0, 0, 0.5)" : "none",
        borderColor,
      }}
    >
      {/* Rows never shrink: line-clamp's overflow:hidden would otherwise let a tight
          card squash the topic line and clip its descenders. */}
      <span className="flex shrink-0 items-center justify-between gap-2">
        {/* line-height: normal, as in the design: Tailwind's 1.5 would make this row 5px
            taller and overflow the 30-minute cards. */}
        <span className="text-[12px] leading-[normal] tracking-[0.02em] tabular-nums text-shade">
          {placed.start}–{placed.end} · {placed.type}
        </span>
        <ThemeDots themes={cardThemes} />
      </span>
      <span className="shrink-0 text-[16px] font-semibold leading-[1.25]">{placed.speakers}</span>
      {hovered ? (
        <>
          <span className="shrink-0 text-[14px] leading-[1.45] text-ink">{placed.summary}</span>
          {placed.affiliation && (
            <span className="shrink-0 text-[13px] leading-[1.4] text-shade">{placed.affiliation}</span>
          )}
          <span className="shrink-0 text-[13px] font-semibold text-signal">{hub.readNotes}</span>
        </>
      ) : (
        <>
          <span className="line-clamp-1 shrink-0 text-[14px] leading-[1.4] text-soft">{placed.line}</span>
          {showAffiliation && (
            <span className="shrink-0 text-[13px] leading-[1.4] text-shade">{placed.affiliation}</span>
          )}
        </>
      )}
    </Link>
  );
}
