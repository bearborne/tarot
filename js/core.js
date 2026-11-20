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
// unless the person has asked for reduced motion, or the animation is one
// of a pair that must keep exact step with each other (given id "exact":
// a ring and the window edge it rides, say).
// Phones (a touch screen): the same animations, without the blurs and soft
// glows that a phone has to repaint on every frame, which made them stutter.
// LITE also lowers the sharpness of canvases drawn every frame (see PX).
const LITE = matchMedia("(pointer: coarse)").matches;
document.documentElement.classList.toggle("lite", LITE);
// How sharp to draw a canvas that's redrawn every frame: the screen's own
// sharpness up to `cap`, and no more than 1.5 on a phone.
const PX = (cap = 2) => Math.min(devicePixelRatio || 1, cap, LITE ? 1.5 : cap);
const heavyFilter = /blur|drop-shadow/;
{
  const plain = Element.prototype.animate;
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  Element.prototype.animate = function (frames, opts) {
    if (!still.matches && opts != null && opts.id !== "exact") {
      opts = typeof opts === "number" ? { duration: opts } : { ...opts };
      if (opts.duration > 1) opts.duration = vary(opts.duration);
      if (opts.delay > 0) opts.delay = vary(opts.delay, 0.18);
    }
    if (LITE && Array.isArray(frames) && frames.some((f) => heavyFilter.test(f.filter || ""))) {
      frames = frames.map(({ filter, ...f }) => f);
    }
    return plain.call(this, frames, opts);
  };
}

const DECK_LOOK = 10;   // how many card backs make up the deck pile
const FAN_MAX = 22;     // most cards shown in the fan to pick from

let S = null;           // the reading in progress

// ── Options (remembered on this device) ─────────────────

// name, a short line for its tile, and the full note (shown on hover).
const OPTIONS = [
  { id: "court",    name: "Court cards",    short: "Pages to Kings",       note: "Add the Pages, Knights, Queens and Kings" },
  { id: "reversals", name: "Reversed cards", short: "Can fall upside down", note: "Cards can come out upside down" },
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

// Some cards have their own keywords and questions for when they're reversed;
// the rest use the same ones both ways.
// (Here in core.js, so the home screen can use them as it first builds.)
function filled(list) { return (list || []).map((x) => String(x).trim()).filter(Boolean); }
function hasRevKeywords(card) { return filled(card.reversedKeywords).length > 0; }
const hasRevQuestions = (card) => filled(card.reversedQuestions).length > 0;
function keywordsFor(card, reversed) {
  return reversed && hasRevKeywords(card) ? card.reversedKeywords : card.keywords;
}
const questionsFor = (card, reversed) =>
  reversed && hasRevQuestions(card) ? card.reversedQuestions : card.questions;

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

// ── Small movements shared across the app ───────────────
// (All of them stand still when the device asks for less motion.)

// Home and the table trade places: the old screen fades away, then the new
// one fades in. Opacity only, so the fixed sky and table glow don't shift.
let swapping = false;
function swapScreen(from, to, ready) {
  if (calm || from.hidden) {
    from.hidden = true;
    to.hidden = false;
    ready?.();
    return;
  }
  swapping = true;
  from.style.pointerEvents = "none";
  const out = from.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: "ease-in", fill: "forwards" });
  // On a timer, not the animation's end: a paused page (the app in the
  // background) still swaps, rather than waiting stuck on a half-faded screen.
  setTimeout(() => {
    out.cancel();
    from.style.pointerEvents = "";
    from.hidden = true;
    to.hidden = false;
    ready?.();
    swapping = false;
    to.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: "ease-out" });
  }, 220);
}

