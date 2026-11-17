// The home screen: spreads, switches, night sky, floating deck and card of the day.
// Part of the app; the files in js/ load in the order listed in index.html.

// ── 1. Choose a spread ──────────────────────────────────

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

// A little fan of card backs, drawn like the real deck: dark, with a thin
// gold outline, an inner line and a small circle. Each card sits in a
// group of its own (.lift) that can lift as the button is pressed.
function spreadFan(n) {
  const W = 46, H = 30, w = 11, h = 18;
  const spread = n === 1 ? 0 : Math.min(14, 5 + n * 3);
  let cards = "";
  for (let k = 0; k < n; k++) {
    const a = n === 1 ? 0 : -spread + (2 * spread * k) / (n - 1);
    const x = W / 2 + (k - (n - 1) / 2) * 3.2, y = H / 2 + 3 + Math.abs(a) * 0.12;
    cards += `<g transform="translate(${x} ${y}) rotate(${a})"><g class="lift">`
      + `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="1.6" fill="#19102d" stroke="#c9a96e" stroke-width=".9"/>`
      + `<rect x="${-w / 2 + 1.8}" y="${-h / 2 + 1.8}" width="${w - 3.6}" height="${h - 3.6}" rx=".8" fill="none" stroke="#c9a96e" stroke-opacity=".45" stroke-width=".5"/>`
      + `<circle r="${w * 0.17}" fill="none" stroke="#c9a96e" stroke-width=".6"/></g></g>`;
  }
  return `<svg class="spread-fan" viewBox="0 0 ${W} ${H}" aria-hidden="true">${cards}</svg>`;
}

SPREADS.forEach((spread) => {
  const n = spread.positions.length;
  const b = el("button", "spread-btn");
  b.setAttribute("aria-label", spread.name);
  b.innerHTML = spreadFan(n);
  b.append(el("span", "spread-num", ROMAN[n - 1] || String(n)), el("span", "spread-word", n === 1 ? "card" : "cards"));
  b.addEventListener("click", () => startReading(spread, b));
  wireSpreadButton(b);
  $("spreadList").append(b);
});

// ── The spread buttons come alive ───────────────────────
// Hover or focus: two lines of light run round the button's edge from the
// top, one each way, meeting at the bottom, and the edge stays faintly lit.
// Press: the little cards part and lift one by one towards the finger (let
// go and they leap: see castSpread). Tap: the other buttons step back while
// the chosen numeral flares. And when the page opens, then every 5 seconds
// while none is being chosen, a faint light passes along the row from I to V.
let spreadHover = 0;   // how many spread buttons are hovered or focused
function wireSpreadButton(b) {
  const on = () => { spreadHover++; edgeLight(b); };
  const off = () => { spreadHover = Math.max(0, spreadHover - 1); edgeOff(b); };
  b.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") on(); });
  b.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") off(); fanRest(b); });
  b.addEventListener("focus", on);
  b.addEventListener("blur", off);
  b.addEventListener("pointerdown", () => fanReady(b));
  b.addEventListener("pointercancel", () => fanRest(b));
}

