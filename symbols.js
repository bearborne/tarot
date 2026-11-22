// ───────────────────────────────────────────────────────────────
//  WHAT'S IN THE PICTURES
//  The reading summary uses this to find symbols that come back
//  across the cards of a spread, and which way the figures look.
//
//  SYMBOLS – every symbol, with:
//    name    – what the summary calls it, after a count:
//              "2 crowns", so make it plural
//    meaning – what it stands for, in a word or two (it must fit
//              on one line of a small tile)
//
//  PICTURES – one line per card:
//    facing  – where the main figure looks, as you see the card:
//              "left", "right", "back" (turned away from you),
//              or "" (looking out at you, or no single figure)
//    symbols – the symbols in its picture, using the ids above
//
//  To add a symbol, add it to SYMBOLS and then to the cards that
//  show it.
// ───────────────────────────────────────────────────────────────

const SYMBOLS = {
  water:       { name: "waters", meaning: "the unconscious" },
  sea:         { name: "seas", meaning: "deep feeling" },
  moon:        { name: "moons", meaning: "intuition" },
  sun:         { name: "suns", meaning: "clarity" },
  stars:       { name: "stars", meaning: "hope" },
  mountains:   { name: "mountains", meaning: "challenge" },
  cliff:       { name: "edges", meaning: "a leap" },
  clouds:      { name: "clouds", meaning: "the unseen" },
  hand:        { name: "cloud hands", meaning: "a gift" },
  trees:       { name: "trees", meaning: "growth" },
  harvest:     { name: "harvests", meaning: "reward" },
  flowers:     { name: "flowers", meaning: "desire, purity" },
  sunflowers:  { name: "sunflowers", meaning: "joy" },
  crowns:      { name: "crowns", meaning: "mastery" },
  thrones:     { name: "thrones", meaning: "authority" },
  wreaths:     { name: "wreaths", meaning: "victory" },
  lions:       { name: "lions", meaning: "courage" },
  horses:      { name: "horses", meaning: "drive" },
  dogs:        { name: "dogs", meaning: "loyalty" },
  birds:       { name: "birds", meaning: "messages" },
  fish:        { name: "fish", meaning: "imagination" },
  serpents:    { name: "serpents", meaning: "wisdom" },
  creatures:   { name: "creatures", meaning: "wholeness" },
  angels:      { name: "angels", meaning: "guidance" },
  children:    { name: "children", meaning: "innocence" },
  nakedness:   { name: "bare figures", meaning: "truth" },
  pillars:     { name: "pillars", meaning: "thresholds" },
  veils:       { name: "veils", meaning: "secrets" },
  towers:      { name: "towers", meaning: "ambition" },
  homes:       { name: "homes", meaning: "security" },
  paths:       { name: "paths", meaning: "the way ahead" },
  bonds:       { name: "bindings", meaning: "restraint" },
  infinity:    { name: "∞ signs", meaning: "endless flow" },
  scales:      { name: "scales", meaning: "fairness" },
  goldsky:     { name: "golden skies", meaning: "optimism" },
  darksky:     { name: "dark skies", meaning: "a hard season" },
  fire:        { name: "flames", meaning: "passion" },
  butterflies: { name: "butterflies", meaning: "new thinking" },
};

