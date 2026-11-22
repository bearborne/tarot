// The card window, sliding sheets, the details window and each card's page.
// Part of the app; the files in js/ load in the order listed in index.html.

// ── 3. The card window ──────────────────────────────────

let openIndex = 0;

function showPosition(i, labelEl, questionEl) {
  const pos = S.spread.positions[i];
  labelEl.textContent = S.n > 1 || pos.label !== "Your card" ? pos.label : "";
  labelEl.hidden = !labelEl.textContent;
  questionEl.textContent = pos.question || "";
  questionEl.hidden = !pos.question;
}


// Keywords as one line: "trust · beginnings · freedom".
function fillKeywords(box, words) {
  box.textContent = filled(words).join(" · ");
  box.hidden = !box.textContent;
}

// The questions the card asks you.
function fillQuestions(box, questions) {
  box.innerHTML = "";
  const qs = filled(questions);
  if (qs.length) {
    box.append(el("p", "asks-title", "The card asks"));
    const list = el("ul");
    qs.forEach((q) => list.append(el("li", "", q)));
    box.append(list);
  }
  box.hidden = !qs.length;
}

function openQuick(i) {
  openIndex = i;
  const { card, reversed } = S.slots[i];
  $("quickCard").innerHTML = "";
  $("quickCard").append(cardFace(card, false, reversed));
  $("quickCard").firstChild.style.height = "100%";
  showPosition(i, $("quickPos"), $("quickQuestion"));
  $("quickName").textContent = card.name;
  $("quickReversed").hidden = !reversed;
  fillKeywords($("quickKeywords"), keywordsFor(card, reversed));
  const useReversed = reversed && (card.reversed || "").trim();
  fillText($("quickText"), useReversed ? card.reversed : card.short, "Add a short description for this card in cards.js.");
  fillQuestions($("quickAsks"), questionsFor(card, reversed));

  $("quick").style.zIndex = ++Z;   // above whatever has opened before
  $("quick").hidden = false;
  $("quick").animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
  $("quickBox").animate(
    [{ transform: "scale(.92) translateY(10px)", opacity: 0 }, { transform: "none", opacity: 1 }],
    { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" }
  );
}

async function closeQuick() {
  await $("quick").animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).finished;
  $("quick").hidden = true;
}

$("quickClose").addEventListener("click", closeQuick);
$("quick").addEventListener("click", (e) => { if (e.target === $("quick")) closeQuick(); });
// From a reading, the card page can swipe through the reading's cards.
function openReadingCard(i, magic = false) {
  openIndex = i;
  const items = S.slots.map((s) => {
    const label = el("p"), question = el("p");
    showPosition(s.i, label, question);
    const item = detailsItem(s.card, s.reversed, label.textContent, question.textContent);
    // A one-card reading has no summary: its page carries the theme's reading.
    if (S.n === 1 && S.theme) item.reading = themedReading(item, S.theme.name);
    return item;
  });
  return openDetails(items, i, magic);
}
$("moreBtn").addEventListener("click", () => openReadingCard(openIndex));

// ── Windows that slide up over everything ───────────────

let Z = 100;   // the newest window sits on top

function slideIn(sheet) {
  sheet.hidden = false;
  sheet.style.zIndex = ++Z;
  sheet.scrollTop = 0;
  sheet.animate(
    [{ transform: "translateY(100%)" }, { transform: "none" }],
    { duration: 380, easing: "cubic-bezier(.2,.8,.2,1)" }
  );
}

function slideOut(sheet) {
  return sheet.animate(
    [{ transform: "none" }, { transform: "translateY(100%)" }],
    { duration: 300, easing: "ease-in" }
  ).finished;
}

// ── 4. The details window ───────────────────────────────

const CORR_LABELS = { astrology: "Astrology", element: "Element", number: "Number" };

// The card's astrology, element and number, each in its own small box.
function correspondences(card) {
  const box = el("div", "corr");
  const c = card.correspondences || {};
  Object.keys(CORR_LABELS).forEach((k) => {
    if (!c[k]) return;
    const item = el("div", "corr-item");
    item.append(el("span", "corr-label", CORR_LABELS[k]), el("span", "corr-value", c[k]));
    box.append(item);
  });
  box.hidden = !box.children.length;
  return box;
}

