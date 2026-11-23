// The table's magic: flights, runes and glows.
// Part of the app; the files in js/ load in the order listed in index.html.

// ── The table's magic ───────────────────────────────────
// Drawn on a canvas behind the cards, faint enough never to compete
// with them. A revealed card gets a burst of light and a slowly turning
// ring of runes; energy then travels along a line to the next card.
// Once every card is turned, threads from all of them meet in the
// middle and a great rune circle forms around the spread, turning for
// as long as the reading stays open.

// Runes as little line drawings (in a 12 × 16 box), so every phone shows them:
// flowing, calligraphic marks, many with a dot of light beside them.
const dot = (x, y, r = 0.55) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
const RUNE_D = [
  "M9 2C2 3 2 13 9 14" + dot(7, 8),                                   // crescent and star
  "M6 8C1 6 2 0 6 1C10 2 9 6 6 8C2 10 2 16 6 15C10 14 10 10 6 8",      // the knot
  "M9 5C9 1 3 1 3 5C3 8 9 8 9 5C9 10 7 14 3 16",                      // the hook
  "M2 14L10 2" + dot(9, 10),                                          // the shard
  "M9 2C4 2 4 7 7 7C3 7 3 13 9 13M2 1L11 15",                         // the struck echo
  "M6 1L11 8L6 15L1 8ZM6 5L8 8L6 11L4 8Z",                            // the seal
  "M9 1C5 1 5 6 6 9C7 12 5 15 2 14" + dot(9, 12),                     // the long s
  "M1 4L5 14L11 1M3 9H9",                                             // the barred check
  "M2 3C2 10 10 10 10 3M6 1V15M3 15H9",                               // the trident
  "M4 1C10 4 10 12 3 15" + dot(3, 7),                                 // the turned j
  "M6 1C1 5 1 11 3 15M6 1C11 5 11 11 9 15M6 4V8" + dot(6, 11, 1.5),   // the arch and orb
  "M3 1V9C3 15 10 15 10 9V5" + dot(6, 5),                             // the cup
  "M2 3L7 8L2 13M6 3L11 8L6 13",                                      // the twin chevron
  "M1 2C4 6 5 10 6 15C7 9 9 4 12 3" + dot(10, 9),                     // the reed
  "M6 15V7C6 2 1 1 1 5M6 7C6 2 11 1 11 5",                            // the horns
  "M10 3C5 0 2 5 6 8C10 11 7 16 2 13" + dot(10, 14),                  // the serpent
  "M3 15V5C3 1 9 1 9 5C9 8 5 8 5 5",                                  // the curl
  "M2 9V5C2 1 10 1 10 5V9M6 1V15M4 12H8",                             // the gate
];
const RUNES = RUNE_D.map((d) => new Path2D(d));
const SEAL = 5;

const GOLD = "201, 169, 110";
const MG = { cv: null, ctx: null, running: false, cards: [], travels: [], links: [], finale: 0, w: 0, h: 0,
  flyers: [], ghosts: [], flares: [], motes: [], steps: [] };

// How strongly each picked card's ring shows: its turning runes and its
// dotted ring (tuned in labs/arcane-lab.html).
const CARD_RING = { runes: 1.616, dots: 0.436 };

function sizeMagic() {
  const c = $("magic");
  const r = Math.min(devicePixelRatio || 1, 2);
  MG.w = innerWidth; MG.h = innerHeight;
  c.width = MG.w * r;
  c.height = MG.h * r;
  MG.cv = c;
  MG.ctx = c.getContext("2d");
  MG.ctx.setTransform(r, 0, 0, r, 0, 0);
  // The top layer, above the cards (the flights' sparks).
  MG.r = r;
  const f = $("frames");
  f.width = c.width;
  f.height = c.height;
  MG.frx = f.getContext("2d");
  MG.frx.setTransform(r, 0, 0, r, 0, 0);
}

function resetMagic() {
  MG.cards = []; MG.travels = []; MG.links = []; MG.finale = 0; MG.great = null; MG.portal = false; MG.cover = null;
  MG.flyers = []; MG.ghosts = []; MG.flares = []; MG.motes = []; MG.steps = []; MG.total = 0; MG.waitAt = null; MG.burst = false;
  if (MG.ctx) MG.ctx.clearRect(0, 0, MG.w, MG.h);
  if (MG.frx) MG.frx.clearRect(0, 0, MG.w, MG.h);
}

// Picking a card: a small flare where it leaves the fan, a trail of
// sparks with circling runes while it flies, and a flare where it lands.
// Everything eases in and out, so nothing pops on or off.

