// The small rings of runes the animations use: a page opening out of a card
// or button and closing back into it, the card of the day's reveal, a
// spread's places as they're cast, the summary's way back to the table.
//
// Engraved: fine, muted gold lines and runes, as if cut into metal. Two
// lines of light set off together from the top and run round it in mirror
// image, one each way, crossing at the bottom and again at the top. Every
// rune a light passes grows brighter and stays so; passed again, brighter
// still, until it's fully lit. Each rune also flashes as a light goes over.
// Detail by size: a small ring has one line, a larger one a second inside.
//
// Drawn live at its real size every frame (not a scaled picture), so its
// lines stay fine however big it is.
// Part of the app; the files in js/ load in the order listed in index.html.

// How long each light takes to run half way round (ms), and the length of
// its tail (as a part of the circle). Opening Lab can change these.
const RING_FX = { lightMs: 520, tail: 0.14 };

// The ring's drawing for radius R: draw(ctx, ms) draws it centred on 0, 0,
// as it is `ms` after it appeared.
function ringArt(R) {
  const TAU = Math.PI * 2, TOP = -Math.PI / 2;
  const big = R >= 56;
  const n = Math.min(26, Math.max(8, Math.round((TAU * R) / (big ? 22 : 18))));
  const rr = big ? R - 8.5 : R - 7, size = big ? 9 : 7;
  const circle = (r) => { const p = new Path2D(); p.arc(0, 0, r, 0, TAU); return p; };
  const outer = circle(R), inner = big ? circle(R - 17) : null;
  const runes = Array.from({ length: n }, (_, k) => {
    const ang = TOP + (k / n) * TAU, p = new Path2D();
    addRune(p, (k * 7) % RUNES.length, Math.cos(ang) * rr, Math.sin(ang) * rr, size, ang + Math.PI / 2);
    // How far round from the top it sits, going right (for one light) and going left (for the other).
    const right = (k / n) * TAU, left = (TAU - right) % TAU;
    return { p, right, left };
  });
  const cut = (ctx, path, a, w) => {   // an engraved line: no glow
    ctx.strokeStyle = `rgba(214, 182, 122, ${a})`;
    ctx.lineWidth = w;
    ctx.stroke(path);
  };
  const glow = (ctx, path, a, w, blur) => {   // a line of light: a bright core and one soft glow
    ctx.save();
    ctx.shadowColor = `rgba(255, 190, 110, ${0.8 * a})`;
    ctx.shadowBlur = blur;
    ctx.strokeStyle = `rgba(255, 238, 205, ${a})`;
    ctx.lineWidth = w;
    ctx.stroke(path);
    ctx.restore();
  };
  // How many times a light has passed a rune `at` round from the top, and
  // how freshly (1 just now, fading to 0), once it has run `run` round.
  const passed = (run, at) => (run < at ? 0 : Math.floor((run - at) / TAU) + 1);
  const fresh = (run, at) => (run < at ? 0 : Math.exp(-(((run - at) % TAU) * 3.2)));
  return {
    R,
    draw(ctx, ms) {
      const run = (Math.max(0, ms) * Math.PI) / RING_FX.lightMs;   // how far round each light has gone
      cut(ctx, outer, 0.55, 0.8);
      if (inner) cut(ctx, inner, 0.32, 0.7);
      runes.forEach(({ p, right, left }) => {
        const times = passed(run, right) + passed(run, left);
        const lit = Math.min(1, times * 0.6);                  // brighter with every pass, and it stays
        const flash = Math.max(fresh(run, right), fresh(run, left));
        cut(ctx, p, 0.42 + 0.35 * lit, 0.8);
        const g = Math.min(1, lit * 0.9 + flash);
        if (g > 0.03) glow(ctx, p, g, 0.9, 3 + 9 * Math.min(1, lit * 0.5 + flash));
      });
      // The two lights, each a bright head with a tail fading behind it.
      const tail = RING_FX.tail * TAU, steps = 9;
      [1, -1].forEach((dir) => {
        const head = TOP + dir * run;
        for (let j = 0; j < steps; j++) {
          const a0 = head - dir * (tail * j) / steps, a1 = head - dir * (tail * (j + 1)) / steps;
          const seg = new Path2D();
          seg.arc(0, 0, R, Math.min(a0, a1), Math.max(a0, a1));
          glow(ctx, seg, 0.95 * (1 - j / steps), 1.3 - j * 0.08, 8);
        }
        const x = Math.cos(head) * R, y = Math.sin(head) * R;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 6);
        g.addColorStop(0, "rgba(255, 250, 235, 1)");
        g.addColorStop(0.35, "rgba(255, 220, 160, .6)");
        g.addColorStop(1, "rgba(255, 180, 90, 0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill();
      });
    },
  };
}

