import { content } from "@/content";

const linkClass = "text-signal transition-colors hover:text-signal-hi";

/** Footer for the home page and event hubs (talk pages have their own line). */
export function SiteFooter() {
  const { site } = content;
  return (
    <footer className="mt-16 flex flex-col gap-3 border-t border-rule pt-6 text-[13px] leading-[1.5] text-shade md:flex-row md:flex-wrap md:justify-between md:gap-x-6 md:text-[14px]">
      <span>{site.footer}</span>
      <span className="flex flex-col gap-1.5 md:flex-row md:gap-6">
        <a href={`mailto:${site.corrections.email}`} className={linkClass}>
          {site.corrections.label}
        </a>
        <a href={site.source.href} className={linkClass}>
          {site.source.label}
        </a>
      </span>
    </footer>
  );
}