function edgeLight(b) {
  if (calm) return;
  b.querySelector(".spread-edge")?.remove();
  const w = b.offsetWidth + 2, h = b.offsetHeight + 2, r = 10.5;
  // Half the border each: from the top's middle round to the bottom's, right way and left way.
  const right = `M ${w / 2} .5 H ${w - r} A ${r} ${r} 0 0 1 ${w - 0.5} ${r} V ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h - 0.5} H ${w / 2}`;
  const left = `M ${w / 2} .5 H ${r} A ${r} ${r} 0 0 0 .5 ${r} V ${h - r} A ${r} ${r} 0 0 0 ${r} ${h - 0.5} H ${w / 2}`;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "spread-edge");
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = `<path d="${right}"/><path d="${left}"/><circle r="1.6"/><circle r="1.6"/>`;
  b.append(svg);
  const paths = [...svg.querySelectorAll("path")], dots = [...svg.querySelectorAll("circle")];
  const len = paths[0].getTotalLength(), t0 = performance.now(), ms = 620;
  paths.forEach((p) => { p.style.strokeDasharray = len; p.style.strokeDashoffset = len; });
  const step = (now) => {
    if (!svg.isConnected) return;
    const u = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - u, 2);
    paths.forEach((p, i) => {
      p.style.strokeDashoffset = len * (1 - e);
      p.style.strokeOpacity = u < 1 ? 1 : 0.6;
      const pt = p.getPointAtLength(len * e);
      dots[i].setAttribute("cx", pt.x);
      dots[i].setAttribute("cy", pt.y);
      dots[i].style.opacity = u < 1 ? 1 : 0;
    });
    if (u < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function edgeOff(b) {
  const svg = b.querySelector(".spread-edge");
  if (!svg) return;
  svg.classList.add("gone");
  setTimeout(() => svg.remove(), 400);
}

// The fan's cards part and lift as the button is pressed.
function fanReady(b) {
  if (calm) return;
  const lifts = [...b.querySelectorAll(".spread-fan .lift")], n = lifts.length;
  lifts.forEach((g, k) => g.animate([{ transform: "none" },
    { transform: `translateY(${n === 1 ? -3.5 : -2.5}px) rotate(${(k - (n - 1) / 2) * 4}deg)` }],
    { duration: 220, delay: k * 45, easing: "cubic-bezier(.2, .9, .3, 1.3)", fill: "forwards" }));
}
function fanRest(b) { b.querySelectorAll(".spread-fan .lift").forEach((g) => g.getAnimations().forEach((a) => a.cancel())); }

// A faint light passes along the row from I to V, each numeral and fan glinting.
function glintSpreads() {
  [...$("spreadList").children].forEach((b, k) => {
    b.querySelector(".spread-num")?.animate([
      { textShadow: "0 0 0 rgba(255, 200, 110, 0)", color: "#c9a96e" },
      { textShadow: "0 0 12px rgba(255, 200, 110, .9)", color: "#fff0d0", offset: 0.35 },
      { textShadow: "0 0 0 rgba(255, 200, 110, 0)", color: "#c9a96e" },
    ], { duration: 900, delay: k * 110, easing: "ease-out" });
    b.querySelector(".spread-fan")?.animate([
      { filter: "brightness(1)" },
      { filter: "brightness(1.8) drop-shadow(0 0 3px rgba(255, 200, 110, .8))", offset: 0.35 },
      { filter: "brightness(1)" },
    ], { duration: 900, delay: k * 110 + 40, easing: "ease-out" });
  });
}
// Once as the page opens, then every 5 seconds, but only while home is
// showing and no spread is being hovered, focused or chosen.
function glintIfIdle() {
  if (!calm && !$("home").hidden && !document.hidden && !spreadHover && !swapping
    && !$("spreadList").classList.contains("chosen")) glintSpreads();
}
setTimeout(() => { glintIfIdle(); setInterval(glintIfIdle, 5000); }, 700);

// The on/off switches under the spreads: two small pills, each with a
// little drawing of what it does, its name and a short line, and a small
// sliding switch that lights gold when on. (Each is still a checkbox
// inside, for keys and screen readers.)
const OPTION_ICONS = {
  // a crown
  court: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 15.5h14M3.6 13.5 2.5 6.5l4.3 3.3L10 4.2l3.2 5.6 4.3-3.3-1.1 7z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><circle cx="10" cy="3.4" r=".9" fill="currentColor"/></svg>',
  // a card standing upside down, with a turning arrow
  reversals: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="6" y="3" width="8" height="13" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M10 12.8 8.3 10h3.4z" fill="currentColor"/><path d="M3.2 8.5a7 7 0 0 1 2-4.3M2.4 5.8l.8 2.8 2.7-.9" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};
OPTIONS.forEach((o) => {
  const row = el("label", "option");
  row.title = o.note;
  const icon = el("span", "option-icon");
  icon.innerHTML = OPTION_ICONS[o.id] || "";
  const text = el("span", "option-text");
  text.append(el("span", "option-name", o.name), el("span", "option-note", o.short));
  const box = el("input");
  box.type = "checkbox";
  box.className = "switch";
  box.id = `opt-${o.id}`;
  box.autocomplete = "off";   // stop the browser putting back old switch states
  box.dataset.opt = o.id;
  box.checked = SET[o.id];
  box.setAttribute("aria-description", o.note);
  row.classList.toggle("on", box.checked);
  box.addEventListener("change", () => {
    const before = todaysCard();
    SET[o.id] = box.checked;
    row.classList.toggle("on", box.checked);
    saveOptions();
    // The floating deck is only drawn again if today's card has stopped
    // (or started) counting: a court card with court cards turned off, say.
    // Otherwise it carries on floating as it was.
    const after = todaysCard();
    if (!!before !== !!after || before?.card !== after?.card || before?.reversed !== after?.reversed) buildFloatDeck();
  });
  const knob = el("span", "option-switch");
  knob.setAttribute("aria-hidden", "true");
  row.append(box, icon, text, knob);
  $("options").append(row);
});

// When the page is shown again (back button, reopened app), make the
// switches match what is saved, so what you see is what is used.
function syncOptions() {
  loadOptions();
  document.querySelectorAll("#options .switch").forEach((b) => {
    b.checked = SET[b.dataset.opt];
    b.closest(".option").classList.toggle("on", b.checked);
  });
  buildFloatDeck();
}
addEventListener("pageshow", syncOptions);

function showHome() {
  if (swapping) return;
  S = null;
  resetMagic();
  swapScreen($("table"), $("home"), () => {
    placeCotdWords();   // measured again now the home screen is showing
    window.scrollTo(0, 0);
    startSky();
  });
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

// ── The card of the day: a dawn ─────────────────────────
// As the middle card lifts, a warm glow rises behind it and a few embers
// drift up. As it turns over, the light bursts in a soft bloom and a halo of
// living light is released: a ring of warm amber light (layered, uneven,
// streaks of energy running round it, fine dust glittering along it, the
// world bending a little where it passes) that sweeps out across the whole
// screen, and inside it the night sky turns to a bright midday. The day
// holds a moment, then the whole sky drifts evenly into golden hour; then
// night falls, spreading softly out from the card to the corners: a wide,
// smooth front of dusk (indigo, violet, rose, a little amber), fine silvery
// stardust shimmering along it, and the stars waking one by one as it passes.
// The light round the card is drawn on two canvases in the floating deck
// (behind the cards, and in front); the day on one over the whole screen just
// above the stars; the halo on one over the whole screen, above it all.
const DAWN_PEAK = 650, DAWN_END = 4250;
// When things happen after the card turns (ms): the halo leaves the screen,
// golden hour, and the night falling.
const DUSK = { haloGone: 1280, gold: [1250, 2000], night: [1650, 3500] };

// Where the halo, the day and the night are, `t` ms in, for a halo released
// at C (on screen) from a card `h` tall: the halo's radius R and strength a;
// how far into golden hour the day is (gold, 0 to 1); and the night: where
// the middle of its front is (f) and how wide the front is (FW). Night is
// complete within f - FW/2, day still untouched beyond f + FW/2.
function haloState(t, C, W, H, h) {
  const burst = t - DAWN_PEAK;
  const far = Math.hypot(Math.max(C.x, W - C.x), Math.max(C.y, H - C.y)) + 80;
  const FW = Math.max(280, far * 0.6);
  if (burst < 0) return { R: 0, a: 0, far, FW, f: -FW, gold: 0, burst };
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const seg = (v, a, b) => clamp((v - a) / (b - a));
  const r0 = h * 0.55, u = seg(burst, 0, 1250);
  const R = r0 + (far + 140 - r0) * (1 - Math.pow(1 - u, 2.1));                   // quick at first, easing as it goes
  const a = Math.min(1, burst / 120) * (1 - seg(burst, 1000, DUSK.haloGone));       // fading as it leaves the screen
  const g = seg(burst, ...DUSK.gold), gold = g * g * (3 - 2 * g);
  // The night's front travels from just short of the card (so it begins as a
  // gentle dimming there, not an edge) to past the corners, easing in and out.
  const n = seg(burst, ...DUSK.night), nE = n * n * (3 - 2 * n);
  const f = -FW * 0.5 + (far + FW) * nE;
  return { R, a, far, FW, f, gold, burst };
}

// How much day is behind a point (x, y) on the screen, `t` ms in (0 at
// night, 1 in full day): the curve the day sky is drawn with (see daySky).
function dayAmount(t, C, W, H, h, x, y) {
  const s = haloState(t, C, W, H, h);
  if (s.R <= 0) return 0;
  const smooth = (v) => { v = Math.min(1, Math.max(0, v)); return v * v * v * (v * (6 * v - 15) + 10); };
  const r = Math.hypot(x - C.x, y - C.y), ew = Math.max(40, s.R * 0.07);
  return smooth((r - (s.f - s.FW / 2)) / s.FW) * (1 - smooth((r - (s.R - ew)) / ew));
}

// One moment of the light round the card, `t` ms in, for a card `h` tall,
// centred on 0, 0: back(ctx) draws what's behind the cards, front(ctx) what's
// in front. `motes` is the embers, made once (see dawnMotes).
function dawnFrame(t, h, motes) {
  const TAU = Math.PI * 2;
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const seg = (v, a, b) => clamp((v - a) / (b - a));
  const ease = (v) => 1 - Math.pow(1 - v, 3);
  const rise = ease(seg(t, 0, DAWN_PEAK));
  const glow = rise * (1 - ease(seg(t, DAWN_PEAK + 300, DAWN_PEAK + DUSK.gold[1])));
  const burst = t >= DAWN_PEAK ? t - DAWN_PEAK : -1;
  const flare = burst < 0 ? 0 : Math.exp(-Math.pow((burst - 120) / 380, 2));
  return {
    back(ctx) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      // A warm glow behind the card: a perfect circle, centred on it, coming up.
      ctx.save();
      const R = h * 1.5, g = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
      g.addColorStop(0, `rgba(255, 238, 205, ${0.45 * glow})`);
      g.addColorStop(0.22, `rgba(255, 196, 120, ${0.3 * glow})`);
      g.addColorStop(0.55, `rgba(236, 130, 80, ${0.12 * glow})`);
      g.addColorStop(1, "rgba(200, 90, 110, 0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
      ctx.restore();
      // A small sun behind the card.
      const core = glow * 0.7 + flare * 0.6;
      const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, h * 0.5);
      sg.addColorStop(0, `rgba(255, 252, 240, ${Math.min(1, 0.85 * core)})`);
      sg.addColorStop(0.25, `rgba(255, 226, 165, ${0.45 * core})`);
      sg.addColorStop(1, "rgba(255, 190, 110, 0)");
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(0, 0, h * 0.5, 0, TAU); ctx.fill();
      ctx.restore();
    },
    front(ctx) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      if (burst >= 0) {
        // A soft bloom as it turns.
        const b = seg(burst, 0, 480), bR = h * (0.4 + 1 * ease(b)), ba = 0.6 * Math.pow(1 - b, 1.8);
        if (ba > 0.01) {
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, bR);
          g.addColorStop(0, `rgba(255, 250, 236, ${ba})`);
          g.addColorStop(0.35, `rgba(255, 224, 160, ${ba * 0.5})`);
          g.addColorStop(1, "rgba(255, 190, 110, 0)");
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(0, 0, bR, 0, TAU); ctx.fill();
        }
        // A faint level streak of light across it.
        const st = seg(burst, 0, 600), sta = 0.3 * Math.pow(1 - st, 1.8);
        if (sta > 0.01) {
          const L = h * (1 + 1 * ease(st));
          ctx.save();
          ctx.scale(1, 0.04);
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, L);
          g.addColorStop(0, `rgba(255, 248, 232, ${sta})`);
          g.addColorStop(0.4, `rgba(255, 214, 150, ${sta * 0.4})`);
          g.addColorStop(1, "rgba(255, 190, 120, 0)");
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(0, 0, L, 0, TAU); ctx.fill();
          ctx.restore();
        }
      }
      // The embers: warm motes, a few rising before the turn, a shower after
      // it, the odd larger, softer one, all drifting up and twinkling.
      motes.forEach((m) => {
        const age = t - m.born;
        if (age < 0 || age > m.life) return;
        const u = age / m.life;
        const k = 1 - Math.exp(-age / m.drag);
        const x = m.x + m.vx * k * m.drag / 1000 + Math.sin(age / 500 + m.ph) * 4;
        const y = m.y + m.vy * k * m.drag / 1000 - age * m.lift / 1000;
        const a = Math.sin(Math.PI * Math.min(1, u * 1.2)) * (0.6 + 0.4 * Math.sin(age / 90 + m.ph)) * m.a * (m.big ? 0.45 : 1);
        if (a <= 0.02) return;
        const r = m.r * (m.big ? 4 : 1.6 + 0.6 * a);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.4);
        g.addColorStop(0, `rgba(255, 244, 215, ${a})`);
        g.addColorStop(0.35, `rgba(255, 196, 110, ${a * 0.5})`);
        g.addColorStop(1, "rgba(250, 150, 70, 0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, TAU); ctx.fill();
      });
      ctx.restore();
    },
  };
}

