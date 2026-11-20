// ── The greater black hole: home from anywhere ──────────
// A card's page and a reading's summary each carry a Home button. Pressed,
// the page is taken as a still picture (snapshotPage, in js/snapshot.js), so
// only that one picture moves and nothing lags; then a great black hole
// opens in the middle of the screen and swallows it. The picture is pulled
// in, turning, while it crumbles to dust from its edges inward, as the fan
// does round the card of the day (dustToWords, in js/home.js): a ragged,
// glowing front of embers eats across it and its pieces lift off as fine
// dust in the page's own colours, hot, then ash, then caught by the hole,
// each grain spiralling in, faster and faster, violet as it nears the dark.
// Streaks of light spiral in from beyond the screen and the view trembles.
// The moment the last grain goes in, that's the end: the home screen is
// simply there, its night sky filling the screen, and its title, cards and
// buttons flare to life one after another.
// (If the picture can't be taken, the live page itself is pulled in instead.)
// The small holes a card or button falls into are in js/rune-ring.js; this
// one draws the same hole, holeArt, at the size of the screen.

const HOME_ICON = '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">'
  + '<path d="M4.2 11.4 12 4.6l7.8 6.8M6.6 9.8V19.2h3.9v-5.1h3v5.1h3.9V9.8" fill="none" stroke="currentColor" '
  + 'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// The Home button, round like the card page's arrows.
function homeButton() {
  const b = el("button", "nav-btn home-btn");
  b.innerHTML = HOME_ICON;
  b.setAttribute("aria-label", "Return home");
  b.addEventListener("click", () => swallowHome(b));
  return b;
}
// A page's bar with the Home button beside its Back.
function barStart(bar, back) {
  const start = el("span", "bar-start");
  start.append(back, homeButton());
  bar.classList.add("has-home");
  return start;
}

// Everything over the home screen closed, and the home screen showing.
function landHome() {
  document.querySelectorAll("body > .sheet.details").forEach((s) => s.remove());
  document.querySelectorAll("body > .sheet, body > .overlay").forEach((s) => {
    s.hidden = true;
    s.getAnimations().forEach((a) => a.cancel());
    s.style.pointerEvents = "";
  });
  if (!$("table").hidden) {
    S = null;
    resetMagic();
    $("table").hidden = true;
  }
  $("home").hidden = false;
  placeCotdWords();
  window.scrollTo(0, 0);
  startSky();
}

// The timings (ms): the hole forming, everything pulled in, and home's parts flaring.
// It's over by pullFrom + pullMs at the latest: the picture is all crumbled
// `tailMs` before that, and the last of its dust is
// in by then. It cuts the moment the last grain is in. Then home's parts
// flare to life, `flareStep` apart.
const GREAT_FX = { form: 520, pullFrom: 160, pullMs: 1450, tailMs: 220, flareMs: 720, flareStep: 45 };
// The dust: how many grains a whole screen makes, and how long one takes to fall in.
const GREAT_DUST = { grains: LITE ? 1400 : 3200, fallMs: [650, 1150] };

let swallowing = false;
async function swallowHome(btn) {
  if (swallowing) return;
  document.activeElement?.blur();   // (saves a note being written)
  if (calm) { landHome(); return; }
  swallowing = true;
  cardFlare(btn);
  const dpr = PX(LITE ? 1.25 : 1.5);
  // The still picture first (given a moment at most; without it, the live page goes in).
  const sheet = btn.closest(".sheet");
  let snap = null, colours = null;
  if (sheet) {
    sheet.getAnimations().forEach((a) => a.cancel());   // (still sliding in: taken where it rests)
    try { colours = pageColours(); } catch {}
    try {
      snap = await Promise.race([snapshotPage(sheet, dpr), new Promise((_, no) => setTimeout(() => no(new Error("slow")), 1500))]);
    } catch (err) {
      console.warn("Home: no picture of the page, so the page itself goes in.", err);
    }
  }
  if (snap && !(snap.width && snap.height)) snap = null;
  playGreatHole(snap, dpr, colours);
}

