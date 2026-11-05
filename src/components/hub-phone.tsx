"use client";

import Link from "next/link";
import { useState } from "react";
import { content } from "@/content";
import type { HubModel } from "./hub-explorer";
import { ThemeDots } from "./theme-dots";

type Status = { text: string; color: string };

/**
 * The hub below 1024px (phones and tablets): day tabs, a scrolling row of theme
 * chips, and a list of sessions. No threads, no hover.
 */
export function PhoneHub({ model, status }: { model: HubModel; status: Status }) {
  const { hub } = content;
  const { days, selected, themeById } = model;
  const [day, setDay] = useState(days[0].day);
  const sessions = model.sessions.filter((s) => s.day === day);

  return (
    <div className="mt-[18px] flex flex-col gap-[18px] md:max-w-[720px] lg:hidden">
      {days.length > 1 && (
        <div
          role="group"
          aria-label={hub.dayTabsLabel}
          className="grid overflow-x-auto border border-rule"
          style={{ gridAutoFlow: "column", gridAutoColumns: "minmax(max-content, 1fr)" }}
        >
          {days.map((d) => {
            const on = d.day === day;
            return (
              <button
                key={d.day}
                type="button"
                aria-pressed={on}
                onClick={() => setDay(d.day)}
                className="min-h-12 cursor-pointer whitespace-nowrap border-0 px-3 font-[inherit] text-[15px]"
                style={
                  on
                    ? { background: "var(--signal)", color: "var(--on-signal)", fontWeight: 600 }
                    : { background: "transparent", color: "var(--soft)" }
                }
              >
                {hub.day(d.day)} · {d.short}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span role="status" className="text-[13px]" style={{ color: status.color }}>
          {status.text}
        </span>
        <div
          role="group"
          aria-label={hub.themesHeading}
          className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
        >
          {model.themes.map((t) => {
            const on = selected === t.id;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                onClick={() => model.pick(t.id)}
                className="inline-flex min-h-11 flex-none cursor-pointer items-center gap-[7px] whitespace-nowrap border px-3.5 font-[inherit] text-[14px]"
                style={
                  on
                    ? { borderColor: t.color, background: `${t.color}24`, color: "var(--ink)" }
                    : { borderColor: "var(--rule)", background: "transparent", color: "var(--soft)" }
                }
              >
                <span
                  aria-hidden="true"
                  className="size-[9px] rounded-full"
                  style={{ background: t.color }}
                />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <ol aria-label={hub.sessionListLabel} className="m-0 flex list-none flex-col gap-2.5 p-0">
        {sessions.map((s) => {
          const has = !selected || s.themes.includes(selected);
          const border = selected && has ? themeById.get(selected)!.color : "var(--rule)";
          const cardThemes = s.themes.map((id) => themeById.get(id)!);
          return (
            <li
              key={s.slug}
              className="grid grid-cols-[52px_minmax(0,1fr)] gap-2.5 transition-opacity duration-200 motion-reduce:transition-none"
              style={{ opacity: has ? 1 : 0.4 }}
            >
              <span className="pt-3.5 text-[13px] tabular-nums text-shade">{s.start}</span>
              <Link
                href={`/${model.eventSlug}/${s.slug}`}
                className="flex flex-col gap-1 border bg-surface px-3.5 py-3 text-ink no-underline"
                style={{ borderColor: border }}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[12px] text-shade">
                    {s.type} · {hub.minutes(s.endMin - s.startMin)}
                  </span>
                  <ThemeDots themes={cardThemes} />
                </span>
                <span className="text-[16px] font-semibold leading-[1.25]">{s.speakers}</span>
                <span className="text-[14px] leading-[1.45] text-soft">{s.summary}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
