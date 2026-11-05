@AGENTS.md

# CLAUDE.md

## What this is

Field Notes: Rai Vaheed's public notes from events he attends, and the static website that renders them at fieldnotes.raihanvaheed.dev. The notes are Markdown and YAML under `events/`. The site is Next.js 16, exported as a static site and deployed to Cloudflare as static assets, the same way as the owner's `portfolio` and `scanlint` repos.

## Commands

Run these yourself. Never assume a check passes.

- Install: `pnpm install`
- Dev: `pnpm dev` (published talks only), `FIELD_NOTES_DRAFTS=1 pnpm dev` (drafts too)
- Lint: `pnpm lint`
- Types: `pnpm typecheck`
- Build: `pnpm build` — writes the deployable site to `out/`
- Deploy dry run: `pnpm exec wrangler deploy --dry-run`

To look at the built site, serve `out/` with a static server that resolves `/x` to `x.html`.

## Architecture

Only what the file tree does not already show.

- Content lives in `events/<event>/` (see `docs/format.md`). Folders starting with `_` are templates and are never rendered. The site discovers events by listing `events/`; adding an event needs no code change.
- `src/lib/notes.ts` reads and validates all content at build time with zod, so an invalid file fails the build. Only `status: published` talks are rendered unless `FIELD_NOTES_DRAFTS=1`. An event with no published talks is not rendered.
- A production build (`next build`) fails with `No published talks yet. Publish at least one talk (set status: published), or preview drafts with: FIELD_NOTES_DRAFTS=1 pnpm build` when nothing is published; `next dev` shows the empty home page instead.
- Routes: `/` lists events, `/<event>` is the event's timeline hub, `/<event>/<talk>` is a talk page.
- `wrangler.jsonc` has **no** `main` field and serves `./out` as static assets. Keep it a static-assets deployment.

## Invariants

Permanent. A change that breaks one is wrong even if it works and the build passes.

- Static export only. `output: "export"` and `images.unoptimized: true` in `next.config.ts` stay. No API routes, middleware, rewrites, redirects, or server-side rendering. Dynamic routes need `generateStaticParams`.
- Everything under `events/` and `docs/`, plus `README.md`, is owner-edited. Never create, edit, move or delete those files unless an instruction explicitly says to.
- Talk text comes only from `events/`. Components hold UI copy, never talk content. Never invent or paraphrase facts about speakers, talks or events.
- No photos of slides, speakers or audiences anywhere. Diagrams are the owner's redrawn SVGs from `events/<event>/diagrams/`.
- No analytics, tracking, or third-party scripts. Fonts are loaded the way the portfolio loads them.
- Drafts never reach a production build: `FIELD_NOTES_DRAFTS` is only ever set locally.

## Conventions

Only the ones the existing code does not already demonstrate.

- Dark theme only, matching the portfolio's colour tokens. No light mode and no `prefers-color-scheme` branching.
- A new dependency needs approval first. Name and justify each one in the PR description.
- Only link what resolves. Follow every link you add in a real browser.

## Working agreement

- Never run `git add`, `git commit`, `git push`, or anything that rewrites history or discards work. Commits are checkpoints the owner declares after reviewing the work.
- Do the described change, then stop. No unrequested features, refactors, renames or dependency bumps.
- At the end of each task, overwrite `explanation.md` (gitignored) with a short plain-language state of the project, and write `.pr-description.md` (gitignored) with what changed, the decisions made and the verification results.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
