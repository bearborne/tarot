// Your patterns: what comes back across all your readings and daily
// cards, over the last month, this year or all time. Small tiles, counted.

const PAT = { span: "month" };
const PAT_SPANS = [
  { id: "month", name: "30 days", from: () => Date.now() - 30 * 864e5 },
  { id: "year", name: "This year", from: () => new Date(new Date().getFullYear(), 0, 1).getTime() },
  { id: "all", name: "All time", from: () => 0 },
];
const SUIT_ORDER = ["Major Arcana", "Wands", "Cups", "Swords", "Pentacles"];

// Drawn into the history's Patterns tab.
function renderPatterns(body) {
  const chips = el("div", "chips pat-spans");
  PAT_SPANS.forEach((sp) => {
    const c = el("button", `chip${PAT.span === sp.id ? " on" : ""}`, sp.name);
    c.setAttribute("aria-pressed", PAT.span === sp.id);
    c.addEventListener("click", () => { PAT.span = sp.id; renderHistory(); riseInHistory(); });
    chips.append(c);
  });
  body.append(chips);

  const from = PAT_SPANS.find((sp) => sp.id === PAT.span).from();
  const all = loadHistory().filter((r) => r.t >= from);
  const draws = all.flatMap((r) => readingCards(r).map((x) => ({ ...x, daily: r.spread === COTD_SPREAD })));
  if (!draws.length) {
    body.append(el("p", "empty-note history-empty", "Nothing drawn in this time yet."));
    return;
  }
  const readings = all.filter((r) => r.spread !== COTD_SPREAD).length;
  const daily = all.length - readings;
  const plural = (n, one, many = `${one}s`) => (n === 1 ? one : many);
  const tiles = (title, items, cols) => partSection({ title, tiles: true, items, cols }, 1);
  // Counted the short way, "12 Swords", with the share under it.
  const tile = (n, word, note) => ({ main: `${n} ${word}`, note });

  // How much
  const seen = new Set(draws.map((d) => d.card.name));
  body.append(tiles("In all", [
    tile(readings, plural(readings, "reading")),
    tile(daily, plural(daily, "daily card")),
    tile(seen.size, `of ${activeDeck().length}`, "cards seen"),
  ]));

  // Most drawn: the cards that keep coming back (twice or more).
  const count = new Map();
  draws.forEach((d) => count.set(d.card, (count.get(d.card) || 0) + 1));
  const top = [...count].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (top.length) {
    const sec = el("section", "summary-part");
    sec.append(el("p", "asks-title", "Keeps coming back"));
    const row = el("div", "summary-cards");
    row.style.setProperty("--cols", top.length);
    const items = top.map(([card]) => detailsItem(card));
    top.forEach(([card, n], i) => {
      const b = el("button", "related-card");
      const pic = el("div", "related-pic");
      const face = cardFace(card, true);
      face.style.height = "100%";
      pic.append(face);
      b.append(el("span", "related-label", `${n}×`), pic, el("span", "related-name", card.name));
      b.addEventListener("click", () => openDetails(items, i));
      row.append(b);
    });
    sec.append(row);
    body.append(sec);
  }

  // Suits, then elements (a Major card counts for its sign's element).
  const by = (f) => { const m = {}; draws.forEach((d) => { const k = f(d); if (k) m[k] = (m[k] || 0) + 1; }); return m; };
  const share = (n) => `${Math.round((100 * n) / draws.length)}%`;
  const suits = by((d) => suitOf(d.card));
  body.append(tiles("Suits", SUIT_ORDER.map((s) => ({ ...tile(suits[s] || 0, s === "Major Arcana" ? "Major" : s, share(suits[s] || 0)),
    tone: suits[s] ? "" : "quiet" }))));
  const els = by((d) => elementOf(d.card));
  body.append(tiles("Elements", ELEMENTS.map((e) => ({ ...tile(els[e] || 0, e, share(els[e] || 0)), tone: els[e] ? "" : "quiet" })), 4));

  // Upright and reversed (only when reversals have come up at all).
  const rev = draws.filter((d) => d.reversed).length;
  if (rev) body.append(tiles("Turned", [tile(draws.length - rev, "upright", share(draws.length - rev)), tile(rev, "reversed", share(rev))]));

  // The themes your readings lean towards, from each reading's strongest.
  const themes = {};
  all.forEach((r) => readingThemes(readingCards(r)).slice(0, 2).forEach((t) => (themes[t] = (themes[t] || 0) + 1)));
  const lead = Object.entries(themes).filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).slice(0, 3);
  if (lead.length) body.append(tiles("Themes", lead.map(([t, n]) => tile(n, (THEME_TEXT[t] || [t])[0], plural(n, "reading")))));
}
