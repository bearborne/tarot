// The card table: shuffle, fan, pick and turn.
// Part of the app; the files in js/ load in the order listed in index.html.

// ── 2. The table ────────────────────────────────────────

let readingsCast = 0;   // readings started since the app opened

function startReading(spread, from) {
  if (swapping) return;
  const n = spread.positions.length;
  const deck = activeDeck();
  if (deck.length < n) {
    alert(`This spread needs ${n} cards, but the deck only has ${deck.length}.`);
    return;
  }
  // base: the spread as chosen; spread: the one in use, with a theme's
  // questions laid over it once one is chosen (see applyTheme).
  // quick: after the first reading since the app opened, the motes and the
  // fan opening play much faster (see castSpread, moteToDeck and fanOut).
  S = { spread, base: spread, theme: null, n, deck, slots: [], picked: 0, revealed: 0, phase: "shuffle", quick: readingsCast++ > 0 };
  resetMagic();

  // The spread's cards leap out of the button you tapped and fly to their
  // places on the table as it appears (see castSpread).
  if (from && !calm) castSpread(from, n);
  else swapScreen($("home"), $("table"));
  $("endActions").hidden = true;
  $("themeBtn").disabled = false;

  const slots = $("slots");
  slots.innerHTML = "";
  slots.dataset.count = Math.min(n, 5);
  layoutSlots();
  spread.positions.forEach((pos, i) => {
    const s = el("div", "slot");
    const box = el("div", "slot-card");
    // The card's name and its key word appear here once it's turned over.
    const nameEl = el("div", "slot-name", " ");
    const kwEl = el("div", "slot-kw", " ");
    // A theme's place name, inside the empty slot until a card covers it.
    const placeEl = el("div", "slot-place");
    box.append(placeEl);
    s.append(box, nameEl, kwEl);
    slots.append(s);
    S.slots.push({ box, nameEl, kwEl, placeEl, card: null, reversed: false, tcard: null, flipped: false, i });
  });
  applyTheme(null);

  const pile = $("deck");
  pile.innerHTML = "";
  pile.hidden = false;
  for (let i = 0; i < DECK_LOOK; i++) {
    const c = el("div", "cback");
    c.style.setProperty("--i", i);   // (its place in the pile: see .deck .cback)
    pile.append(c);
  }
  // The deck wakes once the last mote has come down into it (moteToDeck);
  // in case none comes (no cast to this table), it wakes anyway.
  const waking = S;
  setTimeout(() => { if (S === waking) wakeDeck(); }, 2600 + n * 60);
  $("fan").innerHTML = "";
  // Once the spread has landed, while nothing moves, ready the circle's
  // light for the first pick (see prepareMagic).
  const reading = S;
  setTimeout(() => {
    const go = () => { if (S === reading && S.phase === "shuffle") prepareMagic(); };
    window.requestIdleCallback ? requestIdleCallback(go, { timeout: 600 }) : go();
  }, 1300);
  $("hint").textContent = " ";   // (the deck opens by itself: see wakeDeck)
  $("hint").classList.remove("dim");
}