// What each symbol means for you, in a sentence: shown when its tile in
// the reading summary is hovered or tapped, and in the list below the tiles.
const SYMBOL_TIPS = {
  water:       "Flowing water is the part of you below thought; what's stirring there wants attention.",
  sea:         "The sea is feeling too deep to measure; you may be feeling more than you show.",
  moon:        "The moon lights things dimly; trust what you sense before you can prove it.",
  sun:         "Sunlight makes things plain; something is ready to be seen clearly.",
  stars:       "Stars shine in the dark; there is still hope to steer by.",
  mountains:   "Mountains are the climb ahead: a challenge that will leave you stronger.",
  cliff:       "An edge is the moment before a leap; you may be closer to jumping than you think.",
  clouds:      "Clouds hide what's above; not everything is visible to you yet.",
  hand:        "A hand from the clouds is something given, not earned; let yourself receive it.",
  trees:       "Trees grow slowly and surely, and so do you.",
  harvest:     "A harvest is effort paying off; notice what you've already grown.",
  flowers:     "Flowers are desire at its purest; what you want is innocent and alive.",
  sunflowers:  "Sunflowers turn toward the light, as you are turning toward what makes you glad.",
  crowns:      "A crown is mastery; you have more say over your life than you claim.",
  thrones:     "A throne is the seat of authority; you're being asked to take your place.",
  wreaths:     "A wreath is a victory recognised; let yourself feel what you've won.",
  lions:       "Lions are courage and raw strength; yours is ready to be used gently.",
  horses:      "Horses carry you forward; your drive is gathering speed.",
  dogs:        "Dogs are loyalty; ask what you are faithful to, yourself included.",
  birds:       "Birds carry messages; something is trying to reach you.",
  fish:        "Fish rise from deep water; an idea or feeling is surfacing from your imagination.",
  serpents:    "Serpents shed their skin; old wisdom and renewal are close.",
  creatures:   "The four creatures are all of you at once, every element together.",
  angels:      "Angels are guidance from beyond yourself; you're less alone than you feel.",
  children:    "Children are innocence; let a simpler, younger part of you speak.",
  nakedness:   "Bare figures have nothing to hide; honesty is asked of you, with yourself first.",
  pillars:     "Pillars mark a threshold; you are standing in a doorway.",
  veils:       "A veil keeps something sacred hidden; there is more to learn before all is shown.",
  towers:      "Towers are ambition built high; check what yours stands on.",
  homes:       "Homes are safety and belonging; notice where you feel secure, and where you don't.",
  paths:       "A path is the way ahead; it is there even if you can't see where it ends.",
  bonds:       "Bindings are restraint; some ties are yours to loosen.",
  infinity:    "The infinity sign is endless flow; your energy renews itself.",
  scales:      "Scales weigh things fairly; be fair to yourself as well.",
  goldsky:     "A golden sky is optimism; things are brighter around you than they may feel.",
  darksky:     "A dark sky is a hard season, and seasons pass.",
  fire:        "Flames are passion and will; something has caught fire for you.",
  butterflies: "Butterflies are change in the mind; a new way of thinking is emerging.",
};

