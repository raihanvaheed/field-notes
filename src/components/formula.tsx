"use client";

import {
  Fragment,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { content } from "@/content";
import type { FormulaSymbol, FormulaToken } from "@/lib/formula";

/** `_x` becomes a subscript and `^x` a superscript; x is a run of letters or digits. */
function marks(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /([_^])([\p{L}\p{N}]+)/gu;
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) out.push(text.slice(last, match.index));
    out.push(match[1] === "_" ? <sub key={key++}>{match[2]}</sub> : <sup key={key++}>{match[2]}</sup>);
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Puts a tooltip above (or below) its symbol, kept inside the viewport. */
function place(tip: HTMLElement, anchor: HTMLElement) {
  const a = anchor.getBoundingClientRect();
  const t = tip.getBoundingClientRect();
  const margin = 8;
  const left = Math.min(
    Math.max(a.left + a.width / 2 - t.width / 2, margin),
    Math.max(window.innerWidth - t.width - margin, margin),
  );
  const above = a.top - t.height - margin;
  tip.style.left = `${left}px`;
  tip.style.top = `${above >= margin ? above : a.bottom + margin}px`;
}

/**
 * A formula whose symbols each explain themselves.
 *
 * The tooltip shows on hover and on keyboard focus, toggles on tap, and closes
 * with Escape or a tap elsewhere. The collapsed list underneath carries the same
 * meanings, so nothing depends on the tooltips.
 */
export function Formula({ tokens, symbols }: { tokens: FormulaToken[]; symbols: FormulaSymbol[] }) {
  const baseId = useId();
  const [hover, setHover] = useState<number | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const shown = hover ?? focus ?? pinned;

  const rootRef = useRef<HTMLDivElement>(null);
  const anchors = useRef<(HTMLButtonElement | null)[]>([]);
  const tips = useRef<(HTMLSpanElement | null)[]>([]);
  const lastInput = useRef<string>("mouse");

  // Keep the visible tooltip next to its symbol, also while the page or the formula scrolls.
  // (A layout effect, so it is placed before the first paint rather than flashing at 0,0.)
  useLayoutEffect(() => {
    if (shown === null) return;
    const update = () => {
      const tip = tips.current[shown];
      const anchor = anchors.current[shown];
      if (tip && anchor) place(tip, anchor);
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [shown]);

  // Escape closes; a tap or click elsewhere unpins.
  useEffect(() => {
    if (shown === null && pinned === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setHover(null);
      setFocus(null);
      setPinned(null);
    };
    const onPointerDown = (event: PointerEvent) => {
      const onSymbol = anchors.current.some((button) => button?.contains(event.target as Node));
      if (!onSymbol) setPinned(null);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [shown, pinned]);

  const tipId = (index: number) => `${baseId}-tip-${index}`;

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={content.talk.formulaLabel}
      className="formula border border-rule bg-surface px-4 py-4 md:px-5"
    >
      <div
        className="overflow-x-auto pb-1"
        tabIndex={symbols.length === 0 ? 0 : undefined}
      >
        <p className="m-0 whitespace-nowrap text-[19px] leading-[2.1] text-ink md:text-[22px]">
          {tokens.map((token, i) =>
            token.symbol === null ? (
              <Fragment key={i}>{marks(token.text)}</Fragment>
            ) : (
              <button
                key={i}
                ref={(el) => {
                  anchors.current[token.symbol!] = el;
                }}
                type="button"
                className="term-btn"
                aria-describedby={tipId(token.symbol)}
                onPointerDown={(event) => {
                  lastInput.current = event.pointerType;
                }}
                onKeyDown={() => {
                  lastInput.current = "keyboard";
                }}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") setHover(token.symbol);
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType === "mouse") setHover(null);
                }}
                onFocus={(event) => {
                  if (event.currentTarget.matches(":focus-visible")) setFocus(token.symbol);
                }}
                onBlur={() => setFocus(null)}
                onClick={() => {
                  // A mouse already has the hover tooltip; touch and keyboard toggle it.
                  if (lastInput.current === "mouse") return;
                  setPinned((current) => (current === token.symbol ? null : token.symbol));
                }}
              >
                {marks(token.text)}
              </button>
            ),
          )}
        </p>
      </div>

      {symbols.map((s, index) => (
        <span
          key={index}
          ref={(el) => {
            tips.current[index] = el;
          }}
          id={tipId(index)}
          role="tooltip"
          className="pointer-events-none fixed left-0 top-0 z-50 w-max max-w-[min(280px,calc(100vw-16px))] border border-signal bg-paper px-3 py-2 text-[13px] leading-[1.45] text-ink shadow-[0_10px_28px_rgba(0,0,0,0.5)]"
          style={{ visibility: shown === index ? "visible" : "hidden" }}
        >
          {s.meaning}
        </span>
      ))}

      {symbols.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-[13px] text-shade hover:text-ink">
            {content.talk.formulaSummary}
          </summary>
          <dl className="m-0 mt-3 grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 gap-y-2 text-[14px] leading-[1.5]">
            {symbols.map((s, index) => (
              <Fragment key={index}>
                <dt className="font-semibold text-ink">{marks(s.symbol)}</dt>
                <dd className="m-0 text-soft">{s.meaning}</dd>
              </Fragment>
            ))}
          </dl>
        </details>
      )}
    </div>
  );
}