// ── Casting the spread ──────────────────────────────────
// Tapping a spread on the home screen: the other buttons step back while
// the chosen one flares, and the little card backs drawn on it come alive:
// they leap up out of the fan, fanning wider and glowing, while home
// fades. As the table appears, each card flies in an arc to its own place,
// one after another, growing to its full size and straightening from its
// tilt on the way, then drops level onto its dotted place for the last
// stretch and settles exactly on it. There it melts into the place: its
// gold lines fade, leaving its glowing dotted outline on the place's own,
// which lights up gold for a moment. The places are then ready for the
// cards you'll pick. (The cards are drawn in gold lines only, with no fill,
// so nothing is left to fade to emptiness.)
// (Each card changes its real width and height rather than being scaled,
// so it stays sharp at every size: a scaled-up picture blurs.)
function castSpread(btn, n) {
  swapping = true;   // (no second tap meanwhile; swapScreen carries it on)
  const list = $("spreadList");
  list.classList.add("chosen");
  btn.classList.add("pick");
  const fan = btn.querySelector(".spread-fan");
  const fr = fan.getBoundingClientRect(), u = fr.width / 46;   // the fan's drawing is 46 wide (see spreadFan)
  const w = 11 * u, h = 18 * u, big = 1.8;
  const tilt = n === 1 ? 0 : Math.min(14, 5 + n * 3);
  const glow = (g) => `0 0 ${4 + 5 * g}px rgba(255, 200, 110, ${0.22 + 0.22 * g})`;   // a soft glow, not a halo
  const cards = [];
  for (let k = 0; k < n; k++) {
    // Where spreadFan drew this card, on screen.
    const a = n === 1 ? 0 : -tilt + (2 * tilt * k) / (n - 1);
    const x = fr.left + (23 + (k - (n - 1) / 2) * 3.2) * u, y = fr.top + (18 + Math.abs(a) * 0.12) * u;
    const f = el("div", "cast-card");
    const back = el("div", "cast-back");
    const frame = el("span", "cast-frame"), orb = el("span", "cast-orb");
    back.append(frame, orb);
    f.append(back);
    Object.assign(f.style, { left: `${x}px`, top: `${y}px`, zIndex: 9500 });
    document.body.append(f);
    // The leap: up and out of the button, fanning wider, growing, glowing.
    const jx = (k - (n - 1) / 2) * w * big * Math.min(1.15, 6 / n), jy = -h * 1.7 - Math.cos((a * Math.PI) / 60) * h * 0.4;
    const jump = { transform: `translate(${jx}px, ${jy}px) translate(-50%, -50%) rotate(${a * 2}deg)`,
      width: `${w * big}px`, height: `${h * big}px`, boxShadow: glow(1), opacity: 1 };
    f.animate([
      { transform: `translate(0, -2px) translate(-50%, -50%) rotate(${a}deg)`, width: `${w}px`, height: `${h}px`, boxShadow: glow(0), opacity: 1 },
      jump,
    ], { duration: 320, delay: k * 30, easing: "cubic-bezier(.2, .9, .3, 1.15)", fill: "both", id: "exact" });   // (held there until it flies)
    cards.push({ f, back, frame, orb, x, y, jump, a });
  }
  // The drawn fan empties as its cards leave it.
  fanRest(btn);
  fan.style.opacity = 0;

  // A moment for the choice (and the leap) to show, then home fades.
  setTimeout(() => swapScreen($("home"), $("table"), () => {
    fan.style.opacity = "";   // (home is hidden now: all back as it was, for next time)
    list.classList.remove("chosen");
    btn.classList.remove("pick");
    const reading = S;
    cards.forEach((c, k) => {
      const slot = reading?.slots[k];
      if (!slot) { c.f.remove(); return; }
      const t = slot.box.getBoundingClientRect();
      const dx = t.left + t.width / 2 - c.x, dy = t.top + t.height / 2 - c.y;
      const ms = 560, wait = 40 + k * 55, lift = Math.min(70, Math.abs(dy) * 0.4 + 30);
      const sway = c.a === 0 ? (k % 2 ? 3 : -3) : -c.a * 0.4;   // a slight lean the other way, mid-arc
      // An arc up and over, straightening as it goes; then a short, level
      // drop onto its place, already upright and at its full size.
      c.f.animate([
        c.jump,
        { transform: `translate(${dx * 0.5}px, ${Math.min(dy * 0.5, dy) - lift}px) translate(-50%, -50%) rotate(${sway}deg)`,
          width: `${(w * big + t.width) / 2}px`, height: `${(h * big + t.height) / 2}px`, boxShadow: glow(1.4), opacity: 1, offset: 0.45 },
        { transform: `translate(${dx}px, ${dy - 14}px) translate(-50%, -50%) rotate(0deg)`,
          width: `${t.width}px`, height: `${t.height}px`, boxShadow: glow(1.2), opacity: 1, offset: 0.8 },
        { transform: `translate(${dx}px, ${dy}px) translate(-50%, -50%) rotate(0deg)`,
          width: `${t.width}px`, height: `${t.height}px`, boxShadow: glow(1), opacity: 1 },
      ], { duration: ms, delay: wait, easing: "cubic-bezier(.4, .05, .3, 1)", fill: "forwards", id: "exact" });
      // The landing: the card's inner frame grows out until it lies exactly
      // on the place's dotted line, and becomes it (the card's own outline
      // fading as it comes); the place lights up gold and settles back to
      // rest. Its circle gathers into a mote of light and flies down into
      // the deck, which glows as it arrives: the place now waits for a card
      // from the deck.
      setTimeout(() => {
        if (S !== reading || !slot.box.isConnected) { c.f.remove(); return; }
        // If the place has moved meanwhile (the phone's address bar resizing
        // the screen, say), glide the last few pixels onto where it is now.
        const n = slot.box.getBoundingClientRect();
        const nx = n.left + n.width / 2 - c.x, ny = n.top + n.height / 2 - c.y;
        const off = Math.abs(nx - dx) + Math.abs(ny - dy) + Math.abs(n.width - t.width);
        if (off > 1) {
          c.f.animate([{ transform: `translate(${nx}px, ${ny}px) translate(-50%, -50%)`, width: `${n.width}px`, height: `${n.height}px` }],
            { duration: 140, easing: "ease-out", fill: "forwards" });
        }
        const lag = off > 1 ? 120 : 0;
        // The frame grows out onto the place's line, as the card's outline gives way to it.
        c.frame.animate([
          { top: "10%", bottom: "10%", left: "16%", right: "16%", borderRadius: "2px", borderColor: "rgba(201, 169, 110, .5)", opacity: 1 },
          { top: "-1px", bottom: "-1px", left: "-1px", right: "-1px", borderRadius: "7px", borderColor: "rgba(255, 225, 160, .95)", opacity: 1, offset: 0.7 },
          { top: "-1px", bottom: "-1px", left: "-1px", right: "-1px", borderRadius: "7px", borderColor: "rgba(255, 225, 160, .95)", opacity: 0 },
        ], { duration: 560, delay: lag, easing: "cubic-bezier(.3, .7, .3, 1)", fill: "forwards" });
        c.back.animate([{ borderColor: "rgba(214, 182, 122, .95)" }, { borderColor: "rgba(214, 182, 122, 0)" }],
          { duration: 300, delay: lag + 60, easing: "ease-out", fill: "forwards" });
        slot.box.animate([
          { borderColor: "rgba(201, 169, 110, .3)", boxShadow: "0 0 0 0 rgba(255, 200, 110, 0)" },
          { borderColor: "rgba(255, 225, 160, .95)", boxShadow: "0 0 10px rgba(255, 200, 110, .35)", offset: 0.3 },
          { borderColor: "rgba(201, 169, 110, .3)", boxShadow: "0 0 0 0 rgba(255, 200, 110, 0)" },
        ], { duration: 1100, delay: lag + 300, easing: "ease-out" });
        // The circle gathers into a mote and goes down into the deck.
        const gather = reading.quick ? 110 : 260;
        c.orb.animate([
          { transform: "translate(-50%, -50%) scale(1)", boxShadow: "0 0 0 rgba(255, 220, 150, 0)" },
          { transform: "translate(-50%, -50%) scale(.18)", boxShadow: "0 0 10px 3px rgba(255, 220, 150, .9)" },
        ], { duration: gather, delay: lag, easing: "ease-in", fill: "forwards" });
        setTimeout(() => {
          c.orb.style.visibility = "hidden";
          if (S === reading) moteToDeck(c.orb, k);
        }, lag + gather);
        setTimeout(() => c.f.remove(), lag + 620);
      }, wait + ms);
    });
  }), calm ? 0 : 200);
}

