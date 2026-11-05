import { Children, isValidElement, type ReactNode } from "react";
import Markdown, { type Components } from "react-markdown";
import { content } from "@/content";
import { parseFormula } from "@/lib/formula";
import { prefixSvgIds, svgTitle } from "@/lib/svg";
import type { TalkContent } from "@/lib/types";
import { Formula } from "./formula";
import { ReadingButton, TermButton } from "./talk-panels";

type Props = {
  source: string;
  talk: TalkContent;
  /** Prefix that keeps inlined diagram ids unique within the page. */
  idPrefix: string;
  variant?: "body" | "lead";
};

/**
 * Renders the Markdown of a talk ("In one line" and "Key ideas") on the server.
 *
 * - `[text](#term-id)` becomes a dashed term button; the id must be a term.
 * - A link whose URL is in "Worth reading" becomes a blue reference button.
 * - Any other http link opens in a new tab.
 * - `![alt](../diagrams/x.svg)` plus an italic line becomes an inline SVG figure.
 * - A ```formula block becomes an interactive formula.
 *
 * Anything it cannot place throws, so a mistake in a talk fails the build.
 */
export function NoteMarkdown({ source, talk, idPrefix, variant = "body" }: Props) {
  const where = talk.filePath;
  const termIds = new Set(talk.terms.map((t) => t.id));
  const readingByUrl = new Map(talk.reading.filter((r) => r.url).map((r) => [r.url!, r.id]));
  const diagrams = new Map(talk.diagrams.map((d) => [d.file, d.svg]));

  const components: Components = {
    a({ href, children }) {
      if (!href) return <>{children}</>;

      if (href.startsWith("#")) {
        const id = href.slice(1);
        if (!termIds.has(id)) {
          throw new Error(
            `[field-notes] ${where}: the link ${href} has no matching "### ..." heading under "## Terms"`,
          );
        }
        return <TermButton id={id}>{children}</TermButton>;
      }

      const readingId = readingByUrl.get(href);
      if (readingId) return <ReadingButton id={readingId}>{children}</ReadingButton>;

      if (/^https?:\/\//i.test(href)) {
        return (
          <a className="ext-link" href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        );
      }
      if (/^mailto:/i.test(href)) {
        return (
          <a className="ext-link" href={href}>
            {children}
          </a>
        );
      }
      throw new Error(
        `[field-notes] ${where}: cannot link to "${href}" (use an http(s) link, a #term link or mailto:)`,
      );
    },

    // Images are only allowed as a diagram on its own line; see `p` below.
    img() {
      throw new Error(
        `[field-notes] ${where}: an image must be a ../diagrams/<file>.svg diagram on its own line, ` +
          `followed by an italic credit line`,
      );
    },

    p({ node, children }) {
      const kids = node?.children ?? [];
      const significant = kids.filter((k) => !(k.type === "text" && k.value.trim() === ""));
      const first = significant[0];

      if (first?.type !== "element" || first.tagName !== "img") return <p>{children}</p>;

      const src = String(first.properties?.src ?? "");
      const file = src.match(/^\.\.\/diagrams\/([^/]+\.svg)$/)?.[1];
      if (!file) {
        throw new Error(`[field-notes] ${where}: image "${src}" must point at ../diagrams/<file>.svg`);
      }
      const svg = diagrams.get(file);
      if (!svg) {
        throw new Error(
          `[field-notes] ${where}: image "${src}" is not listed under "diagrams:" in the frontmatter`,
        );
      }

      const credit = significant[1];
      const creditIsItalic = credit?.type === "element" && credit.tagName === "em";
      if (significant.length > 2 || (credit && !creditIsItalic)) {
        throw new Error(
          `[field-notes] ${where}: a diagram can only be followed by one italic credit line (${src})`,
        );
      }

      let caption: ReactNode = null;
      if (credit) {
        const rendered = Children.toArray(children);
        if (rendered.length !== kids.length) {
          throw new Error(`[field-notes] ${where}: could not read the credit line under ${src}`);
        }
        const element = rendered[kids.indexOf(credit)];
        caption = isValidElement<{ children?: ReactNode }>(element) ? element.props.children : null;
      }

      // The box is named after the diagram's own <title> (the Markdown alt text, or the
      // file name, if it has none).
      const label = svgTitle(svg) ?? (String(first.properties?.alt ?? "").trim() || file);

      return (
        <figure className="flex flex-col gap-2.5 border border-rule bg-surface p-3.5 md:gap-3.5 md:p-[22px]">
          {/* Below 768px the diagram scrolls sideways inside this box, at a minimum width
              of 640px, so its text stays readable (see .diagram-box in globals.css). From
              768px up the box is invisible: the diagram looks as it always did. The box is
              focusable so keyboard users can scroll it. */}
          <div role="region" aria-label={label} tabIndex={0} className="diagram-box">
            <div
              className="diagram"
              // The SVG comes from this repo's own events/<event>/diagrams/ folder,
              // and notes.ts rejects scripts and event handlers in it.
              dangerouslySetInnerHTML={{ __html: prefixSvgIds(svg, `${idPrefix}-${file.replace(/\.svg$/, "")}`) }}
            />
          </div>
          <p className="text-[12px] leading-normal text-muted md:hidden">{content.talk.diagramHint}</p>
          {caption && (
            <figcaption className="text-[12px] leading-normal text-muted md:text-[13px]">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    },

    pre({ node, children }) {
      const code = node?.children[0];
      if (code?.type === "element" && code.tagName === "code") {
        const classes = code.properties?.className;
        if (Array.isArray(classes) && classes.includes("language-formula")) {
          const text = code.children.map((c) => (c.type === "text" ? c.value : "")).join("");
          try {
            const { tokens, symbols } = parseFormula(text);
            return <Formula tokens={tokens} symbols={symbols} />;
          } catch (error) {
            throw new Error(`[field-notes] ${where}: ${(error as Error).message}`);
          }
        }
      }
      return <pre>{children}</pre>;
    },

    // The page's h1 is the talk title and "In one line" is an h2, so each
    // "###" idea is an h2 and a "####" inside it is an h3.
    h1: ({ children }) => <h2>{children}</h2>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h2>{children}</h2>,
    h4: ({ children }) => <h3>{children}</h3>,
    h5: ({ children }) => <h3>{children}</h3>,
    h6: ({ children }) => <h3>{children}</h3>,
  };

  return (
    <div className={variant === "lead" ? "notes-lead" : "notes-prose"}>
      <Markdown components={components}>{source}</Markdown>
    </div>
  );
}
