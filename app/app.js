import catalog from './data/trophies.json' with { type: 'json' };
import { button, element, sourceLinks } from './elements.js';
import { createProgress } from './progress.js';
import { renderRoadmap, stages } from './roadmap.js';

const { trophies, sources } = catalog;
const byId = new Map(trophies.map(trophy => [trophy.id, trophy]));
const progress = createProgress(trophies);
const saved = progress.load();
let state = saved.state;
let kind = 'all';
let stage = '';
let selected = 28;
let mobileGuideOpen = false;
let pendingImport;

const find = id => document.getElementById(id);
const query = find('query');
const statusFilter = find('status-filter');
const list = find('trophy-list');
const guide = find('guide');
const notice = find('notice');
const fileInput = find('progress-file');
const importDialog = find('import-dialog');
const spoilers = find('spoilers');
const filters = find('kinds');
const compact = matchMedia('(max-width: 680px)');

const kinds = {
  all: 'All trophies', story: 'Story', missable: 'Missable',
  collectibles: 'Collectibles', activities: 'Activities', online: 'Online'
};
const grades = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
const priority = new Map([28, 14, 17, 18, 30, 31].map((id, index) => [id, index]));
const sortRank = trophy => priority.get(trophy.id) ?? 100 + (trophy.order ?? trophy.id);

function concealed(trophy) {
  return state.hideStory && trophy.kind === 'story' && !state.earned.has(trophy.id);
}

function inKind(trophy, category) {
  if (category === 'missable') return trophy.missable;
  if (category === 'collectibles') return trophy.kind === category || trophy.id === 28;
  return category === 'all' || trophy.kind === category;
}

function view() {
  return location.hash === '#roadmap' ? 'roadmap' : 'checklist';
}

function changeView(next) {
  if (view() !== next || !location.hash) history.pushState(null, '', `#${next}`);
  render();
}

function showNotice(text, isError = false) {
  notice.hidden = !text;
  notice.classList.toggle('error', isError);
  notice.textContent = text;
}

function saveProgress(success = '') {
  if (progress.save(state)) showNotice(success);
  else showNotice('This browser couldn’t save your progress. Export a backup before closing the page.', true);
}

function setEarned(id, earned, from) {
  const keepGuideButton = from === 'guide';
  if (earned) state.earned.add(id);
  else state.earned.delete(id);
  saveProgress();
  render();
  const control = keepGuideButton ? guide.querySelector('.primary') : find(`check-${id}`);
  (control ?? list.querySelector('input') ?? statusFilter).focus({ preventScroll: true });
}

function renderProgress() {
  const earned = state.earned.size;
  find('earned').textContent = earned;
  find('total').textContent = `/ ${trophies.length}`;
  find('percent').textContent = `${Math.round(100 * earned / trophies.length)}%`;
  const meter = find('progress');
  meter.max = trophies.length;
  meter.value = earned;
  const gradesProgress = Object.entries(grades).map(([grade, name]) => {
    const total = trophies.filter(trophy => trophy.grade === grade);
    const count = total.filter(trophy => state.earned.has(trophy.id)).length;
    return element('span', grade, `${name} ${count}/${total.length}`);
  });
  find('grade-progress').replaceChildren(...gradesProgress);
  spoilers.textContent = state.hideStory ? 'Spoilers hidden' : 'Spoilers shown';
  spoilers.setAttribute('aria-label', 'Hide unearned story spoilers');
  spoilers.setAttribute('aria-pressed', String(state.hideStory));
}

function visibleTrophies() {
  const term = query.value.trim().toLocaleLowerCase();
  const status = statusFilter.value;
  return trophies.filter(trophy => {
    const earned = state.earned.has(trophy.id);
    const searchable = concealed(trophy) ? 'hidden story trophy' : `${trophy.name} ${trophy.description} ${trophy.target ?? ''}`;
    return inKind(trophy, kind) && (!stage || trophy.stage === stage) &&
      (status === 'all' || earned === (status === 'earned')) && searchable.toLocaleLowerCase().includes(term);
  }).sort((a, b) => sortRank(a) - sortRank(b));
}