// A side's key ideas: the warm ones, and the nuances (neutral, or
// depending on how they're framed).
function ideasFor(card, rev) {
  return {
    ideas: filled(rev ? card.reversedIdeas : card.ideas),
    nuances: filled(rev ? card.reversedNuances : card.nuances),
  };
}

// One side of the card, "Upright" or "Reversed": its meaning, how a
// summary reads it, its key ideas, plus its own keywords (for the side the
// card didn't fall on, when the two sides have different ones) and questions.
function meaning(card, rev, fell) {
  const box = el("div", "details-text meaning");
  box.append(el("p", "asks-title", rev ? "Reversed" : "Upright"));
  if (hasRevKeywords(card) && rev !== fell) {
    const k = el("p", "keywords");
    fillKeywords(k, keywordsFor(card, rev));
    box.append(k);
  }
  const t = el("div");
  fillText(t, rev ? card.reversed : card.short, rev ? "" : "Add a short description for this card in cards.js.");
  box.append(t);
  // How the summary reads this side, in short.
  const r = card.inReading || {};
  const said = [
    ["In a reading", rev ? r.reversed : r.upright],
    ["Advice", rev ? r.reversedAdvice || r.advice : r.advice],
    ["Action", rev ? r.reversedAction : r.action],
    ["Feeling", rev ? r.reversedFeeling : r.feeling],
    ["As you", rev ? r.reversedYou : r.you],
    ["Challenge", rev ? "" : r.challenge],
  ].filter(([, x]) => (x || "").trim());
  if (said.length) {
    const dl = el("dl", "in-reading");
    said.forEach(([k, x]) => {
      const tile = el("div", "ir-tile");
      tile.append(el("dt", "", k), el("dd", "", cap(x.trim())));
      dl.append(tile);
    });
    // The last tile stretches over whatever its row leaves empty, in three
    // columns or in two (see .in-reading in style.css).
    const n = said.length;
    dl.lastChild.style.setProperty("--span3", 3 - ((n - 1) % 3));
    dl.lastChild.style.setProperty("--span2", 2 - ((n - 1) % 2));
    const wrap = el("div", "ir-wrap");
    wrap.append(dl);
    box.append(wrap);
  }
  const { ideas, nuances } = ideasFor(card, rev);
  if (ideas.length || nuances.length) {
    const sec = el("div", "key-ideas");
    // The warm ideas, then the nuances as their own group.
    [["Key ideas", ideas, ""], ["Nuances", nuances, "nuance"]].forEach(([title, list, cls]) => {
      if (!list.length) return;
      sec.append(el("p", "sub-title", title));
      const ul = el("ul");
      list.forEach((x) => ul.append(el("li", cls, x)));
      // The last tile fills its row (see .key-ideas in style.css).
      ul.lastChild.style.setProperty("--span3", 3 - ((list.length - 1) % 3));
      ul.lastChild.style.setProperty("--span2", 2 - ((list.length - 1) % 2));
      sec.append(ul);
    });
    box.append(sec);
  }
  if (hasRevQuestions(card)) {
    const asks = el("div", "asks");
    fillQuestions(asks, questionsFor(card, rev));
    box.append(asks);
  }
  return box;
}
// What's in the picture: "The thing: what it means", one per line.
function pictureGuide(card) {
  const items = filled(card.picture);
  if (!items.length) return null;
  const box = el("div", "details-text picture-guide");
  box.append(el("p", "asks-title", "What's in the picture"));
  const list = el("ul");
  items.forEach((t) => {
    const li = el("li");
    const i = t.indexOf(": ");
    const rest = t.slice(i + 2);
    if (i > 0) li.append(el("strong", "", t.slice(0, i)), el("span", "", rest.charAt(0).toUpperCase() + rest.slice(1)));
    else li.append(el("span", "", t));
    list.append(li);
  });
  box.append(list);
  return box;
}

// ── Related cards ───────────────────────────────────────

const PLANETS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const COURT_RANKS = ["Page", "Knight", "Queen", "King"];

const isMajor = (card) => CARDS.indexOf(card) < 22;
const rankOf = (card) => card.name.split(" of ")[0];

// The planets and signs a card's astrology names, e.g. "Mars in Aries" → Mars, Aries.
function starsOf(card) {
  const a = (card.correspondences || {}).astrology || "";
  return [...PLANETS, ...SIGNS].filter((w) => new RegExp(`\\b${w}\\b`).test(a));
}