// A mote of light from a landed card's circle, flying in an arc down into
// the deck, which glows as it arrives (one after another, as the cards land).
function moteToDeck(from, k) {
  const pile = $("deck");
  if (!pile || pile.hidden) return;
  const a = from.getBoundingClientRect(), b = pile.getBoundingClientRect();
  const sx = a.left + a.width / 2, sy = a.top + a.height / 2;
  const ex = b.left + b.width / 2, ey = b.top + b.height * 0.45;
  const m = el("span", "deck-mote");
  Object.assign(m.style, { left: `${sx}px`, top: `${sy}px`, zIndex: 9600 });
  document.body.append(m);
  const dx = ex - sx, dy = ey - sy, bend = (k % 2 ? 1 : -1) * Math.min(60, Math.abs(dx) * 0.35 + 20);
  const ms = S?.quick ? 230 : 520;
  m.animate([
    { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
    { transform: `translate(calc(-50% + ${dx * 0.5 + bend}px), calc(-50% + ${dy * 0.45}px)) scale(.9)`, opacity: 1, offset: 0.5 },
    { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.4)`, opacity: 0.2 },
  ], { duration: ms, easing: "cubic-bezier(.5, 0, .4, 1)", fill: "forwards" });
  setTimeout(() => {
    m.remove();
    const top = pile.lastElementChild;
    top?.animate([
      { boxShadow: "0 4px 12px rgba(0, 0, 0, .45), 0 0 0 rgba(255, 210, 130, 0)" },
      { boxShadow: "0 4px 12px rgba(0, 0, 0, .45), 0 0 16px 4px rgba(255, 210, 130, .55)", offset: 0.3 },
      { boxShadow: "0 4px 12px rgba(0, 0, 0, .45), 0 0 0 rgba(255, 210, 130, 0)" },
    ], { duration: 700, easing: "ease-out" });
    if (S && k === S.n - 1) wakeDeck();
  }, ms);
}

// With all the light gathered in it, the deck opens by itself into the
// fan (spreadDeck), as the last mote's glow fades.
function wakeDeck() {
  const pile = $("deck");
  if (!pile || pile.hidden || !S || S.phase !== "shuffle") return;
  const reading = S;
  setTimeout(() => { if (S === reading) spreadDeck(); }, calm || S.quick ? 0 : 250);
}

// How many cards go in each row. Every spread, of any size, fits on one
// screen with the deck: the cards shrink to the room left over rather
// than the page ever needing a scroll (see .slots in style.css).
function slotGrid(n, wide = innerWidth >= 700) {
  const cols = wide
    ? (n <= 6 ? n : Math.ceil(n / Math.ceil(n / 6)))
    : (n <= 3 ? n : n === 4 ? 2 : Math.min(5, Math.ceil(n / 2)));
  return { cols, rows: Math.ceil(n / cols) };
}
function layoutSlots() {
  if (!S) return;
  const { cols, rows } = slotGrid(S.n);
  $("slots").style.setProperty("--cols", cols);
  $("slots").style.setProperty("--rows", rows);
}
addEventListener("resize", layoutSlots);

// ── Spread the cards ────────────────────────────────────
// Once the deck has woken (see wakeDeck) it shuffles itself (instantly,
// out of sight) and opens into a fan to pick from. Tapping it before
// then opens it at once.

$("deck").addEventListener("click", () => spreadDeck());

async function spreadDeck() {
  if (!S || S.phase !== "shuffle") return;
  S.phase = "busy";
  prepareMagic();   // (if it isn't ready yet: better now, before anything moves, than mid-pick)
  S.order = shuffledOrder(S.deck.length);
  setHint(S.n === 1 ? "Pick a card" : `Pick ${S.n} cards`);
  // The cards are in the fan as soon as fanOut starts, so they can be
  // picked straight away, while they are still sweeping out.
  fanOut();
  S.phase = "pick";
}

// The deck opens into an arc of cards, face down. Out of a flare of light
// where the deck stood, the cards sweep apart to both sides from the
// middle outward, glowing as they go and leaving sparks at their tips,
// overshooting a little and settling; then a slow glint runs to and fro
// along the fan while it waits for a pick.
async function fanOut() {
  const count = Math.min(FAN_MAX, S.deck.length);
  const width = Math.min(48, count * 4);
  const fan = $("fan");
  const pile = $("deck");
  fan.innerHTML = "";
  fan.classList.remove("ready");
  if (!calm) deckFlare(pile);
  pile.hidden = true;

  const mid = (count - 1) / 2, step = S.quick ? 8 : 26, ms = S.quick ? 360 : 760;
  let last = 0;
  for (let i = 0; i < count; i++) {
    const a = (count === 1 ? 0 : -width / 2 + (width * i) / (count - 1)) + wobble(0.6);
    const c = el("div", "cback fan-card");
    c.style.setProperty("--a", `${a}deg`);
    c.style.setProperty("--i", i);
    c.dataset.card = S.order[i];
    c.dataset.angle = a;
    if (calm) {
      c.animate([{ transform: "rotate(0deg)" }, { transform: `rotate(${a}deg)` }],
        { duration: 380, delay: i * 8, easing: "cubic-bezier(.2,.7,.2,1)", fill: "backwards" });
      last = 380 + i * 8;
    } else {
      // The middle cards go first, the outer ones last, each sweeping out
      // past its place and easing back onto it, lifted and glowing on the way.
      const delay = Math.abs(i - mid) * step;
      c.animate([
        { transform: "translateY(-10px) rotate(0deg) scale(.96)", boxShadow: "0 4px 12px rgba(0, 0, 0, .45), 0 0 18px 5px rgba(255, 215, 140, .8)" },
        { transform: `translateY(-16px) rotate(${a * 1.1}deg) scale(1.02)`, boxShadow: "0 4px 12px rgba(0, 0, 0, .45), 0 0 14px 4px rgba(255, 215, 140, .6)", offset: 0.6 },
        { transform: `rotate(${a}deg)`, boxShadow: "0 4px 12px rgba(0, 0, 0, .45), 0 0 0 0 rgba(255, 215, 140, 0)" },
      ], { duration: ms, delay, easing: "cubic-bezier(.25, .8, .3, 1)", fill: "backwards" });
      // Every other card leaves a spark at its tip as it passes.
      if (i % 2 === (count % 2 ? 0 : 1) || i === 0 || i === count - 1) {
        setTimeout(() => { if (c.isConnected && !c.dataset.taken) tipSpark(c, a); }, delay + ms * 0.5);
      }
      last = Math.max(last, delay + ms);
    }
    c.addEventListener("click", () => pick(c));
    fan.append(c);
  }
  const reading = S;
  await wait(last);
  if (!calm && S === reading && fan.children.length) fan.classList.add("ready");
}

// A flash of light where the deck stood, as it opens: a gold ring widening
// and fading, around a soft glow.
function deckFlare(pile) {
  const r = pile.getBoundingClientRect();
  const f = el("span", "deck-flare");
  Object.assign(f.style, { left: `${r.left + r.width / 2}px`, top: `${r.top + r.height / 2}px`,
    width: `${r.width * 1.6}px`, height: `${r.width * 1.6}px` });
  document.body.append(f);
  f.animate([
    { transform: "translate(-50%, -50%) scale(.4)", opacity: 0.9 },
    { transform: "translate(-50%, -50%) scale(3.2)", opacity: 0 },
  ], { duration: 900, easing: "cubic-bezier(.2, .7, .3, 1)" }).finished.then(() => f.remove());
}

// A spark of light at the top of a fan card as it sweeps past, drifting
// outward and up, and fading.
function tipSpark(card, a) {
  const r = card.getBoundingClientRect();
  const rad = (a * Math.PI) / 180;
  const x = r.left + r.width / 2, y = r.top + 4;
  const m = el("span", "deck-mote");
  Object.assign(m.style, { left: `${x}px`, top: `${y}px`, zIndex: 30 });
  document.body.append(m);
  const dx = Math.sin(rad) * 26 + wobble(6), dy = -18 - Math.random() * 16;
  m.animate([
    { transform: "translate(-50%, -50%) scale(.6)", opacity: 0 },
    { transform: `translate(calc(-50% + ${dx * 0.3}px), calc(-50% + ${dy * 0.3}px)) scale(1)`, opacity: 1, offset: 0.2 },
    { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.3)`, opacity: 0 },
  ], { duration: 900 + Math.random() * 300, easing: "ease-out" }).finished.then(() => m.remove());
}

