// The great arcane circle drawn as the cards are turned.
// Part of the app; the files in js/ load in the order listed in index.html.

// ── The great arcane circle ─────────────────────────────
// Forms around the whole spread once every card is turned: perfect circles
// of faint golden light, laid out with strict symmetry but never evenly.
// The inner sigil sweeps itself in from the top: a ring of runes broken
// by small node circles, a hexagram whose points touch the band, a smaller
// inner ring and three satellite circles riding on the rim. Then light
// gathers, ripples run outward, each reaching further than the last, and
// a larger sigil grows out of the inner one: a second band of runes, two
// crossed squares cutting through the inner circle, and broken arcs
// beyond, long and short in turn. The two turn slowly against each other
// while glints spark at their crossings and dust drifts between them.
//
// Both sigils are drawn once, glow and all, into pictures of their own;
// each frame only turns and fades those pictures and adds the live light.

const ARC_GLOW = "255, 190, 110", ARC_CORE = "255, 236, 200";
const arcSeg = (v, a, b) => Math.min(1, Math.max(0, (v - a) / (b - a)));
const easeIO = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(2 - 2 * p, 2) / 2);
const easeOut = (p) => 1 - Math.pow(1 - p, 3);
// A small number from 0 to 1 that's always the same for the same n.
const hash01 = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// Adds a rune to a path, centred at (x, y), `size` tall, turned by angle
// (the angle of a point on a circle plus 90° stands it upright, facing out).
function addRune(path, k, x, y, size, angle) {
  const m = new DOMMatrix().translateSelf(x, y).rotateSelf((angle * 180) / Math.PI).scaleSelf(size / 16).translateSelf(-6, -8);
  path.addPath(RUNES[k % RUNES.length], m);
}

// A blank square picture for a sigil of radius R, centred on its middle.
function sigilCanvas(R, scale) {
  const size = 2 * (R + 30);
  const c = document.createElement("canvas");
  c.width = c.height = Math.ceil(size * scale);
  const x = c.getContext("2d");
  x.scale(scale, scale);
  x.translate(size / 2, size / 2);
  x.lineCap = "round";
  x.lineJoin = "round";
  return { c, x, size, scale };
}

// Strokes a path into a sigil picture as golden light, in three layers like
// light cut into the air: a wide amber haze, a warm glow, and a thin,
// almost white-hot core.
const ARC_DEEP = "255, 160, 70", ARC_HOT = "255, 249, 232";
function lightStroke(s, path, alpha, w) {
  const x = s.x;
  x.save();
  x.shadowColor = `rgba(${ARC_DEEP}, ${0.45 * alpha})`;
  x.shadowBlur = 9 * s.scale;
  x.strokeStyle = `rgba(${ARC_DEEP}, ${0.07 * alpha})`;
  x.lineWidth = w * 3.2;
  x.stroke(path);
  x.shadowColor = `rgba(${ARC_GLOW}, ${0.8 * alpha})`;
  x.shadowBlur = 4 * s.scale;
  x.strokeStyle = `rgba(${ARC_GLOW}, ${0.32 * alpha})`;
  x.lineWidth = w * 1.8;
  x.stroke(path);
  x.shadowBlur = 0;
  x.strokeStyle = `rgba(${ARC_HOT}, ${Math.min(1, alpha * 1.15)})`;
  x.lineWidth = w * 0.85;
  x.stroke(path);
  x.restore();
}

// A smaller copy of a picture (the browser smooths it as it shrinks).
function shrink(src, f) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(src.width * f));
  c.height = Math.max(1, Math.round(src.height * f));
  const x = c.getContext("2d");
  x.imageSmoothingQuality = "high";
  x.drawImage(src, 0, 0, c.width, c.height);
  return c;
}

// The bloom of a sigil: its light, blurred at two widths and laid
// together, kept small (it is soft, so it scales up without losing
// anything). Drawn under the crisp lines, it makes the light spill into
// the air around them. Made once, by shrinking: no slow blur filters.
function makeBloom(s) {
  const q = shrink(shrink(s.c, 0.5), 0.5);   // a quarter: the tight glow
  const e = shrink(q, 0.5), w = shrink(shrink(e, 0.5), 0.5);   // an eighth and a thirty-second: the wide glow
  const c = document.createElement("canvas");
  c.width = q.width; c.height = q.height;
  const x = c.getContext("2d");
  x.globalCompositeOperation = "lighter";
  x.imageSmoothingQuality = "high";
  // Mostly the tight glow that hugs the lines; only a little of the wide one.
  x.globalAlpha = 0.7;
  x.drawImage(q, 0, 0);
  x.globalAlpha = 0.35;
  x.drawImage(e, 0, 0, c.width, c.height);
  x.globalAlpha = 0.2;
  x.drawImage(w, 0, 0, c.width, c.height);
  // warm it towards amber, so the bloom reads as heat around gold light
  x.globalCompositeOperation = "source-atop";
  x.fillStyle = `rgba(${ARC_DEEP}, .25)`;
  x.fillRect(0, 0, c.width, c.height);
  return c;
}