// Each number of the Minor Arcana is one lesson, met in four parts of
// life: its name, and how each suit shows it.
const NUMBER_LESSONS = {
  1: ["Aces", "potential", { Wands: "the first spark of a passion", Cups: "the first stirring of a feeling", Swords: "the first wisp of an idea", Pentacles: "the first seed of something real" }],
  2: ["Twos", "balance", { Wands: "keeping your drive pointed one way", Cups: "the bond you keep with your own heart", Swords: "two sides of your mind held in a truce", Pentacles: "juggling, and knowing which ball can drop" }],
  3: ["Threes", "connection", { Wands: "gathering your scattered energy into one direction", Cups: "letting joy be shared, and burdens halved", Swords: "telling yourself hard truths kindly", Pentacles: "work that is its own reward" }],
  4: ["Fours", "a pause", { Wands: "a first stage finished, and a rest", Cups: "a routine that can turn stale", Swords: "a truce, and time to recover", Pentacles: "holding on so tightly that nothing new can come" }],
  5: ["Fives", "struggle", { Wands: "competition that tests your nerve", Cups: "a loss that hides what remains", Swords: "a defeat that teaches you your limits", Pentacles: "hard times, and help found again" }],
  6: ["Sixes", "rebalancing and giving", { Wands: "a victory you let yourself enjoy", Cups: "remembering what the past taught you", Swords: "a change of scene that clears the mind", Pentacles: "giving and receiving, starting with yourself" }],
  7: ["Sevens", "choices", { Wands: "courage, with fear as a warning light", Cups: "telling real options from illusions", Swords: "choosing your methods with care", Pentacles: "risking more, or tending what you have" }],
  8: ["Eights", "rebalancing yourself", { Wands: "everything moving once the way is clear", Cups: "leaving what no longer fills you", Swords: "a trap of your own thinking, undone by calm", Pentacles: "dedication to growing your skill" }],
  9: ["Nines", "the inner self", { Wands: "the inner stamina for one last try", Cups: "contentment that comes from within", Swords: "fears that grow too big in the dark", Pentacles: "a self-made abundance, enjoyed" }],
  10: ["Tens", "a cycle completed", { Wands: "knowing when to ask for help, or set the load down", Cups: "a peace within that reaches those you love", Swords: "an ending that clears the way for dawn", Pentacles: "a legacy passed on" }],
};
// The court ranks: the same four characters in every suit, and in everyone.
const RANK_LESSONS = {
  Page: "The curious child in you",
  Knight: "The restless traveller in you",
  Queen: "The part of you that grows things slowly, by trial and error",
  King: "The part of you that plans and decides",
};
const suitName = (card) => card.name.split(" of ")[1] || "";

// Groups of cards linked to this one: by number (or rank) and by the stars.
function relatedGroups(card) {
  const deck = activeDeck().filter((c) => c !== card);
  const groups = [];
  if (card.court) {
    const rank = rankOf(card);
    groups.push({ title: `The other ${rank}s`, note: RANK_LESSONS[rank] || "",
      cards: deck.filter((c) => c.court && rankOf(c) === rank) });
  } else {
    const n = (card.correspondences || {}).number;
    const lesson = !isMajor(card) && NUMBER_LESSONS[+n];
    const cards = n ? deck.filter((c) => !c.court && (c.correspondences || {}).number === n) : [];
    if (lesson) {
      groups.push({ title: `The ${lesson[0]}: ${lesson[1]}`, note: `In ${suitName(card)}: ${lesson[2][suitName(card)]}.`, cards });
    } else if (n) groups.push({ title: `Also number ${n}`, cards });
  }
  const stars = starsOf(card);
  if (stars.length) {
    // A Minor card is linked to the Major cards of its planet and sign, and the other way round.
    const linked = deck.filter((c) => (isMajor(card) || isMajor(c)) && starsOf(c).some((s) => stars.includes(s)));
    const names = stars.map((s) => (s === "Sun" || s === "Moon" ? `the ${s}` : s));
    groups.push({ title: `Under ${names.join(" and ")}`, cards: linked });
  }
  return groups.filter((g) => g.cards.length);
}

