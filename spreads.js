// ───────────────────────────────────────────────────────────────
//  YOUR SPREADS
//  Each spread has a name and one "position" per card.
//
//    label    – a short title shown under the card (e.g. "Past")
//    question – the question that card answers (optional,
//               leave it as "" until you have one)
//
//  To remove a spread, delete its whole block { ... },
// ───────────────────────────────────────────────────────────────

const SPREADS = [
  {
    name: "One card",
    positions: [
      { label: "Your card", question: "" },
    ],
  },
  {
    name: "Two cards",
    positions: [
      { label: "Card 1", question: "" },
      { label: "Card 2", question: "" },
    ],
  },
  {
    name: "Three cards",
    positions: [
      { label: "Card 1", question: "" },
      { label: "Card 2", question: "" },
      { label: "Card 3", question: "" },
    ],
  },
  {
    name: "Four cards",
    positions: [
      { label: "Card 1", question: "" },
      { label: "Card 2", question: "" },
      { label: "Card 3", question: "" },
      { label: "Card 4", question: "" },
    ],
  },
  {
    name: "Five cards",
    positions: [
      { label: "Card 1", question: "" },
      { label: "Card 2", question: "" },
      { label: "Card 3", question: "" },
      { label: "Card 4", question: "" },
      { label: "Card 5", question: "" },
    ],
  },
];

// ───────────────────────────────────────────────────────────────
//  THEMES
//  On the card table, a theme can be laid over any spread: its
//  questions go to the card places.
//
//    name   – the theme's name
//    topic  – the group it's listed under (see THEME_TOPICS below)
//    brief  – a few words for its tile in the list
//    about  – one line on what it's for, shown when the tile is opened
//    positions – five places, in the order they're read. Each has a
//             label, a question and a rank: 1 is the most important.
//             A spread of fewer cards keeps the most important ones
//             (a 3-card spread takes ranks 1–3), still in this order.
// ───────────────────────────────────────────────────────────────