// A soft round dot of light, drawn once and reused for every spark and mote.
let glowDot = null;
function glowSprite() {
  if (glowDot) return glowDot;
  glowDot = document.createElement("canvas");
  glowDot.width = glowDot.height = 64;
  const x = glowDot.getContext("2d");
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, `rgba(${ARC_HOT}, 1)`);
  g.addColorStop(0.15, `rgba(${ARC_CORE}, .85)`);
  g.addColorStop(0.4, `rgba(${ARC_GLOW}, .28)`);
  g.addColorStop(1, `rgba(${ARC_DEEP}, 0)`);
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  return glowDot;
}
function glowAt(ctx, x, y, r, alpha) {
  if (alpha <= 0.01) return;
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.drawImage(glowSprite(), x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = 1;
}

const circlePath = (p, r, x = 0, y = 0) => { p.moveTo(x + r, y); p.arc(x, y, r, 0, Math.PI * 2); return p; };

// A band of runes around a circle of radius r: n places, with a small node
// circle instead of a rune at every `every`-th place.
function runeBand(s, r, n, every, size, offset, alpha) {
  const runes = new Path2D(), nodes = new Path2D();
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (k % every === 0) {
      circlePath(nodes, size * 0.42, x, y);
      circlePath(nodes, size * 0.08, x, y);
    } else {
      addRune(runes, (k * 7 + offset) % RUNES.length, x, y, size * (k % 2 ? 1 : 0.86), a + Math.PI / 2);
    }
  }
  lightStroke(s, runes, alpha, 0.85);
  lightStroke(s, nodes, alpha * 0.9, 0.8);
}

// A regular polygon of n points on a circle of radius r, its lines running
// a little past each point.
function starLines(path, r, n, turn, over) {
  for (let k = 0; k < n; k++) {
    const a1 = turn + (k / n) * Math.PI * 2, a2 = turn + ((k + 1) / n) * Math.PI * 2;
    const p1 = { x: Math.cos(a1) * r, y: Math.sin(a1) * r }, p2 = { x: Math.cos(a2) * r, y: Math.sin(a2) * r };
    const d = Math.hypot(p2.x - p1.x, p2.y - p1.y), ux = (p2.x - p1.x) / d, uy = (p2.y - p1.y) / d;
    path.moveTo(p1.x - ux * over, p1.y - uy * over);
    path.lineTo(p2.x + ux * over, p2.y + uy * over);
  }
}

// The drawn sigils, kept by size: the table and the summary each use their own.
const SIGILS = new Map();
function sigilsFor(R1) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const key = `${R1}|${dpr}`;
  if (!SIGILS.has(key)) {
    if (SIGILS.size > 6) SIGILS.delete(SIGILS.keys().next().value);   // forget old sizes after resizing
    SIGILS.set(key, buildSigils(R1, dpr));
  }
  return SIGILS.get(key);
}

// The circle's elements, in the order they appear: each card picked or
// turned adds the next one, faintly, and the last card turned brings in
// the rest and lights them all. Each materialises where it stands, in a
// magical fade. group: part of the inner sigil (turning with it) or the outer one.
const ARC_PARTS = [
  { key: "core",    group: "in" },    // the innermost circle
  { key: "midband", group: "in" },    // the small ring of runes round it
  { key: "star",    group: "in" },    // the six-pointed star
  { key: "ring",    group: "in" },    // the main ring's lines
  { key: "runes",   group: "in" },    // the main band of runes
  { key: "sats",    group: "in" },    // three small circles riding the rim
  { key: "oring",   group: "out" },   // the outer ring's lines
  { key: "orunes",  group: "out" },   // the outer band of runes
  { key: "squares", group: "out" },   // two crossed squares
  { key: "arcs",    group: "out" },   // broken arcs and ticks at the edge
  // The crown: the outermost ring, brought only by the final reveal. Unlike
  // the rest it has no solid line: a string of beads carrying eight rune
  // medallions, turning on its own, slowly, against the ring inside it.
  { key: "crown",   group: "crown", final: true },
];
// The elements the picks and turns share out; the final ones come with the last card turned.
const STEPPED = ARC_PARTS.filter((e) => !e.final);

