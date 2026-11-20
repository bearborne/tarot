// A reading's key words, its name and the reading summary.
// Part of the app; the files in js/ load in the order listed in index.html.

// ── The key word under each card ────────────────────────
// Of a card's keywords, the one most connected to the other cards in the
// spread. Keywords are linked through shared themes: "rest" and "pause"
// both belong to stillness, "grief" and "healing" to the heart's work…
// A keyword shared word for word with another card counts most. With no
// links at all, the card's first (most central) keyword is used.

const THEMES = {
  beginnings: ["begin", "a new start", "spark", "seed", "potential", "opportunit", "venture", "dawn", "readiness", "preparation", "groundwork", "inspiration"],
  intuition:  ["intuition", "inner knowing", "dream", "subconscious", "mystery", "unknown", "imagination", "insight", "perception", "recepti", "sensitiv", "listening", "inner guidance", "inner teacher", "night mind", "beneath the surface"],
  heart:      ["love", "feelings, bonds", "feeling", "emotion", "compassion", "empathy", "romance", "connection", "union", "partnership", "attraction", "care", "kindness", "nurtur", "tender"],
  together:   ["community", "support", "family", "together", "belonging", "team", "collaborat", "cooperat", "sharing", "shared", "lineage", "heritage", "legacy", "group", "support", "partnership", "mutual"],
  stillness:  ["rest", "rest, patience", "pause", "patience", "calm", "serenity", "peace", "retreat", "recovery", "restoration", "waiting", "letting be", "solitude", "replenish", "pacing", "delays"],
  reflection: ["reflection", "looking inward", "contemplation", "review", "re-evaluation", "assessment", "awareness", "discernment", "perspective", "wisdom", "questioning", "inner", "lessons"],
  change:     ["change", "transition", "transition", "ending", "closure", "release", "moving on", "rebirth", "turning", "cycles", "sudden", "breakthrough", "revelation", "clearing", "letting go", "surrender", "liberation", "unfinished", "last step"],
  renewal:    ["renewal", "healing, hope", "hope", "recovery", "rekindled", "restoration", "rebirth", "new dawn", "replenish", "faith", "serenity"],
  truth:      ["truth", "clarity", "honest", "clear", "fairness", "accountab", "reason", "principles", "integrity", "insight", "revelation", "unspoken", "mental fog"],
  will:       ["will", "courage", "determination", "ambition", "action", "courage", "boldness", "conviction", "focus", "momentum", "energy", "passion", "fire", "speed", "standing firm", "persever", "persist", "resilience", "endurance", "strength"],
  structure:  ["structure", "stability", "security", "foundation", "discipline", "authority", "leadership", "control", "rigid", "routine", "responsibility", "boundaries", "tradition", "stewardship", "reliability", "steadiness", "conservation", "saving"],
  abundance:  ["abundance", "giving, receiving", "wealth", "generosity", "giving", "receiving", "reward", "fulfilment", "contentment", "satisfaction", "gratitude", "enough", "pleasure", "comfort"],
  craft:      ["skill", "steady work", "mastery", "practice", "dedication", "diligence", "study", "learning", "effort", "work", "manifestation", "resourceful", "practical", "cultivation", "follow-through", "consistency"],
  joy:        ["joy", "celebration", "play", "pleasure", "happiness", "warmth", "vitality", "milestone", "enthusiasm", "innocence"],
  freedom:    ["freedom", "curiosity", "independence", "free spirit", "spontaneity", "adventure", "exploration", "journey", "discovery", "expansion", "unconventional", "seeking", "curiosity"],
  shadow:     ["attachment", "tender places", "desire", "doubt", "worry", "fear", "self-limiting", "defensive", "conflict", "grief", "heartache", "exhaustion", "weariness", "isolation", "restless", "impatience", "perfectionism", "rigid", "urgency", "friction", "hesitation"],
  balance:    ["balance", "harmony", "moderation", "alignment", "adaptability", "flexibility", "priorities", "juggling", "integration", "wholeness", "heart and mind", "realignment"],
  choice:     ["choice", "direction", "decision", "options", "weighing", "direction", "planning", "vision", "foresight", "intention", "discernment", "crossroad"],
  self:       ["self-", "self-value", "confidence", "authenticity", "recognition", "visibility", "personal truth", "embodiment", "inner child", "validation"],
};

function themesOf(keyword) {
  const k = ` ${keyword.toLowerCase()} `;
  return Object.keys(THEMES).filter((t) => THEMES[t].some((stem) => k.includes(stem)));
}

// ── A reading's name ────────────────────────────────────
// Two words that describe the reading: an image for its strongest theme,
// coloured by a word from its second ("Quiet Dawn": stillness over renewal;
// "Clear Heart": truth over the heart). Hard themes get gentle words:
// comfort and resolve, not doom. The cards' keywords vote for their themes,
// the first (most central) keywords counting most. Which words are used
// depends on the cards themselves, so the same cards always get the same
// name, and different readings of one theme get different ones.
//   images – what the theme looks like (the name's second word)
//   tones  – how it colours another theme (the name's first word)
const THEME_NAMES = {
  // Images are things you could picture; tones are words that sit well
  // in front of almost any of them.
  beginnings: { images: ["Dawn", "Seed", "Spark", "Threshold", "Doorway", "Sunrise"],
                tones:  ["First", "Kindled", "Budding", "Early", "Waking"] },
  intuition:  { images: ["Moon", "Lantern", "Dream", "Oracle", "Mist", "Starlight"],
                tones:  ["Moonlit", "Dreaming", "Hidden", "Whispering", "Silver", "Veiled"] },
  heart:      { images: ["Heart", "Rose", "Chalice", "Bloom", "Embrace"],
                tones:  ["Tender", "Open", "Warm", "Heartfelt", "Beloved", "Gentle"] },
  together:   { images: ["Circle", "Hearth", "Bridge", "Table", "Campfire"],
                tones:  ["Shared", "Kindred", "Woven"] },
  stillness:  { images: ["Haven", "Harbour", "Stillwater", "Respite", "Snowfall", "Hush"],
                tones:  ["Quiet", "Still", "Resting", "Soft", "Hushed", "Slow"] },
  reflection: { images: ["Mirror", "Well", "Pool", "Lamp", "Hermitage"],
                tones:  ["Inward", "Deep", "Wise", "Patient", "Pensive"] },
  change:     { images: ["Tide", "Crossing", "Wheel", "Season", "Passage", "River"],
                tones:  ["Turning", "Shifting", "Rising", "Wakening", "Tidal"] },
  renewal:    { images: ["Spring", "Phoenix", "Bloom", "Sapling", "Morning", "Rain"],
                tones:  ["Healing", "Greening", "Rekindled", "Renewed", "Hopeful", "Reborn"] },
  truth:      { images: ["Sword", "Light", "Daybreak", "Beacon", "Window", "Bell"],
                tones:  ["Clear", "Bright", "Honest", "True", "Unveiled", "Lucid"] },
  will:       { images: ["Flame", "Torch", "Banner", "Arrow", "Forge", "Lion"],
                tones:  ["Brave", "Burning", "Steadfast", "Bold", "Fierce", "Unbowed"] },
  structure:  { images: ["Foundation", "Keystone", "Oak", "Pillar", "Cornerstone", "Mountain"],
                tones:  ["Steady", "Rooted", "Grounded", "Sturdy", "Enduring"] },
  abundance:  { images: ["Harvest", "Orchard", "Garden", "Bounty", "Cup", "Vineyard"],
                tones:  ["Golden", "Generous", "Blessed", "Ripening"] },
  craft:      { images: ["Workshop", "Loom", "Anvil", "Kiln", "Chisel"],
                tones:  ["Patient", "Devoted", "Careful"] },
  joy:        { images: ["Sun", "Feast", "Festival", "Dance", "Song", "Summer"],
                tones:  ["Sunlit", "Joyful", "Radiant", "Golden", "Bright", "Singing"] },
  freedom:    { images: ["Road", "Horizon", "Journey", "Wings", "Voyage", "Path"],
                tones:  ["Wandering", "Wild", "Roaming", "Untamed", "Free", "Windswept"] },
  shadow:     { images: ["Candle", "Shelter", "Night", "Ember", "Cloak", "Refuge"],
                tones:  ["Gentle", "Sheltered", "Soothing", "Candlelit", "Tender", "Mending"] },
  balance:    { images: ["Scales", "Equinox", "Twilight", "Halfmoon"],
                tones:  ["Balanced", "Poised"] },
  choice:     { images: ["Crossroads", "Compass", "Signpost", "Fork", "Key"],
                tones:  ["Chosen", "Guiding", "Seeking", "Wayfinding"] },
  self:       { images: ["Crown", "Star", "Voice", "Throne"],
                tones:  ["Radiant", "Whole", "True", "Shining", "Sovereign"] },
};
// When no card has a known theme.
const WILD_NAMES = ["Open Sky", "Starlit Road", "Quiet Wonder", "Wandering Star", "Unwritten Page"];

// Two words that don't say the same thing twice ("Rose Rose",
// "Mended Mending").
function nameFits(tone, image) {
  const a = tone.toLowerCase(), b = image.toLowerCase();
  return a.slice(0, 4) !== b.slice(0, 4);
}

// The names two themes make together, the first theme giving the image.
function namesFor(main, colour) {
  const { images } = THEME_NAMES[main];
  const { tones } = THEME_NAMES[colour || main];
  return images.flatMap((img) => tones.filter((tone) => nameFits(tone, img)).map((tone) => `${tone} ${img}`));
}

