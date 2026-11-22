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
  change:     ["Change", "transitions", "What is ready to change, and what is it making room for?"],
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

// Each number's lesson (see NUMBER_LESSONS in js/card-pages.js).
const NUMBER_TEXT = {
  1: "potential", 2: "balance", 3: "connection", 4: "a pause", 5: "struggle",
  6: "rebalancing, giving", 7: "choices", 8: "rebalancing yourself", 9: "the inner self", 10: "a cycle completed",
};

const RANK_TEXT = { Page: "curiosity", Knight: "on the move", Queen: "growing it slowly", King: "planning, deciding" };

// What each planet and sign stands for, for the Symbols tips.
const STAR_TEXT = {
  Sun: "your energy and sense of self", Moon: "feelings and instinct", Mercury: "thinking and talk",
  Venus: "love and beauty", Mars: "drive and action", Jupiter: "luck and growth",
  Saturn: "rules and hard lessons", Uranus: "sudden change", Neptune: "dreams and longing", Pluto: "deep change",
  Aries: "boldness and beginnings", Taurus: "steadiness and the senses", Gemini: "curiosity and talk",
  Cancer: "home and care", Leo: "heart and self-expression", Virgo: "care in the details",
  Libra: "balance and fairness", Scorpio: "depth and transformation", Sagittarius: "adventure and meaning",
  Capricorn: "ambition and discipline", Aquarius: "ideas and independence", Pisces: "dreams and compassion",
};

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

// What a theme's question asks for, so the card can answer it with the
// matching side of its meaning (cards.js inReading). First match wins.
const ASKS_FOR = [
  ["feeling",   /\bfeel|feeling|emotion|heart|body|grief|anger|mood/i],
  ["challenge", /\bfear|worr|block|hold(s|ing)? me back|grip|cost|avoid|obstacle|challenge|stuck|protect/i],
  ["action",    /\bstep|what can i do|how can i|act\b|action|meet (it|that)|release|let it move|practice|begin/i],
  ["advice",    /\bhelp|support|advice|guid|trust|courage|need from me|what would/i],
  ["you",       /\bwho am i|part of me|myself|my self|strength|gift|worth|value/i],
];
const ANSWER = {
  feeling:   (x) => `Beneath the surface, you may be feeling ${x}.`,
  challenge: (x) => `What asks you to grow here: ${x}.`,
  action:    (x) => `A way in: ${x}.`,
  advice:    (x) => `What helps: ${x}.`,
  you:       (x) => `It speaks to ${x}.`,
};

const lower1 = (s) => s.charAt(0).toLowerCase() + s.slice(1);

// One card read in its themed place, for a one-card reading's page: the
// place's question answered by the card, then what the card brings, then
// its advice. { title, text }, or null when the card has no theme place.
function themedReading(item, title) {
  if (!item.label || item.label === "Your card") return null;
  const r = item.card.inReading || {}, rev = item.reversed;
  const { g, a } = phrases(item.card, rev);
  const side = {
    feeling: rev ? r.reversedFeeling : r.feeling,
    challenge: r.challenge,
    action: rev ? r.reversedAction : r.action,
    advice: a,
    you: rev ? r.reversedYou : r.you,
  };
  const ask = `${item.label} ${item.question || ""}`;
  const hit = ASKS_FOR.find(([k, re]) => re.test(ask) && (side[k] || "").trim());
  const out = [];
  // (No matching side: the card read as the place itself, "As the worry, …")
  const place = /^(the|a|an|its|my|your)\b/i.test(item.label) ? lower1(item.label) : item.label;
  if (hit) out.push(ANSWER[hit[0]](side[hit[0]].trim()), `The ${item.card.name} sees it as ${g}.`);
  else out.push(`As ${place}, the ${item.card.name} brings ${g}.`);
  if (!hit || hit[0] !== "advice") out.push(`Let it guide you: ${a}.`);
  return { title: title || "The reading", text: out.join(" ") };
}

const placeName = (lens, i, entry) => (lens.own ? (lens.labels ? lens.labels[i] : entry.label) : PLACES[lens.places[i]][0]);

const numberOf = (card) => (card.court ? null : +((card.correspondences || {}).number || NaN));

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
  // The cards a tile is found in, by name: "Death, the Two of Cups and The Sun".
  const namesOf = (idx) => {
    const a = idx.map((i) => { const c = entries[i].card; return isMajorCard(c) ? c.name : `the ${c.name}`; });
    return a.length < 2 ? a.join("") : `${a.slice(0, -1).join(", ")} and ${a.at(-1)}`;
  };
  const picTiles = syms.map((x) => {
    const cards = whichCards(entries, (e, i) => pics[i].has(x));
    return {
      n: symCount[x], main: SYMBOLS[x].name, note: SYMBOLS[x].meaning, cards,
      tip: [(typeof SYMBOL_TIPS !== "undefined" && SYMBOL_TIPS[x]) || "", `In ${namesOf(cards)}.`].filter(Boolean).join(" "),
    };
  });

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
  // Each with a tip: what it means, and where it shows in these cards.
  if (majors >= 2 && majors >= Math.ceil(n / 2)) sym.push({ n: majors, main: "Major", note: "life lessons", cards: majorCards,
    tip: `The Major Arcana are the big lessons of a life. With ${namesOf(majorCards)} here, this is a chapter for you, not a passing day.` });
  else if (!majors && n >= 3) sym.push({ n: 0, main: "Major", note: "everyday matters", tone: "quiet",
    tip: "No Major Arcana: this is about your day-to-day, and much of it is in your hands." });
  const nums = tally(entries.map((e) => { const x = numberOf(e.card); return x >= 1 && x <= 10 ? [x] : []; }));
  top(nums, 3).forEach((k) => {
    const cards = whichCards(entries, (e) => numberOf(e.card) === +k);
    // How each suit shows the number's lesson (NUMBER_LESSONS, js/card-pages.js).
    const how = cards.map((i) => {
      const c = entries[i].card, s = (NUMBER_LESSONS[k] || [])[2]?.[suitName(c)];
      return s ? `in the ${c.name}, ${s}` : "";
    }).filter(Boolean);
    const lead = `${cap(NUMBER_WORDS[k])} are ${NUMBER_TEXT[k]}`;
    sym.push({ n: nums[k], main: NUMBER_WORDS[k], note: NUMBER_TEXT[k], cards,
      tip: how.length ? `${lead}: ${how.join("; ")}.` : `${lead}. In ${namesOf(cards)}.` });
  });
  const ranks = tally(entries.map((e) => (e.card.court ? [rankOf(e.card)] : [])));
  top(ranks, 4).forEach((r) => {
    const cards = whichCards(entries, (e) => e.card.court && rankOf(e.card) === r);
    sym.push({ n: ranks[r], main: `${r}s`, note: RANK_TEXT[r], cards,
      tip: `${RANK_LESSONS[r] || `The ${r}`}, here as ${namesOf(cards)}.` });
  });
  const stars = tally(entries.map((e) => starsOf(e.card)));
  top(stars, 3).forEach((s) => {
    const cards = whichCards(entries, (e) => starsOf(e.card).includes(s));
    const what = STAR_TEXT[s];
    sym.push({ n: stars[s], main: s, note: "astrology", cards,
      tip: `${s}${what ? ` stands for ${what}` : ""}. It touches ${namesOf(cards)}.` });
  });
  const revCards = whichCards(entries, (e) => e.reversed);
  const revs = revCards.length;
  if (revs && revs >= Math.ceil(n / 2)) sym.push({ n: revs, main: "reversed", note: "still forming", cards: revCards,
    tip: `Reversed cards are energy still forming, or turned inward. With ${namesOf(revCards)} reversed, much of this is still taking shape.` });
  // Symbols: what's in the pictures and the cards' symbolism, as one set of
  // tiles, the most shared first (the sort keeps ties in order), at most 3 rows.
  const symbols = [...picTiles, ...sym].sort((a, b) => b.n - a.n).slice(0, 9);
  // Below the tiles, each one's meaning in full (the same words as its tip).
  const symList = symbols.filter((t) => t.tip).map((t) => ({ place: "", head: t.main, tag: t.note, text: t.tip, cards: t.cards }));
  if (symbols.length) parts.push(part("Symbols", symbols, { tiles: true, list: symList, fold: 3 }));
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