// The inner sigil's elements, each drawn into its own picture by part(key,
// R, r) (R: how far the picture must reach; r: where its sparks twinkle):
// the innermost circle, the small ring of runes round it, the six-pointed
// star, the main ring's lines and its band of runes, and three satellite
// circles riding the rim. Part of the great circle (see buildSigils).
function drawInnerSigil(R1, part) {
  const TAU = Math.PI * 2, top = -Math.PI / 2, Rm = R1 * 0.56;
  // The innermost circle.
  lightStroke(part("core", R1 * 0.3 + 4, R1 * 0.3), circlePath(circlePath(new Path2D(), R1 * 0.3), R1 * 0.3 - 5), 0.45, 0.7);
  // The small ring of runes round it.
  const mid = part("midband", Rm + 4, Rm);
  lightStroke(mid, circlePath(circlePath(new Path2D(), Rm), Rm - 13), 0.4, 0.6);
  runeBand(mid, Rm - 6.5, 6 * Math.max(3, Math.round((TAU * Rm) / 18 / 6)), 1e9, 8, 5, 0.45);
  // The six-pointed star, its points touching the main ring's inner line.
  const hex = new Path2D();
  for (let tri = 0; tri < 2; tri++) {
    hex.moveTo(Math.cos(top + tri * Math.PI) * (R1 - 22), Math.sin(top + tri * Math.PI) * (R1 - 22));
    for (let k = 1; k <= 3; k++) {
      const ang = top + tri * Math.PI + (k / 3) * TAU;
      hex.lineTo(Math.cos(ang) * (R1 - 22), Math.sin(ang) * (R1 - 22));
    }
  }
  lightStroke(part("star", R1 - 18, R1 - 22), hex, 0.45, 0.7);
  // The main ring's lines.
  const ring = part("ring", R1 + 8, R1);
  lightStroke(ring, circlePath(new Path2D(), R1), 0.85, 1.2);
  lightStroke(ring, circlePath(new Path2D(), R1 - 22), 0.6, 0.8);
  lightStroke(ring, circlePath(new Path2D(), R1 + 5), 0.3, 0.5);
  // The main band of runes.
  const per = Math.max(4, Math.round((TAU * R1) / 24 / 6));
  runeBand(part("runes", R1 - 2, R1 - 11), R1 - 11, 6 * per, per, 11, 0, 0.75);
  // Three small circles riding the rim, each with a rune at its heart.
  const rs = Math.max(13, R1 * 0.11);
  const sats = part("sats", R1 + rs + 2, R1);
  const sat = new Path2D(), satRunes = new Path2D();
  for (let k = 0; k < 3; k++) {
    const ang = top + (k / 3) * TAU + Math.PI / 3;
    const x = Math.cos(ang) * R1, y = Math.sin(ang) * R1;
    circlePath(sat, rs, x, y);
    circlePath(sat, rs * 0.72, x, y);
    addRune(satRunes, [SEAL, 8, 14][k], x, y, rs * 0.9, ang + Math.PI / 2);
  }
  lightStroke(sats, sat, 0.6, 0.8);
  lightStroke(sats, satRunes, 0.7, 0.8);

}

