---
slug: gaud
title: ""
topic: "Looking beyond the model: the physical footprint of AI"
session: Keynote
date: 2026-11-03
time: "10:40–11:10"
speakers:
  - name: "Vrushali Gaud"
    affiliation: "Google Sustainability"
    link: ""
themes: [energy, measure]
diagrams: []
status: published
---

## In one line

AI's footprint is physical (electricity, grids, water and hardware), so the burden of using it responsibly shouldn't fall on users: build the system right in the first place, measure it, and use AI where the benefit is clear.

## Key ideas

### Why SMASH exists

SMASH began about two years ago as a conversation between Mila and Google, to make room for topics most curated conferences don't. Her background is automotive, not ML research. Her analogy: cars changed lives, then the industry spent decades fixing the unintended consequences. How do we avoid doing the same with AI?

### Look beyond the model

People see the app, and maybe the model, but not the physical side underneath. Teams working on energy, chips and models are often siloed, and few people look across which chip, which model and which region a workload uses.

### Information alone doesn't change behaviour

Most of the room didn't know the energy or water cost of their own AI use, and most wanted to. But in sustainability, information rarely changes habits on its own. Her position: don't put the burden on users. Give them real options, and design the system well from the start.

### The physical stack

She described four layers: hardware and infrastructure, software (serving and orchestration), models, and applications. At the infrastructure level, three things matter most:

- **Clean energy:** electricity is the biggest factor in emissions, and where a data centre sits matters. The aim is clean energy around the clock, [matched hour by hour](#hourly-matching) rather than as a yearly total.
- **Grids:** flexible work can move in time and place, but reaching clean power through old, fragmented grids is the hard part.
- **Water and cooling:** water cools chips best but competes with communities in water-stressed regions. Air cooling saves water but uses more energy.

The biggest challenge is speed: data centres are being built faster than clean energy and grids can follow.

### Measuring it, and AI used for good

She shared Google's published per-prompt figures: over 12 months, energy per median text prompt fell 33× and its carbon footprint 44×, and a median prompt now uses less energy than watching about nine seconds of TV. She was candid that this is a starting point, since nobody sends just one prompt. On the benefit side she pointed to [Flood Hub](https://sites.research.google/floodforecasting), which forecasts river floods for over 700 million people in 150 countries, FireSat for early wildfire detection, and work on reducing [aircraft contrails](#contrails).

## Worth reading

- [Flood Hub](https://sites.research.google/floodforecasting): Google's flood forecasting service.
- [How AI is helping us build a more resilient planet](https://research.google/blog/how-ai-is-helping-us-build-a-more-resilient-planet/): Google Research, 2025. Flood Hub, FireSat and contrails.

## Terms

### Hourly matching

Matching each hour of electricity use with clean energy produced in that same hour, instead of balancing totals over a year.

### Contrails

The line-shaped clouds planes leave behind. They trap heat, and some can be avoided by changing a flight's altitude.