// A folded part slides open from nothing, or shut to nothing. The tidying
// after runs on a timer (like swapScreen), and a newer fold cancels it.
const folds = new WeakMap();
function foldMove(part, frames, ms, after) {
  clearTimeout(folds.get(part));
  part.getAnimations().forEach((a) => a.cancel());
  part.style.overflow = "clip";
  part.animate(frames, { duration: ms, easing: "cubic-bezier(.2,.8,.2,1)" });
  folds.set(part, setTimeout(() => { part.style.overflow = ""; after?.(); }, ms));
}
function unfoldIn(part) {
  if (calm) return;
  const h = part.scrollHeight;
  foldMove(part, [{ height: "0px", opacity: 0 }, { height: `${h}px`, opacity: 1 }], Math.min(480, 260 + h / 8));
}
function foldAway(part) {
  if (calm || part.hidden) { part.hidden = true; return; }
  foldMove(part, [{ height: `${part.offsetHeight}px`, opacity: 1 }, { height: "0px", opacity: 0 }], 240,
    () => { part.hidden = true; });
}

// A list drawn afresh rises in, one item after another (the first dozen or so).
function riseIn(items, max = 14, after = 0, step = 30) {
  if (calm) return;
  [...items].slice(0, max).forEach((n, i) => n.animate(
    [{ opacity: 0, transform: "translateY(6px)", filter: "blur(2px)" }, { opacity: 1, transform: "none", filter: "none" }],
    { duration: 380, delay: after + i * step, easing: "ease-out", fill: "backwards" }));
}

// ── The small opening: its settings ─────────────────────
// Tuned in labs/open-lab.html (its "Settings to copy" box has these names).
// Times in milliseconds; turns in degrees; sizes as multiples.
const OPEN_FX = {
  dip: 1, dipMs: 100,                                   // the tap: how far the card dips (1: not at all)
  ringSize: 0.6, snapFrom: 1, snapTurn: -180, snapMs: 60, rest: 0,   // the ring snapping round it
  bloomMs: 1070, bloomEase: "cubic-bezier(.4, .05, .2, 1)", swell: 1.28, flare: 2.75, edge: 1, bloomTurn: 270,
  motes: 0, riseAfter: 470, riseStep: 100,              // what comes with the bloom
  inMs: 400, goneMs: 410, endMs: 680, closeTurn: 55,    // the iris back
};
// (How fast the ring's two lights run round is RING_FX, in js/rune-ring.js.)

// ── The ring of runes ───────────────────────────────────
// A ring of runes centred on C, drawn for radius R (an engraved ring with
// two lines of light running round it: see js/rune-ring.js); ring.at(r)
// gives the transform for showing it at radius r.
function runeRing(C, R = 100) {
  const ring = ringElement(R);
  Object.assign(ring.style, { left: `${C.x}px`, top: `${C.y}px`, zIndex: ++Z });
  document.body.append(ring);
  return ring;
}
// How far from C the farthest corner of the screen is.
const reachFrom = (C) => Math.hypot(Math.max(C.x, innerWidth - C.x), Math.max(C.y, innerHeight - C.y)) + 20;
// Where an element sits on screen: its middle, and the radius of a ring around it.
function ringAround(node) {
  const b = node.getBoundingClientRect();
  return { x: b.left + b.width / 2, y: b.top + b.height / 2, r: Math.hypot(b.width, b.height) / 2 + 6 };
}

// The window's round edge as it opens or closes: a thin gold line with a
// soft glow and a faint dotted line just inside. It changes its real size
// (not a scale), so it stays a hairline however big it gets, where the ring
// of runes, scaled up that far, would look like zooming into it.
function edgeLine(C) {
  const line = el("div", "rune-edge");
  line.setAttribute("aria-hidden", "true");
  Object.assign(line.style, { left: `${C.x}px`, top: `${C.y}px`, zIndex: ++Z });
  document.body.append(line);
  return line;
}
const across = (r) => `${Math.max(0, 2 * r)}px`;