function relatedCards(card) {
  const groups = relatedGroups(card);
  if (!groups.length) return null;
  const box = el("div", "details-text related");
  box.append(el("p", "asks-title", "Related cards"));
  groups.forEach((g) => {
    box.append(el("p", "related-title", g.title));
    if (g.note) box.append(el("p", "related-note", g.note));
    const row = el("div", "related-row");
    g.cards.forEach((c, i) => {
      const b = el("button", "related-card");
      const pic = el("div", "related-pic");
      const face = cardFace(c, true);
      face.style.height = "100%";
      pic.append(face);
      b.append(pic, el("span", "related-name", c.name));
      b.addEventListener("click", () => openDetails(g.cards.map((x) => detailsItem(x)), i));
      row.append(b);
    });
    box.append(row);
  });
  return box;
}

// ── The journeys ────────────────────────────────────────
// A card's scene in its journey, between the card it comes from and the
// one it leads to. The Majors are the Fool's journey (the World leads back
// to the Fool); each suit is its own, Ace to King (the King leads back to
// the Ace). Tap either card to open its page.
function journeyBox(card) {
  const st = card.story;
  const k = CARDS.indexOf(card);
  if (!st || k < 0) return null;
  const first = k < 22 ? 0 : 22 + Math.floor((k - 22) / 14) * 14;
  const size = k < 22 ? 22 : 14;
  // (Each Ace is one of the four tools the Magician laid out for the Fool.)
  const prev = k > first ? CARDS[k - 1] : k >= 22 ? CARDS[1] : null;
  const next = CARDS[first + ((k - first + 1) % size)];
  const box = el("div", "details-text journey");
  box.append(el("p", "asks-title", k < 22 ? "The journey" : `The journey of ${card.name.split(" of ")[1]}`));
  box.append(el("p", "journey-scene", st.scene));
  const ends = el("div", "journey-ends");
  [["From", prev, st.from], ["Toward", next, st.to]].forEach(([head, c, text]) => {
    const side = el("div", "journey-end");
    if (c) {
      const b = el("button", "related-card");
      const pic = el("div", "related-pic");
      const face = cardFace(c, true);
      face.style.height = "100%";
      pic.append(face);
      b.append(el("span", "related-label", head), pic, el("span", "related-name", c.name));
      b.addEventListener("click", () => openDetails([detailsItem(c)]));
      side.append(b);
    } else side.append(el("span", "related-label", "The start"));
    side.append(el("p", "journey-text", text));
    ends.append(side);
  });
  box.append(ends);
  return box;
}

// ── Your draws and your notes, on the card's page ───────

function cardHistory(card) {
  const box = el("div", "details-text card-history");
  box.append(el("p", "asks-title", "Your draws"));
  const draws = drawsOf(card);
  if (!draws.length) {
    box.append(el("p", "empty-note", "You haven't drawn this card yet."));
    return box;
  }
  const rev = draws.filter((d) => d.rev).length;
  const times = draws.length === 1 ? "once" : `${draws.length} times`;
  box.append(el("p", "history-sum",
    `Drawn ${times}${rev ? `, ${rev} of them reversed` : ""}. Last on ${dateText(draws[0].t)}.`));
  const list = el("ul", "history-list");
  draws.slice(0, 5).forEach((d) => {
    const bits = [dateText(d.t), d.spread];
    if (d.label && d.label !== "Your card") bits.push(d.label);
    if (d.rev) bits.push("reversed");
    list.append(el("li", "", bits.join(" · ")));
  });
  box.append(list);
  return box;
}

// A button that opens into a text box. Saves as you type.
function notesBox(card) {
  return noteBox({ get: () => noteFor(card), set: (text) => saveNote(card, text),
    placeholder: "What does this card mean to you?" });
}

// The same box for anything: get() gives the saved text, set(text) saves it
// and says whether that worked. add/has/close: the button's words.
function noteBox({ get, set, placeholder, add = "Add a note", has: hasWord = "Your note", close = "Close note" }) {
  const box = el("div", "note-box");
  const btn = el("button", "pill small note-toggle");
  const preview = el("p", "note-preview");
  const area = el("textarea", "note-area");
  const status = el("p", "note-status");
  area.placeholder = placeholder;
  area.rows = 5;
  area.value = get();
  area.hidden = status.hidden = true;

  const refresh = () => {
    const has = area.value.trim();
    btn.textContent = area.hidden ? (has ? `${hasWord} ▾` : `${add} ▾`) : `${close} ▴`;
    btn.setAttribute("aria-expanded", String(!area.hidden));
    preview.textContent = has;
    preview.hidden = !area.hidden || !has;
  };
  let timer = null;
  const save = () => {
    clearTimeout(timer);
    status.textContent = set(area.value) ? "Saved on this device" : "Couldn't save the note";
  };
  btn.addEventListener("click", () => {
    area.hidden = status.hidden = !area.hidden;
    refresh();
    if (!area.hidden) area.focus();
  });
  area.addEventListener("input", () => {
    status.textContent = "…";
    clearTimeout(timer);
    timer = setTimeout(save, 500);
  });
  area.addEventListener("blur", () => { save(); refresh(); });
  refresh();
  box.append(btn, preview, area, status);
  return box;
}

