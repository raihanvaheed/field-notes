# Adding a new event

1. Copy `events/_template/` to `events/<event-slug>/`, where the slug is short, lower case and hyphenated (for example `bigbrain-2026`). The slug becomes the URL: `fieldnotes.raihanvaheed.dev/<event-slug>`.
2. Fill in `agenda.yaml`: the event block, the themes, and one entry per session you took notes on.
3. Write one file per session in `talks/`, following `docs/format.md` and `docs/content-rules.md`. Write them from your private notes, keeping to the main messages, and leave out anything unclear, unpublished or about people you met.
4. Redraw any diagrams worth keeping into `diagrams/` (see `docs/diagrams.md`), with a credit line on the talk page.
5. Write `themes.md` and `resources.md`.
6. Preview locally with drafts: `FIELD_NOTES_DRAFTS=1 pnpm dev`.
7. When a talk is reviewed, set its `status` to `published`. Only published talks appear on the site, and an event appears once it has at least one.
8. Commit and push. Cloudflare rebuilds the site.
9. Add the event's card to the Field Notes section of the portfolio.