// The day, on the canvas over the whole screen just above the stars: a
// bright blue midday sky, deepest at the top and paler towards the bottom,
// the sun's white light round the card. It holds, then the whole sky drifts
// evenly into golden hour (the sun's light fading where it is, not
// shrinking). Then night falls from the card: the day gives way across a
// wide, smooth front (no edges anywhere: every gradient follows a smooth
// curve), tinted with dusk (indigo, violet, rose, a little amber); fine
// silvery stardust shimmers along the front, and the stars wake one by one,
// each with a small glint, as it passes them.
function daySky(ctx, t, W, H, C, h, keep = {}) {
  const s = haloState(t, C, W, H, h);
  if (s.R <= 0 || s.f - s.FW / 2 >= s.far) return;
  const TAU = Math.PI * 2;
  const mix = (p, q, k) => p.map((v, i) => v + (q[i] - v) * k);
  const rgba = (c, a = c[3]) => `rgba(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])}, ${Math.max(0, a).toFixed(3)})`;
  const smooth = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * x * (x * (6 * x - 15) + 10); };   // softer than smoothstep at both ends
  // Midday, and golden hour, evenly across the sky.
  const noon = [[38, 112, 214, 0.94], [78, 150, 230, 0.9], [140, 196, 240, 0.86], [196, 226, 248, 0.82]];
  const eve = [[74, 104, 176, 0.92], [236, 168, 96, 0.86], [232, 118, 72, 0.84], [168, 72, 86, 0.82]];
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  [0, 0.4, 0.75, 1].forEach((o, i) => sky.addColorStop(o, rgba(mix(noon[i], eve[i], s.gold))));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  // The sun round the card: white at midday, warmer and fading at golden hour.
  const sunA = 1 - 0.85 * s.gold, sunR = Math.max(W, H) * 0.7;
  const core = mix([255, 255, 248], [255, 206, 140], s.gold), mid = mix([236, 246, 255], [255, 170, 100], s.gold);
  const sun = ctx.createRadialGradient(C.x, C.y, 0, C.x, C.y, sunR);
  sun.addColorStop(0, rgba(core, 0.55 * sunA));
  sun.addColorStop(0.3, rgba(mid, 0.18 * sunA));
  sun.addColorStop(1, rgba(mid, 0));
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  // Where the day still is: none within the night, all of it beyond its
  // front, a smooth curve across the front (and while the halo is still on
  // the screen, only within it).
  const ew = Math.max(40, s.R * 0.07);
  const Rg = Math.max(s.far + s.FW, s.R + ew), N = 28;
  const dayAt = (r) => smooth((r - (s.f - s.FW / 2)) / s.FW) * (1 - smooth((r - (s.R - ew)) / ew));
  const m = ctx.createRadialGradient(C.x, C.y, 0, C.x, C.y, Rg);
  for (let i = 0; i <= N; i++) m.addColorStop(i / N, `rgba(0, 0, 0, ${dayAt((Rg * i) / N).toFixed(4)})`);
  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = m;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  // The dusk along the front: swelling and fading across it, deep indigo on
  // the night's side, through violet and rose, to a little amber on the day's.
  if (s.f + s.FW / 2 > 0) {
    const cols = [[30, 22, 70], [78, 48, 128], [160, 72, 124], [226, 128, 82]];
    const tint = ctx.createRadialGradient(C.x, C.y, 0, C.x, C.y, Rg);
    for (let i = 0; i <= N; i++) {
      const x = ((Rg * i) / N - (s.f - s.FW / 2)) / s.FW;        // across the front, 0 (night) to 1 (day)
      const bell = x <= 0 || x >= 1 ? 0 : Math.pow(Math.sin(Math.PI * x), 1.5);
      const c = x <= 0 ? cols[0] : x >= 1 ? cols[3] : (() => { const p = x * 3, k = Math.min(2, Math.floor(p)); return mix(cols[k], cols[k + 1], p - k); })();
      tint.addColorStop(i / N, rgba(c, 0.42 * bell));
    }
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, W, H);
  }
  // Stardust shimmering along the front, and the stars waking as it passes.
  if (!keep.dust) {
    const r = (a, b) => a + Math.random() * (b - a);
    keep.dust = Array.from({ length: 220 }, () => ({ q: r(0, TAU), d: (Math.random() + Math.random() - 1) * 0.5, s: r(0.5, 1.4), ph: r(0, 6), tw: r(110, 300) }));
    keep.stars = Array.from({ length: 120 }, () => ({ x: r(0, W), y: r(0, H), s: r(0.6, 1.5), lag: r(0, 0.25) }));
    const dot = (inner, mid) => {
      const c = document.createElement("canvas"); c.width = c.height = 48;
      const x = c.getContext("2d"), g = x.createRadialGradient(24, 24, 0, 24, 24, 24);
      g.addColorStop(0, inner); g.addColorStop(0.25, mid); g.addColorStop(1, "rgba(200, 190, 255, 0)");
      x.fillStyle = g; x.fillRect(0, 0, 48, 48);
      return c;
    };
    keep.sparkle = dot("rgba(250, 248, 255, 1)", "rgba(210, 200, 255, .45)");
  }
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  keep.dust.forEach((d) => {
    const rr = s.f + d.d * s.FW * 0.6, x = C.x + Math.cos(d.q) * rr, y = C.y + Math.sin(d.q) * rr;
    if (rr <= 0 || x < -10 || y < -10 || x > W + 10 || y > H + 10) return;
    const across = 1 - Math.abs(d.d) * 2;
    const al = across * (0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(t / d.tw + d.ph), 3)) * 0.8;
    if (al < 0.03) return;
    const sz = d.s * 4;
    ctx.globalAlpha = al;
    ctx.drawImage(keep.sparkle, x - sz, y - sz, sz * 2, sz * 2);
  });
  keep.stars.forEach((st) => {
    const dist = Math.hypot(st.x - C.x, st.y - C.y);
    const since = (s.f - dist) / s.FW - st.lag;   // how far behind the front's middle it now is
    if (since <= 0 || since > 0.9) return;
    const glint = Math.exp(-Math.pow((since - 0.12) / 0.1, 2)), rest = smooth(since / 0.3) * (1 - smooth((since - 0.5) / 0.4));
    const al = 0.7 * glint + 0.25 * rest;
    if (al < 0.03) return;
    const sz = st.s * (2 + 3 * glint);
    ctx.globalAlpha = Math.min(1, al);
    ctx.drawImage(keep.sparkle, st.x - sz, st.y - sz, sz * 2, sz * 2);
  });
  ctx.globalAlpha = 1;
  ctx.restore();
}