// ── The card's page ─────────────────────────────────────
// A page shows one card from a list (a reading, the card list, related
// cards…); swipe, or use the arrows, to move through the list.

function detailsItem(card, reversed = false, label = "", question = "") {
  return { card, reversed, label, question };
}

// On a wide screen the page has two columns: the card and what identifies
// it on the left (staying in view), and its meanings and the rest on the
// right. On a phone the two simply stack.
function detailsBody({ card, reversed, label, question, reading }) {
  const body = el("div", "details-body two-col card-page");
  const side = el("div", "col-side"), main = el("div", "col-main");
  body.append(side, main);
  const pic = el("div", "details-card");
  const face = cardFace(card, false, reversed);
  face.style.height = "100%";
  pic.append(face);
  side.append(pic);

  if (label) side.append(el("p", "pos-label", label));
  if (question) side.append(el("p", "pos-question", question));
  side.append(el("h2", "", card.name));
  const hasRev = !!(card.reversed || "").trim();
  let shown = !!reversed;   // the way the card is shown: as it fell, or turned by the switch
  // A card with a reversed meaning gets a switch to turn it round; the
  // card, the keywords under its name and the order of its meanings follow.
  const sw = hasRev ? el("div", "side-switch") : null;
  if (sw) {
    sw.setAttribute("role", "group");
    sw.setAttribute("aria-label", "Card position");
    side.append(sw);
  } else if (reversed) side.append(el("p", "reversed-note", "Reversed"));
  // The keywords for the way the card is shown always sit under the name;
  // the other side's go with its meaning, if they differ.
  const keywords = el("p", "keywords");
  side.append(keywords);
  if ((card.line || "").trim()) side.append(el("p", "carry-line", card.line.trim()));
  side.append(correspondences(card));

  // A one-card reading with a theme: the card read in its place, first.
  if (reading) {
    const box = el("div", "details-text theme-reading");
    box.append(el("p", "asks-title", reading.title));
    box.append(el("p", "", reading.text));
    main.append(box);
  }
  // The meaning for the way the card is shown, upright or reversed.
  const meanings = el("div", "meanings");
  main.append(meanings);
  const btns = sw ? [false, true].map((r) => {
    const b = el("button", "side-btn", r ? "Reversed" : "Upright");
    b.addEventListener("click", () => { if (r !== shown) show(r, true); });
    sw.append(b);
    return b;
  }) : [];
  function show(r, animate) {
    shown = r;
    face.classList.toggle("reversed", r);
    btns.forEach((b, i) => b.setAttribute("aria-pressed", String(!!i === r)));
    keywords.textContent = "";
    fillKeywords(keywords, keywordsFor(card, r));
    // Only the side being shown; the switch brings up the other.
    meanings.replaceChildren(meaning(card, r && hasRev, r && hasRev));
    if (animate && !calm) {
      face.animate([{ transform: `rotate(${r ? 0 : 180}deg)` }, { transform: `rotate(${r ? 180 : 360}deg)` }],
        { duration: 450, easing: "ease-in-out" });
      [keywords, meanings].forEach((x) => x.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 }));
    }
  }
  show(shown, false);

  if (!hasRevQuestions(card)) {
    const asks = el("div", "asks");
    fillQuestions(asks, card.questions);
    main.append(asks);
  }
  if ((card.details || "").trim()) {
    const text = el("div", "details-text");
    fillText(text, card.details, "");
    main.append(text);
  }
  [pictureGuide(card), journeyBox(card), cardHistory(card), relatedCards(card), notesBox(card)]
    .forEach((part) => part && main.append(part));
  return body;
}

