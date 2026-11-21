// Leonida Platinum: an offline GTA VI trophy guide and tracker.
// Loads app/data/trophies.json, renders the checklist, the roadmap and one
// trophy's full guide at a time, and keeps progress in localStorage.
// No network request is made besides the local data file.

const EARNED_KEY = 'leonida-platinum-earned-v1';
const SPOILER_KEY = 'leonida-platinum-hide-spoilers-v1';

const cardsEl = document.getElementById('cards');
const detailEl = document.getElementById('detail');
const listHeading = document.getElementById('listHeading');
const listCount = document.getElementById('listCount');
const emptyMsg = document.getElementById('emptyMsg');
const filterNote = document.getElementById('filterNote');
const progressCount = document.getElementById('progressCount');
const progressPct = document.getElementById('progressPct');
const progressRing = document.getElementById('progressRing');
const progressGrades = document.getElementById('progressGrades');
const progressNext = document.getElementById('progressNext');
const stagesEl = document.getElementById('stages');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilersEl = document.getElementById('spoilers');
const earnedOnlyEl = document.getElementById('earnedOnly');
const kindChips = document.getElementById('kindChips');

const params = new URLSearchParams(location.search);
let kind = params.get('filter') ?? 'all';
let selectedId = Number(params.get('open') ?? '0') || null;
let earned = loadEarned();
let hideSpoilers = loadSpoilerSetting();

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));
const KIND_LABELS = {
  story: 'Story',
  side: 'Side mission',
  collectibles: 'Collectibles',
  activities: 'Activities',
  platinum: 'Platinum',
};
const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

function loadEarned() {
  try {
    const saved = JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]');
    return new Set(Array.isArray(saved) ? saved.filter((n) => typeof n === 'string') : []);
  } catch {
    return new Set();
  }
}

function loadSpoilerSetting() {
  if (params.has('spoilers')) return params.get('spoilers') !== 'off';
  const saved = localStorage.getItem(SPOILER_KEY);
  return saved === null ? true : saved !== 'off';
}

function saveEarned() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned]));
}

function isMasked(t) {
  return hideSpoilers && t.hidden && !earned.has(t.name);
}

function kindMatches(t) {
  if (kind === 'all') return true;
  if (kind === 'story') return t.kind === 'story';
  if (kind === 'missable') return t.missable !== 'no';
  if (kind === 'collectibles') return t.kind === 'collectibles';
  if (kind === 'activities') return t.kind === 'activities' || t.kind === 'side';
  if (kind === 'online') return t.kind === 'online';
  return true;
}

