// ── Burning fronts: a page's pieces made, or unmade, by fire ──
// Each piece (a title, a button, a card's slot) has a ragged, glowing front
// of embers, the same three-layer line the cards crumble along, sweeping
// across it from its side nearest a point C outward.
//  · "build": the piece appears behind the front, and dust flies out of C
//    to land right on the front as it moves (home after the black hole, the
//    summary through the portal, the table coming back from the summary).
//  · "burn": the piece is eaten away behind the front, and its dust lifts
//    off the front and is drawn into C (the summary going back to the table).
// Only the pieces themselves: what's round them is left alone.
// Pieces nearer C start first; the farthest `fly` ms later. Each takes `build` ms.
// Off the screen, a piece is simply there (or, burning, left as it is).
// Drawn on a canvas of its own, in `host` (the body, or a page, so that the
// page's own clipping and zoom carry it too). Taps go through it.
// Returns { end } (ms from now until it's all over) and stop().
const BURN_FX = { fly: 380, build: 560 };
function burnFronts(parts, C, { mode = "build", at = 0, fly = BURN_FX.fly, build = BURN_FX.build, host = document.body, z = 9600, flare = true, flash = null } = {}) {
  const W = innerWidth, H = innerHeight, TAU = Math.PI * 2;
  const burning = mode === "burn";
  const r = (a, b) => a + Math.random() * (b - a);
  const smooth = (v) => v * v * (3 - 2 * v);
  const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
  const twist = Math.random() < 0.5 ? -1 : 1;
  // Each piece: what it shows on the screen (a piece as wide as the screen,
  // by its contents), and the way its front goes (out from C).
  const pieces = parts.filter((p) => p && p.isConnected && p.getClientRects().length).map((el) => {
    const box = el.getBoundingClientRect();
    if (box.width < 1 || box.height < 1 || box.bottom < 0 || box.top > H || box.right < 0 || box.left > W) return null;
    let b = box;
    if (b.width > W * 0.6) {
      const rg = document.createRange();
      rg.selectNodeContents(el);
      const c = rg.getBoundingClientRect();
      if (c.width && c.height) b = c;
    }
    const cx = b.left + b.width / 2, cy = b.top + b.height / 2, hw = b.width / 2, hh = b.height / 2;
    let nx = cx - C.x, ny = cy - C.y;
    const nl = Math.hypot(nx, ny);
    if (nl < 8) { nx = 1; ny = 0; } else { nx /= nl; ny /= nl; }
    const ext = Math.abs(hw * nx) + Math.abs(hh * ny), span = Math.abs(hw * ny) + Math.abs(hh * nx);
    const near = Math.hypot(Math.min(Math.max(C.x, b.left), b.right) - C.x, Math.min(Math.max(C.y, b.top), b.bottom) - C.y);
    return { el, b, cx, cy, nx, ny, ext, span, near, ox: cx - box.left, oy: cy - box.top, p: -1,
      ph: [r(0, TAU), r(0, TAU), r(0, TAU)], round: Math.min(hw, hh, parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0) };
  }).filter(Boolean);
  const farthest = Math.max(1, ...pieces.map((pc) => pc.near));
  pieces.forEach((pc) => { pc.start = at + fly * (pc.near / farthest); });
  const flashEnd = flash ? flash.at + flash.ms : 0;
  const END = Math.max(flashEnd, ...pieces.map((pc) => pc.start + build + 60));

  // The front across a piece, `p` of the way, at `x` across it (measured
  // along the way it goes, from the piece's middle): ragged, as the cards'.
  const frontAt = (pc, p, x) => {
    const w = 2 * pc.ext, rag = 0.075 * w * (Math.sin(x * 0.09 + pc.ph[0]) + 0.6 * Math.sin(x * 0.23 + pc.ph[1]) + 0.35 * Math.sin(x * 0.53 + pc.ph[2])) / 1.95;
    return -pc.ext + p * w * 1.3 - 0.15 * w + rag + 0.08 * w * (x / Math.max(1, pc.span));
  };
  const progress = (pc, t) => { const u = seg(t, pc.start, pc.start + build); return smooth(u) * 0.6 + 0.4 * u; };
  // What shows: built, the side the front has passed; burning, the side it hasn't reached.
  const STEPS = 28;
  const clip = (pc) => {
    const s = pc.el.style;
    if (!burning && pc.p >= 1) { s.clipPath = ""; return; }
    if (burning && pc.p >= 1) { s.clipPath = "inset(50% 50% 50% 50%)"; return; }
    const S = pc.span + 40, end = burning ? pc.ext + 120 : -pc.ext - 120, pts = [];
    const pt = (al, x) => `${(pc.ox + al * pc.nx - x * pc.ny).toFixed(1)}px ${(pc.oy + al * pc.ny + x * pc.nx).toFixed(1)}px`;
    for (let j = 0; j <= STEPS; j++) { const x = -S + (2 * S * j) / STEPS; pts.push(pt(frontAt(pc, pc.p, x), x)); }
    pts.push(pt(end, S), pt(end, -S));
    s.clipPath = `polygon(${pts.join(", ")})`;
  };
  pieces.forEach((pc) => { pc.p = 0; clip(pc); });
  // Each piece's gold flare as it forms (as home's parts do), or as it catches.
  if (flare) {
    const halo = (a, rr) => (LITE ? "" : ` drop-shadow(0 0 ${rr}px rgba(255, 206, 120, ${a}))`);
    pieces.forEach((pc) => pc.el.animate([
      { filter: `brightness(2.6)${halo(0.95, 12)}` },
      { filter: `brightness(1.8)${halo(0.75, 9)}`, offset: 0.3 },
      { filter: `brightness(1)${halo(0, 0)}` },
    ], { duration: burning ? build * 0.8 : 720, delay: pc.start + build * 0.15, easing: "cubic-bezier(.2, .8, .2, 1)", fill: burning ? "forwards" : "backwards" }));
  }
  // On the screen: a point `al` along a piece's way and `x` across it.
  const scr = (pc, al, x) => [pc.cx + al * pc.nx - x * pc.ny, pc.cy + al * pc.ny + x * pc.nx];
  // The dust: built, grains flying out of C, each landing on a piece's front
  // just as it gets there; burning, grains lifting off the front where it
  // passes and drawn into C, faster as they go.
  const grains = [];
  pieces.forEach((pc) => {
    const n = Math.round(Math.min(LITE ? 40 : 90, Math.max(14, (pc.b.width * pc.b.height) / (LITE ? 900 : 420))));
    for (let j = 0; j < n; j++) {
      const land = pc.start + r(0.05, 0.85) * build, x = r(-pc.span, pc.span);
      const along = Math.min(pc.ext, Math.max(-pc.ext, frontAt(pc, progress(pc, land), x)));
      const [tx, ty] = scr(pc, along, x), trip = r(280, 460);
      grains.push(burning ? { tx, ty, from: land, land: land + trip, size: r(0.8, 2), spin: twist * r(0.4, 0.9) }
        : { tx, ty, from: Math.max(0, land - trip), land, size: r(0.8, 2), spin: twist * r(0.4, 0.9) });
    }
  });
  const last = Math.max(END, ...grains.map((g) => g.land + 90));

  const dpr = PX(LITE ? 1.25 : 1.5);
  const cv = el("canvas", "burn-fronts");
  cv.setAttribute("aria-hidden", "true");
  // (inside a page, only as wide as the page beside its scrollbar, which would otherwise scroll sideways)
  const cw = host === document.body ? W : Math.min(W, host.clientWidth || W), ch = host === document.body ? H : Math.min(H, host.clientHeight || H);
  cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
  Object.assign(cv.style, { position: "fixed", left: "0", top: "0", width: `${cw}px`, height: `${ch}px`, pointerEvents: "none", zIndex: z });
  host.append(cv);
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

  const t1 = performance.now();
  let gone = false;
  const stop = () => {
    if (gone) return;
    gone = true;
    pieces.forEach((pc) => { pc.p = 1; clip(pc); });
    cv.remove();
  };
  const step = (now) => {
    if (gone) return;
    const t = now - t1;
    if (t >= last) { stop(); return; }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "lighter";
    // The flash at C: built, the dust comes out of it; burning, it's where the dust went.
    if (flash) {
      const u = seg(t, flash.at, flash.at + flash.ms), fl = Math.sin(Math.PI * u);
      if (fl > 0.01) {
        const gr = 12 + 40 * u;
        ctx.globalAlpha = fl;
        ctx.drawImage(spot, C.x - gr, C.y - gr, gr * 2, gr * 2);
        ctx.globalAlpha = 1;
      }
    }
    // Each piece as far as its front, the front's embers along it.
    ctx.lineCap = ctx.lineJoin = "round";
    pieces.forEach((pc) => {
      const p = progress(pc, t);
      if (p !== pc.p) { pc.p = p; clip(pc); }
      if (p <= 0 || p >= 1) return;
      const glow = Math.sin(Math.PI * Math.min(1, p * 1.15));
      ctx.save();
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pc.b.left - 2, pc.b.top - 2, pc.b.width + 4, pc.b.height + 4, pc.round + 2);
      else ctx.rect(pc.b.left - 2, pc.b.top - 2, pc.b.width + 4, pc.b.height + 4);
      ctx.clip();
      [[7, 0.35], [2.4, 0.7], [0.9, 1]].forEach(([lw, a]) => {
        ctx.strokeStyle = `rgba(255, ${lw > 2 ? 170 : 226}, ${lw > 2 ? 90 : 170}, ${(a * glow).toFixed(3)})`;
        ctx.lineWidth = lw;
        ctx.beginPath();
        for (let j = 0; j <= STEPS; j++) {
          const x = -pc.span - 4 + ((2 * pc.span + 8) * j) / STEPS, [sx, sy] = scr(pc, frontAt(pc, p, x), x);
          j ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy);
        }
        ctx.stroke();
      });
      ctx.restore();
    });
    // The dust in flight.
    grains.forEach((g) => {
      let x, y, al;
      if (burning) {
        // lifting off the front, then drawn in, spiralling, faster as it nears C
        if (t < g.from || t > g.land) return;
        const k = (t - g.from) / (g.land - g.from), e = k * k, tw = g.spin * e;
        const dx = (g.tx - C.x) * (1 - e), dy = (g.ty - C.y) * (1 - e), cs = Math.cos(tw), sn = Math.sin(tw);
        x = C.x + dx * cs - dy * sn; y = C.y + dx * sn + dy * cs; al = 1 - 0.55 * k;
      } else {
        // flying out of C, slowing as it lands
        if (t < g.from || t > g.land + 90) return;
        if (t <= g.land) {
          const k = (t - g.from) / (g.land - g.from), e = 1 - (1 - k) * (1 - k), tw = g.spin * (1 - e);
          const dx = (g.tx - C.x) * e, dy = (g.ty - C.y) * e, cs = Math.cos(tw), sn = Math.sin(tw);
          x = C.x + dx * cs - dy * sn; y = C.y + dx * sn + dy * cs; al = 0.45 + 0.55 * k;
        } else { x = g.tx; y = g.ty; al = 1 - (t - g.land) / 90; }
      }
      const gr = g.size * 3 + 2;
      ctx.fillStyle = `rgba(255, 226, 170, ${al.toFixed(3)})`;
      ctx.fillRect(x - g.size / 2, y - g.size / 2, g.size, g.size);
      ctx.globalAlpha = 0.6 * al;
      ctx.drawImage(spot, x - gr, y - gr, gr * 2, gr * 2);
      ctx.globalAlpha = 1;
    });
    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  setTimeout(stop, last + 150);   // (even if the page's frames are paused)
  return { end: last, stop };
}
