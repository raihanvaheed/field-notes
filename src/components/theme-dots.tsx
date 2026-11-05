import { content } from "@/content";
import type { Theme } from "@/lib/types";

/**
 * Coloured dots for a set of themes. The dots are decorative; the theme names
 * are available to assistive technology as visually hidden text.
 */
export function ThemeDots({
  themes,
  size = 8,
  gap = 5,
}: {
  themes: Theme[];
  size?: number;
  gap?: number;
}) {
  return (
    <>
      <span aria-hidden="true" className="flex" style={{ gap }}>
        {themes.map((t) => (
          <span
            key={t.id}
            className="rounded-full"
            style={{ width: size, height: size, background: t.color }}
          />
        ))}
      </span>
      <span className="sr-only">
        {content.hub.themesList(themes.map((t) => t.label).join(", "))}
      </span>
    </>
  );
}
