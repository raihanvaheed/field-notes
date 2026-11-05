import Link from "next/link";
import { Fragment } from "react";
import { content } from "@/content";

export type Crumb = { label: string; href?: string };

const linkClass =
  "text-shade no-underline transition-colors hover:text-ink focus-visible:text-ink";

/** raihanvaheed.dev / Field Notes / ... The last crumb is the current page. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label={content.site.breadcrumbLabel}
      className="flex flex-wrap gap-x-2 gap-y-1 text-[13px] text-shade md:text-[14px]"
    >
      {items.map((item, index) => (
        <Fragment key={`${item.label}-${index}`}>
          {index > 0 && <span aria-hidden="true">/</span>}
          {item.href === undefined ? (
            <span aria-current="page" className="text-ink">
              {item.label}
            </span>
          ) : item.href.startsWith("/") ? (
            <Link href={item.href} className={linkClass}>
              {item.label}
            </Link>
          ) : (
            <a href={item.href} className={linkClass}>
              {item.label}
            </a>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