// A small number made from the cards, the same every time for the same cards.
function cardsHash(cards) {
  let h = 7;
  cards.forEach(({ card, reversed }) => {
    for (const ch of card.name + (reversed ? "~" : "")) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  });
  return h;
}

// The reading's themes, strongest first.
function readingThemes(cards) {
  const score = {};
  cards.forEach(({ card, reversed }) => {
    const seen = new Set();   // each theme counts once per keyword, at its best
    filled(keywordsFor(card, reversed)).forEach((k, i) => {
      themesOf(k).forEach((t) => {
        const w = i === 0 ? 3 : i === 1 ? 2 : 1;
        if (seen.has(t + w)) return;
        seen.add(t + w);
        score[t] = (score[t] || 0) + w;
      });
    });
  });
  const order = Object.keys(THEME_NAMES);   // ties go to the theme listed first
  return Object.keys(score).sort((a, b) => score[b] - score[a] || order.indexOf(a) - order.indexOf(b));
}

// cards: [{ card, reversed }]. "" with no cards.
function nameReading(cards) {
  if (!cards.length) return "";
  const [main, colour] = readingThemes(cards);
  if (!main) return WILD_NAMES[cardsHash(cards) % WILD_NAMES.length];
  const pool = namesFor(main, colour);
  return pool[cardsHash(cards) % pool.length];
}

// Other names that would suit the reading, offered while renaming: the
// pairings of its three strongest themes, each theme taking a turn as the
// image, so the row mixes them.
function nameIdeas(cards) {
  const top = readingThemes(cards).slice(0, 3);
  if (!top.length) return WILD_NAMES.slice();
  const h = cardsHash(cards);
  const pairs = top.length === 1 ? [[top[0], top[0]]]
    : top.flatMap((a) => top.filter((b) => b !== a).map((b) => [a, b]));
  const pools = pairs.map(([a, b], k) => {
    const p = namesFor(a, b);
    return p.map((_, i) => p[(i + h + k * 5) % p.length]);   // a different start per pairing
  });
  const ideas = [];
  for (let i = 0; ideas.length < 12 && i < 36; i++) pools.forEach((p) => p[i] && ideas.push(p[i]));
  return [...new Set(ideas)].slice(0, 12);
}

function spreadKeyword(slot) {
  return linkedKeyword(slot, S.slots.filter((s) => s.card));
}

// entry and spread: { card, reversed } — the card, and every card in its reading.
function linkedKeyword(entry, spread) {
  const own = filled(keywordsFor(entry.card, entry.reversed));
  if (!own.length) return "";
  const others = spread.filter((s) => s !== entry).map((s) => {
    const words = filled(keywordsFor(s.card, s.reversed)).map((w) => w.toLowerCase());
    // How many of that card's keywords fall under each theme.
    const themes = {};
    words.flatMap(themesOf).forEach((t) => { themes[t] = (themes[t] || 0) + 1; });
    return { words, themes };
  });
  let best = own[0], bestScore = 0;
  own.forEach((k) => {
    const mine = themesOf(k);
    const score = others.reduce((sum, o) =>
      sum + (o.words.includes(k.toLowerCase()) ? 3 : 0) + mine.reduce((n, t) => n + (o.themes[t] || 0), 0), 0);
    if (score > bestScore) { best = k; bestScore = score; }
  });
  return best;
}

// ── The reading's summary ───────────────────────────────
// Built from the cards themselves: the themes and words they share,
// their elements, numbers, stars and pictures, and what that adds up to.

const THEME_TEXT = {
  beginnings: ["Beginnings", "something to start", "What is ready to begin?"],
  intuition:  ["Intuition", "inner knowing", "What do you already sense, beneath the thinking?"],
  heart:      ["Heart", "feelings, bonds", "What is your heart asking for?"],
  together:   ["Belonging", "others, support", "Who walks this part of the path with you?"],
  stillness:  ["Stillness", "rest, patience", "Where could a pause serve you more than a push?"],
  reflection: ["Reflection", "looking inward", "What becomes clear when you look inward?"],
  change:     ["Change", "endings, transitions", "What is ready to change, and what is it making room for?"],
  renewal:    ["Renewal", "healing, hope", "What is quietly healing in you?"],
  truth:      ["Truth", "honesty, clarity", "What truth would set things in order?"],
  will:       ["Will", "energy, courage", "Where does your energy want to go?"],
  structure:  ["Foundations", "stability, limits", "What foundation would help you feel secure?"],
  abundance:  ["Abundance", "giving, receiving", "What are you ready to receive?"],
  craft:      ["Craft", "skill, steady work", "What deserves your patient effort?"],
  joy:        ["Joy", "celebration", "What could you let yourself enjoy?"],
  freedom:    ["Exploration", "curiosity", "Where is curiosity leading you?"],
  shadow:     ["Inner work", "tender places", "What tender place is ready to be met with kindness?"],
  balance:    ["Balance", "harmony", "What needs rebalancing?"],
  choice:     ["Choice", "direction", "Which direction feels true to you?"],
  self:       ["Self-worth", "how you value yourself", "How could you value yourself a little more?"],
};

const ELEMENT_TEXT = { Fire: "passion, will", Water: "feelings, dreams", Air: "thought, truth", Earth: "the body, work" };

const NUMBER_TEXT = {
  1: "beginnings", 2: "balance, choice", 3: "growth", 4: "stability", 5: "challenge",
  6: "harmony", 7: "reflection", 8: "mastery", 9: "near completion", 10: "completion",
};

const RANK_TEXT = { Page: "messages, study", Knight: "pursuit", Queen: "inner mastery", King: "outer mastery" };

const isMajorCard = (card) => CARDS.indexOf(card) < 22;

function elementOf(card) {
  const suit = card.name.split(" of ")[1];
  if (suit) return { Wands: "Fire", Cups: "Water", Swords: "Air", Pentacles: "Earth" }[suit] || null;
  const e = (card.correspondences || {}).element || "";
  return ["Fire", "Water", "Air", "Earth"].find((x) => e.includes(x)) || null;
}

const listNames = (xs) => xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;

// ── Reading the spread through a lens ───────────────────
// A lens gives each place in the spread a meaning (Past, Challenge,
// Advice…), and each card is read in that place using its inReading
// phrases from cards.js. The summary's buttons switch between lenses.

// How a card reads in each kind of place. {g} = what the card brings,
// {a} = its advice, {c} = its challenge. Two wordings for variety.
const PLACES = {
  past:      ["Past",        ["Behind you: {g}.", "Where you come from: {g}."]],
  present:   ["Present",     ["Now: {g}.", "At the centre right now: {g}."]],
  future:    ["Future",      ["Ahead: {g}.", "Coming into view: {g}."]],
  situation: ["Situation",   ["The situation: {g}.", "What's here: {g}."]],
  challenge: ["Challenge",   ["The challenge: {c}.", "What asks you to grow: {c}."]],
  advice:    ["Advice",      ["The advice: {a}.", "What helps: {a}."]],
  outcome:   ["Outcome",     ["Where this leads: {g}.", "The direction it's taking: {g}."]],
  hidden:    ["Hidden",      ["Beneath the surface: {g}."]],
  root:      ["Root",        ["At the root of it: {g}."]],
  self:      ["You",         ["What you bring: {g}."]],
  other:     ["Them",        ["What they bring: {g}."]],
  between:   ["Between you", ["Between you: {g}."]],
  mind:      ["Mind",        ["In your thoughts: {g}."]],
  body:      ["Body",        ["In your body and daily life: {g}."]],
  heart:     ["Heart",       ["In your heart: {g}."]],
  spirit:    ["Spirit",      ["In your spirit: {g}."]],
  keep:      ["Keep",        ["Worth keeping: {g}."]],
  release:   ["Release",     ["Ready to release: whatever stands in the way of {c}."]],
  welcome:   ["Welcome",     ["Ready to welcome: {g}."]],
  strength:  ["Gift",        ["Your gift: {g}."]],
  pathA:     ["Path A",      ["One path: {g}."]],
  pathB:     ["Path B",      ["The other path: {g}."]],
  message:   ["Message",     ["The message: {g}."]],
  lesson:    ["Lesson",      ["The lesson: {c}."]],
};

// Recognises a spread position's own label ("Past", "The obstacle"…).
const PLACE_WORDS = [
  ["past", /\bpast|behind|before\b/i], ["present", /\bpresent|now|today\b/i], ["future", /\bfuture|next|ahead|coming\b/i],
  ["challenge", /\bchallenge|obstacle|block/i], ["advice", /\badvice|guidance|what to do|action\b/i],
  ["outcome", /\boutcome|result|where it leads/i], ["hidden", /\bhidden|subconscious|unseen\b/i],
  ["root", /\broot|foundation|cause\b/i], ["self", /^(you|yourself|self)$/i], ["other", /\bthem|other|partner\b/i],
  ["between", /\bbetween|relationship\b/i], ["mind", /\bmind\b/i], ["body", /\bbody\b/i], ["heart", /\bheart\b/i],
  ["spirit", /\bspirit|soul\b/i], ["strength", /\bstrength|gift\b/i],
];

function placeOf(label) {
  const hit = PLACE_WORDS.find(([, re]) => re.test(label || ""));
  return hit ? hit[0] : null;
}

// A lens from labelled places: each label is read for the kind of place it
// names (placeOf), and kept as the place's heading, with its question.
const labelLens = (name, labels, questions, theme = null) =>
  ({ name, places: labels.map((l) => placeOf(l) || "own"), own: true, labels, questions, theme });