const PICTURES = {
  // ── Major Arcana ──
  "The Fool":           { facing: "left",  symbols: ["sun", "mountains", "cliff", "flowers", "dogs", "goldsky"] },
  "The Magician":       { facing: "",      symbols: ["infinity", "flowers", "serpents", "goldsky", "trees"] },
  "The High Priestess": { facing: "",      symbols: ["moon", "pillars", "veils", "water", "thrones", "crowns"] },
  "The Empress":        { facing: "",      symbols: ["stars", "harvest", "trees", "water", "thrones", "crowns", "veils", "goldsky"] },
  "The Emperor":        { facing: "",      symbols: ["mountains", "thrones", "crowns", "water"] },
  "The Hierophant":     { facing: "",      symbols: ["pillars", "thrones", "crowns", "flowers"] },
  "The Lovers":         { facing: "",      symbols: ["angels", "nakedness", "sun", "trees", "serpents", "mountains", "clouds", "fire"] },
  "The Chariot":        { facing: "",      symbols: ["stars", "moon", "crowns", "homes", "water", "goldsky"] },
  "Strength":           { facing: "left",  symbols: ["lions", "infinity", "flowers", "mountains", "goldsky"] },
  "The Hermit":         { facing: "left",  symbols: ["stars", "mountains", "cliff"] },
  "Wheel of Fortune":   { facing: "",      symbols: ["creatures", "angels", "lions", "birds", "serpents", "clouds"] },
  "Justice":            { facing: "",      symbols: ["scales", "pillars", "veils", "thrones", "crowns"] },
  "The Hanged Man":     { facing: "",      symbols: ["trees", "bonds"] },
  "Death":              { facing: "right", symbols: ["horses", "flowers", "wreaths", "sun", "towers", "water", "children", "crowns", "sea"] },
  "Temperance":         { facing: "",      symbols: ["angels", "water", "paths", "mountains", "sun", "crowns", "flowers"] },
  "The Devil":          { facing: "",      symbols: ["bonds", "nakedness", "fire", "darksky", "thrones"] },
  "The Tower":          { facing: "",      symbols: ["towers", "fire", "crowns", "cliff", "darksky", "clouds"] },
  "The Star":           { facing: "left",  symbols: ["stars", "water", "nakedness", "birds", "trees", "mountains"] },
  "The Moon":           { facing: "",      symbols: ["moon", "dogs", "towers", "paths", "water", "mountains"] },
  "The Sun":            { facing: "",      symbols: ["sun", "children", "horses", "sunflowers", "nakedness", "wreaths"] },
  "Judgement":          { facing: "",      symbols: ["angels", "nakedness", "children", "mountains", "water", "clouds", "wreaths"] },
  "The World":          { facing: "",      symbols: ["wreaths", "creatures", "nakedness", "infinity", "clouds"] },

  // ── Wands ──
  "Ace of Wands":       { facing: "",      symbols: ["hand", "clouds", "homes", "trees", "mountains", "water"] },
  "Two of Wands":       { facing: "left",  symbols: ["sea", "water", "homes", "mountains", "flowers"] },
  "Three of Wands":     { facing: "back",  symbols: ["sea", "mountains", "cliff", "goldsky"] },
  "Four of Wands":      { facing: "",      symbols: ["wreaths", "homes", "flowers", "goldsky"] },
  "Five of Wands":      { facing: "",      symbols: [] },
  "Six of Wands":       { facing: "right", symbols: ["horses", "wreaths"] },
  "Seven of Wands":     { facing: "",      symbols: ["cliff"] },
  "Eight of Wands":     { facing: "",      symbols: ["water", "homes", "trees"] },
  "Nine of Wands":      { facing: "",      symbols: ["mountains"] },
  "Ten of Wands":       { facing: "right", symbols: ["homes", "trees"] },
  "Page of Wands":      { facing: "right", symbols: ["mountains", "serpents"] },
  "Knight of Wands":    { facing: "left",  symbols: ["horses", "mountains", "serpents"] },
  "Queen of Wands":     { facing: "",      symbols: ["sunflowers", "lions", "thrones", "crowns"] },
  "King of Wands":      { facing: "left",  symbols: ["lions", "serpents", "thrones", "crowns"] },

  // ── Cups ──
  "Ace of Cups":        { facing: "",      symbols: ["hand", "clouds", "water", "birds", "flowers"] },
  "Two of Cups":        { facing: "",      symbols: ["lions", "homes", "wreaths"] },
  "Three of Cups":      { facing: "",      symbols: ["harvest", "wreaths", "flowers"] },
  "Four of Cups":       { facing: "",      symbols: ["hand", "clouds", "trees", "mountains"] },
  "Five of Cups":       { facing: "left",  symbols: ["water", "homes", "paths", "darksky"] },
  "Six of Cups":        { facing: "",      symbols: ["children", "flowers", "homes"] },
  "Seven of Cups":      { facing: "back",  symbols: ["clouds", "serpents", "towers", "crowns", "wreaths"] },
  "Eight of Cups":      { facing: "back",  symbols: ["moon", "mountains", "water", "darksky", "paths"] },
  "Nine of Cups":       { facing: "",      symbols: ["goldsky"] },
  "Ten of Cups":        { facing: "back",  symbols: ["children", "homes", "water", "trees"] },
  "Page of Cups":       { facing: "left",  symbols: ["fish", "sea", "flowers"] },
  "Knight of Cups":     { facing: "right", symbols: ["horses", "water", "mountains", "fish"] },
  "Queen of Cups":      { facing: "left",  symbols: ["sea", "thrones", "crowns", "angels", "fish"] },
  "King of Cups":       { facing: "",      symbols: ["sea", "thrones", "crowns", "fish"] },

  // ── Swords ──
  "Ace of Swords":      { facing: "",      symbols: ["hand", "clouds", "crowns", "mountains", "wreaths"] },
  "Two of Swords":      { facing: "",      symbols: ["bonds", "moon", "sea", "water"] },
  "Three of Swords":    { facing: "",      symbols: ["clouds", "darksky"] },
  "Four of Swords":     { facing: "",      symbols: [] },
  "Five of Swords":     { facing: "",      symbols: ["sea", "clouds"] },
  "Six of Swords":      { facing: "right", symbols: ["water", "sea", "children"] },
  "Seven of Swords":    { facing: "right", symbols: ["goldsky"] },
  "Eight of Swords":    { facing: "",      symbols: ["bonds", "homes", "water"] },
  "Nine of Swords":     { facing: "",      symbols: ["darksky", "flowers"] },
  "Ten of Swords":      { facing: "",      symbols: ["darksky", "water", "mountains"] },
  "Page of Swords":     { facing: "left",  symbols: ["clouds", "birds", "mountains", "trees"] },
  "Knight of Swords":   { facing: "left",  symbols: ["horses", "clouds", "birds", "butterflies", "trees"] },
  "Queen of Swords":    { facing: "right", symbols: ["clouds", "birds", "butterflies", "thrones", "crowns"] },
  "King of Swords":     { facing: "",      symbols: ["clouds", "birds", "butterflies", "thrones", "crowns"] },

  // ── Pentacles ──
  "Ace of Pentacles":   { facing: "",      symbols: ["hand", "clouds", "flowers", "trees", "pillars", "mountains", "paths"] },
  "Two of Pentacles":   { facing: "",      symbols: ["infinity", "sea"] },
  "Three of Pentacles": { facing: "",      symbols: ["pillars"] },
  "Four of Pentacles":  { facing: "",      symbols: ["homes", "crowns"] },
  "Five of Pentacles":  { facing: "right", symbols: ["darksky"] },
  "Six of Pentacles":   { facing: "",      symbols: ["scales", "homes"] },
  "Seven of Pentacles": { facing: "left",  symbols: ["harvest", "trees"] },
  "Eight of Pentacles": { facing: "right", symbols: ["homes", "paths"] },
  "Nine of Pentacles":  { facing: "",      symbols: ["birds", "harvest", "trees", "homes", "goldsky"] },
  "Ten of Pentacles":   { facing: "",      symbols: ["dogs", "children", "pillars", "homes"] },
  "Page of Pentacles":  { facing: "right", symbols: ["trees", "mountains", "flowers", "goldsky"] },
  "Knight of Pentacles": { facing: "right", symbols: ["horses", "harvest", "goldsky"] },
  "Queen of Pentacles": { facing: "",      symbols: ["flowers", "trees", "thrones", "crowns", "mountains", "goldsky"] },
  "King of Pentacles":  { facing: "",      symbols: ["harvest", "homes", "thrones", "crowns", "goldsky"] },
};