// A ring as an element (a canvas drawn every frame until it's removed),
// for radius R; ring.at(r) is the transform that centres it on its spot,
// at radius r. (A little sharper than the screen, for when it swells.)
function ringElement(R) {
  R = Math.max(14, R);
  const art = ringArt(R), M = 18, box = 2 * (R + M);
  const k = Math.min(devicePixelRatio || 1, 2) * 1.35;
  const ring = document.createElement("div");
  ring.className = "rune-ring";
  ring.setAttribute("aria-hidden", "true");
  Object.assign(ring.style, { width: `${box}px`, height: `${box}px` });
  const cv = document.createElement("canvas");
  cv.width = cv.height = Math.ceil(box * k);
  ring.append(cv);
  const ctx = cv.getContext("2d");
  const t0 = performance.now();
  const frame = (now) => {
    if (!ring.isConnected && now - t0 > 200) return;   // taken away: stop drawing
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(k, 0, 0, k, (box / 2) * k, (box / 2) * k);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    art.draw(ctx, now - t0);
    requestAnimationFrame(frame);
  };
  frame(t0);
  ring.at = (r) => `translate(-50%, -50%) scale(${Math.max(r, 1) / R})`;
  return ring;
}

// ── A small black hole ──────────────────────────────────
// The summary portal's black hole (js/portal.js) in miniature: a darkness
// of radius r with a thin ring of light caught right at its edge; round it
// a tipped, flattened disc of violet light, fine streaks drifting inward
// along it (the inner ones faster), brighter on the side turning towards
// you. The disc's far side is hidden behind the dark, but its light is bent
// up over the top of it; its near side passes in front. Every part is a
// soft gradient, never a hard edge, drawn at twice the screen's sharpness.
//
// holeArt(hr) draws it, for a hole of up to radius hr; draw(ctx, ms, h, grow)
// draws one moment, centred on 0, 0: `ms` drives the swirl, `h` (0 to 1) is
// how strongly it holds, `grow` (0 to 1) how far it has opened.
// The two working pictures a hole of a given size draws its disc on, kept
// between holes (each frame redraws them completely before using them), so
// a tap doesn't have to make them again.
const HOLE_SHEETS = new Map();
function holeSheets(px) {
  if (!HOLE_SHEETS.has(px)) {
    if (HOLE_SHEETS.size > 3) HOLE_SHEETS.delete(HOLE_SHEETS.keys().next().value);
    const sheet = () => { const c = document.createElement("canvas"); c.width = c.height = px; return [c, c.getContext("2d")]; };
    HOLE_SHEETS.set(px, [sheet(), sheet()]);
  }
  return HOLE_SHEETS.get(px);
}
function holeArt(hr) {
  const TAU = Math.PI * 2, TILT = 0.32, TIP = -0.22;
  // (at most three times the page's sharpness: the light is soft, and a phone has to keep up)
  const box = Math.ceil(hr * 8), k = Math.min(3, Math.min(devicePixelRatio || 1, 2) * 2), px = Math.ceil(box * k);
  const [[D, dx], [N, nx]] = holeSheets(px);
  const conic = !!dx.createConicGradient;
  const arms = Array.from({ length: 10 }, (_, i) => ({
    a: (i / 10) * TAU + Math.random() * 0.5, ph: Math.random(), span: 0.8 + Math.random() * 0.7, hot: i % 3 === 0,
  }));
  const at = (x, s = 1) => x.setTransform(k * s, 0, 0, k * s, px / 2, px / 2);
  // An arc whose light fades to nothing at both ends.
  const fadedArc = (x, r, from, span, rgb, a, w) => {
    if (a <= 0.01) return;
    if (conic) {
      const g = x.createConicGradient(from, 0, 0), f = span / TAU;
      g.addColorStop(0, `rgba(${rgb}, 0)`);
      g.addColorStop(f * 0.5, `rgba(${rgb}, ${a})`);
      g.addColorStop(f, `rgba(${rgb}, 0)`);
      g.addColorStop(1, `rgba(${rgb}, 0)`);
      x.strokeStyle = g;
    } else x.strokeStyle = `rgba(${rgb}, ${a * 0.6})`;
    x.lineWidth = w;
    x.beginPath(); x.arc(0, 0, r, from, from + span); x.stroke();
  };

  // The disc, face on, then tipped and flattened.
  function disc(ms, h, r) {
    dx.setTransform(1, 0, 0, 1, 0, 0);
    dx.clearRect(0, 0, px, px);
    at(dx); dx.rotate(TIP); dx.scale(1, TILT);
    const R1 = r * 3.1, s = (v) => v / R1;
    const g = dx.createRadialGradient(0, 0, 0, 0, 0, R1);
    g.addColorStop(0, "rgba(200, 150, 255, 0)");
    g.addColorStop(s(r * 1.05), "rgba(200, 150, 255, 0)");
    g.addColorStop(s(r * 1.28), `rgba(225, 185, 255, ${0.62 * h})`);
    g.addColorStop(s(r * 1.75), `rgba(165, 100, 255, ${0.3 * h})`);
    g.addColorStop(s(r * 2.5), `rgba(130, 70, 240, ${0.1 * h})`);
    g.addColorStop(1, "rgba(120, 60, 230, 0)");
    dx.fillStyle = g;
    dx.beginPath(); dx.arc(0, 0, R1, 0, TAU); dx.fill();
    // Fine streaks drifting inward, each a short arc fading at its ends;
    // the nearer the middle, the faster round.
    dx.globalCompositeOperation = "lighter";
    dx.lineCap = "round";
    arms.forEach((w) => {
      const u = (ms / 1500 + w.ph) % 1;   // 0 at the rim of the disc, 1 at the dark
      const rr = r * (2.8 - 1.6 * u * u);
      const turn = w.a + (ms / 1000) * 2.4 * Math.pow((r * 1.3) / rr, 1.5) + u * 2.2;
      const a = Math.sin(Math.PI * u) * h * (w.hot ? 0.95 : 0.55);
      fadedArc(dx, rr, turn, w.span * (1 - 0.35 * u), w.hot ? "245, 228, 255" : "195, 140, 255", a, 0.7 + 0.9 * u);
    });
    // Brighter on the side turning towards you.
    dx.globalCompositeOperation = "destination-in";
    at(dx); dx.rotate(TIP);
    const side = dx.createLinearGradient(-R1, 0, R1, 0);
    side.addColorStop(0, "rgba(0, 0, 0, 1)");
    side.addColorStop(1, "rgba(0, 0, 0, .42)");
    dx.fillStyle = side;
    dx.fillRect(-R1, -R1, 2 * R1, 2 * R1);
    dx.globalCompositeOperation = "source-over";
    // Its near half, for passing in front of the dark: faded in softly
    // across the middle, not cut.
    nx.setTransform(1, 0, 0, 1, 0, 0);
    nx.clearRect(0, 0, px, px);
    nx.globalAlpha = 0.55;
    nx.drawImage(D, 0, 0);
    nx.globalAlpha = 1;
    // (its inner edge, the brightest part, again: a slim band of light across the dark)
    at(nx); nx.rotate(TIP); nx.scale(1, TILT);
    const band = nx.createRadialGradient(0, 0, r, 0, 0, r * 1.75);
    band.addColorStop(0, "rgba(235, 210, 255, 0)");
    band.addColorStop(0.12, `rgba(240, 222, 255, ${0.8 * h})`);
    band.addColorStop(0.35, `rgba(200, 150, 255, ${0.35 * h})`);
    band.addColorStop(1, "rgba(160, 100, 255, 0)");
    nx.globalCompositeOperation = "lighter";
    nx.fillStyle = band;
    nx.beginPath(); nx.arc(0, 0, r * 1.75, 0, TAU); nx.fill();
    nx.globalCompositeOperation = "destination-in";
    at(nx); nx.rotate(TIP);
    const near = nx.createLinearGradient(0, r * 0.08, 0, r * 0.42);
    near.addColorStop(0, "rgba(0, 0, 0, 0)");
    near.addColorStop(1, "rgba(0, 0, 0, 1)");
    nx.fillStyle = near;
    nx.fillRect(-R1, -R1, 2 * R1, 2 * R1);
    nx.globalCompositeOperation = "source-over";
  }

  return {
    box,
    draw(ctx, ms, h, grow) {
      if (h <= 0.003) return;
      const r = hr * (0.3 + 0.7 * grow);
      disc(ms, h, r);
      ctx.save();
      // A faint shadow round it, as if it dims the air.
      const sh = ctx.createRadialGradient(0, 0, r * 0.9, 0, 0, r * 2.6);
      sh.addColorStop(0, `rgba(2, 1, 6, ${0.4 * h})`);
      sh.addColorStop(1, "rgba(2, 1, 6, 0)");
      ctx.fillStyle = sh;
      ctx.beginPath(); ctx.arc(0, 0, r * 2.6, 0, TAU); ctx.fill();
      // The whole disc (its far side shows beyond the dark).
      ctx.drawImage(D, -box / 2, -box / 2, box, box);
      // The dark: deep to the edge, then falling away quickly but softly.
      const dk = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.14);
      dk.addColorStop(0, `rgba(2, 1, 6, ${h})`);
      dk.addColorStop(0.72, `rgba(2, 1, 6, ${h})`);
      dk.addColorStop(0.86, `rgba(3, 1, 9, ${0.94 * h})`);
      dk.addColorStop(0.94, `rgba(8, 3, 20, ${0.45 * h})`);
      dk.addColorStop(1, "rgba(8, 3, 20, 0)");
      ctx.fillStyle = dk;
      ctx.beginPath(); ctx.arc(0, 0, r * 1.14, 0, TAU); ctx.fill();
      // The far side's light, bent up over the top of the dark, and fainter
      // under the bottom.
      ctx.rotate(TIP);
      ctx.lineCap = "round";
      ctx.shadowColor = `rgba(180, 120, 255, ${0.7 * h})`;
      ctx.shadowBlur = Math.max(3, r * 0.25);
      fadedArc(ctx, r * 1.07, Math.PI + 0.2, Math.PI - 0.4, "195, 145, 255", 0.32 * h, Math.max(1.5, r * 0.16));
      fadedArc(ctx, r * 1.05, Math.PI + 0.35, Math.PI - 0.7, "240, 225, 255", 0.45 * h, 0.7);
      fadedArc(ctx, r * 1.04, 0.5, Math.PI - 1, "185, 135, 255", 0.18 * h, Math.max(1, r * 0.08));
      ctx.shadowBlur = 0;
      ctx.rotate(-TIP);
      // The near half of the disc, passing in front.
      ctx.drawImage(N, -box / 2, -box / 2, box, box);
      // The thin ring of light caught right at the edge, brighter on the near-turning side.
      ctx.shadowColor = `rgba(190, 130, 255, ${0.8 * h})`;
      ctx.shadowBlur = 3;
      if (conic) {
        const ring = ctx.createConicGradient(Math.PI + TIP, 0, 0);
        ring.addColorStop(0, `rgba(250, 242, 255, ${0.9 * h})`);
        ring.addColorStop(0.3, `rgba(215, 180, 255, ${0.45 * h})`);
        ring.addColorStop(0.5, `rgba(190, 150, 255, ${0.18 * h})`);
        ring.addColorStop(0.7, `rgba(215, 180, 255, ${0.45 * h})`);
        ring.addColorStop(1, `rgba(250, 242, 255, ${0.9 * h})`);
        ctx.strokeStyle = ring;
      } else ctx.strokeStyle = `rgba(235, 215, 255, ${0.6 * h})`;
      ctx.lineWidth = 0.75;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    },
  };
}

