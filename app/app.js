// Leonida Platinum — GTA VI trophy guide & tracker (Round 2).
// Loads app/data/trophies.json, renders the checklist, roadmap, dashboard and
// detail panel, and keeps earned trophies in localStorage. Fully offline: the
// only fetch is the local trophies.json file, and no other network call exists.

const DATA_URL = 'data/trophies.json';
const STORE_KEY = 'leonida-platinum-r2-v1';

const STAGES = [
  { n: 1, title: 'Story First', blurb: 'Play chapters 1–4 and the final mission, earning every chapter and named-mission trophy. Do the two “possible” missable trophies (Hot Together, Retail Therapy) while your partner is still around in chapters 2–3.' },
  { n: 2, title: 'Strangers & Side Stories', blurb: 'Work the eight stranger strands between story chapters. Five of them end in a character-final trophy; closing the eighth strand earns the Strangers & Freaks silver.' },
  { n: 3, title: 'Activities & Skills', blurb: 'Sample every activity, then master the ones with trophies: gold all 42 shooting range challenges, win drone races at all 14 locations, win 20 different races, beat Cal at fishing, and finish an arcade game and a bowling frame.' },
  { n: 4, title: 'Collectibles & Exploration', blurb: 'Tour the whole state: 3 card sets, 100 WAiNK photos, 18 meditation spots, 100 vehicles, all 52 areas of Leonida, and the 8 garage properties. The routes overlap — one sweep can clear several trophies.' },
  { n: 5, title: 'Cleanup & Platinum', blurb: 'Robberies, combat feats, economy and the long grinds: 5 bank vaults, 9 gang operations, the 250 stunts, the 50 challenges, the choice count, and 100% completion. The platinum pops when the 54th trophy does.' },
];

const KIND_LABELS = {
  story: 'Story', collectibles: 'Collectibles', activities: 'Activities',
  combat: 'Combat', exploration: 'Exploration', economy: 'Economy', secret: 'Secret',
};

const TROPHY_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10v3a5 5 0 0 1-10 0z"/><path d="M7 5H4.5a2.5 2.5 0 0 0 2.5 3.5M17 5h2.5a2.5 2.5 0 0 1-2.5 3.5" fill="none" stroke="rgba(20,16,40,.78)" stroke-width="1.6"/><rect x="11" y="12" width="2" height="3.4" rx="0.6"/><rect x="8.4" y="15.4" width="7.2" height="1.9" rx="0.9"/><rect x="7" y="17.6" width="10" height="1.9" rx="0.9"/></svg>';

let trophies = [];
let earned = new Set();
let view = 'checklist';
let detailId = null;

const $ = (id) => document.getElementById(id);

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.earned)) earned = new Set(parsed.earned.filter((n) => typeof n === 'number'));
  } catch (err) { earned = new Set(); }
}

function saveStore() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify({ earned: [...earned].sort((a, b) => a - b), savedAt: new Date().toISOString() })); } catch (err) { /* storage full or blocked; the page still works in memory */ }
}

function isEarned(t) { return earned.has(t.id); }

function spoilerOn() { return $('spoilerToggle').checked; }

function shownName(t) {
  if (spoilerOn() && t.hidden && !isEarned(t)) return 'Hidden Trophy';
  return t.name;
}

function shownDesc(t) {
  if (spoilerOn() && t.hidden && !isEarned(t)) return 'Hidden until earned — turn off Hide spoilers to reveal it.';
  return t.description;
}

function stars(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); }

function medalClass(grade) { return 'medal medal-' + grade; }

function filters() {
  return {
    q: $('search').value.trim().toLowerCase(),
    grade: $('gradeFilter').value,
    kind: $('kindFilter').value,
    missable: $('missableOnly').checked,
    earnedOnly: $('earnedOnly').checked,
  };
}

function visibleTrophies() {
  const f = filters();
  return trophies.filter((t) => {
    if (f.grade !== 'all' && t.grade !== f.grade) return false;
    if (f.kind !== 'all' && t.kind !== f.kind) return false;
    if (f.missable && t.missable !== 'possible') return false;
    if (f.earnedOnly && !isEarned(t)) return false;
    if (f.q) {
      const hay = (t.name + ' ' + t.description + ' ' + t.guide + ' ' + (t.steps || []).join(' ')).toLowerCase();
      if (!hay.includes(f.q)) return false;
    }
    return true;
  });
}

