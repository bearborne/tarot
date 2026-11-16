// The card table: shuffle, fan, pick and turn.
// Part of the app; the files in js/ load in the order listed in index.html.

// ── 2. The table ────────────────────────────────────────

function startReading(spread) {
  const n = spread.positions.length;
  const deck = activeDeck();
  if (deck.length < n) {
    alert(`This spread needs ${n} cards, but the deck only has ${deck.length}.`);
    return;
  }
  // base: the spread as chosen; spread: the one in use, with a theme's
  // questions laid over it once one is chosen (see applyTheme).
  S = { spread, base: spread, theme: null, n, deck, slots: [], picked: 0, revealed: 0, phase: "shuffle" };
  resetMagic();

  $("home").hidden = true;
  $("table").hidden = false;
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
    c.style.transform = pileOffset(i);
    pile.append(c);
  }
  $("fan").innerHTML = "";
  $("hint").textContent = "Tap the deck to spread the cards";
  $("hint").classList.remove("dim");
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

function pileOffset(i) {
  return `translate(${i * 0.5}px, ${-i * 0.6}px)`;
}

// ── Spread the cards ────────────────────────────────────
// Tapping the deck shuffles it (instantly, out of sight) and fans the
// cards out to pick from.

$("deck").addEventListener("click", async () => {
  if (!S || S.phase !== "shuffle") return;
  S.phase = "busy";
  S.order = shuffledOrder(S.deck.length);
  setHint(S.n === 1 ? "Pick a card" : `Pick ${S.n} cards`);
  await fanOut();
  S.phase = "pick";
});

// Spread the cards out in an arc, face down.
async function fanOut() {
  const count = Math.min(FAN_MAX, S.deck.length);
  const width = Math.min(48, count * 4);
  const fan = $("fan");
  fan.innerHTML = "";
  $("deck").hidden = true;

  for (let i = 0; i < count; i++) {
    const a = (count === 1 ? 0 : -width / 2 + (width * i) / (count - 1)) + wobble(0.6);
    const c = el("div", "cback fan-card");
    c.style.setProperty("--a", `${a}deg`);
    c.dataset.card = S.order[i];
    c.dataset.angle = a;
    c.animate(
      [{ transform: "rotate(0deg)" }, { transform: `rotate(${a}deg)` }],
      { duration: 380, delay: i * 8, easing: "cubic-bezier(.2,.7,.2,1)", fill: "backwards" }
    );
    c.addEventListener("click", () => pick(c));
    fan.append(c);
  }
  await wait(380 + count * 8);
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
  const a = +fanCard.dataset.angle;
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
      $("summaryBtn").hidden = false;
      $("endActions").hidden = false;
      $("endActions").animate([{ opacity: 0 }, { opacity: 1 }], 400);
    }
    return;   // turning a card only shows it; tap it again to read it
  }
  openReadingCard(slot.i);
}