function rectGeom(r) {
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, rx: r.width / 2, ry: r.height / 2 };
}

function magicFlight(flyer, fanCard) {
  if (!MG.ctx) sizeMagic();
  const now = performance.now();
  const from = rectGeom(fanCard.getBoundingClientRect());
  // A small sigil flares where the card leaves the fan, and sparks burst from it.
  MG.flares.push({ geom: () => from, at: now, dur: 700, runes: [], small: true });
  burstMotes(from.x, from.y, 14, Math.max(from.rx, from.ry) * 0.6);
  MG.flyers.push({ el: flyer, trail: [], at: now, runes: Array.from({ length: 6 }, () => rand(RUNES.length)) });
  startMagic();
}

function magicLand(i) {
  const now = performance.now();
  MG.flares.push({ geom: () => cardGeom(i), at: now, dur: 1300, runes: Array.from({ length: 8 }, () => rand(RUNES.length)) });
  const g = cardGeom(i);
  burstMotes(g.x, g.y, 26, Math.hypot(g.rx, g.ry) * 0.7);
  startMagic();
}

// Rises quickly, then fades slowly (p from 0 to 1).
const swell = (p, rise = 0.18) => (p < rise ? p / rise : Math.max(0, 1 - (p - rise) / (1 - rise)));

// The colours of the pick magic: mostly gold, with warm amber and a little arcane violet.
const MOTE_COLOURS = ["255, 226, 160", "255, 236, 200", "255, 190, 110", "200, 160, 255"];

// Sparks thrown out from a point, drifting and fading.
function burstMotes(x, y, n, r0) {
  const now = performance.now();
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + Math.random() * 0.4;
    const v = 0.05 + Math.random() * 0.09;
    MG.motes.push({ x: x + Math.cos(a) * r0, y: y + Math.sin(a) * r0, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.02,
      at: now, life: 600 + Math.random() * 600, r: 1 + Math.random() * 1.8, col: MOTE_COLOURS[k % MOTE_COLOURS.length] });
  }
}

// A perfect circle drawn in from the top, as far as `drawn` (0 to 1).
function sigilRing(ctx, x, y, R, drawn, alpha, width = 1.2) {
  ctx.strokeStyle = `rgba(255, 224, 165, ${alpha})`;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(x, y, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * drawn);
  ctx.stroke();
}

// The sparks streaming behind a flying card: a bright core with a warm halo.
function drawSparks(ctx, t, trail, alpha) {
  for (let k = 0; k < trail.length - 1; k++) {
    const q1 = trail[k], q2 = trail[k + 1];
    const steps = Math.max(1, Math.min(7, Math.round(Math.hypot(q2.x - q1.x, q2.y - q1.y) / 5)));
    for (let s = 0; s < steps; s++) {
      const u = s / steps, kk = k + u, fall = 1 - kk / trail.length;
      const a = alpha * fall;
      if (a <= 0.01) continue;
      const x = q1.x + (q2.x - q1.x) * u + Math.sin(t / 90 + kk * 2) * 5 * (1 - fall);
      const y = q1.y + (q2.y - q1.y) * u + Math.cos(t / 110 + kk * 2) * 5 * (1 - fall);
      const R = 7 * fall + 2;
      const halo = ctx.createRadialGradient(x, y, 0, x, y, R);
      halo.addColorStop(0, `rgba(255, 240, 205, ${0.75 * a})`);
      halo.addColorStop(0.4, `rgba(255, 190, 110, ${0.35 * a})`);
      halo.addColorStop(1, "rgba(200, 150, 255, 0)");
      ctx.fillStyle = halo;
      ctx.fillRect(x - R, y - R, R * 2, R * 2);
    }
  }
}

