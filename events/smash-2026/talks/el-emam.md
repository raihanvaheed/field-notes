---
slug: el-emam
title: ""
topic: "Learnings from generating synthetic health data"
session: Keynote
date: 2026-11-03
time: "14:30–15:30"
speakers:
  - name: "Khaled El Emam"
    affiliation: "CHEO Research Institute, University of Ottawa"
    link: ""
themes: [health, open, measure]
diagrams: []
status: published
---

## In one line

Synthetic health data is practical today for two jobs, sharing data without exposing patients and boosting small datasets, as long as you test several generators, measure privacy risk, and analyse about ten synthetic datasets instead of trusting one.

## Key ideas

### Two main uses

- **Privacy:** if synthetic data no longer counts as personal information, it can be shared more easily for research, software testing, teaching and collaboration.
- **[Data augmentation](#data-augmentation):** adding realistic records to small datasets, adding diversity, and helping with under-represented groups.

All of his examples were tabular health data.

### No single best generator

No type of generative model wins consistently on both usefulness and privacy. In practice, try three or four (for example a diffusion model, a GAN and sequential trees), evaluate them on your own data, and pick the best.

### Synthetic doesn't automatically mean private

An overfit generator can copy the real data. Regulators in several countries say the same thing: measure the risk. His group helped build a consensus framework that recommends two metrics, [membership disclosure](#membership-disclosure) and [attribute disclosure](#attribute-disclosure). What's still missing is agreed thresholds, because the regulatory question is yes or no.

### Use about ten datasets, not one

Generating data is random, so each synthetic dataset gives slightly different answers. Treat it like [multiple imputation](#multiple-imputation): generate about ten, analyse each, and combine the results. If you share synthetic data publicly, share several versions.

### Does it give the same answers?

The key test is replicability: run the same analysis on real and synthetic data and compare the conclusions, not just how similar the data looks. His group's studies found close agreement in several settings. Other findings:

- Sending a synthetic copy of one site's data to another gave results very close to a full [federated analysis](#federated-analysis), in a fraction of the time.
- Augmentation helped most on small datasets, and could make things worse on large ones.
- It helped trials that couldn't recruit enough patients, and groups with low-to-medium under-representation. Nothing fixes extreme cases where there's too little data to learn from.
- Privacy and usefulness held up as the number of variables grew, so you can synthesise a whole database once and cut cohorts from it, instead of repeating the work for every request.

## Terms

### Data augmentation

Adding generated records to a dataset to make it bigger or more varied.

### Membership disclosure

The risk that someone can tell whether a real person's record was used to make the synthetic data.

### Attribute disclosure

The risk that someone can learn something new and sensitive about a real person from the synthetic data.

### Multiple imputation

A statistics method that creates several versions of the data, analyses each, and combines the results to account for uncertainty.

### Federated analysis

Analysing data that stays at each site, sending only results between them, instead of pooling the data in one place.
