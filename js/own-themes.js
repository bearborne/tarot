// Themes of your own: a name and up to five card places, each with a
// label and a question. They're listed under "Yours" with the other
// themes, so they lay over any spread the same way (a spread of fewer
// cards takes the first places). Kept in "tarot-own-themes" and in backups.

const OWN_KEY = "tarot-own-themes";
const OWN_TOPIC = "Yours";
const OWN_PLACES = 5;
THEME_TOPICS[OWN_TOPIC] = "Spreads you've made: your own places and questions.";
TOPIC_TAGS[OWN_TOPIC] = "Made by you";

function loadOwnThemes() {
  const list = readJSON(OWN_KEY, []);
  return Array.isArray(list) ? list.filter((t) => t && t.id && t.name && Array.isArray(t.places)) : [];
}

// One of yours as a theme in THEMES_LIST. Places past your last are
// numbered, so a bigger spread still has a label for every card.
function ownAsTheme(t) {
  const places = t.places.filter((p) => p.label || p.question);
  const positions = Array.from({ length: OWN_PLACES }, (_, i) => ({
    label: places[i]?.label || (places[i] ? `Place ${i + 1}` : `Card ${i + 1}`),
    question: places[i]?.question || "",
    rank: i + 1,
  }));
  return { name: t.name, topic: OWN_TOPIC, own: t.id, about: t.about || "",
    brief: places.map((p) => p.label).filter(Boolean).join(" · "), positions };
}

// Puts the saved ones into THEMES_LIST, in place of any older copies.
function syncOwnThemes() {
  for (let i = THEMES_LIST.length - 1; i >= 0; i--) if (THEMES_LIST[i].own) THEMES_LIST.splice(i, 1);
  loadOwnThemes().forEach((t) => THEMES_LIST.push(ownAsTheme(t)));
}
syncOwnThemes();

function saveOwnThemes(list) {
  const ok = writeJSON(OWN_KEY, list);
  syncOwnThemes();
  return ok;
}

// From a backup: adds the themes that aren't here yet. Returns how many.
function mergeOwnThemes(list) {
  if (!Array.isArray(list)) return 0;
  const here = loadOwnThemes();
  const ids = new Set(here.map((t) => t.id));
  const add = list.filter((t) => t && t.id && t.name && Array.isArray(t.places) && !ids.has(t.id));
  if (add.length) saveOwnThemes([...here, ...add]);
  return add.length;
}

// The form for a new theme (id null) or one of yours.
function editOwnTheme(id) {
  const old = loadOwnThemes().find((t) => t.id === id);
  const form = $("ownForm");
  form.innerHTML = "";
  $("ownTitle").textContent = old ? "Your theme" : "New theme";
  const field = (cls, label, value, max, place) => {
    const wrap = el("label", `own-field ${cls}`);
    const input = el("input", "own-input");
    input.type = "text";
    input.value = value || "";
    input.maxLength = max;
    input.placeholder = place;
    wrap.append(el("span", "own-label", label), input);
    return { wrap, input };
  };
  const name = field("own-name", "Name", old?.name, 40, "e.g. New job");
  const about = field("own-about", "What it's for", old?.about, 120, "optional");
  form.append(name.wrap, about.wrap, el("p", "asks-title", "Card places"),
    el("p", "history-note", "In reading order. A spread of fewer cards takes the first ones."));
  const rows = Array.from({ length: OWN_PLACES }, (_, i) => {
    const p = old?.places[i] || {};
    const row = el("div", "own-place");
    const lab = field("", `${i + 1}`, p.label, 24, i ? "Place" : "e.g. Where I stand");
    const q = field("", "", p.question, 140, "Its question");
    row.append(lab.wrap, q.wrap);
    form.append(row);
    return { label: lab.input, question: q.input };
  });
  const status = el("p", "note-status own-status");
  const actions = el("div", "history-actions");
  const save = el("button", "pill small", "Save");
  save.type = "submit";
  actions.append(save);
  if (old) {
    const del = el("button", "link small", "Delete");
    del.type = "button";
    del.addEventListener("click", () => {
      if (!confirm(`Delete "${old.name}"? Readings made with it stay in your history.`)) return;
      saveOwnThemes(loadOwnThemes().filter((t) => t.id !== id));
      closeOwnTheme();
    });
    actions.append(del);
  }
  form.append(status, actions);
  form.onsubmit = (e) => {
    e.preventDefault();
    const clean = (s) => s.value.trim().replace(/\s+/g, " ");
    const places = rows.map((r) => ({ label: clean(r.label), question: clean(r.question) }));
    while (places.length && !places.at(-1).label && !places.at(-1).question) places.pop();
    if (!clean(name.input)) { status.textContent = "Give it a name"; name.input.focus(); return; }
    if (!places.length) { status.textContent = "Add at least one place"; rows[0].label.focus(); return; }
    const theme = { id: old?.id || `${Date.now()}-${rand(1e6)}`, name: clean(name.input), about: clean(about.input), places };
    const list = loadOwnThemes();
    const at = list.findIndex((t) => t.id === theme.id);
    if (at >= 0) list[at] = theme; else list.push(theme);
    if (!saveOwnThemes(list)) { status.textContent = "Couldn't save on this device"; return; }
    closeOwnTheme();
  };
  slideIn($("ownTheme"));
  if (!old) name.input.focus();
}

async function closeOwnTheme() {
  await slideOut($("ownTheme"));
  $("ownTheme").hidden = true;
  // A theme of yours already on the table takes the change (or goes, if deleted).
  if (S?.theme?.own && !$("themeBtn").disabled) applyTheme(THEMES_LIST.find((th) => th.own === S.theme.own) || null);
  // The themes list behind it shows the change.
  if (!$("themed").hidden) renderThemed();
}
$("ownBack").addEventListener("click", closeOwnTheme);
