// The table's magic: flights, runes, glows and the elemental frames.
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

function sizeMagic() {
  const c = $("magic");
  const r = Math.min(devicePixelRatio || 1, 2);
  MG.w = innerWidth; MG.h = innerHeight;
  c.width = MG.w * r;
  c.height = MG.h * r;
  MG.cv = c;
  MG.ctx = c.getContext("2d");
  MG.ctx.setTransform(r, 0, 0, r, 0, 0);
  // The frames layer, above the cards.
  MG.r = r;
  const f = $("frames");
  f.width = c.width;
  f.height = c.height;
  MG.frx = f.getContext("2d");
  MG.frx.setTransform(r, 0, 0, r, 0, 0);
}

function resetMagic() {
  MG.cards = []; MG.travels = []; MG.links = []; MG.finale = 0; MG.great = null; MG.portal = false;
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

// ── The elemental frames ────────────────────────────────
// Shelved for now: set to true to bring the frames back.
const FRAMES_ON = false;
// Each turned card gets a painted frame on its own edge, in its element's
// colour: fire burning, water rolling in crests, earth's stones, dirt and
// gems travelling round, and air flowing in ribbons. They're drawn on a
// layer above the cards, fade in once as the card finishes turning, then
// keep moving slowly. Nothing reaches below the card, so its name stays clear.

const FRAME_FADE = 1100;   // how long the fade-in takes, in ms
const FRAME_DELAY = 350;   // starts as the card finishes turning over

// How deep the frame reaches into the card on each side, as a share of the
// card's width. Each card's white margin is measured from its own picture
// (up to the first dark line: the picture's outline, or the box around its
// title), so the frame covers the margin but never the picture or its text.
// Until a card is measured, a safe narrow margin is used.
const FRAME_INSET = { t: 0.03, r: 0.048, b: 0.07, l: 0.034 };
const frameInsets = new Map();   // card name → measured inset

function measureInset(card) {
  if (!card.image || frameInsets.has(card.name)) return;
  frameInsets.set(card.name, null);   // measuring
  const img = new Image();
  const measure = () => {
    const W = img.naturalWidth, H = img.naturalHeight;
    if (!W || !H) { frameInsets.set(card.name, FRAME_INSET); return; }
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const x = c.getContext("2d", { willReadFrequently: true });
    x.drawImage(img, 0, 0);
    const data = x.getImageData(0, 0, W, H).data;
    const dark = (px, py) => { const k = (py * W + px) * 4; return data[k] + data[k + 1] + data[k + 2] < 300; };
    // From one edge inward, how far until the first dark pixel.
    const run = (len, at) => { for (let k = 0; k < len; k++) if (at(k)) return k; return len; };
    const lines = [0.25, 0.4, 0.55, 0.7];
    // The nearest dark line on each side wins, so nothing inside is ever covered.
    const side = (fn) => Math.min(...lines.map(fn));
    const l = side((f) => run(W / 4, (k) => dark(k, Math.round(H * f))));
    const r = side((f) => run(W / 4, (k) => dark(W - 1 - k, Math.round(H * f))));
    const t = side((f) => run(H / 5, (k) => dark(Math.round(W * f), k)));
    const b = side((f) => run(H / 5, (k) => dark(Math.round(W * f), H - 1 - k)));
    // A little short of the line, as a share of the width.
    const share = (px) => Math.max(0.02, (px - 1) / W);
    frameInsets.set(card.name, { t: share(t), r: share(r), b: share(b), l: share(l) });
  };
  img.onload = () => { try { measure(); } catch { frameInsets.set(card.name, FRAME_INSET); } };
  img.onerror = () => frameInsets.set(card.name, FRAME_INSET);
  img.src = card.image;
}

// A card's inset, turned round for a reversed card.
function insetFor(card, reversed) {
  const m = frameInsets.get(card.name) || FRAME_INSET;
  return reversed ? { t: m.b, r: m.l, b: m.t, l: m.r } : m;
}

// A point on the frame, s from 0 to 1 going clockwise from the top-left
// corner. off is a depth in pixels: positive is outside the card's edge,
// negative is inside, where -ins.i means the frame's inner edge (on each
// side that lands at that side's own inset). Also gives the outward
// direction, the direction along the edge, and the distance to the
// nearest corner.
function framePoint(g, s, off, ins) {
  const dep = (k) => (off >= 0 || !ins ? off : off * (ins[k] / ins.i));
  const L = g.x - dep("l"), R = g.x + g.w + dep("r"), T = g.y - dep("t"), Bt = g.y + g.h + dep("b");
  const w = R - L, h = Bt - T, per = 2 * (w + h);
  let q = (((s % 1) + 1) % 1) * per;
  if (q < w) return [L + q, T, 0, -1, 1, 0, Math.min(q, w - q)];
  q -= w;
  if (q < h) return [R, T + q, 1, 0, 0, 1, Math.min(q, h - q)];
  q -= h;
  if (q < w) return [R - q, Bt, 0, 1, -1, 0, Math.min(q, w - q)];
  q -= w;
  return [L, Bt - q, -1, 0, 0, -1, Math.min(q, h - q)];
}

// The four corners of the frame at a given depth (see framePoint).
function frameCorners(g, off, ins) {
  const dep = (k) => (off >= 0 ? off : off * (ins[k] / ins.i));
  const L = g.x - dep("l"), R = g.x + g.w + dep("r"), T = g.y - dep("t"), B = g.y + g.h + dep("b");
  return [[L, T], [R, T], [R, B], [L, B]];
}

// The frame's inner edge, as a box.
function frameInner(g, ins) {
  return { x: g.x + ins.l, y: g.y + ins.t, w: g.w - ins.l - ins.r, h: g.h - ins.t - ins.b };
}

function frameHash(k) {
  const v = Math.sin(k * 127.1 + 3.7) * 43758.5453;
  return v - Math.floor(v);
}

const FRAME_BASE = {
  Fire: ["#4a0a02", "#a82a08"], Water: ["#123a6e", "#2a6bb8"],
  Earth: ["#070608", "#151214"], Air: ["#36578a", "#6e8fbf"],   // earth is near black, so its gems stand out
};
const FRAME_GEMS = ["#5fd08a", "#f0c45a", "#b58cf0", "#5ab8e0", "#e86a7a"];

// Rough stone outlines, made once.
const FRAME_STONES = Array.from({ length: 40 }, (_, k) => {
  const n = 6 + Math.floor(frameHash(k) * 3);
  return Array.from({ length: n }, (_, j) => {
    const a = (j / n) * Math.PI * 2, r = 0.75 + 0.35 * frameHash(k * 7 + j);
    return [Math.cos(a) * r, Math.sin(a) * r];
  });
});

function frameBand(x, g, o, ins, r) {
  const n = frameInner(g, ins);
  x.beginPath();
  x.roundRect(g.x - o, g.y - o, g.w + 2 * o, g.h + 2 * o, r + o);
  x.roundRect(n.x, n.y, n.w, n.h, 2);
}

// The slow flicker of the flame tips.
// Low spatial frequencies give broad, rolling tongues rather than spikes.
function flameNoise(x, y, t) {
  return 0.5 * Math.sin(x * 0.11 + y * 0.16 + t / 340)
    + 0.32 * Math.sin(x * 0.19 - y * 0.12 + t / 470 + 1.3)
    + 0.18 * Math.sin(x * 0.07 + y * 0.24 + t / 260 + 4.1);
}

// The frames are an accent on the card's edge, not a second picture:
// everything (band, flames, waves, stones) is drawn at half its full size,
// it reaches only halfway into the white margin, and it's a little see-through.
const FRAME_SCALE = 0.5;
const FRAME_OPACITY = 0.8;

// g = the card's box { x, y, w, h }; age = ms since the frame began.
function drawFrame(x, g, el, t, age, inset = FRAME_INSET) {
  const B = Math.max(3.5, g.w * 0.085 * FRAME_SCALE), o = B * 0.3, r = 6;
  // i is the frame's depth inside the card on the sides; each side's own
  // depth comes from FRAME_INSET, and every effect is spread to fill it.
  const k0 = g.w * FRAME_SCALE;
  const ins = { t: k0 * inset.t, r: k0 * inset.r, b: k0 * inset.b, l: k0 * inset.l };
  const i = ins.i = ins.l, d = (o - i) / 2, inner = frameInner(g, ins);
  const pp = 2 * (g.w + g.h);
  const a = Math.min(1, age / FRAME_FADE), fade = a * a * (3 - 2 * a);
  if (fade <= 0) return;
  const P = (s, off) => framePoint(g, s, off, ins);
  const steps = Math.max(120, Math.round(pp / 2.2));

  x.save();
  // Nothing below the card's bottom edge, so the name underneath stays clear.
  x.beginPath();
  x.rect(g.x - B * 6, g.y - B * 8, g.w + B * 12, g.h + B * 8 + o + 1);
  x.clip();
  x.globalAlpha = fade * FRAME_OPACITY;
  const base = FRAME_BASE[el];
  const grad = x.createLinearGradient(g.x, g.y, g.x + g.w, g.y + g.h);
  grad.addColorStop(0, base[1]); grad.addColorStop(0.5, base[0]); grad.addColorStop(1, base[1]);
  frameBand(x, g, o, ins, r);
  x.fillStyle = grad;
  x.fill("evenodd");

  if (el === "Fire") {
    // A line of heat glowing along the inner edge…
    x.save();
    x.shadowColor = "rgba(255, 120, 30, .9)";
    x.shadowBlur = 7;
    x.strokeStyle = "rgba(255, 170, 60, .7)";
    x.lineWidth = B * 0.25;
    x.beginPath();
    x.roundRect(inner.x - B * 0.1, inner.y - B * 0.1, inner.w + B * 0.2, inner.h + B * 0.2, 2);
    x.stroke();
    x.restore();
    // …then the flames in four layers, red outside to a white-hot core.
    [[1.0, "rgba(235, 70, 15, .96)", 1], [0.74, "rgba(255, 145, 30, .97)", 0.9],
     [0.5, "rgba(255, 215, 90, .98)", 0.8], [0.27, "rgba(255, 248, 215, .97)", 0.7]].forEach(([sz, col, amp], li) => {
      x.beginPath();
      for (let k = 0; k <= steps; k++) {
        const [px, py] = P(k / steps, -i + B * 0.15);
        k ? x.lineTo(px, py) : x.moveTo(px, py);
      }
      for (let k = steps; k >= 0; k--) {
        const [px, py, nx, ny] = P(k / steps, -i + B * 0.15);
        const up = 0.4 + 0.6 * Math.max(0, -ny) + 0.2 * Math.abs(nx);   // tallest along the top
        // Rounded crests (a gentle power), and kept low so the fire hugs the frame.
        const peak = Math.pow(Math.max(0, flameNoise(px, py, t + li * 120) * 0.5 + 0.5), 1.25);
        const hh = B * (sz * 0.6 + sz * 0.55 * amp * peak * up);
        let dx = nx, dy = ny - 0.35 * up;
        const m = Math.hypot(dx, dy) || 1;
        x.lineTo(px + (dx / m) * hh, py + (dy / m) * hh);
      }
      x.closePath();
      x.fillStyle = col;
      if (!li) {
        x.save();
        x.shadowColor = "rgba(255, 90, 20, .95)";
        x.shadowBlur = 8;
        x.fill();
        x.restore();
      } else x.fill();
    });
    for (let k = 0; k < 12; k++) {
      const ph = (t / 3800 + k / 12) % 1;
      const [ex, ey] = P(frameHash(k + 9) * 0.5 + 0.75 * (k % 2), o);
      x.fillStyle = `rgba(255, ${230 - ph * 100}, ${150 - ph * 100}, ${0.95 * (1 - ph)})`;
      x.beginPath();
      x.arc(ex + Math.sin(t / 600 + k) * 2, ey - ph * B * 3.8, 1.1, 0, Math.PI * 2);
      x.fill();
    }
  }

  if (el === "Water") {
    for (let j = 0; j < 2; j++) {
      x.strokeStyle = j ? "rgba(150, 210, 255, .5)" : "rgba(220, 240, 255, .45)";
      x.lineWidth = B * (j ? 0.16 : 0.1);
      x.beginPath();
      for (let k = 0; k <= steps; k++) {
        const s = k / steps;
        const off = d + B * 0.25 * Math.sin((s * pp) / (B * 2.2) - t / 900 + j * 2);
        const [px, py, nx, ny] = P(s, 0);
        k ? x.lineTo(px + nx * off, py + ny * off) : x.moveTo(px + nx * off, py + ny * off);
      }
      x.stroke();
    }
    // Crests rolling round; each shrinks away before a corner and grows back after it.
    const m = Math.round(pp / (B * 3.4)), span = (B * 1.7) / pp;
    for (let k = 0; k < m; k++) {
      const s = (k / m + t / 42000) % 1;
      const [b1x, b1y, nx, ny, tx, ty, c1] = P(s, -i + B * 0.15);
      const q2 = P(s + span, -i + B * 0.15);
      if (q2[2] !== nx || q2[3] !== ny) continue;
      const ca = Math.max(0, Math.min(1, Math.min(c1, q2[6]) / (B * 1.4)));
      if (ca <= 0) continue;
      const hc = B * 0.95 * (0.55 + 0.45 * ca);
      const px = b1x + tx * B * 1.2 + nx * hc, py = b1y + ty * B * 1.2 + ny * hc;
      const ex = b1x + tx * B * 1.7, ey = b1y + ty * B * 1.7;
      x.save();
      x.globalAlpha = fade * FRAME_OPACITY * ca;
      x.fillStyle = "rgba(90, 170, 235, .95)";
      x.beginPath();
      x.moveTo(b1x, b1y);
      x.quadraticCurveTo(b1x + tx * B * 0.6 + nx * hc * 1.1, b1y + ty * B * 0.6 + ny * hc * 1.1, px, py);
      x.quadraticCurveTo(px + tx * B * 0.35 - nx * hc * 0.2, py + ty * B * 0.35 - ny * hc * 0.2, px - nx * hc * 0.3 + tx * B * 0.1, py - ny * hc * 0.3 + ty * B * 0.1);
      x.quadraticCurveTo(ex - nx * B * 0.1, ey - ny * B * 0.1, ex, ey);
      x.closePath();
      x.fill();
      x.strokeStyle = "rgba(235, 248, 255, .95)";
      x.lineWidth = Math.max(1, B * 0.12);
      x.beginPath();
      x.moveTo(b1x + tx * B * 0.3 + nx * hc * 0.4, b1y + ty * B * 0.3 + ny * hc * 0.4);
      x.quadraticCurveTo(b1x + tx * B * 0.7 + nx * hc * 1.05, b1y + ty * B * 0.7 + ny * hc * 1.05, px, py);
      x.quadraticCurveTo(px + tx * B * 0.3, py + ty * B * 0.3, px - nx * hc * 0.25 + tx * B * 0.12, py - ny * hc * 0.25 + ty * B * 0.12);
      x.stroke();
      x.restore();
    }
    for (let k = 0; k < 5; k++) {
      const ph = (t / 2400 + k / 5) % 1;
      const [ex, ey, nx, ny] = P(frameHash(k + 4), o);
      x.fillStyle = `rgba(200, 235, 255, ${0.9 * Math.sin(ph * Math.PI)})`;
      x.beginPath();
      x.arc(ex + nx * ph * B * 1.5, ey + ny * ph * B * 1.5 - ph * B, 1.1, 0, Math.PI * 2);
      x.fill();
    }
  }

  if (el === "Earth") {
    const flow = t / 70000;   // the whole band slowly travels round
    x.save();
    frameBand(x, g, o, ins, r);
    x.clip("evenodd");
    for (let k = 0; k < 70; k++) {   // specks of dirt
      const [px, py] = P((frameHash(k + 20) + flow) % 1, d + (frameHash(k + 50) - 0.5) * B * 0.8);
      x.fillStyle = k % 3 ? "rgba(30, 20, 10, .55)" : "rgba(150, 115, 75, .6)";
      x.beginPath();
      x.arc(px, py, 0.6 + frameHash(k) * 0.8, 0, Math.PI * 2);
      x.fill();
    }
    const ns = Math.round(pp / (B * 1.25));   // stones, turning as they roll
    for (let k = 0; k < ns; k++) {
      const s = (k / ns + frameHash(k) * 0.012 + flow) % 1;
      const rr = B * (0.28 + 0.22 * frameHash(k + 3));
      const [px, py] = P(s, d + (frameHash(k + 11) - 0.5) * B * 0.45);
      const tone = 95 + Math.floor(frameHash(k + 5) * 60);
      x.save();
      x.translate(px, py);
      x.rotate(((s * pp) / rr) * (k % 2 ? 1 : -1) * 0.3);
      x.beginPath();
      FRAME_STONES[k % 40].forEach(([u, v], j) => (j ? x.lineTo(u * rr, v * rr) : x.moveTo(u * rr, v * rr)));
      x.closePath();
      x.fillStyle = `rgb(${tone}, ${tone - 6}, ${tone - 16})`;
      x.fill();
      x.strokeStyle = "rgba(20, 14, 8, .7)";
      x.lineWidth = 0.6;
      x.stroke();
      x.fillStyle = "rgba(255, 250, 235, .28)";
      x.beginPath();
      x.ellipse(-rr * 0.25, -rr * 0.3, rr * 0.35, rr * 0.2, -0.5, 0, Math.PI * 2);
      x.fill();
      x.restore();
    }
    const ng = Math.round(pp / (B * 5));   // cut gems among them
    for (let k = 0; k < ng; k++) {
      const [px, py] = P((k / ng + 0.03 + flow) % 1, d);
      const sz = B * 0.36;
      x.save();
      x.translate(px, py);
      x.rotate(Math.sin(t / 1800 + k) * 0.25);
      x.fillStyle = FRAME_GEMS[k % 5];
      x.beginPath();
      x.moveTo(0, -sz); x.lineTo(sz * 0.75, -sz * 0.2); x.lineTo(sz * 0.45, sz); x.lineTo(-sz * 0.45, sz); x.lineTo(-sz * 0.75, -sz * 0.2);
      x.closePath();
      x.fill();
      x.fillStyle = "rgba(255, 255, 255, .55)";
      x.beginPath();
      x.moveTo(0, -sz); x.lineTo(sz * 0.38, -sz * 0.2); x.lineTo(-sz * 0.38, -sz * 0.2);
      x.closePath();
      x.fill();
      x.restore();
    }
    x.restore();
    for (let k = 0; k < ng; k++) {   // now and then a gem catches the light
      const gp = ((t + k * 1300) % 4200) / 4200;
      if (gp >= 0.12) continue;
      const [px, py] = P((k / ng + 0.03 + flow) % 1, d);
      const ga = Math.sin((gp / 0.12) * Math.PI), L = B * 0.9 * ga;
      x.strokeStyle = `rgba(255, 250, 230, ${ga})`;
      x.lineWidth = 1;
      x.beginPath();
      x.moveTo(px - L, py); x.lineTo(px + L, py); x.moveTo(px, py - L); x.lineTo(px, py + L);
      x.stroke();
    }
    for (let k = 0; k < 7; k++) {   // crumbs breaking off the edge
      const ph = (t / 1900 + k / 7) % 1;
      const [ex, ey, nx, ny] = P((frameHash(k + 31) * 0.5 + 0.5 * (k % 2) + flow) % 1, o);
      x.fillStyle = `rgba(140, 105, 70, ${0.85 * (1 - ph)})`;
      x.beginPath();
      x.arc(ex + nx * ph * B * 0.8, ey + ny * ph * B * 0.8 + ph * ph * B * 1.5, 0.9 + frameHash(k) * 0.8, 0, Math.PI * 2);
      x.fill();
    }
  }

  if (el === "Air") {
    x.lineCap = "round";
    x.lineJoin = "round";
    // Ribbons of wind: long dashes gliding round the frame.
    for (let j = 0; j < 3; j++) {
      x.save();
      x.strokeStyle = `rgba(244, 238, 222, ${0.85 - j * 0.12})`;
      x.lineWidth = B * (0.2 - j * 0.035);
      x.setLineDash([B * (3.2 + j), B * (1.6 + j * 0.6)]);
      x.lineDashOffset = (-t * B) / (380 + j * 90);
      x.beginPath();
      for (let k = 0; k <= steps; k++) {
        const s = k / steps;
        const off = d + B * 0.3 * Math.sin((s * pp) / (B * 1.8) + j * 2.1 + t / 1800);
        const [px, py, nx, ny] = P(s, 0);
        k ? x.lineTo(px + nx * off, py + ny * off) : x.moveTo(px + nx * off, py + ny * off);
      }
      x.closePath();
      x.stroke();
      x.restore();
    }
    // A small turning spiral in each corner.
    frameCorners(g, d, ins).forEach(([cx, cy], k) => {
      x.strokeStyle = "rgba(250, 246, 235, .9)";
      x.lineWidth = Math.max(0.8, B * 0.09);
      x.beginPath();
      const rot = (t / 2200) * (k % 2 ? 1 : -1);
      for (let u = 0; u <= 1; u += 0.025) {
        const an = rot + u * Math.PI * 2.6, rr = B * (0.42 - u * 0.34);
        u ? x.lineTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr) : x.moveTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr);
      }
      x.stroke();
    });
  }

  // The gold rails on either side of the band.
  x.setLineDash([]);
  x.strokeStyle = "#c9a96e";
  x.lineWidth = 1.4;
  x.beginPath();
  x.roundRect(g.x - o, g.y - o, g.w + 2 * o, g.h + 2 * o, r + o);
  x.stroke();
  x.strokeStyle = "rgba(201, 169, 110, .85)";
  x.lineWidth = 1;
  x.beginPath();
  x.roundRect(inner.x, inner.y, inner.w, inner.h, 2);
  x.stroke();
  x.restore();
}

