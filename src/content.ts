// Every piece of UI text on the site, in one place, so it can be edited by hand.
// Event and talk text (names, summaries, notes) never goes here: it comes from events/.
//
// Keys marked "(from the brief)" are the owner's wording and are used verbatim.
// Keys marked "(added)" are small labels the pages need that the brief did not
// spell out; edit them freely.

type Legend = {
  /** The whole sentence. */
  text: string;
  /** The part of `text` drawn with a dashed underline (leave "" for none). */
  dashed: string;
  /** The part of `text` drawn in blue and underlined (leave "" for none). */
  blue: string;
};

export type Content = {
  site: {
    // (from the brief) The site title.
    title: string;
    // (from the brief) One line under the title on the home page.
    homeIntro: string;
    // (from the brief) Link back to the main site.
    mainSite: { label: string; href: string };
    // (from the brief) Shown on the home page when there are no events yet.
    homeEmpty: string;
    // (from the brief) Label on an event card's link.
    cardLink: string;
    // (from the brief) "Notes from 12 sessions" / "Notes from 1 session".
    sessionCount: (n: number) => string;
    // (from the brief) Footer line on the home and event pages.
    footer: string;
    // (from the brief) Mailto link for corrections.
    corrections: { label: string; email: string };
    // (from the brief) Link to the notes repository.
    source: { label: string; href: string };
    // (added) Where the notes' source files live, used to link each talk's Markdown.
    repoBlobBase: string;
    // (added) Accessible name of the breadcrumb trail.
    breadcrumbLabel: string;
    // (added) Heading on the 404 page.
    notFoundTitle: string;
    // (added) Line on the 404 page.
    notFoundBody: string;
    // (added) Link on the 404 page.
    notFoundLink: string;
  };

  meta: {
    // (from the brief) <title> of the home page.
    homeTitle: string;
    // (from the brief) <title> of an event page.
    hubTitle: (eventName: string) => string;
    // (from the brief) <title> of a talk page.
    talkTitle: (speakers: string, heading: string, eventName: string) => string;
    // (added) <title> of the 404 page.
    notFoundTitle: string;
  };

  hub: {
    // (from the brief) Small line above the event name: "Field Notes · Conference".
    eyebrow: (kind: string) => string;
    // (from the brief) Line under the event name.
    subtitle: (fullName: string, venue: string, dateLabel: string) => string;
    // (from the brief) Note about how complete the notes are.
    disclaimer: string;
    // (from the brief) Link to the event's own agenda page.
    agendaLink: string;
    // (from the brief) Heading above the theme chips.
    themesHeading: string;
    // (from the brief) Status line when nothing is hovered or picked.
    statusRest: string;
    // (from the brief) Status line while one theme is traced.
    statusTheme: (label: string, talks: number) => string;
    // (from the brief) Status line while a talk card is hovered.
    statusCard: (speakers: string, themeLabelsLower: string) => string;
    // (from the brief) Status line on small screens when nothing is picked.
    phoneStatusRest: string;
    // (from the brief) Status line on small screens with a theme picked; one entry per day.
    phoneStatusTheme: (label: string, perDay: { day: number; talks: number }[]) => string;
    // (added) Button that clears the picked theme.
    clear: string;
    // (added) Label above the time axis of the timeline.
    timeAxis: string;
    // (added) "Day 1".
    day: (n: number) => string;
    // (added) Tab label for a group of days, used when an event has more than two days.
    dayGroup: (firstDay: number, lastDay: number) => string;
    // (added) Accessible name of the timeline region.
    timelineLabel: string;
    // (added) Accessible name of the day tab group.
    dayTabsLabel: string;
    // (added) Accessible name of the group of theme chips.
    themeChipsLabel: string;
    // (added) Hidden text on each card: "Themes: Energy and footprint, ...".
    themesList: (labels: string) => string;
    // (added) Link text on an expanded timeline card.
    readNotes: string;
    // (added) "60 min" on the phone list.
    minutes: (n: number) => string;
    // (added) Accessible name of the phone list of sessions.
    sessionListLabel: string;
  };

  talk: {
    // (from the brief) Explains the dashed and blue words in the text.
    legend: { desktop: Legend; phone: Legend };
    // (from the brief) Label above the one-sentence summary.
    oneLineLabel: string;
    // (from the brief) Titles of the two side panels.
    panelTitles: { reading: string; terms: string };
    // (from the brief) Shown in the panel header.
    pinned: string;
    // (from the brief) Shown in the panel header when not pinned.
    pinHint: string;
    // (from the brief) Summary of the collapsed list under a formula.
    formulaSummary: string;
    // (from the brief) Footer line on a talk page.
    footer: string;
    // (from the brief) Link to the talk's Markdown file.
    sourceLink: string;
    // (added) Tab labels on the side rail and the phone bar: "Reading · 4".
    readingTab: (n: number) => string;
    termsTab: (n: number) => string;
    // (added) Plain tab labels inside the phone sheet.
    readingTabShort: string;
    termsTabShort: string;
    // (added) Close button in the panel and the phone sheet.
    closePanel: string;
    // (added) Accessible name of the side panel area and the phone bar.
    panelsLabel: string;
    // (added) "Moderator" label before the moderator's name.
    moderator: string;
    // (added) Accessible name of the strip showing the day's sessions.
    dayStripLabel: (day: number) => string;
    // (added) Previous and next talk links.
    previous: string;
    next: string;
    // (added) Accessible names of the two navigation blocks.
    moreTalksLabel: string;
    nearbyTalksLabel: string;
    // (added) Accessible name of a formula.
    formulaLabel: string;
    // (from the brief) Shown under a diagram on a phone, where the diagram scrolls sideways.
    diagramHint: string;
  };
};