// What the eyes rest on (symbols.js): you, a blindfold, a hidden face,
// closed eyes, or a thing held. Each with its glyph and a brief meaning.
// The third of each is what that gaze means, shown on hover (or a tap).
const EYE_MARK = {
  you:    ["◉", "at you", "The figure looks straight at you: this card speaks to you directly. Meet its eye."],
  blind:  ["⊘", "unseeing", "Blindfolded: you can't see the whole picture yet. Trust what you sense within."],
  hidden: ["◌", "hiding", "The face is hidden: something feels too much to look at yet. You can look when you're ready."],
  closed: ["◡", "within", "Eyes closed: rest. What you need now is found within."],
};
// [what the eyes rest on, what that means]
function eyesOf(e) {
  const y = (typeof EYES !== "undefined" && EYES[e.card.name]) || "";
  return Array.isArray(y) ? y : [y, ""];
}
// What the way a figure looks means, by where it sits in the row.
const WAY_WHY = {
  back:   "It looks back toward the card before: what came before still holds your attention.",
  past:   "It looks back, out of the reading: part of you is still with the past.",
  next:   "It looks ahead toward the next card: you're moving toward what comes next.",
  future: "It looks ahead, out of the reading: your attention is on the future.",
  away:   "It is turned away from you: you're looking out over your own world, or leaving something behind.",
};