// The hole as an element at C, drawn every frame for as long as
// `state(ms)` returns { h, grow } (null: it's over, and it goes).
function miniHole(C, hr, state) {
  const art = holeArt(hr), k = Math.min(devicePixelRatio || 1, 2) * 1.5;
  const cv = document.createElement("canvas");
  cv.className = "mini-hole";
  cv.width = cv.height = Math.ceil(art.box * k);
  Object.assign(cv.style, { left: `${C.x}px`, top: `${C.y}px`, width: `${art.box}px`, height: `${art.box}px`, zIndex: ++Z });
  document.body.append(cv);
  const ctx = cv.getContext("2d");
  const t0 = performance.now();
  const frame = (now) => {
    const s = cv.isConnected && state(now - t0);
    if (!s) { cv.remove(); return; }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(k, 0, 0, k, (art.box / 2) * k, (art.box / 2) * k);
    art.draw(ctx, now - t0, s.h, s.grow);
    requestAnimationFrame(frame);
  };
  frame(t0);
  return cv;
}

// ── Collapsing into its own centre ──────────────────────
// A card or button that opens a page falls in on itself: its centre
// becomes the black hole, and from its edges inward it darkens into a
// smoky shadow and is gone, corners first, the edge ragged and wavering
// like smoke; it tightens and twists a little as it's pulled in. When
// nothing is left of it but the hole, the page can bloom out of it.
//
// collapseCopy(node, look) lays a copy of `look` exactly over `node` (whose
// place it takes) and returns set(p, ms): the collapse at p (0 to 1).
let collapseIds = 0;
const fxDiv = (cls) => { const d = document.createElement("div"); d.className = cls; return d; };
function collapseCopy(node, look = node) {
  const r = node.getBoundingClientRect();
  const id = `collapse-${++collapseIds}`;
  // The smoke: noise that ripples the shrinking edge (a filter of its own).
  const fx = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  fx.setAttribute("width", "0");
  fx.setAttribute("height", "0");
  fx.style.position = "absolute";
  fx.innerHTML = `<filter id="${id}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">`
    + `<feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="2" seed="${collapseIds % 97}" result="noise"/>`
    + `<feOffset in="noise" dx="0" dy="0" result="drift"/>`
    + `<feDisplacementMap in="SourceGraphic" in2="drift" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>`;
  document.body.append(fx);
  const drift = fx.querySelector("feOffset"), warp = fx.querySelector("feDisplacementMap");
  // The copy: an outer box that twists and is rippled by the smoke, and
  // inside it the copy itself, masked to what's left of it, with a dark
  // shadow over its dissolving edge.
  const box = fxDiv("collapse-copy");
  Object.assign(box.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`,
    zIndex: ++Z, filter: `url(#${id})` });
  const keep = fxDiv("collapse-keep");
  const copy = look.cloneNode(true);
  copy.removeAttribute("id");
  copy.querySelectorAll(".spread-edge, .rune-ring").forEach((n) => n.remove());
  Object.assign(copy.style, { position: "absolute", inset: "0", width: "100%", height: "100%", margin: "0", transform: "none", visibility: "visible" });
  const shade = fxDiv("collapse-shade");
  shade.style.borderRadius = getComputedStyle(look).borderRadius;
  keep.append(copy, shade);
  box.append(keep);
  document.body.append(box);
  const dir = Math.random() < 0.5 ? -1 : 1;
  const set = (p, ms = 0) => {
    const e = Math.pow(Math.min(1, Math.max(0, p)), 1.8);   // slow to start, quickening
    const R = 145 * (1 - e), f = 16 + 14 * e;               // how much is left (100: touching its sides), and the edge's softness
    const pc = (v) => `${Math.max(0, v).toFixed(2)}%`;
    const mask = `radial-gradient(closest-side, #000 ${pc(R - f)}, rgba(0, 0, 0, .55) ${pc(R - f * 0.4)}, transparent ${pc(Math.max(0.01, R))})`;
    keep.style.maskImage = keep.style.webkitMaskImage = mask;
    shade.style.background = `radial-gradient(closest-side, rgba(4, 2, 10, ${(0.1 + 0.55 * e).toFixed(3)}) 0%, `
      + `rgba(4, 2, 10, ${(0.08 * e).toFixed(3)}) ${pc(R - f * 2.6)}, rgba(5, 2, 12, .78) ${pc(R - f * 0.9)}, rgba(3, 1, 8, .96) ${pc(R)})`;
    box.style.transform = `scale(${(1 - 0.12 * e).toFixed(4)}) rotate(${(dir * 9 * e).toFixed(2)}deg)`;
    warp.setAttribute("scale", (1.5 + 11 * e).toFixed(2));
    drift.setAttribute("dx", ((ms / 40) % 200).toFixed(1));
    drift.setAttribute("dy", ((ms / 55) % 200).toFixed(1));
  };
  set(0);
  return { box, set, remove: () => { box.remove(); fx.remove(); } };
}

// How big a hole a card or button makes: most of a card's width, and for a
// long button, a good part of its length.
function holeSize(b) {
  return Math.min(64, Math.max(18, Math.min(b.width, b.height) * 0.42, Math.max(b.width, b.height) * 0.2));
}

// The whole of it: `node` (shown as `look`) collapses into its own centre,
// which becomes the hole, and is gone. The hole then swells a little and
// holds while the page opens out of its dark heart (see holeOpen, in
// js/core.js), and lets go as the page covers it. The real node is hidden
// meanwhile, and back once the page covers it (for the page to close back
// into). Returns how long the collapse takes, and where and how big the hole is.
const COLLAPSE_MS = 540;
function collapseInto(node, look) {
  const b = node.getBoundingClientRect();
  const at = { x: b.left + b.width / 2, y: b.top + b.height / 2, hr: holeSize(b) };
  const fall = collapseCopy(node, look);
  node.style.visibility = "hidden";
  // It stays while the ring closes in on it, swelling a little as the ring
  // nears; once the ring has gone into it, it closes up and is gone.
  const open = OPEN_FX.bloomMs, shut = 300, total = COLLAPSE_MS + open + shut;
  const ease = (v) => 1 - Math.pow(1 - Math.min(1, Math.max(0, v)), 3);
  const hole = miniHole(at, at.hr, (ms) => {
    if (ms > total) return null;
    const p = ms / COLLAPSE_MS, q = (ms - COLLAPSE_MS) / open, z = (ms - COLLAPSE_MS - open) / shut;
    const grow = p < 1 ? ease(p * 1.25) : q < 1 ? 1 + 0.18 * Math.pow(Math.max(0, q), 3) : 1.18 * (1 - ease(z));
    return { grow, h: Math.min(1, p * 4) * (z > 0 ? 1 - z : 1) };
  });
  hole.style.zIndex = ++Z;   // above the collapsing copy: its centre is the hole
  const t0 = performance.now();
  const step = (now) => {
    const ms = now - t0;
    fall.set(ms / COLLAPSE_MS, ms);
    if (ms < COLLAPSE_MS) requestAnimationFrame(step);
    else fall.remove();
  };
  requestAnimationFrame(step);
  setTimeout(() => fall.remove(), COLLAPSE_MS + 80);   // (even if the page's frames are paused)
  setTimeout(() => hole.remove(), total + 80);
  setTimeout(() => { node.style.visibility = ""; }, COLLAPSE_MS + open);
  return { ms: COLLAPSE_MS, at, hole };
}

// The other way: `node` re-forms out of a hole at its centre over `ms`, its
// edges coming back out of the smoky dark, while the hole fades. The real
// node shows again, and `glow` flares, once it's whole.
function reformFrom(node, look, glow, ms = 460) {
  const back = collapseCopy(node, look);
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    back.remove();
    node.style.visibility = "";
    if (typeof cardFlare === "function") cardFlare(glow);
  };
  const t0 = performance.now();
  const step = (now) => {
    const u = (now - t0) / ms;
    back.set(1 - Math.min(1, u), now - t0);
    if (u < 1) requestAnimationFrame(step);
    else finish();
  };
  requestAnimationFrame(step);
  setTimeout(finish, ms + 80);
  return back;
}
