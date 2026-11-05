---
slug: kadivar
title: ""
topic: "How to actually deploy AI in healthcare"
session: Invited talk
date: 2026-11-04
time: "16:00–16:30"
speakers:
  - name: "Amir Kadivar"
    affiliation: "Tali AI"
    link: ""
themes: [health]
diagrams: []
status: published
---

## In one line

Most of a doctor's admin work needs little clinical judgement, so AI can take it on with engineering we already know. The hard parts are the infrastructure and the people: every rollout changes how someone works.

## Key ideas

### The admin burden

- **Visit notes,** which need a specific structure.
- **Billing codes,** with intricate rules. Ontario's rulebook alone is about 1,000 pages.
- **The inbox:** lab results, prescription renewals, reports and duplicates, hundreds a day.
- **Referrals:** finding a specialist who will take the case, then handling their reply.

Doctors pay for it with evenings spent charting ("pyjama time"), and patients get less of their attention.

### Why it's solvable now

This isn't AI diagnosing rare cancers. The work is manual and repetitive, and only sometimes needs a little judgement. Just inside what AI can already do, these are engineering problems: we know how to build reliable systems out of unreliable parts.

### Why it's hard

- **[Yak shaving](#yak-shaving):** delivering the vision means a long chain of infrastructure work first.
- **Integrations:** the [EMR](#emr) is the legal system of record, with different rules in every region. A tool that takes three clicks and 20 seconds to log into hasn't solved anything.
- **Real-world audio:** telling speakers apart in a noisy exam room is much harder than in a video call ([speaker diarization](#speaker-diarization)).
- **People:** healthcare is a [sociotechnical system](#sociotechnical-system). The term comes from a 1951 study of coal mining, where new machinery reorganised the work and made miners miserable. People also have a limited capacity for change.

### Whose behaviour has to change?

The question his team asks before building any feature. Software engineers were among the first whose own work AI agents changed, so they can design with lessons they've lived through. And reasoning about systems that aren't perfectly predictable isn't new: manufacturing and aviation have done it for decades. Rolling AI into healthcare is one big [migration](#migration): hard, but solvable.

## Worth reading

- Some Social and Psychological Consequences of the Longwall Method of Coal-Getting: Trist and Bamforth, Human Relations, 1951. Where the term "sociotechnical system" comes from.

## Terms

### Yak shaving

A chain of side tasks you have to finish before you can do the thing you actually set out to do.

### EMR

Electronic medical record: the system that holds a patient's legal chart.

### Speaker diarization

Working out who spoke when in an audio recording.

### Sociotechnical system

A system where people's work and the technology shape each other, so you have to design both together.

### Migration

Moving a live system from an old way of working to a new one without breaking it along the way.