// magic: a one-card reading's page, opened as the summaries are: through
// the arcane portal ("later": built now, shown by sheet.appear; see
// summonSummary), and back to the table by fire (vanishWithMagic).
function openDetails(items, index = 0, magic = false) {
  const sheet = el("div", "sheet details");
  const bar = el("header", "bar");
  const back = el("button", "link", "‹ Back");
  const count = el("span", "bar-title count");
  const nav = el("span", "bar-nav");
  // Drawn chevrons, so they sit exactly in the middle of the circle.
  const chevron = (d) => `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const prev = el("button", "nav-btn");
  const next = el("button", "nav-btn");
  prev.innerHTML = chevron("M14.5 6l-6 6 6 6");
  next.innerHTML = chevron("M9.5 6l6 6-6 6");
  prev.setAttribute("aria-label", "Previous card");
  next.setAttribute("aria-label", "Next card");
  nav.append(prev, next);
  nav.hidden = items.length < 2;
  bar.append(barStart(bar, back), count, nav);

  let i = index;
  let body = detailsBody(items[i]);
  const update = () => {
    count.textContent = items.length > 1 ? `${i + 1} of ${items.length}` : "";
    prev.disabled = i === 0;
    next.disabled = i === items.length - 1;
  };

  let moving = false;
  async function go(step) {
    const to = i + step;
    if (moving || to < 0 || to >= items.length) return;
    moving = true;
    document.activeElement?.blur();   // saves a note being written
    const old = body;
    await old.animate(
      [{ transform: "none", opacity: 1 }, { transform: `translateX(${-step * 40}px)`, opacity: 0 }],
      { duration: calm ? 1 : 160, easing: "ease-in" }
    ).finished;
    i = to;
    body = detailsBody(items[i]);
    old.replaceWith(body);
    sheet.scrollTop = 0;
    update();
    await body.animate(
      [{ transform: `translateX(${step * 40}px)`, opacity: 0 }, { transform: "none", opacity: 1 }],
      { duration: calm ? 1 : 200, easing: "ease-out" }
    ).finished;
    moving = false;
  }
  sheet.go = go;
  prev.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));

  // Swipe left or right, but not while typing a note or scrolling a row of cards.
  let start = null;
  sheet.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    start = e.touches.length === 1 && !e.target.closest("textarea, .related-row")
      ? { x: t.clientX, y: t.clientY } : null;
  }, { passive: true });
  sheet.addEventListener("touchend", (e) => {
    if (!start || items.length < 2) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x, dy = t.clientY - start.y;
    start = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  });

  update();
  sheet.append(bar, body);
  document.body.append(sheet);
  if (magic) {
    if (magic === "later") sheet.appear = (C) => appearWithMagic(sheet, body, C);
    else if (!calm) appearWithMagic(sheet, body);
    else slideIn(sheet);
    back.addEventListener("click", async () => {
      document.activeElement?.blur();
      await (!calm ? vanishWithMagic(sheet) : slideOut(sheet));
      sheet.remove();
    });
    return sheet;
  }
  // Opened by tapping a card: the page blooms out of it, and goes back into it.
  const tap = takeTap();
  if (tap) bloomFrom(sheet, body, tap);
  else slideIn(sheet);
  back.addEventListener("click", async () => {
    document.activeElement?.blur();
    await (tap && !calm ? closeInto(sheet, tap) : slideOut(sheet));
    sheet.remove();
  });
  return sheet;
}

// A card's page opening out of the card that was tapped: the card falls in
// on itself, its centre becoming a black hole (collapseInto, in
// js/rune-ring.js), and the page opens out of the hole (holeOpen). Back:
// the page closes into a hole there, and the card re-forms out of it (holeClose).
function bloomFrom(sheet, body, tap) {
  tap.ring.remove();   // (the hole does it all: no ring of runes)
  tap.look = tap.glow?.classList?.contains("cface") ? tap.glow : tap.card;
  const { ms, at, hole } = collapseInto(tap.card, tap.look);
  holeOpen(sheet, at, body.children, ms, hole);
}
function closeInto(sheet, tap) {
  return holeClose(sheet, tap.card, tap.look, tap.glow);
}

// The arrow keys move through the cards on the page in front.
document.addEventListener("keydown", (e) => {
  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
  if (e.target.closest?.("textarea, input")) return;
  const top = [...document.querySelectorAll(".sheet.details")]
    .sort((a, b) => b.style.zIndex - a.style.zIndex)[0];
  top?.go(e.key === "ArrowLeft" ? -1 : 1);
});

// With a mouse (rather than a touch screen).
const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
