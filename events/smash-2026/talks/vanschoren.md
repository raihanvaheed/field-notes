---
slug: vanschoren
title: ""
topic: "Building an open ecosystem for AI research"
session: Keynote
date: 2026-11-04
time: "09:40–10:40"
speakers:
  - name: "Joaquin Vanschoren"
    affiliation: "TU Eindhoven, AMORE"
    link: ""
themes: [open, measure]
diagrams: []
status: published
---

## In one line

Open, trustworthy AI won't come from one breakthrough but from many shared parts built over years. The hard part isn't the model architecture; it's the data, evaluation and infrastructure, and that should be shared and open.

## Key ideas

### Connecting the dots

He opened with a decades-old vision of a book-sized computer that took about 25 years and a whole ecosystem to become today's laptop. Trustworthy, open AI is the same: build the individual parts now, so the ingredients exist in ten years. He told four stories.

### 1. OpenML

[OpenML](https://www.openml.org) lets anyone share a dataset with one line of code, with machine-readable tasks and results that upload automatically, so experiments are comparable and reproducible. Lessons from ten years: in-person hackathons built the community, simple APIs and a shared vocabulary mattered, and open platforms struggle to fund engineers and upkeep.

### 2. Rewarding good data

He co-founded the NeurIPS Datasets and Benchmarks track because people won't build good datasets unless it counts for their careers. The track judges data papers on documentation, accessibility, maintenance and ethics rather than on novelty, and now requires data to be hosted with proper metadata. His lesson: reward people in the currency they value.

### 3. Croissant

[Croissant](https://github.com/mlcommons/croissant) is a shared [metadata](#metadata) standard for ML datasets, built with the major dataset platforms. It describes a dataset in layers (basic details, files, record structure, meaning), so any tool can find and load it. Communities have added extensions for responsible-AI documentation, Earth observation and biomedical data. Lesson: build bridges, not another platform.

### 4. Fully open models

Many "open" models share their weights but not their training data or recipes. [OpenEuroLLM](https://strategic-technologies.europa.eu/step-results/step-stories/openeurollm_en) is building fully open models for all EU languages, publishing data and methods as it goes. Some practical points:

- Train in phases and save the best data for the end ([annealing](#annealing)).
- Predict performance before spending big compute, by fitting a [scaling law](#scaling-law) on a ladder of small training runs:

```formula
L(N, D) = E + A / N^α + B / D^β
L: the model's loss (lower is better)
N: number of model parameters
D: number of training tokens
E: the loss you can't get rid of, however big you go
A / N^α: the penalty for a model that is too small
B / D^β: the penalty for too little data
```

- Build safety in at every step: respect opt-outs, scrub toxic and personal data, limit memorisation, test, then red-team.

From his slide: "The hard part isn't the architecture. It's engineering, data cleaning, and knowing exactly what data went in and exactly how you measured what came out."

### What's next

He's building infrastructure to find any dataset and link it to evaluations and papers, including an [MCP server](#mcp-server) that lets AI agents search for and load datasets. In his words: "What we need now is more people."

## Worth reading

- [OpenML](https://www.openml.org): open platform for datasets, tasks and results.
- [Croissant](https://github.com/mlcommons/croissant): MLCommons' metadata standard for ML datasets.
- [OpenEuroLLM](https://strategic-technologies.europa.eu/step-results/step-stories/openeurollm_en): the EU's page on the project.

## Terms

### Metadata

Information about a dataset rather than the data itself: who made it, its licence, its files and what each column means.

### Annealing

The last phase of training, where the learning rate is lowered and the model sees the highest-quality data.

### Scaling law

A formula that predicts how a model's loss falls as you add parameters and training data.

### MCP server

A standard way to give an AI agent tools, here a tool for searching and loading datasets.
