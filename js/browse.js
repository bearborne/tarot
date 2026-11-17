// Browse the cards, and the themes laid over a spread.
// Part of the app; the files in js/ load in the order listed in index.html.

// ── 5. Browse the cards ─────────────────────────────────

const SUITS = ["All", "Major Arcana", "Wands", "Cups", "Swords", "Pentacles"];
const B = { suit: "All" };

function suitOf(card) {
  if (CARDS.indexOf(card) < 22) return "Major Arcana";
  return card.name.split(" of ")[1] || "Other";
}

SUITS.forEach((s) => {
  const c = el("button", "chip", s === "Major Arcana" ? "Major" : s);
  c.dataset.suit = s;
  c.addEventListener("click", () => { B.suit = s; renderBrowse(); });
  $("suitChips").append(c);
});

function renderBrowse() {
  [...$("suitChips").children].forEach((c) =>
    c.classList.toggle("on", c.dataset.suit === B.suit));
  // Every word typed must be in the card's name, words, sign or element.
  const words = fold($("browseSearch").value).split(/\s+/).filter(Boolean);
  const list = activeDeck().filter((c) => (B.suit === "All" || suitOf(c) === B.suit)
    && words.every((w) => browseText(c).includes(w)));

  const grid = $("grid");
  grid.innerHTML = "";
  list.forEach((card) => {
    const b = el("button", "grid-card");
    const pic = el("div", "grid-pic");
    const face = cardFace(card, true);
    face.style.height = "100%";
    pic.append(face);
    b.append(pic, el("div", "grid-name", card.name));
    b.addEventListener("click", () => openDetails(list.map((c) => detailsItem(c)), list.indexOf(card)));
    grid.append(b);
  });
  if (!list.length) grid.append(el("p", "empty-note", "No cards found"));
}

const browseTexts = new Map();
function browseText(card) {
  if (!browseTexts.has(card)) browseTexts.set(card, fold([card.name, suitOf(card), elementOf(card) || "",
    ...(card.keywords || []), ...(card.reversedKeywords || []),
    ...Object.values(card.correspondences || {})].join(" ")));
  return browseTexts.get(card);
}
$("browseSearch").addEventListener("input", () => {
  $("browseSearchClear").hidden = !$("browseSearch").value;
  renderBrowse();
});
$("browseSearchClear").addEventListener("click", () => {
  $("browseSearch").value = "";
  $("browseSearchClear").hidden = true;
  renderBrowse();
  $("browseSearch").focus();
});

function openBrowse() {
  const browse = $("browse");
  renderBrowse();
  if (browse.hidden) {
    slideIn(browse);
  } else {
    // Already open: close the windows on top of it and show the new list.
    const z = +browse.style.zIndex;
    document.querySelectorAll(".sheet.details").forEach((s) => {
      if (+s.style.zIndex > z) s.remove();
    });
    browse.scrollTop = 0;
  }
}

$("browseBtn").addEventListener("click", () => {
  B.suit = "All";
  $("browseSearch").value = "";
  $("browseSearchClear").hidden = true;
  openBrowse();
});

// ── Themes ──────────────────────────────────────────────
// On the table, a theme lays its questions over the spread's card places:
// a spread of n cards takes the theme's n most important questions (see
// themePlaces in spreads.js). It can be changed until the last card is
// picked, when the reading is saved.
//
// animate: the places are inscribed one by one, in reading order: a line
// of light sweeps down each empty slot, its edge glows, and the place
// name settles in out of a soft blur. Old names fade out first.
function applyTheme(theme, animate = false) {
  if (!S) return;
  const reading = S;
  S.theme = theme;
  S.spread = theme ? { name: theme.name, positions: themePlaces(theme, S.n) } : S.base;
  const btn = $("themeBtn");
  btn.textContent = theme ? theme.name : "✦ Add a theme";
  btn.classList.toggle("on", !!theme);
  if (animate && !calm) restartClass(btn, "glint");
  S.slots.forEach((s) => {
    const text = theme ? S.spread.positions[s.i].label : "";
    const place = s.placeEl;
    place.getAnimations().forEach((a) => a.cancel());
    clearTimeout(s.inscribe);
    if (!animate || calm || s.tcard) { place.textContent = text; return; }
    const old = place.textContent;
    const fade = old ? 200 : 0;
    if (old) place.animate([{ opacity: 1 }, { opacity: 0, filter: "blur(3px)" }], { duration: fade, fill: "forwards" });
    s.inscribe = setTimeout(() => {
      if (S !== reading) return;
      place.getAnimations().forEach((a) => a.cancel());
      place.textContent = text;
      if (!text || s.tcard) return;
      s.box.style.setProperty("--d", `${s.i * 170}ms`);
      restartClass(s.box, "inscribed");
    }, fade);
  });
}
// Plays a one-off CSS animation again, and takes the class off once it's done.
function restartClass(node, cls) {
  node.classList.remove(cls);
  void node.offsetWidth;
  node.classList.add(cls);
  // The slot, its sweep and its name each end on their own; wait for the last.
  const done = () => {
    if (node.getAnimations({ subtree: true }).some((a) => a.playState === "running" && a.animationName)) return;
    node.classList.remove(cls);
    node.removeEventListener("animationend", done);
  };
  node.addEventListener("animationend", done);
}

