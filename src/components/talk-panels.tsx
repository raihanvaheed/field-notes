"use client";

// The reading list and the glossary of a talk page.
//
// One state machine drives three things: the term and reading buttons in the
// text, the side rail and panel on desktop (1024px and up), and the bottom bar
// and sheet below that.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useReducer,
  useRef,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import { content } from "@/content";
import type { ReadingItem, Term } from "@/lib/types";
import { BookIcon, CloseIcon, TermsIcon } from "./icons";

type PanelKey = "reading" | "terms";

type PanelState = {
  panel: PanelKey | null;
  /** Pinned panels stay open when the pointer leaves. */
  pinned: boolean;
  /** The term or reading item to highlight. */
  focusId: string | null;
};

type Action =
  | { type: "hover"; tab: PanelKey }
  | { type: "leave" }
  | { type: "toggle"; tab: PanelKey }
  | { type: "show"; tab: PanelKey }
  | { type: "item"; tab: PanelKey; id: string }
  | { type: "close" };

const CLOSED: PanelState = { panel: null, pinned: false, focusId: null };

function reducer(state: PanelState, action: Action): PanelState {
  switch (action.type) {
    case "hover":
      return state.pinned ? state : { panel: action.tab, pinned: false, focusId: null };
    case "leave":
      return state.pinned ? state : CLOSED;
    case "toggle":
      if (state.pinned && state.panel === action.tab) return CLOSED;
      return {
        panel: action.tab,
        pinned: true,
        focusId: state.panel === action.tab ? state.focusId : null,
      };
    case "show":
      return { panel: action.tab, pinned: true, focusId: null };
    case "item":
      return { panel: action.tab, pinned: true, focusId: action.id };
    case "close":
      return CLOSED;
  }
}

type PanelsContext = {
  state: PanelState;
  dispatch: (action: Action) => void;
  terms: Term[];
  reading: ReadingItem[];
  isDesktop: boolean;
  openTerm: (id: string) => void;
  openReading: (id: string) => void;
};

const Context = createContext<PanelsContext | null>(null);

function usePanels(): PanelsContext {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("Term and reading buttons must be inside <TalkPanels>");
  return ctx;
}

const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribeDesktop(onChange: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useIsDesktop() {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

export function TalkPanels({
  terms,
  reading,
  children,
}: {
  terms: Term[];
  reading: ReadingItem[];
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, CLOSED);
  const isDesktop = useIsDesktop();

  // /event/talk#kv-cache opens the Terms panel at that term.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id && terms.some((t) => t.id === id)) dispatch({ type: "item", tab: "terms", id });
  }, [terms]);

  const openTerm = useCallback((id: string) => {
    dispatch({ type: "item", tab: "terms", id });
    const { pathname, search } = window.location;
    window.history.replaceState(window.history.state, "", `${pathname}${search}#${id}`);
  }, []);

  const openReading = useCallback((id: string) => {
    dispatch({ type: "item", tab: "reading", id });
  }, []);

  return (
    <Context.Provider value={{ state, dispatch, terms, reading, isDesktop, openTerm, openReading }}>
      {children}
    </Context.Provider>
  );
}

// ---------------------------------------------------------------------------
// Buttons inside the text
// ---------------------------------------------------------------------------

/** A dashed word that opens the Terms panel at its definition. */
export function TermButton({ id, children }: { id: string; children: ReactNode }) {
  const { openTerm } = usePanels();
  return (
    <button type="button" className="term-btn" onClick={() => openTerm(id)}>
      {children}
    </button>
  );
}