// ── Pick ────────────────────────────────────────────────

async function pick(fanCard) {
  if (!S || S.phase !== "pick" || fanCard.dataset.taken) return;
  fanCard.dataset.taken = "1";
  const reading = S;

  const slot = S.slots[S.picked++];
  slot.card = S.deck[+fanCard.dataset.card];
  slot.reversed = SET.reversals && rand(2) === 1;
  preload(slot.card);   // start loading the picture now, so it's ready to turn
  const allPicked = S.picked === S.n;
  if (allPicked) {
    S.phase = "busy";
    S.title = nameReading(S.slots.map((s) => ({ card: s.card, reversed: s.reversed }))) || S.spread.name;
    // The reading is saved now, so its theme is settled.
    $("themeBtn").disabled = true;
    S.readingId = addReading(S.spread.name, S.slots.map((s) =>
      ({ name: s.card.name, rev: s.reversed, label: S.spread.positions[s.i].label,
         ...(S.spread.positions[s.i].question ? { question: S.spread.positions[s.i].question } : {}) })), S.title);
  }
  else {
    const left = S.n - S.picked;
    setHint(left === 1 ? "Pick 1 more" : `Pick ${left} more`);
  }

  // The card that will sit in the spread, face down.
  const t = el("div", "tcard");
  t.style.setProperty("--flip", `${vary(0.75).toFixed(2)}s`);
  const inner = el("div", "tcard-inner");
  const back = el("div", "face cback");
  const face = cardFace(slot.card, false, slot.reversed);
  face.classList.add("face");
  inner.append(back, face);
  t.append(inner);
  t.style.visibility = "hidden";
  t.addEventListener("click", () => turn(slot));
  slot.box.append(t);
  slot.tcard = t;

  // Fly a copy from the fan to its place in the spread.
  const r = fanCard.getBoundingClientRect();
  const w = fanCard.offsetWidth, h = fanCard.offsetHeight;
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  // The card's angle where it is now: it may be picked mid-sweep, still turning.
  const m = getComputedStyle(fanCard).transform;
  const mm = m && m !== "none" ? new DOMMatrix(m) : null;
  const a = mm ? (Math.atan2(mm.b, mm.a) * 180) / Math.PI : +fanCard.dataset.angle;
  const target = slot.box.getBoundingClientRect();
  const dx = target.left + target.width / 2 - cx;
  const dy = target.top + target.height / 2 - cy;
  const scale = target.width / w;

  const flyer = el("div", "cback flyer");
  Object.assign(flyer.style, {
    left: `${cx - w / 2}px`, top: `${cy - h / 2}px`,
    width: `${w}px`, height: `${h}px`,
  });
  document.body.append(flyer);
  fanCard.style.visibility = "hidden";

  const fx = calm ? "classic" : nextPickFx();
  if (fx === "classic") {
    if (!calm) magicFlight(flyer, fanCard);
    // Each card lifts a little differently on its way: higher or lower, a touch of tilt.
    const lift = vary(26, 0.3), tilt = a + wobble(4), peak = vary(0.2, 0.25);
    await flyer.animate(
      [
        { transform: `rotate(${a}deg)` },
        { transform: `translate(${wobble(6)}px, -${lift}px) rotate(${tilt}deg) scale(${vary(1.08, 0.03)})`, offset: peak },
        { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
      ],
      { duration: 700, easing: "cubic-bezier(.4,0,.2,1)" }
    ).finished;
  } else {
    // One of the quick flashes (pickfx.js).
    await PickFX.play(fx, {
      flyer, card: t,
      from: { x: cx, y: cy, w, h, a },
      to: { x: cx + dx, y: cy + dy, w: target.width, h: target.height },
    });
  }
  t.style.visibility = "";
  flyer.remove();
  slot.placed = true;   // it can be turned over now, even before the rest are picked
  if (S !== reading) return;
  if (fx === "classic" && !calm) magicLand(slot.i);
  magicStep();   // each card laid down adds the next element of the circle, faintly

  if (allPicked) {
    await wait(150);
    await gatherFan();
    if (S !== reading) return;
    S.phase = "turn";
    refreshKeywords();   // now that every card is known
    if (S.revealed === S.n) setHint("");
    else setHint(S.n === 1 ? "Tap the card to turn it over" : "Tap a card to turn it over");
  }
}

// Sweep the rest of the cards away once the spread is full.
async function gatherFan() {
  const cards = [...$("fan").children].filter((c) => !c.dataset.taken);
  await Promise.all(cards.map((c, i) => c.animate(
    [
      { transform: `rotate(${c.dataset.angle}deg)`, opacity: 1 },
      { transform: `rotate(${wobble(3)}deg) translateY(${vary(60, 0.25)}px)`, opacity: 0 },
    ],
    { duration: 500, delay: i * 10, easing: "ease-in", fill: "forwards" }
  ).finished));
  $("fan").innerHTML = "";
}

// ── Turn ────────────────────────────────────────────────

// Snaps a card that is still turning straight to its finished state.
function finishTurn(slot) {
  const inner = slot.tcard.querySelector(".tcard-inner");
  inner.style.transition = "none";
  void inner.offsetWidth;   // apply the end state now
  inner.style.transition = "";
  slot.turning = false;
}

// The keywords under each turned card. The one most linked to the rest of
// the spread comes first, in bold with a glow; it's worked out again as
// more cards join the spread.
function refreshKeywords() {
  S.slots.forEach((s) => {
    if (!s.flipped || !s.kwEl) return;
    const all = filled(keywordsFor(s.card, s.reversed));
    const key = spreadKeyword(s);
    s.kwEl.textContent = "";
    if (!all.length) { s.kwEl.textContent = " "; return; }
    // The key word on its own line; the others (on wide screens only)
    // in a block of fixed height, so every card's words line up.
    s.kwEl.append(el("b", "kw-key", key || all[0]));
    const rest = all.filter((w) => w.toLowerCase() !== (key || all[0]).toLowerCase());
    s.kwEl.append(el("span", "kw-rest", rest.join(" · ") || " "));
  });
}

async function turn(slot) {
  // Any card already laid in the spread can be turned, even while others are still being picked.
  if (!S || !slot.placed) return;
  if (slot.turning) return;   // already on its way over
  if (!slot.flipped) {
    // Tapping a new card cuts short the one still turning and its title.
    S.slots.forEach((s) => { if (s.turning && s !== slot) finishTurn(s); });
    clearTimeout(S.titleTimer);
    document.querySelector(".rpg-title")?.remove();

    slot.turning = true;
    slot.flipped = true;
    S.lastTurn = slot;
    const reading = S;
    await preload(slot.card);
    if (S !== reading) return;   // left the table meanwhile
    slot.tcard.classList.add("flipped");
    // Another card was tapped while this one's picture loaded: skip straight to the end.
    const cut = S.lastTurn !== slot;
    if (cut) finishTurn(slot);
    magicReveal(slot.i);
    slot.nameEl.replaceChildren(el("span", "slot-name-text", slot.card.name));
    refreshKeywords();
    slot.nameEl.classList.add("shown");
    slot.kwEl.classList.add("shown");
    const pos = S.spread.positions[slot.i].label;
    const sub = [S.n > 1 || pos !== "Your card" ? pos : "", slot.reversed ? "Reversed" : ""]
      .filter(Boolean).join(" · ");
    // Just above the top row of cards.
    const cardsTop = Math.min(...S.slots.map((s) => s.box.getBoundingClientRect().top));
    const header = document.querySelector("#table .bar").getBoundingClientRect().bottom;
    if (!cut) {
      clearTimeout(S.titleTimer);
      S.titleTimer = setTimeout(() => {
        if (S === reading && S.lastTurn === slot) revealTitle(slot.card.name, sub, cardsTop - 8, header);
      }, 250);
    }
    S.revealed++;
    const last = S.revealed === S.n;
    await wait(800);
    if (S !== reading) return;
    slot.turning = false;
    if (last) {
      setHint("");
      showReadingTitle();
      $("summaryBtn").textContent = S.n === 1 ? "✦ Read the card" : "✦ Reading summary";
      $("summaryBtn").hidden = false;
      $("endActions").hidden = false;
      $("endActions").animate([{ opacity: 0 }, { opacity: 1 }], 400);
    }
    return;   // turning a card only shows it; tap it again to read it
  }
  // A turned card answers the tap, and collapses into a black hole as its
  // page opens (see collapseInto). A second tap meanwhile does nothing.
  if (slot.opening) return;
  slot.opening = true;
  setTimeout(() => { slot.opening = false; }, 600);
  cardTap(slot.box, slot.tcard.querySelector(".cface"));
  openReadingCard(slot.i);
}
