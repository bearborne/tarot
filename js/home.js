// The home screen: spreads, switches, night sky, floating deck and card of the day.
// Part of the app; the files in js/ load in the order listed in index.html.

// ── 1. Choose a spread ──────────────────────────────────

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

// A little fan of card backs, drawn like the real deck: dark, with a thin
// gold outline, an inner line and a small circle.
function spreadFan(n) {
  const W = 46, H = 30, w = 11, h = 18;
  const spread = n === 1 ? 0 : Math.min(14, 5 + n * 3);
  let cards = "";
  for (let k = 0; k < n; k++) {
    const a = n === 1 ? 0 : -spread + (2 * spread * k) / (n - 1);
    const x = W / 2 + (k - (n - 1) / 2) * 3.2, y = H / 2 + 3 + Math.abs(a) * 0.12;
    cards += `<g transform="translate(${x} ${y}) rotate(${a})">`
      + `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="1.6" fill="#19102d" stroke="#c9a96e" stroke-width=".9"/>`
      + `<rect x="${-w / 2 + 1.8}" y="${-h / 2 + 1.8}" width="${w - 3.6}" height="${h - 3.6}" rx=".8" fill="none" stroke="#c9a96e" stroke-opacity=".45" stroke-width=".5"/>`
      + `<circle r="${w * 0.17}" fill="none" stroke="#c9a96e" stroke-width=".6"/></g>`;
  }
  return `<svg class="spread-fan" viewBox="0 0 ${W} ${H}" aria-hidden="true">${cards}</svg>`;
}

SPREADS.forEach((spread) => {
  const n = spread.positions.length;
  const b = el("button", "spread-btn");
  b.setAttribute("aria-label", spread.name);
  b.innerHTML = spreadFan(n);
  b.append(el("span", "spread-num", ROMAN[n - 1] || String(n)), el("span", "spread-word", n === 1 ? "card" : "cards"));
  b.addEventListener("click", () => startReading(spread));
  $("spreadList").append(b);
});

// The on/off switches under the spreads.
OPTIONS.forEach((o) => {
  const row = el("label", "option");
  const text = el("span", "option-text");
  text.append(el("span", "option-name", o.name), el("span", "option-note", o.note));
  const box = el("input");
  box.type = "checkbox";
  box.className = "switch";
  box.id = `opt-${o.id}`;
  box.autocomplete = "off";   // stop the browser putting back old switch states
  box.dataset.opt = o.id;
  box.checked = SET[o.id];
  box.addEventListener("change", () => {
    SET[o.id] = box.checked;
    saveOptions();
    if (o.id === "court") buildFloatDeck();
  });
  row.append(text, box);
  $("options").append(row);
});

// When the page is shown again (back button, reopened app), make the
// switches match what is saved, so what you see is what is used.
function syncOptions() {
  loadOptions();
  document.querySelectorAll("#options .switch").forEach((b) => { b.checked = SET[b.dataset.opt]; });
  buildFloatDeck();
}
addEventListener("pageshow", syncOptions);

function showHome() {
  S = null;
  resetMagic();
  $("table").hidden = true;
  $("home").hidden = false;
  placeCotdWords();   // measured again now the home screen is showing
  window.scrollTo(0, 0);
  startSky();
}

// ── The home screen's night sky and floating deck ───────

const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
const homeShown = () => !$("home").hidden && !document.hidden;

