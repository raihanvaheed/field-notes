# Talk page format

Every file in `events/<event>/talks/` follows this format. It reads as plain Markdown on GitHub, and the live site adds the interactive parts (the side panel, tooltips) from the same text.

## Frontmatter

```yaml
---
slug: bacon                 # matches the file name and the page URL
title: ""                   # official title if known
topic: "..."                # used when there is no official title
session: Invited talk       # Keynote, Invited talk or Panel
date: 2026-11-04
time: "13:30–14:00"
speakers:
  - name: "..."
    affiliation: "..."
    link: ""                # public page for the speaker, if any
moderator:                  # panels only
  name: "..."
  affiliation: "..."
themes: [energy, measure]   # ids from the event's agenda.yaml
diagrams: [bacon-energy-levers.svg]
status: draft               # draft or published
---
```

Only `status: published` pages appear on the live site.

## Body sections, in this order

1. `## In one line`: one or two sentences.
2. `## Key ideas`: three to six `###` subsections.
3. `## Worth reading` (optional): a bullet list. Each item is `- [Title](url): who, year. Why read it.` An item may have no link: `- Title: who, year. Why read it.`
4. `## Terms` (optional): one `###` heading per term, followed by a short plain-language definition.

## Inline conventions

- **Terms:** `[KV cache](#kv-cache)` in the text, where `#kv-cache` is the GitHub anchor of a `### KV cache` heading under `## Terms`. On GitHub it jumps to the definition. On the site it opens the Terms panel at that term.
- **Reading:** a normal link whose URL also appears in `## Worth reading`. On the site it opens the Reading panel at that item. Links not in the reading list behave as normal links.
- **Diagrams:** `![Alt text](../diagrams/<file>.svg)` on its own line, followed by a credit line in italics on the next line, e.g. `*Adapted from <Speaker>'s talk at SMASH 2026.*`
- **Formulas:** a fenced block with the language `formula`. The first line is the formula. Every following line is `symbol: meaning`. On the site, each symbol in the formula shows its meaning as a tooltip (hover on desktop, tap on a phone). In symbols, `_x` is a subscript and `^x` a superscript.

````markdown
```formula
L(N, D) = E + A / N^α + B / D^β
L: the model's loss (lower is better)
N: number of model parameters
```
````

## Anchors

Term headings use letters, numbers, spaces and hyphens only, so the GitHub anchor is predictable: lower case, spaces become hyphens (`### Prefill and decode` → `#prefill-and-decode`).