// The halo, on the canvas over the whole screen above it all: a ring of
// warm living light (a wide soft amber glow, a gold band, a thin hot core;
// uneven, in patches that drift, its edge rippling a little), a warmth just
// inside it and a violet glow just beyond, streaks of energy running round
// it, and fine dust glittering along it.
function haloLight(ctx, t, W, H, C, h, keep) {
  const s = haloState(t, C, W, H, h);
  if (s.a <= 0.01) return;
  const TAU = Math.PI * 2, R = s.R, a = s.a, tt = (t - DAWN_PEAK) / 1000;
  if (!keep.glint) {
    const r = (x, y) => x + Math.random() * (y - x);
    keep.glint = Array.from({ length: 300 }, () => ({ q: r(0, TAU), d: (Math.random() + Math.random() + Math.random() - 1.5) * 50, s: r(0.5, 1.6), ph: r(0, 6), tw: r(120, 380) }));
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255, 252, 235, 1)");
    g.addColorStop(0.2, "rgba(255, 220, 150, .7)");
    g.addColorStop(0.5, "rgba(255, 170, 80, .18)");
    g.addColorStop(1, "rgba(255, 150, 60, 0)");
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    keep.spark = c;
  }
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  // A warmth just inside the ring, and a violet glow just beyond it.
  const band = Math.max(60, R * 0.12);
  const inner = ctx.createRadialGradient(C.x, C.y, Math.max(0, R - band), C.x, C.y, R);
  inner.addColorStop(0, "rgba(255, 190, 110, 0)");
  inner.addColorStop(1, `rgba(255, 196, 120, ${0.22 * a})`);
  ctx.fillStyle = inner;
  ctx.beginPath(); ctx.arc(C.x, C.y, R, 0, TAU); ctx.arc(C.x, C.y, Math.max(0, R - band), 0, TAU, true); ctx.fill();
  const outer = ctx.createRadialGradient(C.x, C.y, R, C.x, C.y, R + band * 0.9);
  outer.addColorStop(0, `rgba(190, 90, 215, ${0.16 * a})`);
  outer.addColorStop(1, "rgba(150, 60, 200, 0)");
  ctx.fillStyle = outer;
  ctx.beginPath(); ctx.arc(C.x, C.y, R + band * 0.9, 0, TAU); ctx.arc(C.x, C.y, R, 0, TAU, true); ctx.fill();
  // The ring itself, uneven and rippling.
  const lit = (q) => (0.55 + 0.45 * Math.pow(0.5 + 0.5 * Math.cos(q + Math.PI / 2), 1.4))
    * (0.72 + 0.18 * Math.sin(3 * q + tt * 2.3) + 0.1 * Math.sin(7 * q - tt * 3.7));
  const edge = new Path2D(), steps = 180;
  for (let i = 0; i <= steps; i++) {
    const q = (i / steps) * TAU, rr = R * (1 + 0.004 * Math.sin(5 * q + tt * 4) + 0.002 * Math.sin(11 * q - tt * 6));
    i ? edge.lineTo(C.x + Math.cos(q) * rr, C.y + Math.sin(q) * rr) : edge.moveTo(C.x + Math.cos(q) * rr, C.y + Math.sin(q) * rr);
  }
  edge.closePath();
  const tone = (rgb, k) => {
    if (!ctx.createConicGradient) return `rgba(${rgb}, ${k * 0.6})`;
    const g = ctx.createConicGradient(0, C.x, C.y);
    for (let i = 0; i <= 24; i++) g.addColorStop(i / 24, `rgba(${rgb}, ${Math.min(1, k * lit((i / 24) * TAU))})`);
    return g;
  };
  ctx.lineJoin = "round";
  ctx.save();
  ctx.shadowColor = `rgba(255, 140, 50, ${0.6 * a})`;
  ctx.shadowBlur = 22;
  ctx.strokeStyle = tone("255, 150, 60", 0.32 * a);
  ctx.lineWidth = 14;
  ctx.stroke(edge);
  ctx.restore();
  ctx.strokeStyle = tone("255, 196, 110", 0.6 * a);
  ctx.lineWidth = 3.2;
  ctx.stroke(edge);
  ctx.strokeStyle = tone("255, 236, 190", 0.85 * a);
  ctx.lineWidth = 1.1;
  ctx.stroke(edge);
  // Streaks of energy running round it.
  for (let k = 0; k < 10; k++) {
    const hsh = (m) => { const v = Math.sin(k * 91.7 + m * 47.3) * 43758.5453; return v - Math.floor(v); };
    const from = hsh(4) * TAU + tt * (0.5 + 1.2 * hsh(5)) * (k % 2 ? 1 : -1), span = 0.25 + 0.5 * hsh(6);
    const rr = R * (0.985 + 0.03 * hsh(3)), al = a * (0.3 + 0.45 * hsh(7));
    if (ctx.createConicGradient) {
      const g = ctx.createConicGradient(from, C.x, C.y), f = span / TAU;
      g.addColorStop(0, "rgba(255, 230, 180, 0)");
      g.addColorStop(f * 0.55, `rgba(255, 228, 175, ${al})`);
      g.addColorStop(f, "rgba(255, 210, 150, 0)");
      g.addColorStop(1, "rgba(255, 210, 150, 0)");
      ctx.strokeStyle = g;
    } else ctx.strokeStyle = `rgba(255, 228, 175, ${al * 0.5})`;
    ctx.lineWidth = 1 + 1.5 * hsh(8);
    ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(C.x, C.y, rr, from, from + span); ctx.stroke();
  }
  // Fine dust glittering along it.
  keep.glint.forEach((g) => {
    const rr = R + g.d, x = C.x + Math.cos(g.q) * rr, y = C.y + Math.sin(g.q) * rr;
    if (x < -10 || y < -10 || x > W + 10 || y > H + 10) return;
    const al = a * (1 - Math.abs(g.d) / 80) * (0.4 + 0.6 * Math.pow(0.5 + 0.5 * Math.sin((t / g.tw) + g.ph), 3));
    if (al < 0.03) return;
    const sz = g.s * 5;
    ctx.globalAlpha = Math.min(1, al);
    ctx.drawImage(keep.spark, x - sz, y - sz, sz * 2, sz * 2);
  });
  ctx.globalAlpha = 1;
  ctx.restore();
}