const THEMES_LIST = [
  // Fear
  {
    name: "Meeting a fear", topic: "Fear",
    about: "Look a fear in the eye, from its roots to the way through.",
    brief: "Face it, from root to courage",
    positions: [
      { label: "The fear", rank: 1, question: "What fear am I carrying most right now?" },
      { label: "Its roots", rank: 4, question: "Where did this fear first take hold?" },
      { label: "Its grip", rank: 3, question: "How does it hold me back?" },
      { label: "Its message", rank: 5, question: "What is it trying to protect me from?" },
      { label: "Courage", rank: 2, question: "What would help me face it?" },
    ],
  },
  {
    name: "Fear or intuition?", topic: "Fear",
    about: "When a warning feels loud, tell old fear from inner knowing.",
    brief: "Old alarm or true knowing",
    positions: [
      { label: "The warning", rank: 3, question: "What is this alarm about?" },
      { label: "Fear's voice", rank: 2, question: "What is fear telling me?" },
      { label: "Intuition", rank: 1, question: "What does my intuition say instead?" },
      { label: "The difference", rank: 4, question: "How can I tell the two apart?" },
      { label: "Trust", rank: 5, question: "What can I safely trust here?" },
    ],
  },
  {
    name: "One brave step", topic: "Fear",
    about: "Something you've been avoiding, and the smallest way in.",
    brief: "Ease into what you avoid",
    positions: [
      { label: "What I avoid", rank: 2, question: "What have I been avoiding?" },
      { label: "The cost", rank: 3, question: "What does avoiding it cost me?" },
      { label: "What I gain", rank: 5, question: "What could open up if I faced it?" },
      { label: "Support", rank: 4, question: "What or who can support me?" },
      { label: "Brave step", rank: 1, question: "What is one small, brave step I could take?" },
    ],
  },

  // Feelings
  {
    name: "Naming a feeling", topic: "Feelings",
    about: "For a feeling that's hard to put into words.",
    brief: "Find words for what you feel",
    positions: [
      { label: "The feeling", rank: 1, question: "What am I feeling beneath the surface?" },
      { label: "In my body", rank: 5, question: "Where do I feel it in my body?" },
      { label: "Its source", rank: 4, question: "Where is this feeling coming from?" },
      { label: "Its need", rank: 2, question: "What does this feeling need from me?" },
      { label: "Release", rank: 3, question: "How can I let it move through me?" },
    ],
  },
  {
    name: "Recognising my needs", topic: "Feelings",
    about: "Notice what you need, and learn to ask for it.",
    brief: "Notice, meet and ask",
    positions: [
      { label: "A need", rank: 1, question: "What is something I need right now?" },
      { label: "Meeting it", rank: 2, question: "What can I do to meet that need?" },
      { label: "Noticing", rank: 4, question: "How can I get better at noticing my needs?" },
      { label: "Awareness", rank: 5, question: "What should I be more aware of about my needs?" },
      { label: "Asking", rank: 3, question: "How can I share my needs with the people around me?" },
    ],
  },
  {
    name: "Anger's message", topic: "Feelings",
    about: "Anger often guards a boundary. Find what it's standing up for.",
    brief: "What your anger stands up for",
    positions: [
      { label: "The anger", rank: 1, question: "What is my anger really about?" },
      { label: "Beneath it", rank: 4, question: "What softer feeling sits underneath it?" },
      { label: "The line", rank: 2, question: "Which of my lines was crossed?" },
      { label: "Its energy", rank: 5, question: "What could this energy fuel?" },
      { label: "Clean action", rank: 3, question: "How can I act on it without causing harm?" },
    ],
  },
  {
    name: "Moving through grief", topic: "Feelings",
    about: "For a loss of any kind: a person, a place, a hope.",
    brief: "Carry the loss, find new growth",
    positions: [
      { label: "The loss", rank: 1, question: "What am I grieving?" },
      { label: "The weight", rank: 3, question: "What am I still carrying?" },
      { label: "What stays", rank: 4, question: "What of it stays with me?" },
      { label: "Comfort", rank: 2, question: "What comforts me while I grieve?" },
      { label: "New growth", rank: 5, question: "What is slowly growing in its place?" },
    ],
  },

  // Mind
  {
    name: "Gentle check-in", topic: "Mind",
    about: "A quick, kind look at how you're doing.",
    brief: "Mind, body and heart today",
    positions: [
      { label: "Mind", rank: 2, question: "How is my mind today?" },
      { label: "Body", rank: 3, question: "What is my body telling me?" },
      { label: "Heart", rank: 1, question: "What does my heart need?" },
      { label: "Spirit", rank: 5, question: "What lifts my spirit?" },
      { label: "Kindness", rank: 4, question: "What kindness can I offer myself today?" },
    ],
  },
  {
    name: "Untangling a worry", topic: "Mind",
    about: "Separate the worry from the story and the facts.",
    brief: "The story apart from the facts",
    positions: [
      { label: "The worry", rank: 1, question: "What am I worried about?" },
      { label: "The story", rank: 3, question: "What story am I telling myself about it?" },
      { label: "The facts", rank: 4, question: "What do I actually know?" },
      { label: "In my hands", rank: 5, question: "What part of it is in my control?" },
      { label: "Kind step", rank: 2, question: "What is one kind thing I can do about it?" },
    ],
  },
  {
    name: "The inner critic", topic: "Mind",
    about: "Hear the critic out, then find a kinder voice.",
    brief: "Find a kinder voice",
    positions: [
      { label: "The critic", rank: 1, question: "What does my inner critic keep saying?" },
      { label: "Its origin", rank: 5, question: "Whose voice did it learn from?" },
      { label: "Its fear", rank: 3, question: "What is it afraid would happen if it stopped?" },
      { label: "The truth", rank: 4, question: "What is actually true about me?" },
      { label: "Kind voice", rank: 2, question: "What would a kinder voice say instead?" },
    ],
  },
  {
    name: "Low-energy days", topic: "Mind",
    about: "For days when everything feels heavy.",
    brief: "Small steps on heavy days",
    positions: [
      { label: "What drains me", rank: 2, question: "What is draining my energy?" },
      { label: "Let it go", rank: 4, question: "What can I let go of today?" },
      { label: "What restores", rank: 3, question: "What gently restores me?" },
      { label: "A small joy", rank: 5, question: "What small joy is within reach?" },
      { label: "Smallest step", rank: 1, question: "What is the smallest step that would help today?" },
    ],
  },

  // Body
  {
    name: "Listening to the body", topic: "Body",
    about: "Let your body have its say.",
    brief: "What your body asks for",
    positions: [
      { label: "Its message", rank: 1, question: "What is my body asking for?" },
      { label: "Holding", rank: 3, question: "Where am I holding tension?" },
      { label: "Nourishment", rank: 2, question: "What would truly nourish me?" },
      { label: "Movement", rank: 4, question: "How does my body want to move?" },
      { label: "Gratitude", rank: 5, question: "What can I thank my body for?" },
    ],
  },
  {
    name: "True rest", topic: "Body",
    about: "What tires you, and what would really restore you.",
    brief: "What truly restores you",
    positions: [
      { label: "What tires me", rank: 2, question: "What is wearing me out?" },
      { label: "Resistance", rank: 4, question: "What stops me from resting?" },
      { label: "Real rest", rank: 1, question: "What would real rest look like for me?" },
      { label: "Sleep", rank: 5, question: "What would help me sleep more deeply?" },
      { label: "Permission", rank: 3, question: "What do I need to give myself permission for?" },
    ],
  },

  // Dreams
  {
    name: "Dream analysis", topic: "Dreams",
    about: "Jung saw dreams unfold like a play in four acts: setting, plot, turn and ending.",
    brief: "A dream's story in four acts",
    positions: [
      { label: "The setting", rank: 3, question: "What does the dream's opening scene say about where I am?" },
      { label: "The plot", rank: 4, question: "What tension is building, in the dream and in me?" },
      { label: "The turn", rank: 2, question: "What is the dream's decisive moment showing me?" },
      { label: "The ending", rank: 5, question: "What does the way it ends, or doesn't, ask of me?" },
      { label: "The meaning", rank: 1, question: "What is this dream trying to tell me?" },
    ],
  },
  {
    name: "A dream symbol", topic: "Dreams",
    about: "For one image from a dream that stayed with you.",
    brief: "One image, unpacked",
    positions: [
      { label: "The symbol", rank: 1, question: "What is this symbol pointing to?" },
      { label: "Its feeling", rank: 4, question: "What feeling does it carry?" },
      { label: "In waking life", rank: 2, question: "Where does it show up in my waking life?" },
      { label: "Its shadow", rank: 5, question: "What is uncomfortable about it?" },
      { label: "Its gift", rank: 3, question: "What is it offering me?" },
    ],
  },
  {
    name: "A recurring dream", topic: "Dreams",
    about: "A dream that keeps coming back usually has something unfinished.",
    brief: "What it leaves unfinished",
    positions: [
      { label: "The pattern", rank: 2, question: "What keeps repeating in this dream?" },
      { label: "First time", rank: 5, question: "What was happening when it first began?" },
      { label: "Unfinished", rank: 1, question: "What is still unresolved in me?" },
      { label: "Its plea", rank: 4, question: "What is it asking me to notice?" },
      { label: "Resolution", rank: 3, question: "What would let this dream rest?" },
    ],
  },

  // Spirit
  {
    name: "Next soul lesson", topic: "Spirit",
    about: "The lesson coming toward you, and how to meet it gracefully.",
    brief: "The lesson ahead, met with grace",
    positions: [
      { label: "The lesson", rank: 1, question: "What is my next soul lesson?" },
      { label: "How it shows", rank: 3, question: "How will this lesson show itself?" },
      { label: "With grace", rank: 2, question: "How can I take it in gracefully?" },
      { label: "Why it fits", rank: 5, question: "Why does this lesson fit who I truly am?" },
      { label: "Its gift", rank: 4, question: "What will open up for me through it?" },
    ],
  },
  {
    name: "Message from within", topic: "Spirit",
    about: "A quiet message, and what to do with it.",
    brief: "A quiet word from inside",
    positions: [
      { label: "Message", rank: 1, question: "What does my inner self want me to hear today?" },
      { label: "Why today", rank: 4, question: "Why does this matter right now?" },
      { label: "Listening", rank: 3, question: "How can I hear my inner self more clearly?" },
      { label: "Doubt", rank: 5, question: "What makes me doubt this voice?" },
      { label: "Living it", rank: 2, question: "How can I live this message today?" },
    ],
  },
  {
    name: "Spiritual path", topic: "Spirit",
    about: "Where you stand on your path, and what calls you on.",
    brief: "Where you stand, what calls you",
    positions: [
      { label: "Where I stand", rank: 1, question: "Where am I on my spiritual path?" },
      { label: "Left behind", rank: 4, question: "What have I outgrown?" },
      { label: "What calls me", rank: 2, question: "What is calling me forward?" },
      { label: "Practice", rank: 5, question: "What practice would deepen my path?" },
      { label: "My guide", rank: 3, question: "What can I trust to guide me?" },
    ],
  },

  // Chakras
  {
    name: "Lower chakras", topic: "Chakras",
    about: "Root, sacral and solar plexus: safety, feeling and personal power.",
    brief: "Safety, feeling and power",
    positions: [
      { label: "Root", rank: 1, question: "What would help me feel safe and grounded?" },
      { label: "Sacral", rank: 2, question: "What guilt or shame am I ready to release?" },
      { label: "Creativity", rank: 5, question: "Where does my creative energy want to flow?" },
      { label: "Solar plexus", rank: 3, question: "How can I feel more confident?" },
      { label: "Willpower", rank: 4, question: "Where do I need to stand my ground?" },
    ],
  },
  {
    name: "Upper chakras", topic: "Chakras",
    about: "Heart, throat, third eye and crown: love, voice, insight and spirit.",
    brief: "Love, voice, insight, spirit",
    positions: [
      { label: "Heart", rank: 1, question: "How can I care for myself more lovingly?" },
      { label: "Throat", rank: 2, question: "What do I need to say?" },
      { label: "Third eye", rank: 3, question: "How can I connect with my inner wisdom?" },
      { label: "Crown", rank: 4, question: "What is the universe telling me?" },
      { label: "Grounding", rank: 5, question: "How can I ground this in daily life?" },
    ],
  },
  {
    name: "Chakra balance", topic: "Chakras",
    about: "Where your energy runs too high, too low, and how to even it out.",
    brief: "Too much, too little, balance",
    positions: [
      { label: "Strongest", rank: 4, question: "Where does my energy flow most freely?" },
      { label: "Overactive", rank: 2, question: "Where is my energy running too hot?" },
      { label: "Blocked", rank: 1, question: "Where is my energy stuck?" },
      { label: "Flow", rank: 5, question: "What would help the stuck energy move?" },
      { label: "Balancing", rank: 3, question: "What would bring me back into balance?" },
    ],
  },

  // Jung
  {
    name: "Persona and shadow", topic: "Jung",
    about: "The face you show, the parts you hide, and how they meet.",
    brief: "The face shown, the self hidden",
    positions: [
      { label: "Persona", rank: 2, question: "What face do I show the world?" },
      { label: "Its cost", rank: 4, question: "What does keeping it up cost me?" },
      { label: "Shadow", rank: 1, question: "What part of me do I keep hidden?" },
      { label: "Its gift", rank: 5, question: "What strength is hidden in my shadow?" },
      { label: "Integration", rank: 3, question: "How can the two come together?" },
    ],
  },
  {
    name: "Shadow work", topic: "Jung",
    about: "What you push away holds energy, and often a strength.",
    brief: "Reclaim what you push away",
    positions: [
      { label: "The shadow", rank: 1, question: "What part of myself have I pushed away?" },
      { label: "Why I hid it", rank: 4, question: "Why did I learn to hide it?" },
      { label: "How it shows", rank: 3, question: "How does it show up in my reactions to others?" },
      { label: "Hidden gold", rank: 5, question: "What strength is hidden in it?" },
      { label: "Embracing it", rank: 2, question: "How can I welcome it back?" },
    ],
  },
  {
    name: "Individuation", topic: "Jung",
    about: "Jung's lifelong journey toward becoming whole.",
    brief: "Becoming whole, after Jung",
    positions: [
      { label: "Persona", rank: 4, question: "What role am I ready to loosen?" },
      { label: "Shadow", rank: 2, question: "What disowned part is asking to be seen?" },
      { label: "Anima/Animus", rank: 5, question: "What does my inner opposite want me to know?" },
      { label: "The Self", rank: 3, question: "What does my whole self look like?" },
      { label: "Next step", rank: 1, question: "What is my next step toward wholeness?" },
    ],
  },
  {
    name: "Archetypes", topic: "Jung",
    about: "The patterns you live out, the ones you neglect, and the one calling you.",
    brief: "The patterns you live out",
    positions: [
      { label: "Lived", rank: 1, question: "Which archetype am I living out most?" },
      { label: "Overplayed", rank: 4, question: "Where am I leaning on it too much?" },
      { label: "Neglected", rank: 3, question: "Which one have I left behind?" },
      { label: "Calling", rank: 2, question: "Which one is calling me now?" },
      { label: "Embodying", rank: 5, question: "How can I step into it?" },
    ],
  },
  {
    name: "The call", topic: "Jung",
    about: "The hero's journey, from the call to the first threshold.",
    brief: "The hero's first steps",
    positions: [
      { label: "The call", rank: 1, question: "What is calling me to change?" },
      { label: "The refusal", rank: 3, question: "What makes me hesitate to answer?" },
      { label: "The mentor", rank: 4, question: "Who or what can guide me?" },
      { label: "Threshold", rank: 2, question: "What does crossing over ask of me?" },
      { label: "The reward", rank: 5, question: "What might I bring back?" },
    ],
  },

  // Parts (Internal Family Systems)
  {
    name: "Meeting a part", topic: "Parts",
    about: "Get to know one part of you, and the hurt it may be guarding.",
    brief: "A part of you, and its job",
    positions: [
      { label: "The part", rank: 1, question: "Which part of me is asking for attention?" },
      { label: "Its job", rank: 3, question: "What job does it do for me?" },
      { label: "Its worry", rank: 4, question: "What does it fear would happen if it stopped?" },
      { label: "What it guards", rank: 5, question: "Which younger, hurt part is it protecting?" },
      { label: "From Self", rank: 2, question: "How can I meet it with calm and curiosity?" },
    ],
  },
  {
    name: "Protectors and exiles", topic: "Parts",
    about: "Two kinds of protector, and the exile they both keep safe.",
    brief: "Who guards which hurt",
    positions: [
      { label: "Manager", rank: 2, question: "Which part of me tries to keep everything under control?" },
      { label: "Firefighter", rank: 3, question: "Which part rushes in when the pain breaks through?" },
      { label: "Exile", rank: 1, question: "What old hurt are they both guarding?" },
      { label: "Unburdening", rank: 5, question: "What would the exile need to let its burden go?" },
      { label: "Self", rank: 4, question: "How can I be with all of them at once?" },
    ],
  },
  {
    name: "Self-energy", topic: "Parts",
    about: "Some of the qualities of the Self, the calm centre beneath every part.",
    brief: "Calm, curious, kind",
    positions: [
      { label: "Calm", rank: 1, question: "Where could I bring more calm?" },
      { label: "Curiosity", rank: 3, question: "What could I meet with curiosity instead of judgement?" },
      { label: "Compassion", rank: 2, question: "Who or what needs my compassion?" },
      { label: "Clarity", rank: 5, question: "What would I see if my parts stepped back?" },
      { label: "Courage", rank: 4, question: "Where is courage asking to lead?" },
    ],
  },

  // Flashbacks (emotional flashbacks, after Pete Walker)
  {
    name: "In a flashback", topic: "Flashbacks",
    about: "For when an old feeling floods the present. Go gently.",
    brief: "Ground yourself, gently",
    positions: [
      { label: "Safe now", rank: 1, question: "What reminds me that I am safe now?" },
      { label: "The trigger", rank: 4, question: "What set this feeling off?" },
      { label: "Old feeling", rank: 5, question: "What younger time does this feel like?" },
      { label: "Inner child", rank: 3, question: "What does my younger self need to hear?" },
      { label: "Grounding", rank: 2, question: "What brings me back into my body?" },
    ],
  },
  {
    name: "After a flashback", topic: "Flashbacks",
    about: "Once the wave has passed: understand it, and comfort yourself.",
    brief: "Understand it, then comfort",
    positions: [
      { label: "The wave", rank: 2, question: "What came over me?" },
      { label: "Old wound", rank: 3, question: "Where does it come from?" },
      { label: "The critic", rank: 5, question: "What is my inner critic saying, and what is the truth?" },
      { label: "Comfort", rank: 1, question: "How can I comfort myself today?" },
      { label: "Safe people", rank: 4, question: "Who can I turn to for support?" },
    ],
  },
  {
    name: "Fight, flight, freeze, fawn", topic: "Flashbacks",
    about: "The four survival responses: which one you reach for, and why.",
    brief: "Your survival reflexes",
    positions: [
      { label: "Fight", rank: 2, question: "When do I push back hard, and what am I protecting?" },
      { label: "Flight", rank: 3, question: "What do I run from, or keep busy to avoid?" },
      { label: "Freeze", rank: 4, question: "When do I shut down?" },
      { label: "Fawn", rank: 5, question: "Where do I please others to stay safe?" },
      { label: "Feeling safe", rank: 1, question: "What helps me feel safe enough to choose?" },
    ],
  },

  // Self
  {
    name: "True to myself", topic: "Self",
    about: "How it feels to be yourself, and where you could be more so.",
    brief: "Live more as yourself",
    positions: [
      { label: "Feeling true", rank: 3, question: "How can I tell when I'm being true to myself?" },
      { label: "Hidden part", rank: 1, question: "What part of myself do I hide away?" },
      { label: "Why I hide", rank: 5, question: "What am I afraid would happen if it were seen?" },
      { label: "Showing up", rank: 4, question: "Where could I show up more fully as myself?" },
      { label: "Small honour", rank: 2, question: "What small act would honour my true self?" },
    ],
  },
  {
    name: "Boundaries", topic: "Self",
    about: "Where you give too much, and how to hold your ground kindly.",
    brief: "Say no, kindly and clearly",
    positions: [
      { label: "Too thin", rank: 1, question: "Where do I give more than I can?" },
      { label: "Why I give", rank: 4, question: "What makes it hard to say no?" },
      { label: "What I protect", rank: 3, question: "What is worth protecting?" },
      { label: "Saying it", rank: 2, question: "How can I say no kindly and clearly?" },
      { label: "Holding it", rank: 5, question: "How can I hold the line once it's drawn?" },
    ],
  },
  {
    name: "Creative block", topic: "Self",
    about: "What stands between you and making things.",
    brief: "Find the spark again",
    positions: [
      { label: "The block", rank: 1, question: "What is blocking my creativity?" },
      { label: "The fear", rank: 4, question: "What am I afraid my work will show?" },
      { label: "The spark", rank: 3, question: "What still lights me up?" },
      { label: "Play", rank: 5, question: "Where could I play instead of perform?" },
      { label: "First move", rank: 2, question: "What is one playful way to begin?" },
    ],
  },

  // Journey
  {
    name: "Crossroads", topic: "Journey",
    about: "Two ways ahead, and what you need to choose well.",
    brief: "Choose between two paths",
    positions: [
      { label: "Where I stand", rank: 4, question: "Where am I standing at this crossroads?" },
      { label: "Left path", rank: 2, question: "Where does the first path lead?" },
      { label: "Right path", rank: 3, question: "Where does the second path lead?" },
      { label: "My values", rank: 5, question: "What matters most to me in this choice?" },
      { label: "What I need", rank: 1, question: "What do I need to know to choose?" },
    ],
  },
  {
    name: "Endings and beginnings", topic: "Journey",
    about: "For a chapter closing and a new one opening.",
    brief: "Close one chapter, open the next",
    positions: [
      { label: "What ends", rank: 1, question: "What is coming to an end?" },
      { label: "Gratitude", rank: 4, question: "What am I grateful for in this chapter?" },
      { label: "What lingers", rank: 3, question: "What do I still need to let go of?" },
      { label: "Transition", rank: 5, question: "How can I be gentle with the in-between?" },
      { label: "What begins", rank: 2, question: "What is beginning?" },
    ],
  },
];

