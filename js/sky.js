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

// The chart: the zodiac inside the app's magic circle, drawn in fine gold
// hairlines. A band of runes turns slowly round the outside, a faint
// hexagram sits inside, and the Moon as it looks tonight is in the middle.
// It's built once and kept, so when the time steps the planets glide round
// to their new places. Aries is on the left; the signs go round clockwise.
const WR = { runesOut: 147, runesIn: 133, zOut: 128, zIn: 108, planet: 94, core: 34 };
const WHEEL = { svg: null, planets: {}, signs: [], moon: null, hot: null, cols: null };
const wheelXY = (lon, r) => { const a = Math.PI - lon * Math.PI / 180; return [r * Math.cos(a), -r * Math.sin(a)]; };

function svgEl(parent, tag, attrs = {}, txt) {
  const e = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([a, v]) => e.setAttribute(a, v));
  if (txt != null) e.textContent = txt;
  parent.append(e);
  return e;
}

function buildWheel() {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "-150 -150 300 300");
  svg.setAttribute("class", "sky-wheel");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Zodiac chart");
  const ring = (r, cls = "w-line") => svgEl(svg, "circle", { r, class: cls });

  // The turning band of runes, between two circles, broken by small node circles.
  const band = svgEl(svg, "g", { class: "w-runes" });
  const mid = (WR.runesOut + WR.runesIn) / 2, n = 48;
  for (let i = 0; i < n; i++) {
    const deg = i * 360 / n, a = deg * Math.PI / 180;
    const x = mid * Math.cos(a), y = mid * Math.sin(a);
    if (i % 8 === 0) { svgEl(band, "circle", { cx: x, cy: y, r: 2.6, class: "w-node" }); continue; }
    svgEl(band, "path", { d: RUNE_D[(i * 7) % RUNE_D.length], class: "w-rune",
      transform: `translate(${x} ${y}) rotate(${deg + 90}) scale(.5) translate(-6 -8)` });
  }
  ring(WR.runesOut); ring(WR.runesIn, "w-faint");

  // The zodiac band: a line where each sign begins, a small tick every 10°.
  ring(WR.zOut); ring(WR.zIn);
  for (let d = 0; d < 360; d += 10) {
    const [x1, y1] = wheelXY(d, WR.zIn), [x2, y2] = wheelXY(d, d % 30 ? WR.zIn + 3 : WR.zOut);
    svgEl(svg, "line", { x1, y1, x2, y2, class: d % 30 ? "w-faint" : "w-line" });
  }
  SIGN_GLYPHS.forEach((g, i) => {
    const [x, y] = wheelXY(i * 30 + 15, (WR.zOut + WR.zIn) / 2);
    WHEEL.signs[i] = svgEl(svg, "text", { x, y, class: "w-sign" }, asText(g));
  });

  // The hexagram, its points on the zodiac's inner line, and the small circle at the centre.
  const hex = [0, 1].map((t) => [0, 1, 2].map((k) => wheelXY(90 + t * 60 + k * 120, WR.zIn)));
  hex.forEach((pts) => svgEl(svg, "polygon", { points: pts.map((p) => p.join(",")).join(" "), class: "w-hex" }));
  ring(WR.core, "w-faint");

  // The planets: each turns round the centre, so a step makes it glide.
  const layer = svgEl(svg, "g");
  SKY_BODIES.forEach((body) => {
    const orbit = svgEl(layer, "g", { class: "w-orbit" });
    svgEl(orbit, "line", { x1: -WR.zIn, y1: 0, x2: -WR.zIn + 6, y2: 0, class: "w-tick" });
    const arm = svgEl(orbit, "g", { class: "w-arm" });
    const glyph = svgEl(arm, "text", { class: "w-planet" }, asText(GLYPHS[body]));
    WHEEL.planets[body] = { orbit, arm, glyph, turn: null };
  });

  // The Moon in the middle: a hairline circle with its lit part filled.
  WHEEL.moon = svgEl(svg, "g", { class: "w-moon" });
  WHEEL.svg = svg;
}

// The lit part of a Moon of radius r centred on 0, 0, for a phase angle (0 new, 180 full).
function moonLitPath(angle, r) {
  const a = angle * Math.PI / 180, rx = Math.abs(Math.cos(a)) * r, gibbous = Math.cos(a) < 0;
  return `M0 ${-r} A${r} ${r} 0 0 1 0 ${r} A${rx} ${r} 0 0 ${gibbous ? 1 : 0} 0 ${-r} Z`;
}