// ───────────────────────────────────────────────────────────────
//  EYES – what the main figure's eyes rest on, where it matters:
//    "you"    – looks straight out at the reader
//    "blind"  – blindfolded
//    "hidden" – face covered or turned down, eyes out of sight
//    "closed" – eyes shut
//    ["the cup", "why"] – the thing the figure looks at, and what
//              that gaze means (shown when you hover or tap the tile)
//  Cards not listed look nowhere in particular.
// ───────────────────────────────────────────────────────────────

const EYES = {
  // ── Major Arcana ──
  "The High Priestess": "you",
  "The Empress":        "you",
  "The Hierophant":     "you",
  "The Chariot":        "you",
  "Strength":           ["the lion", "Your eyes rest on the lion: you meet your own wild side gently, and it calms."],
  "The Hermit":         ["the lantern", "Your eyes are on the lantern: your own inner light guides you, a step at a time."],
  "Justice":            "you",
  "The Hanged Man":     "you",
  "Temperance":         ["the cups", "Your eyes follow the water between the cups: you find your balance by patient mixing."],
  "The Devil":          "you",
  "The Star":           ["the water", "Your eyes are on the water you pour: you give yourself care, and it flows back."],
  "The Sun":            "you",

  // ── Wands ──
  "Two of Wands":       ["the globe", "Your eyes are on the globe: you weigh your world and how far you could go."],
  "Page of Wands":      ["the wand", "Your eyes are on the wand: a spark fascinates you, and it is yours to follow."],

  // ── Cups ──
  "Two of Cups":        ["each other", "They look at each other: you meet yourself, and others, as an equal."],
  "Four of Cups":       ["the cups", "Your eyes are on the cups before you: so fixed on what you have that you miss what's offered."],
  "Five of Cups":       ["spilled cups", "Your eyes are on the spilled cups: grief holds your gaze, while two cups still stand behind you."],
  "Six of Cups":        ["the gift", "Their eyes are on the gift: a simple kindness touches you, perhaps one to your younger self."],
  "Nine of Cups":       "you",
  "Page of Cups":       ["the fish", "Your eyes are on the fish: you're curious about a feeling or idea surfacing in you."],
  "Knight of Cups":     ["the cup", "Your eyes are on the cup you carry: you follow what your heart offers."],
  "Queen of Cups":      ["the cup", "Your eyes are on the closed cup: you listen to your feelings before they have words."],

  // ── Swords ──
  "Two of Swords":      "blind",
  "Four of Swords":     "closed",
  "Five of Swords":     "you",
  "Eight of Swords":    "blind",
  "Nine of Swords":     "hidden",
  "Ten of Swords":      "hidden",
  "King of Swords":     "you",

  // ── Pentacles ──
  "Two of Pentacles":   ["the coins", "Your eyes are on the coins: you keep your balance by minding what's in the air."],
  "Four of Pentacles":  "you",
  "Seven of Pentacles": ["the harvest", "Your eyes are on the harvest: you pause to see what your effort has grown."],
  "Eight of Pentacles": ["the work", "Your eyes are on the work: you're absorbed in your craft, better with each piece."],
  "Nine of Pentacles":  ["the falcon", "Your eyes are on the falcon: you've trained your own wild thoughts, and they rest calmly with you."],
  "Page of Pentacles":  ["the coin", "Your eyes are on the coin: you study a seed of something real you could grow."],
  "Knight of Pentacles": ["the coin", "Your eyes are on the coin: you tend what matters steadily, without hurry."],
  "Queen of Pentacles": ["the coin", "Your eyes are on the coin in your lap: you care for what you have, and it nourishes you."],
  "King of Pentacles":  ["the coin", "Your eyes rest on the coin: you enjoy what you've built, secure in your own worth."],
};