// The dust for a dawn, for a card `h` tall: a few motes rising before the
// turn, and the shower that bursts out as it turns.
function dawnMotes(h) {
  const r = (a, b) => a + Math.random() * (b - a);
  const motes = [];
  for (let i = 0; i < 10; i++) {   // rising through the beams
    motes.push({ born: r(0, 450), life: r(1200, 1900), x: r(-0.6, 0.6) * h, y: r(0.3, 0.7) * h,
      vx: 0, vy: 0, drag: 400, lift: r(30, 60), r: r(0.7, 1.3), a: r(0.35, 0.7), ph: r(0, 6) });
  }
  for (let i = 0; i < 6; i++) {    // a few large, soft ones (like light out of focus)
    const ang = r(0, Math.PI * 2), sp = r(40, 140) * (h / 180);
    motes.push({ born: DAWN_PEAK + r(40, 220), life: r(1300, 1900), x: Math.cos(ang) * h * 0.3, y: Math.sin(ang) * h * 0.3,
      vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * 0.7, drag: 500, lift: r(10, 25), r: r(1.6, 2.6), a: r(0.5, 0.9), ph: r(0, 6), big: true });
  }
  for (let i = 0; i < 46; i++) {   // the shower
    const ang = r(0, Math.PI * 2), sp = r(90, 320) * (h / 180);
    motes.push({ born: DAWN_PEAK + r(0, 90), life: r(1100, 1800), x: Math.cos(ang) * h * 0.15, y: Math.sin(ang) * h * 0.2,
      vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * 0.75, drag: r(260, 420), lift: r(14, 36), r: r(0.6, 1.4), a: r(0.55, 1), ph: r(0, 6) });
  }
  return motes;
}

