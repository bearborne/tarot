// Shared basics: switches, saved history and notes, small helpers.
// Part of the app; the files in js/ load in the order listed in index.html.

const $ = (id) => document.getElementById(id);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// A little life in every movement: n give or take `amt` (12% by default),
// so no two flips, fans or flights play out exactly alike.
const vary = (n, amt = 0.12) => n * (1 + (Math.random() * 2 - 1) * amt);
// A random number between -n and n.
const wobble = (n) => (Math.random() * 2 - 1) * n;

// Every animation in the app gets a slightly different speed and start,
// unless the person has asked for reduced motion.
{
  const plain = Element.prototype.animate;
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  Element.prototype.animate = function (frames, opts) {
    if (!still.matches && opts != null) {
      opts = typeof opts === "number" ? { duration: opts } : { ...opts };
      if (opts.duration > 1) opts.duration = vary(opts.duration);
      if (opts.delay > 0) opts.delay = vary(opts.delay, 0.18);
    }
    return plain.call(this, frames, opts);
  };
}

const DECK_LOOK = 10;   // how many card backs make up the deck pile
const FAN_MAX = 22;     // most cards shown in the fan to pick from

let S = null;           // the reading in progress

// ── Options (remembered on this device) ─────────────────

const OPTIONS = [
  { id: "court",    name: "Court cards",    note: "Add the Pages, Knights, Queens and Kings" },
  { id: "reversals", name: "Reversed cards", note: "Cards can come out upside down" },
];
const SET = { court: false, reversals: false };

// Reads the saved switches. Only known switches, only true/false.
function loadOptions() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem("tarot-options")) || {}; } catch {}
  OPTIONS.forEach((o) => { SET[o.id] = saved[o.id] === true; });
}
loadOptions();

function saveOptions() {
  try { localStorage.setItem("tarot-options", JSON.stringify(SET)); } catch {}
}

// How a picked card travels from the fan to the spread. "surprise"
// picks one of the quick flashes at random for each card pulled.
const PICK_FX = [
  { id: "surprise", name: "Surprise me" },
  { id: "rune",     name: "Rune flash" },
  { id: "star",     name: "Star streak" },
  { id: "ember",    name: "Ember blink" },
  { id: "bolt",     name: "Gold lightning" },
  { id: "moon",     name: "Moon blink" },
  { id: "classic",  name: "Slow flight" },
];
let pickFx = "surprise";

// A fresh one for every card pulled, never the same one twice in a row
// (also across readings).
let lastPickFx = null;
function nextPickFx() {
  if (pickFx !== "surprise") return pickFx;
  const quick = PICK_FX.filter((p) => p.id !== "surprise" && p.id !== "classic" && p.id !== lastPickFx);
  lastPickFx = quick[rand(quick.length)].id;
  return lastPickFx;
}

// The cards in play: the Pages, Knights, Queens and Kings only when Court cards is on.
function activeDeck() {
  return CARDS.filter((c) => SET.court || !c.court);
}

// ── Your history and notes (kept on this device) ────────
// Every reading and card of the day is saved in "tarot-history",
// your notes on the cards in "tarot-notes". Export a backup from the
// History screen to keep them safe or move them to another device.

const HISTORY_KEY = "tarot-history";
const NOTES_KEY = "tarot-notes";

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    keepData();
    return true;
  } catch {
    return false;
  }
}

// Asks the browser to keep this app's data, instead of clearing it
// when the device runs low on space.
let askedToKeep = false;
function keepData() {
  if (askedToKeep) return;
  askedToKeep = true;
  try { navigator.storage?.persist?.().catch(() => {}); } catch {}
}

function loadHistory() {
  const h = readJSON(HISTORY_KEY, []);
  return Array.isArray(h) ? h.filter((r) => r && Array.isArray(r.cards)) : [];
}

// cards: [{ name, rev, label }]; title: the reading's name, if it has one.
// Returns the new reading's id.
function addReading(spreadName, cards, title) {
  const h = loadHistory();
  const id = `${Date.now()}-${rand(1e6)}`;
  h.push({ id, t: Date.now(), spread: spreadName, cards, ...(title ? { title } : {}) });
  writeJSON(HISTORY_KEY, h);
  return id;
}