function renderRing() {
  const total = trophies.length || 55;
  const done = trophies.filter(isEarned).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  $('ringPct').textContent = pct + '%';
  $('ringCount').textContent = done + ' / ' + total + ' earned';
  const circle = $('ringFill');
  const circumference = 2 * Math.PI * 52;
  circle.style.strokeDasharray = String(circumference);
  circle.style.strokeDashoffset = String(circumference * (1 - done / total));
}

function renderDashboard() {
  const done = trophies.filter(isEarned);
  const remaining = trophies.filter((t) => !isEarned(t) && t.id !== 1);
  const hours = remaining.reduce((sum, t) => sum + (t.timeHours || 0), 0);
  $('hoursLeft').textContent = '≈' + Math.round(hours) + ' h';
  $('hoursNote').textContent = 'Estimated trophy work left across ' + remaining.length + ' un-earned trophies. Activities overlap, so a focused platinum run takes roughly 75–90 h in total.';

  const grades = ['platinum', 'gold', 'silver', 'bronze'];
  $('gradeBars').innerHTML = grades.map((g) => {
    const all = trophies.filter((t) => t.grade === g);
    const got = all.filter(isEarned).length;
    const pct = all.length ? Math.round((got / all.length) * 100) : 0;
    const cls = g === 'gold' ? 'bar-fill gold' : g === 'platinum' ? 'bar-fill cyan' : 'bar-fill';
    return '<div class="bar-row"><span class="bar-label">' + g + '</span><div class="bar-track"><div class="' + cls + '" style="width:' + pct + '%"></div></div><span class="bar-count">' + got + ' / ' + all.length + '</span></div>';
  }).join('');

  const kinds = Object.keys(KIND_LABELS);
  $('kindBars').innerHTML = kinds.map((k) => {
    const all = trophies.filter((t) => t.kind === k);
    const got = all.filter(isEarned).length;
    const pct = all.length ? Math.round((got / all.length) * 100) : 0;
    return '<div class="bar-row"><span class="bar-label">' + KIND_LABELS[k] + '</span><div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div><span class="bar-count">' + got + ' / ' + all.length + '</span></div>';
  }).join('');

  const next = nextBestTrophy();
  if (next) {
    $('nextName').textContent = next.name + ' (' + next.grade + ')';
    $('nextWhy').textContent = 'Easiest un-earned trophy: difficulty ' + next.difficulty + '/5, about ' + next.time + '. ' + next.description;
    $('nextOpen').disabled = false;
    $('nextOpen').onclick = () => openDetail(next.id);
  } else {
    $('nextName').textContent = 'Platinum earned — Leonida Legend!';
    $('nextWhy').textContent = 'Every trophy is earned. Export your progress as a keepsake.';
    $('nextOpen').disabled = true;
  }
}

// Easiest un-earned trophy first: lowest difficulty, then shortest time, then
// earliest roadmap stage. The platinum itself (id 1) is never suggested.
function nextBestTrophy() {
  const open = trophies.filter((t) => !isEarned(t) && t.id !== 1);
  if (!open.length) return null;
  open.sort((a, b) => (a.difficulty - b.difficulty) || ((a.timeHours || 99) - (b.timeHours || 99)) || (a.stage - b.stage) || (a.id - b.id));
  return open[0];
}