// The spread as it was laid out, if its positions say something.
function laidOutLens(entries) {
  const labelled = entries.some((e) => e.label && !/^card \d+$/i.test(e.label) && e.label !== "Your card");
  return labelled ? labelLens("As laid out", entries.map((e) => e.label), entries.map((e) => e.question || "")) : null;
}
// One of the table's themes, laid over a spread of n cards (as on the table).
function themeLens(theme, n) {
  const ps = themePlaces(theme, n);
  return labelLens(theme.name, ps.map((p) => p.label), ps.map((p) => p.question), theme);
}

function phrases(card, reversed) {
  const r = card.inReading || {};
  const g = (reversed ? r.reversed : r.upright) || filled(keywordsFor(card, reversed)).slice(0, 2).join(" and ");
  const a = (reversed ? r.reversedAdvice : r.advice) || r.advice || `stay with ${g}`;
  const c = r.challenge || g;
  return { g, a, c };
}

// One card read in one place of the lens.
function placeLine(entry, place, i, label) {
  const { g, a, c } = phrases(entry.card, entry.reversed);
  // A reversed card also carries its advice, so it always points somewhere.
  const withAdvice = (line) => (entry.reversed ? `${line.slice(0, -1)}; ${a}.` : line);
  if (place === "own") return withAdvice(`${label || entry.label}: ${g}.`);
  const forms = PLACES[place][1];
  const form = forms[(CARDS.indexOf(entry.card) + i) % forms.length];
  const line = form.replace("{g}", g).replace("{a}", a).replace("{c}", c);
  return form.includes("{g}") ? withAdvice(line) : line;
}

// One card read in its themed place, for a one-card reading's page:
// { title, text }, or null when the card has no theme place.
function themedReading(item, title) {
  if (!item.label || item.label === "Your card") return null;
  const t = placeLine(item, placeOf(item.label) || "own", 0, item.label).replace(/^[^:]+:\s*/, "");
  return { title: title || "The reading", text: cap(t) };
}

const placeName = (lens, i, entry) => (lens.own ? (lens.labels ? lens.labels[i] : entry.label) : PLACES[lens.places[i]][0]);

const numberOf = (card) => (card.court ? null : +((card.correspondences || {}).number || NaN));

// ── The arc of the whole spread ─────────────────────────
// One line on where the spread travels, from its first card to its last:
// these clauses, joined. (Themes,
// elements and counts have their own tiles, so they aren't repeated here.)

function arcBits(entries) {
  const n = entries.length;
  if (n < 2) return [];
  const themes = entries.map((e) => new Set(filled(keywordsFor(e.card, e.reversed)).map((w) => w.toLowerCase()).flatMap(themesOf)));
  const first = themes[0], last = themes[n - 1];
  const has = (set, ...ts) => ts.some((t) => set.has(t));
  const bits = [];
  if (has(first, "change", "shadow") && has(last, "renewal", "beginnings", "joy")) bits.push("from a hard place to renewal");
  else if (has(first, "stillness", "shadow", "reflection") && has(last, "will", "freedom", "beginnings")) bits.push("from rest to action");
  else if (has(first, "will", "freedom") && has(last, "stillness", "reflection")) bits.push("from effort to rest");
  else if (has(first, "heart", "together") && has(last, "self", "freedom")) bits.push("from others to yourself");
  // Pairs already note a single card turning; this is the spread as a whole.
  if (n >= 3) {
    const half = Math.ceil(n / 2);
    const earlyRev = entries.slice(0, half).filter((e) => e.reversed).length;
    const lateRev = entries.slice(half).filter((e) => e.reversed).length;
    if (earlyRev && !lateRev) bits.push("opening up as it goes");
    if (!earlyRev && lateRev) bits.push("turning inward as it goes");
  }
  return bits;
}

// ── The summary itself ──────────────────────────────────
// Card names stay in the row of cards at the top; the text speaks of
// places and patterns instead.

const countOf = (k, n) => (n === 2 && k === 2 ? "both cards" : `${k} of the ${n} cards`);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// The places (0, 1, 2…) of the cards in a spread that pass a test.
const whichCards = (entries, test) => entries.map((e, i) => (test(e, i) ? i : -1)).filter((i) => i >= 0);

// The themes each card's keywords touch, one set per card.
const themeSets = (entries) =>
  entries.map((e) => new Set(filled(keywordsFor(e.card, e.reversed)).map((w) => w.toLowerCase()).flatMap(themesOf)));

// A section of the summary. Its items are either list lines
// { head, text, cards } or, with tiles: true, small tiles seen at a glance:
// { top, n, main, note, tone, cards } — e.g. n 2, main "crowns".
// perCard: one tile per card, lined up like the row of cards.
// Every item's `cards` are the places it is found in, so tapping it can
// light them up (see the threads in openSummary).
const part = (title, items, opts = {}) => ({ title, items, ...opts });

const NUMBER_WORDS = ["", "aces", "twos", "threes", "fours", "fives", "sixes", "sevens", "eights", "nines", "tens"];
const ELEMENTS = ["Fire", "Water", "Air", "Earth"];