// The magic around a card in flight, drawn above the cards (the card itself
// still flies on top). Its trail and rune circle linger and fade once it lands.
function drawFlightsTop(ctx, t) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  MG.flyers = MG.flyers.filter((f) => {
    if (!f.el.isConnected) {
      MG.ghosts.push({ trail: f.trail, runes: f.runes, at: t, p: f.trail[0], R: f.R || 30 });
      return false;
    }
    const r = f.el.getBoundingClientRect();
    const p = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    f.trail.unshift(p);
    if (f.trail.length > 18) f.trail.pop();
    const a = Math.min(1, (t - f.at) / 180);
    drawSparks(ctx, t, f.trail, a);
    if (rand(3) === 0) burstMotes(p.x, p.y, 1, Math.max(r.width, r.height) * 0.3);   // sparks shed as it flies
    f.R = Math.max(r.width, r.height) * 0.72;
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, f.R * 1.25);
    glow.addColorStop(0, `rgba(255, 220, 150, ${0.4 * a})`);
    glow.addColorStop(0.6, `rgba(190, 140, 255, ${0.12 * a})`);
    glow.addColorStop(1, "rgba(190, 140, 255, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(p.x - f.R * 1.25, p.y - f.R * 1.25, f.R * 2.5, f.R * 2.5);
    // A turning circle of runes around the card.
    sigilRing(ctx, p.x, p.y, f.R, a, 0.75 * a);
    ctx.save();
    ctx.setLineDash([2, 5]);
    ctx.lineDashOffset = t / 25;
    sigilRing(ctx, p.x, p.y, f.R * 0.86, a, 0.45 * a, 1);
    ctx.restore();
    f.runes.forEach((rn, k) => {
      const ang = t / 420 + (k / f.runes.length) * Math.PI * 2;
      rune(ctx, RUNES[rn], p.x + Math.cos(ang) * f.R * 1.13, p.y + Math.sin(ang) * f.R * 1.13, 9, ang + Math.PI / 2, 0.9 * a);
    });
    return true;
  });

  MG.ghosts = MG.ghosts.filter((g) => {
    const p = (t - g.at) / 500;
    if (p >= 1 || !g.p) return false;
    // The trail drains into the landing spot while the circle opens out and fades.
    const n = Math.max(1, Math.round(g.trail.length * (1 - p)));
    drawSparks(ctx, t, g.trail.slice(0, n), 1 - p);
    sigilRing(ctx, g.p.x, g.p.y, g.R * (1 + p * 0.35), 1, 0.75 * (1 - p));
    g.runes.forEach((rn, k) => {
      const ang = t / 420 + (k / g.runes.length) * Math.PI * 2;
      const d = g.R * (1.13 + 0.4 * p);
      rune(ctx, RUNES[rn], g.p.x + Math.cos(ang) * d, g.p.y + Math.sin(ang) * d, 9, ang + Math.PI / 2, 0.9 * (1 - p));
    });
    return true;
  });

  MG.motes = MG.motes.filter((m) => {
    const age = t - m.at;
    if (age >= m.life) return false;
    if (age < 0) return true;
    const p = age / m.life;
    const x = m.x + m.vx * age, y = m.y + m.vy * age - p * p * 8;
    const a = (1 - p) * (p < 0.1 ? p / 0.1 : 1);
    const R = m.r * 3;
    const g = ctx.createRadialGradient(x, y, 0, x, y, R);
    g.addColorStop(0, `rgba(${m.col}, ${0.95 * a})`);
    g.addColorStop(1, `rgba(${m.col}, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - R, y - R, R * 2, R * 2);
    return true;
  });
  ctx.restore();
}

// The sigils where a card leaves the fan and where it lands, drawn behind
// the cards: perfect circles that draw themselves in from the top, with an
// inner ring, a six-pointed star and a ring of runes, turning as they fade.
function drawFlights(ctx, t) {
  MG.flares = MG.flares.filter((f) => {
    const p = (t - f.at) / f.dur;
    if (p >= 1 || p < 0) return p < 0;
    const g = f.geom();
    const a = swell(p, 0.15);
    const drawn = Math.min(1, p / 0.28);
    const R = (f.small ? Math.max(g.rx, g.ry) * 1.05 : Math.hypot(g.rx, g.ry) * 1.04) * (0.94 + p * 0.1);
    const spin = p * 0.9;
    ctx.save();
    // A flash of light at the centre.
    const flash = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, R * 1.1);
    flash.addColorStop(0, `rgba(255, 232, 180, ${0.5 * a})`);
    flash.addColorStop(0.55, `rgba(200, 150, 255, ${0.14 * a})`);
    flash.addColorStop(1, "rgba(200, 150, 255, 0)");
    ctx.fillStyle = flash;
    ctx.fillRect(g.x - R * 1.1, g.y - R * 1.1, R * 2.2, R * 2.2);
    ctx.shadowColor = `rgba(255, 210, 130, ${a})`;
    ctx.shadowBlur = 10;
    sigilRing(ctx, g.x, g.y, R, drawn, 0.85 * a, 1.4);
    sigilRing(ctx, g.x, g.y, R * 0.9, drawn, 0.5 * a, 0.9);
    if (!f.small) {
      // A six-pointed star inscribed in the inner ring.
      ctx.strokeStyle = `rgba(255, 224, 165, ${0.4 * a * drawn})`;
      ctx.lineWidth = 0.9;
      for (let tri = 0; tri < 2; tri++) {
        ctx.beginPath();
        for (let k = 0; k <= 3; k++) {
          const ang = spin + tri * Math.PI / 3 + (k / 3) * Math.PI * 2 - Math.PI / 2;
          const X = g.x + Math.cos(ang) * R * 0.9, Y = g.y + Math.sin(ang) * R * 0.9;
          k ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
        }
        ctx.stroke();
      }
    }
    ctx.restore();
    f.runes.forEach((rn, k) => {
      const ang = (k / f.runes.length) * Math.PI * 2 - Math.PI / 2 + spin;
      if ((k + 0.5) / f.runes.length > drawn) return;   // runes appear as the ring reaches them
      rune(ctx, RUNES[rn], g.x + Math.cos(ang) * R * 1.1, g.y + Math.sin(ang) * R * 1.1, 10, ang + Math.PI / 2, 0.9 * a);
    });
    return true;
  });
}

// ── The elements around a turned card ───────────────────
// Fire smoulders with rising embers, Water ripples in waves along the
// edge, Air sends gusts sweeping past, and Earth rolls glinting stones
// around the border. Major cards follow their sign or planet.

const PLANET_ELEMENT = { Sun: "Fire", Mars: "Fire", Jupiter: "Fire", Pluto: "Fire", Moon: "Water", Neptune: "Water",
  Mercury: "Air", Uranus: "Air", Venus: "Earth", Saturn: "Earth" };

function elementFor(card) {
  return elementOf(card) || PLANET_ELEMENT[((card.correspondences || {}).astrology || "").split(" ")[0]] || null;
}

// Clears the top layer (above the cards) before its flights are drawn again.
function clearTop() {
  if (MG.frx) MG.frx.clearRect(0, 0, MG.w, MG.h);
}

// Where a card sits on screen: its centre and half its size.
// The great circle's radius round the spread's cards (see drawMagicLayer).
function greatR1(geo) {
  const left = Math.min(...geo.map((g) => g.x - g.rx)), right = Math.max(...geo.map((g) => g.x + g.rx));
  const top = Math.min(...geo.map((g) => g.y - g.ry)), bottom = Math.max(...geo.map((g) => g.y + g.ry));
  return Math.round(Math.max((right - left) / 2 + 26, Math.min((bottom - top) / 2 + 26, (MG.w || innerWidth) * 0.48)));
}

// The first time the great circle is drawn at a size, the graphics card
// takes a tenth of a second or more to take in its pictures; on the first
// pick, that froze the card's flight. So while the spread sits waiting to
// be picked from, the whole circle is drawn once at this spread's size,
// into a tiny picture nobody sees. (Once per size: they're kept.)
const magicReady = new Set();
function prepareMagic() {
  if (!S || calm || $("table").hidden) return;
  const R1 = greatR1(S.slots.map((s, i) => cardGeom(i)));
  if (!(R1 > 0) || magicReady.has(R1)) return;
  magicReady.add(R1);
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const x = c.getContext("2d");
  x.setTransform(0.08, 0, 0, 0.08, 32, 32);
  const now = performance.now();
  drawArcaneCircle(x, now, { cx: 0, cy: 0, R1, seal: null, from: now - 3000 });
}

function cardGeom(i) {
  const r = S.slots[i].box.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, rx: r.width / 2, ry: r.height / 2 };
}

// A card was revealed: light it, then send energy on to the next card.
function magicReveal(i) {
  if (!S) return;
  if (!MG.ctx) sizeMagic();
  const now = performance.now();
  const fresh = !MG.cards[i];
  if (fresh) {
    MG.cards[i] = { at: now, runes: Array.from({ length: 8 }, () => rand(RUNES.length)), spin: rand(2) ? 1 : -1 };
  }
  const waiting = S.slots.map((s, k) => k).filter((k) => !MG.cards[k]);
  // Each card turned adds the next element of the circle; the last one
  // turned brings the whole circle together instead.
  if (waiting.length && fresh) magicStep();
  if (waiting.length) {
    const next = waiting.find((k) => k > i) ?? waiting[0];
    MG.travels.push({ from: i, to: next, at: now, dur: vary(1100) });
  } else if (!MG.finale) {
    MG.finale = now + 500;   // all turned: the threads gather
  }
  startMagic();
}

function startMagic() {
  if (MG.running) return;
  MG.running = true;
  requestAnimationFrame(function frame(t) {
    if (!S || $("table").hidden || document.hidden) { MG.running = false; return; }
    // (While the summary covers the whole table, nothing of it can be seen:
    // it waits, untouched, until the summary starts to go.)
    if (MG.cover) {
      if (MG.cover.isConnected && !MG.cover.hidden) { requestAnimationFrame(frame); return; }
      MG.cover = null;
    }
    const now = calm ? performance.now() + 10000 : t;   // reduced motion: draw everything already settled
    drawMagic(now);
    clearTop();
    if (MG.frx) drawFlightsTop(MG.frx, now);
    if (calm) { MG.running = false; return; }   // reduced motion: one still frame
    requestAnimationFrame(frame);
  });
}

function rune(ctx, path, x, y, size, angle, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(size / 16, size / 16);
  ctx.translate(-6, -8);
  // Each rune glows softly, like light cut into the air.
  ctx.shadowColor = `rgba(255, 210, 130, ${Math.min(1, alpha * 1.2)})`;
  ctx.shadowBlur = 7;
  ctx.strokeStyle = `rgba(255, 228, 175, ${alpha})`;
  ctx.lineWidth = 19 / size;   // a little over 1px on screen
  ctx.stroke(path);
  ctx.restore();
}

// The paths energy takes: from the top of one card's rune ring, in an
// arc over the cards, down to the top of the next (so it's never hidden
// behind them). bend lifts the arc higher.
function arcPath(a, b, bend) {
  const s = { x: a.x, y: a.y - a.ry - 14 }, e = { x: b.x, y: b.y - b.ry - 14 };
  const c = { x: (s.x + e.x) / 2, y: Math.min(s.y, e.y) - 18 - Math.abs(e.x - s.x) * bend };
  return [s, c, e];
}

// A straight-ish path to a point (used for the threads meeting at the end).
function pointPath(a, to, bend) {
  const s = { x: a.x, y: a.y - a.ry - 14 };
  const c = { x: (s.x + to.x) / 2 + (to.y - s.y) * bend, y: (s.y + to.y) / 2 };
  return [s, c, to];
}

// A point along a path (p from 0 to 1).
function curvePoint([s, c, e], p) {
  const q = 1 - p;
  return { x: q * q * s.x + 2 * q * p * c.x + p * p * e.x, y: q * q * s.y + 2 * q * p * c.y + p * p * e.y };
}

function strokeCurve(ctx, path, upTo = 1) {
  ctx.beginPath();
  const steps = 28;
  for (let k = 0; k <= steps * upTo; k++) {
    const p = curvePoint(path, k / steps);
    k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
  }
  ctx.stroke();
}

function drawMagic(t) {
  drawMagicLayer(t);
  softenUnderText(t);
  drawTwins(MG.ctx, t);
}

// ── Twin words ──────────────────────────────────────────
// When two turned cards tell the same key word, a little constellation
// hangs between their words: a few stars joined by fine lines, drawn out
// from one word to the other, with light flowing along it both ways for as
// long as the reading is open. (Three or more alike are joined in a chain.)
function linkTwinWords() {
  if (!S) return;
  const now = performance.now(), old = new Map((S.twins || []).map((l) => [l.id, l])), twins = [];
  const by = new Map();
  S.slots.forEach((s, i) => {
    if (!s.flipped || !s.key) return;
    if (!by.has(s.key)) by.set(s.key, []);
    by.get(s.key).push(i);
  });
  by.forEach((ix) => {
    for (let k = 1; k < ix.length; k++) {
      const a = ix[k - 1], b = ix[k], id = `${a}-${b}`;
      twins.push(old.get(id) || { id, a, b, at: now + 450,   // once the word has glowed in
        jit: Array.from({ length: 9 }, () => Math.random() * 2 - 1), ph: Math.random() });
    }
  });
  S.twins = twins;
  S.slots.forEach((s, i) => s.kwEl?.classList.toggle("kw-twin", twins.some((l) => l.a === i || l.b === i)));
  if (twins.length) startMagic();
}

function drawTwins(ctx, t) {
  if (!ctx || !S || !S.twins || !S.twins.length) return;
  ctx.save();
  ctx.lineCap = ctx.lineJoin = "round";
  S.twins.forEach((l) => {
    const u = (t - l.at) / 1400;
    if (u <= 0) return;
    const sa = S.slots[l.a], sb = S.slots[l.b];
    if (!sa.kwEl.classList.contains("shown") || !sb.kwEl.classList.contains("shown")) return;
    const show = Math.min(1, u * 1.6), grow = 1 - Math.pow(1 - Math.min(1, u), 3);
    const ra = sa.kwEl.getBoundingClientRect(), rb = sb.kwEl.getBoundingClientRect();
    const ca = sa.box.getBoundingClientRect(), cb = sb.box.getBoundingClientRect();
    if (!ra.width || !rb.width) return;
    // One hangs from just under one word to just under the other; a second
    // arches over the two cards, from the top of one to the top of the other.
    const A = { x: ra.left + ra.width / 2, y: ra.bottom + 4 }, B = { x: rb.left + rb.width / 2, y: rb.bottom + 4 };
    const d = Math.hypot(B.x - A.x, B.y - A.y);
    if (d < 4) return;
    drawTwinStars(ctx, t, l, A, B, { x: (A.x + B.x) / 2, y: Math.max(A.y, B.y) + 14 + d * 0.12 }, 0, show, grow);
    if (ca.width && cb.width) {
      const TA = { x: ca.left + ca.width / 2, y: ca.top - 6 }, TB = { x: cb.left + cb.width / 2, y: cb.top - 6 };
      const dt = Math.hypot(TB.x - TA.x, TB.y - TA.y);
      if (dt >= 4) drawTwinStars(ctx, t, l, TA, TB, { x: (TA.x + TB.x) / 2, y: Math.min(TA.y, TB.y) - 18 - dt * 0.1 }, 4, show, grow);
    }
  });
  ctx.restore();
}

// One string of twin stars from A to B along a curve bent toward ctrl:
// a glowing thread with light flowing along it, bright twinkling stars,
// and two glints that keep travelling, one each way.
function drawTwinStars(ctx, t, l, A, B, ctrl, seed, show, grow) {
    const d = Math.hypot(B.x - A.x, B.y - A.y);
    const nx = -(B.y - A.y) / d, ny = (B.x - A.x) / d;
    const n = Math.max(3, Math.min(8, Math.round(d / 55)));
    const pts = [];
    for (let k = 0; k <= n; k++) {
      const p = curvePoint([A, ctrl, B], k / n), j = k && k < n ? 7 * l.jit[(k + seed) % 9] : 0;
      pts.push({ x: p.x + nx * j, y: p.y + ny * j });
    }
    // Lengths along the line of stars, to find a point a fraction of the way.
    const cum = [0];
    for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y));
    const total = cum[cum.length - 1];
    const at = (f) => {
      const s = f * total;
      let k = 1;
      while (k < cum.length - 1 && cum[k] < s) k++;
      const q = (s - cum[k - 1]) / Math.max(1e-6, cum[k] - cum[k - 1]);
      return { x: pts[k - 1].x + (pts[k].x - pts[k - 1].x) * q, y: pts[k - 1].y + (pts[k].y - pts[k - 1].y) * q };
    };
    const line = (upTo) => {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let k = 1; k < pts.length && cum[k - 1] < upTo * total; k++) {
        const p = cum[k] <= upTo * total ? pts[k] : at(upTo);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    };
    // The lines: a glowing gold thread, and over it light flowing from word to word.
    ctx.setLineDash([]);
    ctx.shadowColor = `rgba(255, 200, 110, ${0.8 * show})`;
    ctx.shadowBlur = 6;
    ctx.strokeStyle = `rgba(232, 200, 140, ${0.55 * show})`;
    ctx.lineWidth = 1.1;
    line(grow);
    ctx.setLineDash([3, 7]);
    ctx.lineDashOffset = -t / 40;
    ctx.strokeStyle = `rgba(255, 238, 200, ${0.9 * show})`;
    ctx.lineWidth = 1.4;
    line(grow);
    ctx.setLineDash([]);
    // The stars, each lit as the line reaches it, twinkling.
    pts.forEach((p, k) => {
      const reach = cum[k] / total;
      if (reach > grow + 1e-3) return;
      const end = k === 0 || k === n;
      const tw = 0.75 + 0.25 * Math.sin(t / 700 + k * 2.1 + l.ph * 6 + seed);
      const r = (end ? 2.4 : 1.8) * tw;
      ctx.shadowColor = `rgba(255, 210, 130, ${show})`;
      ctx.shadowBlur = end ? 14 : 10;
      ctx.fillStyle = `rgba(255, 246, 225, ${show * tw})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
      // a cross of light on each star
      ctx.shadowBlur = 4;
      ctx.strokeStyle = `rgba(255, 240, 210, ${0.75 * show * tw})`;
      ctx.lineWidth = 0.7;
      const c = r * 3.2;
      ctx.beginPath();
      ctx.moveTo(p.x - c, p.y); ctx.lineTo(p.x + c, p.y);
      ctx.moveTo(p.x, p.y - c); ctx.lineTo(p.x, p.y + c);
      ctx.stroke();
    });
    // Two glints that keep flowing, one each way, so both cards speak.
    if (grow >= 1) {
      [0, 1].forEach((w) => {
        const f = (t / 2800 + l.ph + seed * 0.13 + w * 0.5) % 1, along = w ? 1 - f : f;
        const p = at(along), fade = Math.sin(Math.PI * f);
        ctx.shadowBlur = 0;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 10);
        g.addColorStop(0, `rgba(255, 250, 232, ${fade * show})`);
        g.addColorStop(0.35, `rgba(255, 226, 160, ${0.6 * fade * show})`);
        g.addColorStop(1, "rgba(255, 214, 140, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(p.x - 10, p.y - 10, 20, 20);
      });
    }
    ctx.shadowBlur = 0;
}

