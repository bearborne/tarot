// Sky now: where the planets are, at any moment.
// Part of the app; the files in js/ load in the order listed in index.html.

// ── Sky now: where the planets are, at any moment ──────
// Worked out on the phone with astronomy.js, no internet needed.
// The arrows step the time back and forward by the chosen unit.

const SKY_BODIES = [...PLANETS, "Chiron"];
const GLYPHS = { Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃",
  Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇", Chiron: "⚷" };
const SIGN_GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
const RULES = { Sun: "you, your energy", Moon: "feelings", Mercury: "thinking, talk", Venus: "love, beauty",
  Mars: "drive, action", Jupiter: "luck, growth", Saturn: "rules, lessons", Uranus: "sudden change",
  Neptune: "dreams", Pluto: "deep change", Chiron: "old wounds, healing" };
const MOON_PHASES = ["New Moon", "Waxing crescent", "First quarter", "Waxing gibbous",
  "Full Moon", "Waning gibbous", "Last quarter", "Waning crescent"];
const MOON_ICONS = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
const asText = (g) => g + "︎";   // a symbol, not a coloured emoji

// Chiron isn't in astronomy.js, so it's carried along its orbit from where
// NASA JPL's Horizons put it on 14 Nov 2026 (sun-centred, AU and AU/day),
// pulled by the Sun and the big planets.
const CHIRON_START = { jd: 2461358.5, pos: [16.02937033801500, 7.935677029286289, 3.478569887691327],
  vel: [-2.092831639279892e-3, 2.461004462594767e-3, 6.407684802227911e-4] };
const CHIRON_STEP = 10;   // days per step of the simulation
let chironSim = null;

function chironHelio(date) {
  const target = Astronomy.MakeTime(date);
  const t0 = Astronomy.MakeTime(new Date((CHIRON_START.jd - 2440587.5) * 864e5));
  // Start again from Horizons' date if that's nearer than where the last run stopped.
  if (!chironSim || Math.abs(target.tt - t0.tt) < Math.abs(target.tt - chironSim.Time.tt)) {
    const [x, y, z] = CHIRON_START.pos, [vx, vy, vz] = CHIRON_START.vel;
    chironSim = new Astronomy.GravitySimulator(Astronomy.Body.Sun, t0,
      [new Astronomy.StateVector(x, y, z, vx, vy, vz, t0)]);
  }
  while (Math.abs(target.tt - chironSim.Time.tt) > CHIRON_STEP) {
    const dir = Math.sign(target.tt - chironSim.Time.tt);
    chironSim.Update(chironSim.Time.AddDays(dir * CHIRON_STEP));
  }
  return chironSim.Update(target)[0];
}

function eclipticLon(body, date) {
  if (body === "Sun") return Astronomy.SunPosition(date).elon;
  if (body === "Moon") return Astronomy.EclipticGeoMoon(date).lon;
  if (body === "Chiron") {
    const c = chironHelio(date), e = Astronomy.HelioVector(Astronomy.Body.Earth, date);
    return Astronomy.Ecliptic(new Astronomy.Vector(c.x - e.x, c.y - e.y, c.z - e.z, e.t)).elon;
  }
  return Astronomy.Ecliptic(Astronomy.GeoVector(body, date, true)).elon;
}

// Degrees and minutes within the sign: 21°26′.
function degText(x) {
  const t = Math.floor(x * 60);
  return `${Math.floor(t / 60)}°${String(t % 60).padStart(2, "0")}′`;
}

function skyAt(date) {
  const later = new Date(date.getTime() + 3600e3);
  const bodies = SKY_BODIES.map((body) => {
    const lon = eclipticLon(body, date);
    // Retrograde: the planet seems to slip backwards along the zodiac.
    const step = ((eclipticLon(body, later) - lon + 540) % 360) - 180;
    return { body, lon, sign: Math.floor(lon / 30), deg: Math.floor(lon % 30), dms: degText(lon % 30),
      retro: step < 0 && body !== "Sun" && body !== "Moon" };
  });
  const angle = Astronomy.MoonPhase(date);
  const k = Math.round(angle / 45) % 8;
  const moon = { name: MOON_PHASES[k], icon: MOON_ICONS[k],
    lit: Math.round(Astronomy.Illumination("Moon", date).phase_fraction * 100),
    day: Math.floor(angle / 360 * 29.53) + 1 };
  return { bodies, moon };
}

// The zodiac wheel: Aries on the left, going round anticlockwise. It's
// built once and kept, so when the time steps the planets glide round
// to their new places instead of jumping.
const WHEEL = { svg: null, planets: {}, signs: [], moon: null, lit: null, raf: 0, hot: null };
const WS = 300, WC = WS / 2, WR = 136, WBAND = 20;
const WHEEL_NS = "http://www.w3.org/2000/svg";
const wheelPt = (lon, r) => { const a = Math.PI - lon * Math.PI / 180; return [WC + r * Math.cos(a), WC - r * Math.sin(a)]; };

function svgEl(parent, tag, attrs = {}, txt) {
  const e = document.createElementNS(WHEEL_NS, tag);
  Object.entries(attrs).forEach(([a, v]) => e.setAttribute(a, v));
  if (txt != null) e.textContent = txt;
  parent.append(e);
  return e;
}

function buildWheel() {
  const svg = document.createElementNS(WHEEL_NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${WS} ${WS}`);
  svg.setAttribute("class", "sky-wheel");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Zodiac wheel");
  const defs = svgEl(svg, "defs");
  const glow = svgEl(defs, "filter", { id: "skyGlow", x: "-50%", y: "-50%", width: "200%", height: "200%" });
  svgEl(glow, "feGaussianBlur", { stdDeviation: "2.2", result: "b" });
  const merge = svgEl(glow, "feMerge");
  svgEl(merge, "feMergeNode", { in: "b" });
  svgEl(merge, "feMergeNode", { in: "SourceGraphic" });
  const core = svgEl(defs, "radialGradient", { id: "skyCore" });
  svgEl(core, "stop", { offset: "0", "stop-color": "#ffd682", "stop-opacity": ".2" });
  svgEl(core, "stop", { offset: ".6", "stop-color": "#ffbe5a", "stop-opacity": ".06" });
  svgEl(core, "stop", { offset: "1", "stop-color": "#ffbe5a", "stop-opacity": "0" });

  // A slowly turning ring of gold dots outside the zodiac, like the runes of the summary.
  // (It fades in on its own wrapper, so the turning is never restarted.)
  const runes = svgEl(svgEl(svg, "g", { class: "w-runes-in" }), "g", { class: "w-runes" });
  for (let i = 0; i < 72; i++) {
    const [x, y] = wheelPt(i * 5, WR + 8);
    if (i % 6 === 0) svgEl(runes, "rect", { x: x - 2, y: y - 2, width: 4, height: 4, class: "w-diamond",
      transform: `rotate(45 ${x} ${y})` });
    else svgEl(runes, "circle", { cx: x, cy: y, r: i % 2 ? .7 : 1.1, class: "w-dot" });
  }
  svgEl(svg, "circle", { cx: WC, cy: WC, r: WR - WBAND, fill: "url(#skyCore)" });
  svgEl(svg, "circle", { cx: WC, cy: WC, r: WR, class: "w-line w-draw", pathLength: 1 });
  svgEl(svg, "circle", { cx: WC, cy: WC, r: WR - WBAND, class: "w-line w-draw", pathLength: 1 });
  svgEl(svg, "circle", { cx: WC, cy: WC, r: 44, class: "w-faint w-draw", pathLength: 1 });
  // A small tick every 10°, a line across the band where each sign begins.
  for (let d = 0; d < 360; d += 10) {
    const [x1, y1] = wheelPt(d, WR - WBAND), [x2, y2] = wheelPt(d, d % 30 ? WR - WBAND + 3 : WR);
    svgEl(svg, "line", { x1, y1, x2, y2, class: d % 30 ? "w-faint" : "w-line" });
  }
  SIGN_GLYPHS.forEach((g, i) => {
    // The sign's stretch of the band, lit up when one of its planets is pointed at.
    const [ox1, oy1] = wheelPt(i * 30, WR), [ox2, oy2] = wheelPt(i * 30 + 30, WR);
    const [ix1, iy1] = wheelPt(i * 30, WR - WBAND), [ix2, iy2] = wheelPt(i * 30 + 30, WR - WBAND);
    const seg = svgEl(svg, "path", { class: "w-seg", d: `M${ox1} ${oy1} A${WR} ${WR} 0 0 1 ${ox2} ${oy2} ` +
      `L${ix2} ${iy2} A${WR - WBAND} ${WR - WBAND} 0 0 0 ${ix1} ${iy1} Z` });
    const [x, y] = wheelPt(i * 30 + 15, WR - WBAND / 2);
    const t = svgEl(svg, "text", { x, y, class: "w-sign" }, asText(g));
    t.style.animationDelay = `${i * 50}ms`;
    WHEEL.signs[i] = { seg, glyph: t };
  });
  const planets = svgEl(svg, "g");
  SKY_BODIES.forEach((body) => {
    const tick = svgEl(planets, "line", { class: "w-tick" });
    const glyph = svgEl(planets, "text", { class: "w-planet" }, asText(GLYPHS[body]));
    WHEEL.planets[body] = { tick, glyph, lon: null, ring: 0 };
  });
  WHEEL.moon = svgEl(svg, "text", { x: WC, y: WC - 6, class: "w-moon" });
  WHEEL.lit = svgEl(svg, "text", { x: WC, y: WC + 19, class: "w-lit" });
  WHEEL.svg = svg;
}

function placePlanet(p, lon, ring, alpha = 1) {
  p.lon = lon;   // where it is right now, so a step mid-glide carries on from here
  p.ring = ring;
  const [x, y] = wheelPt(lon, ring);
  p.glyph.setAttribute("x", x);
  p.glyph.setAttribute("y", y);
  p.glyph.style.opacity = alpha;
  const [x1, y1] = wheelPt(lon, WR - WBAND), [x2, y2] = wheelPt(lon, WR - WBAND - 6);
  Object.entries({ x1, y1, x2, y2 }).forEach(([a, v]) => p.tick.setAttribute(a, v));
  p.tick.style.opacity = alpha;
}

// Moves the planets to this moment's places: they sweep in from the
// centre when the wheel opens, and glide the short way round after that.
function updateWheel(bodies, moon, opening) {
  const placed = [];
  const targets = [...bodies].sort((a, b) => a.lon - b.lon).map((b) => {
    let ring = WR - WBAND - 17;   // planets near each other step inwards
    while (placed.some((q) => q.ring === ring && Math.abs(((q.lon - b.lon + 540) % 360) - 180) < 10)) ring -= 20;
    placed.push({ lon: b.lon, ring });
    const p = WHEEL.planets[b.body];
    p.sign = b.sign;
    p.glyph.classList.toggle("retro", b.retro);
    const fresh = p.lon == null || opening;
    const from = fresh ? b.lon - 140 : p.lon;
    const to = from + ((((b.lon - from) % 360) + 540) % 360) - 180;
    const fromRing = fresh ? 8 : p.ring;
    return { p, from, to, fromRing, ring, fade: fresh };
  });
  WHEEL.moon.textContent = moon.icon;
  WHEEL.lit.textContent = `${moon.lit}% lit`;
  cancelAnimationFrame(WHEEL.raf);
  const done = () => targets.forEach((t) => placePlanet(t.p, t.to, t.ring));
  if (calm) { done(); return; }
  const start = performance.now(), dur = opening ? 1400 : 900;
  const ease = (k) => 1 - Math.pow(1 - k, 3);
  WHEEL.raf = requestAnimationFrame(function frame(now) {
    targets.forEach((t, i) => {
      const delay = opening ? i * 45 : 0;
      const k = ease(Math.min(1, Math.max(0, (now - start - delay) / dur)));
      placePlanet(t.p, t.from + (t.to - t.from) * k, t.fromRing + (t.ring - t.fromRing) * k, t.fade ? k : 1);
    });
    if (now - start < dur + targets.length * 45) WHEEL.raf = requestAnimationFrame(frame);
    else done();
  });
}

// The sheet's own night sky, like the home screen's.
const skySheetShown = () => !$("skySheet").hidden && !document.hidden;
const skyField = makeStarfield($("skyStars"), skySheetShown);

const SKY_UNITS = ["Hour", "Day", "Week", "Month", "Year"];
const SKY = { at: null, unit: "Day", shown: {} };   // at: null means now

function skyStep(dir) {
  const d = new Date(SKY.at || Date.now());
  if (SKY.unit === "Hour") d.setHours(d.getHours() + dir);
  if (SKY.unit === "Day") d.setDate(d.getDate() + dir);
  if (SKY.unit === "Week") d.setDate(d.getDate() + 7 * dir);
  if (SKY.unit === "Month") d.setMonth(d.getMonth() + dir);
  if (SKY.unit === "Year") d.setFullYear(d.getFullYear() + dir);
  SKY.at = d;
  renderSky();
}

function renderSky(opening = false) {
  const box = $("skyBody");
  // The wheel's box stays in the page while the rest is redrawn: taking the
  // wheel out and back would restart its turning ring of runes.
  [...box.children].forEach((n) => { if (n !== WHEEL.cols) n.remove(); });
  if (typeof Astronomy === "undefined") {
    box.append(el("p", "empty-note", "The sky couldn't be worked out on this device."));
    return;
  }
  const date = SKY.at || new Date();
  const { bodies, moon } = skyAt(date);
  box.classList.toggle("entering", opening && !calm);

  const ornament = () => { const l = el("div", "rpg-line sky-orn"); l.append(el("i"), el("b"), el("i")); return l; };
  const when = el("p", "sky-when");
  when.append(el("span", "", `${date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · ${timeText(date)}`));
  // Present: back to the sky as it is now. Always there, so nothing shifts; resting while it's already now.
  const present = el("button", "chip sky-present", "Present");
  present.disabled = !SKY.at;
  present.setAttribute("aria-label", "Back to the present sky");
  present.addEventListener("click", () => { SKY.at = null; renderSky(); });
  when.append(present);
  const top = [ornament(), when];

  // ‹ Hour Day Week Month Year ›
  const steps = el("div", "sky-steps");
  const back = el("button", "sky-arrow", "‹"), fwd = el("button", "sky-arrow", "›");
  back.setAttribute("aria-label", `Back one ${SKY.unit.toLowerCase()}`);
  fwd.setAttribute("aria-label", `Forward one ${SKY.unit.toLowerCase()}`);
  back.addEventListener("click", () => skyStep(-1));
  fwd.addEventListener("click", () => skyStep(1));
  const units = el("div", "sky-units");
  SKY_UNITS.forEach((u) => {
    const b = el("button", `chip sky-unit${u === SKY.unit ? " on" : ""}`, u);
    b.addEventListener("click", () => { SKY.unit = u; renderSky(); });
    units.append(b);
  });
  steps.append(back, units, fwd);
  top.push(steps);

  const moonPos = bodies.find((b) => b.body === "Moon");
  const lunation = el("div", "sky-moon");
  lunation.append(el("span", "sky-moon-main", `${moon.icon} ${moon.name} · Moon in ${SIGNS[moonPos.sign]} ${moonPos.dms}`),
    el("span", "sky-moon-note", `${moon.lit}% lit · day ${moon.day} of 29`));
  flashIfChanged(lunation, "moon", lunation.textContent, opening);
  fitOneLine([lunation.firstChild], true);   // phase and Moon sign stay on one line

  // On a wide screen the wheel sits beside the list; on a phone above it.
  if (!WHEEL.svg) buildWheel();
  WHEEL.svg.classList.toggle("drawing", opening && !calm);
  if (!WHEEL.cols) { WHEEL.cols = el("div", "sky-cols"); WHEEL.cols.append(WHEEL.svg); }
  const cols = WHEEL.cols, side = el("div", "sky-side");
  cols.querySelector(".sky-side")?.remove();
  cols.append(side);
  if (!cols.isConnected) box.append(cols);
  cols.before(...top);
  WHEEL.svg.getBoundingClientRect();   // settle it in its new place before it moves
  if (opening) WHEEL.hot = null;
  updateWheel(bodies, moon, opening);

  // Two columns, read down: Sun to Mars, then Jupiter to Chiron. The Moon is in the bar above.
  const list = el("div", "sky-list");
  bodies.filter((b) => b.body !== "Moon").forEach((p, i) => {
    const row = el("div", "sky-row");
    row.style.setProperty("--i", i);
    const info = el("span", "sky-info");
    const where = el("span", "sky-where", `${SIGNS[p.sign]} ${p.dms}`);
    if (p.retro) where.append(el("span", "sky-rx", " ℞"));
    info.append(el("span", "sky-name", p.body), where, el("small", "sky-rule", RULES[p.body]));
    row.append(el("span", "sky-glyph", asText(GLYPHS[p.body])), info);
    // Pointing at a tile lights up its planet and sign on the wheel; on a phone, a tap does.
    row.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") skyHot(p.body); });
    row.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") skyHot(null); });
    let down = null;
    row.addEventListener("pointerdown", (e) => { down = [e.clientX, e.clientY]; });
    row.addEventListener("pointerup", (e) => {
      if (e.pointerType === "mouse") return;   // a mouse already lit it by pointing
      if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 10) return;   // a scroll, not a tap
      skyHot(WHEEL.hot === p.body ? null : p.body);
    });
    row.classList.toggle("hot", WHEEL.hot === p.body);
    row.dataset.body = p.body;
    flashIfChanged(row, p.body, where.textContent, opening);
    list.append(row);
  });
  side.append(lunation, list);
  // Every sign shows at one size: if the longest doesn't fit its tile, they all shrink together.
  fitOneLine([...list.querySelectorAll(".sky-where")], true);
  fitSkyToWheel();
  skyHot(WHEEL.hot);   // the sign may have changed with the time
}

// On a wide screen the Moon bar and tiles grow together until they're as
// tall as the wheel beside them (or as wide as the room left allows).
function fitSkyToWheel() {
  const side = document.querySelector("#skySheet .sky-side"), cols = side?.parentElement;
  if (!side) return;
  const list = side.querySelector(".sky-list");
  side.style.fontSize = list.style.gridTemplateColumns = "";
  if (!matchMedia("(min-width: 900px)").matches) return;
  const fit = () => {
    if (!side.isConnected) return;
    const wheel = WHEEL.svg.getBoundingClientRect();
    if (!wheel.height) return;
    // The tiles are sized for the longest place any planet could be in, so
    // they keep one size as the time changes; only the text inside shrinks.
    const wheres = [...side.querySelectorAll(".sky-where")];
    const real = wheres.map((w) => [...w.childNodes]);
    side.style.fontSize = list.style.gridTemplateColumns = "";
    wheres.forEach((w) => { w.style.fontSize = w.style.height = w.style.lineHeight = ""; w.textContent = "Sagittarius 28°48′ ℞"; });
    const gap = parseFloat(getComputedStyle(cols).columnGap) || 0;
    const room = cols.clientWidth - wheel.width - gap;
    let size = parseFloat(getComputedStyle(side).fontSize);
    for (let i = 0; i < 3; i++) {   // text and boxes don't grow in exact proportion, so settle in a few steps
      const r = side.getBoundingClientRect();
      size *= Math.min(wheel.height / r.height, room / r.width);
      side.style.fontSize = `${size.toFixed(2)}px`;
    }
    list.style.gridTemplateColumns = getComputedStyle(list).gridTemplateColumns;
    wheres.forEach((w, i) => w.replaceChildren(...real[i]));
  };
  fit();
  document.fonts?.ready.then(fit);
}
addEventListener("resize", () => { if (!$("skySheet").hidden) fitSkyToWheel(); });

// Lights up one planet and the sign it's in (null: none).
function skyHot(body) {
  WHEEL.hot = body;
  WHEEL.svg?.classList.toggle("focus", !!body);
  Object.entries(WHEEL.planets).forEach(([b, p]) => {
    p.glyph.classList.toggle("hot", b === body);
    p.tick.classList.toggle("hot", b === body);
  });
  const sign = body ? WHEEL.planets[body].sign : -1;
  WHEEL.signs.forEach((s, i) => { s.seg.classList.toggle("hot", i === sign); s.glyph.classList.toggle("hot", i === sign); });
  document.querySelectorAll("#skySheet .sky-row").forEach((r) => r.classList.toggle("hot", r.dataset.body === body));
}

// A soft gold glow on whatever changed since the last step.
function flashIfChanged(node, key, value, opening) {
  if (!opening && !calm && SKY.shown[key] != null && SKY.shown[key] !== value) node.classList.add("changed");
  SKY.shown[key] = value;
}

$("skyBtn").addEventListener("click", () => {
  SKY.at = null;
  SKY.shown = {};
  renderSky(true);
  bloomFromButton($("skySheet"), $("skyBtn"));
  fitSkyToWheel();   // now it's showing and can be measured
  skyField.size();
  skyField.start();
});
$("skyBack").addEventListener("click", () => closeSheetInto($("skySheet"), $("skyBtn")));
addEventListener("resize", () => { if (skySheetShown()) { skyField.size(); if (calm) skyField.draw(0); } });
document.addEventListener("visibilitychange", () => skyField.start());