function gazePart(entries, nameOf) {
  const n = entries.length;
  const f = entries.map(facingOf);
  const seen = entries.map(eyesOf);
  const eyes = seen.map((y) => y[0]);
  if (n < 2 || !f.some(Boolean) && !eyes.some(Boolean)) return null;
  const tiles = f.map((d, i) => {
    const [y, yWhy] = seen[i], mark = EYE_MARK[y];
    const arrow = { left: "←", right: "→", back: "↑" }[d];
    // Where the figure looks, as a brief meaning.
    const w = d === "left" ? (i ? "back" : "past")
      : d === "right" ? (i < n - 1 ? "next" : "future")
      : d === "back" ? "away" : "";
    const way = { back: "what came", past: "the past", next: "what's next", future: "the future", away: "away" }[w] || "";
    return {
      top: nameOf(i),
      main: arrow || (mark ? mark[0] : y ? "↓" : "·"),
      note: mark ? mark[1] : y || way,
      tip: [mark ? mark[2] : yWhy, WAY_WHY[w]].filter(Boolean).join(" "),
      tone: d || y ? "" : "quiet",
      cards: d === "left" && i ? [i - 1, i] : d === "right" && i < n - 1 ? [i, i + 1] : [i],
    };
  });
  const list = [];
  const lefts = whichCards(entries, (e, i) => f[i] === "left");
  const rights = whichCards(entries, (e, i) => f[i] === "right");
  // Each line is stacked (place, in listItems): the place and the card's
  // own name on one clear heading line, the meaning below at full width.
  const cardName = (i) => entries[i].card.name;
  if (n >= 3 && lefts.length >= Math.ceil(n * 0.6)) list.push({ place: "", head: "Most look back", text: "The past holds the attention.", cards: lefts });
  else if (n >= 3 && rights.length >= Math.ceil(n * 0.6)) list.push({ place: "", head: "Most look ahead", text: "The reading leans forward.", cards: rights });
  // Each card's gaze, with what it means (the same words as its tile's tip).
  tiles.forEach((t, i) => {
    if (!t.tip) return;
    list.push({ place: t.top, head: cardName(i), tag: `${t.main} ${t.note}`.trim(), text: t.tip, cards: t.cards });
  });
  for (let i = 0; i < n - 1; i++) {
    const place = `${nameOf(i)} & ${nameOf(i + 1)}`, both = `${cardName(i)} and ${cardName(i + 1)}`;
    if (f[i] === "right" && f[i + 1] === "left") list.push({ place, head: "Face to face", tag: "→ ←", text: `${both} look at each other: read them together.`, cards: [i, i + 1] });
    if (f[i] === "left" && f[i + 1] === "right") list.push({ place, head: "Back to back", tag: "← →", text: `${both} look away from each other: not yet speaking.`, cards: [i, i + 1] });
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

// What the reading asks: one short list, the questions that belong most to
// this spread, drawn from the spread as a whole and from the cards' own
// questions alike. Each is one plain sentence (no quotes); the spread's own
// never name cards (the row of cards above shows them) but weave in the
// cards' ideas and advice, or count the cards that raised them.
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
  const kw = (e) => (filled(keywordsFor(e.card, e.reversed))[0] || "").toLowerCase();
  // Every question is one plain sentence, with how strongly it belongs to
  // this spread (how many cards stand behind it).
  const whole = [];
  // idx: the cards that raised it, shown above the question as a meter of
  // how strongly it runs through the spread (1 to 5 pips), in place of "3 of the 5 cards".
  const ask = (q, score, idx) => whole.push({ q, score, idx });

  // The two cards most strongly linked, and the question their shared tag
  // raises: "Imagination and choice: what choice are you circling…?"
  const linked = connectedIdeas(entries, 3);
  let bridge = null;
  connectedIdeas(entries, 3, true).forEach((xs, i) => xs.forEach((l) => {
    if (l.tag && (!bridge || l.score > bridge.score)) bridge = { i, j: l.with, tag: l.tag, score: l.score };
  }));
  if (bridge) {
    const { i, j, tag } = bridge;
    // Each card's own keyword for what they share. When both cards have
    // one (and they differ), they lead: "Imagination and choice: …".
    // Otherwise the shared idea leads ("Choosing: …"), with pips for the
    // cards that speak of it.
    const word = (e) => (filled(keywordsFor(e.card, e.reversed)).find((k) => linkTagsOf(k).includes(tag)) || "").toLowerCase();
    const [w1, w2] = [word(entries[i]), word(entries[j])];
    const idx = whichCards(entries, (e) => {
      const { ideas, nuances } = ideasFor(e.card, e.reversed);
      return [...filled(keywordsFor(e.card, e.reversed)), ...ideas, ...nuances].some((x) => linkTagsOf(x).includes(tag));
    });
    const q = w1 && w2 && w1 !== w2
      ? `${cap(w1)} and ${w2}: ${lower(LINK_TEXT[tag][1])}`
      : `${cap(LINK_TEXT[tag][0])}: ${lower(LINK_TEXT[tag][1])}`;
    ask(q, 10, idx);
    bridge.themes = themesOf(q);
  }

  // The lens's challenge and advice, in the card's own words.
  const placeAt = (p) => (lens ? lens.places.indexOf(p) : -1);
  const ci = placeAt("challenge"), ai = placeAt("advice");
  if (ci >= 0) ask(`Where is ${phrases(entries[ci].card, entries[ci].reversed).c} asking the most of you right now?`, 8, [ci]);
  if (ai >= 0) {
    ask(`What would it look like this week to ${phrases(entries[ai].card, entries[ai].reversed).a}?`, 8, [ai]);
  } else if (n >= 2) {
    // No advice place: the first and last cards' advice, side by side.
    const [a1, a2] = [entries[0], entries[n - 1]].map((e) => (e.card.inReading || {})[e.reversed ? "reversedAdvice" : "advice"] || (e.card.inReading || {}).advice);
    // Short advice reads as a real either/or; long advice would bury it,
    // so the cards' key words stand in.
    // A hard key word ("self-doubt", "delays") is no path to choose.
    const hard = (k) => linkTagsOf(k).some((t) => HARD_TAGS.includes(t)) || themesOf(k).includes("shadow")
      || /delay|setback|obstacle|unfinished|restless|hesitat/.test(k);
    const short = (x) => x && x.split(/\s+/).length <= 7 && !/[;,]/.test(x.replace(/[.;\s]+$/, ""));
    if (a1 && a2 && a1 !== a2) {
      if (short(a1) && short(a2)) ask(`Is it time to ${a1.replace(/[.;\s]+$/, '')}, or to ${a2.replace(/[.;\s]+$/, '')}?`, 6, [0, n - 1]);
      else if (kw(entries[0]) && kw(entries[n - 1]) && kw(entries[0]) !== kw(entries[n - 1]) && !hard(kw(entries[0])) && !hard(kw(entries[n - 1]))) ask(`Is it time for ${kw(entries[0])}, or for ${kw(entries[n - 1])}?`, 6, [0, n - 1]);
    }
  }

  themes.slice(0, 3).forEach((t) => {
    if (bridge && bridge.themes.includes(t)) return;   // already asked, by the two linked cards
    const idx = whichCards(entries, (e, i) => sets[i].has(t));
    const what = t === "heart" ? "the heart" : THEME_TEXT[t][0].toLowerCase();
    if (idx.length < n || n <= 3) ask(`${cap(what)}: ${lower(THEME_TEXT[t][2])}`, idx.length * 2 + (idx.length === n ? 1 : 0), idx);
  });
  const t = tensionsOf(entries)[0];
  if (t) ask(cap(t.ask), 5, t.cards);
  if (n >= 3) {
    // By the first and last cards' key words ("How could conflict lead to teamwork?").
    const [f0, fN] = [kw(entries[0]), kw(entries[n - 1])];
    if (f0 && fN && f0 !== fN) ask(`How could ${f0} lead to ${fN}?`, 4, [0, n - 1]);
  }
  if (topEl && els[topEl] >= 2) {
    const idx = whichCards(entries, (e) => elementFor(e.card) === topEl);
    ask(`${topEl}: ${ELEMENT_ASK[topEl][0]}`, idx.length * 1.5, idx);
  }
  const missing = Object.keys(ELEMENT_ASK).filter((x) => !els[x]);
  if (n >= 4 && missing.length === 1) ask(`No ${missing[0]}: ${ELEMENT_ASK[missing[0]][1]}`, 3, entries.map((_, i) => i));   // every card lacks it
  if (majors >= 2 && majors >= Math.ceil(n / 2)) {
    ask("Major Arcana: what larger lesson is this chapter teaching?", majors * 1.5, whichCards(entries, (e) => isMajorCard(e.card)));
  }
  if (revs && revs >= Math.ceil(n / 2)) {
    ask("Reversed: what is still forming, and needs time rather than pressure?", revs * 1.5, whichCards(entries, (e) => e.reversed));
  }
  // Two figures facing each other.
  const nameOf = (i) => (lens ? placeName(lens, i, entries[i]) : entries[i].label || "");
  const f = entries.map(facingOf);
  const meet = f.findIndex((d, i) => d === "right" && f[i + 1] === "left");
  if (meet >= 0 && nameOf(meet) && nameOf(meet + 1)) ask(`What are ${nameOf(meet)} and ${nameOf(meet + 1)} saying to each other?`.replace(/ The /g, " the "), 5, [meet, meet + 1]);

  // The cards' own questions join the same list, scored by how many of the
  // other cards share their themes (keywords, key ideas, how they read),
  // plus one for this card's own connecting ideas. A question that touches
  // no other card scores low and rarely makes the cut.
  const rich = entries.map((e) => {
    const { ideas, nuances } = ideasFor(e.card, e.reversed);
    const { g, a, c } = phrases(e.card, e.reversed);
    return new Set([...filled(keywordsFor(e.card, e.reversed)), ...ideas, ...nuances, g, a, c].flatMap(themesOf));
  });
  entries.forEach((e, i) => {
    const mine = new Set(linked[i].flatMap(themesOf));
    filled(questionsFor(e.card, e.reversed)).forEach((q) => {
      const ts = themesOf(q);
      const others = rich.map((r, j) => j).filter((j) => j !== i && ts.some((t) => rich[j].has(t)));
      whole.push({ q, score: others.length * 2 + (ts.some((t) => mine.has(t)) ? 1 : 0), card: i, idx: [i, ...others] });
    });
  });

  // The strongest few, one list: a question whose themes were already
  // asked about drops back, and each card gives at most one of its own.
  const count = Math.min(Math.max(3, n + 1), 5);
  const pool = whole.map((w, k) => ({ ...w, k, ts: themesOf(w.q) }));
  const picked = [], seen = new Set(), cardsUsed = new Set(), covered = new Set();
  while (picked.length < count) {
    let best = null, bestScore = -Infinity;
    pool.forEach((w) => {
      if (seen.has(w.q) || (w.card !== undefined && cardsUsed.has(w.card))) return;
      const s = w.score - (w.ts.length && w.ts.every((t) => covered.has(t)) ? 4 : 0);
      if (s > bestScore || (s === bestScore && w.k < best.k)) { best = w; bestScore = s; }
    });
    if (!best) break;
    picked.push(best);
    seen.add(best.q);
    if (best.card !== undefined) cardsUsed.add(best.card);
    best.ts.forEach((t) => covered.add(t));
  }
  // The most relevant on top: the question that runs through the most
  // cards first (its pips), the stronger score breaking a tie.
  picked.sort((x, y) => y.idx.length - x.idx.length || y.score - x.score);
  return picked.map((w) => ({ q: w.q, idx: w.idx, n }));
}
// The questions, in one box: for one card, its own; for a spread, the
// strongest of the reading's and the cards' questions together.
function fillSummaryAsks(box, entries, lens) {
  const one = entries.length === 1;
  const e = entries[0];
  const qs = one ? filled(questionsFor(e.card, e.reversed)).slice(0, 3) : summaryQuestions(entries, lens);
  box.innerHTML = "";
  box.hidden = !qs.length;
  const ul = el("ul");
  // A question raised by certain cards: five pips above it, a scale of how
  // strongly it runs through the spread, from one (a little) to five (it
  // fills the spread): the share of the cards that raised it, out of five.
  qs.forEach((q) => {
    if (typeof q === "string") return ul.append(el("li", "", q));
    const li = el("li");
    const level = Math.min(5, Math.max(1, Math.round((5 * q.idx.length) / q.n)));
    const pips = el("span", "ask-pips", Array.from({ length: 5 }, (_, i) => (i < level ? "●" : "○")).join("​"));
    pips.setAttribute("aria-label", `strength ${level} of 5`);
    li.append(pips, q.q);
    ul.append(li);
  });
  box.append(el("p", "asks-title", one ? "The card asks" : "The reading asks"), ul);
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
  items.forEach(({ head, place, tag, text, ideas, sub, cards }) => {
    const li = el("li");
    threadable(li, cards, head);
    // A stacked entry (it carries a place): one heading line, left-aligned,
    // with the place small above-left of the name and a tag after it; the
    // text below at full width, beside a gold hairline.
    if (place != null) {
      li.classList.add("stack-entry");
      const top = el("div", "stack-head");
      if (place) top.append(el("span", "stack-place", place));
      top.append(el("strong", "", head));
      if (tag) top.append(el("span", "stack-tag", tag));
      li.append(top);
      if (text) li.append(el("p", "stack-text", text));
      ul.append(li);
      return;
    }
    // A card's entry (it carries an ideas list, even an empty one): the name
    // hangs in its own column on two lines, its line and ideas beside it.
    const entry = Array.isArray(ideas);
    let body = li;
    if (entry) {
      li.classList.add("card-entry");
      body = el("div", "entry-body");
    }
    if (head) {
      const name = el("strong");
      if (entry) {
        const m = head.match(/^(.+? of|The) (.+)$/);
        if (m) name.append(m[1], el("br"), el("span", "nowrap", m[2])); else name.textContent = head;
      } else name.textContent = head;
      li.append(name);
    }
    if (entry) li.append(body);
    if (text) body.append(el("span", "", text));
    // ideas: the card's key ideas that connect to the rest of the reading
    // (Plain strings, or { x, cards, head }: an idea that links to another
    // card; tapping it draws the thread between the two cards.)
    if (ideas && ideas.length) {
      const box = el("span", "summary-ideas");
      ideas.forEach((d) => {
        const one = el("span", "summary-idea", typeof d === "string" ? d : d.x);
        if (d.cards) threadable(one, d.cards, d.head);
        box.append(one);
      });
      body.append(box);
    }
    if (sub) body.append(el("em", "summary-q", sub));
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
    if (t.tip) { tile.dataset.tip = t.tip; tile.setAttribute("aria-description", t.tip); }
    threadable(tile, t.cards, [t.top, t.n, t.main].filter((x) => x != null && x !== "").join(" "));
    grid.append(tile);
  });
  sec.append(grid);
  if (p.legend) sec.append(el("p", "tile-legend", p.legend));
  if (p.list && p.list.length) {
    const ul = listItems(p.list);
    sec.append(ul);
    // fold: show only the first few lines, the rest behind "See all".
    if (p.fold && p.list.length > p.fold) {
      const rest = [...ul.children].slice(p.fold);
      const more = el("button", "link small gold list-more");
      const set = (open) => {
        rest.forEach((li) => (li.hidden = !open));
        more.textContent = open ? "Show fewer ▴" : `See all ${p.list.length} ▾`;
        more.setAttribute("aria-expanded", open);
      };
      more.addEventListener("click", () => { set(more.getAttribute("aria-expanded") !== "true"); placeAsksSoon(); });
      set(false);
      sec.append(more);
    }
  }
  return sec;
}
// Re-place the question box once a section's height changed (see openSummary).
let placeAsksSoon = () => {};

// A tile's tip (data-tip): what it means, in a small bubble above it.
// With a mouse it shows on hover; on a phone a tap shows it (tap again,
// or anywhere else, to hide it). Scrolling hides it.
const tileTip = (() => {
  let bubble = null, on = null, touch = false;
  const hide = () => { if (bubble) bubble.hidden = true; on = null; };
  const show = (node) => {
    if (!bubble) { bubble = el("div", "tile-tip"); bubble.setAttribute("role", "tooltip"); document.body.append(bubble); }
    bubble.textContent = node.dataset.tip;
    bubble.hidden = false;
    on = node;
    const r = node.getBoundingClientRect(), b = bubble.getBoundingClientRect();
    const x = Math.min(Math.max(8, r.left + r.width / 2 - b.width / 2), innerWidth - b.width - 8);
    const y = r.top - b.height - 8 >= 8 ? r.top - b.height - 8 : r.bottom + 8;
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;
  };
  document.addEventListener("pointerdown", (ev) => { touch = ev.pointerType !== "mouse"; }, true);
  document.addEventListener("pointermove", (ev) => {
    if (ev.pointerType !== "mouse") return;
    const t = ev.target.closest && ev.target.closest("[data-tip]");
    if (t && t !== on) show(t); else if (!t && on) hide();
  }, { passive: true });
  document.addEventListener("pointerout", (ev) => { if (ev.pointerType === "mouse" && on && !ev.relatedTarget) hide(); });
  document.addEventListener("click", (ev) => {
    if (!touch) return;
    const t = ev.target.closest("[data-tip]");
    if (t && t !== on) show(t); else hide();
  });
  document.addEventListener("focusin", (ev) => { const t = ev.target.closest && ev.target.closest("[data-tip]"); if (t && !touch) show(t); });
  document.addEventListener("focusout", () => { if (!touch) hide(); });
  document.addEventListener("scroll", hide, true);
  addEventListener("resize", hide);
  return { hide };
})();

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
// Links between cards use their own, narrower tags than THEMES (which name
// and colour the reading): "grief" and "romance" rather than one broad
// "heart", so two cards only meet over something they really share.
// A word ending in * is a stem ("heal*": heal, healing, healed); any other
// is matched as a whole word, so "rest" can't be found inside "restless".
// "-" inside a word stands for a space or a hyphen.
const LINK_TAGS = {
  romance:     "romance romantic attraction lover lovers partner* falling* union relationship* soulmate*",
  selfLove:    "self-love self-care self-worth self-respect worth worthiness self-compassion",
  compassion:  "compassion* empath* kindness kind gentle* tender* warmth",
  feelings:    "emotion* feeling* feelings heart* intimacy",
  grief:       "grief griev* heartache heartbreak sorrow* loss pain painful hurt* disappoint* regret* mourn* wound*",
  healing:     "heal heals healed healing healer recover* restor* mend* repair*",
  hope:        "hope* optimis* faith new-dawn dawn",
  fear:        "fear* anxi* worry worries worrying dread nightmare* panic*",
  doubt:       "doubt* self-doubt hesitat* uncertain* insecur* indecis*",
  rest:        "rest resting pause* recharg* replenish* sleep*",
  patience:    "patience patient* waiting wait delay* slow* timing pace",
  peace:       "peace* calm* serenity serene quiet* stillness tranquil* mindful*",
  solitude:    "solitude alone withdraw* retreat* isolat* privat* hermit* lonel*",
  inward:      "inner inward* reflect* contemplat* introspect* soul-search*",
  intuition:   "intuition* intuitive instinct* gut psychic* sixth inner-knowing",
  dreams:      "dream* imagin* fantas* illusion* wishful daydream*",
  spirit:      "spiritu* sacred divine higher meditat* prayer*",
  wisdom:      "wisdom wise lesson* learn* study* studying teach* mentor* guidance advice",
  truth:       "truth* honest* integrity authentic* sincer*",
  clarity:     "clarity clear* fog* confus* insight*",
  justice:     "fair* justice accountab* consequence* karma law* responsib*",
  choice:      "choice* choos* decid* decision* option* crossroad* weigh*",
  plans:       "plan* planning goal* strateg* long-term foresight direction purpose*",
  beginnings:  "begin* start* fresh seed* potential opportunit* new-start new-beginning*",
  endings:     "end ending* endings closure finish* complet* leav* walk-away walking-away moving-on",
  lettingGo:   "letting-go let-go release* surrender* detach* loosen*",
  change:      "change* transform* transition* shift* rebirth cycle* evolv*",
  upheaval:    "sudden* unexpected upheaval shock* breakthrough* revelation* collapse* chaos",
  courage:     "courage* brave* bold* risk* dare* daring",
  resilience:  "strength strong* resilien* persever* endur* persist* stamina",
  drive:       "action* energy energetic momentum motivat* drive* fast speed* movement swift*",
  passion:     "passion* desire* fire enthusias* excite* excitement inspir* spark*",
  power:       "control* power* authority dominan* command* leader* leadership",
  discipline:  "discipline* routine* habit* diligen* consisten* steady steadi* commitment* commit*",
  work:        "work* skill* career* craft* effort* job* practice* master* apprentic*",
  money:       "money financ* income wealth* abundance prosper* invest* saving* material* business*",
  generosity:  "generos* receiv* charit* sharing share* gift* giving-back giving-and",
  security:    "secur* stabil* stable safe* safety foundation* ground* grounded",
  home:        "home* family famil* roots heritage legacy inherit* children",
  past:        "past memor* nostalg* childhood inner-child old return* returning",
  community:   "community friend* friendship* team* teamwork collaborat* cooperat* belong* group*",
  joy:         "joy* happi* fun play* playful delight* celebrat* milestone*",
  success:     "success* recognition victor* win wins winning achiev* reward* acknowledg* pride proud",
  confidence:  "confiden* self-assur* self-belief self-trust",
  freedom:     "freedom free independen* liberat*",
  adventure:   "adventur* travel* journey* explor* horizon* curio* discover* seek*",
  conflict:    "conflict* compet* argument* tension* struggle* fight* battle* rival*",
  boundaries:  "boundar* protect* guard* defen* limit limits limiting",
  words:       "word* speak* voice* communicat* conversation* news message* listen*",
  mind:        "mind minds mindset thought* think* mental* overthink* logic* reason* intellect* idea ideas",
  stuck:       "stuck trap* restrict* helpless* victim* cage* stagnat* bound",
  balance:     "balanc* harmon* moderat* temperance middle juggl* priorit* align*",
  deception:   "decept* lie lies secret* hidden trick* manipulat* dishonest* betray*",
  burden:      "burden* overwhelm* exhaust* weary weariness tired burnout carry* carrying",
  content:     "content* satisf* enough gratitude grateful enjoy* comfort* pleasure* luxur*",
  apathy:      "apathy apathetic boredom bored dissatisf* discontent* overlook* stagnant",
  body:        "nature natural body health* physical* earth* earthy",
  creativity:  "creativ* art* artist* express* expression*",
  nurture:     "nurtur* care caring mother* tend tending tended fertil*",
  growth:      "growth grow* progress* develop* expand* expansion",
  acceptance:  "accept* embrac* allow*",
  forgiveness: "forgiv* reconcil* amends",
  patterns:    "pattern* addict* attachment* obsess* compuls* tempt* shadow*",
  trust:       "trust*",
};
const LINK_TAG_RE = Object.fromEntries(Object.entries(LINK_TAGS).map(([t, words]) => {
  const alts = words.split(/\s+/).map((w) => {
    const stem = w.endsWith("*");
    const body = (stem ? w.slice(0, -1) : w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/-/g, "[ -]");
    return stem ? `${body}[a-z'-]*` : body;
  });
  return [t, new RegExp(`(?<![a-z])(?:${alts.join("|")})(?![a-z])`, "i")];
}));
const linkTagsOf = (text) => Object.keys(LINK_TAG_RE).filter((t) => LINK_TAG_RE[t].test(text));

// How rare each tag is across the deck: a tag on few card sides says more
// when two cards share it than one on many. log2(sides / sides with it).
let linkWeights = null;
function linkWeight(t) {
  if (!linkWeights) {
    const seen = {};
    let sides = 0;
    CARDS.forEach((c) => [false, true].forEach((rev) => {
      sides++;
      const { ideas, nuances } = ideasFor(c, rev);
      new Set([...filled(keywordsFor(c, rev)), ...ideas, ...nuances].flatMap(linkTagsOf)).forEach((x) => { seen[x] = (seen[x] || 0) + 1; });
    }));
    linkWeights = Object.fromEntries(Object.keys(LINK_TAGS).map((x) => [x, Math.log2(sides / (seen[x] || 1))]));
  }
  return linkWeights[t] || 0;
}
// What two cards linked by a tag have in common: [topic, question].
// The topic follows a link ("— with The Lovers, on choosing"); the question
// is asked when two cards meet over the tag. Both point to the self first.
const LINK_TEXT = {
  romance:     ["love and partnership", "What do you hope to be given in love, and do you give it to yourself?"],
  selfLove:    ["how you treat yourself", "What would change if you treated yourself as someone worth caring for?"],
  compassion:  ["kindness", "Where could you be as gentle with yourself as you are with others?"],
  feelings:    ["feelings", "Which feeling have you been carrying without naming it?"],
  grief:       ["loss and hurt", "What loss is still asking to be felt, before it can soften?"],
  healing:     ["healing", "What in you is already mending, and how can you give it room?"],
  hope:        ["hope", "What small light are you willing to trust right now?"],
  fear:        ["fear", "Which of your fears is about now, and which is about a story you tell yourself?"],
  doubt:       ["doubt", "What would you do if you trusted your own judgement a little more?"],
  rest:        ["rest", "What would real rest look like for you this week?"],
  patience:    ["patience and timing", "What are you rushing that would ripen on its own?"],
  peace:       ["calm", "Where do you find the quiet that steadies you?"],
  solitude:    ["time alone", "Is your time alone restoring you, or keeping you apart?"],
  inward:      ["looking inward", "What do you notice when you stop and look inward?"],
  intuition:   ["intuition", "What does your quiet inner knowing keep telling you?"],
  dreams:      ["dreams and imagining", "Which of your dreams is a wish, and which is a plan waiting to begin?"],
  spirit:      ["the spirit", "What gives your life a sense of meaning beyond the everyday?"],
  wisdom:      ["learning", "What lesson are you ready to take to heart?"],
  truth:       ["honesty", "What truth about yourself are you ready to say out loud?"],
  clarity:     ["seeing clearly", "What would you see if you looked at this without hope or fear?"],
  justice:     ["fairness", "Where are you being asked to be fair, to others and to yourself?"],
  choice:      ["choosing", "What choice are you circling, and what do you really want from it?"],
  plans:       ["plans and direction", "Where are you heading, and is it still your own direction?"],
  beginnings:  ["beginnings", "What is ready to begin in you, if you let it?"],
  endings:     ["endings", "What is ready to end, and what will it make room for?"],
  lettingGo:   ["letting go", "What are you holding that you could set down?"],
  change:      ["change", "What change in you is already under way?"],
  upheaval:    ["sudden change", "What could this shake-up be clearing away for you?"],
  courage:     ["courage", "What would you do now if you were a little braver with yourself?"],
  resilience:  ["staying strong", "What has kept you standing so far, and does it still serve you?"],
  drive:       ["energy and action", "Where does your energy want to go first?"],
  passion:     ["passion", "What lights you up when no one is asking anything of you?"],
  power:       ["power and control", "Where do you need to take charge, and where to loosen your grip?"],
  discipline:  ["steady effort", "Which small habit, kept every day, would carry you furthest?"],
  work:        ["work and skill", "What work feels like your own, and how can you give it more of you?"],
  money:       ["money and resources", "What does enough look like for you?"],
  generosity:  ["giving and receiving", "Is it easier for you to give or to receive, and why?"],
  security:    ["security", "What makes you feel safe, and can you build more of it yourself?"],
  home:        ["home and family", "What did you inherit that you want to keep, and what can you leave behind?"],
  past:        ["the past", "What from your past is asking to be seen with kinder eyes?"],
  community:   ["belonging", "Where do you feel you truly belong, and who belongs with you?"],
  joy:         ["joy", "What joy could you let yourself have today?"],
  success:     ["success", "What have you achieved that you haven't let yourself feel proud of?"],
  confidence:  ["confidence", "Where could you back yourself without waiting for approval?"],
  freedom:     ["freedom", "What would freedom feel like here, and what stands in its way?"],
  adventure:   ["exploring", "Where is your curiosity pulling you?"],
  conflict:    ["conflict", "Which struggle is worth your energy, and which can you let settle?"],
  boundaries:  ["boundaries", "Which boundary would protect your peace without closing your heart?"],
  words:       ["speaking and listening", "What needs saying, and who needs to hear it, you included?"],
  mind:        ["the mind", "Which thoughts help you, and which keep you going in circles?"],
  stuck:       ["feeling stuck", "What is one small step that is already open to you?"],
  balance:     ["balance", "What in your life needs a fairer share of you?"],
  deception:   ["what's hidden", "What might you be hiding, even from yourself?"],
  burden:      ["what you carry", "Which of the loads you carry are truly yours?"],
  content:     ["contentment", "What do you already have that you could enjoy more fully?"],
  apathy:      ["restlessness", "What have you stopped noticing that once delighted you?"],
  body:        ["the body and nature", "What is your body asking you for?"],
  creativity:  ["creating", "What wants to be made through you?"],
  nurture:     ["nurturing", "What are you tending, and who is tending you?"],
  growth:      ["growth", "Where are you growing, even if it feels slow?"],
  acceptance:  ["acceptance", "What could you accept as it is, so you can move on from it?"],
  forgiveness: ["forgiveness", "Who could you forgive, yourself included?"],
  patterns:    ["patterns and attachments", "Which pattern keeps returning, and what does it give you?"],
  trust:       ["trust", "Where could you trust yourself, or someone else, a little more?"],
};

// Tags for what weighs on you: never offered as a path to choose.
const HARD_TAGS = ["grief", "fear", "doubt", "conflict", "stuck", "burden", "deception", "patterns", "apathy"];

// The least an idea must share with a card to be shown as linked to it.
const MIN_LINK = 2;

// For each card, the key ideas (of the side it fell on) that speak most to
// the other cards: an idea scores for each tag it shares with another card's
// keywords and ideas (rare tags far more than common ones), and more when it
// names one of that card's keywords outright. The warm ideas win ties over
// the nuances. One card alone simply shows its first few ideas.
// withLinks: each idea as { x, with, tag, score }, `with` the place of the
// card it speaks to most and `tag` what they share (null when only a
// keyword joins them); ideas that link to no card strongly enough are left out.
// A line that names the lack of what its tag is about ("Low confidence"),
// rather than its presence. Two ideas on the same tag but on opposite sides
// of this are a tension, not a match.
// The lack must sit right against the tagged word: just before it ("Low
// confidence", "lack of trust") or just after it ("creativity feels blocked").
// ("Lost in thought" is absorbed, not lacking; "not a lost spark" denies the lack.)
const LACK_BEFORE = "(?<!\\b(?:not|without) (?:a |an )?)(?:low|lack(?:ing)?|lacks|no|not|without|lost(?! in\\b)|losing|loss of|little|missing|false|absent|neglected|withheld|blocked|drained|shaken)";
const LACK_AFTER = "(?:blocked|drained|missing|lost|stuck|absent|lacking|shaken|withheld|neglected|fades?|fading|gone)";
const lacksOn = (x, tag) => {
  const w = LINK_TAG_RE[tag].source.replace(/^\(\?<!\[a-z\]\)/, "").replace(/\(\?!\[a-z\]\)$/, "");
  return new RegExp(`\\b${LACK_BEFORE}\\s+(?:of\\s+|in\\s+|your\\s+|any\\s+)?(?:[a-z-]+\\s+)?${w}(?![a-z])`, "i").test(x)
      || new RegExp(`(?<![a-z])${w}(?:\\s+[a-z]+){0,3}?\\s+${LACK_AFTER}\\b`, "i").test(x);
};

function connectedIdeas(entries, per = 2, withLinks = false) {
  const linesOf = (e) => { const { ideas, nuances } = ideasFor(e.card, e.reversed); return { ideas, nuances }; };
  const profile = entries.map((e) => {
    const words = filled(keywordsFor(e.card, e.reversed)).map((w) => w.toLowerCase());
    const { ideas, nuances } = linesOf(e);
    const all = [...words, ...ideas, ...nuances];
    return { words, tags: new Set(all.flatMap(linkTagsOf)), lines: all };
  });
  // Whether idea x meets card j on `tag` from the opposite side: every line
  // of that card carrying the tag lacks it where x has it, or the reverse.
  const opposed = (x, j, tag) => {
    if (!tag) return false;
    const on = profile[j].lines.filter((l) => LINK_TAG_RE[tag].test(l));
    const mine = lacksOn(x, tag);
    return on.length > 0 && on.every((l) => lacksOn(l, tag) !== mine);
  };
  return entries.map((e, i) => {
    const { ideas, nuances } = linesOf(e);
    if (entries.length === 1) return ideas.slice(0, 3).map((x) => (withLinks ? { x, with: null } : x));
    const scored = [...ideas.map((x) => [x, 0.5]), ...nuances.map((x) => [x, 0])].map(([x, bonus], k) => {
      const low = x.toLowerCase(), mine = linkTagsOf(x);
      // How much this idea speaks to each other card; the strongest is its link.
      // tag: the rarest tag the two share, which names what joins them.
      let best = null, bestScore = 0, tag = null;
      profile.forEach((o, j) => {
        if (j === i) return;
        const shared = mine.filter((t) => o.tags.has(t)).sort((a, b) => linkWeight(b) - linkWeight(a));
        const s = shared.reduce((s, t) => s + linkWeight(t), 0)
                + o.words.filter((w) => w.length > 3 && low.includes(w)).length * 3;
        if (s > bestScore) { bestScore = s; best = j; tag = shared[0] || null; }
      });
      return { x, raw: bestScore, score: bestScore + (bestScore ? bonus : 0), k, with: best, tag };
    });
    const linked = scored.filter((s) => s.raw >= MIN_LINK).sort((a, b) => b.score - a.score || a.k - b.k);
    // tension: the two cards meet on the tag from opposite sides (one has it, one lacks it);
    // lack: this idea is the side that lacks it.
    if (withLinks) return linked.slice(0, per).map(({ x, with: w, tag, score }) =>
      ({ x, with: w, tag, score, tension: opposed(x, w, tag), lack: !!tag && lacksOn(x, tag) }));
    return (linked.length ? linked : scored).slice(0, per).map((s) => s.x);
  });
}

// ── The pair that speaks loudest ────────────────────────
// Of the spread's pairs that have their own written line (pairs.js), the
// one whose cards share the most: rare tags count most, and two Major
// Arcana a little more. When either card is reversed, the pair's reversed
// line is used (pairs-reversed.js), if it has one. { i, j, text } or null.
function strongestPair(entries) {
  if (typeof PAIR_LINES === "undefined" || entries.length < 2) return null;
  const tags = entries.map((e) => {
    const { ideas, nuances } = ideasFor(e.card, e.reversed);
    return new Set([...filled(keywordsFor(e.card, e.reversed)), ...ideas, ...nuances].flatMap(linkTagsOf));
  });
  let best = null;
  entries.forEach((a, i) => entries.forEach((b, j) => {
    if (j <= i) return;
    const [x, y] = [CARDS.indexOf(a.card), CARDS.indexOf(b.card)].sort((m, k) => m - k);
    const rev = a.reversed || b.reversed;
    const text = rev ? (typeof PAIR_LINES_REV !== "undefined" && PAIR_LINES_REV[`${x}-${y}`]) : PAIR_LINES[`${x}-${y}`];
    if (!text) return;
    const score = [...tags[i]].filter((t) => tags[j].has(t)).reduce((s, t) => s + linkWeight(t), 0)
                + (isMajorCard(a.card) && isMajorCard(b.card) ? 2 : 0);
    if (!best || score > best.score) best = { i, j, text, score };
  }));
  return best;
}

// The whole reading in one paragraph, before the cards one by one: what
// it is about (its strongest themes), where it moves (first card to last),
// the strongest pair's line, and its weight (Major cards, reversals,
// a leading element). Turned toward the self, as the card lines are.
function readingOverview(entries, pair) {
  const n = entries.length;
  if (n < 2) return "";
  const lower = (s) => s.charAt(0).toLowerCase() + s.slice(1);
  const out = [];
  const { themes, topEl, els, majors, revs } = patternParts(entries);
  // Straight into the themes: the section's title already says this is the reading as a whole.
  // The tiles already name the themes, so this says what the two do to each
  // other instead (theme-lines.js), never "x and y meet in you".
  const top = (themes.length ? themes : readingThemes(entries)).slice(0, 2);
  const opening = top.length === 2 ? themeLine(top[0], top[1]) : top.length ? THEME_SOLO[top[0]] : null;
  if (opening) out.push(opening);
  // (A phrase with its own comma gets one after it too, so the sentence still parses.)
  const g = (e) => { const s = phrases(e.card, e.reversed).g.replace(/[.;]+$/, ""); return s.includes(",") ? `${s},` : s; };
  out.push(n === 2
    ? `It moves from ${g(entries[0])} toward ${g(entries[1]).replace(/,$/, "")}.`
    : `It begins with ${g(entries[0])} and leads toward ${g(entries[n - 1]).replace(/,$/, "")}.`);
  if (pair) out.push(`${pair.text.replace(/\s*$/, "")}`.replace(/([^.!?])$/, "$1."));
  if (majors >= Math.ceil(n / 2) && majors >= 2) out.push("With so many Major cards, this is a lesson for you, not a passing moment.");
  else if (revs >= Math.ceil(n / 2) && revs >= 2) out.push("Several cards are reversed: much of this is still forming in you.");
  else if (topEl && els[topEl] >= 2 && els[topEl] > n / 2) out.push(`${topEl} leads, so look first to ${lower(ELEMENT_TEXT[topEl].replace(", ", " and "))}.`);
  return out.join(" ");
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
  bar.append(barStart(bar, back), el("span", "bar-title", "Reading summary"), share);

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
  //   left:  the reading (shared words right under its title), themes
  //   right: symbols, gaze, mirrors & tensions, elements
  //   below: what the reading asks (one list)
  // Slots marked "lens" are refilled when the lens changes.
  const leftCol = el("div", "sum-col"), rightCol = el("div", "sum-col");
  const lensPart = el("div", "sum-slot");     // lens
  const gazeSlot = el("div", "sum-slot");     // lens
  const mirrorSlot = el("div", "sum-slot");   // lens
  const asks = el("div", "asks summary-asks");
  // The patterns that don't depend on the lens, by their titles.
  const patterns = {};
  patternParts(entries).parts.forEach((p) => (patterns[p.title] = p));
  // The Themes and the shared words, as one set of tiles (no title of
  // their own) under the reading's overview: the themes first. A fresh
  // copy each time the reading is redrawn.
  const sharedTiles = () => {
    const items = ["Themes", "Shared words"].flatMap((t) => (patterns[t] ? patterns[t].items : []));
    return items.length ? partSection(part("", items, { tiles: true }), cardCols).querySelector(".tiles") : null;
  };
  // The strongest written pair, under the reading's title: the two cards'
  // names in gold, then their line. Tap to light the two cards up.
  const pair = strongestPair(entries);
  // The whole reading in a paragraph, first under the title; it carries the
  // pair's line, so the pair block is only shown when there is no paragraph.
  const overview = readingOverview(entries, pair);
  const overviewEl = () => overview && el("p", "summary-overview", overview);
  const pairEl = () => {
    if (!pair || overview) return null;
    const p = el("p", "summary-pair");
    threadable(p, [pair.i, pair.j], "");
    const nm = (e) => `${e.card.name}${e.reversed ? ", reversed" : ""}`;
    p.append(el("span", "pair-names", `${nm(entries[pair.i])} · ${nm(entries[pair.j])}`), el("span", "pair-text", pair.text));
    return p;
  };
  // Each card's key ideas that relate most to the other cards, shown under
  // its line in "The reading".
  // Each idea with the card it links to: tap it to draw the thread between
  // the two cards (the strip names them, and what they share).
  const linked = connectedIdeas(entries, 2, true).map((list, i) =>
    list.map(({ x, with: j, tag, tension, lack }) => (j === null ? x : {
      x,
      cards: [i, j],
      // A tension reads as such: one card lacks what the other has.
      head: tension
        ? `${entries[i].card.name} ↔ ${entries[j].card.name}, ${LINK_TEXT[tag][0]} ${lack ? "lacking ↔ found" : "found ↔ lacking"}`
        : `${entries[i].card.name} · ${entries[j].card.name}${tag ? `, on ${LINK_TEXT[tag][0]}` : ""}`,
    })));
  let lens = laidOut;
  let topic = null;           // the topic whose themes are listed, or null for the topics
  let menuOpen = false;       // the themes are shown only once "Select a theme" is pressed
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
    fill(gazeSlot, gazePart(entries, nameOf));
    fill(mirrorSlot, part("Mirrors & tensions", mirrorItems(entries, nameOf), { tiles: true, wrap: true }));
    fillSummaryAsks(asks, entries, lens);
    lensPart.innerHTML = "";
    if (lens) {
      // One section: each card in its place.
      const sec = listSection("The reading", entries.map((e, i) => ({
        head: placeName(lens, i, e),
        // The place is already the heading, so drop the line's own "Ahead: " lead-in.
        text: (() => { const t = placeLine(e, lens.places[i], i, placeName(lens, i, e)).replace(/^[^:]+:\s*/, ""); return t.charAt(0).toUpperCase() + t.slice(1); })(),
        ideas: linked[i],
        sub: lens.own ? lens.questions[i] || "" : "",
        cards: [i],
      })));
      const title = sec.querySelector(".asks-title");
      const sw = sharedTiles();
      const pl = pairEl();
      if (pl) title.after(pl);
      if (sw) title.after(sw);
      const ov = overviewEl();
      if (ov) title.after(ov);
      lensPart.append(sec);
    } else {
      // No theme: each card by its name, with what it brings (and, reversed,
      // its advice) and its connecting ideas.
      const sec = el("section", "summary-part");
      sec.append(el("p", "asks-title", "The reading"));
      const ov = overviewEl();
      if (ov) sec.append(ov);
      const sw = sharedTiles();
      if (sw) sec.append(sw);
      const pl = pairEl();
      if (pl) sec.append(pl);
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
    // Picking a way of reading closes the theme menu.
    const pick = (l) => () => { lens = l; menuOpen = false; topic = null; render(); };
    // One line: the plain reading, and a button that opens the themes
    // (named after the chosen theme, when there is one).
    const row = el("div", "lens-row");
    row.append(laidOut ? btn("As laid out", lens === laidOut, pick(laidOut)) : btn("No theme", !lens, pick(null)));
    const chosen = lens && lens.theme;
    const toggle = btn(`${chosen ? chosen.name : "Select a theme"} ${menuOpen ? "▴" : "▾"}`, !!chosen,
      () => { menuOpen = !menuOpen; topic = null; drawLensBox(); }, "lens-btn lens-open");
    toggle.setAttribute("aria-expanded", menuOpen ? "true" : "false");
    row.append(toggle);
    lensBox.append(row);
    if (!menuOpen) { fitOneLine([...row.querySelectorAll(".lens-btn")]); return; }
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
  put(leftCol, lensPart);   // (the Themes are in the reading, beside the shared words)
  put(rightCol, sectionOf("Symbols"), gazeSlot, mirrorSlot, sectionOf("Elements"));
  const asksRow = el("div", "sum-asks");
  asksRow.append(asks);
  main.append(leftCol, rightCol, asksRow);
  if (named) main.append(reflectionPart(named.id));
  // LAYOUT RULE: no empty space under the shorter column on a wide screen.
  // The question box goes under a clearly shorter column, else full width
  // below both. On a phone it stays below.
  const wide = matchMedia("(min-width: 1340px)");
  placeAsks = () => {
    asksRow.append(asks);
    rightCol.insertBefore(gazeSlot, mirrorSlot);
    if (!wide.matches) return;
    // (The columns stretch to the same height, so measure what's in them.)
    const filled = (col) => Math.max(0, ...[...col.children].map((c) => c.getBoundingClientRect().bottom));
    // The Gaze section (long, with its lines) goes under the reading when
    // that evens the columns out, so the question box isn't left filling
    // a tall gap under the shorter one.
    const g = gazeSlot.getBoundingClientRect().height, L = filled(leftCol), R = filled(rightCol);
    if (Math.abs(L + g - (R - g)) < Math.abs(L - R)) leftCol.append(gazeSlot);
    if (asks.hidden) return;
    const l = filled(leftCol), r = filled(rightCol);
    if (Math.abs(l - r) > 120) (l < r ? leftCol : rightCol).append(asks);
  };
  wide.addEventListener("change", placeAsks);
  placeAsksSoon = () => requestAnimationFrame(placeAsks);

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
  if (magic === "later") sheet.appear = (C) => appearWithMagic(sheet, body, C);
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

// The summary page's pieces (those a burning front makes or unmakes): the
// bar's buttons and title, the name, the cards' labels, each part of the reading.
// (The cards' pictures fly in and out on their own: see emergeCards.)
const summaryParts = (sheet) => [...sheet.querySelectorAll(
  ".bar > *, .col-side > :not(.summary-cards):not(.details-card), .related-label, .related-name, .summary-kw, .sum-col > *, .sum-asks > *, " +
  // (a one-card reading's card page: each part of its main column)
  ".card-page .col-main > :not(.meanings), .card-page .meanings > *")];
// The middle of the great circle behind the spread (or of the screen, without one).
const circleMiddle = () => (MG.great ? { x: MG.great.cx, y: MG.great.cy } : { x: innerWidth / 2, y: innerHeight * 0.46 });

// The summary page arriving through the arcane portal: the page itself is
// revealed by the widening window, while its pieces are made by burning
// fronts, as home's are after the black hole: dust flies out of the
// portal's heart to each piece and its ragged ember front lays it down,
// sweeping across it from its side nearest the heart, nearest pieces first.
// (Drawn inside the page, so the window's edge and zoom carry it too.)
function appearWithMagic(sheet, body, C = circleMiddle()) {
  sheet.hidden = false;
  sheet.style.zIndex = ++Z;
  sheet.scrollTop = 0;
  sheet.animate(
    [{ filter: "brightness(1.7)" }, { filter: "brightness(1)" }],
    { duration: 900 / portalPace, easing: "cubic-bezier(.2,.8,.2,1)" }
  );
  const k = portalPace;
  burnFronts(summaryParts(sheet), C, { mode: "build", at: 120 / k, fly: BURN_FX.fly / k, build: BURN_FX.build / k, host: sheet, z: 50 });
}

// Back to the table: the summary unmade by fire, the table made by it.
// Each of the summary's pieces burns away behind a ragged ember front
// sweeping out from the great circle's middle, its dust lifting off the
// front and drawn into that point, nearest pieces first. As the last goes
// in it flashes; the empty page fades off the table, and the table's
// pieces (its bar, each card's place, the buttons) are made again as
// home's are: dust flies out of the flash and each piece's front lays it down.
// The first time in a visit it plays in full; after that, three times as
// fast (as the portal goes quicker: see summonSummary).
// Resolves once the page is gone. (Timers, so a paused page never waits.)
const BACK_FX = { fly: 300, burn: 480, fade: 220 };
let backSeen = false;   // (per visit: a fresh page load plays it in full again)
function vanishWithMagic(sheet) {
  const k = backSeen ? 3 : 1;
  backSeen = true;
  MG.cover = null;   // (the table's circle shows again as the page burns away)
  const C = circleMiddle();
  sheet.style.pointerEvents = "none";
  // (each card goes whole, picture and labels, as one piece)
  const pieces = [...summaryParts(sheet).filter((p) => !p.closest(".related-card")), ...sheet.querySelectorAll(".related-card, .details-card")];
  const { end } = burnFronts(pieces, C, { mode: "burn", fly: BACK_FX.fly / k, build: BACK_FX.burn / k, z: ++Z });
  const onTable = S && !$("table").hidden;
  return new Promise((done) => setTimeout(() => {
    // The table's pieces, laid down from nothing (still under the page as it fades).
    if (onTable) burnFronts(tableParts(), C, { mode: "build", at: BACK_FX.fade * 0.6 / k, fly: BURN_FX.fly / k, build: BURN_FX.build / k, z: ++Z, flash: { at: 0, ms: 300 / k } });
    sheet.animate([{ opacity: 1 }, { opacity: 0 }], { duration: BACK_FX.fade / k, easing: "ease-out", fill: "forwards" });
    setTimeout(done, BACK_FX.fade / k);
  }, Math.max(0, end - 120 / k)));
}
// The table's pieces, as a burning front makes them: the bar's buttons, each
// card's place (with its name), the hint, and the buttons at the end.
function tableParts() {
  const t = $("table");
  return [...t.querySelectorAll(".bar > button"), ...$("slots").children, $("hint"), ...$("endActions").children]
    .filter((p) => p && p.getClientRects().length && (p.id !== "hint" || p.textContent.trim()));
}

// Opening the summary: the black hole that takes you home (playGreatHole,
// in js/greater-hole.js) swallows the table (or the History) and its cards,
// crumbling them to dust; the moment the last grain is in, the summary is
// there, and its pieces are laid down by burning fronts out of the closing
// hole, as home's are. `key` names the reading (its id in the history, or the
// reading itself before it's saved).
// (arcanePortal, in js/portal.js, was the way in before: no longer used.)
// (portalPace: read by appearWithMagic and the old portal; always the first pace now.)
let summoning = false, portalPace = 1;
function summonSummary(open, key = null) {
  if (calm) { open(false); return; }
  if (summoning || swallowing) return;   // already on its way
  summoning = true;
  swallowing = true;
  document.activeElement?.blur();
  // What's showing: the table, or the page the summary was asked from.
  const onTable = S && !$("table").hidden;
  const from = onTable ? $("table")
    : [...document.querySelectorAll("body > .sheet:not([hidden]), body > .overlay:not([hidden])")].pop() || null;
  // The page is built now, kept out of sight until the hole has eaten
  // everything; its card pictures start decoding now too, so they're ready.
  const sheet = open("later");
  sheet.readingKey = key;   // (for the way back: see vanishWithMagic)
  sheet.style.visibility = "hidden";
  sheet.querySelectorAll("img").forEach((img) => img.decode?.().catch(() => {}));
  // (the table's circle, under the hole, needn't be drawn meanwhile: see startMagic)
  if (onTable) MG.cover = $("table");
  const done = () => { summoning = false; };
  swallowPage(from, {
    land: () => {
      sheet.hidden = false;
      sheet.style.visibility = "";
      sheet.style.zIndex = ++Z;
      sheet.scrollTop = 0;
      if (onTable) MG.cover = sheet;   // (hidden under the summary until it goes)
      done();
    },
    build: (C, o) => burnFronts(summaryParts(sheet), C, { ...o, host: sheet, z: 50 }),
  });
  setTimeout(done, 6000);   // (whatever happens)
}
