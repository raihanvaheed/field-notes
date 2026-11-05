"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { content } from "@/content";
import type { HubSession } from "@/lib/timeline";
import type { DayInfo, Theme } from "@/lib/types";
import { DesktopHub } from "./hub-desktop";
import { PhoneHub } from "./hub-phone";

export type HubTheme = Theme & { index: number; count: number };

/** Everything the two hub layouts share. */
export type HubModel = {
  eventSlug: string;
  themes: HubTheme[];
  themeById: Map<string, HubTheme>;
  sessions: HubSession[];
  days: DayInfo[];
  /** The picked theme, if any. */
  selected: string | null;
  /** Themes currently drawn: hovered chip, else hovered card's themes, else the picked theme. */
  active: string[];
  hoveredCard: string | null;
  pick: (id: string) => void;
  clear: () => void;
  hoverTheme: (id: string | null) => void;
  hoverCard: (slug: string | null) => void;
};

type Props = {
  eventSlug: string;
  themes: Theme[];
  sessions: HubSession[];
  days: DayInfo[];
};

/** Keeps the picked theme in the URL (#energy) without adding history entries. */
function writeHash(id: string | null) {
  const { pathname, search } = window.location;
  window.history.replaceState(window.history.state, "", `${pathname}${search}${id ? `#${id}` : ""}`);
}

export function HubExplorer({ eventSlug, themes: rawThemes, sessions, days }: Props) {
  // undefined = the visitor has not picked anything yet, so follow the URL hash.
  const [picked, setPicked] = useState<string | null | undefined>(undefined);

  // The URL hash is read as an external store. The server renders with no hash, and
  // the browser re-renders with the real one right after hydration. Picking a theme
  // rewrites the hash with replaceState, which fires no event; a hashchange event
  // therefore means the URL was changed from outside (back button, a #theme link),
  // and that wins over an earlier pick.
  const subscribeToHash = useCallback((onChange: () => void) => {
    const onHashChange = () => {
      setPicked(undefined);
      onChange();
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  const hash = useSyncExternalStore(
    subscribeToHash,
    () => window.location.hash,
    () => "",
  );
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const themes = useMemo<HubTheme[]>(
    () =>
      rawThemes.map((t, index) => ({
        ...t,
        index,
        count: sessions.filter((s) => s.themes.includes(t.id)).length,
      })),
    [rawThemes, sessions],
  );
  const themeById = useMemo(() => new Map(themes.map((t) => [t.id, t])), [themes]);

  // /event#energy opens with Energy picked.
  const hashTheme = themes.find((t) => t.id === hash.slice(1))?.id ?? null;
  const selected = picked === undefined ? hashTheme : picked;

  const pick = useCallback(
    (id: string) => {
      const next = selected === id ? null : id;
      setPicked(next);
      setHoveredTheme(null);
      writeHash(next);
    },
    [selected],
  );

  const clear = useCallback(() => {
    setPicked(null);
    writeHash(null);
  }, []);

  const hovered = sessions.find((s) => s.slug === hoveredCard) ?? null;
  const active = hoveredTheme ? [hoveredTheme] : hovered ? hovered.themes : selected ? [selected] : [];

  const model: HubModel = {
    eventSlug,
    themes,
    themeById,
    sessions,
    days,
    selected,
    active,
    hoveredCard,
    pick,
    clear,
    hoverTheme: setHoveredTheme,
    hoverCard: setHoveredCard,
  };

  // Status line (desktop wording; the phone has its own, below).
  const { hub } = content;
  let status = { text: hub.statusRest, color: "var(--shade)" };
  if (active.length === 1) {
    const theme = themeById.get(active[0])!;
    status = { text: hub.statusTheme(theme.label, theme.count), color: theme.color };
  } else if (active.length > 1 && hovered) {
    const labels = hovered.themes.map((id) => themeById.get(id)!.label.toLowerCase()).join(", ");
    status = { text: hub.statusCard(hovered.speakers, labels), color: "var(--ink)" };
  }

  let phoneStatus = { text: hub.phoneStatusRest, color: "var(--shade)" };
  if (selected) {
    const theme = themeById.get(selected)!;
    const perDay = days.map((d) => ({
      day: d.day,
      talks: sessions.filter((s) => s.day === d.day && s.themes.includes(selected)).length,
    }));
    phoneStatus = { text: hub.phoneStatusTheme(theme.label, perDay), color: theme.color };
  }

  return (
    <>
      <DesktopHub model={model} status={status} />
      <PhoneHub model={model} status={phoneStatus} />
    </>
  );
}