// A page closing back into a point, quickly: its round edge, a line of
// light, closes in from the corners of the screen and the page shrinks
// inside it like an iris. As it reaches C, a small ring of runes (radius R)
// turns in round C, the page vanishes inside it, and the ring flares and
// fades; land() runs as it flares. Resolves once the page is gone.
// (Timers, not the animations' ends, so a paused page never waits.)
function irisInto(sheet, C, R, land) {
  const far = reachFrom(C), IN = OPEN_FX.inMs, GONE = OPEN_FX.goneMs, END = OPEN_FX.endMs, turn = OPEN_FX.closeTurn;
  const ease = "cubic-bezier(.55, 0, .3, 1)";
  sheet.style.pointerEvents = "none";
  // (Only the outline moves: brightening the page would make a flat pale
  // blob of its background once it's small. The light is the edge's own.)
  sheet.animate([
    { clipPath: `circle(${far}px at ${C.x}px ${C.y}px)` },
    { clipPath: `circle(${R * 0.8}px at ${C.x}px ${C.y}px)`, offset: IN / GONE },
    { clipPath: `circle(0px at ${C.x}px ${C.y}px)` },
  ], { duration: GONE, easing: ease, fill: "forwards", id: "exact" });
  const line = edgeLine(C);
  line.animate([
    { width: across(far), height: across(far), opacity: 0 },
    { opacity: 1, offset: 0.12 },
    { width: across(R * 0.8), height: across(R * 0.8), opacity: 1, offset: IN / GONE },
    { width: "0px", height: "0px", opacity: 0 },
  ], { duration: GONE, easing: ease, fill: "forwards", id: "exact" });
  setTimeout(() => line.remove(), GONE + 30);
  // The ring stays its own size: it only turns in round C as the edge arrives.
  const ring = runeRing(C, R);
  const appear = Math.max(0.01, (IN - 180) / END);
  ring.animate([
    { transform: `${ring.at(R * 1.35)} rotate(${-turn}deg)`, opacity: 0 },
    { transform: `${ring.at(R * 1.35)} rotate(${-turn}deg)`, opacity: 0, offset: appear },
    { transform: `${ring.at(R)} rotate(0deg)`, opacity: 1, filter: "brightness(1)", offset: IN / END, easing: "ease-out" },
    { transform: `${ring.at(R * 1.04)} rotate(8deg)`, opacity: 1, filter: "brightness(1.8)", offset: Math.min(0.95, (IN + 90) / END) },
    { transform: `${ring.at(R * 1.18)} rotate(16deg)`, opacity: 0, filter: "brightness(1)" },
  ], { duration: END, easing: ease, fill: "forwards", id: "exact" });
  setTimeout(() => ring.remove(), END + 50);
  if (land) setTimeout(land, IN + 40);
  return new Promise((done) => setTimeout(done, GONE));
}

// A card flares gold for a moment (a shadow: a filter would flatten a 3D card).
function cardFlare(node, delay = 0) {
  node?.animate([{ boxShadow: "0 0 0 1px rgba(255, 214, 140, .85), 0 0 20px 5px rgba(255, 200, 110, .6)", offset: 0.3 }],
    { duration: 560, delay, easing: "ease-out" });
}