// A reading of one card has nothing to compare, so its summary is built
// from the card alone: its themes, then what's in its picture and its
// symbolism (number or rank, element, stars). No counts: everything is in
// the one card.
const ONE_WORDS = ["", "Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
function oneCardParts(e) {
  const parts = [];
  const themes = [...themeSets([e])[0]];
  if (themes.length) {
    parts.push(part("Themes", themes.slice(0, 4).map((t) => ({
      main: THEME_TEXT[t][0], note: THEME_TEXT[t][1], cards: [0],
    })), { tiles: true }));
  }
  const pics = ((PICTURES[e.card.name] || {}).symbols || []).filter((x) => SYMBOLS[x]).slice(0, 5)
    .map((x) => ({ main: cap(SYMBOLS[x].name), note: SYMBOLS[x].meaning, cards: [0] }));
  const sym = [];
  const k = numberOf(e.card);
  if (isMajorCard(e.card)) sym.push({ main: "Major", note: "a life lesson", cards: [0] });
  else if (e.card.court) sym.push({ main: rankOf(e.card), note: RANK_TEXT[rankOf(e.card)], cards: [0] });
  else if (k >= 1 && k <= 10) sym.push({ main: ONE_WORDS[k], note: NUMBER_TEXT[k], cards: [0] });
  const elem = elementFor(e.card);
  if (elem) sym.push({ main: elem, note: ELEMENT_TEXT[elem].split(",")[0], cards: [0] });
  starsOf(e.card).slice(0, 2).forEach((s) => sym.push({ main: s, note: "astrology", cards: [0] }));
  if (e.reversed) sym.push({ main: "Reversed", note: "still forming", cards: [0] });
  const symbols = [...sym, ...pics].slice(0, 9);
  if (symbols.length) parts.push(part("Symbols", symbols, { tiles: true }));
  return { parts, themes, topEl: elem, els: elem ? { [elem]: 1 } : {}, majors: isMajorCard(e.card) ? 1 : 0, revs: e.reversed ? 1 : 0 };
}

function patternParts(entries) {
  const n = entries.length;
  if (n === 1) return oneCardParts(entries[0]);
  const parts = [];
  const kw = entries.map((e) => filled(keywordsFor(e.card, e.reversed)).map((w) => w.toLowerCase()));
  const sets = themeSets(entries);
  const tally = (lists) => {
    const c = {};
    lists.forEach((s) => new Set(s).forEach((x) => (c[x] = (c[x] || 0) + 1)));
    return c;
  };
  const top = (c, k) => Object.keys(c).filter((x) => c[x] >= 2).sort((a, b) => c[b] - c[a]).slice(0, k);

  // Themes.
  const themeCount = tally(sets);
  const themes = top(themeCount, 4);
  if (themes.length) {
    parts.push(part("Themes", themes.map((t) => ({
      n: themeCount[t], main: THEME_TEXT[t][0], note: THEME_TEXT[t][1],
      cards: whichCards(entries, (e, i) => sets[i].has(t)),
    })), { tiles: true }));
  }

  // Words shared by two or more cards: whole keywords, or words inside them.
  const STOP = new Set(["with", "from", "into", "your", "self", "that", "the", "and", "what", "inner", "new"]);
  const seen = kw.map((words) => {
    const s = new Set();
    words.forEach((k) => {
      s.add(k);
      k.split(/[\s-]+/).filter((w) => w.length > 3 && !STOP.has(w)).forEach((w) => s.add(w));
    });
    return s;
  });
  const wordCount = tally(seen);
  const words = Object.keys(wordCount).filter((w) => wordCount[w] >= 2)
    .sort((a, b) => wordCount[b] - wordCount[a] || b.length - a.length);
  const shown = words.filter((w) => !words.some((o) => o !== w && o.includes(w) && wordCount[o] === wordCount[w])).slice(0, 6);
  if (shown.length) {
    parts.push(part("Shared words", shown.map((w) => ({
      n: wordCount[w], main: w, cards: whichCards(entries, (e, i) => seen[i].has(w)),
    })), { tiles: true }));
  }

  // What's in the pictures (symbols.js).
  const pics = entries.map((e) => new Set((PICTURES[e.card.name] || {}).symbols || []));
  const symCount = tally(pics);
  const syms = top(symCount, 6).filter((x) => SYMBOLS[x]);
  // (Shown together with the symbolism below, as "Symbols".)
  const picTiles = syms.map((x) => ({
    n: symCount[x], main: SYMBOLS[x].name, note: SYMBOLS[x].meaning,
    cards: whichCards(entries, (e, i) => pics[i].has(x)),
  }));

  // Elements: all four, the missing ones dimmed.
  const els = {};
  entries.forEach((e) => { const x = elementFor(e.card); if (x) els[x] = (els[x] || 0) + 1; });
  const topEl = Object.keys(els).sort((a, b) => els[b] - els[a])[0];
  if (n >= 2) {
    parts.push(part("Elements", [...ELEMENTS].sort((a, b) => (els[b] || 0) - (els[a] || 0)).map((x) => ({
      n: els[x] || 0, main: x, note: els[x] ? ELEMENT_TEXT[x].split(",")[0] : "missing",
      tone: els[x] ? (els[x] >= 2 && x === topEl ? "good" : "") : "quiet",
      cards: whichCards(entries, (e) => elementFor(e.card) === x),
    })), { tiles: true, cols: 4 }));
  }

  // Symbolism: Major cards, numbers, ranks, stars, reversals.
  const sym = [];
  const majorCards = whichCards(entries, (e) => isMajorCard(e.card));
  const majors = majorCards.length;
  if (majors >= 2 && majors >= Math.ceil(n / 2)) sym.push({ n: majors, main: "Major", note: "life lessons", cards: majorCards });
  else if (!majors && n >= 3) sym.push({ n: 0, main: "Major", note: "everyday matters", tone: "quiet" });
  const nums = tally(entries.map((e) => { const x = numberOf(e.card); return x >= 1 && x <= 10 ? [x] : []; }));
  top(nums, 3).forEach((k) => sym.push({ n: nums[k], main: NUMBER_WORDS[k], note: NUMBER_TEXT[k],
    cards: whichCards(entries, (e) => numberOf(e.card) === +k) }));
  const ranks = tally(entries.map((e) => (e.card.court ? [rankOf(e.card)] : [])));
  top(ranks, 4).forEach((r) => sym.push({ n: ranks[r], main: `${r}s`, note: RANK_TEXT[r],
    cards: whichCards(entries, (e) => e.card.court && rankOf(e.card) === r) }));
  const stars = tally(entries.map((e) => starsOf(e.card)));
  top(stars, 3).forEach((s) => sym.push({ n: stars[s], main: s, note: "astrology",
    cards: whichCards(entries, (e) => starsOf(e.card).includes(s)) }));
  const revCards = whichCards(entries, (e) => e.reversed);
  const revs = revCards.length;
  if (revs && revs >= Math.ceil(n / 2)) sym.push({ n: revs, main: "reversed", note: "still forming", cards: revCards });
  // Symbols: what's in the pictures and the cards' symbolism, as one set of
  // tiles, the most shared first (the sort keeps ties in order), at most 3 rows.
  const symbols = [...picTiles, ...sym].sort((a, b) => b.n - a.n).slice(0, 9);
  if (symbols.length) parts.push(part("Symbols", symbols, { tiles: true }));
  return { parts, themes, topEl, els, majors, revs };
}

// ── Deeper patterns: how the cards act on each other ────
// These name the cards by their place in the spread, so they follow
// the lens: nameOf(i) gives the name of place i.

// Where the figures look. The spread is laid out left to right, so a
// figure looking right looks toward the next card, one looking left
// toward the card before. A reversed card turns its gaze around.
function facingOf(e) {
  const f = (PICTURES[e.card.name] || {}).facing || "";
  if (!e.reversed) return f;
  return f === "left" ? "right" : f === "right" ? "left" : f;
}

function gazePart(entries, nameOf) {
  const n = entries.length;
  const f = entries.map(facingOf);
  if (n < 2 || !f.some(Boolean)) return null;
  const tiles = f.map((d, i) => ({
    top: nameOf(i),
    main: { left: "←", right: "→", back: "↑" }[d] || "·",
    note: d === "left" ? (i ? "back" : "outward")
      : d === "right" ? (i < n - 1 ? "ahead" : "beyond")
      : d === "back" ? "away" : "",
    tone: d ? "" : "quiet",
    cards: d === "left" && i ? [i - 1, i] : d === "right" && i < n - 1 ? [i, i + 1] : [i],
  }));
  const list = [];
  const lefts = whichCards(entries, (e, i) => f[i] === "left");
  const rights = whichCards(entries, (e, i) => f[i] === "right");
  if (n >= 3 && lefts.length >= Math.ceil(n * 0.6)) list.push({ head: "Most look back", text: "The past holds the attention.", cards: lefts });
  else if (n >= 3 && rights.length >= Math.ceil(n * 0.6)) list.push({ head: "Most look ahead", text: "The reading leans forward.", cards: rights });
  for (let i = 0; i < n - 1; i++) {
    if (f[i] === "right" && f[i + 1] === "left") list.push({ head: `${nameOf(i)} → ← ${nameOf(i + 1)}`, text: "Face to face: read them together.", cards: [i, i + 1] });
    if (f[i] === "left" && f[i + 1] === "right") list.push({ head: `${nameOf(i)} ← → ${nameOf(i + 1)}`, text: "Back to back: not yet speaking.", cards: [i, i + 1] });
  }
  return part("Gaze", tiles, { tiles: true, perCard: true, list });
}

// Cards that mirror each other: the same force seen from two sides.
const MIRRORS = [
  ["The Magician", "The High Priestess", "doing and knowing"],
  ["The Empress", "The Emperor", "nurture and structure"],
  ["The High Priestess", "The Hierophant", "inner and taught wisdom"],
  ["The Lovers", "The Devil", "a chosen bond, a binding one"],
  ["The Chariot", "Strength", "force and gentleness"],
  ["Justice", "The Hanged Man", "deciding and surrendering"],
  ["Death", "Judgement", "an ending, then an awakening"],
  ["Temperance", "The Devil", "moderation and excess"],
  ["The Tower", "The Star", "the fall, then hope"],
  ["The Moon", "The Sun", "fear and clarity"],
  ["The Fool", "The World", "the start and the completion"],
  ["Wheel of Fortune", "The World", "a turn and an arrival"],
];

// Themes that pull against each other when different cards carry them.
const TENSIONS = [
  ["stillness", "will", "Rest ↔ action", "pause or push?", "How could rest and action both have their place?"],
  ["freedom", "structure", "Freedom ↔ roots", "roam or settle?", "How could you be free and still feel held?"],
  ["heart", "truth", "Heart ↔ head", "feeling and thinking disagree", "Where do your heart and your head disagree?"],
  ["joy", "shadow", "Joy ↔ hurt", "both are here", "Can joy and what still hurts sit side by side?"],
  ["self", "together", "Self ↔ others", "both need room", "How could you honour yourself and the people around you?"],
  ["change", "structure", "Change ↔ stability", "move or hold?", "What needs to change, and what needs to stay?"],
  ["intuition", "craft", "Dream ↔ work", "vision needs practice", "How could a dream be given a practical first step?"],
];

function tensionsOf(entries) {
  const sets = themeSets(entries);
  return TENSIONS.map(([a, b, head, text, ask]) => {
    const A = whichCards(entries, (e, i) => sets[i].has(a) && !sets[i].has(b));
    const B = whichCards(entries, (e, i) => sets[i].has(b) && !sets[i].has(a));
    return A.length && B.length ? { head, text, ask, a: A, b: B, cards: [...A, ...B].sort((x, y) => x - y) } : null;
  }).filter(Boolean).slice(0, 2);
}

// As compact tiles: { top, main, note, cards } — e.g. main "Rest ↔ action",
// note "pause or push?".
function mirrorItems(entries, nameOf) {
  const items = [];
  const sorted = (...xs) => xs.sort((x, y) => x - y);
  const at = (name) => entries.findIndex((e) => e.card.name === name);
  const short = (name) => name.replace(/^The /, "");
  MIRRORS.forEach(([a, b, text]) => {
    const i = at(a), j = at(b);
    if (i >= 0 && j >= 0) items.push({ main: `${short(a)} ↔ ${short(b)}`, note: text, cards: sorted(i, j) });
  });
  // The beginning and the end of a suit; the inner and outer mastery of an element.
  entries.forEach((e, i) => {
    const suit = e.card.name.split(" of ")[1];
    if (!suit) return;
    entries.forEach((g, j) => {
      if (j === i || g.card.name.split(" of ")[1] !== suit) return;
      if (e.card.name.startsWith("Ace") && g.card.name.startsWith("Ten")) {
        items.push({ top: suit, main: "Ace ↔ Ten", note: "seed to harvest", cards: sorted(i, j) });
      }
      if (rankOf(e.card) === "Queen" && rankOf(g.card) === "King") {
        items.push({ top: suit, main: "Queen ↔ King", note: "inner, outer mastery", cards: sorted(i, j) });
      }
    });
  });
  // A Major card's number echoed by a Minor card.
  entries.forEach((e, i) => {
    const k = CARDS.indexOf(e.card);
    if (k < 1 || k > 10) return;
    const echo = whichCards(entries, (g) => !isMajorCard(g.card) && numberOf(g.card) === k);
    if (echo.length) items.push({ top: [i, ...echo].map(nameOf).join(" ↔ "), main: `${k} ↔ ${k}`, note: "lesson in daily life", cards: sorted(i, ...echo) });
  });
  tensionsOf(entries).forEach(({ head, text, cards }) => items.push({ main: head, note: text, cards }));
  return items.slice(0, 5);
}

// What the reading asks: questions for the spread as a whole, then one from
// each card, headed by the place it holds in the chosen lens. The questions
// for the whole never name cards (the row of cards above shows them); they
// quote the cards' own ideas and advice, or count the cards that raised them,
// so each still belongs to this reading alone.
const ELEMENT_ASK = {
  Fire:  ["where is that drive pulling you?", "where could a little more passion or courage help?"],
  Water: ["what are those feelings telling you?", "what would change if you let yourself feel this fully?"],
  Air:   ["what would an honest, clear look show you?", "what thought or conversation is waiting to be had?"],
  Earth: ["what practical step would ground this?", "what would help this take root in daily life?"],
};
function summaryQuestions(entries, lens) {
  const n = entries.length;
  const { themes, topEl, els, majors, revs } = patternParts(entries);
  const sets = themeSets(entries);
  const lower = (q) => q[0].toLowerCase() + q.slice(1);
  // "One card", "2 of the 5 cards", "Both cards", "All 3 cards" — never names.
  const who = (idx) => (idx.length === n ? (n === 2 ? "Both cards" : `All ${n} cards`) : idx.length === 1 ? "One card" : `${idx.length} of the ${n} cards`);
  const verb = (idx, one, many) => (idx.length === 1 ? one : many);
  const kw = (e) => (filled(keywordsFor(e.card, e.reversed))[0] || "").toLowerCase();
  const whole = [];

  // Two cards' key ideas that meet in one theme: quoted, so the question
  // could only come from these two cards.
  const linked = connectedIdeas(entries, 3);
  const clause = (x, t) => {
    const bits = x.split(/;\s*/);
    const c = bits.find((b) => ideaThemes(b).includes(t)) || bits[0];
    return /^[A-Z][a-z]+:/.test(c) ? c : c.charAt(0).toLowerCase() + c.slice(1);
  };
  // Stricter than themesOf, since these are quoted: a stem must start a
  // word, and a short one must be (nearly) the whole word ("care", not
  // "career"). "…in love or work", "…at work" only say where; they don't
  // link ideas.
  const ideaThemes = (x) => {
    const k = x.toLowerCase().replace(/\b(?:in|at) (?:love|work)(?: or (?:love|work))?/g, "");
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return Object.keys(THEMES).filter((t) => THEMES[t].some((stem) =>
      new RegExp(`(^|[^a-z])${esc(stem)}${stem.length <= 5 ? "(s|es|d|ed|ing)?([^a-z]|$)" : ""}`).test(k)));
  };
  let bridge = null;
  linked.forEach((xs, i) => linked.forEach((ys, j) => {
    if (j <= i) return;
    xs.forEach((x, a) => ys.forEach((y, b) => {
      // "self" alone is too loose a link ("self-inspiration", "self-healing").
      const shared = ideaThemes(x).filter((t) => t !== "self" && ideaThemes(y).includes(t));
      const score = shared.length * 10 - a - b;
      if (shared.length && (!bridge || score > bridge.score)) bridge = { i, j, x, y, t: shared[0], score };
    }));
  }));
  if (bridge) {
    const { i, j, x, y, t: bt } = bridge;
    whole.push(`“${cap(clause(x, bt))}” and “${clause(y, bt)}”: ${lower(THEME_TEXT[bt][2])}`);
  }

  // The lens's challenge and advice, in the card's own words.
  const placeAt = (p) => (lens ? lens.places.indexOf(p) : -1);
  const ci = placeAt("challenge"), ai = placeAt("advice");
  if (ci >= 0) whole.push(`The challenge, ${phrases(entries[ci].card, entries[ci].reversed).c}: what makes that hard right now?`);
  if (ai >= 0) {
    whole.push(`The advice, ${phrases(entries[ai].card, entries[ai].reversed).a}: what would that look like this week?`);
  } else if (n >= 2) {
    // No advice place: the first and last cards' advice, side by side.
    const [a1, a2] = [entries[0], entries[n - 1]].map((e) => (e.card.inReading || {})[e.reversed ? "reversedAdvice" : "advice"] || (e.card.inReading || {}).advice);
    if (a1 && a2 && a1 !== a2) whole.push(`${cap(a1)}, or ${a2}: which comes first?`);
  }

  themes.slice(0, 3).forEach((t) => {
    if (bridge && bridge.t === t) return;   // already asked, in the cards' own ideas
    const idx = whichCards(entries, (e, i) => sets[i].has(t));
    const what = t === "heart" ? "the heart" : THEME_TEXT[t][0].toLowerCase();
    if (idx.length < n || n <= 3) whole.push(`${who(idx)} ${verb(idx, "speaks", "speak")} of ${what}: ${lower(THEME_TEXT[t][2])}`);
  });
  const t = tensionsOf(entries)[0];
  if (t) whole.push(cap(t.ask));
  if (n >= 3) {
    // By the first and last cards' key words ("How does conflict lead to teamwork?").
    const [f0, fN] = [kw(entries[0]), kw(entries[n - 1])];
    if (f0 && fN && f0 !== fN) whole.push(`How does ${f0} lead to ${fN}?`);
  }
  if (topEl && els[topEl] >= 2) {
    const idx = whichCards(entries, (e) => elementFor(e.card) === topEl);
    whole.push(`${who(idx)} ${verb(idx, "carries", "carry")} ${topEl}: ${ELEMENT_ASK[topEl][0]}`);
  }
  const missing = Object.keys(ELEMENT_ASK).filter((x) => !els[x]);
  if (n >= 4 && missing.length === 1) whole.push(`No ${missing[0]} among ${n} cards: ${ELEMENT_ASK[missing[0]][1]}`);
  if (majors >= 2 && majors >= Math.ceil(n / 2)) {
    whole.push(`${who(whichCards(entries, (e) => isMajorCard(e.card)))} are Major Arcana: what larger lesson is this chapter teaching?`);
  }
  if (revs && revs >= Math.ceil(n / 2)) {
    whole.push(`${who(whichCards(entries, (e) => e.reversed))} ${revs > 1 ? "are" : "is"} reversed: what is still forming, and needs time rather than pressure?`);
  }
  // Two figures facing each other.
  const nameOf = (i) => (lens ? placeName(lens, i, entries[i]) : entries[i].label || "");
  const f = entries.map(facingOf);
  const meet = f.findIndex((d, i) => d === "right" && f[i + 1] === "left");
  if (meet >= 0 && nameOf(meet) && nameOf(meet + 1)) whole.push(`What are ${nameOf(meet)} and ${nameOf(meet + 1)} saying to each other?`.replace(/ The /g, " the "));

  // As many questions for the reading as it has cards (each card asks one too).
  const asked = [...new Set(whole)].slice(0, n);
  const used = new Set(asked);
  // Each card's question: the one that speaks most to the other cards
  // (their keywords, key ideas and how they read) and to this card's own
  // connecting ideas. Ties keep the card's own order.
  const rich = entries.map((e) => {
    const { ideas, nuances } = ideasFor(e.card, e.reversed);
    const { g, a, c } = phrases(e.card, e.reversed);
    return new Set([...filled(keywordsFor(e.card, e.reversed)), ...ideas, ...nuances, g, a, c].flatMap(themesOf));
  });
  const each = entries.map((e, i) => {
    const mine = new Set(linked[i].flatMap(themesOf));
    const scored = filled(questionsFor(e.card, e.reversed)).filter((x) => !used.has(x)).map((x, k) => {
      const ts = themesOf(x);
      const score = ts.reduce((s, t) => s + rich.filter((r, j) => j !== i && r.has(t)).length + (mine.has(t) ? 1 : 0), 0);
      return { x, score, k };
    }).sort((p, q) => q.score - p.score || p.k - q.k);
    let q = scored.length ? scored[0].x : "";
    // Out of questions: ask how to follow the card's advice.
    if (!q) { const a = (e.card.inReading || {})[e.reversed ? "reversedAdvice" : "advice"]; q = a ? `What would it look like to ${a}?` : ""; }
    if (!q || used.has(q)) return null;
    used.add(q);
    return { head: lens ? placeName(lens, i, e) : e.label || e.card.name, text: q };
  }).filter(Boolean);
  return { whole: asked, each };
}
// The questions, in two boxes: the reading's own, and one from each card.
function fillSummaryAsks(wholeBox, eachBox, entries, lens) {
  if (entries.length === 1) {
    // One card: its own questions, in one box.
    const e = entries[0];
    const qs = filled(questionsFor(e.card, e.reversed)).slice(0, 3);
    wholeBox.innerHTML = "";
    wholeBox.hidden = !qs.length;
    const ul = el("ul");
    qs.forEach((q) => ul.append(el("li", "", q)));
    wholeBox.append(el("p", "asks-title", "The card asks"), ul);
    eachBox.innerHTML = "";
    eachBox.hidden = true;
    return;
  }
  const { whole, each } = summaryQuestions(entries, lens);
  wholeBox.innerHTML = "";
  wholeBox.hidden = !whole.length;
  wholeBox.append(el("p", "asks-title", "The reading asks"));
  const ul = el("ul");
  whole.forEach((q) => ul.append(el("li", "", q)));
  wholeBox.append(ul);
  eachBox.innerHTML = "";
  eachBox.hidden = !each.length;
  if (!each.length) return;
  eachBox.append(el("p", "asks-title", "Each card asks"));
  const ul2 = el("ul", "asks-each");
  each.forEach(({ head, text }) => {
    const li = el("li");
    li.append(el("strong", "", head), el("span", "", text));
    ul2.append(li);
  });
  eachBox.append(ul2);
}

// Buttons that belong together stay one line each, all at the same size:
// the text shrinks together until the longest one fits.
// keepHeight: the line keeps its full height while its text shrinks, so the box around it doesn't move.
function fitOneLine(buttons, keepHeight = false) {
  const fit = () => {
    if (!buttons[0] || !buttons[0].isConnected) return;
    buttons.forEach((b) => { b.style.fontSize = ""; if (keepHeight) b.style.height = b.style.lineHeight = ""; });
    const heights = keepHeight ? buttons.map((b) => b.getBoundingClientRect().height) : [];
    const base = parseFloat(getComputedStyle(buttons[0]).fontSize);
    let k = 1;
    buttons.forEach((b) => {
      const cs = getComputedStyle(b);
      const room = b.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const need = b.scrollWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (need > room && room > 0) k = Math.min(k, room / need);
    });
    if (k < 1) buttons.forEach((b, i) => {
      b.style.fontSize = `${Math.max(10, Math.floor(base * k * 0.98 * 2) / 2)}px`;
      if (keepHeight) b.style.height = b.style.lineHeight = `${heights[i]}px`;
    });
  };
  requestAnimationFrame(fit);
  document.fonts?.ready.then(fit);
  const ro = new ResizeObserver(fit);
  ro.observe(buttons[0]);
}

// A pattern found in certain cards can be tapped to light them up.
function threadable(node, cards, head) {
  if (!cards || !cards.length) return;
  node.dataset.cards = cards.join(",");
  node.dataset.head = head || "";
  node.tabIndex = 0;
  node.setAttribute("role", "button");
  node.setAttribute("aria-pressed", "false");
}

function listItems(items) {
  const ul = el("ul");
  items.forEach(({ head, text, ideas, sub, cards }) => {
    const li = el("li");
    threadable(li, cards, head);
    if (head) li.append(el("strong", "", head));
    if (text) li.append(el("span", "", text));
    // ideas: the card's key ideas that connect to the rest of the reading
    if (ideas && ideas.length) li.append(el("span", "summary-ideas", ideas.join("\n")));
    if (sub) li.append(el("em", "summary-q", sub));
    ul.append(li);
  });
  return ul;
}

function listSection(title, items) {
  const sec = el("section", "summary-part");
  sec.append(el("p", "asks-title", title), listItems(items));
  return sec;
}

// A section from part(): small tiles in a grid (one per card, lined up
// like the row of cards, when perCard), or plain list lines.
function partSection(p, cardCols) {
  if (!p.tiles) return listSection(p.title, p.items);
  const sec = el("section", "summary-part tile-part");
  sec.append(el("p", "asks-title", p.title));
  // Per card: one column per card, like the row of cards. Otherwise tiles
  // share the full width in balanced rows (1, 2, 3 across; 4 → 2 + 2,
  // 5 → 3 + 2); a fixed count (the four elements) sets its own columns.
  // wrap: a tile's lines may wrap (for longer pairs like card names).
  const grid = el("div", `tiles${p.perCard ? " per-card" : p.cols ? " wide" : ""}${p.wrap ? " wrap" : ""}`);
  const k = p.items.length;
  if (p.perCard) grid.style.setProperty("--cols", cardCols);
  else grid.style.setProperty("--per", p.cols || (k <= 3 ? k : Math.ceil(k / Math.ceil(k / 3))));
  p.items.forEach((t) => {
    const tile = el("div", `tile${t.tone ? ` ${t.tone}` : ""}`);
    if (t.top) tile.append(el("span", "tile-top", t.top));
    tile.append(el("span", "tile-main", t.n != null ? cap(String(t.main)) : t.main));
    // The count as pips, one for each card it is found in (a ring for none).
    if (t.n != null) {
      const pips = el("span", "tile-pips", t.n ? Array(t.n).fill("●").join("\u200b") : "○");
      pips.setAttribute("aria-label", `in ${t.n} card${t.n === 1 ? "" : "s"}`);
      tile.append(pips);
    }
    if (t.note) tile.append(el("span", "tile-note", t.note));
    threadable(tile, t.cards, [t.top, t.n, t.main].filter((x) => x != null && x !== "").join(" "));
    grid.append(tile);
  });
  sec.append(grid);
  if (p.legend) sec.append(el("p", "tile-legend", p.legend));
  if (p.list && p.list.length) sec.append(listItems(p.list));
  return sec;
}

// A golden thread through the lit cards of a row: a gentle arc from one
// card's centre to the next, drawn over the row in an SVG of its own.
const SVG_NS = "http://www.w3.org/2000/svg";
function drawThread(box, targets, lit, animate) {
  box.querySelectorAll(":scope > .thread-svg").forEach((s) => s.remove());
  if (lit.length < 2) return;
  const r = box.getBoundingClientRect();
  if (!r.width) return;
  const pts = lit.map((i) => {
    const b = targets[i].getBoundingClientRect();
    return [b.left - r.left + b.width / 2, b.top - r.top + b.height / 2];
  });
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let k = 1; k < pts.length; k++) {
    const [x0, y0] = pts[k - 1], [x1, y1] = pts[k];
    const lift = Math.max(8, Math.hypot(x1 - x0, y1 - y0) * 0.22);
    d += ` Q${(x0 + x1) / 2},${(y0 + y1) / 2 - lift} ${x1},${y1}`;
  }
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "thread-svg");
  svg.setAttribute("viewBox", `0 0 ${r.width} ${r.height}`);
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", d);
  svg.append(path);
  pts.forEach(([x, y]) => {
    const c = document.createElementNS(SVG_NS, "circle");
    c.setAttribute("cx", x);
    c.setAttribute("cy", y);
    c.setAttribute("r", 3.5);
    svg.append(c);
  });
  box.append(svg);
  if (animate && !calm) {
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
      { duration: 500 + 140 * pts.length, easing: "cubic-bezier(.4,0,.2,1)" });
    [...svg.querySelectorAll("circle")].forEach((c, k) => c.animate(
      [{ opacity: 0, transform: "scale(0)" }, { opacity: 1, transform: "scale(1)" }],
      { duration: 300, delay: k * 140, fill: "backwards", easing: "ease-out" }));
  }
}