function visibleTrophies() {
  const q = searchEl.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (!kindMatches(t)) return false;
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (earnedOnlyEl.checked && !earned.has(t.name)) return false;
    if (q) {
      const hay = `${t.name} ${t.description} ${t.guide} ${KIND_LABELS[t.kind] ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function gradeBadge(t) {
  const span = document.createElement('span');
  span.className = `grade grade-${t.grade}`;
  span.textContent = t.grade;
  return span;
}

function tagEl(text, cls) {
  const span = document.createElement('span');
  span.className = `tag ${cls}`;
  span.textContent = text;
  return span;
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  const pct = Math.round((done / total) * 100);
  progressCount.textContent = `${done} of ${total}`;
  progressPct.textContent = `${pct}%`;
  progressRing.style.setProperty('--pct', `${pct}%`);
  const counts = GRADE_ORDER.map((g) => {
    const have = trophies.filter((t) => t.grade === g && earned.has(t.name)).length;
    const all = trophies.filter((t) => t.grade === g).length;
    return `${have}/${all} ${g}`;
  }).join(' · ');
  progressGrades.textContent = counts;
  const next = trophies.find((t) => !earned.has(t.name));
  progressNext.textContent = next
    ? `Next up: ${isMasked(next) ? 'a hidden story trophy' : next.name}`
    : 'Platinum earned — Leonida Legend!';
}

function renderRoadmap() {
  stagesEl.replaceChildren();
  for (const stage of doc.roadmap) {
    const members = trophies.filter((t) => t.stage === stage.stage);
    const done = members.filter((t) => earned.has(t.name)).length;
    const card = document.createElement('article');
    card.className = 'stage';
    const head = document.createElement('h3');
    head.textContent = `Stage ${stage.stage} — ${stage.title}`;
    const count = document.createElement('p');
    count.className = 'stage-count';
    count.textContent = `${done}/${members.length} earned`;
    const bar = document.createElement('div');
    bar.className = 'stage-bar';
    const fill = document.createElement('div');
    fill.className = 'stage-fill';
    fill.style.width = `${members.length ? Math.round((done / members.length) * 100) : 0}%`;
    bar.append(fill);
    const summary = document.createElement('p');
    summary.className = 'stage-summary';
    summary.textContent = stage.summary;
    const chips = document.createElement('ul');
    chips.className = 'stage-trophies';
    for (const t of members) {
      const li = document.createElement('li');
      li.className = earned.has(t.name) ? 'done' : '';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = isMasked(t) ? 'Hidden trophy' : t.name;
      btn.addEventListener('click', () => selectTrophy(t.id, true));
      li.append(btn);
      chips.append(li);
    }
    card.append(head, count, bar, summary, chips);
    stagesEl.append(card);
  }
}

function renderCards() {
  const list = visibleTrophies();
  cardsEl.replaceChildren();
  listCount.textContent = `— showing ${list.length} of ${trophies.length}`;
  const headingKind = { all: 'All trophies', story: 'Story trophies', missable: 'Possibly missable trophies', collectibles: 'Collectibles', activities: 'Activities & side missions', online: 'Online trophies' }[kind];
  listHeading.firstChild.textContent = `${headingKind} `;
  if (kind === 'online') {
    filterNote.textContent = 'There are no online trophies in the list: the whole hunt is single-player (GTABase, PlanetGTA6).';
  } else if (kind === 'missable') {
    filterNote.textContent = 'Only 2 trophies carry a warning — no verified missable list exists yet (PlanetGTA6). Both are flagged “Possibly missable”.';
  } else if (kind === 'activities') {
    filterNote.textContent = 'Activities covers activities and side missions.';
  } else {
    filterNote.textContent = '';
  }
  if (list.length === 0) {
    emptyMsg.hidden = false;
    emptyMsg.textContent = kind === 'online'
      ? 'No online trophies — every one of the 55 is earned in single-player.'
      : 'Nothing matches these filters. Clear the search or pick another kind.';
    return;
  }
  emptyMsg.hidden = true;
  for (const t of list) {
    const card = document.createElement('article');
    card.className = 'card' + (earned.has(t.name) ? ' earned' : '') + (selectedId === t.id ? ' selected' : '');
    card.dataset.id = String(t.id);

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.className = 'earn-box';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name);
      else earned.delete(t.name);
      saveEarned();
      renderAll();
    });

    const body = document.createElement('div');
    body.className = 'card-body';
    const titleRow = document.createElement('div');
    titleRow.className = 'card-title';
    const name = document.createElement('h3');
    name.textContent = isMasked(t) ? 'Hidden trophy' : t.name;
    titleRow.append(name, gradeBadge(t));
    const desc = document.createElement('p');
    desc.className = 'card-desc';
    desc.textContent = isMasked(t) ? 'Hidden on PlayStation until earned. Turn spoilers off, or earn it, to reveal it.' : t.description;
    const tags = document.createElement('p');
    tags.className = 'card-tags';
    tags.append(tagEl(KIND_LABELS[t.kind] ?? t.kind, 'tag-kind'));
    if (t.hidden) tags.append(tagEl('Hidden', 'tag-hidden'));
    if (t.missable === 'possible') tags.append(tagEl('Possibly missable', 'tag-missable'));
    tags.append(tagEl(`Roadmap stage ${t.stage}`, 'tag-stage'));
    const preview = document.createElement('p');
    preview.className = 'card-guide';
    preview.textContent = isMasked(t) ? '' : t.guide;
    body.append(titleRow, desc, tags, preview);

    const openBtn = document.createElement('button');
    openBtn.type = 'button';
    openBtn.className = 'card-open';
    openBtn.textContent = isMasked(t) ? 'Why hidden?' : 'Full guide →';
    openBtn.addEventListener('click', () => selectTrophy(t.id, true));

    card.append(box, body, openBtn);
    cardsEl.append(card);
  }
}

function sourceLink(source) {
  if (source.url) {
    const a = document.createElement('a');
    a.href = source.url;
    a.textContent = source.name;
    a.target = '_blank';
    a.rel = 'noopener';
    return a;
  }
  const span = document.createElement('span');
  span.textContent = source.name;
  return span;
}

function renderDetail() {
  detailEl.replaceChildren();
  const t = selectedId ? byId.get(selectedId) : null;
  if (!t) {
    const p = document.createElement('p');
    p.className = 'detail-empty';
    p.textContent = 'Select a trophy to read its full guide, steps and sources.';
    detailEl.append(p);
    return;
  }
  const wrap = document.createElement('div');
  wrap.className = 'detail-body';
  const titleRow = document.createElement('div');
  titleRow.className = 'card-title';
  const name = document.createElement('h3');
  name.textContent = isMasked(t) ? 'Hidden trophy' : t.name;
  titleRow.append(name, gradeBadge(t));
  wrap.append(titleRow);
  const desc = document.createElement('p');
  desc.className = 'card-desc';
  desc.textContent = isMasked(t) ? 'Hidden on PlayStation until earned.' : t.description;
  wrap.append(desc);
  if (isMasked(t)) {
    const note = document.createElement('p');
    note.className = 'detail-masked-note';
    note.textContent = 'This trophy is hidden on PlayStation until earned. Turn “Hide spoilers” off to read its guide, or earn it first — the guide will reveal itself here.';
    wrap.append(note);
    detailEl.append(wrap);
    return;
  }
  const tags = document.createElement('p');
  tags.className = 'card-tags';
  tags.append(tagEl(KIND_LABELS[t.kind] ?? t.kind, 'tag-kind'));
  if (t.hidden) tags.append(tagEl('Hidden on PlayStation', 'tag-hidden'));
  if (t.missable === 'possible') tags.append(tagEl('Possibly missable — save first', 'tag-missable'));
  tags.append(tagEl(`Roadmap stage ${t.stage}`, 'tag-stage'));
  wrap.append(tags);
  const guideHeading = document.createElement('h4');
  guideHeading.textContent = 'Guide';
  const guide = document.createElement('p');
  guide.className = 'detail-guide';
  guide.textContent = t.guide;
  wrap.append(guideHeading, guide);
  const stepsHeading = document.createElement('h4');
  stepsHeading.textContent = 'Steps';
  const steps = document.createElement('ol');
  steps.className = 'detail-steps';
  for (const step of t.steps ?? []) {
    const li = document.createElement('li');
    li.textContent = step;
    steps.append(li);
  }
  wrap.append(stepsHeading, steps);
  const sourcesHeading = document.createElement('h4');
  sourcesHeading.textContent = 'Sources';
  const sources = document.createElement('ul');
  sources.className = 'detail-sources';
  for (const source of t.sources ?? []) {
    const li = document.createElement('li');
    li.append(sourceLink(source));
    sources.append(li);
  }
  wrap.append(sourcesHeading, sources);
  const earnedRow = document.createElement('label');
  earnedRow.className = 'detail-earned';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.name);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.name);
    else earned.delete(t.name);
    saveEarned();
    renderAll();
  });
  earnedRow.append(box, document.createTextNode(' Earned'));
  wrap.append(earnedRow);
  detailEl.append(wrap);
}

function selectTrophy(id, scroll) {
  selectedId = id;
  renderCards();
  renderDetail();
  if (scroll) detailEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderAll() {
  renderProgress();
  renderRoadmap();
  renderCards();
  renderDetail();
}

function applyKind(nextKind) {
  kind = nextKind;
  for (const btn of kindChips.querySelectorAll('.chip')) {
    btn.classList.toggle('active', btn.dataset.kind === kind);
  }
  renderCards();
}

kindChips.addEventListener('click', (event) => {
  const btn = event.target.closest('.chip');
  if (btn) applyKind(btn.dataset.kind);
});
searchEl.addEventListener('input', renderCards);
gradeEl.addEventListener('change', renderCards);
earnedOnlyEl.addEventListener('change', renderCards);
spoilersEl.addEventListener('change', () => {
  hideSpoilers = spoilersEl.checked;
  localStorage.setItem(SPOILER_KEY, hideSpoilers ? 'on' : 'off');
  renderAll();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const payload = {
    game: 'Grand Theft Auto VI',
    exported: new Date().toISOString(),
    earned: [...earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-platinum-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('no earned list');
    const known = new Set(trophies.map((t) => t.name));
    earned = new Set(names.filter((n) => typeof n === 'string' && known.has(n)));
    saveEarned();
    renderAll();
  } catch {
    alert('That file is not a Leonida Platinum progress export.');
  }
  event.target.value = '';
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('Clear all earned ticks? Your exported file stays safe.')) {
    earned = new Set();
    saveEarned();
    renderAll();
  }
});

// Restore the filter and spoiler controls from the URL or saved settings.
if (params.get('filter')) applyKind(params.get('filter'));
if (params.get('grade')) gradeEl.value = params.get('grade');
if (params.get('q')) searchEl.value = params.get('q');
spoilersEl.checked = hideSpoilers;
if (params.get('earnedOnly') === 'on') earnedOnlyEl.checked = true;

renderAll();