function buildSigils(R1, dpr) {
  const R2 = Math.round(R1 * 1.34 + 12), R3 = R2 + 44;   // R3: where the crown runs
  // Big pictures are drawn at a lower resolution: the light is soft anyway.
  const scale = Math.min(dpr, 2000 / (2 * (R3 + 60)));
  const TAU = Math.PI * 2, top = -Math.PI / 2, Rm = R1 * 0.56;
  // Each element is its own picture (just big enough for it), with its own
  // bloom, and `radius` is where sparks twinkle as it materialises.
  const parts = {}, radius = {};
  const part = (key, R, r) => { const s = sigilCanvas(R, scale); parts[key] = s; radius[key] = r; return s; };

  drawInnerSigil(R1, part);

  // The outer ring's lines.
  const oring = part("oring", R2 + 4, R2);
  lightStroke(oring, circlePath(new Path2D(), R2), 0.8, 1.1);
  lightStroke(oring, circlePath(new Path2D(), R2 - 26), 0.55, 0.8);
  // The outer band of runes.
  const oper = Math.max(3, Math.round((TAU * R2) / 26 / 8));
  runeBand(part("orunes", R2 - 2, R2 - 13), R2 - 13, 8 * oper, oper, 12.5, 3, 0.7);
  // Two crossed squares whose corners sit on the band and whose sides cut through the inner circle.
  const sq = new Path2D();
  starLines(sq, R2 - 26, 4, top, 16);
  starLines(sq, R2 - 26, 4, top + Math.PI / 4, 16);
  lightStroke(part("squares", R2 - 6, R2 - 26), sq, 0.42, 0.75);
  // Broken arcs at the very edge, long on the quarters and short between, and fine ticks.
  const edge = part("arcs", R2 + 24, R2 + 13);
  const arcs = new Path2D();
  for (let k = 0; k < 8; k++) {
    const m = top + (k / 8) * TAU, half = (k % 2 ? 7 : 17) * (Math.PI / 180);
    arcs.moveTo(Math.cos(m - half) * (R2 + 13), Math.sin(m - half) * (R2 + 13));
    arcs.arc(0, 0, R2 + 13, m - half, m + half);
  }
  lightStroke(edge, arcs, 0.5, 0.8);
  const ticks = new Path2D();
  for (let k = 0; k < 72; k++) {
    const ang = (k / 72) * TAU, l = k % 9 === 0 ? 7 : 3;
    ticks.moveTo(Math.cos(ang) * (R2 + 3), Math.sin(ang) * (R2 + 3));
    ticks.lineTo(Math.cos(ang) * (R2 + 3 + l), Math.sin(ang) * (R2 + 3 + l));
  }
  lightStroke(edge, ticks, 0.3, 0.6);

  // The crown: unlike every other ring, no solid line at all. A string of
  // beads of light runs round, carrying eight medallions, each a small
  // double circle holding a large rune; the beads swell towards each
  // medallion and dwindle midway between, where a tiny star marks the gap.
  const crown = part("crown", R3 + 22, R3);
  const M = 8, medR = 15;
  const beads = new Path2D(), meds = new Path2D(), medRunes = new Path2D(), gaps = new Path2D();
  for (let k = 0; k < M; k++) {
    const a = top + (k / M) * TAU, x = Math.cos(a) * R3, y = Math.sin(a) * R3;
    circlePath(meds, medR, x, y);
    circlePath(meds, medR - 4, x, y);
    addRune(medRunes, [SEAL, 10, 14, 8][k % 4], x, y, 15, a + Math.PI / 2);
    // the beads between this medallion and the next
    const span = TAU / M, clear = (medR + 7) / R3, n = Math.max(6, Math.round(((span - 2 * clear) * R3) / 10));
    for (let j = 0; j < n; j++) {
      const u = (j + 0.5) / n, b = a + clear + u * (span - 2 * clear);
      if (Math.abs(u - 0.5) < 0.5 / n) continue;   // the middle bead gives way to the star
      const r = 0.7 + 1.5 * Math.abs(u - 0.5) * 2;   // larger near the medallions
      circlePath(beads, r, Math.cos(b) * R3, Math.sin(b) * R3);
    }
    const m = a + span / 2, sx = Math.cos(m) * R3, sy = Math.sin(m) * R3, s = 3.6;
    gaps.moveTo(sx - s, sy); gaps.lineTo(sx + s, sy);
    gaps.moveTo(sx, sy - s); gaps.lineTo(sx, sy + s);
  }
  lightStroke(crown, beads, 0.55, 0.9);
  lightStroke(crown, meds, 0.55, 0.8);
  lightStroke(crown, medRunes, 0.65, 0.85);
  lightStroke(crown, gaps, 0.45, 0.6);

  // The whole inner and outer sigils, each laid together from its
  // elements, for the summary's portal to turn as one.
  const compose = (R, group) => {
    const c = sigilCanvas(R, scale);
    ARC_PARTS.filter((e) => e.group === group).forEach(({ key }) => {
      const p = parts[key];
      c.x.drawImage(p.c, -p.size / 2, -p.size / 2, p.size, p.size);
    });
    c.bloom = makeBloom(c);
    return c;
  };
  Object.values(parts).forEach((p) => { p.bloom = makeBloom(p); });
  return { R1, R2, R3, parts, radius, inner: compose(R1, "in"), outer: compose(R2 + 24, "out") };
}

// A soft band of purple light round a circle, from radius r0 to r1 at full
// strength and fading away either side. Meant for a canvas drawing with "lighter".
function haloBand(ctx, cx, cy, r0, r1, alpha) {
  if (alpha <= 0.005) return;
  const spill = (r1 - r0) * 0.9 + 30, a = Math.max(0, r0 - spill), b = r1 + spill;
  const g = ctx.createRadialGradient(cx, cy, a, cx, cy, b), at = (r) => (r - a) / (b - a);
  g.addColorStop(0, "rgba(150, 70, 255, 0)");
  g.addColorStop(at(r0), `rgba(150, 70, 255, ${0.6 * alpha})`);
  g.addColorStop(at((r0 + r1) / 2), `rgba(190, 120, 255, ${alpha})`);
  g.addColorStop(at(r1), `rgba(150, 70, 255, ${0.6 * alpha})`);
  g.addColorStop(1, "rgba(150, 70, 255, 0)");
  ctx.save();
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, b, 0, Math.PI * 2);
  ctx.arc(cx, cy, a, 0, Math.PI * 2, true);
  ctx.fill();
  ctx.restore();
}

// Draws a sigil picture centred at (cx, cy), turned, scaled and faded:
// its bloom first, spilling light round it (`glow` sets how much), then
// the crisp lines on top. Meant for a canvas drawing with "lighter".
function drawSigil(ctx, s, cx, cy, rot, k, alpha, glow = 1) {
  if (alpha <= 0.005) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.scale(k, k);
  if (s.bloom && glow > 0) {
    ctx.globalAlpha = Math.min(1, alpha * glow * 0.4);
    ctx.drawImage(s.bloom, -s.size / 2, -s.size / 2, s.size, s.size);
  }
  ctx.globalAlpha = Math.min(1, alpha);
  if (s.c) ctx.drawImage(s.c, -s.size / 2, -s.size / 2, s.size, s.size);
  ctx.restore();
}