// ── Ideas that connect ──────────────────────────────────
// For each card, the key ideas (of the side it fell on) that speak most to
// the other cards: an idea scores for each theme it shares with another
// card's keywords and ideas, and more when it names one of that card's
// keywords outright. The warm ideas win ties over the nuances. One card
// alone simply shows its first few ideas.
function connectedIdeas(entries, per = 2) {
  const linesOf = (e) => { const { ideas, nuances } = ideasFor(e.card, e.reversed); return { ideas, nuances }; };
  const profile = entries.map((e) => {
    const words = filled(keywordsFor(e.card, e.reversed)).map((w) => w.toLowerCase());
    const { ideas, nuances } = linesOf(e);
    const themes = {};
    [...words, ...ideas, ...nuances].flatMap(themesOf).forEach((t) => { themes[t] = (themes[t] || 0) + 1; });
    return { words, themes };
  });
  return entries.map((e, i) => {
    const { ideas, nuances } = linesOf(e);
    if (entries.length === 1) return ideas.slice(0, 3);
    const scored = [...ideas.map((x) => [x, 0.5]), ...nuances.map((x) => [x, 0])].map(([x, bonus], k) => {
      const low = x.toLowerCase(), mine = themesOf(x);
      const score = profile.reduce((sum, o, j) => j === i ? sum
        : sum + mine.reduce((s, t) => s + Math.min(o.themes[t] || 0, 2), 0)
              + o.words.filter((w) => w.length > 3 && low.includes(w)).length * 2, 0);
      return { x, score: score + (score ? bonus : 0), k };
    });
    const linked = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score || a.k - b.k);
    return (linked.length ? linked : scored).slice(0, per).map((s) => s.x);
  });
}

