// Opening the summary through the arcane portal.
// Part of the app; the files in js/ load in the order listed in index.html.

// ── Opening the summary: the arcane portal ──────────────
// Light streaks from every card to the middle of the screen while the
// table dims. The great arcane circle forms there and spins up, faster
// and brighter, its runes blurring. At its height the middle opens like a
// window: the summary shows inside the rune ring, then the window widens
// and pushes the circle outward until the summary fills the screen.
// The cards themselves crumble to dust where they lie, and the black hole
// at the circle's heart draws the dust in (cardsToDust); once the window
// opens they fly back out of it to their places on the summary.
// open(C) must return the summary's sheet, which is revealed through the window (C: its middle).

// A copy of an element, fixed exactly over it, for flying about the screen.
// The copy sits in a wrapper that takes the flight's transforms, so the
// copy keeps its own (a reversed card stays upside down). `look` is the
// part to copy, when it differs from what gives the place on screen.
function flyingCopy(src, z, look = src) {
  const r = src.getBoundingClientRect();
  const c = el("div");
  Object.assign(c.style, {
    position: "fixed", left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`,
    margin: "0", zIndex: z, pointerEvents: "none", transformOrigin: "50% 50%", willChange: "transform, opacity",
  });
  const copy = look.cloneNode(true);
  Object.assign(copy.style, { position: "relative", inset: "auto", width: "100%", height: "100%", margin: "0" });
  c.append(copy);
  document.body.append(c);
  return { c, x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

// The turned cards on the table crumbling to dust where they lie, as the
// fan does round the card of the day (dustToWords, in js/home.js): each
// from its edge nearest the circle outward, a ragged, glowing front eating
// across it, its pieces lifting off as fine dust in the card's own colours,
// blown out a little, then caught by the black hole and drawn in, spiralling
// faster and faster, violet as they near the dark.
// On a canvas of its own, above the portal's light (where the cards were).
// Times are the portal's (s, in its own seconds: see arcanePortal).
const PORTAL_DUST = { from: 0.12, stagger: 0.07, crumble: 0.5, fall: [0.45, 0.7], by: 1.25, perPx: LITE ? 30 : 14, most: LITE ? 260 : 520 };
function cardsToDust(src, C, dpr) {
  const W = innerWidth, H = innerHeight, TAU = Math.PI * 2;
  const r = (a, b) => a + Math.random() * (b - a);
  const smooth = (v) => { v = Math.min(1, Math.max(0, v)); return v * v * (3 - 2 * v); };
  const twist = Math.random() < 0.5 ? -1 : 1;
  const cards = [];
  src.forEach((p) => {
    if (!p.el || !p.el.isConnected) return;
    const face = p.el.querySelector(".cface"), im = face?.querySelector("img");
    if (!face) return;
    const b = face.getBoundingClientRect();
    if (b.width < 2 || b.height < 2) return;
    const flip = face.classList.contains("reversed");
    // Its picture, as it shows.
    const pic = document.createElement("canvas");
    pic.width = Math.ceil(b.width * dpr); pic.height = Math.ceil(b.height * dpr);
    const x = pic.getContext("2d");
    x.scale(dpr, dpr);
    x.beginPath();
    x.roundRect ? x.roundRect(0, 0, b.width, b.height, 7) : x.rect(0, 0, b.width, b.height);
    x.clip();
    x.fillStyle = im ? "#1a1714" : getComputedStyle(face).backgroundColor || "#e9e2d3";
    x.fillRect(0, 0, b.width, b.height);
    if (im?.complete && im.naturalWidth) {
      x.save();
      if (flip) { x.translate(b.width, b.height); x.rotate(Math.PI); }
      x.drawImage(im, 0, 0, b.width, b.height);
      x.restore();
    }
    // Its colours, small, for the dust.
    let px = null;
    try {
      const c = document.createElement("canvas");
      c.width = 12; c.height = 20;
      const y = c.getContext("2d");
      y.drawImage(pic, 0, 0, 12, 20);
      px = y.getImageData(0, 0, 12, 20).data;
    } catch {}
    const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
    cards.push({ cx, cy, W: b.width, H: b.height, pic, px, p: 0,
      dir: Math.sign(cx - C.x) || 1, ph: [r(0, TAU), r(0, TAU), r(0, TAU)],
      count: Math.round(Math.min(PORTAL_DUST.most, Math.max(90, (b.width * b.height) / PORTAL_DUST.perPx))) });
    p.dust = true;
    p.el.style.visibility = "hidden";   // (the picture takes its place)
  });
  // The nearest the circle first.
  cards.sort((a, b) => Math.hypot(a.cx - C.x, a.cy - C.y) - Math.hypot(b.cx - C.x, b.cy - C.y));
  cards.forEach((cd, i) => { cd.start = PORTAL_DUST.from + Math.min(i, 9) * PORTAL_DUST.stagger; });
  if (!cards.length) return null;

  const cv = el("canvas", "portal-dust");
  cv.setAttribute("aria-hidden", "true");
  cv.width = W * dpr; cv.height = H * dpr;
  Object.assign(cv.style, { position: "fixed", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: 9001 });
  document.body.append(cv);
  const ctx = cv.getContext("2d");

  const spot = document.createElement("canvas");
  spot.width = spot.height = 32;
  {
    const x = spot.getContext("2d"), g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "rgba(255, 246, 220, 1)");
    g.addColorStop(0.25, "rgba(255, 214, 140, .55)");
    g.addColorStop(1, "rgba(255, 170, 80, 0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 32, 32);
  }

  // How far a card's crumbling has eaten across it at height ly (its own x of the front).
  const front = (cd, p, ly) => {
    const rag = 0.075 * cd.W * (Math.sin(ly * 0.09 + cd.ph[0]) + 0.6 * Math.sin(ly * 0.23 + cd.ph[1]) + 0.35 * Math.sin(ly * 0.53 + cd.ph[2])) / 1.95;
    return -cd.dir * cd.W / 2 + cd.dir * (p * cd.W * 1.3 - 0.15 * cd.W + rag + 0.08 * cd.W * (ly / cd.H));
  };
  const colourAt = (cd, lx, ly) => {
    if (!cd.px) return [201, 169, 110];
    const fx = Math.min(1, Math.max(0, lx / cd.W + 0.5)), fy = Math.min(1, Math.max(0, ly / cd.H + 0.5));
    const i = (Math.min(19, Math.floor(fy * 20)) * 12 + Math.min(11, Math.floor(fx * 12))) * 4;
    return [cd.px[i], cd.px[i + 1], cd.px[i + 2]];
  };
  const dust = [];
  function shed(s, cd, p0, p1) {
    const n = Math.round(cd.count * (p1 - p0) * 1.3);
    for (let j = 0; j < n; j++) {
      const ly = r(-cd.H / 2, cd.H / 2), a = front(cd, p0, ly), b = front(cd, p1, ly);
      const lx = a + Math.random() * (b - a);
      if (Math.abs(lx) > cd.W / 2) continue;
      const x = cd.cx + lx, y = cd.cy + ly, dx = x - C.x, dy = y - C.y;
      dust.push({ r0: Math.hypot(dx, dy), a0: Math.atan2(dy, dx), born: s,
        dur: Math.max(0.15, Math.min(r(...PORTAL_DUST.fall), PORTAL_DUST.by - s)),
        size: r(0.7, 2.1), col: colourAt(cd, lx, ly), puff: r(0.08, 0.28), spin: r(1.8, 3), glow: Math.random() < 0.35, x, y });
    }
  }
  const ASH = [150, 140, 196], EMBER = [255, 214, 150], VIOLET = [190, 140, 255];
  const mix = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  const STEPS = 26;

  // One moment of it: `s` the portal's time, `R` the hole's edge.
  function draw(s, R) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cards.forEach((cd) => {
      const u = Math.min(1, Math.max(0, (s - cd.start) / PORTAL_DUST.crumble));
      const p = smooth(u) * 0.6 + 0.4 * u;
      if (p > cd.p) { shed(s, cd, cd.p, p); cd.p = p; }
      if (cd.p >= 1) return;
      const ys = Array.from({ length: STEPS + 1 }, (_, j) => -cd.H / 2 - 2 + ((cd.H + 4) * j) / STEPS);
      const edge = () => ys.forEach((ly, j) => (j ? ctx.lineTo(front(cd, cd.p, ly), ly) : ctx.moveTo(front(cd, cd.p, ly), ly)));
      ctx.save();
      ctx.translate(cd.cx, cd.cy);
      ctx.save();
      ctx.beginPath();
      edge();
      ctx.lineTo(cd.dir * (cd.W / 2 + 6), cd.H / 2 + 2);
      ctx.lineTo(cd.dir * (cd.W / 2 + 6), -cd.H / 2 - 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(cd.pic, -cd.W / 2, -cd.H / 2, cd.W, cd.H);
      ctx.restore();
      // The front glows as it eats in: a ragged line of embers.
      if (cd.p > 0) {
        ctx.beginPath();
        ctx.rect(-cd.W / 2, -cd.H / 2, cd.W, cd.H);
        ctx.clip();
        ctx.globalCompositeOperation = "lighter";
        ctx.lineCap = ctx.lineJoin = "round";
        const glow = Math.sin(Math.PI * Math.min(1, cd.p * 1.15));
        [[7, 0.35], [2.4, 0.7], [0.9, 1]].forEach(([lw, a]) => {
          ctx.strokeStyle = `rgba(255, ${lw > 2 ? 170 : 226}, ${lw > 2 ? 90 : 170}, ${(a * glow).toFixed(3)})`;
          ctx.lineWidth = lw;
          ctx.beginPath();
          edge();
          ctx.stroke();
        });
      }
      ctx.restore();
    });
    // The grains: blown out a little, then caught, each spiralling in,
    // quicker and quicker, until it's gone into the dark.
    for (let j = 0; j < dust.length; j++) {
      const d = dust[j], u = (s - d.born) / d.dur;
      if (u >= 1) { dust[j] = dust[dust.length - 1]; dust.pop(); j--; continue; }
      const fall = Math.pow(u, 1.9);
      const rr = R + (d.r0 * (1 + d.puff * Math.sin(Math.PI * Math.min(1, u * 2.2))) - R) * (1 - fall);
      const a = d.a0 + twist * d.spin * Math.pow(u, 2.2);
      const x = C.x + Math.cos(a) * rr, y = C.y + Math.sin(a) * rr;
      const age = s - d.born, heat = Math.exp(-age / 0.17);
      let col = mix(mix(d.col, ASH, smooth(age / 0.5) * 0.45), EMBER, heat * 0.85);
      col = mix(col, VIOLET, smooth((u - 0.45) / 0.55));
      const al = (0.6 + 0.4 * heat) * (1 - smooth((u - 0.85) / 0.15));
      const size = d.size * (1 - 0.35 * fall);
      if (u > 0.4) {
        ctx.strokeStyle = `rgba(${col[0] | 0}, ${col[1] | 0}, ${col[2] | 0}, ${(0.45 * al).toFixed(3)})`;
        ctx.lineWidth = size * 0.8;
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(x, y); ctx.stroke();
      }
      d.x = x; d.y = y;
      ctx.fillStyle = `rgba(${col[0] | 0}, ${col[1] | 0}, ${col[2] | 0}, ${al.toFixed(3)})`;
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
      const gl = d.glow ? Math.max(heat * 0.5, 0.3 * Math.sin(Math.PI * u)) : heat * 0.25;
      if (gl > 0.03) {
        const gr = size * 3 + 2;
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = Math.min(1, gl * al);
        ctx.drawImage(spot, x - gr, y - gr, gr * 2, gr * 2);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }
    }
  }
  return { draw, remove: () => cv.remove() };
}

// The cards coming back out of the portal: each flies from its heart,
// tiny and spinning, to its own place in the summary's row of cards,
// and flares softly as it lands.
function emergeCards(sheet, C) {
  const k = portalPace;
  [...sheet.querySelectorAll(".summary-cards .related-pic")].forEach((pic, i) => {
    const { c, x, y } = flyingCopy(pic, 9002);
    pic.style.visibility = "hidden";
    const turn = i % 2 ? 540 : -540;
    const a = c.animate([
      { transform: `translate(${C.x - x}px, ${C.y - y}px) rotate(${turn}deg) scale(.05)`, opacity: 0, filter: "brightness(3)" },
      { opacity: 1, offset: 0.2 },
      { transform: "none", opacity: 1, filter: "brightness(1)" },
    ], { duration: 1100 / k, delay: (220 + i * 110) / k, easing: "cubic-bezier(.16,.84,.24,1)", fill: "backwards" });
    let landed = false;
    const land = () => {
      if (landed) return;
      landed = true;
      c.remove();
      pic.style.visibility = "";
      pic.animate([{ filter: "brightness(1.3) drop-shadow(0 0 10px rgba(214, 178, 112, .6))" }, { filter: "none" }], { duration: 650 / k, easing: "ease-out" });
    };
    a.onfinish = land;
    // If the page's animations stall (the tab hidden mid-flight), land the card anyway.
    setTimeout(land, (220 + i * 110 + 1100) / k + 800);
  });
}

// The arcane colours the portal's light runs through, from the first moment
// to the last: purple, deepening to indigo, then flushing pink. `veil`: the
// deep indigo the dimming over the table takes on.
// The portal's one warm accent: a muted, antique gold (soft, not neon).
const PORTAL_GOLD = "214, 178, 112";
// The motes of light passing by as the portal opens: a warm yellow gold.
const SPARK_GOLD = "240, 192, 80";
const PORTAL_PALETTE = { veil: "#120B2E", light: ["#A25CFF", "#5B4BFF", "#8A4DFF", "#FF5FC8"] };
// The circles' own shades: each ring of the portal's circle is drawn in one
// of these, neighbours in different ones, so they never all look alike.
const CIRCLE_TINTS = {
  deep:   [112, 30, 205],    // deep purple
  purple: [176, 88, 255],    // purple
  indigo: [72, 92, 255],     // indigo
};
// How each ring of the portal's circle turns: its own pace and direction
// (radians for each unit the circle turns), neighbours going opposite ways.
const PORTAL_SPIN = {
  core: 0.9, midband: -1.3, star: 0.45, ring: -0.3, runes: 0.75, sats: -0.55,
  oring: 0.35, orunes: -0.6, squares: 0.25, arcs: -0.4, crown: 0.2,
};
// The parts drawn as plain lines rather than runes or beads.
const PLAIN_PARTS = new Set(["core", "star", "ring", "sats", "oring", "squares", "arcs"]);
const PART_TINT = {
  core: "deep", midband: "indigo", star: "purple", ring: "deep", runes: "purple", sats: "indigo",
  oring: "purple", orunes: "indigo", squares: "deep", arcs: "indigo", crown: "purple",
};
// A sigil picture (and its bloom) recoloured in one shade, made once and kept.
const TINTED = new WeakMap();
function tintedSigil(s, rgb) {
  let byTint = TINTED.get(s);
  if (!byTint) TINTED.set(s, (byTint = new Map()));
  const key = rgb.join(", ");
  if (!byTint.has(key)) {
    const tint = (src) => {
      const c = document.createElement("canvas");
      c.width = src.width; c.height = src.height;
      const x = c.getContext("2d");
      x.drawImage(src, 0, 0);
      x.globalCompositeOperation = "source-atop";   // only where there's light, keeping how strong it is
      x.fillStyle = `rgba(${key}, .88)`;            // a touch of the white-hot core still shows
      x.fillRect(0, 0, c.width, c.height);
      return c;
    };
    byTint.set(key, { c: tint(s.c), bloom: s.bloom && tint(s.bloom), size: s.size });
  }
  return byTint.get(key);
}

// The palette as the colours the portal's light is painted in. Deeper
// colours are lifted to glowing strength (same hue, brighter), since light can't glow dark.
function portalTints(p) {
  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const lift = (c) => { const m = Math.max(...c); return m < 215 ? c.map((v) => Math.round((v * 215) / m)) : c; };
  return { tints: p.light.map((h) => lift(rgb(h))), veil: rgb(p.veil) };
}

function arcanePortal(points, open) {
  const W = innerWidth, H = innerHeight;
  // On the table, the portal is the great circle already turning behind the
  // spread: it takes it over where it is, as it is, and the table stops
  // drawing its own until the portal is done. From the History there is no
  // circle yet, so one forms in the middle of the screen.
  if (points.length && MG.finale && MG.ctx) drawMagic(performance.now());   // brings MG.great up to date
  const G = points.length && MG.finale && MG.great ? MG.great : null;
  const C = G ? { x: G.cx, y: G.cy } : { x: W / 2, y: H * 0.46 };
  const R1 = G ? G.R1 : Math.round(Math.min(W, H) * 0.25);
  const sig = sigilsFor(R1), R2 = sig.R2;
  if (G) MG.portal = true;
  const { tints, veil: veilTo } = portalTints(PORTAL_PALETTE);
  const far = Math.hypot(Math.max(C.x, W - C.x), Math.max(C.y, H - C.y)) + 4;
  // From the History there are no cards on screen: the light comes from the edges instead.
  const src = points.length ? points : Array.from({ length: 5 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    return { x: C.x + Math.cos(a) * far, y: C.y + Math.sin(a) * far, w: 0, h: 0 };
  });

  const cv = el("canvas", "portal-fx");
  cv.setAttribute("aria-hidden", "true");
  const dpr = LITE ? 1 : PX(1.5);   // soft light: no need for more
  cv.width = W * dpr; cv.height = H * dpr;
  Object.assign(cv.style, { position: "fixed", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: 9000 });
  // The veil dimming the table goes on its own canvas underneath, so the
  // light's change of colour (a filter on the canvas above) leaves it be.
  const veilCv = cv.cloneNode();
  veilCv.className = "portal-veil";
  // The circles themselves are drawn on one more, kept off the page: each
  // frame it is added on top of the rest of the light (cheaper than a
  // blend mode, which would re-blend the whole page every frame).
  const circCv = cv.cloneNode();
  document.body.append(veilCv, cv);
  // (and one more for the circle as the black hole bends it)
  const lensCv = cv.cloneNode(), lctx = lensCv.getContext("2d");
  const ctx = cv.getContext("2d"), vctx = veilCv.getContext("2d"), cctx = circCv.getContext("2d");
  [ctx, vctx, cctx].forEach((x) => x.setTransform(dpr, 0, 0, dpr, 0, 0));

  // The turned cards crumble to dust where they lie, and the black hole takes
  // the dust (pictures of them above the light; the real ones wait, hidden,
  // under the summary).
  const cardDust = cardsToDust(src, C, dpr);
  // The top layer (above the cards) fades as the cards leave.
  const frames = src.some((p) => p.dust) && $("frames");
  const framesFade = frames && frames.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700 / portalPace, delay: 300 / portalPace, fill: "forwards" });
  // When the window opens, how wide it is, and when it's all over (seconds).
  const OPEN = 1.15, SHOW = 1.55, END = 2.2, SLOW = 1.4 / portalPace;   // (faster on a repeat: see summonSummary)
  const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(2 - 2 * p, 3) / 2);
  // As it spins up, the whole circle swells to this much bigger.
  const SWELL = 1.3;
  const swellAt = (s) => 1 + (SWELL - 1) * easeInOut(arcSeg(s, 0.4, OPEN));
  const RW = R1 * 0.9 * SWELL;   // the window's first width: just inside the swollen inner ring
  // One unbroken burst: it pops open at once, then rushes outward ever
  // faster, never pausing, as if flying through it.
  const crossing = (s) => arcSeg(s, OPEN, END - 0.1);
  const radius = (s) => {
    const u = crossing(s);
    return RW * 0.6 * Math.sqrt(u) + (far - RW * 0.6) * u * u;
  };

  // Sparks thrown off the rim when the window opens.
  const dust = Array.from({ length: 70 }, (_, i) => ({
    a: hash01(i) * Math.PI * 2, v: 60 + hash01(i + 50) * 260, life: 0.5 + hash01(i + 90) * 0.7, r: 0.8 + hash01(i + 130) * 1.6,
  }));

  // Motes of light drawn in out of the air, each on its own spiral path:
  // when it sets off, how long it takes, where from, how far out, how big.
  const motes = Array.from({ length: 60 }, (_, i) => ({
    at: 0.05 + hash01(i + 300) * (OPEN - 0.55), dur: 0.7 + hash01(i + 400) * 0.5,
    a: hash01(i + 500) * Math.PI * 2, d: hash01(i + 600), r: hash01(i + 700),
  }));
  // The held breath: just before the window opens the circle slows almost
  // to a stop and draws in on itself, then lets go.
  // (No longer: it read as a pause. The window bursts open straight away.)
  const holdAt = () => 0;
  const releaseAt = (s) => { const u = arcSeg(s, OPEN, OPEN + 0.35); return Math.sin(Math.PI * u) * (1 - u * 0.4); };

  // Passing through: once the window opens, its middle is blurred and
  // blooming, clearing as it widens, while sparkles rush out past you from
  // the heart of it, as if flying through. The blur is a layer of its own
  // over the summary (under the light), strongest in the middle.
  const blurEl = el("div", "portal-blur");
  blurEl.setAttribute("aria-hidden", "true");
  Object.assign(blurEl.style, { position: "fixed", inset: "0", pointerEvents: "none", zIndex: 8999 });
  const warp = Array.from({ length: 110 }, (_, i) => ({
    // (only once the black hole at its heart has let go: see `hole`)
    at: OPEN + 0.3 + hash01(i + 900) * 0.25, life: 0.3 + hash01(i + 1000) * 0.35,
    a: hash01(i + 1100) * Math.PI * 2, w: 0.8 + hash01(i + 1200) * 1.1,
  }));

  // Streaks of light spiralling into the black hole: where each sets off,
  // how fast it falls, where in its fall it starts, how thick, how hot.
  const swirl = Array.from({ length: 46 }, (_, i) => ({
    a: hash01(i + 1500) * Math.PI * 2, v: 1.6 + hash01(i + 1600) * 1.6, ph: hash01(i + 1700),
    w: 0.8 + hash01(i + 1800) * 1.6, hot: hash01(i + 1900) > 0.7,
  }));

  // One gold mote, glow and all, drawn once and stamped for every sparkle.
  const sparkSprite = document.createElement("canvas");
  sparkSprite.width = sparkSprite.height = 64;
  {
    const g = sparkSprite.getContext("2d"), h = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    h.addColorStop(0, `rgba(${SPARK_GOLD}, .55)`);
    h.addColorStop(0.35, `rgba(${SPARK_GOLD}, .18)`);
    h.addColorStop(1, `rgba(${SPARK_GOLD}, 0)`);
    g.fillStyle = h;
    g.fillRect(0, 0, 64, 64);
    g.fillStyle = "rgba(255, 222, 130, .95)";
    g.beginPath();
    g.arc(32, 32, 6.4, 0, Math.PI * 2);
    g.fill();
  }

  let sheet = null, rot = 0, last = 0, pulseT = null, flare = -Math.PI / 2;
  const t0 = performance.now();
  requestAnimationFrame(function frame(now) {
    // The portal's own clock runs at SLOW: the whole switch takes its time.
    const s = (now - t0) / 1000 / SLOW, dt = last ? Math.min(0.05, s - last) : 0;
    last = s;
    if (s >= OPEN && !sheet) {
      sheet = open(C) || null;
      if (sheet) {
        sheet.style.clipPath = "circle(0px at 50% 50%)";
        emergeCards(sheet, C);
        document.body.append(blurEl);
      }
    }
    const r = radius(s);
    // How strongly the black hole holds the window's heart: it forms as the
    // window opens and lets go as you cross through.
    // It forms early, as the first cards start to fall, swallowing the
    // circle's two innermost rings and turning in their place.
    const form = easeOut(arcSeg(s, 0.2, 0.75));
    const hole = form * (1 - easeIO(arcSeg(crossing(s), 0.25, 0.55)));
    // How a ring is being eaten: [how much it has shrunk, how much is left of it].
    const eaten = (key) => (key === "core" || key === "midband") ? [1 - 0.65 * form, 1 - form] : [1, 1];
    // The light takes the palette's first colour the moment it starts and
    // runs through the rest in turn, reaching the last just as it is gone:
    // only purples, start to finish. (Painted over the light at the end of
    // the frame; the veil darkens into the palette's own dark colour.)
    const shift = arcSeg(s, 0, END);
    const veilRGB = [12, 10, 20].map((v, k) => Math.round(v + (veilTo[k] * 0.8 - v) * shift)).join(", ");
    if (sheet) {
      // Crossing over: the page beyond rushes up to meet you, settling as you
      // arrive. (The window is cut before the zoom, so it's drawn smaller to match.)
      const z = Math.pow(1 - crossing(s), 2), zoom = 1 + 0.22 * z;
      sheet.style.clipPath = `circle(${r / zoom}px at ${C.x}px ${C.y}px)`;
      sheet.style.transformOrigin = `${C.x}px ${C.y}px`;
      sheet.style.transform = z > 0.001 ? `scale(${zoom.toFixed(4)})` : "";
    }
    ctx.clearRect(0, 0, W, H);
    vctx.clearRect(0, 0, W, H);
    cctx.clearRect(0, 0, W, H);

    // The table dims, except through the window.
    const veil = 0.6 * arcSeg(s, 0, 0.45) * (1 - arcSeg(s, END - 0.5, END));
    vctx.fillStyle = `rgba(${veilRGB}, ${veil})`;
    vctx.fillRect(0, 0, W, H);
    if (r > 0) {
      vctx.globalCompositeOperation = "destination-out";
      vctx.beginPath();
      vctx.arc(C.x, C.y, r, 0, Math.PI * 2);
      vctx.fill();
      vctx.globalCompositeOperation = "source-over";
    }
    ctx.globalCompositeOperation = "lighter";

    // Streaks of light from the cards, swirling in to the middle (the cards
    // themselves go to dust: see cardsToDust).
    src.forEach((p, i) => {
      const u = arcSeg(s, i * 0.05, 0.55 + i * 0.05);
      const e = easeIO(u);
      const dx = C.x - p.x, dy = C.y - p.y;
      const m = { x: (p.x + C.x) / 2 - dy * 0.35, y: (p.y + C.y) / 2 + dx * 0.35 };
      const at = (v) => ({ x: (1 - v) * (1 - v) * p.x + 2 * (1 - v) * v * m.x + v * v * C.x, y: (1 - v) * (1 - v) * p.y + 2 * (1 - v) * v * m.y + v * v * C.y });
      if (p.h && u < 0.4) {
        const q = u / 0.4;
        ctx.strokeStyle = `rgba(${ARC_CORE}, ${0.7 * (1 - q)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.hypot(p.w, p.h) * (0.45 + q * 0.25), 0, Math.PI * 2);
        ctx.stroke();
      }
      if (u <= 0 || u >= 1) return;
      ctx.lineCap = "round";
      for (let k = 0; k < 12; k++) {
        const a = at(Math.max(0, e - k * 0.018)), b = at(Math.max(0, e - (k + 1) * 0.018));
        ctx.strokeStyle = `rgba(${ARC_CORE}, ${0.55 * (1 - k / 12)})`;
        ctx.lineWidth = 3 * (1 - k / 12) + 0.4;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      { const h = at(e); glint(ctx, h.x, h.y, 7, 1); }
    });

    // The circle quickens gently as it charges, then whirls up as the window
    // opens. It surges unevenly throughout, as if
    // pushed along by the energy rather than driven. The table's circle
    // carries on from its own slow turn; a new one forms first.
    const surge = 1 + 0.2 * Math.sin(s * 4.3) + 0.1 * Math.sin(s * 7.7 + 1);
    const hold = holdAt(s);
    // (It only quickens a little: the charge shows as light, not speed.)
    // As the window bursts open, the circle whirls up with it, faster and
    // faster as you cross through.
    const whirl = Math.pow(arcSeg(s, OPEN - 0.15, END), 1.4);
    const speed = (0.25 + 0.55 * Math.pow(arcSeg(s, 0.6, OPEN), 1.8) + 2.2 * whirl) * surge * (1 - 0.92 * hold);
    rot += speed * dt;
    // The energy's own clock: it carries on from the table's, then runs up to eight times as fast.
    pulseT = pulseT === null ? now : pulseT + dt * 1000 * (1 + 1.5 * arcSeg(s, 0.4, OPEN));
    // Every ring turns slowly at its own pace and in its own direction
    // (PORTAL_SPIN); the table's circle carries on from where each part is.
    const turnOf = (key) => (G ? partTurn(key, now) : 0) + PORTAL_SPIN[key] * rot;
    const behind = (key, lag) => turnOf(key) - Math.sign(PORTAL_SPIN[key]) * lag;
    // The table's circle is taken over whole (it has come together by the
    // time the summary can be opened); a new one sweeps in and grows.
    const sweep = G ? 1 : easeIO(arcSeg(s, 0.3, 0.8));
    const grow = G ? 1 : easeOut(arcSeg(s, 0.55, 1.0));
    const charge = arcSeg(s, 0.4, OPEN);
    // It swells as it spins up; then the widening window pushes it out further.
    // (It draws in while holding its breath, and kicks outward as it lets go.)
    const push = swellAt(s) * Math.max(1, r / RW) * (1 - 0.08 * hold + 0.1 * releaseAt(s));
    const fade = 1 - arcSeg(Math.max(1, r / RW), 1.25, 2.4);   // fading only once the window pushes it out
    // It starts exactly as bright as it was on the table, then grows stronger.
    const base = G ? 0.55 * (0.86 + 0.14 * Math.sin(now / 2300)) : 0.55;
    const bright = (base + 0.75 * Math.pow(charge, 1.5)) * fade;
    // Once the window is open, the circle shows only around it, never over the page inside.
    ctx.save();
    if (r > 0) {
      ctx.beginPath();
      ctx.rect(0, 0, W, H);
      ctx.arc(C.x, C.y, r, 0, Math.PI * 2);
      ctx.clip("evenodd");
    }
    // The haze and the bloom grow as it charges: the light spills further into the air.
    // As it charges, a glow gathers round every rune and line, growing
    // stronger and wider rather than the circle spinning faster.
    const glowUp = (G ? 0.85 + 0.2 * Math.sin(now / 1700) * Math.sin(now / 3900 + 1) : 1) + 2.4 * Math.pow(charge, 1.2);
    arcHaze(ctx, C.x, C.y, R2 * push * 1.3, (1 + 2.5 * charge) * fade * Math.max(sweep, 0.3));
    // At speed, the runes blur: the circle is drawn a few times, just behind
    // itself (only the first copy carries the bloom). It's drawn through the
    // same living light as on the table, whose flicker steadies into full
    // power as it charges.
    // The circles go on their own canvas, each ring in its own shade of
    // purple (CIRCLE_TINTS), untouched by the colour painted over the rest.
    cctx.save();
    if (r > 0) {
      cctx.beginPath();
      cctx.rect(0, 0, W, H);
      cctx.arc(C.x, C.y, r, 0, Math.PI * 2);
      cctx.clip("evenodd");
    }
    livingLight(cctx, G ? now : s * 1000, { cx: C.x, cy: C.y, R1: R1 * push, R2: R2 * push, extent: 4000, strength: 1 - 0.8 * charge }, (x) => {
    // (Once the circle spun fast enough to smear, it was drawn a few times
    // behind itself; turning slowly as it does now, once is enough.)
    const blur = 1, melt = easeIO(arcSeg(s, 0.05, 0.7));
    for (let k = 0; k < blur; k++) {
      // The lines brighten as it charges (crisp over their glow, which keeps its own strength).
      const crisp = 1 + 0.9 * charge;
      const lag = 0, a = bright * crisp;
      // Once the window opens and the circle swells past the screen, its
      // plain lines (rings, star, squares) would show as long hard strokes:
      // they melt into a faint haze of their own glow, leaving the runes,
      // themselves dimmed, to carry the circle out.
      const layer = (s2, rr, kk, aa, tint, plain) => {
        const t = tintedSigil(s2, CIRCLE_TINTS[tint]);
        const m = Math.min(1, aa), keep = plain ? 1 - 0.92 * melt : 1 - 0.45 * melt;
        const g = (glowUp * aa) / crisp / m * (plain ? 1 - 0.6 * melt : 1 - 0.3 * melt);
        // (the bloom keeps its own strength while the crisp lines fade)
        if (keep < 1) {
          drawSigil(x, { ...t, c: null }, C.x, C.y, rr, kk, m, g);
          drawSigil(x, { ...t, bloom: null }, C.x, C.y, rr, kk, m * keep, 0);
        } else drawSigil(x, t, C.x, C.y, rr, kk, m, g);
        if (aa > 1.02) drawSigil(x, t, C.x, C.y, rr, kk, (aa - 1) * keep, 0);   // past full strength, the lines again on top
      };
      const parts = (group, kk, aa) => ARC_PARTS.forEach((e) => {
        const [ek, ea] = eaten(e.key);
        if (e.group === group) layer(sig.parts[e.key], behind(e.key, lag), kk * ek, aa * ea, PART_TINT[e.key], PLAIN_PARTS.has(e.key));
      });
      if (G) {
        // The table's circle: every element carries on from its own drifting
        // turn and spins up in its own direction, the inner ones fastest and
        // the crown most gently; each blurs just behind itself.
        ARC_PARTS.forEach((e) => {
          const [ek, ea] = eaten(e.key);
          layer(sig.parts[e.key], behind(e.key, lag), push * ek, (e.group === "in" ? a : a * 0.9) * ea, PART_TINT[e.key], PLAIN_PARTS.has(e.key));
        });
      } else {
        // A circle forming afresh (from the History): the inner sigil sweeps
        // in, the outer one grows out of it, each ring turning its own way.
        if (sweep < 1) {
          x.save();
          x.beginPath();
          x.moveTo(C.x, C.y);
          x.arc(C.x, C.y, sig.inner.size, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * sweep);
          x.closePath();
          x.clip();
          parts("in", push, a);
          x.restore();
        } else {
          parts("in", push, a);
        }
        const kOut = (R1 / R2 + (1 - R1 / R2) * grow) * push;
        if (grow > 0) parts("out", kOut, a * 0.9 * grow);
        if (grow > 0) layer(sig.parts.crown, behind("crown", lag), kOut, a * 0.9 * grow, PART_TINT.crown, false);
      }
    }
    });
    // The outer runes flaring: as the widening window pushes the circle out,
    // the outer band of runes blazes up, brighter and brighter, shimmering,
    // then goes out with the rest just before the end.
    const flareOut = easeOut(arcSeg(s, SHOW - 0.15, SHOW + 0.3)) * (0.6 + 0.4 * arcSeg(s, SHOW, END - 0.4))
      * (1 - arcSeg(s, END - 0.4, END - 0.05));
    if (flareOut > 0.01 && (G || grow > 0.5)) {
      const kOut = G ? push : (R1 / R2 + (1 - R1 / R2) * grow) * push;
      const shimmer = 0.8 + 0.2 * Math.sin(s * 37) * Math.sin(s * 23 + 1);
      // Both bands of runes: the outer one, and the inner one the window
      // pushes out past it (the one nearest the window's edge).
      [["orunes", kOut, turnOf("orunes")], ["runes", push, turnOf("runes")]].forEach(([key, k, turn]) => {
        const runes = sig.parts[key];
        // Pass after pass, each adding its light: a blaze with a wide bloom.
        for (let j = 0; j < 2; j++) {
          drawSigil(cctx, tintedSigil(runes, CIRCLE_TINTS[j ? "indigo" : "purple"]), C.x, C.y, turn, k, (j ? 0.55 : 0.75) * flareOut * shimmer, 6);
        }
      });
    }
    // The final surge: as the crossing nears its end, the outermost rings
    // flood with purple bloom, pass on pass of it, the magic at full strength
    // as they sweep out past the edges of the screen.
    const surgeOut = Math.sin(Math.PI * arcSeg(crossing(s), 0.25, 0.9));
    if (surgeOut > 0.01 && (G || grow > 0.5)) {
      const kOut = G ? push : (R1 / R2 + (1 - R1 / R2) * grow) * push;
      const throb = 0.85 + 0.15 * Math.sin(s * 29);
      // A broad band of purple light spilling either side of the outer rings.
      haloBand(cctx, C.x, C.y, sig.R2 * kOut, (sig.R3 + 22) * kOut, 0.55 * surgeOut * throb);
      [["crown", "purple"], ["orunes", "purple"], ["oring", "deep"], ["arcs", "purple"]].forEach(([key, tint]) => {
        const t = tintedSigil(sig.parts[key], CIRCLE_TINTS[tint]), turn = turnOf(key);
        const glowOnly = { ...t, c: null };
        // A wide halo (the bloom drawn a touch larger), then the tight glow hugging the lines.
        drawSigil(cctx, glowOnly, C.x, C.y, turn, kOut * 1.012, 1, 2.2 * surgeOut * throb);
        drawSigil(cctx, glowOnly, C.x, C.y, turn, kOut, 1, 3 * surgeOut * throb);
        drawSigil(cctx, glowOnly, C.x, C.y, turn, kOut, 1, 2 * surgeOut * throb);
        drawSigil(cctx, { ...t, bloom: null }, C.x, C.y, turn, kOut, 0.6 * surgeOut, 0);
      });
    }
    cctx.restore();
    // Energy racing round the rings, faster and brighter as it charges.
    if (sweep >= 1) {
      const g = (R1 / R2 + (1 - R1 / R2) * grow) * push;
      const radii = [[R1 * push, 1, 5200], [(R1 - 22) * push, -1, 4300], [R1 * 0.56 * push, 1, 3600]];
      if (grow > 0.5) radii.push([R2 * g, -1, 7600], [(R2 - 26) * g, 1, 6400]);
      ringPulses(ctx, pulseT, C.x, C.y, radii, (0.55 + 0.45 * charge) * fade * (1 - 0.8 * easeIO(arcSeg(s, 0.05, 0.7))));
    }
    if (sweep > 0 && sweep < 1) {
      const a = -Math.PI / 2 + Math.PI * 2 * sweep;
      glint(ctx, C.x + Math.cos(a) * R1, C.y + Math.sin(a) * R1, 8, Math.sin(Math.PI * sweep));
    }
    // Motes of light drawn in from the air all round, spiralling into the
    // circle, more of them and brighter as it charges.
    ctx.lineCap = "round";
    motes.forEach((m) => {
      const p = arcSeg(s, m.at, m.at + m.dur);
      if (p <= 0 || p >= 1) return;
      const pos = (q) => {
        const u = Math.pow(q, 1.7), from = R2 * push * (1.5 + m.d * 0.9), to = R1 * 0.25 * push;
        const rr = from + (to - from) * u, a = m.a + Math.sqrt(q) * 2.6;   // curling round as soon as it sets off
        return [C.x + Math.cos(a) * rr, C.y + Math.sin(a) * rr];
      };
      const [x1, y1] = pos(p), [x0, y0] = pos(Math.max(0, p - 0.01 - 0.015 * p));   // a speck, its tail lengthening as it's pulled in
      const al = Math.sin(Math.PI * p) * (0.35 + 0.65 * charge) * fade;
      ctx.strokeStyle = `rgba(${ARC_CORE}, ${al})`;
      ctx.lineWidth = 0.8 + m.r * 1.4;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      if (m.r > 0.5) glowAt(ctx, x1, y1, 5 + m.r * 5, al);   // the bigger half glow
    });
    // The runes igniting: a flare runs round the bands, lighting each rune
    // as it passes, faster every lap as the circle charges. The band's own
    // runes are drawn again, much brighter, through a wedge trailing the flare.
    flare += (1.2 + 2.2 * Math.pow(charge, 1.6)) * dt;
    const ignite = (0.3 + 0.7 * charge) * fade * (1 - arcSeg(s, OPEN - 0.05, OPEN + 0.2));
    if (ignite > 0.01 && sweep >= 1) {
      const kOut = G ? push : (R1 / R2 + (1 - R1 / R2) * grow) * push;
      const bands = [[sig.parts.runes, turnOf("runes"), push, R1 - 11, flare, 1]];
      if (G || grow > 0.5) bands.push([sig.parts.orunes, turnOf("orunes"), kOut, R2 - 13, -flare * 0.8 + 2, -1]);
      bands.forEach(([part, turn, k, rr, h, dir], j) => {
        const lit = ignite * (j ? 0.75 : 1);
        [[0.9, 0.35], [0.45, 0.45], [0.18, 0.6]].forEach(([len, a]) => {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(C.x, C.y);
          ctx.arc(C.x, C.y, rr * k + 30, dir > 0 ? h - len : h - 0.04, dir > 0 ? h + 0.04 : h + len);
          ctx.closePath();
          ctx.clip();
          drawSigil(ctx, part, C.x, C.y, turn, k, lit * a * 3.5, 2);
          ctx.restore();
        });
        glint(ctx, C.x + Math.cos(h) * rr * k, C.y + Math.sin(h) * rr * k, 8 + 6 * charge, lit);
      });
    }
    // Letting go: a ring of light thrown outward from the circle.
    const rel = arcSeg(s, OPEN, OPEN + 0.5);
    if (rel > 0 && rel < 1) {
      ctx.strokeStyle = `rgba(${ARC_CORE}, ${0.8 * (1 - rel)})`;
      ctx.lineWidth = 2.5 * (1 - rel) + 0.5;
      ctx.beginPath();
      ctx.arc(C.x, C.y, R1 * push * (1 + 1.4 * easeOut(rel)), 0, Math.PI * 2);
      ctx.stroke();
    }
    // Light gathering in the middle as it spins up, held tight as it holds its breath.
    if (charge > 0 && s < SHOW) {
      const core = Math.min(1, charge * (1 + 0.6 * hold)) * (1 - form);   // swallowed by the dark
      const g = ctx.createRadialGradient(C.x, C.y, 0, C.x, C.y, R1 * 0.9 * push);
      g.addColorStop(0, `rgba(255, 246, 225, ${0.75 * core})`);
      g.addColorStop(0.35, `rgba(${ARC_GLOW}, ${0.3 * core})`);
      g.addColorStop(1, `rgba(${ARC_GLOW}, 0)`);
      ctx.fillStyle = g;
      ctx.fillRect(C.x - R1 * push, C.y - R1 * push, R1 * 2 * push, R1 * 2 * push);
    }
    // Glints flickering on the rim while it spins.
    if (s > 0.8 && s < SHOW + 0.3) {
      for (let k = 0; k < 3; k++) {
        const a = hash01(Math.floor(s * 14) * 7 + k) * Math.PI * 2;
        const rr = R1 * push * (hash01(k * 3 + Math.floor(s * 14)) > 0.5 ? 1 : R2 / R1);
        glint(ctx, C.x + Math.cos(a) * rr, C.y + Math.sin(a) * rr, 4 + 4 * charge, 0.8 * hash01(k + Math.floor(s * 14) * 11) * fade);
      }
    }
    ctx.restore();

    // The colour, painted over all the light drawn this frame (only where
    // there is light, keeping how strong it is): mostly the colour, with a
    // little of the white-hot core left showing through.
    {
      const at = shift * (tints.length - 1), i0 = Math.min(tints.length - 2, Math.floor(at));
      const f = at - i0, fs = f * f * (3 - 2 * f), A = tints[i0], B = tints[i0 + 1];
      const col = A.map((v, k) => Math.round(v + (B[k] - v) * fs));
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = `rgba(${col.join(", ")}, .85)`;
      ctx.fillRect(0, 0, W, H);
    }

    // The window's edge: a ring of soft gold, with gold sparks flung off it
    // as it opens; the one warm note against all the purple. Laid over the
    // purple rather than added to it, and in a muted, antique gold, so it
    // glows like gilt instead of buzzing like neon.
    ctx.globalCompositeOperation = "source-over";
    if (r > 0 && s < END) {
      const edge = (1 - arcSeg(s, END - 0.6, END)) * arcSeg(s, OPEN, OPEN + 0.25);
      ctx.beginPath();
      ctx.arc(C.x, C.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${PORTAL_GOLD}, ${0.16 * edge})`;
      ctx.lineWidth = 9;
      ctx.stroke();
      ctx.strokeStyle = `rgba(${PORTAL_GOLD}, ${0.3 * edge})`;
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.strokeStyle = `rgba(${PORTAL_GOLD}, ${0.75 * edge})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      dust.forEach((d) => {
        const age = s - OPEN;
        if (age < 0 || age > d.life) return;
        const dist = RW * easeOut(Math.min(1, age / 0.4)) + d.v * age;
        const a = 0.7 * (1 - age / d.life);
        ctx.fillStyle = `rgba(${PORTAL_GOLD}, ${a})`;
        ctx.beginPath();
        ctx.arc(C.x + Math.cos(d.a) * dist, C.y + Math.sin(d.a) * dist, d.r * 0.8, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Passing through the window (see blurEl and warp above).
    if (r > 0) {
      const through = arcSeg(s, OPEN, OPEN + 0.2) * (1 - arcSeg(s, END - 0.75, END - 0.05));
      // The blur: thick at first, clearing as the window widens.
      const blur = 10 * arcSeg(s, OPEN, OPEN + 0.08) * (1 - easeInOut(arcSeg(s, OPEN + 0.25, END - 0.1)));
      if (blur > 0.05 && !LITE) {
        const mask = `radial-gradient(circle at ${C.x}px ${C.y}px, #000 0, #000 ${r * 0.3}px, transparent ${r * 0.95}px)`;
        Object.assign(blurEl.style, {
          backdropFilter: `blur(${blur.toFixed(2)}px) brightness(${(1 + 0.25 * through).toFixed(3)})`,
          webkitBackdropFilter: `blur(${blur.toFixed(2)}px) brightness(${(1 + 0.25 * through).toFixed(3)})`,
          maskImage: mask, webkitMaskImage: mask, display: "",
        });
      } else blurEl.style.display = "none";
      if (through > 0.001) {
        // The bloom: a soft violet glow filling the middle, never white.
        const g = ctx.createRadialGradient(C.x, C.y, 0, C.x, C.y, r);
        g.addColorStop(0, `rgba(196, 150, 255, ${0.55 * through * (1 - hole)})`);
        g.addColorStop(0.3, `rgba(150, 90, 255, ${0.28 * through * (1 - hole)})`);
        g.addColorStop(0.75, `rgba(110, 60, 220, ${0.06 * through})`);
        g.addColorStop(1, "rgba(110, 60, 220, 0)");
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(C.x, C.y, r, 0, Math.PI * 2);
        ctx.fill();
        // The sparkles: glowing motes of gold, each born near the heart and
        // drifting out past you, quickening and growing a little as they come
        // near. Laid over (not added to) the light, so they stay gold.
        warp.forEach((p) => {
          const u = arcSeg(s, p.at, p.at + p.life);
          if (u <= 0 || u >= 1) return;
          const d = far * Math.pow(u, 1.8) + 4;
          const al = Math.sin(Math.PI * Math.min(1, u * 1.3)) * through;
          if (al < 0.01) return;
          const x = C.x + Math.cos(p.a) * d, y = C.y + Math.sin(p.a) * d;
          const size = p.w * (0.9 + 1.8 * u);
          ctx.globalAlpha = al;
          ctx.drawImage(sparkSprite, x - size * 5, y - size * 5, size * 10, size * 10);
        });
        ctx.globalAlpha = 1;
      }
    }
    // The black hole: a darkness at the circle's heart that swallows the
    // light. Round it, a tilted disc of light spirals in, its near side
    // passing in front of the dark and its far side bent up over the top;
    // close to the edge, the circle behind it is bent too. It lets go as
    // the window widens and you pass through.
    // (The edge of the dark: where the small ring of runes was, until the
    // widening window carries it further out.)
    const hr = hole > 0.005 ? Math.max(6, R1 * 0.56 * push * (0.3 + 0.7 * form), r * 0.34) : 0;
    if (hole > 0.005) {
      // The disc: squashed flat (DISC_T) and tipped (DISC_D), seen from just above.
      const DISC_T = 0.3, DISC_D = -0.2, cD = Math.cos(DISC_D), sD = Math.sin(DISC_D);
      const onDisc = (a, rr) => {
        const x = Math.cos(a) * rr, y = Math.sin(a) * rr * DISC_T;
        return [C.x + x * cD - y * sD, C.y + x * sD + y * cD];
      };
      // The disc's own glow.
      const discGlow = () => {
        ctx.save();
        ctx.translate(C.x, C.y);
        ctx.rotate(DISC_D);
        ctx.scale(1, DISC_T);
        const g = ctx.createRadialGradient(0, 0, hr, 0, 0, hr * 3);
        // (its inner edge, over the dark, comes in softly)
        g.addColorStop(0, "rgba(200, 140, 255, 0)");
        g.addColorStop(0.09, `rgba(200, 140, 255, ${0.45 * hole})`);
        g.addColorStop(0.25, `rgba(150, 80, 255, ${0.25 * hole})`);
        g.addColorStop(1, "rgba(120, 60, 230, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, hr * 3, 0, Math.PI * 2);
        ctx.arc(0, 0, hr, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.restore();
      };
      // The streaks: each falls inward along the disc in a tightening
      // spiral, quickening and brightening as it nears the edge, then is
      // gone. The side swinging towards you shines brighter.
      ctx.lineCap = "round";
      const streaks = () => swirl.forEach((w) => {
        const u = (((s - OPEN + 0.1) * w.v + w.ph) % 1 + 1) % 1;
        const ang = (q) => w.a + 4.2 * Math.pow(q, 1.8) + s * 2.2;
        const beam = 0.7 - 0.4 * Math.cos(ang(u));
        const al = Math.sin(Math.PI * u) * Math.pow(u, 0.5) * hole * beam;
        if (al < 0.01) return;
        ctx.strokeStyle = `rgba(${w.hot ? "240, 220, 255" : "185, 125, 255"}, ${Math.min(1, 1.2 * al)})`;
        ctx.lineWidth = w.w * (0.8 + 1.5 * u);
        ctx.beginPath();
        for (let k = 0; k <= 6; k++) {
          const q = Math.max(0, u - 0.12 + 0.02 * k);
          const [px, py] = onDisc(ang(q), hr * (1.02 + 2.1 * Math.pow(1 - q, 1.6)));
          k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        }
        ctx.stroke();
      });
      // The dark itself.
      ctx.globalCompositeOperation = "source-over";
      const dark = ctx.createRadialGradient(C.x, C.y, 0, C.x, C.y, hr * 1.5);
      dark.addColorStop(0, `rgba(3, 1, 8, ${0.98 * hole})`);
      dark.addColorStop(0.64, `rgba(3, 1, 8, ${0.97 * hole})`);
      dark.addColorStop(0.72, `rgba(10, 4, 24, ${0.6 * hole})`);
      dark.addColorStop(1, "rgba(10, 4, 24, 0)");
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.arc(C.x, C.y, hr * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "lighter";
      // The far half's light, bent up and over the top of the dark (and,
      // fainter, under the bottom), hugging its edge.
      const flick = 0.85 + 0.15 * Math.sin(s * 41);
      ctx.save();
      ctx.translate(C.x, C.y);
      ctx.rotate(DISC_D);
      // Each arc fades to nothing at its ends, so it never stops abruptly.
      ctx.lineCap = "butt";
      [[hr * 0.26, 0.16], [hr * 0.1, 0.4], [1.6, 0.8]].forEach(([lw, a]) => {
        const rgb = a > 0.5 ? "240, 222, 255" : "180, 110, 255", top = a * hole * flick, low = 0.35 * top;
        const arcFaded = (rr, from, to, peak) => {
          if (ctx.createConicGradient) {
            // a sweep of colour round the middle, starting at `from`
            const g = ctx.createConicGradient(from, 0, 0), span = (to - from) / (Math.PI * 2);
            g.addColorStop(0, `rgba(${rgb}, 0)`);
            g.addColorStop(span * 0.2, `rgba(${rgb}, ${peak * 0.55})`);
            g.addColorStop(span * 0.5, `rgba(${rgb}, ${peak})`);
            g.addColorStop(span * 0.8, `rgba(${rgb}, ${peak * 0.55})`);
            g.addColorStop(span, `rgba(${rgb}, 0)`);
            g.addColorStop(1, `rgba(${rgb}, 0)`);
            ctx.strokeStyle = g;
            ctx.beginPath();
            ctx.arc(0, 0, rr, from, to);
            ctx.stroke();
          } else {
            // (older browsers: in short pieces, each a little fainter towards the ends)
            for (let j = 0; j < 24; j++) {
              const u = (j + 0.5) / 24;
              ctx.strokeStyle = `rgba(${rgb}, ${peak * Math.pow(Math.sin(Math.PI * u), 1.5)})`;
              ctx.beginPath();
              ctx.arc(0, 0, rr, from + ((to - from) * j) / 24, from + ((to - from) * (j + 1)) / 24);
              ctx.stroke();
            }
          }
        };
        ctx.lineWidth = lw;
        arcFaded(hr * 1.1, Math.PI - 0.15, Math.PI * 2 + 0.15, top);
        arcFaded(hr * 1.04, 0.1, Math.PI - 0.1, low);
      });
      ctx.lineCap = "round";
      ctx.restore();
      // The thin ring of light caught right at the edge.
      [[6, 0.15], [1.3, 0.75]].forEach(([lw, a]) => {
        ctx.strokeStyle = `rgba(${a > 0.5 ? "235, 215, 255" : "170, 100, 255"}, ${a * hole * flick})`;
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.arc(C.x, C.y, hr * 1.01, 0, Math.PI * 2);
        ctx.stroke();
      });
      // The disc, in one piece: its near side passes in front of the dark,
      // while the part of its far side that lies behind the dark is hidden
      // (cut along the dark's own edge, where the ring of light hides the join).
      ctx.save();
      ctx.translate(C.x, C.y);
      ctx.rotate(DISC_D);
      ctx.beginPath();
      ctx.rect(-W * 4, -H * 4, W * 8, H * 8);
      ctx.moveTo(-hr, 0);
      ctx.arc(0, 0, hr, Math.PI, Math.PI * 2);
      ctx.closePath();
      ctx.clip("evenodd");
      ctx.rotate(-DISC_D);
      ctx.translate(-C.x, -C.y);
      discGlow();
      streaks();
      ctx.restore();
    }
    // The circles, added on top of it all. None of their light shows over
    // the dark, and close round it they are bent: each thin band round the
    // edge shows the circle from nearer the middle, magnified, so it seems
    // to wrap round the hole, easing back to true further out.
    if (hole > 0.005) {
      const out = hr * 2, E = hr * 0.97, N = 14, cx = C.x * dpr, cy = C.y * dpr;
      lctx.setTransform(1, 0, 0, 1, 0, 0);
      lctx.clearRect(0, 0, lensCv.width, lensCv.height);
      for (let k = 0; k < N; k++) {
        const r0 = hr + ((out - hr) * k) / N, r1 = hr + ((out - hr) * (k + 1)) / N, rm = (r0 + r1) / 2;
        const taper = 1 - easeIO((rm - hr) / (out - hr));
        const sc = rm / Math.max(rm * 0.16, rm - ((E * E) / rm) * taper);
        lctx.save();
        lctx.beginPath();
        lctx.arc(cx, cy, r1 * dpr + 0.6, 0, Math.PI * 2);
        lctx.arc(cx, cy, r0 * dpr, 0, Math.PI * 2, true);
        lctx.clip();
        lctx.translate(cx, cy);
        lctx.scale(sc, sc);
        lctx.translate(-cx, -cy);
        lctx.drawImage(circCv, 0, 0);
        lctx.restore();
      }
      cctx.save();
      cctx.globalCompositeOperation = "destination-out";
      cctx.fillStyle = `rgba(0, 0, 0, ${hole})`;
      cctx.beginPath();
      cctx.arc(C.x, C.y, out, 0, Math.PI * 2);
      cctx.fill();
      cctx.globalCompositeOperation = "source-over";
      cctx.globalAlpha = hole;
      cctx.setTransform(1, 0, 0, 1, 0, 0);
      cctx.drawImage(lensCv, 0, 0);
      cctx.restore();
    }
    ctx.globalCompositeOperation = "lighter";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(circCv, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // The cards crumbling, and their dust falling into the dark.
    cardDust?.draw(s, Math.max(hr * 0.95, R1 * 0.12));

    if (s < END) requestAnimationFrame(frame);
    else {
      blurEl.remove();
      cv.remove();
      veilCv.remove();
      circCv.remove();
      if (sheet) { sheet.style.clipPath = ""; sheet.style.transform = ""; sheet.style.transformOrigin = ""; }
      cardDust?.remove();
      src.forEach((p) => { if (p.dust) p.el.style.visibility = ""; });
      if (framesFade) framesFade.cancel();
      MG.portal = false;   // the table draws its circle again, behind the summary
    }
  });
  return END * SLOW * 1000;
}

// The reading on the table, as summary entries.
function tableEntries() {
  return S.slots.map((s) => {
    const label = el("p"), question = el("p");
    showPosition(s.i, label, question);
    return { card: s.card, reversed: s.reversed, label: label.textContent, question: question.textContent };
  });
}