// A star flare where light crosses: a hot core, long thin rays across
// and shorter ones up and down, and faint diagonal glints, like the
// sparkles where the lines cross in the reference art.
function glint(ctx, x, y, r, alpha) {
  if (alpha <= 0.01) return;
  alpha = Math.min(1, alpha);
  glowAt(ctx, x, y, r * 2.2, alpha * 0.9);
  const ray = (dx, dy, len, w, a) => {
    const g = ctx.createLinearGradient(x - dx * len, y - dy * len, x + dx * len, y + dy * len);
    g.addColorStop(0, `rgba(${ARC_GLOW}, 0)`);
    g.addColorStop(0.5, `rgba(${ARC_HOT}, ${a})`);
    g.addColorStop(1, `rgba(${ARC_GLOW}, 0)`);
    ctx.strokeStyle = g;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x - dx * len, y - dy * len);
    ctx.lineTo(x + dx * len, y + dy * len);
    ctx.stroke();
  };
  ray(1, 0, r * 3.4, 1, 0.9 * alpha);
  ray(0, 1, r * 2.2, 0.9, 0.75 * alpha);
  ray(0.7071, 0.7071, r * 1.1, 0.6, 0.35 * alpha);
  ray(0.7071, -0.7071, r * 1.1, 0.6, 0.35 * alpha);
}

// Energy running through the rings: comets of light, two to a ring,
// coursing round in turn one way and the other, as if power flowed
// through the circle. radii: [radius, direction, speed]; `fast` speeds them up.
// Each comet is one smooth stroke along its ring whose light fades evenly
// from its head back to nothing (a gradient that runs round the circle),
// with a soft hairline glow under it and a small, gentle head.
function ringPulses(ctx, t, cx, cy, radii, alpha, fast = 1) {
  if (alpha <= 0.01) return;
  const TAU = Math.PI * 2;
  ctx.save();
  ctx.lineCap = "round";
  radii.forEach(([r, dir, sp], j) => {
    for (let n = 0; n < 2; n++) {
      const head = dir * (t / sp) * fast + n * Math.PI + j * 1.7;
      const len = 0.42 + 0.12 * Math.sin(t / 1900 + j + n);   // its tail, in radians
      // The tail runs back from the head against the direction of travel.
      const a0 = dir > 0 ? head - len : head, a1 = dir > 0 ? head : head + len;
      const fadeIn = (o) => {
        if (!ctx.createConicGradient) return `rgba(${ARC_GLOW}, ${o * 0.5})`;
        const g = ctx.createConicGradient(a0, cx, cy), L = len / TAU;
        // brightness along the tail, eased so it thins out smoothly to nothing
        for (let k = 0; k <= 8; k++) {
          const u = k / 8, along = dir > 0 ? u : 1 - u;   // 0 at the tail's end, 1 at the head
          g.addColorStop(u * L, `rgba(${along > 0.8 ? ARC_HOT : ARC_GLOW}, ${o * Math.pow(along, 1.7)})`);
        }
        g.addColorStop(Math.min(1, L + 0.002), `rgba(${ARC_GLOW}, 0)`);
        return g;
      };
      ctx.beginPath();
      ctx.arc(cx, cy, r, a0, a1);
      ctx.strokeStyle = fadeIn(alpha * 0.25);
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.strokeStyle = fadeIn(alpha * 0.85);
      ctx.lineWidth = 1.1;
      ctx.stroke();
      glowAt(ctx, cx + Math.cos(head) * r, cy + Math.sin(head) * r, 4.5, alpha * 0.8);
    }
  });
  ctx.restore();
}