// Draws every turned card's frame on the layer above the cards.
function drawFrames(t) {
  const x = MG.frx;
  if (!x) return;
  x.clearRect(0, 0, MG.w, MG.h);
  if (!S || !FRAMES_ON) return;
  MG.cards.forEach((c, i) => {
    if (!c || !c.element || !S.slots[i]) return;
    const r = S.slots[i].box.getBoundingClientRect();
    const slot = S.slots[i];
    drawFrame(x, { x: r.left, y: r.top, w: r.width, h: r.height }, c.element, t, t - c.at - FRAME_DELAY,
      insetFor(slot.card, slot.reversed));
  });
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
    MG.cards[i] = { at: now, runes: Array.from({ length: 8 }, () => rand(RUNES.length)), spin: rand(2) ? 1 : -1,
      element: S.slots[i].card ? elementFor(S.slots[i].card) : null };
    if (FRAMES_ON && S.slots[i].card) measureInset(S.slots[i].card);
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
    const now = calm ? performance.now() + 10000 : t;   // reduced motion: draw everything already settled
    drawMagic(now);
    drawFrames(now);
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
    ctx.strokeStyle = `rgba(${GOLD}, ${0.22 * show * pulse})`;
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
      rune(ctx, RUNES[r], x, y, 10, 0, 0.8 * show * tw);
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