function renderFilters() {
  const controls = Object.entries(kinds).map(([key, label]) => {
    const control = button(label, '', () => {
      kind = key;
      stage = '';
      renderChecklist();
      filters.querySelector(`[data-kind="${key}"]`).focus({ preventScroll: true });
    });
    control.dataset.kind = key;
    control.append(element('span', 'filter-count', trophies.filter(trophy => inKind(trophy, key)).length));
    control.setAttribute('aria-pressed', String(!stage && kind === key));
    return control;
  });
  filters.replaceChildren(...controls);
}

function gradeTag(trophy) {
  return element('span', `tag grade ${trophy.grade}`, grades[trophy.grade]);
}

function makeRow(trophy) {
  const hidden = concealed(trophy);
  const name = hidden ? 'Hidden story trophy' : trophy.name;
  const description = hidden ? `Chapter ${trophy.chapter} · Details reveal when earned` : trophy.description;
  const row = element('div', trophy.id === selected ? 'row selected' : 'row');
  const label = element('label', 'row-check');
  const check = element('input');
  check.type = 'checkbox';
  check.id = `check-${trophy.id}`;
  check.checked = state.earned.has(trophy.id);
  check.setAttribute('aria-label', `Mark ${hidden ? `${name}, chapter ${trophy.chapter}, trophy ${trophy.order}` : name} earned`);
  check.addEventListener('change', () => setEarned(trophy.id, check.checked, 'row'));
  label.append(check);
  const open = button('', 'row-select', () => {
    mobileGuideOpen = !mobileGuideOpen || selected !== trophy.id;
    selected = trophy.id;
    renderSelection();
    if (compact.matches && mobileGuideOpen) guide.focus();
  });
  open.dataset.trophy = trophy.id;
  open.setAttribute('aria-controls', 'guide');
  const title = element('span');
  title.append(element('strong', 'name', name), element('span', 'desc', description));
  const tags = element('span', 'row-labels');
  tags.append(gradeTag(trophy));
  if (trophy.missable) tags.append(element('span', 'tag risk', 'Potential missable'));
  const arrow = element('span', 'arrow', '›');
  arrow.setAttribute('aria-hidden', 'true');
  open.append(title, tags, arrow);
  row.append(label, open);
  return row;
}

function renderSelection() {
  let selectedRow;
  for (const row of list.querySelectorAll('.row-select')) {
    const active = Number(row.dataset.trophy) === selected;
    const container = row.closest('.row');
    row.setAttribute('aria-expanded', String(active && (!compact.matches || mobileGuideOpen)));
    container.classList.toggle('selected', active);
    if (active) selectedRow = container;
  }
  if (compact.matches && selectedRow) selectedRow.after(guide);
  else if (guide.parentElement !== list.parentElement) list.after(guide);
  renderGuide(compact.matches && !mobileGuideOpen ? undefined : byId.get(selected));
}

function renderGuide(trophy) {
  guide.hidden = !trophy;
  if (!trophy) return;
  const hidden = concealed(trophy);
  const earned = state.earned.has(trophy.id);
  const meta = element('div', 'guide-meta');
  const tags = element('div', 'row-labels');
  tags.append(gradeTag(trophy));
  if (trophy.missable) tags.append(element('span', 'tag risk', 'Potential missable'));
  if (trophy.evidence) tags.append(element('span', 'tag', trophy.evidence));
  meta.append(element('span', 'eyebrow', stages[trophy.stage]), tags);
  const heading = element('h3', '', hidden ? `Hidden story trophy · Ch. ${trophy.chapter}` : trophy.name);
  const actions = element('div', 'guide-actions');
  const toggle = button(earned ? 'Undo earned' : 'Mark earned', 'primary', () => setEarned(trophy.id, !earned, 'guide'));
  const back = button('Back to checklist', 'back-to-list', () => list.querySelector(`[data-trophy="${trophy.id}"]`)?.focus());
  actions.append(toggle, back);
  if (hidden) {
    guide.replaceChildren(meta, heading, element('p', 'guide-copy', 'The name, description and guide will appear when you mark this trophy earned or show story spoilers.'), actions);
    return;
  }
  const content = [meta, heading, element('p', 'official', trophy.description)];
  if (trophy.target) content.push(element('p', 'target', trophy.target));
  content.push(element('p', 'guide-copy', trophy.guide));
  if (trophy.extra) content.push(element('p', 'guide-copy extra', trophy.extra));
  guide.replaceChildren(...content, sourceLinks(trophy.sources, sources), actions);
}