// Light that lives: the circle is drawn into a scratch canvas, then masked
// so its lines fade and return here and there instead of burning evenly.
// Around the ring, the brightness drifts in waves at several speeds; on
// top of that, soft patches dim the lines in passing spots, swelling and
// clearing on their own time. strength 0 leaves it steady; draw(x) draws
// the circle into the scratch canvas, in screen coordinates.
const FLICK = { c: null, x: null };
function livingLight(ctx, t, { cx, cy, R1, R2, extent, strength = 1, seed = 0, mask = null }, draw) {
  const main = ctx.canvas, m = ctx.getTransform(), d = m.a || 1;
  if (!FLICK.c) { FLICK.c = document.createElement("canvas"); FLICK.x = FLICK.c.getContext("2d"); }
  if (FLICK.c.width !== main.width || FLICK.c.height !== main.height) {
    FLICK.c.width = main.width; FLICK.c.height = main.height;
  }
  const x = FLICK.x;
  x.setTransform(d, 0, 0, d, 0, 0);
  // Only the part of the screen the circle covers.
  const W = main.width / d, H = main.height / d;
  const L = Math.max(0, Math.floor(cx - extent)), T = Math.max(0, Math.floor(cy - extent));
  const Rr = Math.min(W, Math.ceil(cx + extent)), B = Math.min(H, Math.ceil(cy + extent));
  if (Rr <= L || B <= T) return;
  x.globalCompositeOperation = "source-over";
  x.globalAlpha = 1;
  x.clearRect(L, T, Rr - L, B - T);
  x.save();
  x.globalCompositeOperation = "lighter";
  draw(x);
  x.restore();
  // An extra shape to keep (feathered fragments of the circle, while it is still forming).
  if (mask) {
    x.globalCompositeOperation = "destination-in";
    x.fillStyle = mask(x);
    x.fillRect(L, T, Rr - L, B - T);
    x.globalCompositeOperation = "source-over";
  }

  if (strength > 0) {
    // Soft round patches where the lines fade out for a while, then return,
    // drifting a little as they go. Only round, feathered shapes: anything
    // with a straight edge would read as the light being cut.
    x.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 11; i++) {
      const period = 2800 + hash01(i + seed * 7) * 4200;
      const tt = t + hash01(i + 40) * period, n = Math.floor(tt / period), ph = (tt % period) / period;
      const a = hash01(n * 3 + i) * Math.PI * 2 + ph * 0.25 * (i % 2 ? 1 : -1);
      const r = R1 * 0.5 + hash01(n * 5 + i + 9) * (R2 + 20 - R1 * 0.5);
      const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
      const size = 45 + hash01(n * 7 + i) * 85;
      const s = strength * 0.8 * Math.sin(Math.PI * ph) ** 2;
      if (s < 0.02) continue;
      const g = x.createRadialGradient(px, py, 0, px, py, size);
      g.addColorStop(0, `rgba(0, 0, 0, ${s})`);
      g.addColorStop(0.45, `rgba(0, 0, 0, ${s * 0.7})`);
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
      x.fillStyle = g;
      x.fillRect(px - size, py - size, size * 2, size * 2);
    }
    x.globalCompositeOperation = "source-over";
  }
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(FLICK.c, L * d, T * d, (Rr - L) * d, (B - T) * d, L * d, T * d, (Rr - L) * d, (B - T) * d);
  ctx.restore();
}

// ── The circle, element by element ──────────────────────
// The circle's elements (ARC_PARTS) are shared out, in order, over every
// card picked and every card turned: a spread of n cards has 2n steps, and
// the earlier steps take any extra. Each step but the last adds its
// elements faintly, one after another; the last card turned adds the final
// ones and lights them all, so the circle comes together on the final
// reveal. One card: picking it draws the inner five, turning it the outer
// five. Five cards: one element a step, the outermost on the last turn.

const PART_INTRO = 1300;     // how long an element takes to materialise (ms)
const PART_STAGGER = 260;    // between elements that arrive in the same step (ms)
const FINAL_STAGGER = 150;   // between the last elements, arriving in the final flare (ms)

// Which step brings element i in, and its place among that step's elements.
function partStep(i, steps) {
  const N = STEPPED.length, base = Math.floor(N / steps), extra = N % steps;
  let start = 0;
  for (let s = 0; s < steps; s++) {
    const size = base + (s < extra ? 1 : 0);
    if (i < start + size) return { step: s, order: i - start };
    start += size;
  }
  return { step: steps - 1, order: 0 };
}

function magicStep() {
  if (!S) return;
  if (!MG.ctx) sizeMagic();
  MG.total = Math.min(STEPPED.length, 2 * S.n);
  if (MG.steps.length >= MG.total - 1) return;   // the last step is the final reveal
  MG.steps.push(performance.now());
  startMagic();
}