// Twinkling stars and gold dust drifting upward, on a canvas that runs
// while shown() is true. The home screen has one, and so does Sky now.
function makeStarfield(canvas, shown) {
  const f = { stars: [], dust: [], running: false };
  f.size = () => {
    const r = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * r;
    canvas.height = innerHeight * r;
    canvas.getContext("2d").setTransform(r, 0, 0, r, 0, 0);
    const n = Math.round((innerWidth * innerHeight) / 9000);
    f.stars = Array.from({ length: Math.min(n, 140) }, () => ({
      x: Math.random(), y: Math.random(),
      s: Math.random() * 1.1 + 0.3, p: Math.random() * 6, v: 0.5 + Math.random(),
    }));
    f.dust = Array.from({ length: Math.min(Math.round(n / 4), 30) }, () => ({
      x: Math.random(), y: Math.random(),
      s: Math.random() * 1.4 + 0.7, v: 0.00025 + Math.random() * 0.0004,
    }));
  };
  f.draw = (t) => {
    const x = canvas.getContext("2d");
    const W = innerWidth, H = innerHeight;
    x.clearRect(0, 0, W, H);
    x.fillStyle = "#e9e2d3";
    for (const s of f.stars) {
      x.globalAlpha = calm ? 0.6 : 0.2 + 0.8 * Math.abs(Math.sin(t / 1100 * s.v + s.p));
      x.beginPath(); x.arc(s.x * W, s.y * H, s.s, 0, 7); x.fill();
    }
    if (!calm) {
      x.fillStyle = "#e3c98f";
      for (const d of f.dust) {
        d.y -= d.v;
        if (d.y < -0.02) { d.y = 1.02; d.x = Math.random(); }
        x.globalAlpha = 0.7 * Math.sin(Math.max(0, d.y) * Math.PI);
        x.beginPath();
        x.arc(d.x * W + Math.sin(t / 900 + d.x * 9) * 8, d.y * H, d.s, 0, 7);
        x.fill();
      }
    }
    x.globalAlpha = 1;
  };
  f.start = () => {
    if (f.running || !shown()) return;
    if (calm) { f.draw(0); return; }
    f.running = true;
    requestAnimationFrame(function frame(t) {
      if (!shown()) { f.running = false; return; }   // rests while away
      f.draw(t);
      requestAnimationFrame(frame);
    });
  };
  return f;
}

const homeSky = makeStarfield($("sky"), homeShown);
const sizeSky = () => homeSky.size();
const drawSky = (t) => homeSky.draw(t);
const startSky = () => homeSky.start();

// The card of the day is drawn at random from the deck in play the
// moment you reveal it (with Court cards and Reversed cards as set),
// then kept until tomorrow.
const FD_ANGLES = [-22, -11, 0, 11, 22];
let fdBusy = false;

function dayStamp() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// Today's drawn card, or null if it hasn't been revealed yet today.
// If a switch has since been turned off, it's drawn again.
function todaysCard() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem("tarot-cotd")); } catch {}
  if (!saved || saved.day !== dayStamp()) return null;
  const card = activeDeck().find((c) => c.name === saved.name);
  if (!card) return null;                      // a court card, now switched off
  if (saved.reversed && !SET.reversals) return null;
  return { card, reversed: !!saved.reversed };
}

function drawCardOfTheDay() {
  const deck = activeDeck();
  const pick = { card: deck[rand(deck.length)], reversed: SET.reversals && rand(2) === 1 };
  try {
    localStorage.setItem("tarot-cotd", JSON.stringify(
      { day: dayStamp(), name: pick.card.name, reversed: pick.reversed }));
  } catch {}
  addReading("Card of the day", [{ name: pick.card.name, rev: pick.reversed, label: "" }]);
  return pick;
}

function cotdName({ card, reversed }) {
  return reversed ? `${card.name}, reversed` : card.name;
}

// Puts the drawn card's face on the middle card of the floating deck.
function setFdFace(pick) {
  const flip = $("floatDeck").children[2].querySelector(".fd-flip");
  flip.querySelector(".cface")?.remove();
  flip.append(cardFace(pick.card, true, pick.reversed));
}

// Once the card of the day is turned, its keywords hover around it,
// drifting like the cards themselves: half on each side, in a loose
// zigzag, always clear of the card's face and inside the screen.
function showCotdWords(pick, fadeIn) {
  const box = $("floatDeck");
  box.querySelector(".fd-words")?.remove();
  const words = filled(keywordsFor(pick.card, pick.reversed)).slice(0, 6);
  if (!words.length) return;
  const ring = el("div", "fd-words");
  ring.setAttribute("aria-hidden", "true");
  const spans = words.map((w, i) => {
    const word = el("span", "fd-word", w);
    word.style.setProperty("--fx", `${wobble(7).toFixed(1)}px`);
    word.style.setProperty("--fy", `${vary(-9, 0.35).toFixed(1)}px`);
    word.style.animationDuration = `${vary(0.9).toFixed(2)}s, ${vary(4.2, 0.25).toFixed(2)}s`;
    word.style.animationDelay = `${fadeIn ? (0.15 + i * 0.12).toFixed(2) : 0}s, ${(-Math.random() * 4).toFixed(2)}s`;
    if (!fadeIn) word.style.animationName = "none, fd-drift";
    word.dataset.side = i % 2 ? "1" : "-1";   // alternate sides, so the order reads across
    word.dataset.jx = Math.random().toFixed(3);
    word.dataset.jy = wobble(1).toFixed(3);
    ring.append(word);
    return word;
  });
  box.append(ring);
  placeCotdWords();
}