function cardHtml(t) {
  const earnedCls = isEarned(t) ? ' earned' : '';
  const chips = [
    '<span class="chip grade-' + t.grade + '">' + t.grade + '</span>',
    '<span class="chip">' + KIND_LABELS[t.kind] + '</span>',
  ];
  if (t.hidden) chips.push('<span class="chip hidden-flag">Hidden</span>');
  if (t.missable === 'possible') chips.push('<span class="chip missable">Possibly missable</span>');
  if (t.count) chips.push('<span class="chip">Count: ' + t.count + '</span>');
  return '<article class="card' + earnedCls + '" data-id="' + t.id + '">' +
    '<div class="' + medalClass(t.grade) + '">' + TROPHY_SVG + '</div>' +
    '<div class="card-body">' +
      '<h3 class="card-name">' + escapeHtml(shownName(t)) + '</h3>' +
      '<p class="card-desc' + (spoilerOn() && t.hidden && !isEarned(t) ? ' spoiler-hidden' : '') + '">' + escapeHtml(shownDesc(t)) + '</p>' +
      '<div class="chips">' + chips.join('') + '</div>' +
      '<div class="card-meta"><span class="stars" title="Difficulty ' + t.difficulty + ' of 5">' + stars(t.difficulty) + '</span><span>' + escapeHtml(t.time) + '</span><span>Stage ' + t.stage + '</span></div>' +
      '<div class="card-actions">' +
        '<label class="earn-btn"><input type="checkbox" data-earn="' + t.id + '"' + (isEarned(t) ? ' checked' : '') + '> Earned</label>' +
        '<button class="guide-btn" type="button" data-guide="' + t.id + '">Read the guide</button>' +
      '</div>' +
    '</div></article>';
}

function renderChecklist() {
  const list = visibleTrophies();
  $('grid').innerHTML = list.map(cardHtml).join('');
  const done = trophies.filter(isEarned).length;
  $('resultCount').textContent = 'Showing ' + list.length + ' of ' + trophies.length + ' trophies · ' + done + ' earned · ' + (trophies.length - done) + ' to go.';
  $('tabCount').textContent = '(' + list.length + ')';
}

function renderRoadmap() {
  $('roadmap').innerHTML = STAGES.map((s) => {
    const stageTrophies = trophies.filter((t) => t.stage === s.n);
    const got = stageTrophies.filter(isEarned).length;
    const items = stageTrophies.map((t) =>
      '<li class="' + (isEarned(t) ? 'earned' : '') + '"><input type="checkbox" data-earn="' + t.id + '"' + (isEarned(t) ? ' checked' : '') + ' aria-label="Mark ' + escapeHtml(t.name) + ' earned"><span><span class="stage-name">' + escapeHtml(t.name) + '</span><span class="stage-tag">' + t.grade + ' · ' + KIND_LABELS[t.kind] + ' · ' + escapeHtml(t.time) + (t.missable === 'possible' ? ' · possibly missable' : '') + '</span></span></li>'
    ).join('');
    return '<div class="stage"><div class="stage-head"><span class="stage-num">STAGE ' + s.n + '</span><h3>' + s.title + '</h3><span class="stage-count">' + got + ' / ' + stageTrophies.length + ' earned</span></div><p>' + s.blurb + '</p><ul class="stage-list">' + items + '</ul></div>';
  }).join('');
}

function openDetail(id) {
  const t = trophies.find((x) => x.id === id);
  if (!t) return;
  detailId = id;
  const steps = (t.steps || []).map((s) => '<li>' + escapeHtml(s) + '</li>').join('');
  const sources = (t.sources || []).map((s) => '<li>' + escapeHtml(s) + '</li>').join('');
  const warn = t.missable === 'possible'
    ? '<h3>Missable?</h3><div class="warn-box"><strong>Possibly missable.</strong> This trophy needs your partner beside you, and partner availability is tied to the story — do it during chapters 2–3. It is one of only two trophies this guide flags, and the flag is a caution, not a verified missable list.</div>'
    : '';
  $('detailBody').innerHTML =
    '<div class="detail-medal ' + medalClass(t.grade) + '">' + TROPHY_SVG + '</div>' +
    '<h2 class="detail-name">' + escapeHtml(t.name) + '</h2>' +
    '<p class="detail-desc">' + escapeHtml(t.description) + '</p>' +
    '<div class="chips"><span class="chip grade-' + t.grade + '">' + t.grade + '</span><span class="chip">' + KIND_LABELS[t.kind] + '</span>' +
    (t.hidden ? '<span class="chip hidden-flag">Hidden</span>' : '') +
    (t.count ? '<span class="chip">Count: ' + t.count + '</span>' : '') +
    '<span class="chip">Stage ' + t.stage + '</span></div>' +
    '<div class="card-meta"><span class="stars">' + stars(t.difficulty) + '</span><span>Difficulty ' + t.difficulty + ' / 5</span><span>' + escapeHtml(t.time) + '</span></div>' +
    '<h3>The guide</h3><p>' + escapeHtml(t.guide) + '</p>' +
    '<h3>Step by step</h3><ol class="steps">' + steps + '</ol>' +
    '<h3>Tip</h3><div class="tip-box">' + escapeHtml(t.tip) + '</div>' +
    warn +
    '<h3>Sources</h3><ul class="sources">' + sources + '</ul>' +
    '<p class="dash-note">Sources name where each fact comes from; the guide text above is written in this guide’s own words.</p>';
  $('detail').hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  detailId = null;
  $('detail').hidden = true;
  document.body.style.overflow = '';
}