// A faint warm haze in the air around the circle, with a breath of violet
// at its edge where it meets the night.
function arcHaze(ctx, cx, cy, r, alpha) {
  if (alpha <= 0.01) return;
  const g = ctx.createRadialGradient(cx, cy, r * 0.15, cx, cy, r);
  g.addColorStop(0, `rgba(${ARC_DEEP}, ${0.025 * alpha})`);
  g.addColorStop(0.55, `rgba(${ARC_DEEP}, ${0.035 * alpha})`);
  g.addColorStop(0.8, `rgba(150, 100, 220, ${0.025 * alpha})`);
  g.addColorStop(1, "rgba(150, 100, 220, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
}

// The great circle, as far as it has come. Before the final reveal (from
// is null) only the elements the steps have added show, faintly. The final
// reveal (from: when it started) is always its climax, however much was
// left to add: light bursts at its heart, a shockwave races outward, the
// last elements materialise in quick succession as the whole circle flares
// far brighter than it will rest, and sparks shower out over the cards.
// Then it settles, whole: energy runs round its rings, sparks flare where
// its lines cross and dust drifts.
// Every element turns on its own: its own direction and a pace of its own,
// far apart from the others (degrees a second, the sign the direction),
// from the innermost circle sweeping round to the crown barely drifting.
// Its speed also swings, slowing and picking up again over a long cycle
// (seconds), so it never lurches. Neighbours mostly turn against each other.
const SPIN_DEG = {
  //        pace   cycle  phase
  core:    [ 9.0,   7.0, 0.0],
  midband: [-6.0,   8.0, 1.1],
  star:    [ 4.0,   9.0, 2.3],
  ring:    [-1.6,  11.0, 0.7],
  runes:   [ 2.8,   8.5, 3.1],
  sats:    [ 5.0,   7.5, 4.2],
  oring:   [-1.1,  12.0, 1.9],
  orunes:  [ 2.2,  10.0, 5.0],
  squares: [-3.0,   9.5, 2.8],
  arcs:    [ 0.7,  14.0, 0.4],
  crown:   [-0.5,  16.0, 3.6],
};
// The same in the units partTurn works in: T is ms per radian (signed),
// P is ms per radian of the speed's swing.
const SPIN = Object.fromEntries(Object.entries(SPIN_DEG).map(([k, [deg, cyc, ph]]) =>
  [k, [(1000 * 180) / Math.PI / deg, (cyc * 1000) / (Math.PI * 2), ph]]));
// Its angle at time t: a steady turn plus a slow swing whose speed is 0.75
// of the steady one, so the total speed rises and falls between a quarter
// and one and three-quarters of its pace without ever turning back.
function partTurn(key, t) {
  const [T, P, ph] = SPIN[key];
  return t / T + 0.75 * (P / Math.abs(T)) * Math.sin(t / P + ph);
}

function drawArcaneCircle(ctx, t, { cx, cy, R1, seal, from }) {
  const TAU = Math.PI * 2, top = -Math.PI / 2;
  const S2 = sigilsFor(R1), R2 = S2.R2, Rm = R1 * 0.56;
  const el = from == null ? -1 : t - from;
  const breathe = 0.86 + 0.14 * Math.sin(t / 2300);
  // The bloom breathes on its own slow beat, out of step with the lines.
  const glow = 0.85 + 0.2 * Math.sin(t / 1700) * Math.sin(t / 3900 + 1);
  // Faint while it gathers; full once the last card is turned.
  const together = from == null ? 0 : easeIO(arcSeg(el, 0, 1500));
  // The final reveal's flare: up fast, then easing back down to rest.
  const surge = from == null ? 0 : easeIO(swell(arcSeg(el, 0, 3000), 0.12));

  // Where each element has got to: those the steps added so far, then
  // the rest in quick succession as the final reveal flares.
  const total = MG.total || 2 * (S ? S.n : 5);
  let rank = 0;
  const state = ARC_PARTS.map((e, i) => {
    // The crown comes only with the final reveal, the last to arrive, just after the rest.
    if (e.final) {
      if (from == null) return null;
      const p = arcSeg(t - (from + 60 + rank * FINAL_STAGGER + 220), 0, PART_INTRO + 300);
      return p > 0 ? { e, i, p, early: false } : null;
    }
    const { step, order } = partStep(i, total);
    let at = MG.steps[step];
    const early = at != null;
    if (early) at += order * PART_STAGGER;
    else {
      if (from == null) return null;
      at = from + 60 + rank++ * FINAL_STAGGER;
    }
    const p = arcSeg(t - at, 0, PART_INTRO);
    return p > 0 ? { e, i, p, early } : null;
  }).filter(Boolean);
  const cascadeEnd = 60 + Math.max(0, rank - 1) * FINAL_STAGGER + PART_INTRO;
  const has = (key) => state.some((s) => s.e.key === key && s.p >= 1);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  // The seal where the threads met (on the table, at the end).
  if (seal) {
    const sb = arcSeg(el, 0, 900);
    const sg = ctx.createRadialGradient(seal.x, seal.y, 0, seal.x, seal.y, 24);
    sg.addColorStop(0, `rgba(${ARC_GLOW}, ${0.25 * sb})`);
    sg.addColorStop(1, `rgba(${ARC_GLOW}, 0)`);
    ctx.fillStyle = sg;
    ctx.fillRect(seal.x - 24, seal.y - 24, 48, 48);
    rune(ctx, RUNES[SEAL], seal.x, seal.y, 10, t / 9000, 0.7 * sb);
  }

  arcHaze(ctx, cx, cy, (from == null ? R2 : S2.R3) * 1.25, (0.35 + 0.65 * together + 1.5 * surge) * (state.length / ARC_PARTS.length) * breathe);

  // The final reveal: a burst of light at the heart, and a shockwave
  // racing out past the edge of the circle.
  if (surge > 0) {
    glowAt(ctx, cx, cy, R1 * 1.1, 0.5 * surge);
    const w = arcSeg(el, 0, 1500);
    if (w < 1) {
      const r = R1 * 0.2 + (S2.R3 * 1.2 - R1 * 0.2) * easeOut(w), a = 1 - w;   // out past the crown
      ctx.lineWidth = 9 * a + 2;
      ctx.strokeStyle = `rgba(${ARC_GLOW}, ${0.22 * a})`;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.stroke();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = `rgba(${ARC_HOT}, ${0.75 * a})`;
      ctx.stroke();
    }
  }

  // Draws one element as far as it has materialised: it fades up while its
  // glow swells and settles, easing in a touch from larger, and flares
  // with the rest of the circle in the final reveal. Each turns at its own
  // drifting pace (partTurn).
  const draw = (x, { e, p, early }) => {
    const full = e.group === "in" ? 0.55 : 0.5;
    const q = easeIO(p);
    const a = full * breathe * (early ? 0.6 + 0.4 * together : 1) * q * (1 + 1.1 * surge);
    const k = 1 + 0.035 * (1 - easeOut(p));
    const g = glow * (1 + 2.2 * Math.sin(Math.PI * p) ** 2) * (1 + 1.6 * surge);
    const rot = partTurn(e.key, t);
    drawSigil(x, S2.parts[e.key], cx, cy, rot, k, a, g);
  };
  livingLight(ctx, t, { cx, cy, R1, R2, extent: S2.R3 + 40, strength: 1 - 0.85 * surge }, (x) => state.forEach((s) => draw(x, s)));

  // Sparks twinkling along each element as it materialises.
  state.forEach(({ i, p }) => {
    if (p >= 1) return;
    const r = S2.radius[ARC_PARTS[i].key];
    for (let j = 0; j < 5; j++) {
      const ph = arcSeg(p, j * 0.12, j * 0.12 + 0.5);
      if (ph <= 0 || ph >= 1) continue;
      const ang = hash01(i * 13 + j) * TAU;
      glint(ctx, cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, 4 + 3 * hash01(i + j * 7), 0.8 * Math.sin(Math.PI * ph));
    }
  });

  // Energy running round the rings that have formed: faint while it
  // gathers, full once it's whole.
  const radii = [];
  if (has("core")) radii.push([R1 * 0.3, -1, 3000]);
  if (has("midband")) radii.push([Rm, 1, 3600]);
  if (has("ring")) radii.push([R1, 1, 5200], [R1 - 22, -1, 4300]);
  if (has("oring")) radii.push([R2, -1, 7600], [R2 - 26, 1, 6400]);
  if (radii.length) ringPulses(ctx, t, cx, cy, radii, (0.25 + 0.3 * (from == null ? 0 : arcSeg(el, cascadeEnd - 600, cascadeEnd + 900))) * breathe);

  // Sparks where lines cross: the star's points, the small circles on the
  // rim and the squares' corners, each on its own slow beat.
  const spark = (x, y, r, i, a) => {
    const v = Math.max(0, Math.sin(t / (1300 + (i % 5) * 270) + i * 2.17));
    glint(ctx, x, y, r, a * v * v * (0.5 + 0.5 * together));
  };
  if (has("crown")) {
    // a soft spark now and then on the crown's medallions
    for (let i = 0; i < 8; i++) {
      const ang = top + (i / 8) * TAU + partTurn("crown", t);
      spark(cx + Math.cos(ang) * S2.R3, cy + Math.sin(ang) * S2.R3, 5, i + 60, 0.4);
    }
  }
  if (has("star")) {
    for (let i = 0; i < 6; i++) {
      const ang = top + (i / 6) * TAU + partTurn("star", t);
      spark(cx + Math.cos(ang) * (R1 - 22), cy + Math.sin(ang) * (R1 - 22), 5, i, 0.6);
    }
  }
  if (has("sats")) {
    for (let i = 0; i < 3; i++) {
      const ang = top + (i / 3) * TAU + Math.PI / 3 + partTurn("sats", t);
      spark(cx + Math.cos(ang) * R1, cy + Math.sin(ang) * R1, 8, i + 20, 0.5);
    }
  }
  if (has("squares")) {
    for (let i = 0; i < 8; i++) {
      const ang = top + (i / 8) * TAU + partTurn("squares", t);
      spark(cx + Math.cos(ang) * (R2 - 26), cy + Math.sin(ang) * (R2 - 26), i % 2 ? 5 : 7, i + 40, 0.65);
    }
  }

  // Glowing dust drifting round between the circles and rising slowly off
  // them, each mote twinkling on its own time, once it comes together.
  if (together > 0) {
    for (let i = 0; i < 60; i++) {
      const r = R1 * 0.5 + hash01(i) * (R2 + 30 - R1 * 0.5);
      const ang = hash01(i + 100) * TAU + (t / (16000 + hash01(i + 200) * 30000)) * (i % 2 ? 1 : -1);
      const life = 5000 + hash01(i + 400) * 6000, ph = ((t + hash01(i + 500) * life) % life) / life;
      const tw = Math.max(0, Math.sin(t / (700 + hash01(i + 300) * 1400) + i)) * Math.sin(Math.PI * ph);
      const a = 0.7 * tw * together;
      if (a < 0.02) continue;
      const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r - ph * 26;
      glowAt(ctx, x, y, 1.6 + hash01(i + 600) * (i % 5 ? 3 : 7), a);
    }
  }
  ctx.restore();
}

addEventListener("resize", () => { if (MG.ctx) { sizeMagic(); if (calm && S) { drawMagic(performance.now() + 10000); drawFrames(performance.now() + 10000); } } });
document.addEventListener("visibilitychange", () => { if (S && !$("table").hidden && MG.cards.length) startMagic(); });