// entries: [{ card, reversed, label, question }]
// magic = arrive out of the light of the summon, instead of sliding up.
// named: { id, onRename } for a saved reading, so its name can be changed here too.
function openSummary(entries, title, magic = false, named = null) {
  const n = entries.length;
  const sheet = el("div", "sheet details");
  const bar = el("header", "bar");
  const back = el("button", "link", "‹ Back");
  const share = el("button", "link bar-end", "Share");
  share.setAttribute("aria-label", "Share this reading as a picture");
  share.addEventListener("click", () => shareReading(entries, title, named && loadHistory().find((r) => r.id === named.id)?.t));
  bar.append(back, el("span", "bar-title", "Reading summary"), share);

  // Two columns on a wide screen: the cards and the lens on the left,
  // the reading on the right. On a phone they stack.
  const body = el("div", "details-body two-col summary-page");
  const side = el("div", "col-side"), main = el("div", "col-main");
  body.append(side, main);
  if (named) {
    // The reading's name: tap to rename, as on the table and in the history.
    const h = el("h2", "summary-title");
    const b = el("button", "reading-title summary-name");
    const show = () => {
      b.replaceChildren(el("span", "reading-title-text", title), el("span", "rename-mark", "✎"));
      b.setAttribute("aria-label", `${title}. Tap to rename`);
    };
    show();
    b.addEventListener("click", () => renameInPlace(b, title, (name) => {
      if (!updateReading(named.id, { title: name })) return;
      title = name;
      show();
      named.onRename?.(name);
    }, nameIdeas(entries)));
    h.append(b);
    side.append(h);
  } else side.append(el("h2", "summary-title", title));

  // The cards, with the place each one holds in the chosen lens.
  const items = entries.map((e) => detailsItem(e.card, e.reversed, e.label, e.question || ""));
  // All the cards in view at once, never a sideways scroll: one row up
  // to five, then two (or more) even rows.
  const row = el("div", "summary-cards");
  const cardCols = n <= 5 ? n : Math.min(5, Math.ceil(n / 2));
  row.style.setProperty("--cols", cardCols);
  const placeLabels = entries.map((e, i) => {
    const b = el("button", "related-card");
    const lab = el("span", "related-label");
    const pic = el("div", "related-pic");
    const face = cardFace(e.card, true, e.reversed);
    face.style.height = "100%";
    pic.append(face);
    b.append(lab, pic, el("span", "related-name", e.card.name));
    const k = linkedKeyword(e, entries);
    if (k) b.append(el("span", "summary-kw", k));
    b.addEventListener("click", () => openDetails(items, i));
    row.append(b);
    return lab;
  });
  side.append(row);

  // Threads: tapping a pattern lights up the cards it is found in, joined
  // by a golden thread. When the row of cards has scrolled out of view (on
  // a phone), a slim strip of the cards rises at the bottom to show it.
  const cardEls = [...row.children];
  const strip = el("div", "thread-strip");
  strip.hidden = true;
  const stripHead = el("span", "thread-strip-head");
  const stripRow = el("div", "thread-strip-row");
  const stripClose = el("button", "thread-strip-close", "×");
  stripClose.setAttribute("aria-label", "Hide the thread");
  const minis = entries.map((e, i) => {
    const m = el("button", "thread-mini");
    m.setAttribute("aria-label", e.card.name);
    const face = cardFace(e.card, true, e.reversed);
    face.style.height = "100%";
    m.append(face);
    m.addEventListener("click", () => openDetails(items, i));
    stripRow.append(m);
    return m;
  });
  strip.append(stripHead, stripRow, stripClose);
  let thread = null;     // { li, cards, head }
  let rowInView = true;
  const showThread = (animate = false) => {
    if (thread && !thread.li.isConnected) thread = null;   // its section was redrawn
    const lit = thread ? thread.cards : [];
    [[row, cardEls], [stripRow, minis]].forEach(([box, list]) => {
      box.classList.toggle("threading", !!thread);
      list.forEach((c, i) => c.classList.toggle("lit", lit.includes(i)));
    });
    strip.hidden = !thread || rowInView;
    sheet.classList.toggle("has-strip", !strip.hidden);
    if (thread) stripHead.textContent = thread.head;
    drawThread(row, cardEls.map((c) => c.querySelector(".related-pic")), lit, animate);
    drawThread(stripRow, minis, strip.hidden ? [] : lit, animate);
  };
  const pickThread = (li) => {   // li: any tappable pattern, line or tile
    if (thread) { thread.li.classList.remove("on"); thread.li.setAttribute("aria-pressed", "false"); }
    if (!li || (thread && thread.li === li)) { thread = null; showThread(); return; }
    li.classList.add("on");
    li.setAttribute("aria-pressed", "true");
    thread = { li, cards: li.dataset.cards.split(",").map(Number), head: li.dataset.head };
    rowInView = rowShows();
    showThread(true);
  };
  main.addEventListener("click", (ev) => {
    const li = ev.target.closest("[data-cards]");
    if (li) pickThread(li);
  });
  main.addEventListener("keydown", (ev) => {
    const li = ev.target.closest("[data-cards]");
    if (li && (ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); pickThread(li); }
  });
  stripClose.addEventListener("click", () => pickThread(null));
  // Is most of the row of cards still on screen?
  const rowShows = () => {
    const r = row.getBoundingClientRect(), s = sheet.getBoundingClientRect();
    const seen = Math.min(r.bottom, s.bottom) - Math.max(r.top, s.top);
    return r.height > 0 && seen > r.height * 0.4;
  };
  let ticking = false;
  sheet.addEventListener("scroll", () => {
    if (ticking || !thread) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const now = rowShows();
      if (now !== rowInView) { rowInView = now; showThread(!now); }
    });
  }, { passive: true });
  new ResizeObserver(() => thread && showThread()).observe(row);

  // "Read it as": the spread as laid out, or any of the table's themes,
  // chosen in two steps (a topic, then one of its themes). The chosen one
  // is lit, and the parts that change with it follow.
  const laidOut = laidOutLens(entries);
  const lensBox = el("div", "lens");
  lensBox.setAttribute("role", "group");
  lensBox.setAttribute("aria-label", "Read it as");
  // The page's layout, top to bottom (side by side on a wide screen):
  //   left:  the reading (shared words right under its title, then the
  //          arc line, number arcs included), themes
  //   right: symbols, gaze, mirrors & tensions, elements
  //   below: the reading asks (left), each card asks (right)
  // Slots marked "lens" are refilled when the lens changes.
  const leftCol = el("div", "sum-col"), rightCol = el("div", "sum-col");
  const lensPart = el("div", "sum-slot");     // lens
  const gazeSlot = el("div", "sum-slot");     // lens
  const mirrorSlot = el("div", "sum-slot");   // lens
  const asks = el("div", "asks summary-asks");
  const asksEach = el("div", "asks summary-asks");
  const spreadArc = arcBits(entries);
  // The patterns that don't depend on the lens, by their titles.
  const patterns = {};
  patternParts(entries).parts.forEach((p) => (patterns[p.title] = p));
  // Shared words: their tiles alone (no title of their own), under the
  // reading's title. A fresh copy each time the reading is redrawn.
  const sharedTiles = () => patterns["Shared words"] && partSection(patterns["Shared words"], cardCols).querySelector(".tiles");
  // Each card's key ideas that relate most to the other cards, shown under
  // its line in "The reading".
  const linked = connectedIdeas(entries);
  let lens = laidOut;
  let topic = null;           // the topic whose themes are listed, or null for the topics
  let placeAsks = () => {};   // set once the columns are built (below)
  const render = () => {
    drawLensBox();
    // (One card: its place is already the lit lens button and the reading's heading.)
    entries.forEach((e, i) => { placeLabels[i].textContent = n === 1 ? "" : lens ? placeName(lens, i, e) : e.label || ""; });
    // The deeper patterns name the cards by their place, so they follow the lens.
    const nameOf = (i) => (lens ? placeName(lens, i, entries[i]) : entries[i].label || entries[i].card.name);
    const fill = (slot, p) => {
      slot.innerHTML = "";
      if (p && p.items.length) slot.append(partSection(p, cardCols));
    };
    // The arc line: where the spread travels, when it clearly does.
    const arc = spreadArc.length ? `${cap(spreadArc.join(", "))}.` : "";
    fill(gazeSlot, gazePart(entries, nameOf));
    fill(mirrorSlot, part("Mirrors & tensions", mirrorItems(entries, nameOf), { tiles: true, wrap: true }));
    fillSummaryAsks(asks, asksEach, entries, lens);
    lensPart.innerHTML = "";
    if (lens) {
      // One section: the arc of the whole spread on top, then each card in
      // its place.
      const sec = listSection("The reading", entries.map((e, i) => ({
        head: placeName(lens, i, e),
        // The place is already the heading, so drop the line's own "Ahead: " lead-in.
        text: (() => { const t = placeLine(e, lens.places[i], i, placeName(lens, i, e)).replace(/^[^:]+:\s*/, ""); return t.charAt(0).toUpperCase() + t.slice(1); })(),
        ideas: linked[i],
        sub: lens.own ? lens.questions[i] || "" : "",
        cards: [i],
      })));
      const title = sec.querySelector(".asks-title");
      if (arc) title.after(el("p", "summary-arc", arc));
      const sw = sharedTiles();
      if (sw) title.after(sw);
      lensPart.append(sec);
    } else {
      // No theme: each card by its name, with what it brings (and, reversed,
      // its advice) and its connecting ideas.
      const sec = el("section", "summary-part");
      sec.append(el("p", "asks-title", "The reading"));
      const sw = sharedTiles();
      if (sw) sec.append(sw);
      if (arc) sec.append(el("p", "summary-arc", arc));
      sec.append(listItems(entries.map((e, i) => {
        const { g, a } = phrases(e.card, e.reversed);
        return { head: e.card.name, text: `${cap(g)}${e.reversed ? `; ${a}` : ""}.`, ideas: linked[i], cards: [i] };
      })));
      lensPart.append(sec);
    }
    showThread();
    placeAsks();
  };
  function drawLensBox() {
    lensBox.innerHTML = "";
    const btn = (text, on, go, cls = "lens-btn") => {
      const b = el("button", cls, text);
      if (on !== null) { b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); }
      b.addEventListener("click", go);
      return b;
    };
    const pick = (l) => () => { lens = l; render(); };
    if (laidOut) lensBox.append(btn("As laid out", lens === laidOut, pick(laidOut)));
    else lensBox.append(btn("No theme", !lens, pick(null)));
    if (!topic) {
      // The topics, as small tiles; the one holding the chosen theme is marked.
      const grid = el("div", "lens-topics");
      Object.keys(THEME_TOPICS).filter((t) => THEMES_LIST.some((th) => th.topic === t)).forEach((t) => {
        const b = btn(t, lens && lens.theme ? lens.theme.topic === t : false, () => { topic = t; drawLensBox(); }, "lens-btn lens-topic");
        grid.append(b);
      });
      lensBox.append(grid);
    } else {
      lensBox.append(btn(`‹ ${topic}`, null, () => { topic = null; drawLensBox(); }, "lens-back"));
      const themes = THEMES_LIST.filter((th) => th.topic === topic);
      themes.forEach((th) => lensBox.append(btn(th.name, !!(lens && lens.theme === th), pick(themeLens(th, n)))));
    }
    fitOneLine([...lensBox.querySelectorAll(".lens-btn:not(.lens-topic)")]);
  }
  side.append(el("p", "lens-title", "Read it as"), lensBox);
  render();

  const sectionOf = (title) => patterns[title] && partSection(patterns[title], cardCols);
  const put = (col, ...xs) => xs.forEach((x) => x && col.append(x));
  put(leftCol, lensPart, sectionOf("Themes"));
  put(rightCol, sectionOf("Symbols"), gazeSlot, mirrorSlot, sectionOf("Elements"));
  const asksRow = el("div", "sum-asks");
  asksRow.append(asks, asksEach);
  main.append(leftCol, rightCol, asksRow);
  if (named) main.append(reflectionPart(named.id));
  // LAYOUT RULE: no empty space under the shorter column on a wide screen.
  // Each question box closes its own column (the reading's on the left,
  // each card's on the right) and stretches down to meet the other column;
  // a lone box goes under a clearly shorter column, else full width below.
  // On a phone they stay below.
  const wide = matchMedia("(min-width: 1340px)");
  placeAsks = () => {
    asksRow.append(asks, asksEach);
    if (!wide.matches) return;
    const shown = [asks, asksEach].filter((b) => !b.hidden);
    if (shown.length === 2) { leftCol.append(asks); rightCol.append(asksEach); }
    else if (shown.length === 1) {
      // (The columns stretch to the same height, so measure what's in them.)
      const filled = (col) => Math.max(0, ...[...col.children].map((c) => c.getBoundingClientRect().bottom));
      // Columns already near level: the box stays full width below them.
      const l = filled(leftCol), r = filled(rightCol);
      if (Math.abs(l - r) > 120) (l < r ? leftCol : rightCol).append(shown[0]);
    }
  };
  wide.addEventListener("change", placeAsks);

  // Long press (phone) or right click (computer) anywhere on the page
  // copies the cards' names: "1: Six of Cups 2: Five of Swords …".
  const copyNames = () => copyText(
    entries.map((e, i) => `${i + 1}: ${e.card.name}`).join(" "),
    n === 1 ? "Card name copied" : "Card names copied"
  );
  onLongPress(sheet, copyNames);

  sheet.append(bar, body, strip);
  document.body.append(sheet);
  placeAsks();   // again, now that the columns can be measured
  // ("later": built ahead, out of sight; the portal calls sheet.appear() as its window opens.)
  if (magic === "later") sheet.appear = () => appearWithMagic(sheet, body);
  else if (magic && !calm) appearWithMagic(sheet, body);
  else slideIn(sheet);
  back.addEventListener("click", async () => {
    // Opened through the circle, it goes back into the light the same way.
    await (magic && !calm ? vanishWithMagic(sheet) : slideOut(sheet));
    sheet.remove();
  });
  return sheet;
}