function placeCotdWords() {
  const box = $("floatDeck");
  const words = [...box.querySelectorAll(".fd-word")];
  const mid = box.children[2];
  if (!words.length || !mid) return;
  const ch = mid.offsetHeight * 1.12;              // the lifted card's size
  const half = (mid.offsetWidth * 1.12) / 2;
  const room = box.clientWidth / 2 - 8;            // from the centre to the screen's edge
  const cy = -12;                                  // the lifted card sits a little above centre
  [-1, 1].forEach((side) => {
    const list = words.filter((w) => +w.dataset.side === side);
    list.forEach((w, k) => {
      w.style.fontSize = "";
      let width = w.offsetWidth;
      const inner = half + 14;
      // A long word on a narrow screen gets a little smaller rather than overlap.
      if (inner + width > room) {
        const f = Math.max(0.7, (room - inner) / width);
        w.style.fontSize = `${(parseFloat(getComputedStyle(w).fontSize) * f).toFixed(1)}px`;
        width = w.offsetWidth;
      }
      const spare = Math.max(0, room - inner - width);
      // Every other word steps out a little further, for a zigzag.
      const out = Math.min(spare, (k % 2 ? 0.55 : 0.12 + 0.2 * +w.dataset.jx) * Math.min(spare, ch * 0.35));
      const x = side * (inner + out + width / 2);
      const n = list.length;
      const t = n === 1 ? 0 : k / (n - 1) - 0.5;   // -0.5 … 0.5 down the side
      const y = cy + t * ch * 0.82 + +w.dataset.jy * ch * 0.04 + (side > 0 ? ch * 0.08 : 0);
      w.style.setProperty("--x", `${x.toFixed(1)}px`);
      w.style.setProperty("--y", `${y.toFixed(1)}px`);
    });
  });
}

function showCotdLabel(pick) {
  $("cotd").textContent = `Card of the day · ${cotdName(pick)}`;
  $("floatDeck").setAttribute("aria-label", `Card of the day: ${cotdName(pick)}`);
}

function buildFloatDeck() {
  const box = $("floatDeck");
  box.innerHTML = "";
  FD_ANGLES.forEach((a, i) => {
    const c = el("div", "fd-card");
    c.style.setProperty("--a", `${a}deg`);
    c.style.transitionDuration = `${vary(0.6).toFixed(2)}s`;
    const bob = el("div", "fd-bob");
    // Each card floats at its own pace and height.
    bob.style.animationDelay = `${(-i * 0.45 + wobble(0.2)).toFixed(2)}s`;
    bob.style.animationDuration = `${vary(3.2, 0.15).toFixed(2)}s`;
    bob.style.setProperty("--bob", `${vary(-6, 0.3).toFixed(1)}px`);
    const flip = el("div", "fd-flip");
    flip.append(el("div", "cback"));
    bob.append(flip);
    c.append(bob);
    box.append(c);
  });
  box.setAttribute("role", "button");
  fdBusy = false;
  const pick = todaysCard();
  if (pick) {
    setFdFace(pick);
    box.children[2].classList.add("lift", "turned", "revealed");
    showCotdLabel(pick);
    showCotdWords(pick, false);
  } else {
    box.setAttribute("aria-label", "Reveal card of the day");
    $("cotd").textContent = "Reveal card of the day";
  }
}