// Changes one saved reading (a new name, say).
function updateReading(id, changes) {
  const h = loadHistory();
  const r = h.find((x) => x.id === id);
  if (!r) return false;
  Object.assign(r, changes);
  return writeJSON(HISTORY_KEY, h);
}

// A reading's name: the one it was given, or else one made from its cards.
function readingTitle(r) {
  return r.title || nameReading(readingCards(r)) || r.spread;
}
const readingCards = (r) => r.cards.map((c) => ({ card: CARDS.find((x) => x.name === c.name), reversed: !!c.rev }))
  .filter((x) => x.card);

// Lets a name be retyped where it stands. Enter or tapping away keeps it,
// Escape (or leaving it empty) puts the old one back.
// ideas: other names to offer, as a row of words to tap.
function renameInPlace(holder, current, save, ideas = []) {
  if (!holder.isConnected) return;
  const big = holder.classList.contains("reading-title");
  const box = el("div", `rename-box ${big ? "big" : ""}`);
  const input = el("input", `rename-input ${big ? "big" : ""}`);
  input.type = "text";
  input.value = current;
  input.maxLength = 60;
  input.enterKeyHint = "done";
  input.setAttribute("aria-label", "Name this reading");
  box.append(input);
  const offer = ideas.filter((w) => w !== current).slice(0, 6);
  if (offer.length) {
    const row = el("div", "rename-ideas");
    offer.forEach((w) => {
      const chip = el("button", "chip rename-idea", w);
      chip.type = "button";
      // Keep the box focused, so tapping a word doesn't count as tapping away.
      chip.addEventListener("pointerdown", (e) => e.preventDefault());
      chip.addEventListener("click", () => { input.value = w; finish(true); });
      row.append(chip);
    });
    box.append(row);
  }
  holder.replaceWith(box);   // the box takes the name's place while typing
  input.focus();
  input.select();
  let done = false;
  const finish = (keep) => {
    if (done) return;
    done = true;
    const name = input.value.trim().replace(/\s+/g, " ");
    box.replaceWith(holder);
    if (keep && name && name !== current) save(name);
  };
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); finish(true); }
    else if (e.key === "Escape") { e.preventDefault(); finish(false); }
  });
  input.addEventListener("blur", () => finish(true));
  input.addEventListener("click", (e) => e.stopPropagation());
}

function removeReading(id) {
  writeJSON(HISTORY_KEY, loadHistory().filter((r) => r.id !== id));
}

function loadNotes() {
  const n = readJSON(NOTES_KEY, {});
  return n && typeof n === "object" && !Array.isArray(n) ? n : {};
}

const noteFor = (card) => loadNotes()[card.name] || "";

function saveNote(card, text) {
  const n = loadNotes();
  if (text.trim()) n[card.name] = text;
  else delete n[card.name];
  return writeJSON(NOTES_KEY, n);
}

// Every time a card was drawn, newest first.
function drawsOf(card) {
  const out = [];
  loadHistory().forEach((r) => r.cards.forEach((c) => {
    if (c.name === card.name) out.push({ t: r.t, spread: r.spread, label: c.label, rev: !!c.rev });
  }));
  return out.sort((a, b) => b.t - a.t);
}

// Dates in English to match the app, e.g. "12 Nov 2026" and "18:42".
const dateText = (t) => new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const timeText = (t) => new Date(t).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

if (loadHistory().length || Object.keys(loadNotes()).length) keepData();

// ── Helpers ─────────────────────────────────────────────

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

// A fair random whole number from 0 to n-1.
function rand(n) {
  const a = new Uint32Array(1);
  const limit = 2 ** 32 - (2 ** 32 % n);   // skip the uneven top end so every result is exactly as likely
  do crypto.getRandomValues(a); while (a[0] >= limit);
  return a[0] % n;
}