function refresh() {
  renderRing();
  renderDashboard();
  renderChecklist();
  renderRoadmap();
}

function toggleEarned(id, on) {
  if (on) earned.add(id); else earned.delete(id);
  saveStore();
  refresh();
  if (detailId === id) openDetail(id);
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function exportProgress() {
  const payload = { app: 'leonida-platinum-r2', exportedAt: new Date().toISOString(), earned: [...earned].sort((a, b) => a - b) };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-platinum-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const ids = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(ids)) throw new Error('bad file');
      const valid = new Set(trophies.map((t) => t.id));
      earned = new Set(ids.filter((n) => valid.has(n)));
      saveStore();
      refresh();
    } catch (err) {
      alert('That file could not be imported. Export a progress file from this guide and try again.');
    }
  };
  reader.readAsText(file);
}

function applyShotParams() {
  const params = new URLSearchParams(location.search);
  if (params.get('view') === 'roadmap') showView('roadmap');
  if (params.get('grade')) $('gradeFilter').value = params.get('grade');
  if (params.get('kind')) $('kindFilter').value = params.get('kind');
  if (params.get('spoiler') === '1') $('spoilerToggle').checked = true;
  if (params.get('missable') === '1') $('missableOnly').checked = true;
  if (params.get('earned') === '1') $('earnedOnly').checked = true;
}

function showView(v) {
  view = v;
  $('tabChecklist').classList.toggle('active', v === 'checklist');
  $('tabRoadmap').classList.toggle('active', v === 'roadmap');
  $('checklistView').hidden = v !== 'checklist';
  $('roadmapView').hidden = v !== 'roadmap';
}

async function init() {
  loadStore();
  const res = await fetch(DATA_URL);
  const data = await res.json();
  trophies = data.trophies || [];
  applyShotParams();
  refresh();

  $('search').addEventListener('input', renderChecklist);
  $('gradeFilter').addEventListener('change', renderChecklist);
  $('kindFilter').addEventListener('change', renderChecklist);
  $('missableOnly').addEventListener('change', renderChecklist);
  $('earnedOnly').addEventListener('change', renderChecklist);
  $('spoilerToggle').addEventListener('change', renderChecklist);
  $('tabChecklist').addEventListener('click', () => showView('checklist'));
  $('tabRoadmap').addEventListener('click', () => showView('roadmap'));
  $('detailClose').addEventListener('click', closeDetail);
  $('detail').addEventListener('click', (e) => { if (e.target === $('detail')) closeDetail(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDetail(); });
  $('exportBtn').addEventListener('click', exportProgress);
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', (e) => { if (e.target.files[0]) importProgress(e.target.files[0]); e.target.value = ''; });
  $('resetBtn').addEventListener('click', () => {
    if (confirm('Clear all earned trophies? This cannot be undone — export first if you want a backup.')) {
      earned = new Set();
      saveStore();
      refresh();
    }
  });

  document.addEventListener('click', (e) => {
    const guideBtn = e.target.closest('[data-guide]');
    if (guideBtn) { openDetail(Number(guideBtn.dataset.guide)); return; }
  });
  document.addEventListener('change', (e) => {
    const box = e.target.closest('[data-earn]');
    if (box) toggleEarned(Number(box.dataset.earn), box.checked);
  });

  const params = new URLSearchParams(location.search);
  if (params.get('detail')) openDetail(Number(params.get('detail')));
}

init();
