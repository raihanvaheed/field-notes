// Geometry for the event timeline and its theme threads. Pure functions, no DOM.
// The numbers (3.2 px per minute, 10 px between cards, the three strands and
// their offsets) come from the approved design, local/design/Main.dc.html.
import { fromMin } from "./time";

export const PX_PER_MIN = 3.2;
export const CARD_GAP = 10;

/** What the hub needs to know about a session (all serialisable). */
export type HubSession = {
  slug: string;
  day: number;
  start: string;
  end: string;
  startMin: number;
  endMin: number;
  type: string;
  /** Speaker names, joined with ", ". */
  speakers: string;
  /** Distinct affiliations, joined with "; ". */
  affiliation: string;
  /** The one-line description on a card: the topic, or the title when there is no topic. */
  line: string;
  summary: string;
  themes: string[];
};

export type Placed = HubSession & {
  /** 0 = left column, 1 = right column (always 0 in a one-column layout). */
  col: 0 | 1;
  top: number;
  height: number;
  /** Vertical middle of the card, in px. */
  mid: number;
};

export type TimelineLayout = {
  columns: 1 | 2;
  /** Card width as a percentage of the timeline's width (of the stage in one column). */
  cardPct: number;
  /** x (0-100) of the right edge of the left column's cards. */
  leftEdge: number;
  /** x (0-100) of the left edge of the right column's cards. */
  rightEdge: number;
};

export const TWO_COLUMNS: TimelineLayout = { columns: 2, cardPct: 43, leftEdge: 43, rightEdge: 57 };
export const ONE_COLUMN: TimelineLayout = { columns: 1, cardPct: 72, leftEdge: 72, rightEdge: 72 };

/** Earliest start to latest end, rounded out to the half hour. */
export function timeWindow(sessions: { startMin: number; endMin: number }[]) {
  const t0 = Math.floor(Math.min(...sessions.map((s) => s.startMin)) / 30) * 30;
  const t1 = Math.ceil(Math.max(...sessions.map((s) => s.endMin)) / 30) * 30;
  return { t0, t1, height: (t1 - t0) * PX_PER_MIN };
}

export function placeSessions(sessions: HubSession[], t0: number, firstDay: number): Placed[] {
  return sessions.map((s) => {
    const top = (s.startMin - t0) * PX_PER_MIN;
    const height = (s.endMin - s.startMin) * PX_PER_MIN - CARD_GAP;
    return { ...s, col: s.day === firstDay ? 0 : 1, top, height, mid: top + height / 2 };
  });
}

/** A label every 30 minutes, from t0 to t1. */
export function axisTicks(t0: number, t1: number) {
  const ticks: { top: number; label: string }[] = [];
  for (let m = t0; m <= t1; m += 30) ticks.push({ top: (m - t0) * PX_PER_MIN, label: fromMin(m) });
  return ticks;
}

// One solid strand and two faint ones, offset a little either side.
const STRANDS = [
  { offset: 0, spread: 0 },
  { offset: -5, spread: -0.9 },
  { offset: 5, spread: 0.9 },
] as const;

/**
 * SVG path data for one theme: [solid, faint, faint].
 *
 * Talks are joined in time order. Two talks in the same column are joined by a
 * curve that bulges into the lane between the columns; talks in different
 * columns are joined by a curve that crosses that lane. Coordinates are in a
 * viewBox that is 100 wide and as tall as the timeline is in pixels.
 */
export function threadPaths(themeIndex: number, members: Placed[], layout: TimelineLayout): string[] {
  const ordered = [...members].sort((a, b) => a.col - b.col || a.top - b.top);

  return STRANDS.map(({ offset, spread }) => {
    const bulge = 3.2 + themeIndex * 1.15 + spread;
    let d = "";

    for (let i = 0; i < ordered.length - 1; i++) {
      const a = ordered[i];
      const b = ordered[i + 1];
      const ya = (a.mid + offset).toFixed(1);
      const yb = (b.mid + offset).toFixed(1);

      if (a.col === 0 && b.col === 0) {
        const x = layout.leftEdge;
        const c = (x + bulge).toFixed(2);
        d += `M ${x} ${ya} C ${c} ${ya}, ${c} ${yb}, ${x} ${yb} `;
      } else if (a.col === 1 && b.col === 1) {
        const x = layout.rightEdge;
        const c = (x - bulge).toFixed(2);
        d += `M ${x} ${ya} C ${c} ${ya}, ${c} ${yb}, ${x} ${yb} `;
      } else {
        const mid = (layout.leftEdge + layout.rightEdge) / 2;
        const c = (mid + spread * 0.6 + (themeIndex - 2) * 0.5).toFixed(2);
        d += `M ${layout.leftEdge} ${ya} C ${c} ${ya}, ${c} ${yb}, ${layout.rightEdge} ${yb} `;
      }
    }

    return d.trim();
  });
}

/** Splits day numbers into groups of at most two, for the timeline's two columns. */
export function groupDays<T>(days: T[]): T[][] {
  const groups: T[][] = [];
  for (let i = 0; i < days.length; i += 2) groups.push(days.slice(i, i + 2));
  return groups;
}