function renderChecklist() {
  const matches = visibleTrophies();
  if (!matches.some(trophy => trophy.id === selected)) {
    mobileGuideOpen = false;
    selected = matches[0]?.id;
  }
  const count = matches.length;
  find('result-count').textContent = `${count} of ${trophies.length} trophies${stage ? ` · ${stages[stage]}` : ''}`;
  renderFilters();
  list.replaceChildren(...(count ? matches.map(makeRow) : [element('p', 'empty', kind === 'online' ? 'The base PS5 list has no online trophies.' : 'No trophies match these filters.')]));
  renderSelection();
}

function resetFilters() {
  kind = 'all';
  stage = '';
  statusFilter.value = 'all';
  query.value = '';
}

function openTrophy(id) {
  resetFilters();
  selected = id;
  mobileGuideOpen = true;
  changeView('checklist');
  guide.focus({ preventScroll: true });
  guide.scrollIntoView({ block: 'nearest' });
}

function openStage(next) {
  resetFilters();
  stage = next;
  changeView('checklist');
  find('checklist-title').scrollIntoView({ block: 'nearest' });
}

function render() {
  const page = view();
  const onChecklist = page === 'checklist';
  find('hero').hidden = !onChecklist;
  for (const name of ['checklist', 'roadmap']) {
    find(name).hidden = page !== name;
    const tab = find(`${name}-tab`);
    if (page === name) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  }
  renderProgress();
  if (onChecklist) renderChecklist();
  else find('route').replaceChildren(renderRoadmap(trophies, sources, state.earned, concealed, openTrophy, openStage));
}

function importProgress() {
  fileInput.click();
}

async function readBackup() {
  const file = fileInput.files[0];
  fileInput.value = '';
  if (!file) return;
  try {
    if (file.size > 16_384) throw new Error('This file is too large for a Leonida Atlas backup.');
    pendingImport = progress.parse(await file.text());
    find('import-summary').textContent = `Replace your checklist with ${pendingImport.earned.size} earned trophies and restore the backup’s spoiler setting.`;
    importDialog.returnValue = '';
    importDialog.showModal();
  } catch (error) {
    showNotice(error instanceof SyntaxError ? 'That file isn’t valid JSON.' : error.message, true);
  }
}

function exportProgress() {
  const backup = new Blob([progress.serialize(state) + '\n'], { type: 'application/json' });
  const link = element('a');
  link.href = URL.createObjectURL(backup);
  link.download = 'leonida-atlas-progress.json';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1_000);
  showNotice('Progress backup downloaded.');
}

for (const page of ['checklist', 'roadmap']) {
  find(`${page}-tab`).addEventListener('click', event => {
    event.preventDefault();
    changeView(page);
  });
}
window.addEventListener('hashchange', render);
compact.addEventListener('change', render);
spoilers.addEventListener('click', () => {
  state.hideStory = !state.hideStory;
  saveProgress();
  render();
});
find('chapter-alert').addEventListener('click', () => openTrophy(28));
query.addEventListener('input', renderChecklist);
statusFilter.addEventListener('change', renderChecklist);
find('import').addEventListener('click', importProgress);
find('export').addEventListener('click', exportProgress);
fileInput.addEventListener('change', readBackup);
importDialog.addEventListener('close', () => {
  if (importDialog.returnValue === 'restore' && pendingImport) {
    state = pendingImport;
    saveProgress('Progress backup restored.');
    render();
  }
  pendingImport = undefined;
});
render();
if (saved.issue) showNotice(saved.issue, true);