// ── Pages that open out of a black hole ─────────────────
// The page is a window onto the hole's dark heart. Opening, it comes out
// of the dark and widens until it fills the screen; closing, it's
// swallowed back into it. Either way, as it goes:
//  · the page is pulled towards the hole: smaller, and twisted a little,
//    the nearer it is to being swallowed;
//  · a shadowy band darkens it just inside its round edge, as if the dark
//    were eating in, and it casts a soft shadow on what lies beyond;
//  · at the edge, light bends: a band of the world behind is smeared and
//    brightened, as if through a lens, with faint fringes of cool light
//    just inside and warm just outside, and the hole's own violet line
//    right on the edge.
// It's all driven from one clock, frame by frame, so it keeps exact step.
// radius(u) and pull(u) give, for u from 0 to 1 through the `ms`, the
// window's radius on screen and how far swallowed it is (0 to 1).
// `outside`: the page shows outside the ring instead, and what's inside it
// (the page underneath) is what's being swallowed: it darkens as the ring
// closes in on the hole, and the page isn't pulled (the ring is).
// Resolves when it's over (by a timer, so a paused page never waits).
function holeWindow(sheet, C, ms, delay, radius, pull, outside = false) {
  const twist = Math.random() < 0.5 ? -1 : 1;
  const shade = el("div", "hole-shade"), wave = el("div", "hole-wave"), line = el("div", "rune-edge hole-edge");
  [shade, wave, line].forEach((n) => { n.setAttribute("aria-hidden", "true"); n.style.zIndex = ++Z; });
  Object.assign(wave.style, { left: `${C.x}px`, top: `${C.y}px` });
  Object.assign(line.style, { left: `${C.x}px`, top: `${C.y}px` });
  const parts = [shade, wave, line];
  sheet.style.transformOrigin = `${C.x}px ${C.y}px`;
  const px = (v) => `${Math.max(0, v).toFixed(1)}px`;
  const draw = (u) => {
    const R = Math.max(0, radius(u)), p = Math.min(1, Math.max(0, pull(u)));
    if (outside) {
      // The page beyond the ring; inside it, the old one darkening as it's swallowed.
      const m = `radial-gradient(circle at ${C.x}px ${C.y}px, transparent ${px(R - 1)}, #000 ${px(R + 1)})`;
      sheet.style.maskImage = sheet.style.webkitMaskImage = m;
      const band = Math.max(22, R * 0.28);
      shade.style.background = `radial-gradient(circle at ${C.x}px ${C.y}px, `
        + `rgba(3, 1, 8, ${(0.15 + 0.55 * p).toFixed(3)}) 0px, rgba(3, 1, 8, ${(0.2 + 0.45 * p).toFixed(3)}) ${px(R - band)}, `
        + `rgba(3, 1, 8, ${(0.55 + 0.35 * p).toFixed(3)}) ${px(R - 1)}, rgba(3, 1, 8, .35) ${px(R + 1)}, rgba(3, 1, 8, 0) ${px(R + 18)})`;
      const W = R * 1.2 + 14;
      wave.style.width = wave.style.height = px(2 * W);
      wave.style.opacity = R < 4 ? 0 : 1;
      line.style.width = line.style.height = px(2 * R);
      line.style.opacity = R < 2 ? 0 : 1;
      return;
    }
    const s = 1 - 0.42 * p;
    sheet.style.transform = `scale(${s.toFixed(4)}) rotate(${(twist * 11 * p).toFixed(2)}deg)`;
    sheet.style.clipPath = `circle(${px(R / s)} at ${C.x}px ${C.y}px)`;
    // The dark eating in from the edge, and the shadow cast beyond it.
    const band = Math.max(26, R * 0.32), dark = 0.25 + 0.6 * p;
    shade.style.background = R < 1 ? "none" : `radial-gradient(circle at ${C.x}px ${C.y}px, `
      + `rgba(4, 2, 10, 0) ${px(R - band * 1.6)}, rgba(4, 2, 10, ${(dark * 0.55).toFixed(3)}) ${px(R - band * 0.55)}, `
      + `rgba(3, 1, 8, ${dark.toFixed(3)}) ${px(R)}, rgba(3, 1, 8, ${(0.42 * (0.4 + p)).toFixed(3)}) ${px(R + 2)}, `
      + `rgba(3, 1, 8, 0) ${px(R + 26 + R * 0.12)})`;
    // The bending light, as a band straddling the edge.
    const W = R * 1.2 + 14;
    wave.style.width = wave.style.height = px(2 * W);
    wave.style.opacity = R < 4 ? 0 : 1;
    line.style.width = line.style.height = px(2 * R);
    line.style.opacity = R < 2 ? 0 : 1;
  };
  let t0 = 0, finished = false, done;
  const over = new Promise((r) => { done = r; });
  const finish = () => {
    if (finished) return;
    finished = true;
    parts.forEach((n) => n.remove());
    sheet.style.transform = sheet.style.transformOrigin = sheet.style.clipPath = "";
    sheet.style.maskImage = sheet.style.webkitMaskImage = "";
    done();
  };
  draw(0);
  setTimeout(() => {
    document.body.append(shade, wave, line);
    t0 = performance.now();
    const frame = (now) => {
      if (finished) return;
      const u = Math.min(1, (now - t0) / ms);
      draw(u);
      if (u < 1) requestAnimationFrame(frame);
      else finish();
    };
    requestAnimationFrame(frame);
  }, delay);
  // (only if the frames haven't already finished it: drawing the last moment
  // again after that would put the page's cut-out back, and leave it there)
  setTimeout(() => { if (!finished) { draw(1); finish(); } }, delay + ms + 120);
  return { over, draw, finish, parts };
}
const easeOut3 = (v) => 1 - Math.pow(1 - v, 3);
const easeInOut3 = (v) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);

