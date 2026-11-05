// Helpers for diagrams that are inlined into the page.

/** The text of the SVG's own <title>, which names the diagram; null if it has none. */
export function svgTitle(svg: string): string | null {
  const match = svg.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) return null;
  const text = match[1]
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  return text || null;
}

/**
 * Every diagram uses the same ids ("t" and "d" for its title and description).
 * Inlined twice on one page they would collide and break aria-labelledby, so
 * give each diagram's ids a prefix, and every reference to them too.
 */
export function prefixSvgIds(svg: string, prefix: string): string {
  const ids = new Set([...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  if (ids.size === 0) return svg;

  const renamed = (id: string) => (ids.has(id) ? `${prefix}-${id}` : id);

  return svg
    .replace(/(\sid=")([^"]+)(")/g, (_, open: string, id: string, close: string) => `${open}${renamed(id)}${close}`)
    .replace(
      /(\saria-(?:labelledby|describedby)=")([^"]+)(")/g,
      (_, open: string, value: string, close: string) =>
        `${open}${value.split(/\s+/).map(renamed).join(" ")}${close}`,
    )
    .replace(/url\(#([^)]+)\)/g, (_, id: string) => `url(#${renamed(id)})`)
    .replace(/((?:xlink:)?href=")#([^"]+)(")/g, (_, open: string, id: string, close: string) => `${open}#${renamed(id)}${close}`);
}