/** A blue reference that opens the Reading panel at its entry. */
export function ReadingButton({ id, children }: { id: string; children: ReactNode }) {
  const { openReading } = usePanels();
  return (
    <button type="button" className="ref-btn" onClick={() => openReading(id)}>
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Shared panel content
// ---------------------------------------------------------------------------

/** "Sardana et al., 2023. Adds the cost..." -> who "Sardana et al., 2023", why "Adds the cost...". */
function splitReading(rest: string): { who: string | null; why: string | null } {
  if (!rest) return { who: null, why: null };
  const match = rest.match(/^([\s\S]*?\b(?:1[5-9]|20)\d{2})(?:\.\s+([\s\S]+)|\.?)$/);
  if (match) return { who: match[1], why: match[2] ?? null };
  return { who: null, why: rest };
}

const highlightStyle = (on: boolean) =>
  on
    ? { background: "var(--surface-hi)", outline: "1px solid var(--signal)", outlineOffset: -1 }
    : undefined;

function PanelBody({ panel }: { panel: PanelKey }) {
  const { state, terms, reading } = usePanels();

  if (panel === "terms") {
    return (
      <dl className="m-0 flex flex-col gap-1">
        {terms.map((t) => (
          <div key={t.id} data-item-id={t.id} className="p-3" style={highlightStyle(state.focusId === t.id)}>
            <dt className="mb-1 text-[15px] font-semibold">{t.name}</dt>
            <dd className="m-0 flex flex-col gap-2 text-[14px] leading-[1.55] text-soft">
              {t.definition.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <ul className="m-0 flex list-none flex-col gap-1 p-0">
      {reading.map((r) => {
        const { who, why } = splitReading(r.rest);
        const titleClass = "text-[15px] font-semibold leading-[1.35]";
        return (
          <li
            key={r.id}
            data-item-id={r.id}
            className="flex flex-col gap-1 p-3"
            style={highlightStyle(state.focusId === r.id)}
          >
            {r.url ? (
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${titleClass} text-signal hover:text-signal-hi`}
              >
                {r.title}
              </a>
            ) : (
              <span className={titleClass}>{r.title}</span>
            )}
            {who && <span className="text-[13px] text-shade">{who}</span>}
            {why && <span className="text-[14px] leading-[1.5] text-soft">{why}</span>}
          </li>
        );
      })}
    </ul>
  );
}

/** Scrolls the highlighted item into view whenever a button in the text opens the panel. */
function useScrollToFocus(container: RefObject<HTMLElement | null>, id: string | null) {
  useEffect(() => {
    if (!id) return;
    const target = container.current?.querySelector<HTMLElement>(`[data-item-id="${CSS.escape(id)}"]`);
    target?.scrollIntoView({ block: "nearest" });
  }, [container, id]);
}

function tabsAvailable(terms: Term[], reading: ReadingItem[]): PanelKey[] {
  const tabs: PanelKey[] = [];
  if (reading.length) tabs.push("reading");
  if (terms.length) tabs.push("terms");
  return tabs;
}

const tabLabels = (panel: PanelKey, count: number) =>
  panel === "reading" ? content.talk.readingTab(count) : content.talk.termsTab(count);

const TabIcon = ({ panel }: { panel: PanelKey }) =>
  panel === "reading" ? <BookIcon /> : <TermsIcon />;

const onSignal = {
  background: "var(--signal)",
  color: "var(--on-signal)",
  borderColor: "var(--signal)",
} as const;
const offSignal = {
  background: "var(--surface)",
  color: "var(--soft)",
  borderColor: "var(--rule)",
} as const;

// ---------------------------------------------------------------------------
// Desktop: side rail and panel
// ---------------------------------------------------------------------------

export function SideRail() {
  const { state, dispatch, terms, reading, isDesktop } = usePanels();
  const talk = content.talk;
  const tabs = tabsAvailable(terms, reading);
  const regionId = useId();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<PanelKey, HTMLButtonElement | null>>>({});

  const open = isDesktop && state.panel !== null ? state.panel : null;
  useScrollToFocus(panelRef, open ? state.focusId : null);

  // Escape closes the panel and puts focus back on its tab, wherever focus was.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      dispatch({ type: "close" });
      tabRefs.current[open]?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, dispatch]);

  if (tabs.length === 0) return null;

  return (
    <aside
      aria-label={talk.panelsLabel}
      onMouseLeave={() => dispatch({ type: "leave" })}
      className="relative hidden min-w-12 flex-1 self-stretch lg:block"
    >
      <div className="sticky top-6 flex items-start justify-end">
        {open && (
          <div
            ref={panelRef}
            id={regionId}
            role="region"
            aria-labelledby={titleId}
            className="max-h-[640px] w-[340px] shrink-0 overflow-y-auto border border-r-0 border-rule bg-surface shadow-[-18px_18px_40px_rgba(0,0,0,0.45)]"
          >
            <div className="sticky top-0 flex items-center justify-between gap-2 border-b border-rule bg-surface px-4 py-3.5">
              <h2 id={titleId} className="text-[15px] font-semibold">
                {talk.panelTitles[open]}
              </h2>
              <span className="flex items-center gap-1.5">
                <span className="text-[12px] text-muted">
                  {state.pinned ? talk.pinned : talk.pinHint}
                </span>
                <button
                  type="button"
                  aria-label={talk.closePanel}
                  onClick={() => {
                    dispatch({ type: "close" });
                    tabRefs.current[open]?.focus();
                  }}
                  className="flex size-9 cursor-pointer items-center justify-center border border-rule bg-transparent text-soft"
                >
                  <CloseIcon />
                </button>
              </span>
            </div>
            <div className="p-2">
              <PanelBody panel={open} />
            </div>
          </div>
        )}

        <div className="flex shrink-0 flex-col gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              ref={(el) => {
                tabRefs.current[tab] = el;
              }}
              type="button"
              aria-expanded={open === tab}
              aria-controls={open === tab ? regionId : undefined}
              onClick={() => dispatch({ type: "toggle", tab })}
              onMouseEnter={() => dispatch({ type: "hover", tab })}
              className="flex min-h-[150px] w-12 cursor-pointer flex-col items-center justify-center gap-2.5 border px-0 py-3.5 font-[inherit]"
              style={open === tab ? onSignal : offSignal}
            >
              <TabIcon panel={tab} />
              <span className="text-[14px] tracking-[0.06em] [writing-mode:vertical-rl]">
                {tabLabels(tab, tab === "reading" ? reading.length : terms.length)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Phone: bottom bar and sheet
// ---------------------------------------------------------------------------

export function MobileBar() {
  const { state, dispatch, terms, reading, isDesktop } = usePanels();
  const talk = content.talk;
  const tabs = tabsAvailable(terms, reading);
  if (tabs.length === 0) return null;

  return (
    <>
      <div
        role="group"
        aria-label={talk.panelsLabel}
        className="fixed inset-x-0 bottom-0 z-30 box-border grid gap-2.5 border-t border-rule bg-surface px-4 pt-2.5 lg:hidden"
        style={{
          gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
          height: "calc(68px + env(safe-area-inset-bottom))",
          paddingBottom: "calc(10px + env(safe-area-inset-bottom))",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={!isDesktop && state.panel === tab}
            onClick={() => dispatch({ type: "show", tab })}
            className="flex cursor-pointer items-center justify-center gap-2 border font-[inherit] text-[15px]"
            style={!isDesktop && state.panel === tab ? onSignal : offSignal}
          >
            <TabIcon panel={tab} />
            {tabLabels(tab, tab === "reading" ? reading.length : terms.length)}
          </button>
        ))}
      </div>

      {!isDesktop && state.panel !== null && <Sheet panel={state.panel} tabs={tabs} />}
    </>
  );
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function Sheet({ panel, tabs }: { panel: PanelKey; tabs: PanelKey[] }) {
  const { state, dispatch } = usePanels();
  const talk = content.talk;
  const dialogRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  useScrollToFocus(bodyRef, state.focusId);

  // Focus moves in on open and back to whatever opened the sheet on close;
  // the page behind does not scroll while the sheet is open.
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const { documentElement: html, body } = document;
    const previous = { html: html.style.overflow, body: body.style.overflow };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    dialogRef.current?.focus();

    return () => {
      html.style.overflow = previous.html;
      body.style.overflow = previous.body;
      opener?.focus();
    };
  }, []);

  // Escape closes. Tab stays inside the sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dispatch({ type: "close" });
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const items = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!dialog.contains(active) || (event.shiftKey && (active === first || active === dialog))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [dispatch]);

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div
        aria-hidden="true"
        onClick={() => dispatch({ type: "close" })}
        className="absolute inset-0 bg-[rgba(2,8,16,0.6)]"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={talk.panelTitles[panel]}
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 flex h-[60dvh] max-h-[calc(100dvh-24px)] flex-col border-t border-signal bg-surface shadow-[0_-18px_40px_rgba(0,0,0,0.5)] outline-none focus-visible:outline-none"
      >
        <div aria-hidden="true" className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-sm bg-handle" />
        <div className="flex shrink-0 items-center gap-2 border-b border-rule py-2.5 pl-4 pr-3">
          <div
            className="grid flex-1 border border-rule"
            style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
          >
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                aria-pressed={panel === tab}
                onClick={() => dispatch({ type: "show", tab })}
                className="min-h-11 cursor-pointer border-0 font-[inherit] text-[14px]"
                style={
                  panel === tab
                    ? { background: "var(--signal)", color: "var(--on-signal)", fontWeight: 600 }
                    : { background: "transparent", color: "var(--soft)" }
                }
              >
                {tab === "reading" ? talk.readingTabShort : talk.termsTabShort}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label={talk.closePanel}
            onClick={() => dispatch({ type: "close" })}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center border border-rule bg-transparent text-soft"
          >
            <CloseIcon />
          </button>
        </div>
        <div ref={bodyRef} className="flex-1 overflow-y-auto overscroll-contain p-2">
          <PanelBody panel={panel} />
        </div>
      </div>
    </div>
  );
}