// Opening: a ring of the hole's light, bending the world round it, closes
// in from the edges of the screen and is swallowed by the hole. Beyond the
// ring is the new page; inside it the old one darkens as it's swallowed
// too. The ring goes into the dark, the hole closes behind it, and the new
// page is all there is. `parts` then rise into place one after another.
// `delay`: while the card or button is still collapsing into the hole.
// (The page is there meanwhile, so it can be measured, but held hidden.)
function holeOpen(sheet, at, parts = [], delay = 0, hole = null) {
  sheet.hidden = false;
  sheet.style.zIndex = ++Z;
  sheet.scrollTop = 0;
  const far = reachFrom(at) * 1.05, rEnd = at.hr * 0.85, ms = OPEN_FX.bloomMs;
  const hidden = `radial-gradient(circle at ${at.x}px ${at.y}px, transparent ${far + 50}px, #000 ${far + 52}px)`;
  sheet.style.maskImage = sheet.style.webkitMaskImage = hidden;   // (nothing of it shows until the ring sets off)
  const win = holeWindow(sheet, at, ms, delay,
    (u) => rEnd + (far - rEnd) * (1 - Math.pow(u, 1.7)),   // slow at first, then faster and faster into the hole
    (u) => u, true);
  // The hole stays above it all, so the ring goes into its dark.
  if (hole) setTimeout(() => { hole.style.zIndex = ++Z; }, delay + 20);
  riseIn(parts, 10, delay + ms * 0.55 + OPEN_FX.riseAfter * 0.4, OPEN_FX.riseStep);
  return win;
}

// Back: a black hole forms where the card or button was (it's hidden), and
// the page is swallowed into its dark heart: pulled in, twisting, darkening
// from its edge. Then the card or button re-forms out of the hole as the
// hole fades, and flares as it's whole (see reformFrom, in js/rune-ring.js).
// If it's gone from the screen, the page is swallowed into a hole in the
// middle. Resolves once the page is gone.
function holeClose(sheet, node, look = node, glow = node) {
  const here = !!(node?.isConnected && node.getClientRects().length);
  const b = here ? node.getBoundingClientRect() : null;
  const C = b ? { x: b.left + b.width / 2, y: b.top + b.height / 2 } : { x: innerWidth / 2, y: innerHeight / 2 };
  const hr = b ? holeSize(b) : 40;
  if (here) node.style.visibility = "hidden";
  const far = reachFrom(C) * 1.02, IN = OPEN_FX.inMs, GONE = OPEN_FX.goneMs, BACK = 460, total = GONE + BACK;
  const grow = (v) => 1 - Math.pow(1 - Math.min(1, v), 3);
  sheet.style.pointerEvents = "none";
  const hole = miniHole(C, hr, (ms) => (ms > total ? null : {
    grow: grow(ms / (IN * 0.7)) * (ms > GONE ? 1 - 0.6 * ((ms - GONE) / BACK) : 1),
    h: Math.min(1, ms / 140) * Math.min(1, (total - ms) / (BACK * 0.8)),
  }));
  sheet.style.zIndex = ++Z;   // the page over the hole, being swallowed into its dark
  const k = IN / GONE, rIn = hr * 0.72;
  const win = holeWindow(sheet, C, GONE, 0,
    (u) => (u < k ? far + (rIn - far) * Math.pow(u / k, 2.2) : rIn * (1 - easeOut3((u - k) / (1 - k)))),
    (u) => Math.pow(Math.min(1, u / k), 1.6));
  setTimeout(() => {
    if (!here) return;
    reformFrom(node, look, glow, BACK);
    hole.style.zIndex = ++Z;   // the hole over the card re-forming round it
  }, GONE);
  setTimeout(() => hole.remove(), total + 80);
  return win.over;
}