// The dawn round the middle card of the floating deck. Resolves at its
// peak, when the card should turn; the light carries on and fades by itself.
function dawnReveal(mid) {
  const deck = $("floatDeck"), d = deck.getBoundingClientRect(), b = mid.getBoundingClientRect();
  // Where the card will be once lifted (.fd-card.lift: up 16px, 1.12 times
  // as big, from a point half its height below it), within the deck's box.
  const h = b.height * 1.12;
  const cx = b.left + b.width / 2 - d.left, cy = b.top + b.height / 2 - 0.12 * b.height - 16 - d.top;
  // The light round the card: room for its glow, never more than about 1400
  // pixels across (it's soft, and a phone has to keep up).
  const S = Math.ceil(h * 4.4), k = Math.min(devicePixelRatio || 1, 1.5, 1400 / S);
  const layer = (z) => {
    const c = document.createElement("canvas");
    c.className = "dawn-fx";
    c.width = c.height = Math.ceil(S * k);
    Object.assign(c.style, { left: `${cx - S / 2}px`, top: `${cy - S / 2}px`, width: `${S}px`, height: `${S}px`, zIndex: z });
    return c;
  };
  const back = layer(0), front = layer(5);
  deck.append(back, front);   // (after the cards, so they keep their places; the stacking does the rest)
  const bx = back.getContext("2d"), fx = front.getContext("2d"), motes = dawnMotes(h);
  // The day (just above the stars, below everything else) and the halo (above
  // it all), each over the whole screen; and the band at the halo's rim that
  // bends what it passes over, like light through glass.
  const W = innerWidth, Hs = innerHeight, C = { x: b.left + b.width / 2, y: cy + d.top };
  const sk = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(2.6e6 / (W * Hs)));
  const screen = (cls) => {
    const c = document.createElement("canvas");
    c.className = cls;
    c.width = Math.ceil(W * sk); c.height = Math.ceil(Hs * sk);
    return c;
  };
  const sky = screen("sky dawn-sky"), halo = screen("dawn-halo");
  halo.style.zIndex = ++Z;
  $("sky").after(sky);
  document.body.append(halo);
  const lens = document.createElement("div");
  lens.className = "dawn-lens";
  Object.assign(lens.style, { left: `${C.x}px`, top: `${C.y}px`, zIndex: Z, opacity: 0 });
  document.body.append(lens);
  const sx = sky.getContext("2d"), hx = halo.getContext("2d"), haloKeep = {}, skyKeep = {};
  // The stars fade while it's day; as the night comes back they're there
  // again behind it (the day still covers them beyond it).
  const at = (ms) => Math.min(1, ms / DAWN_END);
  $("sky").animate([{ opacity: 1 }, { opacity: 1, offset: at(DAWN_PEAK) }, { opacity: 0.12, offset: at(DAWN_PEAK + 500) },
    { opacity: 0.12, offset: at(DAWN_PEAK + DUSK.night[0]) }, { opacity: 1, offset: at(DAWN_PEAK + DUSK.night[0] + 700) }, { opacity: 1 }],
    { duration: DAWN_END, easing: "ease-in-out" });
  // The rest of the fan dims a little while the card is revealed, and as
  // the halo is released its edges catch the warm light, then lose it.
  [...deck.children].forEach((c, i) => {
    if (c === mid || !c.classList.contains("fd-card")) return;
    c.querySelector(".fd-flip")?.animate([{ opacity: 1 }, { opacity: 0.55, offset: 0.25 }, { opacity: 0.55, offset: 0.6 }, { opacity: 1 }],
      { duration: 1800, easing: "ease-in-out" });
    const base = "0 4px 12px rgba(0, 0, 0, .45)";
    c.querySelector(".fd-flip > .cback")?.animate([
      { boxShadow: `${base}, 0 0 0 rgba(255, 170, 80, 0), inset 0 0 0 rgba(255, 190, 110, 0)` },
      { boxShadow: `${base}, 0 0 18px 2px rgba(255, 170, 80, .5), inset 0 0 16px rgba(255, 190, 110, .3)`, offset: 0.25 },
      { boxShadow: `${base}, 0 0 0 rgba(255, 170, 80, 0), inset 0 0 0 rgba(255, 190, 110, 0)` },
    ], { duration: 1700, delay: DAWN_PEAK + 60 + Math.abs(i - 2) * 40, easing: "ease-out" });
  });
  setTimeout(() => {
    mid.querySelector(".fd-flip > .cface")?.animate([{ boxShadow: "0 0 14px 3px rgba(255, 214, 130, .55)" },
      { boxShadow: "0 0 22px 6px rgba(255, 210, 130, .7)", offset: 0.4 }, { boxShadow: "0 0 14px 3px rgba(255, 214, 130, .55)" }],
      { duration: 1100, easing: "ease-in-out" });
  }, DAWN_PEAK + DUSK.night[0] - 150);
  // The home screen's words and lines darken towards ink where the day
  // reaches them (and back as the night comes), so they stay readable on the
  // bright sky: each gets --day, how much day is behind it (see style.css).
  const ui = "#home .home-head h1, #cotd, #cotdReset, #home .home-sub, .spread-btn, #home .home-links .pill, #homeNudge, .option, .fd-word";
  const shadeForDay = (t) => document.querySelectorAll(ui).forEach((el) => {
    const r = el.getBoundingClientRect();
    if (!r.width) return;
    const v = dayAmount(t, C, W, Hs, h, r.left + r.width / 2, r.top + r.height / 2);
    if (v > 0.002) el.style.setProperty("--day", v.toFixed(3));
    else el.style.removeProperty("--day");
  });
  const all = [back, front, sky, halo, lens];
  const done = () => {
    all.forEach((n) => n.remove());
    document.querySelectorAll(ui).forEach((el) => el.style.removeProperty("--day"));
  };
  const t0 = performance.now();
  const frame = (now) => {
    const t = now - t0;
    if (t > DAWN_END || !back.isConnected) { done(); return; }
    [[sx, sky], [hx, halo]].forEach(([x, c]) => {
      x.setTransform(1, 0, 0, 1, 0, 0);
      x.clearRect(0, 0, c.width, c.height);
      x.setTransform(sk, 0, 0, sk, 0, 0);
    });
    daySky(sx, t, W, Hs, C, h, skyKeep);
    haloLight(hx, t, W, Hs, C, h, haloKeep);
    shadeForDay(t);
    const s = haloState(t, C, W, Hs, h), lr = s.R * 1.08;
    lens.style.width = lens.style.height = `${(2 * lr).toFixed(1)}px`;
    lens.style.opacity = s.a.toFixed(3);
    const f = dawnFrame(t, h, motes);
    [[bx, f.back], [fx, f.front]].forEach(([x, draw]) => {
      x.setTransform(1, 0, 0, 1, 0, 0);
      x.clearRect(0, 0, x.canvas.width, x.canvas.height);
      x.setTransform(k, 0, 0, k, (S / 2) * k, (S / 2) * k);
      draw(x);
    });
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  setTimeout(done, DAWN_END + 100);   // (even if frames are paused)
  return wait(DAWN_PEAK);
}