function updateWheel(bodies, phase, opening) {
  // Planets near each other step inwards so their glyphs don't overlap.
  const placed = [];
  [...bodies].sort((a, b) => a.lon - b.lon).forEach((b) => {
    let r = WR.planet;
    while (placed.some((q) => q.r === r && Math.abs(((q.lon - b.lon + 540) % 360) - 180) < 9)) r -= 17;
    placed.push({ lon: b.lon, r });
    const p = WHEEL.planets[b.body];
    p.sign = b.sign;
    p.glyph.classList.toggle("retro", b.retro);
    // Turn the short way round from where it was (signs run clockwise on screen, as CSS turns).
    const target = b.lon;
    const turn = p.turn == null || opening ? target : p.turn + ((((target - p.turn) % 360) + 540) % 360) - 180;
    const set = () => {
      p.turn = turn;
      p.orbit.style.transform = `rotate(${turn}deg)`;
      p.arm.style.transform = `translateX(${-r}px)`;
      p.glyph.style.transform = `rotate(${-turn}deg)`;
    };
    if (opening && !calm) {
      // Opening: each planet sweeps in from further round, near the centre.
      p.orbit.style.transition = p.arm.style.transition = p.glyph.style.transition = "none";
      p.orbit.style.transform = `rotate(${turn + 120}deg)`;
      p.arm.style.transform = "translateX(-10px)";
      p.glyph.style.transform = `rotate(${-turn - 120}deg)`;
      p.orbit.style.opacity = 0;
      p.orbit.getBoundingClientRect();
      p.orbit.style.transition = p.arm.style.transition = p.glyph.style.transition = "";
      p.orbit.style.opacity = "";
      requestAnimationFrame(set);
    } else set();
  });
  WHEEL.moon.innerHTML = `<g${phase > 180 ? ' transform="scale(-1 1)"' : ""}><path class="lit" d="${moonLitPath(phase, 15)}"/></g>` +
    `<circle class="rim" r="15"/>`;
}

// Lights up one planet and the sign it's in (null: none).
function skyHot(body) {
  WHEEL.hot = body;
  WHEEL.svg?.classList.toggle("focus", !!body);
  Object.entries(WHEEL.planets).forEach(([b, p]) => p.orbit.classList.toggle("hot", b === body));
  const sign = body ? WHEEL.planets[body].sign : -1;
  WHEEL.signs.forEach((t, i) => t.classList.toggle("hot", i === sign));
  document.querySelectorAll("#skySheet .sky-row").forEach((r) => r.classList.toggle("hot", r.dataset.body === body));
}

// The sheet's own night sky, like the home screen's.
const skySheetShown = () => !$("skySheet").hidden && !$("skySheet").classList.contains("closing") && !document.hidden;
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

// What each phase asks of you, in a line.
const MOON_NOTES = [
  "Begin — set one quiet intention for yourself.",
  "Growing — tend the small start you made.",
  "Deciding — act on what you chose.",
  "Refining — the shape clarifies before the bloom.",
  "Seeing — what was hidden in you comes to light.",
  "Sharing — give out what you have learned.",
  "Releasing — let go of what you've outgrown.",
  "Resting — clear space before the next start."];

// The Moon as it looks tonight: a hairline circle with its lit part filled.
function moonPic(angle) {
  const r = 26, c = 28, a = angle * Math.PI / 180;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 56 56");
  svg.setAttribute("class", "sky-moon-pic");
  svg.setAttribute("aria-hidden", "true");
  const rx = Math.abs(Math.cos(a)) * r, gibbous = Math.cos(a) < 0;
  // The lit half-circle, closed by the curved edge between light and dark.
  const lit = `M${c} ${c - r} A${r} ${r} 0 0 1 ${c} ${c + r} A${rx} ${r} 0 0 ${gibbous ? 1 : 0} ${c} ${c - r} Z`;
  svg.innerHTML = `<g${angle > 180 ? ` transform="matrix(-1 0 0 1 ${2 * c} 0)"` : ""}>` +
    `<path class="lit" d="${lit}"/></g><circle class="rim" cx="${c}" cy="${c}" r="${r}"/>`;
  return svg;
}