// The themes window has two steps, so it never shows more than a dozen
// things at once: first the topics, as tiles; then one topic's few themes,
// one to a row, each opening to show the questions this spread would take.
// themedTopic: the topic being looked at, or null for the topics.
let themedTopic = null;
// A few words for each topic's tile.
const TOPIC_TAGS = {
  Fear: "Face what scares you", Feelings: "Name and tend them", Mind: "Worry, critic, energy",
  Body: "Listen and rest", Dreams: "Symbols and stories", Spirit: "Lessons and messages",
  Chakras: "Your energy centres", Jung: "Shadow and the Self", Parts: "Your inner family",
  Flashbacks: "When old feelings return", Self: "Being yourself", Journey: "Choices and hard times",
};
// The topics in four groups of three.
const TOPIC_GROUPS = [
  ["Heart", ["Fear", "Feelings", "Body"]],
  ["Mind", ["Mind", "Parts", "Self"]],
  ["Depths", ["Jung", "Dreams", "Flashbacks"]],
  ["Spirit", ["Spirit", "Chakras", "Journey"]],
];
// A small line-drawn sign for each topic, in thin gold strokes.
const TOPIC_ICONS = {
  Fear: '<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-6 1 1 1.5 2 1.5 3 1-2 1.5-4 1.5-7z"/>',
  Feelings: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  Mind: '<path d="M11 12a1 1 0 0 1 2 0a2 2 0 0 1-4 0a3.5 3.5 0 0 1 7 0a5 5 0 0 1-10 0"/>',
  Body: '<path d="M5 19c0-8 5-14 14-14 0 9-6 14-14 14zM5 19l8-8"/>',
  Dreams: '<path d="M15 4a8 8 0 1 0 5 13A7 7 0 0 1 15 4z"/><circle cx="18" cy="7" r=".6"/>',
  Spirit: '<path d="M12 3l1.8 7.2L21 12l-7.2 1.8L12 21l-1.8-7.2L3 12l7.2-1.8z"/>',
  Chakras: '<path d="M12 5c2 2.5 2 7 0 10-2-3-2-7.5 0-10zM12 15c-2-1-6-1-8-4 3-1 6 0 8 4zM12 15c2-1 6-1 8-4-3-1-6 0-8 4zM6 18.5h12"/>',
  Jung: '<circle cx="12" cy="12" r="8"/><path d="M12 4a4 4 0 0 1 0 8 4 4 0 0 0 0 8"/><circle cx="12" cy="8" r=".7"/><circle cx="12" cy="16" r=".7"/>',
  Parts: '<circle cx="12" cy="7.5" r="2.6"/><circle cx="7" cy="16" r="2.6"/><circle cx="17" cy="16" r="2.6"/>',
  Flashbacks: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M6.7 3v3.7h3.7"/>',
  Self: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="1.6"/>',
  Journey: '<circle cx="12" cy="12" r="8"/><path d="M12 6l2 6-2 6-2-6z"/>',
  Yours: '<path d="M19 4c-6 1-10 6-11 13l-2 3M8 17c4 0 8-3 10-8M11 13l5-5"/>',
};
function topicIcon(t) {
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("viewBox", "0 0 24 24");
  s.setAttribute("aria-hidden", "true");
  s.classList.add("topic-icon");
  s.innerHTML = TOPIC_ICONS[t] || '<path d="M12 6l1.4 4.6L18 12l-4.6 1.4L12 18l-1.4-4.6L6 12l4.6-1.4z"/>';
  return s;
}
function renderThemed() {
  const n = S ? S.n : 5;
  const note = $("topicNote");
  const list = $("themedList");
  list.innerHTML = "";
  $("themeNone").hidden = !(S && S.theme);
  $("themedTitle").textContent = themedTopic || "Themes";

  note.classList.toggle("topics-lead", !themedTopic);
  if (!themedTopic) {
    note.textContent = "What would you like to explore?";
    const tile = (t, cls) => {
      const b = el("button", cls);
      const name = el("span", "topic-name", t);
      // The topic of the theme in use is marked.
      if (S && S.theme && S.theme.topic === t) name.append(el("span", "topic-mark", " ✦"));
      const words = el("span", "topic-words");
      words.append(name, el("span", "topic-tag", TOPIC_TAGS[t] || ""));
      b.append(topicIcon(t), words);
      b.addEventListener("click", () => showTopic(t));
      return b;
    };
    // The topics in a few groups, each under a small heading; any topic
    // not placed in a group joins the last.
    const own = typeof OWN_TOPIC !== "undefined" ? OWN_TOPIC : null;
    const placed = TOPIC_GROUPS.flatMap(([, ts]) => ts);
    const stray = Object.keys(THEME_TOPICS).filter((t) => t !== own && !placed.includes(t));
    TOPIC_GROUPS.forEach(([head, ts], i) => {
      const topics = ts.filter((t) => t in THEME_TOPICS).concat(i === TOPIC_GROUPS.length - 1 ? stray : []);
      if (!topics.length) return;
      list.append(el("h3", "topic-group", head));
      const grid = el("div", "topic-grid");
      topics.forEach((t) => grid.append(tile(t, "topic-tile")));
      list.append(grid);
    });
    // Your own themes: set apart, on one line of their own.
    if (own && own in THEME_TOPICS) {
      list.append(el("div", "topic-rule"), tile(own, "topic-tile topic-own"));
    }
    return;
  }

  note.textContent = THEME_TOPICS[themedTopic] || "";
  const rows = el("div", "themed-rows");
  list.append(rows);
  const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (themedTopic === OWN_TOPIC) {
    const add = el("button", "pill small own-new", "✦ New theme");
    add.addEventListener("click", () => editOwnTheme(null));
    list.prepend(add);
    if (!THEMES_LIST.some((th) => th.topic === OWN_TOPIC)) rows.append(el("p", "empty-note", "Your own themes will appear here."));
  }
  THEMES_LIST.filter((th) => th.topic === themedTopic).forEach((th) => {
    const item = el("details", "themed-item");
    if (S && S.theme === th) item.classList.add("chosen");
    const sum = el("summary");
    // The title stands out; a few words under it say what the reading explores.
    sum.append(el("span", "themed-name", th.name), el("span", "themed-brief", th.brief || ""));
    // With a mouse, a column opens while the pointer rests on it and widens
    // a little; a click on its title doesn't shut it again.
    if (canHover) {
      item.addEventListener("mouseenter", () => { item.dataset.hover = "1"; item.open = true; });
      item.addEventListener("mouseleave", () => { item.open = false; delete item.dataset.hover; });
      sum.addEventListener("click", (e) => e.preventDefault());
    }
    // One open at a time; it unfolds out of a little light.
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      list.querySelectorAll(".themed-item[open]").forEach((o) => { if (o !== item) o.open = false; });
      if (item.dataset.hover) return;
      if (!calm) item.animate([
        { opacity: .4, filter: "blur(3px)", boxShadow: "0 0 24px rgba(255, 214, 140, .6)" },
        { opacity: 1, filter: "blur(0)", boxShadow: "0 0 0 rgba(255, 214, 140, 0)" },
      ], { duration: 450, easing: "ease-out" });
      item.scrollIntoView({ block: "nearest", behavior: calm ? "auto" : "smooth" });
    });
    // The questions this spread would take, in reading order.
    // Laid out like the cards on the table: the same number of columns.
    const ol = el("ol", "themed-places");
    ol.style.setProperty("--cols", slotGrid(n, false).cols);
    themePlaces(th, n).forEach((p) => {
      const li = el("li");
      li.append(el("strong", "", p.label), el("span", "", p.question));
      ol.append(li);
    });
    const use = el("button", "pill small", S && S.theme === th ? "In use" : "Use this theme");
    // Close first, so the places are inscribed in view.
    use.addEventListener("click", () => closeThemed().then(() => applyTheme(th, true)));
    item.append(sum, el("p", "themed-about", th.about || ""), ol, use);
    if (th.own) {
      const edit = el("button", "link small gold", "Edit");
      edit.addEventListener("click", () => editOwnTheme(th.own));
      item.append(edit);
    }
    rows.append(item);
  });
  // All start closed; the one in use is marked by its border.
}
// Moves between the two steps, with the tiles conjured afresh.
function showTopic(t) {
  themedTopic = t;
  renderThemed();
  $("themed").scrollTop = 0;
  conjureTiles();
}
// The themes window opens by magic: it blooms out of the theme button in
// a widening circle of light, gold motes burst from the button, and the
// tiles appear one after another out of a glow. It closes back into the
// button.
function themeOrigin() {
  const r = $("themeBtn").getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
function conjureTiles(delay = 0) {
  if (calm) return;
  document.querySelectorAll("#themedList .topic-tile, #themedList .themed-item").forEach((t, i) => {
    t.animate([
      { opacity: 0, transform: "scale(.82) translateY(10px)", filter: "blur(6px)", boxShadow: "0 0 22px rgba(255, 214, 140, .65)" },
      { opacity: 1, transform: "scale(1.03) translateY(0)", filter: "blur(0)", boxShadow: "0 0 14px rgba(255, 214, 140, .35)", offset: .6 },
      { opacity: 1, transform: "none", filter: "blur(0)", boxShadow: "0 0 0 rgba(255, 214, 140, 0)" },
    ], { duration: 620, delay: delay + Math.min(i, 30) * 32, easing: "cubic-bezier(.2, .8, .2, 1)", fill: "backwards" });
  });
}
function themeMotes(sheet, { x, y }) {
  for (let k = 0; k < 16; k++) {
    const m = el("span", "theme-mote");
    m.style.left = `${x}px`;
    m.style.top = `${y}px`;
    sheet.append(m);
    const a = (k / 16) * Math.PI * 2 + rand(100) / 100;
    const d = 60 + rand(90);
    m.animate([
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d + 30}px) scale(.3)`, opacity: 0 },
    ], { duration: 700 + rand(400), easing: "cubic-bezier(.1, .7, .3, 1)" }).finished.then(() => m.remove());
  }
}
function openThemed() {
  const sheet = $("themed");
  themedTopic = S && S.theme ? S.theme.topic : null;
  renderThemed();
  sheet.hidden = false;
  sheet.style.zIndex = ++Z;
  sheet.scrollTop = 0;
  if (calm) return;
  const o = themeOrigin();
  sheet.animate([
    { clipPath: `circle(0px at ${o.x}px ${o.y}px)`, filter: "brightness(2.2) saturate(1.4)" },
    { clipPath: `circle(150vmax at ${o.x}px ${o.y}px)`, filter: "brightness(1) saturate(1)" },
  ], { duration: 700, easing: "cubic-bezier(.35, .1, .2, 1)" });
  themeMotes(sheet, o);
  conjureTiles(220);
}
async function closeThemed() {
  const sheet = $("themed");
  if (!calm) {
    const o = themeOrigin();
    await sheet.animate([
      { clipPath: `circle(150vmax at ${o.x}px ${o.y}px)`, filter: "brightness(1)" },
      { clipPath: `circle(0px at ${o.x}px ${o.y}px)`, filter: "brightness(1.8)" },
    ], { duration: 420, easing: "cubic-bezier(.5, 0, .75, .4)" }).finished;
  }
  sheet.hidden = true;
}
$("themeBtn").addEventListener("click", () => {
  if (!S || $("themeBtn").disabled) return;
  openThemed();
});
$("themeNone").addEventListener("click", () => closeThemed().then(() => applyTheme(null, true)));
$("themedBack").addEventListener("click", () => (themedTopic ? showTopic(null) : closeThemed()));
$("browseBack").addEventListener("click", async () => {
  const browse = $("browse");
  await slideOut(browse);
  browse.hidden = true;
});