// The groups of themes, in order, each with a short note.
const THEME_TOPICS = {
  Fear:       "Meet fear with curiosity rather than force.",
  Feelings:   "Name what you feel, and what it needs.",
  Mind:       "Gentle check-ins for a busy or heavy mind. A reflection, not a replacement for care.",
  Body:       "Listen to what your body is telling you.",
  Dreams:     "Read a dream's story and symbols, after Carl Jung.",
  Spirit:     "Lessons, messages and the path you're on.",
  Chakras:    "The seven energy centres, from root to crown.",
  Jung:       "Persona, shadow, archetypes and the journey to wholeness.",
  Parts:      "Internal Family Systems: every part of you has a reason, and a Self beneath them all.",
  Flashbacks: "Emotional flashbacks: old feelings flooding the present, often with no memory attached (Pete Walker). Go gently, and reach out for support if you need it.",
  Self:       "Authenticity, boundaries and creativity.",
  Journey:    "Crossroads, endings and new chapters.",
};

// A theme's places for a spread of n cards: its n most important,
// in the order they're read.
function themePlaces(theme, n) {
  return theme.positions
    .map((p, k) => ({ ...p, k }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, n)
    .sort((a, b) => a.k - b.k)
    .map(({ label, question }) => ({ label, question }));
}