// The page's colours across the screen, on a coarse grid, read from the
// page itself (the picture of it can't be read back: browsers forbid it),
// for its dust: at each point, the colour behind it, the colour of any
// words there, or the colour of the picture there.
function pageColours() {
  const W = innerWidth, H = innerHeight, GW = 18, GH = Math.max(1, Math.round((18 * H) / W));
  const rgb = (s) => { const m = s.match(/[\d.]+/g); return m && (m.length < 4 || +m[3] > 0.3) ? [+m[0], +m[1], +m[2]] : null; };
  const picCache = new Map();
  const picAt = (im, u, v) => {
    if (!picCache.has(im)) {
      let d = null;
      try {
        const c = document.createElement("canvas");
        c.width = 12; c.height = 20;
        const x = c.getContext("2d");
        x.drawImage(im, 0, 0, 12, 20);
        d = x.getImageData(0, 0, 12, 20).data;
      } catch {}
      picCache.set(im, d);
    }
    const d = picCache.get(im);
    if (!d) return null;
    const i = (Math.min(19, Math.max(0, Math.floor(v * 20))) * 12 + Math.min(11, Math.max(0, Math.floor(u * 12)))) * 4;
    return [d[i], d[i + 1], d[i + 2]];
  };
  const bgCache = new Map();
  const bgOf = (n) => {
    if (bgCache.has(n)) return bgCache.get(n);
    let m = n, c = null;
    while (m && m.nodeType === 1 && !(c = rgb(getComputedStyle(m).backgroundColor))) m = m.parentElement;
    c = c || [21, 19, 28];
    bgCache.set(n, c);
    return c;
  };
  const cells = [];
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
    const x = ((i + 0.5) * W) / GW, y = ((j + 0.5) * H) / GH, n = document.elementFromPoint(x, y);
    let cell = { bg: [21, 19, 28], fg: null };
    if (n?.tagName === "IMG" && n.complete && n.naturalWidth) {
      const b = n.getBoundingClientRect(), flip = !!n.closest(".reversed");
      let u = (x - b.left) / b.width, v = (y - b.top) / b.height;
      if (flip) { u = 1 - u; v = 1 - v; }
      cell = { pic: n, u, v };
    } else if (n) {
      const hasText = [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim());
      cell = { bg: bgOf(n), fg: hasText ? rgb(getComputedStyle(n).color) : null };
    }
    cells.push(cell);
  }
  // A colour for a grain from (x, y): a little scattered within its cell.
  return (x, y) => {
    const i = Math.min(GW - 1, Math.max(0, Math.floor((x / W) * GW))), j = Math.min(GH - 1, Math.max(0, Math.floor((y / H) * GH)));
    const c = cells[j * GW + i];
    if (c.pic) {
      return picAt(c.pic, Math.min(1, Math.max(0, c.u + (Math.random() - 0.5) * 0.25)), Math.min(1, Math.max(0, c.v + (Math.random() - 0.5) * 0.15))) || [201, 169, 110];
    }
    return c.fg && Math.random() < 0.35 ? c.fg : c.bg;
  };
}