export const content: Content = {
  site: {
    title: "Field Notes",
    homeIntro:
      "Notes from events I've attended, written up so you can get the main ideas without being there.",
    mainSite: { label: "raihanvaheed.dev", href: "https://raihanvaheed.dev" },
    homeEmpty: "Notes are on their way.",
    cardLink: "Read the notes",
    sessionCount: (n) => `Notes from ${n} ${n === 1 ? "session" : "sessions"}`,
    footer: "Unofficial notes by Rai Vaheed. The ideas belong to the speakers; any mistakes are mine.",
    corrections: {
      label: "Corrections: vaheed.raihan@gmail.com",
      email: "vaheed.raihan@gmail.com",
    },
    source: { label: "Notes on GitHub", href: "https://github.com/raihanvaheed/field-notes" },
    repoBlobBase: "https://github.com/raihanvaheed/field-notes/blob/main",
    breadcrumbLabel: "Breadcrumb",
    notFoundTitle: "Page not found",
    notFoundBody: "There is nothing at this address.",
    notFoundLink: "Back to Field Notes",
  },

  meta: {
    homeTitle: "Field Notes · Rai Vaheed",
    hubTitle: (eventName) => `${eventName} · Field Notes`,
    talkTitle: (speakers, heading, eventName) => `${speakers}: ${heading} · ${eventName}`,
    notFoundTitle: "Page not found · Field Notes",
  },

  hub: {
    eyebrow: (kind) => `Field Notes · ${kind}`,
    subtitle: (fullName, venue, dateLabel) => `${fullName}. ${venue}, ${dateLabel}.`,
    disclaimer:
      "One attendee's notes, written up afterwards. I only took notes for some sessions, so this isn't the full programme. Corrections welcome.",
    agendaLink: "Official agenda",
    themesHeading: "Ideas that kept coming up",
    statusRest:
      "Hover or pick a theme to trace it through the event. Hover a talk to see which threads run through it.",
    statusTheme: (label, talks) => `Tracing "${label}" through ${talks} talks.`,
    statusCard: (speakers, themeLabelsLower) => `${speakers} touched on ${themeLabelsLower}.`,
    phoneStatusRest: "Tap a theme to highlight its talks.",
    phoneStatusTheme: (label, perDay) =>
      `${label}: ${perDay.map((d) => `${d.talks} on Day ${d.day}`).join(", ")}.`,
    clear: "Clear",
    timeAxis: "Time",
    day: (n) => `Day ${n}`,
    dayGroup: (firstDay, lastDay) =>
      firstDay === lastDay ? `Day ${firstDay}` : `Days ${firstDay}–${lastDay}`,
    timelineLabel: "Timeline of sessions",
    dayTabsLabel: "Choose a day",
    themeChipsLabel: "Themes",
    themesList: (labels) => `Themes: ${labels}`,
    readNotes: "Read the notes →",
    minutes: (n) => `${n} min`,
    sessionListLabel: "Sessions",
  },

  talk: {
    legend: {
      desktop: {
        text: "Dashed words explain a term. Blue references open the reading list.",
        dashed: "Dashed words",
        blue: "Blue references",
      },
      phone: {
        text: "Tap a dashed word or a blue reference to open it below.",
        dashed: "dashed word",
        blue: "blue reference",
      },
    },
    oneLineLabel: "In one line",
    panelTitles: { reading: "Worth reading", terms: "Terms explained" },
    pinned: "Pinned",
    pinHint: "Click a tab to pin",
    formulaSummary: "What each symbol means",
    footer:
      "Unofficial notes by Rai Vaheed, written up after the talk. The ideas are the speaker's; any mistakes are mine.",
    sourceLink: "View the source of these notes",
    readingTab: (n) => `Reading · ${n}`,
    termsTab: (n) => `Terms · ${n}`,
    readingTabShort: "Reading",
    termsTabShort: "Terms",
    closePanel: "Close panel",
    panelsLabel: "Reading list and terms",
    moderator: "Moderator",
    dayStripLabel: (day) => `Where this talk sat in Day ${day}`,
    previous: "Previous",
    next: "Next",
    moreTalksLabel: "More talks",
    nearbyTalksLabel: "Nearby talks",
    formulaLabel: "Formula",
    diagramHint: "Swipe sideways to see the whole diagram.",
  },
};
