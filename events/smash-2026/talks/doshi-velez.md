---
slug: doshi-velez
title: ""
topic: "How to get effective human–AI collaboration"
session: Keynote
date: 2026-11-03
time: "09:40–10:40"
speakers:
  - name: "Finale Doshi-Velez"
    affiliation: "Harvard University"
    link: ""
themes: [account, health]
diagrams: []
status: published
---

## In one line

Stopping harmful AI is necessary but not enough. To get good outcomes, keep models small enough for experts to inspect, spend human attention only where it matters, and design tools that keep people thinking instead of rubber-stamping.

## Key ideas

### The goal is a better human decision

In much of her work, an AI can take in far more data than a person, but a human (a doctor, a patient) makes the final call. The AI's job is to help that person decide better. A beautiful summary isn't success if the decision doesn't improve.

### Many health problems admit small models

In an ICU project on managing low blood pressure, her team went from a deep model nobody could read to a handful of regions a clinician could inspect on one slide. Because clinicians could see the whole model, they spotted a data-cleaning problem straight away. Her advice: if you're told a healthcare problem needs a huge model, question it.

They also only recommended changes at [decision points](#decision-points), where doctors had treated similar patients differently often enough to compare. Where there isn't enough data, the model shouldn't suggest deviating from what clinicians usually do. [The formal version](https://arxiv.org/abs/2410.09361) bounds how much worse the new policy can be than current practice.

### Explanations can backfire

In her studies, supporting information often made people more confident in a wrong AI answer. With psychiatrists, a simple explanation was the popular one, but it was where accuracy dropped most when the AI was wrong: people skimmed it and moved on. Asking people to answer first and only then see the AI helped those who weren't engaged, but it feels parental.

### Interactivity keeps people thinking

Clinicians loved toggling patient conditions to see how a recommendation changed, which gave engagement and a sense of ownership for free. For crisis negotiators, a pre-filled summary felt like someone else's cheat sheet, and chat alone let them miss things. Her team's design: an empty worksheet beside a chat that fills in as you talk, so the gaps show what you haven't asked yet. People asked more varied questions, did better, and found it less work.

### Human attention is precious

Be deliberate about where you ask people to look. If a recommendation rests on only one or a few data points, flag it for checking; doing that surfaced real data errors. And some actions only make sense together, like picking up a key to open a door, so recommend [linked actions](#linked-actions) as a bundle rather than letting people take only half.

## Worth reading

- [Sharma et al., AISTATS 2025](https://arxiv.org/abs/2410.09361): the decision-points method shown in the talk.

## Terms

### Decision points

Situations where clinicians made different choices for similar-looking patients often enough that the data can show which choice worked better.

### Linked actions

Recommendations that only make sense together, where doing one without the other can make things worse.
