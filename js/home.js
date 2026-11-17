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

// The arcane reveal of the card of the day, around the middle card as it
// lifts: the other cards dim, a great ring of runes snaps in round it and
// turns, and gold motes spiral in from the ring to its heart. Resolves at
// the peak, when the card should turn; then the ring flashes outward and
// fades, and sparks scatter from the card.
function arcaneReveal(mid) {
  const b = mid.getBoundingClientRect();
  // Where the card will be once lifted (.fd-card.lift: up 16px, 1.12 times
  // as big, from a point half its height below it).
  const C = { x: b.left + b.width / 2, y: b.top + b.height / 2 - 0.12 * b.height - 16 };
  const R = (Math.hypot(b.width, b.height) / 2) * 1.12 * 1.3;
  const PEAK = 620;
  // The rest of the fan dims while the card is revealed.
  [...$("floatDeck").children].forEach((c) => {
    if (c === mid || !c.classList.contains("fd-card")) return;
    c.querySelector(".fd-flip")?.animate([{ opacity: 1 }, { opacity: 0.45, offset: 0.25 }, { opacity: 0.45, offset: 0.7 }, { opacity: 1 }],
      { duration: 1500, easing: "ease-in-out" });
  });
  // The ring snaps in, turning, and keeps turning; at the peak it flashes
  // outward and fades.
  const ring = runeRing(C, R);
  ring.animate([
    { transform: `${ring.at(R * 1.7)} rotate(-90deg)`, opacity: 0, filter: "brightness(1)" },
    { transform: `${ring.at(R)} rotate(0deg)`, opacity: 1, filter: "brightness(1)", offset: 0.3 },
    { transform: `${ring.at(R * 0.97)} rotate(25deg)`, opacity: 1, filter: "brightness(1.3)", offset: 0.55 },
    { transform: `${ring.at(R * 1.05)} rotate(35deg)`, opacity: 1, filter: "brightness(2)", offset: 0.62 },
    { transform: `${ring.at(R * 1.7)} rotate(60deg)`, opacity: 0, filter: "brightness(1)" },
  ], { duration: 1000, delay: 100, easing: "cubic-bezier(.3, .6, .3, 1)", fill: "both" });
  setTimeout(() => ring.remove(), 1150);
  // Motes spiral in from the ring to the card's heart.
  const mote = (from, to, ms, delay, size = 1) => {
    const m = el("span", "theme-mote");
    Object.assign(m.style, { left: `${C.x}px`, top: `${C.y}px`, zIndex: Z + 1 });
    document.body.append(m);
    m.animate([
      { transform: `translate(${from[0]}px, ${from[1]}px) scale(${size})`, opacity: 0 },
      { opacity: 1, offset: 0.25 },
      { transform: `translate(${to[0]}px, ${to[1]}px) scale(${size * 0.35})`, opacity: 0 },
    ], { duration: ms, delay, easing: "cubic-bezier(.5, 0, .5, 1)", fill: "both" });
    setTimeout(() => m.remove(), ms + delay + 20);
  };
  const polar = (r, t) => [Math.cos(t) * r, Math.sin(t) * r];
  for (let i = 0; i < 16; i++) {
    const t = (i / 16) * Math.PI * 2;
    const m = el("span", "theme-mote");
    Object.assign(m.style, { left: `${C.x}px`, top: `${C.y}px`, zIndex: Z + 1 });
    document.body.append(m);
    const pts = [polar(R, t), polar(R * 0.7, t + 0.6), polar(R * 0.35, t + 1.2), [0, 0]];
    const delay = 200 + (i % 4) * 45;
    m.animate([
      { transform: `translate(${pts[0][0]}px, ${pts[0][1]}px) scale(1.2)`, opacity: 0 },
      { transform: `translate(${pts[1][0]}px, ${pts[1][1]}px) scale(1)`, opacity: 1 },
      { transform: `translate(${pts[2][0]}px, ${pts[2][1]}px) scale(.7)`, opacity: 1 },
      { transform: "translate(0, 0) scale(.3)", opacity: 0 },
    ], { duration: PEAK - delay, delay, easing: "cubic-bezier(.4, 0, .6, 1)", fill: "both" });
    setTimeout(() => m.remove(), PEAK + 20);
  }
  // At the peak, sparks scatter from the card as it turns.
  setTimeout(() => {
    for (let i = 0; i < 14; i++) {
      const t = (i / 14) * Math.PI * 2 + Math.random() * 0.3;
      mote([0, 0], polar(R * (0.9 + Math.random() * 0.6), t), 520 + Math.random() * 260, 0, 1.3);
    }
  }, PEAK);
  return wait(PEAK);
}

// First tap: the card rises inside a ring of runes and turns over.
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
  if (!calm) await arcaneReveal(mid);
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
