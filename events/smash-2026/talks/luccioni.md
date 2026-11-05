---
slug: luccioni
title: ""
topic: "AI sustainability and what we should be measuring"
session: Keynote
date: 2026-11-03
time: "11:10–11:40"
speakers:
  - name: "Sasha Luccioni"
    affiliation: "Sustainable AI Group"
    link: ""
themes: [energy, measure, open]
diagrams: []
status: published
---

## In one line

We can't tell whether AI helps or harms the climate without numbers, and transparency is falling. So measure at every level: models per task, your own code, and AI's line in company footprints.

## Key ideas

### Why she started measuring

As a Mila postdoc working on AI for climate, she was asked whether her models did more good than the energy they used, and she couldn't say: the numbers didn't exist. Per-query figures from big companies still aren't comparable, because nobody knows what "average" means. What users actually want to know is which model is best for their task, and what it costs. Meanwhile, disclosure of compute and energy in notable AI papers rose for a while and is now falling.

### Training and inference

Early work estimated the emissions of training large models, such as [Strubell et al.](https://arxiv.org/abs/1906.02243) and her [BLOOM study](https://arxiv.org/abs/2211.02001), which showed emissions vary hugely with the power grid and setup. For running models, her [study across tasks](https://arxiv.org/abs/2311.16863) found that generating an image can use thousands of times more energy than classifying a piece of text. That kind of measurement is only possible with open models you can run yourself.

### What's being measured now

- The EU AI Act and the EU's data-centre rating scheme are starting to require reporting, such as [PUE](#pue), water use and heat reuse. What's still missing is absolute numbers, and location matters.
- [AI Energy Score](https://huggingface.co/blog/sasha/announcing-ai-energy-score) gives models star ratings for energy on the same task, so you can compare like with like.
- [CodeCarbon](https://github.com/mlco2/codecarbon), a Python package she created, runs alongside any code and estimates its energy use and emissions.

### What we're missing

- Data centres' impact is concentrated: nearby communities can face pollution from gas generators and higher electricity prices.
- The [Jevons paradox](#jevons-paradox): AI keeps getting more efficient, yet its total energy use keeps rising.
- On-device isn't always greener: simple tasks can run locally, but complex ones are often more efficient in the cloud.
- [Model routers](#model-routers) could send each query to the most efficient place to run it, weighing other factors such as security too.

### Measure at every level

Researchers should report energy even for small models, so "AI" doesn't only mean big company LLMs. Organisations should put AI in their environmental reports: a company spending heavily on AI should report it alongside travel and heating.

## Worth reading

- [Announcing AI Energy Score Ratings](https://huggingface.co/blog/sasha/announcing-ai-energy-score): Hugging Face blog. Star ratings for model energy use.
- [CodeCarbon](https://github.com/mlco2/codecarbon): measure the energy of your own code.
- [Power Hungry Processing: Watts Driving the Cost of AI Deployment?](https://arxiv.org/abs/2311.16863): Luccioni, Jernite and Strubell, 2023. Energy use across tasks.
- [Estimating the Carbon Footprint of BLOOM, a 176B Parameter Language Model](https://arxiv.org/abs/2211.02001): Luccioni, Viguier and Ligozat, 2022.
- [Energy and Policy Considerations for Deep Learning in NLP](https://arxiv.org/abs/1906.02243): Strubell, Ganesh and McCallum, 2019. An early estimate of training emissions.

## Terms

### PUE

Power usage effectiveness: a data centre's total energy divided by the energy its computers use. The extra is overhead such as cooling and lighting.

### Jevons paradox

When something becomes more efficient, people often use so much more of it that total consumption rises.

### Model routers

A system that decides, for each request, which model or machine should handle it, for example the smallest one that can do the job.