// Right click, or a long press on a touch screen, on el (but not in a text
// box). The copy runs when the finger lifts, since phones only let a page
// write to the clipboard right after a touch ends.
function onLongPress(el, fn, hold = 500) {
  let start = null, last = 0;
  const run = () => { if (Date.now() - last > 800) { last = Date.now(); fn(); } };
  const typing = (t) => t.closest && t.closest("input, textarea, [contenteditable]");
  el.addEventListener("contextmenu", (ev) => {
    if (typing(ev.target)) return;
    ev.preventDefault();
    // A touch's own long press is handled when the finger lifts.
    if (!start) run();
  });
  el.addEventListener("touchstart", (ev) => {
    if (ev.touches.length !== 1 || typing(ev.target)) { start = null; return; }
    const t = ev.touches[0];
    start = { x: t.clientX, y: t.clientY, at: Date.now() };
  }, { passive: true });
  el.addEventListener("touchmove", (ev) => {
    if (!start) return;
    const t = ev.touches[0];
    if (Math.hypot(t.clientX - start.x, t.clientY - start.y) > 10) start = null;
  }, { passive: true });
  el.addEventListener("touchcancel", () => { start = null; });
  el.addEventListener("touchend", (ev) => {
    const s = start;
    start = null;
    if (!s || Date.now() - s.at < hold) return;
    ev.preventDefault();   // no click on whatever was held
    run();
  });
}