function playGreatHole(snap, dpr, colours = null) {
  const W = innerWidth, H = innerHeight, TAU = Math.PI * 2;
  const C = { x: W / 2, y: H / 2 };
  const far = Math.hypot(W / 2, H / 2) + 8, base = Math.min(W, H);
  const HR = 72, art = holeArt(HR);   // drawn for radius HR, scaled to the size it is
  // SWALLOWED: the latest it's over, every grain in; EATEN: the picture is all crumbled.
  const F = GREAT_FX, SWALLOWED = F.pullFrom + F.pullMs, EATEN = SWALLOWED - F.tailMs;
  const smooth = (v) => v * v * (3 - 2 * v);
  const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
  const r = (a, b) => a + Math.random() * (b - a);
  const twist = Math.random() < 0.5 ? -1 : 1;
  // (no scrollbars while things spin past the edges)
  const root = document.documentElement, overflow = root.style.overflow;
  root.style.overflow = "hidden";

  // The light and the dark, on one canvas over it all (which also keeps taps off it meanwhile).
  const cv = el("canvas", "great-hole");
  cv.setAttribute("aria-hidden", "true");
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  document.body.append(cv);
  const ctx = cv.getContext("2d");

  // Without a picture: every page and screen showing is pulled in itself,
  // each on a layer of its own and frozen as it is.
  const layers = snap ? [] : [...document.querySelectorAll("body > .screen:not([hidden]), body > .sheet:not([hidden]), body > .overlay:not([hidden])")]
    .map((node) => {
      node.getAnimations().forEach((a) => a.cancel());   // (a page still sliding in: measured where it rests)
      const b = node.getBoundingClientRect();
      node.classList.add("closing", "swallowed");
      node.style.pointerEvents = "none";
      const o = { x: C.x - b.left, y: C.y - b.top };
      node.style.transformOrigin = `${o.x}px ${o.y}px`;
      return { node, o };
    });

  // The page's colours, sampled small, for its dust. (A picture the browser
  // won't let be read gives the app's own colours instead.)
  const SW = 48, SH = Math.max(1, Math.round((48 * H) / W));
  let px = null;
  if (snap) {
    try {
      const c = document.createElement("canvas");
      c.width = SW; c.height = SH;
      const x = c.getContext("2d");
      x.drawImage(snap, 0, 0, SW, SH);
      px = x.getImageData(0, 0, SW, SH).data;
    } catch {}
  }
  const PALETTE = [[21, 19, 28], [31, 27, 41], [233, 226, 211], [201, 169, 110], [167, 159, 143]];
  const colourAt = (lx, ly) => {
    if (!px) return colours ? colours(lx, ly) : PALETTE[(Math.random() * PALETTE.length) | 0];
    const i = (Math.min(SH - 1, Math.max(0, Math.floor((ly / H) * SH))) * SW + Math.min(SW - 1, Math.max(0, Math.floor((lx / W) * SW)))) * 4;
    return [px[i], px[i + 1], px[i + 2]];
  };

  // A soft round spot of light, for the hot grains.
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

  // Streaks of light drawn in from beyond the screen's edges, each on its own tightening spiral.
  const swirl = Array.from({ length: LITE ? 44 : 80 }, () => ({
    a: Math.random() * TAU, d: 0.75 + Math.random() * 0.5, at: Math.random() * 1250, dur: 420 + Math.random() * 420,
    w: 0.6 + Math.random() * 1.5, hot: Math.random() > 0.72, gold: Math.random() > 0.8,
  }));
  // How big the hole's dark is at a moment: it forms, and swells as it eats.
  const holeR = (t) => {
    const r0 = base * 0.13 * (1 - Math.pow(1 - seg(t, 0, F.form), 3));
    return r0 * (1 + 0.55 * seg(t, F.pullFrom, EATEN));
  };
  // How far a page has fallen in (0 to 1): slowly at first, then rushing.
  const pull = (t) => Math.pow(seg(t, F.pullFrom, SWALLOWED), 2.1);

  // ── The picture crumbling ──
  // The front: how far from the middle (in the picture's own place) it has
  // eaten in, at angle `a`: ragged, and wavering a little as it goes. It
  // ends at the hole's edge, not the middle: what's under the dark is
  // already gone, so the last of the picture goes just as the time is up.
  // (Easing in, but never slowing at the end, so there's no lingering.)
  const ph = [r(0, TAU), r(0, TAU), r(0, TAU)];
  const eaten = (t) => Math.pow(seg(t, F.pullFrom + 60, EATEN), 1.25);
  const front = (q, a, t, g) => {
    const rh = (holeR(t) * 0.9) / g.s;
    return (rh + (far - rh) * (1 - q)) * (1 + 0.1 * (Math.sin(3 * a + ph[0] + t * 0.0013) + 0.6 * Math.sin(7 * a + ph[1] - t * 0.002)
      + 0.35 * Math.sin(13 * a + ph[2] + t * 0.003)) / 1.95);
  };
  const dust = [];
  const perPx = GREAT_DUST.grains / (far * 0.62);   // (about this many fall in over the whole of it)
  // The picture's place this moment: turned and drawn in about the middle.
  const place = (t, jx, jy) => {
    const p = pull(t);
    return { s: 1 - 0.5 * p, turn: (twist * (14 * p + 95 * Math.pow(p, 2.2)) * Math.PI) / 180, jx, jy };
  };
  const toScreen = (g, lx, ly) => {
    const dx = (lx - C.x) * g.s, dy = (ly - C.y) * g.s, c = Math.cos(g.turn), s = Math.sin(g.turn);
    return { x: C.x + g.jx + dx * c - dy * s, y: C.y + g.jy + dx * s + dy * c };
  };
  // Its pieces lift off where the front has just passed.
  function shed(t, g, q0, q1) {
    const n = Math.min(400, Math.round(perPx * far * (q1 - q0) * (0.6 + Math.random() * 0.8)));
    for (let j = 0; j < n; j++) {
      const a = r(0, TAU), ra = front(q1, a, t, g), rb = front(q0, a, t, g), rr = ra + Math.random() * (rb - ra);
      const lx = C.x + Math.cos(a) * rr, ly = C.y + Math.sin(a) * rr;
      if (lx < 0 || ly < 0 || lx > W || ly > H) continue;
      const at = toScreen(g, lx, ly), dx = at.x - C.x, dy = at.y - C.y;
      // (every grain is in by the end)
      const ms = Math.max(100, Math.min(r(...GREAT_DUST.fallMs), SWALLOWED - t));
      dust.push({ r0: Math.hypot(dx, dy), a0: Math.atan2(dy, dx), born: t, ms, size: r(0.7, 2.1),
        col: colourAt(lx, ly), puff: r(0.04, 0.16), spin: r(2, 3.4), glow: Math.random() < 0.3, x: at.x, y: at.y });
    }
  }
  const ASH = [150, 140, 196], EMBER = [255, 214, 150], VIOLET = [190, 140, 255];
  const mix = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  let qLast = 0;
  function drawPicture(t, g) {
    const q = eaten(t);
    if (q > qLast) { shed(t, g, qLast, q); qLast = q; }
    if (q >= 1) return;
    ctx.save();
    ctx.translate(C.x + g.jx, C.y + g.jy);
    ctx.rotate(g.turn);
    ctx.scale(g.s, g.s);
    ctx.translate(-C.x, -C.y);
    const ring = () => {
      ctx.beginPath();
      for (let k = 0; k <= 96; k++) {
        const a = (k / 96) * TAU, rr = front(q, a, t, g);
        k ? ctx.lineTo(C.x + Math.cos(a) * rr, C.y + Math.sin(a) * rr) : ctx.moveTo(C.x + Math.cos(a) * rr, C.y + Math.sin(a) * rr);
      }
      ctx.closePath();
    };
    ctx.save();
    ring();
    ctx.clip();
    ctx.drawImage(snap, 0, 0, W, H);
    // darkening as it's pulled towards the dark
    ctx.fillStyle = `rgba(3, 1, 8, ${(0.55 * pull(t)).toFixed(3)})`;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    // The front glows as it eats in: a ragged line of embers.
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.clip();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineJoin = "round";
    const glow = Math.min(1, q * 12);
    [[7, 0.35], [2.4, 0.7], [0.9, 1]].forEach(([lw, a]) => {
      ctx.strokeStyle = `rgba(255, ${lw > 2 ? 170 : 226}, ${lw > 2 ? 90 : 170}, ${(a * glow).toFixed(3)})`;
      ctx.lineWidth = lw / g.s;
      ring();
      ctx.stroke();
    });
    ctx.restore();
    ctx.restore();
  }
  // The grains: blown out a little by the crumbling, then caught, each
  // spiralling in, quicker and quicker, until it's gone into the dark.
  function drawDust(t) {
    const R = holeR(t);
    for (let j = 0; j < dust.length; j++) {
      const d = dust[j];
      const u = (t - d.born) / d.ms;
      if (u >= 1 || d.r0 < R * 0.9) { dust[j] = dust[dust.length - 1]; dust.pop(); j--; continue; }
      const fall = Math.pow(u, 1.9);
      const rr = R * 0.95 + (d.r0 * (1 + d.puff * Math.sin(Math.PI * Math.min(1, u * 2.2))) - R * 0.95) * (1 - fall);
      const a = d.a0 + twist * d.spin * Math.pow(u, 2.2) * (1 + (0.6 * far) / Math.max(rr, 40) * 0.25);
      const x = C.x + Math.cos(a) * rr, y = C.y + Math.sin(a) * rr;
      const age = t - d.born, heat = Math.exp(-age / 240);
      let col = mix(mix(d.col, ASH, smooth(Math.min(1, age / 700)) * 0.45), EMBER, heat * 0.85);
      col = mix(col, VIOLET, smooth(Math.max(0, (u - 0.45) / 0.55)));
      const al = (0.55 + 0.4 * heat) * (1 - smooth(Math.max(0, (u - 0.85) / 0.15)));
      const size = d.size * (1 - 0.35 * fall);
      // a short streak behind the fast ones
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

  let finished = false, swirlClock = 0, last = 0;
  const t0 = performance.now();
  // The end, the moment everything is in: home is simply there, under the
  // canvas, which goes; its parts flare to life.
  const finish = () => {
    if (finished) return;
    finished = true;
    layers.forEach(({ node }) => {
      node.classList.remove("closing", "swallowed");
      node.style.transform = node.style.transformOrigin = node.style.clipPath = node.style.pointerEvents = "";
    });
    landHome();
    flareHome();   // (set going before the canvas goes, so they start unlit)
    cv.remove();
    root.style.overflow = overflow;
    swallowing = false;
  };

  const frame = (now) => {
    if (finished) return;
    const t = now - t0, dt = last ? Math.min(50, t - last) : 0;
    last = t;
    // Over the moment everything is in: the picture all crumbled and its last grain gone.
    if (t >= SWALLOWED || (snap && t >= EATEN && !dust.length)) { finish(); return; }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // The tremble: growing as the pull strengthens.
    const quake = 4.5 * seg(t, 500, EATEN);
    const jx = quake * (Math.sin(t * 0.091) + 0.6 * Math.sin(t * 0.217)) / 1.6;
    const jy = quake * (Math.cos(t * 0.083) + 0.6 * Math.sin(t * 0.191 + 1)) / 1.6;

    const R = holeR(t);
    if (snap) {
      // Deep space behind the picture, then the picture crumbling, then its dust.
      ctx.fillStyle = "rgb(9, 7, 15)";
      ctx.fillRect(0, 0, W, H);
      drawPicture(t, place(t, jx, jy));
      drawDust(t);
    } else {
      const p = pull(t);
      const s = Math.max(0.002, 1 - p), turn = twist * (35 * p + 520 * Math.pow(p, 2.6));
      layers.forEach(({ node, o }) => {
        node.style.transform = `translate(${jx.toFixed(1)}px, ${jy.toFixed(1)}px) scale(${s.toFixed(4)}) rotate(${turn.toFixed(2)}deg)`;
        node.style.clipPath = `circle(${(far * (1 - 0.55 * Math.pow(p, 0.7))).toFixed(1)}px at ${o.x.toFixed(1)}px ${o.y.toFixed(1)}px)`;
      });
      // Everything dims as it nears the dark.
      ctx.fillStyle = `rgba(3, 1, 8, ${0.62 * seg(t, 0, SWALLOWED)})`;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.save();
    ctx.translate(jx, jy);
    // Streaks spiralling in, gone with the last of the picture.
    swirlClock += dt * (1 + 1.6 * seg(t, 600, EATEN));
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    const fadeOut = 1 - seg(t, EATEN - 250, EATEN);
    swirl.forEach((w) => {
      const u = (swirlClock - w.at) / w.dur;
      if (u <= 0 || u >= 1 || fadeOut <= 0) return;
      const at = (q) => {
        const rr = R * 1.05 + (far * w.d * 1.2 - R * 1.05) * Math.pow(1 - q, 1.5);
        const a = w.a + twist * 3.4 * Math.pow(q, 1.7);
        return [C.x + Math.cos(a) * rr, C.y + Math.sin(a) * rr];
      };
      const al = Math.sin(Math.PI * u) * fadeOut;
      ctx.strokeStyle = w.gold ? `rgba(${SPARK_GOLD}, ${0.75 * al})` : w.hot ? `rgba(240, 225, 255, ${0.85 * al})` : `rgba(180, 120, 255, ${0.7 * al})`;
      ctx.lineWidth = w.w * (0.7 + 1.4 * u);
      ctx.beginPath();
      for (let k = 0; k <= 7; k++) {
        const [x, y] = at(Math.max(0, u - 0.16 + 0.02 * k));
        k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    });
    ctx.globalCompositeOperation = "source-over";
    // The hole itself, scaled up from its own drawing.
    if (R > 0.5) {
      ctx.save();
      ctx.translate(C.x, C.y);
      const k = R / HR;
      ctx.scale(k, k);
      art.draw(ctx, swirlClock * 1.8, Math.min(1, t / 160), 1);
      ctx.restore();
    }
    ctx.restore();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  setTimeout(finish, SWALLOWED + 150);   // (even if the page's frames are paused)
}

// Home's parts flaring to life, one after another, top to bottom: each
// lights up out of nothing in a burst of gold, then settles as it is.
// (On a phone, the light without the soft glow round it.)
function flareHome() {
  const home = $("home");
  const parts = [home.querySelector(".home-head"), $("floatDeck"), $("cotd"), home.querySelector(".home-sub"),
    ...$("spreadList").children, ...(home.querySelector(".home-links")?.children || []), ...$("options").children]
    .filter((p) => p && p.getClientRects().length);
  const halo = (a, r) => (LITE ? "" : ` drop-shadow(0 0 ${r}px rgba(255, 206, 120, ${a}))`);
  parts.forEach((p, i) => p.animate([
    { opacity: 0, filter: `brightness(2.6)${halo(0.95, 12)}` },
    { opacity: 1, filter: `brightness(1.8)${halo(0.75, 9)}`, offset: 0.3 },
    { opacity: 1, filter: `brightness(1)${halo(0, 0)}` },
  ], { duration: GREAT_FX.flareMs, delay: i * GREAT_FX.flareStep, easing: "cubic-bezier(.2, .8, .2, 1)", fill: "backwards" }));
}
