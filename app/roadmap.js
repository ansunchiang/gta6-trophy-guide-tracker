import { button, element, sourceLinks } from './elements.js';

export const stages = {
  'before-chapter-2': 'Before Chapter 2',
  story: 'Story progression',
  completion: '100% completion',
  cleanup: 'Free-roam cleanup',
  platinum: 'Platinum'
};

const targets = [
  ['Meditations', '18 across 10 sites', '15 of 18', 28],
  ['Range golds', '42', '42', 17],
  ['Drone races', 'Win at 14 sites', 'Finish 42 trials', 18],
  ['Stunts', '250', '300', 15],
  ['Unique race wins', '20', '30', 19],
  ['Complete card sets', '3', '15', 30],
  ['WAiNK locations', '100', '100', 31],
  ['Vehicle scans', '100 discoveries', '200 base models', 35],
  ['Challenges', '50', '70 of 80', 32],
  ['Bank vaults', '5', '8', 40],
  ['Gang operations', '1 per gang', '39 total', 43]
];

const otherTargets = [
  ['Jobs', '100 optional tasks, 22 bank jobs, 7 payday loan jobs, 34 of 35 smash ’n’ grabs and 50 stickups.'],
  ['Fencing', '$100,000 each in narcotics and jewelry, $200,000 in vehicles and $250,000 in marked bills.'],
  ['Exploration', '33 underwater discoveries, 5 Kenton sets, 30 books, magazines or comics, 100 flamingos, 2 unique playlists and 70 styles.'],
  ['Activities', '10 race-challenge golds, 4 video games played, 5 pool opponents defeated, 2 mini golf locations played, 90 basketball hoops and 15 target decks.'],
  ['Discovery', '50 standard-issue weapons and 100 animals studied.']
];

function stageCard(stage, number, trophies, earned, openStage) {
  const items = trophies.filter(trophy => trophy.stage === stage);
  const done = items.filter(trophy => earned.has(trophy.id)).length;
  const card = element('article', stage === 'before-chapter-2' ? 'stage priority' : 'stage');
  card.dataset.stage = stage;
  const head = element('div', 'stage-head');
  head.append(
    element('span', 'stage-number', number),
    element('h3', '', stages[stage]),
    element('span', 'stage-count', `${done}/${items.length} tracked`),
    button('View trophies', 'stage-link', () => openStage(stage))
  );
  card.append(head);
  return card;
}

function storyChapters(trophies, concealed, openTrophy) {
  const list = element('ol', 'chapter-list');
  for (let chapter = 1; chapter <= 5; chapter++) {
    const milestones = trophies.filter(trophy => trophy.chapter === chapter).sort((a, b) => a.order - b.order);
    const row = element('li');
    const entries = element('div');
    const visible = milestones.filter(trophy => !concealed(trophy));
    for (const trophy of visible) {
      if (entries.childNodes.length) entries.append(' · ');
      const milestone = trophy.description.replace(/^Complete Chapter \d\.$/, 'Chapter clear').replace(/^Complete /, '').replace(/\.$/, '');
      entries.append(button(milestone, 'text-button', () => openTrophy(trophy.id)));
    }
    const hidden = milestones.length - visible.length;
    if (hidden) entries.append(`${visible.length ? ' · ' : ''}${hidden} hidden`);
    row.append(element('strong', '', `Chapter ${chapter}`), entries);
    list.append(row);
  }
  return list;
}

function completionTargets(openTrophy) {
  const table = element('table', 'milestones');
  const head = table.createTHead().insertRow();
  for (const label of ['Milestone', 'Trophy', 'In-game 100%']) {
    const cell = element('th', '', label);
    cell.scope = 'col';
    head.append(cell);
  }
  const body = table.createTBody();
  for (const [name, trophyTarget, gameTarget, id] of targets) {
    const row = body.insertRow();
    const label = element('th');
    label.scope = 'row';
    label.append(button(name, 'text-button', () => openTrophy(id)));
    row.append(label, element('td', '', trophyTarget), element('td', '', gameTarget));
  }
  return table;
}

function remainingTargets() {
  const details = element('details', 'remaining-targets');
  const groups = element('dl');
  for (const [label, targets] of otherTargets) {
    groups.append(element('dt', '', label), element('dd', '', targets));
  }
  details.append(element('summary', '', 'Remaining 100% targets'), groups);
  return details;
}

export function renderRoadmap(trophies, sources, earned, concealed, openTrophy, openStage) {
  const route = element('div', 'route-grid');
  const card = (stage, number) => stageCard(stage, number, trophies, earned, openStage);

  const early = card('before-chapter-2', '1');
  early.append(
    element('p', '', 'Potentially missable. Accept Lucia’s balcony meditation at Jason’s house before Chapter 1 ends. Keep a manual save.'),
    sourceLinks(['meditation'], sources)
  );

  const story = card('story', '2');
  story.append(
    element('p', '', 'Follow the main jobs through five chapters. Save in separate slots at chapter boundaries because mission replay is unavailable.'),
    storyChapters(trophies, concealed, openTrophy),
    sourceLinks(['psn', 'missions'], sources)
  );

  const complete = card('completion', '3');
  complete.append(
    element('p', '', 'Scan new vehicles and take optional jobs as you go. After the credits, open Progress › Stats › 100% Completion to finish A Long Road.'),
    completionTargets(openTrophy),
    remainingTargets(),
    sourceLinks(['completion', 'roadmap'], sources)
  );

  const cleanup = card('cleanup', '4');
  cleanup.append(
    element('p', '', 'Finish eight qualifying stranger strands and any standalone trophies you still need. Take Yago’s timed race when it appears in Chapter 3.'),
    sourceLinks(['strangers', 'yago'], sources)
  );

  const platinum = card('platinum', '5');
  platinum.append(
    element('p', '', 'Earn the other 54 trophies to unlock Vice Got a Price! on PS5. No online trophies appear in the base list.'),
    sourceLinks(['roadmap'], sources)
  );

  route.append(early, story, complete, cleanup, platinum);
  return route;
}