// The magic thins out behind each turned card's name and keywords, so
// the gold words never sit on gold runes. One soft oval per card, its
// edge fading away gradually (close to a bell curve), so it reads as the
// light simply growing quieter there rather than a cut-out. It eases in
// as the words appear.
function softenUnderText(t) {
  const ctx = MG.ctx;
  if (!ctx || !S) return;
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  S.slots.forEach((s, i) => {
    const c = MG.cards[i];
    if (!c || !s.nameEl.classList.contains("shown")) return;
    const a = Math.min(1, Math.max(0, (t - c.at - 200) / 900));
    if (a <= 0) return;
    const k = a * a * (3 - 2 * a);
    const r1 = s.nameEl.getBoundingClientRect(), r2 = s.kwEl.getBoundingClientRect();
    const left = Math.min(r1.left, r2.left), right = Math.max(r1.right, r2.right);
    const top = Math.min(r1.top, r2.top), bottom = Math.max(r1.bottom, r2.bottom);
    if (right <= left || bottom <= top) return;
    const cx = (left + right) / 2, cy = (top + bottom) / 2;
    const rx = (right - left) / 2 + 34, ry = (bottom - top) / 2 + 22;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(rx, ry);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    [[0, 0.92], [0.35, 0.88], [0.55, 0.72], [0.7, 0.5], [0.82, 0.28], [0.92, 0.1], [1, 0]]
      .forEach(([o, v]) => g.addColorStop(o, `rgba(0, 0, 0, ${(v * k).toFixed(3)})`));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  ctx.restore();
}

function drawMagicLayer(t) {
  const ctx = MG.ctx;
  ctx.clearRect(0, 0, MG.w, MG.h);
  if (!S) return;
  const geo = S.slots.map((s, i) => cardGeom(i));
  const fin = MG.finale && t >= MG.finale ? Math.min(1, (t - MG.finale) / 1600) : 0;
  const pulse = 0.85 + 0.15 * Math.sin(t / 1400);
  ctx.lineCap = "round";

  // Threads already travelled: faint lines, flowing once all are joined.
  MG.links.forEach(({ from, to, bend }) => {
    ctx.save();
    ctx.setLineDash([2, 7]);
    ctx.lineDashOffset = -t / 60;
    ctx.strokeStyle = `rgba(${GOLD}, ${(0.16 + 0.12 * fin) * pulse})`;
    ctx.lineWidth = 1;
    strokeCurve(ctx, arcPath(geo[from], geo[to], bend));
    ctx.restore();
  });

  // Energy on its way to the next card: a bright head with a trail.
  MG.travels = MG.travels.filter((tr) => {
    const p = Math.min(1, (t - tr.at) / tr.dur);
    tr.bend = tr.bend ?? 0.15;
    const path = arcPath(geo[tr.from], geo[tr.to], tr.bend);
    if (p >= 1) {
      MG.links.push({ from: tr.from, to: tr.to, bend: tr.bend });
      MG.cards[tr.to] || (MG.waitAt = { i: tr.to, at: t });
      return false;
    }
    const e = 1 - Math.pow(1 - p, 3);
    ctx.strokeStyle = `rgba(${GOLD}, .26)`;
    ctx.lineWidth = 1;
    strokeCurve(ctx, path, e);
    for (let k = 0; k < 10; k++) {
      const q = Math.max(0, e - k * 0.025);
      const pt = curvePoint(path, q);
      ctx.fillStyle = `rgba(255, 226, 170, ${0.55 * (1 - k / 10)})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2.4 * (1 - k / 12), 0, Math.PI * 2);
      ctx.fill();
    }
    return true;
  });

  // A card the energy has reached, waiting to be turned: a soft breathing ring.
  if (MG.waitAt && !MG.cards[MG.waitAt.i] && geo[MG.waitAt.i]) {
    const g = geo[MG.waitAt.i];
    const a = 0.1 + 0.08 * Math.sin((t - MG.waitAt.at) / 420);
    ctx.strokeStyle = `rgba(${GOLD}, ${a})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(g.x, g.y, g.rx + 10, g.ry + 10, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawFlights(ctx, t);

  // Each revealed card: its burst of light and its turning ring of runes.
  MG.cards.forEach((c, i) => {
    if (!c) return;
    const g = geo[i];
    const age = t - c.at;
    if (age < 1000) {
      const p = age / 1000;
      const r = (g.ry + 30) * (0.4 + p * 1.1);
      const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, r);
      grad.addColorStop(0, `rgba(255, 226, 170, ${0.32 * (1 - p)})`);
      grad.addColorStop(1, "rgba(255, 226, 170, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(g.x - r, g.y - r, r * 2, r * 2);
    }
    const show = Math.min(1, age / 700);
    const rx = g.rx + 12, ry = g.ry + 12;
    ctx.save();
    ctx.setLineDash([1, 5]);
    ctx.lineDashOffset = (t / 90) * c.spin;
    ctx.strokeStyle = `rgba(${GOLD}, ${CARD_RING.dots * show * pulse})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(g.x, g.y, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    // A pool of soft light beneath the card.
    ctx.save();
    ctx.translate(g.x, g.y + g.ry + 4);
    ctx.scale(1, 0.22);
    const pool = ctx.createRadialGradient(0, 0, 0, 0, 0, g.rx * 1.25);
    pool.addColorStop(0, `rgba(255, 214, 140, ${0.3 * show * pulse})`);
    pool.addColorStop(1, "rgba(255, 214, 140, 0)");
    ctx.fillStyle = pool;
    ctx.fillRect(-g.rx * 1.25, -g.rx * 1.25, g.rx * 2.5, g.rx * 2.5);
    ctx.restore();
    c.runes.forEach((r, k) => {
      const ang = (k / c.runes.length) * Math.PI * 2 + (t / 26000) * c.spin;
      const x = g.x + Math.cos(ang) * (rx + 9), y = g.y + Math.sin(ang) * (ry + 9);
      const tw = 0.75 + 0.25 * Math.sin(t / 900 + k * 1.7);
      rune(ctx, RUNES[r], x, y, 10, 0, CARD_RING.runes * show * tw);
    });
  });

  // Where the great circle sits: a perfect circle around the spread. A tall
  // spread on a narrow screen can't fit inside one, so there it passes behind the cards.
  const finaleOn = MG.finale && t >= MG.finale;
  if (!finaleOn && !MG.steps.length) return;
  const left = Math.min(...geo.map((g) => g.x - g.rx)), right = Math.max(...geo.map((g) => g.x + g.rx));
  const top = Math.min(...geo.map((g) => g.y - g.ry)), bottom = Math.max(...geo.map((g) => g.y + g.ry));
  const cx = (left + right) / 2, cy = (top + bottom) / 2;
  const header = document.querySelector("#table .bar").getBoundingClientRect().bottom;
  const R1 = greatR1(geo);

  // All turned: threads from every card meet in a seal above the spread,
  // then the circle comes together. Until then, it shows only the elements
  // that picking and turning have added so far.
  let seal = null, from = null;
  if (finaleOn) {
    const gather = Math.min(1, (t - MG.finale) / 900);
    // The threads meet in a seal just above the spread, where nothing covers it.
    const sealAt = { x: cx, y: Math.max(top - 44, header + 16) };
    geo.forEach((g, i) => {
      const path = pointPath(g, sealAt, i % 2 ? 0.15 : -0.15);
      ctx.strokeStyle = `rgba(${GOLD}, ${0.14 * pulse})`;
      ctx.lineWidth = 1;
      strokeCurve(ctx, path, gather);
      if (gather < 1) {
        const pt = curvePoint(path, gather);
        ctx.fillStyle = "rgba(255, 226, 170, .6)";
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    // Where the great circle is, for the summary's portal to take it over.
    MG.great = { cx, cy, R1, from: MG.finale + 900 };
    if (gather >= 1) {
      seal = sealAt;
      from = MG.finale + 900;
      // The moment it comes together: sparks shower out over the cards.
      if (!MG.burst && !calm) {
        MG.burst = true;
        burstMotes(cx, cy, 70, R1 * 0.25);
        burstMotes(cx, cy, 90, R1);
      }
    }
  }
  if (!MG.portal) drawArcaneCircle(ctx, t, { cx, cy, R1, seal, from });
}