// First tap: the card rises in a warm glow and turns over, releasing a halo that turns night to day.
// After that, a tap opens the card's page.
async function revealCardOfTheDay() {
  if (fdBusy) return;
  const today = todaysCard();
  if (today) {
    // Its page opens out of the card, through a ring of runes, and goes back into it.
    const flip = $("floatDeck").children[2]?.querySelector(".fd-flip");
    ringTap(flip, flip?.querySelector(".cface"));
    openDetails([detailsItem(today.card, today.reversed, "Card of the day")]);
    return;
  }
  fdBusy = true;
  const pick = drawCardOfTheDay();
  setFdFace(pick);
  const mid = $("floatDeck").children[2];
  const label = $("cotd");
  label.classList.add("fade");
  mid.classList.add("lift");
  if (!calm) await dawnReveal(mid);
  mid.classList.add("turned", "revealed");
  if (!calm) cardFlare(mid.querySelector(".fd-flip > .cface"), 250);
  revealTitle(pick.card.name, pick.reversed ? "Card of the day · Reversed" : "Card of the day",
    mid.getBoundingClientRect().top - 4, document.querySelector(".home-head h1").getBoundingClientRect().bottom);
  showCotdLabel(pick);
  showCotdWords(pick, true);
  label.classList.remove("fade");
  await wait(700);
  fdBusy = false;
}

$("floatDeck").addEventListener("click", revealCardOfTheDay);

// TEMPORARY, for testing the reveal: forgets today's card (and its entry in
// the history), so it can be revealed again. Remove with its button in index.html.
function resetCardOfTheDay() {
  if (fdBusy) return;
  try { localStorage.removeItem("tarot-cotd"); } catch {}
  const today = new Date().toDateString();
  loadHistory().filter((r) => r.spread === COTD_SPREAD && new Date(r.t).toDateString() === today)
    .forEach((r) => removeReading(r.id));
  buildFloatDeck();
  placeCotdWords();
}
$("cotdReset").addEventListener("click", resetCardOfTheDay);
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
  }), reading.readingId || reading);
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