function renderSky(opening = false) {
  const box = $("skyBody");
  // The chart stays in the page while the rest is redrawn: taking it out
  // and back would restart its turning runes and its planets' glide.
  [...box.children].forEach((n) => { if (n !== WHEEL.cols) n.remove(); });
  if (typeof Astronomy === "undefined") {
    box.append(el("p", "empty-note", "The sky couldn't be worked out on this device."));
    return;
  }
  const date = SKY.at || new Date();
  const { bodies, moon } = skyAt(date);
  box.classList.toggle("entering", opening && !calm);

  // Date, and ‹ Hour Day Week Month Year › to step through time.
  const when = el("p", "sky-when");
  when.append(el("span", "", `${date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · ${timeText(date)}`));
  const present = el("button", "link sky-present", "Now");
  present.hidden = !SKY.at;
  present.setAttribute("aria-label", "Back to the present sky");
  present.addEventListener("click", () => { SKY.at = null; renderSky(); });
  when.append(present);

  const steps = el("div", "sky-steps");
  const back = el("button", "sky-arrow", "‹"), fwd = el("button", "sky-arrow", "›");
  back.setAttribute("aria-label", `Back one ${SKY.unit.toLowerCase()}`);
  fwd.setAttribute("aria-label", `Forward one ${SKY.unit.toLowerCase()}`);
  back.addEventListener("click", () => skyStep(-1));
  fwd.addEventListener("click", () => skyStep(1));
  const units = el("div", "sky-units");
  SKY_UNITS.forEach((u) => {
    const b = el("button", `sky-unit${u === SKY.unit ? " on" : ""}`, u);
    b.addEventListener("click", () => { SKY.unit = u; renderSky(); });
    units.append(b);
  });
  steps.append(back, units, fwd);

  // Planets: glyph, "Sun in Scorpio", degrees on the right. Two columns on a wide screen, read down.
  const listHead = el("div", "sky-head");
  listHead.append(el("span", "", SKY.at ? "In the sky then" : "Now in the sky"));
  const list = el("div", "sky-list");
  bodies.forEach((p, i) => {
    const row = el("div", "sky-row");
    row.style.setProperty("--i", i);
    const name = el("span", "sky-name");
    name.append(p.body, el("i", "", " in "), SIGNS[p.sign]);
    const deg = el("span", "sky-deg", p.dms.replace("°", "° "));
    if (p.retro) deg.append(el("span", "sky-rx", "℞"));
    row.append(el("span", "sky-glyph", asText(GLYPHS[p.body])), name, deg);
    // Pointing at a row lights up its planet and sign on the chart; on a phone, a tap does.
    row.dataset.body = p.body;
    row.classList.toggle("hot", WHEEL.hot === p.body);
    row.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") skyHot(p.body); });
    row.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") skyHot(null); });
    row.addEventListener("click", (e) => { if (e.pointerType !== "mouse") skyHot(WHEEL.hot === p.body ? null : p.body); });
    flashIfChanged(row, p.body, row.textContent, opening);
    list.append(row);
  });

  // Moon phase
  const moonHead = el("div", "sky-head");
  moonHead.append(el("span", "", "Moon phase"));
  const card = el("div", "sky-moon");
  const text = el("div", "sky-moon-text");
  text.append(el("span", "sky-moon-name", moon.name),
    el("span", "sky-moon-meta", `Day ${moon.day} of 29 · ${moon.lit}% lit`),
    el("span", "sky-moon-note", MOON_NOTES[MOON_PHASES.indexOf(moon.name)]));
  card.append(moonPic(Astronomy.MoonPhase(date)), text);
  flashIfChanged(card, "moon", text.textContent, opening);

  // On a wide screen the chart sits beside the list; on a phone above it.
  if (!WHEEL.svg) buildWheel();
  if (!WHEEL.cols) { WHEEL.cols = el("div", "sky-cols"); WHEEL.cols.append(WHEEL.svg); }
  WHEEL.cols.querySelector(".sky-side")?.remove();
  const side = el("div", "sky-side");
  side.append(listHead, list, moonHead, card);
  WHEEL.cols.append(side);
  if (!WHEEL.cols.isConnected) box.append(WHEEL.cols);
  WHEEL.cols.before(when, steps);
  WHEEL.svg.classList.toggle("drawing", opening && !calm);
  if (opening) WHEEL.hot = null;
  updateWheel(bodies, Astronomy.MoonPhase(date), opening);
  skyHot(WHEEL.hot);   // the sign may have changed with the time
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
  skyField.size();
  skyField.start();
});
$("skyBack").addEventListener("click", () => closeSheetInto($("skySheet"), $("skyBtn")));
addEventListener("resize", () => { if (skySheetShown()) { skyField.size(); if (calm) skyField.draw(0); } });
document.addEventListener("visibilitychange", () => skyField.start());