// A burst of sunlight: a bright glow, turning rays and flying sparks.
function sunburst() {
  const sun = el("div", "sun");
  const glow = el("div", "sun-glow");
  const rays = el("div", "sun-rays");
  sun.append(rays, glow);
  $("floatDeck").append(sun);
  glow.animate(
    [{ transform: "scale(0)", opacity: 1 }, { transform: "scale(5)", opacity: 1, offset: 0.35 }, { transform: "scale(9)", opacity: 0 }],
    { duration: 750, easing: "ease-out", fill: "forwards" }
  );
  rays.animate(
    (() => {
      // the rays turn either way, by a different amount each time
      const dir = Math.random() < 0.5 ? -1 : 1, start = wobble(20), turn = vary(70, 0.3) * dir;
      return [{ transform: `scale(.2) rotate(${start}deg)`, opacity: 0 },
        { transform: `scale(${vary(1, 0.1)}) rotate(${start + turn * 0.36}deg)`, opacity: 1, offset: 0.3 },
        { transform: `scale(${vary(1.5, 0.12)}) rotate(${start + turn}deg)`, opacity: 0 }];
    })(),
    { duration: 950, easing: "ease-out", fill: "forwards" }
  );
  for (let i = 0; i < 22; i++) {
    const s = el("div", "sun-spark");
    sun.append(s);
    const a = (i / 22) * Math.PI * 2 + Math.random() * 0.3;
    const r = 70 + Math.random() * 90;
    s.animate(
      [{ transform: "translate(0,0) scale(1)", opacity: .75 },
       { transform: `translate(${Math.cos(a) * r}px, ${Math.sin(a) * r}px) scale(.3)`, opacity: 0 }],
      { duration: 500 + Math.random() * 350, delay: 60, easing: "cubic-bezier(.1,.8,.3,1)", fill: "both" }
    );
  }
  setTimeout(() => sun.remove(), 1200);   // room for the slowest variation
}

// First tap: the card rises, bursts in sunlight and turns over.
// After that, a tap opens the card's page.
async function revealCardOfTheDay() {
  if (fdBusy) return;
  const today = todaysCard();
  if (today) { openDetails([detailsItem(today.card, today.reversed, "Card of the day")]); return; }
  fdBusy = true;
  const pick = drawCardOfTheDay();
  setFdFace(pick);
  const mid = $("floatDeck").children[2];
  const label = $("cotd");
  label.classList.add("fade");
  mid.classList.add("lift");
  if (!calm) { await wait(350); sunburst(); await wait(250); }
  mid.classList.add("turned", "revealed");
  revealTitle(pick.card.name, pick.reversed ? "Card of the day · Reversed" : "Card of the day",
    mid.getBoundingClientRect().top - 4, document.querySelector(".home-head h1").getBoundingClientRect().bottom);
  showCotdLabel(pick);
  showCotdWords(pick, true);
  label.classList.remove("fade");
  await wait(700);
  fdBusy = false;
}

$("floatDeck").addEventListener("click", revealCardOfTheDay);
$("cotd").addEventListener("click", revealCardOfTheDay);

addEventListener("resize", () => { sizeSky(); if (calm) drawSky(0); placeCotdWords(); });
document.addEventListener("visibilitychange", startSky);
sizeSky();
buildFloatDeck();
document.fonts?.ready.then(placeCotdWords);   // the words' widths change once the font loads
startSky();

$("backBtn").addEventListener("click", showHome);
$("newBtn").addEventListener("click", showHome);
$("summaryBtn").addEventListener("click", () => {
  const entries = tableEntries(), title = S.title || S.spread.name, reading = S;
  summonSummary((magic) => openSummary(entries, title, magic, reading.readingId && {
    id: reading.readingId,
    onRename: (name) => { reading.title = name; if (S === reading) showReadingTitle(); },
  }));
});

// The reading's name, above the buttons once every card is turned.
// Tap it to rename; the new name is kept in the history.
function showReadingTitle() {
  const b = $("readingTitle");
  b.replaceChildren(el("span", "reading-title-text", S.title), el("span", "rename-mark", "✎"));
  b.setAttribute("aria-label", `${S.title}. Tap to rename`);
}
$("readingTitle").addEventListener("click", () => {
  if (!S?.readingId) return;
  const reading = S;
  renameInPlace($("readingTitle"), reading.title, (name) => {
    if (!updateReading(reading.readingId, { title: name })) return;
    reading.title = name;
    if (S === reading) showReadingTitle();
  }, nameIdeas(reading.slots.map((s) => ({ card: s.card, reversed: s.reversed }))));
});