// The deck's order after a real shuffle.
function shuffledOrder(n) {
  const a = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fillText(box, text, emptyNote) {
  box.innerHTML = "";
  const parts = (text || "").trim().split(/\n\s*\n/).filter((p) => p.trim());
  if (!parts.length) {
    box.append(el("p", "empty-note", emptyNote));
    return;
  }
  parts.forEach((p) => box.append(el("p", "", p.trim())));
}

// The face of a card: its picture, or its name if it has none yet.
// small = use the little picture from cards/small (for the card list).
function cardFace(card, small, reversed) {
  const f = el("div", reversed ? "cface reversed" : "cface");
  const placeholder = () => {
    const p = el("div", "placeholder");
    p.append(el("span", "", card.name));
    return p;
  };
  if (card.image) {
    const img = new Image();
    img.alt = card.name;
    img.decoding = "async";
    if (small) {
      img.loading = "lazy";
      img.src = card.image.replace(/^cards\//, "cards/small/");
      img.onerror = () => {
        img.onerror = () => img.replaceWith(placeholder());
        img.src = card.image;
      };
    } else {
      img.src = card.image;
      img.onerror = () => img.replaceWith(placeholder());
    }
    f.append(img);
  } else {
    f.append(placeholder());
  }
  return f;
}

// Waits (briefly) for a card's picture so it never turns to a blank face.
function preload(card) {
  if (!card.image) return Promise.resolve();
  const img = new Image();
  img.src = card.image;
  return Promise.race([img.decode().catch(() => {}), wait(1500)]);
}

// A small game-style title that appears just above the cards when one is
// revealed: ornaments slide out, the name glows in letter by letter,
// holds for a moment, then fades away. It never covers the cards and
// taps go straight through it.
// above = the y position (in px) the title's bottom edge sits at;
// limit = the lowest y its top edge may reach (the bottom of the header).
function revealTitle(name, sub = "", above = 120, limit = 0) {
  document.querySelector(".rpg-title")?.remove();
  const box = el("div", "rpg-title");
  box.style.top = `${above}px`;
  box.setAttribute("aria-hidden", "true");
  const line = () => { const l = el("div", "rpg-line"); l.append(el("i"), el("b"), el("i")); return l; };
  const lineTop = line(), lineBottom = line();
  const word = el("div", "rpg-name");
  // Letters grouped by word, so a long name wraps between words, not inside one.
  name.split(" ").forEach((w, wi) => {
    if (wi) word.append(" ");
    const group = el("span", "rpg-word");
    [...w].forEach((ch) => group.append(el("span", "rpg-letter", ch)));
    word.append(group);
  });
  box.append(lineTop, word);
  if (sub) box.append(el("div", "rpg-sub", sub));
  box.append(lineBottom);
  document.body.append(box);
  // Short on room (a two-row spread): drop the top ornament. Never go
  // over the header or off the top of the screen.
  if (above - box.offsetHeight < limit) lineTop.remove();
  const minTop = Math.max(limit, 6) + box.offsetHeight;
  if (above < minTop) box.style.top = `${minTop}px`;
  if (!calm) box.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: "ease-out" });

  const hold = 1300 + name.length * 25;
  if (calm) {
    box.animate([{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.85 }, { opacity: 0 }],
      { duration: hold + 600, fill: "forwards" }).finished.then(() => box.remove());
    return;
  }
  [lineTop, lineBottom].forEach((l) => l.animate(
    [{ transform: "scaleX(0)", opacity: 0 }, { transform: "scaleX(1)", opacity: 1 }],
    { duration: 500, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" }));
  word.querySelectorAll(".rpg-letter").forEach((s, i) => s.animate(
    [{ opacity: 0, filter: "blur(4px)", transform: "translateY(5px) scale(1.25)" },
     { opacity: 1, filter: "blur(0)", transform: "none" }],
    { duration: 420, delay: 100 + i * 28 + wobble(14), easing: "ease-out", fill: "both" }));
  box.querySelector(".rpg-sub")?.animate(
    [{ opacity: 0, letterSpacing: ".45em" }, { opacity: 1, letterSpacing: ".25em" }],
    { duration: 600, delay: 200 + name.length * 28, easing: "ease-out", fill: "both" });
  box.animate(
    [{ opacity: 1, transform: "translateY(-100%)" }, { opacity: 0, transform: "translateY(calc(-100% - 8px))" }],
    { duration: 500, delay: hold, easing: "ease-in", fill: "forwards" }
  ).finished.then(() => box.remove());
}

function setHint(text) {
  const h = $("hint");
  h.classList.add("dim");
  setTimeout(() => { h.textContent = text; h.classList.remove("dim"); }, 200);
}