// A window opened by a button on the home screen: the button falls in on
// itself, its centre becoming a black hole (see collapseInto, in
// js/rune-ring.js), and the window opens out of the hole. (With less
// motion, it just slides up.)
function bloomFromButton(sheet, btn, parts = []) {
  if (calm || !btn.getClientRects().length) { slideIn(sheet); return; }
  const { ms, at, hole } = collapseInto(btn, btn);
  holeOpen(sheet, at, parts, ms, hole);
}
// The dip a tapped thing gives (none, at a dip of 1).
function tapDip(node) {
  if (OPEN_FX.dip < 1) node.animate([{ transform: `scale(${OPEN_FX.dip})`, offset: 0.35 }],
    { duration: OPEN_FX.dipMs, easing: "cubic-bezier(.2, .8, .2, 1)" });
}
// A ring of runes snapping round a node, at the opening's size.
function snapRing(node) {
  const at = ringAround(node);
  at.r *= OPEN_FX.ringSize;
  const ring = runeRing(at, at.r);
  ring.animate([
    { transform: `${ring.at(at.r * OPEN_FX.snapFrom)} rotate(${OPEN_FX.snapTurn}deg)`, opacity: 0 },
    { transform: `${ring.at(at.r)} rotate(0deg)`, opacity: 1 },
  ], { duration: OPEN_FX.snapMs, easing: "cubic-bezier(.2, .8, .2, 1)", fill: "forwards" });
  return { at, ring };
}

// Back, for a window that stays in the page (hidden, not removed): it
// closes into a black hole where its button is, which re-forms (see
// holeClose); then it's hidden and set back as it was, for next time.
async function closeSheetInto(sheet, node) {
  if (calm) await slideOut(sheet);
  else await holeClose(sheet, node);
  sheet.hidden = true;
  sheet.getAnimations().forEach((a) => a.cancel());
  sheet.style.pointerEvents = "";
}

// ── Tapping a card ──────────────────────────────────────
// The card dips and flares, and a small ring of runes snaps round it,
// turning. If a card page opens from the tap (openDetails takes it with
// takeTap), the page blooms out of the card through that ring; if not, the
// ring just fades. `card` takes the dip; `glow` (its face) the flare.
let lastTap = null;
function cardTap(card, glow = card) {
  if (calm || !card) return;
  tapDip(card);
  ringTap(card, glow);
}
// The same without the dip, for a card whose own movement mustn't be
// interrupted (the card of the day, floating and lifted).
function ringTap(card, glow = card) {
  if (calm || !card) return;
  cardFlare(glow);
  const { at, ring } = snapRing(card);
  const tap = { card, glow, ring, at, t: performance.now() };
  lastTap = tap;
  // Not taken by a page: the ring fades where it is.
  setTimeout(() => {
    if (tap.taken) return;
    if (lastTap === tap) lastTap = null;
    ring.animate([{ opacity: 1 }, { opacity: 0, transform: `${ring.at(at.r * 1.15)} rotate(20deg)` }],
      { duration: 300, easing: "ease-out", fill: "forwards" });
    setTimeout(() => ring.remove(), 320);
  }, 450);
}
// The tap a page is opening from, if one happened just now.
function takeTap() {
  const tap = lastTap;
  lastTap = null;
  if (!tap || performance.now() - tap.t > 420) return null;
  tap.taken = true;
  return tap;
}
// Every small card picture (Browse, History, Summary) answers its tap the same way.
document.addEventListener("click", (e) => {
  const pic = e.target.closest?.(".grid-card, .related-card")?.querySelector(".grid-pic, .related-pic");
  if (pic) cardTap(pic);
}, true);