// Put text on the clipboard and say so in a short note at the bottom.
async function copyText(text, note = "Copied") {
  let ok = false;
  try { await navigator.clipboard.writeText(text); ok = true; } catch {
    const ta = el("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;opacity:0;top:0;left:0";
    document.body.append(ta);
    ta.select();
    try { ok = document.execCommand("copy"); } catch {}
    ta.remove();
  }
  const t = el("div", "copy-note", ok ? note : "Couldn't copy");
  t.style.zIndex = ++Z + 10;
  document.body.append(t);
  setTimeout(() => t.classList.add("gone"), 1400);
  setTimeout(() => t.remove(), 1800);
}

// The summary page arriving through the arcane portal: the page itself is
// revealed by the widening window, while its parts brighten out of the
// light and rise into place one after another.
function appearWithMagic(sheet, body) {
  sheet.hidden = false;
  sheet.style.zIndex = ++Z;
  sheet.scrollTop = 0;
  sheet.animate(
    [{ filter: "brightness(1.7)" }, { filter: "brightness(1)" }],
    { duration: 900 / portalPace, easing: "cubic-bezier(.2,.8,.2,1)" }
  );
  // (The cards fly in on their own, out of the portal: see emergeCards.)
  [...body.querySelectorAll(".col-side > :not(.summary-cards), .sum-col > *, .sum-asks > *")].forEach((part, i) => part.animate(
    [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }],
    { duration: 520 / portalPace, delay: (200 + Math.min(i, 10) * 55) / portalPace, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" }
  ));
}

// Back to the table, quickly (about half a second), the portal in reverse:
// a ring of gold runes closes in from the edges of the screen, turning, and
// the summary shrinks inside it like a closing iris. The ring settles on
// the great circle behind the spread as the page vanishes, then flares and
// breaks into motes that fly back to the cards, which light up as they land.
// Resolves once the page is gone; the light finishes on its own after.
// (Timers, not the animations' ends, so a paused page never waits.)
function vanishWithMagic(sheet) {
  const G = MG.great;
  const C = G ? { x: G.cx, y: G.cy } : { x: innerWidth / 2, y: innerHeight * 0.46 };
  const R = G ? G.R1 : Math.round(Math.min(innerWidth, innerHeight) * 0.25);
  const cards = S && !$("table").hidden ? S.slots.map((s) => s.tcard).filter((c) => c?.isConnected) : [];
  // As the ring flares, motes break from it and fly back to the cards.
  return irisInto(sheet, C, R, () => {
    const goals = cards.length ? cards.map((c) => ({ ...ringAround(c), card: c }))
      : Array.from({ length: 8 }, (_, k) => ({   // no cards: they just scatter outward
        x: C.x + Math.cos(k * Math.PI / 4) * R * 1.8, y: C.y + Math.sin(k * Math.PI / 4) * R * 1.8 }));
    goals.forEach((g, i) => {
      const a = Math.atan2(g.y - C.y, g.x - C.x);
      for (let m = 0; m < 3; m++) {
        const mote = el("span", "theme-mote");
        const sx = C.x + Math.cos(a + (m - 1) * 0.25) * R, sy = C.y + Math.sin(a + (m - 1) * 0.25) * R;
        Object.assign(mote.style, { left: `${sx}px`, top: `${sy}px`, zIndex: Z + 1 });
        document.body.append(mote);
        const ms = 240 + m * 40, wait = Math.min(i, 9) * 18;
        mote.animate([
          { transform: "translate(0, 0) scale(1.4)", opacity: 1 },
          { transform: `translate(${g.x - sx}px, ${g.y - sy}px) scale(.5)`, opacity: 0.2 },
        ], { duration: ms, delay: wait, easing: "cubic-bezier(.5, 0, .2, 1)", fill: "backwards" });
        setTimeout(() => mote.remove(), ms + wait + 20);
      }
      cardFlare(g.card?.querySelector(".cface"), 200 + Math.min(i, 9) * 18);
    });
  });
}

// Before the summary opens: the cards' light converges in the middle of
// the screen, the arcane circle spins up there, and the summary appears
// through it (arcanePortal, below).
// The first time a reading's summary opens, the portal plays in full; after
// that, for that same reading, it plays three times as fast. `key` names the
// reading (its id in the history, or the reading itself before it's saved).
// portalPace is read by arcanePortal, emergeCards and appearWithMagic.
let summoning = false, portalPace = 1;
const portalSeen = new Set();
function summonSummary(open, key = null) {
  if (calm) { open(false); return; }
  if (summoning) return;   // already on its way
  summoning = true;
  portalPace = key != null && portalSeen.has(key) ? 3 : 1;
  if (key != null) portalSeen.add(key);
  // The turned cards on the table; from the History there are none on screen.
  const onTable = S && !$("table").hidden;
  const points = onTable ? S.slots.map((s, i) => {
    const g = cardGeom(i);
    return { x: g.x, y: g.y, w: g.rx * 2, h: g.ry * 2, el: s.tcard };
  }) : [];
  // The page is built now, before the light starts, and kept out of sight
  // until the window opens: built mid-flight, it froze the portal for a
  // moment. Its card pictures start decoding now too, so they're ready.
  const sheet = open("later");
  sheet.style.visibility = "hidden";
  sheet.querySelectorAll("img").forEach((img) => img.decode?.().catch(() => {}));
  const total = arcanePortal(points, () => {
    sheet.style.visibility = "";
    sheet.appear?.();
    return sheet;
  });
  setTimeout(() => { summoning = false; }, total);
}
