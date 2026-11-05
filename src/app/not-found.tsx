import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";
import { content } from "@/content";

export const metadata: Metadata = { title: content.meta.notFoundTitle };

export default function NotFound() {
  const { site } = content;
  return (
    <main className="flex flex-1 items-center">
      <div className="mx-auto w-full max-w-[72rem] px-6 py-16 md:px-16">
        <h1 className="text-[36px] font-bold leading-[1.05] md:text-[56px]">{site.notFoundTitle}</h1>
        <div className="accent-bar mt-3.5" aria-hidden="true" />
        <p className="mt-3.5 text-[15px] text-soft md:text-[20px]">{site.notFoundBody}</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-[0.9375rem] text-signal transition-colors hover:text-signal-hi"
        >
          <ArrowLeftIcon size={16} />
          {site.notFoundLink}
        </Link>
      </div>
    </main>
  );
}
