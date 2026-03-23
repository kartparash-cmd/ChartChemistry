/**
 * Unique content for each of the 78 zodiac sign pair compatibility pages.
 * Every pair has hand-written, sign-specific content covering strengths,
 * challenges, emotional dynamics, communication style, famous couples, and advice.
 */

export interface ZodiacPairContent {
  strengths: string[];
  challenges: string[];
  emotionalDynamics: string;
  communicationStyle: string;
  famousCouples: { names: string; signs: string }[];
  advice: string;
}

type PairKey = string; // "aries-aries", "aries-taurus", etc.

const PAIR_CONTENT: Record<PairKey, ZodiacPairContent> = {
  // ─── ARIES PAIRS ─────────────────────────────────────────────
  "aries-aries": {
    strengths: [
      "Unmatched energy and enthusiasm — this couple never runs out of things to do together",
      "Deep mutual respect for each other's independence and ambition",
      "A fearless approach to life that makes them willing to take bold risks as a team",
    ],
    challenges: [
      "Two dominant personalities can lead to explosive arguments over who takes the lead",
      "Neither partner naturally gravitates toward compromise, making conflict resolution difficult",
      "Impatience on both sides can cause them to abandon projects (and conversations) prematurely",
    ],
    emotionalDynamics:
      "Two Aries together create an emotionally high-voltage relationship. Feelings are expressed instantly and intensely — there is no simmering or suppressing with this pair. While the passion is electrifying, both partners need to learn that vulnerability is not weakness, as their instinct is to power through emotions rather than sit with them.",
    communicationStyle:
      "Direct to the point of bluntness, Aries-Aries communication is fast-paced and honest. They rarely hold grudges because issues are aired immediately. The challenge is learning to listen as enthusiastically as they speak — conversations can become competitive monologues if neither yields the floor.",
    famousCouples: [
      { names: "Sarah Jessica Parker & Matthew Broderick", signs: "Aries & Aries" },
      { names: "Mariah Carey & Nick Cannon (dated)", signs: "Aries & Aries" },
    ],
    advice:
      "Take turns leading. Establish a rhythm where one Aries holds the reins on certain decisions while the other takes charge elsewhere. Your shared fire burns brightest when you are allies, not rivals.",
  },

  "aries-taurus": {
    strengths: [
      "Aries brings excitement and spontaneity that pulls Taurus out of their comfort zone",
      "Taurus provides grounding stability that gives Aries a safe base to return to",
      "Together they balance impulsiveness with practicality, making them effective partners in achieving goals",
    ],
    challenges: [
      "Aries' need for speed clashes with Taurus' measured, deliberate pace",
      "Taurus may find Aries reckless, while Aries sees Taurus as frustratingly stubborn",
      "Financial disagreements are common — Aries spends freely while Taurus prioritizes security",
    ],
    emotionalDynamics:
      "Taurus processes emotions slowly and deeply, building toward a steady flame, while Aries experiences feelings in sudden bursts. This mismatch can leave Aries feeling like Taurus is emotionally unavailable and Taurus feeling overwhelmed by Aries' intensity. When they sync up, however, Taurus' constancy gives Aries' passion a safe container.",
    communicationStyle:
      "Aries communicates with urgency and directness while Taurus prefers to think before speaking. Arguments can stall when Aries pushes for immediate resolution and Taurus shuts down under pressure. The sweet spot is giving Taurus processing time while Aries practices patience — a genuine growth opportunity for both.",
    famousCouples: [
      { names: "Victoria & David Beckham", signs: "Aries & Taurus" },
    ],
    advice:
      "Respect each other's internal clock. Aries, give Taurus time to warm up to new ideas. Taurus, push yourself to occasionally say yes before you have every detail figured out. Your differences are your superpower when wielded with mutual respect.",
  },

  "aries-gemini": {
    strengths: [
      "An incredibly fun, high-energy pairing that thrives on adventure and new experiences",
      "Gemini's wit and Aries' boldness create a socially magnetic duo",
      "Both value independence, so neither feels smothered in the relationship",
    ],
    challenges: [
      "Both signs can be restless, making it hard to build lasting depth or follow through on plans",
      "Aries' directness can wound Gemini's more nuanced emotional nature",
      "Commitment timelines often differ — Aries charges in while Gemini needs to weigh options",
    ],
    emotionalDynamics:
      "This is a lively emotional pairing where feelings are often channeled through action (Aries) and conversation (Gemini). Neither sign is naturally inclined to deep emotional processing, which can feel liberating or superficial depending on perspective. Building emotional intimacy requires intentional slowing down from both partners.",
    communicationStyle:
      "Communication is a genuine strength here. Gemini loves to talk and Aries loves to engage — conversations are animated, playful, and intellectually stimulating. They can debate for hours without either taking it personally. The risk is all talk and no follow-through on the plans they excitedly make together.",
    famousCouples: [
      { names: "Angelina Jolie & Johnny Depp (rumored)", signs: "Gemini & Aries-adjacent" },
      { names: "Fictional: Han Solo & Princess Leia", signs: "Adventurer meets quick wit" },
    ],
    advice:
      "Channel your shared restless energy into joint adventures — travel, creative projects, new hobbies. But schedule regular check-ins where you go beyond banter and share what you are actually feeling beneath the surface.",
  },

  "aries-cancer": {
    strengths: [
      "Aries' courage helps Cancer step outside their protective shell and take emotional risks",
      "Cancer's nurturing nature provides the warmth and care that Aries secretly craves",
      "Both are cardinal signs with natural leadership qualities, driving the relationship forward",
    ],
    challenges: [
      "Aries' blunt communication can deeply wound sensitive Cancer",
      "Cancer's moodiness and need for emotional processing frustrates action-oriented Aries",
      "Different definitions of security — Aries finds it in independence, Cancer in closeness",
    ],
    emotionalDynamics:
      "This pairing runs on emotional contrast. Cancer feels everything deeply and needs time to process, while Aries experiences emotions as fuel for action. Cancer can teach Aries the richness of emotional depth, and Aries can show Cancer that not every feeling needs to be analyzed. The friction here is also where the growth lives.",
    communicationStyle:
      "Misunderstandings are common because they speak different emotional languages. Aries says exactly what they mean with little filter, while Cancer communicates through mood, tone, and implication. Aries must learn to read between the lines; Cancer must learn to state needs directly rather than hoping Aries will intuit them.",
    famousCouples: [
      { names: "Tom Hanks & Rita Wilson", signs: "Cancer & Aries" },
    ],
    advice:
      "Create a safe word or ritual for when things escalate. Aries, practice softening your delivery without diluting your honesty. Cancer, practice stating your needs out loud rather than retreating into your shell. You protect each other best when you meet in the middle.",
  },

  "aries-leo": {
    strengths: [
      "A powerhouse Fire-Fire pairing bursting with passion, confidence, and mutual admiration",
      "Both signs are generous and warm-hearted, creating an atmosphere of lavish affection",
      "They inspire each other to reach higher and cheer each other on without jealousy",
    ],
    challenges: [
      "Both crave the spotlight, which can create competition rather than collaboration",
      "Leo's need for adoration may clash with Aries' self-focused nature",
      "Arguments between two strong wills can become dramatic and prolonged",
    ],
    emotionalDynamics:
      "Emotions run hot and expressive in this pairing. Both Aries and Leo wear their hearts openly and expect the same from their partner. Leo needs consistent affirmation and loyalty, while Aries needs to feel respected and never controlled. When both feel seen, this is one of the most passionately fulfilling combinations in the zodiac.",
    communicationStyle:
      "Bold, theatrical, and honest. These two communicate with grand gestures and strong opinions. Leo adds dramatic flair while Aries brings raw directness. Fights can be loud but are usually resolved quickly because neither holds grudges for long. The key is ensuring conversations do not become performances for an audience of one.",
    famousCouples: [
      { names: "Barack & Michelle Obama (Leo & Capricorn/Aries energy)", signs: "Leo & Aries-adjacent" },
      { names: "Ben Affleck & Jennifer Lopez", signs: "Leo & Leo (similar fire energy)" },
    ],
    advice:
      "Make room for two stars in one sky. Celebrate each other's victories as enthusiastically as your own. When conflict arises, remember you are on the same team — channel your combined fire into building something magnificent together.",
  },

  "aries-virgo": {
    strengths: [
      "Virgo's attention to detail complements Aries' big-picture vision, forming an effective partnership",
      "Aries motivates Virgo to stop overthinking and take action on their carefully laid plans",
      "Both share a work ethic — Aries charges forward while Virgo ensures nothing is overlooked",
    ],
    challenges: [
      "Virgo's constructive criticism can feel like nagging to impatient Aries",
      "Aries' impulsiveness and messiness triggers Virgo's anxiety about order and control",
      "Different social needs — Aries is spontaneously social while Virgo prefers curated environments",
    ],
    emotionalDynamics:
      "Emotionally, these two operate on very different frequencies. Aries is passionate and reactive while Virgo is analytical and measured. Virgo may struggle to match Aries' emotional intensity, and Aries may feel that Virgo intellectualizes feelings instead of actually experiencing them. Patience and curiosity about each other's inner world are essential.",
    communicationStyle:
      "Aries speaks in bold strokes while Virgo communicates in precise, well-chosen words. Virgo's tendency to point out flaws can feel like an attack to Aries, who takes criticism personally. Aries' sweeping statements frustrate detail-oriented Virgo. Finding a common language means Aries learning nuance and Virgo learning to lead with appreciation.",
    famousCouples: [
      { names: "Pink & Carey Hart", signs: "Virgo & Aries" },
    ],
    advice:
      "Appreciate what you each bring to the table instead of trying to change each other. Aries, value Virgo's thoughtfulness as care, not criticism. Virgo, admire Aries' courage as inspiration, not recklessness. You are stronger together than you look on paper.",
  },

  "aries-libra": {
    strengths: [
      "As opposite signs, they share magnetic attraction and the potential for deep complementarity",
      "Libra softens Aries' rough edges while Aries empowers Libra to be more decisive",
      "Together they balance independence (Aries) with partnership (Libra), learning from each other",
    ],
    challenges: [
      "Aries' directness can feel aggressive to harmony-seeking Libra",
      "Libra's indecisiveness drives action-oriented Aries up the wall",
      "Aries operates from 'me' and Libra from 'we,' creating fundamentally different relationship priorities",
    ],
    emotionalDynamics:
      "This opposite-sign pairing creates a fascinating emotional dance. Aries is emotionally straightforward — what you see is what you get. Libra filters emotions through social awareness and may suppress their own needs to keep the peace. Aries can help Libra express authentic emotions, while Libra teaches Aries to consider the emotional impact of their actions.",
    communicationStyle:
      "Libra communicates diplomatically, carefully weighing words for fairness and balance. Aries communicates like a battering ram — honest but not always tactful. This creates a dynamic where Libra feels steamrolled and Aries feels like Libra never says what they really think. Finding the middle ground between diplomacy and directness is this pair's communication homework.",
    famousCouples: [
      { names: "Bonnie & Clyde (historically)", signs: "Libra & Aries-adjacent" },
      { names: "F. Scott & Zelda Fitzgerald", signs: "Libra & Aries" },
    ],
    advice:
      "Lean into the opposites-attract dynamic rather than fighting it. Aries, slow down enough to hear Libra's perspective. Libra, state your preferences clearly — Aries actually respects directness far more than hints. Your axis is about balancing self and other.",
  },

  "aries-scorpio": {
    strengths: [
      "Both ruled by Mars, they share an intense, magnetic passion that few pairings can match",
      "Neither shies away from confrontation, creating a relationship built on radical honesty",
      "Together they form a fearless duo willing to face life's challenges head-on",
    ],
    challenges: [
      "Power struggles are inevitable — both need to feel in control",
      "Scorpio's possessiveness clashes with Aries' need for freedom and independence",
      "Arguments can become destructive, as both know how to push the other's buttons",
    ],
    emotionalDynamics:
      "This is one of the most emotionally intense pairings in the zodiac. Scorpio's emotions run deep and transformative while Aries' emotions burn hot and fast. Scorpio wants complete emotional transparency while Aries may not have that level of self-awareness. When trust is established, the emotional bond is unbreakable, but getting there requires navigating a minefield of vulnerability.",
    communicationStyle:
      "Both are direct communicators, but their styles differ profoundly. Aries is upfront and moves on quickly. Scorpio remembers every word and reads layers of meaning into everything. Scorpio may use silence as a weapon while Aries uses volume. Productive communication requires Aries to develop depth and Scorpio to release grudges.",
    famousCouples: [
      { names: "Ryan Reynolds & Scarlett Johansson (formerly)", signs: "Scorpio & Aries-adjacent" },
    ],
    advice:
      "Build trust deliberately and protect it fiercely. This relationship either becomes an unstoppable force or a destructive cycle — there is no lukewarm. Choose transparency over manipulation, and direct your combined warrior energy toward shared goals rather than each other.",
  },

  "aries-sagittarius": {
    strengths: [
      "Fellow Fire signs who share a love of adventure, optimism, and living life at full throttle",
      "Both value independence and give each other ample freedom without jealousy",
      "Their shared enthusiasm and humor make this one of the most genuinely fun pairings",
    ],
    challenges: [
      "Both can be commitment-averse, making it hard to deepen the relationship beyond the adventure phase",
      "Sagittarius' blunt philosophical lectures can bore action-oriented Aries",
      "Neither is naturally inclined to handle mundane responsibilities like bills and household management",
    ],
    emotionalDynamics:
      "Emotionally, this is a light and warm pairing. Both express affection through shared experiences and laughter rather than heavy emotional processing. This feels incredibly freeing but can mean deeper emotional wounds go unaddressed. They both need to occasionally slow down and check in beneath the surface of their perpetual good times.",
    communicationStyle:
      "Open, honest, and often hilarious. Aries and Sagittarius communicate with infectious energy and neither takes offense easily. Sagittarius brings philosophical depth while Aries brings decisive clarity. Disagreements are resolved quickly, often ending in laughter. They just need to make sure humor is not used to deflect from serious topics.",
    famousCouples: [
      { names: "Brad Pitt & Jennifer Aniston (Sagittarius & Aquarius/fire energy)", signs: "Fire-Fire dynamic" },
      { names: "Jay-Z & Beyonce", signs: "Sagittarius & Virgo (fire-earth contrast)" },
    ],
    advice:
      "Your relationship is the adventure of a lifetime — but even adventurers need a home base. Build routines and rituals that anchor your connection. Make sure you are running toward something together, not just running from standing still.",
  },

  "aries-capricorn": {
    strengths: [
      "Both are cardinal signs with powerful drive and ambition, creating a goal-crushing partnership",
      "Capricorn provides strategic planning while Aries provides the courage to execute boldly",
      "Mutual respect for each other's work ethic and determination forms a solid foundation",
    ],
    challenges: [
      "Capricorn's cautious approach frustrates impulsive Aries, who wants results yesterday",
      "Aries' risk-taking terrifies security-minded Capricorn",
      "Emotional expression is difficult — Aries runs hot while Capricorn runs controlled",
    ],
    emotionalDynamics:
      "This is a pairing of emotional contrasts. Aries wears their heart on their sleeve while Capricorn builds walls around theirs. Capricorn shows love through actions and long-term commitment rather than fiery declarations, which can leave Aries feeling emotionally starved. Aries' warmth can gradually melt Capricorn's reserve, but it takes patience that does not come naturally to the Ram.",
    communicationStyle:
      "Both are direct communicators, which is a strength, but they direct in different ways. Aries is impulsive and passionate while Capricorn is measured and authoritative. Capricorn can come across as condescending and Aries as childish. The most productive conversations happen when both acknowledge the other's approach has merit.",
    famousCouples: [
      { names: "Michelle Obama & Barack Obama", signs: "Capricorn & Leo (cardinal-fire energy)" },
    ],
    advice:
      "Recognize that you share the same ambition expressed through different temperaments. Aries, appreciate that Capricorn's caution comes from wanting to protect what you build together. Capricorn, let Aries' fire remind you that not everything needs to be a calculated move.",
  },

  "aries-aquarius": {
    strengths: [
      "Both are independent spirits who respect each other's need for personal freedom",
      "A highly stimulating intellectual connection that keeps both engaged long-term",
      "Shared love of innovation — they encourage each other to break rules and think differently",
    ],
    challenges: [
      "Aquarius' emotional detachment can frustrate passionate Aries",
      "Both can be stubborn in their positions (cardinal fire vs. fixed air), leading to standoffs",
      "Aries' me-first attitude clashes with Aquarius' focus on the collective and humanitarian causes",
    ],
    emotionalDynamics:
      "Aries experiences emotions as personal and immediate while Aquarius tends to intellectualize and universalize feelings. Aries may feel that Aquarius is emotionally distant, while Aquarius feels that Aries makes everything too personal. The bridge between them is built through shared causes and activities that give emotional expression a practical outlet.",
    communicationStyle:
      "Intellectually electric. Both love a good debate and neither is afraid to hold unconventional opinions. Aquarius brings visionary ideas while Aries brings the energy to champion them. Communication breaks down when Aries becomes impatient with Aquarius' abstract theorizing, or when Aquarius dismisses Aries' concerns as unsophisticated.",
    famousCouples: [
      { names: "Ellen DeGeneres & Portia de Rossi", signs: "Aquarius & Aries-adjacent" },
    ],
    advice:
      "Unite around a shared mission bigger than yourselves. Your relationship thrives when you are building, creating, or fighting for something together. Keep feeding the intellectual connection and give each other generous amounts of personal space.",
  },

  "aries-pisces": {
    strengths: [
      "Aries protects gentle Pisces, while Pisces softens Aries' hard edges with compassion",
      "As neighboring signs, they often have planets in each other's sign, creating hidden affinity",
      "Pisces' imagination combined with Aries' drive can manifest creative dreams into reality",
    ],
    challenges: [
      "Aries can inadvertently bulldoze over Pisces' sensitive nature without realizing the damage",
      "Pisces' passive-aggressive tendencies confuse direct Aries",
      "Different energy levels — Aries runs at full speed while Pisces needs significant downtime",
    ],
    emotionalDynamics:
      "Pisces is one of the most emotionally complex signs, feeling everything deeply and often absorbing others' emotions. Aries is emotionally straightforward and may lack the subtlety to navigate Pisces' rich inner world. When Aries learns gentleness and Pisces learns directness, they create a tender and fierce love that surprises both of them.",
    communicationStyle:
      "Communication can be the greatest challenge here. Aries is literal and direct while Pisces communicates through metaphor, art, and feeling. Aries may grow frustrated with what seems like evasiveness, while Pisces feels that Aries lacks the sensitivity to truly hear them. Meeting in the middle means Aries softening their tone and Pisces finding words for their feelings.",
    famousCouples: [
      { names: "Kurt Cobain & Courtney Love", signs: "Pisces & Cancer (water-fire dynamic)" },
    ],
    advice:
      "This relationship works when Aries becomes a conscious protector rather than an accidental aggressor. Pisces, speak up before resentment builds. Aries, check in with Pisces regularly — they will not always tell you when they are hurting. Your love language is gentle strength.",
  },

  // ─── TAURUS PAIRS ─────────────────────────────────────────────
  "taurus-taurus": {
    strengths: [
      "Unshakeable stability and loyalty — both understand the value of commitment and follow-through",
      "Shared love of comfort, beauty, and sensual pleasures creates a deeply satisfying partnership",
      "Financial compatibility is strong as both prioritize security and smart resource management",
    ],
    challenges: [
      "Two immovable objects create epic standoffs — neither will budge once dug in",
      "The relationship can fall into comfortable ruts, lacking novelty and spontaneity",
      "Possessiveness on both sides can create a suffocating dynamic",
    ],
    emotionalDynamics:
      "Two Taureans together create a calm, steady emotional environment where both feel safe. Emotions are expressed through physical affection, acts of service, and quality time rather than dramatic declarations. The danger is that emotional complacency sets in — because everything feels fine on the surface, deeper issues may go unexamined for years.",
    communicationStyle:
      "Taurus-Taurus communication is deliberate and practical. Neither rushes to fill silence, and both prefer concrete conversations over abstract speculation. Conflict arises when both retreat into stubborn silence, creating cold wars that can last days. The resolution always requires one to extend an olive branch, which goes against the Taurus grain.",
    famousCouples: [
      { names: "Queen Elizabeth II & Prince Philip (Taurus & Gemini)", signs: "Taurus-adjacent" },
    ],
    advice:
      "Deliberately inject newness into your routine. Try a new restaurant, take an unexpected trip, or learn something together. Your stability is your gift — make sure it does not become your cage. And when you disagree, remember that flexibility is not the same as weakness.",
  },

  "taurus-gemini": {
    strengths: [
      "Gemini brings intellectual stimulation and social variety that enriches Taurus' world",
      "Taurus grounds Gemini's scattered energy and helps turn ideas into tangible results",
      "As neighbors in the zodiac, they often share Venus or Mercury placements, creating hidden connections",
    ],
    challenges: [
      "Taurus' need for routine and predictability clashes with Gemini's love of constant change",
      "Gemini may find Taurus boring; Taurus may find Gemini unreliable",
      "Different relationship with possessions — Taurus clings, Gemini discards easily",
    ],
    emotionalDynamics:
      "Taurus is sensual and grounded in their emotions, seeking physical and verbal reassurance. Gemini processes emotions intellectually and may seem detached by Taurus' standards. Taurus needs consistent emotional demonstrations while Gemini's affection is variable and mercurial. Understanding that both styles are valid expressions of love is the key to emotional harmony.",
    communicationStyle:
      "This is where the pairing either thrives or collapses. Gemini wants to talk about everything — ideas, feelings, plans, hypotheticals. Taurus communicates with fewer words but more weight. Gemini may feel Taurus is a conversational dead end, while Taurus feels exhausted by Gemini's verbal energy. Finding shared topics they both genuinely enjoy is essential.",
    famousCouples: [
      { names: "Cher & Sonny Bono", signs: "Taurus & Gemini-adjacent" },
    ],
    advice:
      "Build your relationship around shared experiences rather than trying to change each other's nature. Gemini, demonstrate reliability in small consistent ways. Taurus, embrace occasional spontaneity as an adventure rather than a threat. You expand each other's worlds if you let it happen.",
  },

  "taurus-cancer": {
    strengths: [
      "A naturally nurturing combination — both prioritize home, family, and emotional security",
      "Taurus' steadfast loyalty meets Cancer's devoted caregiving for a deeply supportive bond",
      "Shared values around comfort, food, and creating a beautiful living environment",
    ],
    challenges: [
      "Both can be possessive and clingy, creating a relationship that isolates from the outside world",
      "Cancer's emotional volatility can destabilize Taurus' need for calm predictability",
      "Taurus' stubbornness meets Cancer's passive-aggression in a frustrating cycle",
    ],
    emotionalDynamics:
      "This is one of the most emotionally harmonious pairings in the zodiac. Taurus provides the stable ground that Cancer needs to feel safe expressing their deep emotions. Cancer's intuitive understanding of Taurus' unspoken needs creates a bond of wordless understanding. The challenge is avoiding emotional codependency and maintaining individual identities.",
    communicationStyle:
      "Communication flows naturally through shared domestic rhythms — cooking together, creating a home, caring for loved ones. Verbal communication may actually be their weakest link, as Taurus retreats into silence and Cancer retreats into hurt feelings. Building a habit of direct, gentle conversation prevents small misunderstandings from becoming festering wounds.",
    famousCouples: [
      { names: "Princess Diana & Prince Charles", signs: "Cancer & Scorpio (water-earth energy)" },
    ],
    advice:
      "Your instinct to nest together is beautiful — just make sure you also maintain friendships and interests outside the relationship. Schedule regular honest check-ins and resist the urge to avoid difficult conversations for the sake of comfort.",
  },

  "taurus-leo": {
    strengths: [
      "Both appreciate luxury, beauty, and the finer things in life — shared aesthetics strengthen the bond",
      "Leo's warmth and generosity pair beautifully with Taurus' loyalty and devotion",
      "Together they create an impressive, enviable partnership that radiates stability and charisma",
    ],
    challenges: [
      "Both are fixed signs — stubbornness multiplied by stubbornness creates legendary standoffs",
      "Leo craves public admiration while Taurus prefers private intimacy, leading to social friction",
      "Financial tension arises when Leo's lavish spending conflicts with Taurus' budgeting instincts",
    ],
    emotionalDynamics:
      "Taurus and Leo both need consistent affection but express it differently. Leo needs verbal praise and public recognition while Taurus needs physical touch and quality one-on-one time. Both feel unloved when they do not receive love in their preferred language. Learning to speak each other's dialect transforms this from a frustrating pairing to a deeply fulfilling one.",
    communicationStyle:
      "Both are straightforward communicators but can become entrenched in their positions. Leo communicates with passion and dramatic emphasis while Taurus communicates with calm, immovable conviction. Neither backs down easily, which means resolution requires genuine compromise — not just waiting for the other to concede.",
    famousCouples: [
      { names: "David & Victoria Beckham", signs: "Taurus & Aries (earth-fire)" },
    ],
    advice:
      "Generosity is your shared currency — be generous with compliments (for Leo) and with presence (for Taurus). When you hit a stubborn impasse, ask yourselves whether being right is more important than being happy together. The answer should always redirect you toward compromise.",
  },

  "taurus-virgo": {
    strengths: [
      "A naturally harmonious Earth-Earth pairing with shared values of practicality and reliability",
      "Both are devoted to building a stable, well-organized life together",
      "Deep mutual respect — Taurus admires Virgo's intelligence, Virgo appreciates Taurus' strength",
    ],
    challenges: [
      "The relationship can become all work and no play, lacking spontaneity and passion",
      "Virgo's perfectionism and criticism can wound Taurus' pride over time",
      "Both avoid conflict, allowing unspoken issues to accumulate beneath the surface",
    ],
    emotionalDynamics:
      "Both Taurus and Virgo are reserved with their emotions, preferring to show love through actions rather than words. This creates a comforting, low-drama emotional environment but can also mean that emotional needs go unexpressed. Taurus is more sensual and tactile while Virgo is more cerebral — bridging this gap enriches both.",
    communicationStyle:
      "Practical and efficient. They communicate well about logistics, plans, and daily life. Where they struggle is with emotional or abstract conversations. Virgo may over-analyze while Taurus may shut down. Their best conversations happen over shared activities — cooking, gardening, problem-solving — where words flow naturally alongside actions.",
    famousCouples: [
      { names: "Paul McCartney & Linda McCartney", signs: "Gemini & Virgo (earth-adjacent)" },
    ],
    advice:
      "Your earth connection is gold — do not take it for granted by assuming stability means you can stop investing in romance. Schedule date nights, surprise each other, and occasionally break your own rules. Comfort is wonderful, but passion needs intentional nurturing too.",
  },

  "taurus-libra": {
    strengths: [
      "Both ruled by Venus, they share a deep love of beauty, art, harmony, and refined pleasures",
      "Natural aesthetic alignment — their shared spaces are always beautiful and thoughtfully designed",
      "A gentle, non-confrontational dynamic where both prioritize keeping the peace",
    ],
    challenges: [
      "Libra's social butterfly nature can trigger Taurus' possessiveness and jealousy",
      "Taurus' need for concrete plans frustrates indecisive Libra",
      "Libra operates in the world of ideas while Taurus operates in the world of tangible results",
    ],
    emotionalDynamics:
      "As fellow Venus-ruled signs, both Taurus and Libra value love and connection deeply, but they express it differently. Taurus is physically affectionate and possessive while Libra is intellectually romantic and socially oriented. Taurus may feel Libra is too detached, while Libra may feel Taurus is too demanding. Their shared love of beauty is the bridge between their emotional worlds.",
    communicationStyle:
      "Both dislike harsh conflict, which means conversations stay pleasant but may avoid necessary difficult topics. Libra is articulate and diplomatic while Taurus is straightforward and succinct. They communicate beautifully about shared interests — art, food, culture — but may struggle when deeper relational issues need addressing.",
    famousCouples: [
      { names: "John Lennon & Yoko Ono", signs: "Libra & Aquarius (Venus-air connection)" },
    ],
    advice:
      "Enjoy your shared Venusian pleasures — they are the glue of your relationship. But do not confuse avoiding conflict with resolving it. Practice having uncomfortable conversations while they are still small. Your shared desire for harmony is a strength when it does not become avoidance.",
  },

  "taurus-scorpio": {
    strengths: [
      "As opposite signs, the attraction is magnetic and the potential for transformation is immense",
      "Both are fiercely loyal and committed once they choose a partner — no half-measures here",
      "Shared intensity around physical intimacy and emotional bonding creates unbreakable ties",
    ],
    challenges: [
      "Both are possessive and jealous, which can create a suffocating or controlling dynamic",
      "Scorpio's need to probe and transform clashes with Taurus' desire to keep things as they are",
      "Power struggles are intense because neither will surrender control willingly",
    ],
    emotionalDynamics:
      "This is one of the zodiac's most emotionally intense pairings. Scorpio craves depth and transformation in every interaction, while Taurus seeks stability and comfort. Scorpio may push Taurus into emotional territory that feels threatening, while Taurus' resistance to change frustrates Scorpio. When they find equilibrium, the emotional bond is among the deepest in astrology.",
    communicationStyle:
      "Both communicate with conviction rather than flexibility. Taurus states their position and holds it; Scorpio probes, questions, and investigates. Scorpio may feel Taurus is hiding something (they may not be — Taurus is just private), and Taurus may feel interrogated. Trust is the prerequisite for open communication in this pairing.",
    famousCouples: [
      { names: "Ryan Gosling & Eva Mendes", signs: "Scorpio & Aries (intensity match)" },
    ],
    advice:
      "Your opposite-sign magnetism is real and powerful — honor it by building trust incrementally. Taurus, let Scorpio into your inner world; your vulnerability will be protected. Scorpio, accept that Taurus' stability is not stagnation. Together, you teach each other that security and transformation can coexist.",
  },

  "taurus-sagittarius": {
    strengths: [
      "Sagittarius brings adventure and philosophical depth that expands Taurus' worldview",
      "Taurus provides a grounding influence that helps Sagittarius manifest their grand visions",
      "Both are honest signs who value authenticity in their relationships",
    ],
    challenges: [
      "Taurus wants to stay home; Sagittarius wants to explore the world — a fundamental lifestyle clash",
      "Sagittarius' restlessness and inconsistency makes security-loving Taurus anxious",
      "Different values around money — Taurus saves, Sagittarius spends on experiences",
    ],
    emotionalDynamics:
      "Taurus approaches emotions with steadiness and physicality while Sagittarius approaches them with philosophical optimism and occasional avoidance. Taurus may feel Sagittarius is not emotionally present, while Sagittarius may feel Taurus is too heavy and serious. The emotional sweet spot is when Taurus learns to lighten up and Sagittarius learns to stay present.",
    communicationStyle:
      "Sagittarius is expansive and enthusiastic in communication, jumping from topic to topic with infectious energy. Taurus is concise and practical, wanting conversations to lead somewhere concrete. They can enrich each other — Sagittarius broadening Taurus' perspective and Taurus helping Sagittarius focus their ideas into actionable plans.",
    famousCouples: [
      { names: "Britney Spears & Justin Timberlake (Sagittarius & Aquarius)", signs: "Sagittarius-adjacent" },
    ],
    advice:
      "Compromise on the home-vs-adventure spectrum. Taurus, join Sagittarius on some explorations — you might love the new restaurant or travel destination. Sagittarius, show up reliably and make home a place you want to return to. Your differences become strengths when neither insists the other live entirely on their terms.",
  },

  "taurus-capricorn": {
    strengths: [
      "A powerhouse Earth-Earth pairing built on shared ambition, discipline, and material goals",
      "Deep mutual respect — both admire the other's work ethic and determination",
      "Financial harmony is exceptional as both are strategic, responsible, and security-oriented",
    ],
    challenges: [
      "The relationship can become overly focused on work and achievement at the expense of emotional connection",
      "Both suppress emotions, which can lead to a functional but romantically sterile partnership",
      "Capricorn's workaholism may leave Taurus feeling neglected despite sharing the same values",
    ],
    emotionalDynamics:
      "Both Taurus and Capricorn express love through reliability and tangible support rather than emotional declarations. This creates a deeply secure bond but risks emotional flatness. Taurus is the more sensual and physically affectionate of the two and can draw Capricorn out of their emotional fortress. Capricorn's quiet devotion, in turn, gives Taurus the long-term security they crave.",
    communicationStyle:
      "Efficient, practical, and low-drama. They communicate well about goals, plans, and logistics. Emotional conversations require more effort from both — Taurus may retreat into comfort and Capricorn into work. Their best communication happens through shared projects and mutual goals that give them a concrete framework for connection.",
    famousCouples: [
      { names: "Kit Harington & Rose Leslie", signs: "Capricorn & Taurus-adjacent" },
    ],
    advice:
      "Your material partnership is likely flawless — now invest equally in your emotional and romantic connection. Schedule dedicated time for pleasure, play, and conversation that has nothing to do with productivity. Remember that the life you are building together is meant to be enjoyed, not just optimized.",
  },

  "taurus-aquarius": {
    strengths: [
      "Aquarius brings innovation and fresh perspectives that challenge Taurus to evolve",
      "Taurus provides practical grounding that helps Aquarius turn revolutionary ideas into reality",
      "Both are fiercely loyal once committed, creating a dependable partnership despite their differences",
    ],
    challenges: [
      "A fundamental tension between Taurus' traditionalism and Aquarius' progressive unconventionality",
      "Both are fixed signs — stubbornness squared makes compromise feel impossible",
      "Taurus needs physical closeness while Aquarius needs intellectual space, creating distance",
    ],
    emotionalDynamics:
      "This is one of the more challenging emotional pairings. Taurus is warm, physical, and needs consistent emotional nourishment. Aquarius is cerebral, sometimes emotionally detached, and may find Taurus' needs overwhelming. Taurus can feel like they are chasing an emotional connection that Aquarius keeps at arm's length. Growth requires Aquarius to open their heart and Taurus to expand their definition of intimacy.",
    communicationStyle:
      "Aquarius communicates in abstractions and future possibilities while Taurus communicates in concrete present realities. Aquarius may find Taurus' topics mundane while Taurus finds Aquarius' ideas impractical. Their best communication happens when Aquarius explains the 'why' behind their ideas and Taurus shares the 'how' to make them real.",
    famousCouples: [
      { names: "Oprah Winfrey & Stedman Graham", signs: "Aquarius & Pisces (fixed-sign energy)" },
    ],
    advice:
      "Accept that you live in different worlds and build a bridge between them rather than insisting the other relocate. Taurus, give Aquarius room to be unconventional without judgment. Aquarius, show up physically and emotionally for Taurus — abstract love is not enough. Your fixed-sign loyalty is the foundation everything else can be built on.",
  },

  "taurus-pisces": {
    strengths: [
      "A beautifully complementary pairing — Taurus grounds Pisces' dreams while Pisces enriches Taurus' soul",
      "Both are gentle, romantic, and value deep emotional connection over surface-level excitement",
      "Shared love of music, art, and beauty creates a strong aesthetic and creative bond",
    ],
    challenges: [
      "Pisces' escapist tendencies (avoidance, fantasy) frustrate practical Taurus",
      "Taurus can be too rigid and materialistic for spiritually oriented Pisces",
      "Both avoid direct confrontation, allowing problems to fester beneath a pleasant surface",
    ],
    emotionalDynamics:
      "Emotional compatibility is a genuine strength here. Pisces' deep emotional waters find a safe harbor in Taurus' steady, reliable presence. Taurus, who often struggles to access deeper feelings, finds Pisces' emotional fluency contagious. The risk is emotional codependency, where Taurus becomes Pisces' sole anchor and Pisces becomes Taurus' only emotional outlet.",
    communicationStyle:
      "Taurus communicates directly but gently, while Pisces communicates through feeling, intuition, and sometimes evasion. Taurus may need Pisces to be more concrete, and Pisces may need Taurus to be more attuned to unspoken cues. They communicate best in creative and sensory contexts — through shared music, cooking, or quiet time in nature.",
    famousCouples: [
      { names: "Emily Blunt & John Krasinski", signs: "Pisces & Libra (Venus-water energy)" },
    ],
    advice:
      "Let Taurus handle the practical architecture of your life together while Pisces handles the emotional and spiritual dimensions. Play to your strengths rather than competing. And when conflict inevitably arises, face it together rather than retreating into your respective comfort zones.",
  },

  // ─── GEMINI PAIRS ─────────────────────────────────────────────
  "gemini-gemini": {
    strengths: [
      "Never-ending conversation, wit, and intellectual stimulation — boredom is virtually impossible",
      "Both understand the other's need for variety, social interaction, and mental freedom",
      "A playful, youthful energy that keeps the relationship feeling fresh and exciting",
    ],
    challenges: [
      "Neither is naturally inclined toward emotional depth, making the relationship feel surface-level",
      "Two restless minds can mean zero follow-through on plans and commitments",
      "Trust issues can arise as both are skilled flirts and may struggle with exclusivity",
    ],
    emotionalDynamics:
      "Two Geminis together create an emotionally light but potentially shallow dynamic. Feelings are discussed intellectually rather than deeply felt, which can feel freeing or hollow depending on what each needs. The challenge is moving beyond witty banter into genuine emotional vulnerability — which requires both to resist their instinct to intellectualize everything.",
    communicationStyle:
      "Communication is this pair's superpower and potential downfall. They can talk endlessly about anything and everything — finishing each other's sentences, debating ideas, sharing stories. The risk is that all this talking substitutes for doing, and that serious issues get talked around rather than through. They excel at breadth but must work at conversational depth.",
    famousCouples: [
      { names: "Angelina Jolie & Johnny Depp", signs: "Gemini & Gemini" },
    ],
    advice:
      "Use your shared gift for communication to practice real emotional honesty, not just clever dialogue. Choose projects and commitments together and hold each other accountable for following through. Your minds are perfectly matched — now invest in matching your hearts.",
  },

  "gemini-cancer": {
    strengths: [
      "Cancer provides the emotional depth and home base that gives Gemini a sense of belonging",
      "Gemini's lightness and humor help Cancer not take life (and feelings) so seriously",
      "As neighbors in the zodiac, they often share planetary placements that create unspoken understanding",
    ],
    challenges: [
      "Cancer's emotional intensity can overwhelm intellectually-oriented Gemini",
      "Gemini's inconsistency and social flirtation triggers Cancer's deep insecurities",
      "Different needs for socializing — Gemini needs variety while Cancer prefers intimate circles",
    ],
    emotionalDynamics:
      "Cancer feels emotions like ocean waves while Gemini processes them like data points. Cancer needs to feel emotionally met and held, while Gemini needs to feel intellectually engaged. Cancer may accuse Gemini of being cold; Gemini may accuse Cancer of being too much. The bridge is empathy — learning that different emotional languages can still say 'I love you.'",
    communicationStyle:
      "Gemini communicates with quick wit and intellectual agility while Cancer communicates with emotional nuance and intuitive knowing. Gemini may talk when Cancer needs them to just listen and hold space. Cancer may withdraw when Gemini needs them to articulate what is wrong. They communicate best when Gemini slows down and Cancer speaks up.",
    famousCouples: [
      { names: "Chris Pratt & Anna Faris (formerly)", signs: "Gemini & Cancer-adjacent" },
    ],
    advice:
      "Gemini, when Cancer is emotional, resist the urge to fix or rationalize — just be present. Cancer, when Gemini seems scattered, trust that they will come back to you. Your neighboring-sign connection means you have more in common than it first appears.",
  },

  "gemini-leo": {
    strengths: [
      "A socially dynamic duo that lights up every room they enter together",
      "Leo's warmth and confidence pair perfectly with Gemini's charm and conversational genius",
      "Both love entertainment, creativity, and living life with playful enthusiasm",
    ],
    challenges: [
      "Leo needs undivided attention and admiration, which scattered Gemini may struggle to provide",
      "Gemini's tendency to flirt casually can wound Leo's pride deeply",
      "Leo wants consistent loyalty while Gemini values freedom and variety in all things",
    ],
    emotionalDynamics:
      "Leo is emotionally warm, generous, and needs to feel like the center of their partner's world. Gemini is emotionally adaptable but can seem detached when their attention wanders. Leo may feel neglected when Gemini is mentally elsewhere, and Gemini may feel pressured by Leo's need for constant affirmation. When Gemini focuses their considerable charm on Leo, magic happens.",
    communicationStyle:
      "Vibrant and animated. Leo communicates with passion and dramatic emphasis while Gemini brings wit, variety, and intellectual sparkle. They are excellent at entertaining each other (and others). Conflict communication is harder — Leo takes criticism personally and Gemini can be accidentally cutting with their words.",
    famousCouples: [
      { names: "Chris Hemsworth & Elsa Pataky (Cancer & Leo)", signs: "Fire-Air dynamic" },
    ],
    advice:
      "Gemini, give Leo the spotlight and genuine admiration — it costs you nothing and means the world to them. Leo, allow Gemini intellectual freedom without interpreting it as rejection. Together you are the life of the party — just make sure the party includes real intimacy too.",
  },

  "gemini-virgo": {
    strengths: [
      "Both ruled by Mercury, they share a love of learning, analysis, and intellectual conversation",
      "Virgo helps organize Gemini's scattered ideas into practical systems",
      "A stimulating intellectual connection that keeps both mentally engaged long-term",
    ],
    challenges: [
      "Virgo's perfectionism and criticism wears on carefree Gemini's spirit over time",
      "Gemini's lack of follow-through frustrates detail-oriented, reliable Virgo",
      "Both live in their heads, potentially neglecting physical and emotional dimensions of the relationship",
    ],
    emotionalDynamics:
      "As fellow Mercury-ruled signs, both default to intellectual processing of emotions rather than raw feeling. This creates mental compatibility but potential emotional distance. Virgo may worry about the relationship analytically while Gemini avoids emotional conversations altogether. They need to consciously create space for feelings that exist beyond thoughts.",
    communicationStyle:
      "Communication is technically excellent — both are articulate, precise, and love discussing ideas. However, Virgo communicates to solve problems and optimize, while Gemini communicates to explore and entertain. Virgo's feedback can feel like criticism to Gemini, and Gemini's tangential style can frustrate focused Virgo. Their Mercury bond is real but needs conscious nurturing.",
    famousCouples: [
      { names: "Blake Lively & Ryan Reynolds", signs: "Virgo & Scorpio (Mercury-adjacent)" },
    ],
    advice:
      "Celebrate your shared Mercury gifts while acknowledging your different applications of them. Gemini, practice following through on at least the promises that matter most to Virgo. Virgo, practice accepting Gemini as they are — your suggestions for improvement are not always welcome or helpful.",
  },

  "gemini-libra": {
    strengths: [
      "A naturally harmonious Air-Air pairing with effortless intellectual and social chemistry",
      "Both are charming, communicative, and skilled at navigating social situations together",
      "Shared appreciation for culture, ideas, and variety keeps the relationship perpetually stimulating",
    ],
    challenges: [
      "Both can be indecisive, leading to paralysis on important decisions",
      "Surface-level harmony may mask avoidance of deeper emotional or relational issues",
      "Neither naturally provides grounding energy, making the relationship feel unanchored",
    ],
    emotionalDynamics:
      "Emotionally, this pairing is pleasant, balanced, and potentially shallow. Both prefer positive emotions and harmonious interactions, sometimes at the cost of addressing what really needs addressing. Libra craves partnership-level intimacy while Gemini craves intellectual stimulation — when they merge these needs, the relationship deepens. When they don't, it becomes a beautifully decorated empty room.",
    communicationStyle:
      "Exceptional. This is one of the zodiac's most communicatively gifted pairings. Conversation flows effortlessly from light banter to philosophical debate to relationship processing. Libra adds grace and diplomacy while Gemini adds wit and range. The only risk is talking about problems instead of solving them — words must eventually translate to action.",
    famousCouples: [
      { names: "John F. Kennedy & Jacqueline Kennedy", signs: "Gemini & Leo (air-fire charm)" },
    ],
    advice:
      "Enjoy your extraordinary rapport while building concrete structures beneath it. Make decisions together and commit to them, even when you both want to keep options open. Your relationship is a meeting of minds — make sure it also becomes a meeting of hearts and hands.",
  },

  "gemini-scorpio": {
    strengths: [
      "An intellectually fascinating pairing — Scorpio's depth meets Gemini's breadth for expansive conversations",
      "Gemini's adaptability helps them navigate Scorpio's emotional intensity better than most signs",
      "Together they can uncover hidden truths — Scorpio through investigation, Gemini through information gathering",
    ],
    challenges: [
      "Scorpio's need for emotional intensity and exclusivity clashes with Gemini's need for lightness and variety",
      "Trust is the central issue — Scorpio is suspicious and Gemini is evasive, a toxic combination",
      "Scorpio perceives Gemini as superficial; Gemini perceives Scorpio as exhaustingly heavy",
    ],
    emotionalDynamics:
      "This is a study in emotional contrasts. Scorpio lives in the emotional depths and demands the same from their partner. Gemini skims the emotional surface, preferring to observe feelings rather than be consumed by them. Scorpio may feel Gemini is hiding something (they may just be processing differently), and Gemini may feel Scorpio is pulling them into an emotional vortex they did not sign up for.",
    communicationStyle:
      "Gemini is open, verbal, and loves to share everything. Scorpio is strategic about information sharing and may withhold to maintain power. Gemini talks to think; Scorpio thinks before talking. This creates a dynamic where Gemini feels interrogated and Scorpio feels overwhelmed with noise. Productive communication requires both adjusting their natural style significantly.",
    famousCouples: [
      { names: "Grace Kelly & Prince Rainier", signs: "Scorpio & Gemini" },
    ],
    advice:
      "This pairing works only with mutual respect for your radically different approaches to life. Scorpio, lighten your grip — Gemini's freedom is not a threat to your bond. Gemini, go deeper than you normally would — Scorpio's intensity holds treasures that surface-level exploration will never find.",
  },

  "gemini-sagittarius": {
    strengths: [
      "As opposite signs, the attraction is electric — intellectual stimulation and adventurous energy abound",
      "Both are endlessly curious, love travel, and thrive on new experiences",
      "A shared sense of humor and optimism makes this pairing genuinely fun to be in",
    ],
    challenges: [
      "Both value freedom so highly that neither wants to be the one to commit or compromise",
      "Sagittarius can be preachy while Gemini can be flippant — each trivializes the other's approach",
      "Follow-through is poor on both sides, making it hard to build lasting structures together",
    ],
    emotionalDynamics:
      "This opposite-sign pair shares a light emotional touch. Both prefer optimism over brooding and action over emotional processing. This feels refreshing compared to heavier partnerships but can mean that pain, grief, and vulnerability go unacknowledged. Their emotional connection deepens through shared experiences rather than conversations about feelings.",
    communicationStyle:
      "Brilliant. These two can talk for hours, days, years without running out of material. Gemini brings variety and intellectual agility; Sagittarius brings philosophical depth and bold opinions. They love debating each other, and disagreements feel stimulating rather than threatening. The risk is all talk — they need to channel their verbal energy into committed action.",
    famousCouples: [
      { names: "Brad Pitt & Angelina Jolie", signs: "Sagittarius & Gemini" },
    ],
    advice:
      "Your opposite-sign connection gives you everything you both want in a partner — if you are brave enough to commit. Stop keeping one foot out the door. Choose this adventure fully and build something together that neither of you could build alone.",
  },

  "gemini-capricorn": {
    strengths: [
      "Gemini brings innovation and creative ideas that can accelerate Capricorn's ambitious goals",
      "Capricorn provides structure and follow-through that gives Gemini's ideas concrete form",
      "A surprisingly effective professional and creative partnership when mutual respect is established",
    ],
    challenges: [
      "Capricorn views Gemini as unreliable and scattered; Gemini views Capricorn as rigid and dull",
      "Very different social styles — Gemini is a social butterfly while Capricorn is selective and reserved",
      "Capricorn's seriousness can dampen Gemini's playful spirit over time",
    ],
    emotionalDynamics:
      "Emotionally, these two are speaking different languages. Capricorn shows love through responsibility, commitment, and practical support. Gemini shows love through attention, conversation, and shared experiences. Capricorn may feel Gemini is emotionally immature; Gemini may feel Capricorn is emotionally unavailable. Meeting in the middle requires genuine effort from both.",
    communicationStyle:
      "Capricorn is efficient and purpose-driven in conversation while Gemini is explorative and tangential. Capricorn may cut Gemini's interesting tangents short, and Gemini may struggle to engage with Capricorn's focused, goal-oriented dialogue. Their best conversations happen around shared projects where Gemini's ideas and Capricorn's execution complement each other.",
    famousCouples: [
      { names: "Mary-Kate Olsen & Olivier Sarkozy (formerly)", signs: "Gemini & Capricorn-adjacent" },
    ],
    advice:
      "Find the intersection of your strengths and build there. Gemini, show Capricorn you can be reliable when it counts. Capricorn, show Gemini you can be spontaneous and fun. Your differences make you a formidable team — once you stop seeing them as flaws.",
  },

  "gemini-aquarius": {
    strengths: [
      "An exceptional intellectual match — both are forward-thinking, unconventional, and idea-driven",
      "Shared love of independence means neither feels trapped or stifled in the relationship",
      "Together they generate innovative ideas and stimulating conversations that never grow stale",
    ],
    challenges: [
      "Both can be emotionally detached, creating a relationship that is intellectually rich but emotionally thin",
      "Aquarius' fixed opinions can frustrate Gemini's desire to consider every angle",
      "Neither is naturally domestic or nurturing, making it hard to create a cozy home life",
    ],
    emotionalDynamics:
      "This Air-Air pairing bonds through the mind rather than the heart, which suits both perfectly. Emotional intensity is rare and neither demands it. The risk is that when real emotional crises arise, neither has the tools to handle them. They express care through intellectual engagement, shared projects, and respecting each other's autonomy — but may need to consciously develop their emotional vocabulary.",
    communicationStyle:
      "Outstanding. These two can discuss everything from quantum physics to social justice to relationship theory with equal enthusiasm. Gemini provides versatility and curiosity while Aquarius provides vision and conviction. They challenge each other's thinking in ways that feel stimulating rather than threatening. This is the pair that finishes each other's sentences.",
    famousCouples: [
      { names: "Ashton Kutcher & Mila Kunis", signs: "Aquarius & Leo (air-sign energy)" },
    ],
    advice:
      "Your intellectual connection is rare and precious — but relationships also need warmth, physical affection, and emotional presence. Schedule time to be together without screens, debates, or agendas. Simply being present with each other is the homework this brilliant pairing tends to skip.",
  },

  "gemini-pisces": {
    strengths: [
      "Both are mutable signs, bringing extraordinary adaptability and go-with-the-flow energy",
      "Gemini and Pisces share a creative, imaginative quality that can produce beautiful artistic collaborations",
      "Both are empathetic in their own way — Gemini intellectually, Pisces emotionally",
    ],
    challenges: [
      "Pisces' emotional depth can overwhelm cerebral Gemini, who may pull away in response",
      "Gemini's sharp words can wound Pisces deeply, sometimes without Gemini even realizing it",
      "Both are prone to escapism (Gemini through distraction, Pisces through fantasy), avoiding accountability",
    ],
    emotionalDynamics:
      "Pisces feels everything deeply and intuitively while Gemini observes and analyzes feelings from a safe distance. Pisces may feel emotionally abandoned when Gemini intellectualizes their pain, and Gemini may feel engulfed by Pisces' emotional waves. The connection works when Gemini learns to sit with feelings and Pisces learns to articulate them.",
    communicationStyle:
      "Both communicate in non-linear ways — Gemini through tangents and Pisces through metaphor. This can create a dreamy, creative communication style or a deeply confusing one. Practical matters often fall through the cracks. They need at least one grounded communication ritual (weekly check-ins, shared lists) to stay on the same page.",
    famousCouples: [
      { names: "Drew Barrymore & Justin Long (formerly)", signs: "Pisces & Gemini-adjacent" },
    ],
    advice:
      "Embrace your shared mutability as creative fuel, not an excuse for chaos. Gemini, hold space for Pisces' feelings without trying to solve them. Pisces, express your needs in words, not just vibes. Create one stable structure (a routine, a shared project) that anchors your beautiful but sometimes untethered connection.",
  },

  // ─── CANCER PAIRS ─────────────────────────────────────────────
  "cancer-cancer": {
    strengths: [
      "Profound emotional understanding — both know instinctively what the other needs",
      "A deeply nurturing partnership where both feel cared for, protected, and emotionally safe",
      "Shared values around home, family, and creating a cozy, meaningful domestic life",
    ],
    challenges: [
      "Emotional volatility multiplied by two — moods feed off each other in spiraling cycles",
      "Both tend to retreat into their shells during conflict, creating silent standoffs that last for days",
      "Codependency risk is high when both define themselves through caretaking",
    ],
    emotionalDynamics:
      "Two Cancers together create one of the most emotionally attuned partnerships in the zodiac. They can communicate entire conversations through a glance, a touch, or a shift in energy. The depth of their emotional connection is extraordinary, but so is the potential for emotional overwhelm. When both are in a low mood, there is no outside energy to lift them up.",
    communicationStyle:
      "Communication is deeply intuitive but not always verbal. They understand each other's feelings without words, which is both a gift and a crutch. Important issues may go unspoken because both assume the other already knows. They need to practice putting feelings into words, even when it feels redundant, to prevent the slow accumulation of unaddressed hurts.",
    famousCouples: [
      { names: "Pamela Anderson & Kid Rock (Cancer & Capricorn)", signs: "Cancer-adjacent" },
    ],
    advice:
      "Your emotional bond is your greatest asset — protect it by learning to communicate directly rather than relying solely on intuition. Designate one partner as the 'brave one' on a rotating basis — the one who breaks the silence when conflict arises. And invest in friendships outside the relationship to maintain emotional balance.",
  },

  "cancer-leo": {
    strengths: [
      "Cancer's nurturing devotion feeds Leo's need for admiration, while Leo's warmth makes Cancer feel secure",
      "Both are deeply loyal and prioritize their loved ones above all else",
      "A complementary dynamic where Cancer creates the home and Leo creates the joy that fills it",
    ],
    challenges: [
      "Leo's social nature and need for attention can trigger Cancer's insecurity and jealousy",
      "Cancer's moodiness dampens Leo's sunny disposition, creating emotional whiplash",
      "Leo may feel burdened by Cancer's emotional needs; Cancer may feel unseen behind Leo's spotlight",
    ],
    emotionalDynamics:
      "Cancer offers deep, intuitive emotional care while Leo offers warm, generous affection. Cancer wants to feel safe and protected; Leo wants to feel adored and appreciated. When both get what they need, this is a deeply nourishing emotional partnership. Problems arise when Cancer's emotional tides pull Leo into depths they're not equipped for, or when Leo's self-focus leaves Cancer feeling neglected.",
    communicationStyle:
      "Leo communicates openly and dramatically while Cancer communicates indirectly through mood and care. Cancer may hint at needs rather than stating them, frustrating straightforward Leo. Leo's bold statements may feel insensitive to Cancer's delicate emotional radar. The solution is Leo learning to read Cancer's cues and Cancer learning to state needs clearly.",
    famousCouples: [
      { names: "Kevin Hart & Eniko Parrish", signs: "Cancer & Leo" },
    ],
    advice:
      "Make each other feel like the most important person in the room. Leo, redirect some of that spotlight toward Cancer — public appreciation goes a long way. Cancer, verbalize your admiration for Leo instead of assuming they know. Your neighboring-sign bond is built on a simple equation: devotion given is devotion returned.",
  },

  "cancer-virgo": {
    strengths: [
      "Both are devoted caretakers who show love through practical nurturing and attentive service",
      "A calm, stable dynamic where both value routine, home life, and quiet togetherness",
      "Virgo's analytical mind helps Cancer make sense of their ocean of emotions",
    ],
    challenges: [
      "Virgo's tendency to critique can wound Cancer's extremely sensitive heart",
      "Both can be anxious and overthink, feeding each other's worries instead of soothing them",
      "Cancer's emotional needs may feel irrational to logic-driven Virgo",
    ],
    emotionalDynamics:
      "Cancer leads with emotion while Virgo leads with analysis, creating a dynamic where feelings are deeply felt and then carefully examined. This can be healing — Virgo helps Cancer understand their emotions, and Cancer helps Virgo access theirs. It can also be painful when Virgo inadvertently dismisses Cancer's feelings as illogical or when Cancer's moods overwhelm Virgo's need for order.",
    communicationStyle:
      "Both are thoughtful communicators who avoid unnecessary confrontation. Cancer communicates through care and emotional signals while Virgo communicates through helpful suggestions and practical support. They speak the same love language (acts of service) which creates a beautiful silent communication. Verbal processing of conflict needs more conscious effort.",
    famousCouples: [
      { names: "Tom Hanks & Rita Wilson", signs: "Cancer & Virgo-adjacent" },
    ],
    advice:
      "Virgo, lead with appreciation before offering suggestions — Cancer needs to feel loved before they can hear feedback. Cancer, trust that Virgo's analytical approach to emotions is their way of caring, not dismissing. Together you create a quiet, profound love built on daily acts of devotion.",
  },

  "cancer-libra": {
    strengths: [
      "Both value harmony and will work hard to create a peaceful, beautiful relationship",
      "Cancer's emotional depth complements Libra's relational intelligence",
      "Shared appreciation for art, beauty, and creating an aesthetically pleasing home",
    ],
    challenges: [
      "Cancer's emotional directness can feel overwhelming to balance-seeking Libra",
      "Libra's social nature may trigger Cancer's possessiveness and fear of abandonment",
      "Both avoid direct conflict, leading to a buildup of unresolved tensions beneath a polished surface",
    ],
    emotionalDynamics:
      "Cancer processes emotions deeply and personally while Libra processes them through the lens of fairness and relationship dynamics. Cancer may feel Libra is emotionally detached, and Libra may feel Cancer's emotions are disproportionate. Their common ground is a genuine desire to make their partner happy — the challenge is learning that happiness looks different for each of them.",
    communicationStyle:
      "Libra is diplomatic and articulate, always considering both sides. Cancer communicates from gut feeling and emotional truth. Libra may dismiss Cancer's emotional arguments as irrational, while Cancer may find Libra's balanced perspective infuriating when they want passionate agreement. They connect best when Libra validates Cancer's feelings before offering perspective.",
    famousCouples: [
      { names: "Gwen Stefani & Blake Shelton", signs: "Libra & Cancer-adjacent" },
    ],
    advice:
      "Create a home that reflects both of your aesthetics — Cancer's coziness and Libra's elegance. When conflict arises, Cancer should state needs clearly and Libra should respond with empathy before analysis. Your shared desire for harmony is real — just make sure it includes honest expression, not just pleasant avoidance.",
  },

  "cancer-scorpio": {
    strengths: [
      "An extraordinarily deep emotional and intuitive bond — arguably the zodiac's most emotionally connected pairing",
      "Both are fiercely protective of those they love, creating an unbreakable alliance",
      "Shared water element means they understand each other's emotional depth without needing explanations",
    ],
    challenges: [
      "Emotional intensity can become overwhelming — two water signs risk drowning in feelings",
      "Scorpio's possessiveness and Cancer's clinginess can create a claustrophobic dynamic",
      "Both hold grudges and remember every perceived slight, making forgiveness difficult",
    ],
    emotionalDynamics:
      "This is the zodiac's emotional powerhouse pairing. Cancer and Scorpio communicate on an almost psychic level, sensing each other's moods and needs intuitively. The emotional depth available to this pair is unmatched. The risk is that their combined emotional intensity creates a closed ecosystem where outside perspectives are shut out and emotional patterns become self-reinforcing.",
    communicationStyle:
      "Much of their communication is nonverbal — a look, a touch, a shift in energy. When they do speak, both are emotionally honest and perceptive. The challenge is that both can weaponize their emotional intelligence during conflicts, knowing exactly where to strike to cause maximum pain. They need ground rules for fair fighting.",
    famousCouples: [
      { names: "Ryan Gosling & Eva Mendes", signs: "Scorpio & Virgo/Cancer energy" },
    ],
    advice:
      "Your emotional bond is your greatest treasure and your greatest risk. Set boundaries around emotional intensity — having outside friendships and interests prevents the relationship from becoming an emotional pressure cooker. Practice forgiveness daily, and resist the urge to use your intimate knowledge of each other as ammunition.",
  },

  "cancer-sagittarius": {
    strengths: [
      "Sagittarius brings optimism and adventure that helps Cancer overcome fear and anxiety",
      "Cancer provides emotional depth and a sense of home that wandering Sagittarius secretly craves",
      "Both are generous and big-hearted, creating a relationship of mutual care and support",
    ],
    challenges: [
      "Cancer wants to nest; Sagittarius wants to explore — a core lifestyle incompatibility",
      "Sagittarius' bluntness can devastate sensitive Cancer without Sagittarius even noticing",
      "Cancer's emotional needs feel restrictive to freedom-loving Sagittarius",
    ],
    emotionalDynamics:
      "Cancer operates from a place of deep emotional sensitivity while Sagittarius operates from philosophical optimism. Cancer may feel that Sagittarius minimizes their feelings with a 'look on the bright side' attitude. Sagittarius may feel that Cancer's emotional needs are an anchor preventing forward movement. Growth happens when Sagittarius learns to sit with discomfort and Cancer learns to embrace uncertainty.",
    communicationStyle:
      "Sagittarius is enthusiastic, blunt, and expansive in conversation. Cancer is emotionally attuned, careful, and sometimes indirect. Sagittarius may unintentionally say something hurtful and then struggle to understand why Cancer is so upset. Cancer may communicate through withdrawal, which Sagittarius reads as punitive rather than protective. Patience and translation are essential.",
    famousCouples: [
      { names: "Taylor Swift & Jake Gyllenhaal (Sagittarius & Sagittarius)", signs: "Sagittarius-Cancer dynamic" },
    ],
    advice:
      "Meet in the middle — literally. Travel together to places that feel like home (cozy inns, family-friendly destinations). Sagittarius, learn that coming home is not the same as being caged. Cancer, learn that adventure does not mean abandonment. Your opposing energies can expand both of your worlds beautifully.",
  },

  "cancer-capricorn": {
    strengths: [
      "As opposite signs, they share magnetic attraction and powerful complementarity around home and career",
      "Cancer creates emotional security while Capricorn creates financial security — a complete safety net",
      "Both are deeply committed to family and long-term stability",
    ],
    challenges: [
      "Capricorn's emotional reserve can leave Cancer feeling unloved and alone",
      "Cancer's moodiness frustrates pragmatic Capricorn, who sees emotions as obstacles",
      "Power dynamics around domestic versus professional spheres can breed resentment",
    ],
    emotionalDynamics:
      "This opposite-sign pairing creates a fascinating emotional polarity. Cancer is the zodiac's most emotionally open sign while Capricorn is one of the most emotionally guarded. Cancer can teach Capricorn to feel, and Capricorn can teach Cancer to structure their feelings productively. The danger is when Cancer feels emotionally abandoned by Capricorn's reserve, or when Capricorn feels overwhelmed by Cancer's emotional tides.",
    communicationStyle:
      "Capricorn communicates with efficiency and authority while Cancer communicates with emotional warmth and intuition. Capricorn may dismiss Cancer's emotional reasoning, and Cancer may find Capricorn's practical approach cold and uncaring. Their best communication happens when they acknowledge that both logic and emotion have valid roles in decision-making.",
    famousCouples: [
      { names: "Michelle & Barack Obama", signs: "Capricorn & Leo (opposite-sign energy)" },
    ],
    advice:
      "Honor your complementary roles without creating rigid categories. Capricorn, your Cancer partner needs you to be emotionally present — not just financially providing. Cancer, respect Capricorn's way of showing love through stability and structure. Your opposite-sign axis is about integrating home and world.",
  },

  "cancer-aquarius": {
    strengths: [
      "Cancer brings emotional warmth that humanizes Aquarius' abstract idealism",
      "Aquarius brings innovative thinking that helps Cancer break free from nostalgic ruts",
      "Both genuinely care about others, though in very different ways — personal vs. universal",
    ],
    challenges: [
      "Cancer's need for emotional closeness directly conflicts with Aquarius' need for emotional space",
      "Aquarius' detached rationality feels cold and dismissive to heart-centered Cancer",
      "Cancer's focus on family and traditions may feel limiting to progressive Aquarius",
    ],
    emotionalDynamics:
      "This is one of the more emotionally challenging pairings. Cancer needs constant emotional reassurance, physical affection, and the feeling of being someone's whole world. Aquarius needs intellectual stimulation, personal freedom, and emotional autonomy. Cancer may feel perpetually emotionally hungry while Aquarius feels perpetually emotionally crowded. Success requires radical acceptance of each other's emotional wiring.",
    communicationStyle:
      "Cancer communicates from feeling and personal experience while Aquarius communicates from theory and collective perspective. Cancer says 'I feel hurt' while Aquarius says 'objectively speaking, the situation is...' This creates a persistent disconnect where Cancer feels invalidated and Aquarius feels unfairly accused. Learning to acknowledge the other's framework is essential.",
    famousCouples: [
      { names: "Harry Styles & Olivia Wilde (Aquarius & Pisces)", signs: "Aquarius-Cancer dynamic" },
    ],
    advice:
      "Respect that you experience the world through different operating systems. Cancer, give Aquarius room to process emotions their way (often alone and intellectually). Aquarius, show up emotionally for Cancer through physical presence and verbal affirmation, even when it feels unnecessary to you. The gap between you is also the space where growth lives.",
  },

  "cancer-pisces": {
    strengths: [
      "A dreamy, deeply empathetic Water-Water pairing with extraordinary emotional attunement",
      "Both are intuitive, compassionate, and naturally understand each other's emotional needs",
      "Shared creative and spiritual sensibilities create a rich inner world together",
    ],
    challenges: [
      "Emotional boundaries are nearly nonexistent — both absorb the other's feelings indiscriminately",
      "Both are prone to escapism and avoidance when life gets difficult",
      "Neither is naturally practical, making daily logistics and financial management challenging",
    ],
    emotionalDynamics:
      "This is one of the most emotionally fluid pairings in the zodiac. Cancer and Pisces merge emotionally in a way that feels transcendent — almost spiritual. They sense each other's feelings from across the room and often experience shared emotional states. The challenge is maintaining individual emotional identities and not becoming so merged that neither can function independently.",
    communicationStyle:
      "Much of their communication happens beneath words — through energy, touch, and shared silence. When they do speak, both are gentle, empathetic, and deeply considerate of each other's feelings. The risk is that important practical conversations (finances, plans, boundaries) get neglected in favor of emotional and creative communion. They need structure to complement their flow.",
    famousCouples: [
      { names: "Kurt Russell & Goldie Hawn (Pisces & Scorpio)", signs: "Water-sign energy" },
    ],
    advice:
      "Your emotional connection is a rare gift — treat it as sacred. But also build practical structures (budgets, routines, clear agreements) that support your dreamy nature. Designate specific times for real-world logistics so they do not become a source of recurring crisis.",
  },

  // ─── LEO PAIRS ─────────────────────────────────────────────
  "leo-leo": {
    strengths: [
      "Overflowing warmth, generosity, and mutual admiration create an atmosphere of celebration",
      "Both are loyal, passionate, and give their all to the relationship",
      "A glamorous, socially magnetic couple that inspires others with their love",
    ],
    challenges: [
      "Two kings or queens in one castle creates constant competition for the spotlight",
      "Neither likes to admit fault, making conflict resolution a prolonged battle of egos",
      "Both need to be adored — but who is doing the adoring when both want to receive?",
    ],
    emotionalDynamics:
      "Two Leos together create a fireworks display of emotion — passionate, warm, dramatic, and sometimes exhausting. Both express feelings grandly and expect equally grand reception. When both feel seen and appreciated, the emotional climate is glorious. When either feels overlooked, the temperature drops dramatically, as Leo responds to perceived neglect with withdrawal or drama.",
    communicationStyle:
      "Bold, expressive, and theatrical. Two Leos communicate with passion and conviction, making even mundane conversations feel like events. Conflict communication is challenging because neither wants to back down or appear weak. The key is learning that apologizing is not losing — it is showing the strength of character that Leos actually admire most.",
    famousCouples: [
      { names: "Ben Affleck & Jennifer Lopez", signs: "Leo & Leo" },
      { names: "Barack & Michelle Obama (Leo & Capricorn)", signs: "Leo-adjacent" },
    ],
    advice:
      "Take turns being the star. Develop a generous spirit where your partner's victories feel like your own. When ego clashes arise (and they will), ask yourselves: do we want to win the argument or win at this relationship? A Leo who learns to share the spotlight becomes truly royal.",
  },

  "leo-virgo": {
    strengths: [
      "Virgo's behind-the-scenes efficiency perfectly supports Leo's front-stage brilliance",
      "Leo's confidence helps Virgo overcome self-doubt and perfectionist paralysis",
      "A complementary dynamic where Leo dreams big and Virgo handles the details to make it happen",
    ],
    challenges: [
      "Virgo's constructive criticism feels deeply personal to pride-sensitive Leo",
      "Leo's dramatic flair can exhaust reserved, modest Virgo",
      "Different social needs — Leo craves attention while Virgo prefers blending in",
    ],
    emotionalDynamics:
      "Leo expresses emotions openly and dramatically while Virgo processes them privately and analytically. Leo may feel Virgo is cold or withholding, while Virgo may feel Leo is excessive and attention-seeking. When Leo learns to appreciate Virgo's quiet acts of love and Virgo learns to express admiration verbally, a deep emotional trust develops.",
    communicationStyle:
      "Leo communicates in broad strokes and with emotional emphasis. Virgo communicates with precision and practical focus. Leo may feel Virgo misses the big picture by fixating on details, while Virgo may feel Leo's grand statements lack substance. Their communication improves dramatically when Leo listens to Virgo's specifics and Virgo leads with Leo's highlights.",
    famousCouples: [
      { names: "Beyonce & Jay-Z", signs: "Virgo & Sagittarius (Leo-adjacent energy)" },
    ],
    advice:
      "Leo, recognize that Virgo shows love through service and practical support, not grand gestures. Virgo, recognize that Leo needs vocal, enthusiastic appreciation — silent admiration does not register. You are the dream team of vision and execution when you stop judging each other's style.",
  },

  "leo-libra": {
    strengths: [
      "Both love beauty, culture, and social life — they are the glamorous power couple of the zodiac",
      "Libra's diplomacy perfectly balances Leo's boldness, creating a socially unbeatable team",
      "Mutual appreciation and romantic expression come naturally to both",
    ],
    challenges: [
      "Libra's indecisiveness can frustrate decisive Leo",
      "Leo's dominating personality may overshadow Libra's more subtle contributions",
      "Both can prioritize appearances over authenticity, creating a relationship that looks better than it feels",
    ],
    emotionalDynamics:
      "Both Leo and Libra prefer positive emotional states and may avoid the messier aspects of emotional life. Leo is emotionally expressive and needs admiration; Libra is emotionally harmonious and needs balance. Together they create a warm, pleasant emotional atmosphere — but they need to make sure it includes room for real, unfiltered feelings, not just curated ones.",
    communicationStyle:
      "Elegant and engaging. Leo brings passion and conviction while Libra brings grace and fairness. They are exceptional conversationalists together, impressing others and enjoying each other. Conflict resolution is their growth edge — Leo can be domineering and Libra can be passive-aggressive. Both need to practice honest, direct dialogue beneath the charming surface.",
    famousCouples: [
      { names: "Kim Kardashian & Kanye West (Libra & Gemini)", signs: "Leo-Libra dynamic" },
    ],
    advice:
      "Enjoy your beautiful social life together while investing equally in what happens when the audience is gone. Leo, create space for Libra's opinions and decisions. Libra, speak your truth even when it might create temporary disharmony — Leo actually respects directness more than diplomacy.",
  },

  "leo-scorpio": {
    strengths: [
      "An intensely passionate pairing with magnetic chemistry and deep mutual fascination",
      "Both are fiercely loyal and will fight to protect the relationship and each other",
      "When united, they form one of the zodiac's most powerful and influential partnerships",
    ],
    challenges: [
      "Monumental power struggles — both need to feel in control and neither backs down",
      "Leo's need for public admiration clashes with Scorpio's intensely private nature",
      "Jealousy runs high on both sides, with Scorpio's possessiveness matched by Leo's wounded pride",
    ],
    emotionalDynamics:
      "This is a high-octane emotional pairing. Leo's emotions are warm, sunny, and openly expressed. Scorpio's emotions are deep, intense, and strategically revealed. Leo may feel Scorpio is hiding things; Scorpio may feel Leo's emotional displays lack depth. When trust is fully established, the emotional intensity is profound — but trust takes time to build between these two guarded-in-different-ways signs.",
    communicationStyle:
      "Both are strong communicators who struggle to be vulnerable. Leo uses humor and charm to deflect; Scorpio uses silence and strategic disclosure. Productive communication requires both to lay down their armor and speak from genuine vulnerability — something neither finds easy but both deeply respect when the other does it first.",
    famousCouples: [
      { names: "Demi Moore & Ashton Kutcher (formerly)", signs: "Scorpio & Aquarius (fixed-sign intensity)" },
    ],
    advice:
      "Channel your combined intensity into shared goals rather than power struggles. The question is never 'who leads?' — it is 'are we building something worthy of our combined power?' When you align your formidable energies, you become unstoppable. When you oppose each other, nobody wins.",
  },

  "leo-sagittarius": {
    strengths: [
      "A natural Fire-Fire match radiating enthusiasm, optimism, and joy for life",
      "Both are generous, warm, and socially gifted — together they are irresistibly charismatic",
      "Shared love of adventure, travel, and grand experiences creates lasting memories",
    ],
    challenges: [
      "Leo needs devoted attention while Sagittarius needs unbounded freedom — a recurring tension",
      "Sagittarius' blunt honesty can wound Leo's considerable pride",
      "Both can overextend themselves — financially, socially, energetically — without the other providing balance",
    ],
    emotionalDynamics:
      "Emotionally, this is a warm and light pairing. Both express feelings openly and optimistically, preferring joy over brooding. The emotional climate is sunny and encouraging. The risk is that difficult emotions — grief, insecurity, fear — get glossed over because both prefer the highlight reel. Deepening emotional intimacy requires willingness to share the lowlights too.",
    communicationStyle:
      "Spirited, honest, and entertaining. These two love telling stories, sharing opinions, and dreaming out loud together. Sagittarius brings philosophical depth while Leo brings dramatic flair. Disagreements are resolved through humor more than analysis. They just need to ensure that their upbeat communication style does not become a way to avoid serious topics.",
    famousCouples: [
      { names: "Blake Lively & Ryan Reynolds", signs: "Virgo & Scorpio (fire-spirit energy)" },
    ],
    advice:
      "Your relationship is a celebration — but even celebrations need structure. Leo, give Sagittarius room to roam and they will always come back to you. Sagittarius, show Leo dedicated, focused attention regularly — it is the fuel for Leo's fire. Together, make your life the adventure you both crave.",
  },

  "leo-capricorn": {
    strengths: [
      "Both are ambitious and driven, capable of building an impressive life together",
      "Capricorn's strategic thinking pairs well with Leo's vision and charisma",
      "Mutual respect for each other's strength and determination forms a solid foundation",
    ],
    challenges: [
      "Leo seeks admiration and emotional warmth; Capricorn offers practical support but not effusive praise",
      "Capricorn's seriousness can dim Leo's playful spirit over time",
      "Different status languages — Leo wants social recognition, Capricorn wants professional respect",
    ],
    emotionalDynamics:
      "Leo needs to feel adored, celebrated, and emotionally central. Capricorn shows love through stability, loyalty, and building a secure future — not through verbal affirmation. Leo may feel emotionally starved while Capricorn feels their concrete expressions of love are undervalued. Bridging this gap requires Capricorn to verbalize appreciation and Leo to recognize Capricorn's practical love language.",
    communicationStyle:
      "Leo communicates with enthusiasm and emotion while Capricorn communicates with measured authority. Leo may feel Capricorn is patronizing; Capricorn may feel Leo is overreacting. Their conversations work best when focused on shared ambitions and plans, where both can contribute their strengths without stepping on each other's communication style.",
    famousCouples: [
      { names: "Michelle & Barack Obama", signs: "Capricorn & Leo" },
    ],
    advice:
      "Build your empire together — you are both builders at heart. Capricorn, learn that Leo needs celebration and joy as much as they need security. Leo, learn that Capricorn's understated love is no less deep than your dramatic version. You command the most respect when you are visibly united.",
  },

  "leo-aquarius": {
    strengths: [
      "As opposite signs, the attraction is magnetic — Leo's warmth meets Aquarius' cool brilliance",
      "Together they balance personal expression (Leo) with social consciousness (Aquarius)",
      "Both are creative, confident, and willing to stand out from the crowd",
    ],
    challenges: [
      "Leo needs personal attention and praise; Aquarius focuses on humanity rather than individuals",
      "Aquarius' emotional detachment hurts attention-craving Leo deeply",
      "Both are fixed signs with immovable opinions, creating epic standoffs",
    ],
    emotionalDynamics:
      "This opposite-sign pairing creates a compelling emotional tension. Leo wants to be the center of one person's universe; Aquarius wants to connect with the entire universe. Leo may feel Aquarius gives more attention to causes than to them, while Aquarius may feel suffocated by Leo's demand for devoted focus. The resolution lies in Leo expanding their circle of concern and Aquarius narrowing their focus occasionally to truly see their partner.",
    communicationStyle:
      "Both are strong-willed communicators who rarely change their minds. Leo communicates from the heart with passion and personal conviction. Aquarius communicates from the mind with detached logic and progressive vision. Their debates can be brilliant or bruising depending on whether they approach each other with curiosity or contempt.",
    famousCouples: [
      { names: "Ashton Kutcher & Mila Kunis (Aquarius & Leo)", signs: "Aquarius & Leo" },
    ],
    advice:
      "Your opposite-sign axis is about integrating personal glory with collective good. Leo, channel your creative fire into causes that matter to Aquarius. Aquarius, give Leo the personal recognition they need to feel loved. You are meant to expand each other's definition of what matters.",
  },

  "leo-pisces": {
    strengths: [
      "Leo's confidence protects sensitive Pisces, while Pisces' compassion softens Leo's edges",
      "Both are deeply creative and romantic, bringing artistry and beauty into the relationship",
      "Pisces' selfless devotion fulfills Leo's need to feel adored",
    ],
    challenges: [
      "Leo's dominating personality can overwhelm gentle, boundary-challenged Pisces",
      "Pisces' emotional complexity confuses straightforward Leo",
      "Leo may lose respect for Pisces' lack of assertiveness; Pisces may feel bulldozed by Leo's force",
    ],
    emotionalDynamics:
      "Leo's emotional expression is bold, warm, and direct. Pisces' emotional world is vast, subtle, and fluid. Leo may oversimplify Pisces' feelings, and Pisces may feel Leo does not understand their depth. When Leo learns to appreciate the nuanced beauty of Pisces' inner world and Pisces learns to bask in Leo's uncomplicated warmth, something magical emerges.",
    communicationStyle:
      "Leo speaks with authority and directness while Pisces communicates through feeling, intuition, and creative expression. Leo may grow frustrated when Pisces cannot articulate clear thoughts, and Pisces may shrink from Leo's forceful communication style. Artistic collaboration — music, cooking, creative projects — often becomes their best communication channel.",
    famousCouples: [
      { names: "Rihanna & ASAP Rocky (Pisces & Libra)", signs: "Leo-Pisces creative energy" },
    ],
    advice:
      "Leo, use your strength to protect and elevate Pisces rather than to dominate. Pisces, find your voice and share your rich inner world with Leo — they will be genuinely enchanted. Your relationship thrives when Leo provides structure and Pisces provides soul.",
  },

  // ─── VIRGO PAIRS ─────────────────────────────────────────────
  "virgo-virgo": {
    strengths: [
      "An incredibly efficient partnership — shared standards of quality, organization, and dedication",
      "Deep mutual understanding of each other's need for order, health, and meaningful work",
      "Both are reliable, responsible, and devoted to making the relationship work",
    ],
    challenges: [
      "Double perfectionism can create an atmosphere of constant critique and never-good-enough",
      "Both tend toward worry and anxiety, amplifying stress instead of alleviating it",
      "Spontaneity and passion may be sacrificed on the altar of routine and practicality",
    ],
    emotionalDynamics:
      "Two Virgos together create an emotionally careful environment. Both express love through practical service rather than grand emotional displays. This feels grounding and safe but can also feel emotionally flat. Neither is naturally comfortable with raw emotional expression, so feelings may be analyzed into oblivion rather than simply felt. Deliberately creating space for messiness and imperfection is their emotional homework.",
    communicationStyle:
      "Precise, thoughtful, and potentially over-critical. Both communicate with care and attention to detail, which means important things get discussed but also that every word is scrutinized. They may critique each other's communication style while communicating — a meta-problem unique to Virgo-Virgo pairs. Leading conversations with appreciation rather than correction transforms their dynamic.",
    famousCouples: [
      { names: "Blake Lively & Ryan Reynolds (Virgo & Scorpio)", signs: "Virgo-adjacent" },
    ],
    advice:
      "Be as generous with praise as you are precise with feedback. Intentionally schedule imperfect, messy, spontaneous experiences — cook without a recipe, take an unplanned trip, laugh at mistakes instead of fixing them. Your shared competence is remarkable; now balance it with shared vulnerability and play.",
  },

  "virgo-libra": {
    strengths: [
      "Both are thoughtful, considerate partners who pay attention to each other's needs",
      "Virgo's practical care combines with Libra's romantic sensibility for a well-rounded partnership",
      "As zodiac neighbors, they often share Mercury or Venus placements, creating subtle harmony",
    ],
    challenges: [
      "Virgo's directness about flaws clashes with Libra's need for harmonious approval",
      "Libra's indecisiveness frustrates efficiency-oriented Virgo",
      "Different approaches to order — Virgo organizes by function, Libra by aesthetics",
    ],
    emotionalDynamics:
      "Virgo shows love through practical service and constructive support while Libra shows love through partnership, romance, and verbal affirmation. Virgo may feel Libra is all style and no substance emotionally, while Libra may feel Virgo is critical rather than caring. Finding the overlap — both genuinely want their partner to thrive — is the key to emotional alignment.",
    communicationStyle:
      "Virgo is analytically precise while Libra is diplomatically balanced. Both carefully consider their words, which prevents explosive fights but can also make conversations feel over-managed. Virgo may feel Libra avoids the point; Libra may feel Virgo focuses too much on problems. They communicate best when Virgo softens delivery and Libra engages directly.",
    famousCouples: [
      { names: "Will Smith & Jada Pinkett Smith", signs: "Libra & Virgo" },
    ],
    advice:
      "Appreciate each other's complementary gifts. Virgo, deliver feedback with Libran grace. Libra, make decisions with Virgoan clarity. You are both trying to make life better — Virgo through improvement and Libra through harmony. These goals are not in conflict when approached with mutual appreciation.",
  },

  "virgo-scorpio": {
    strengths: [
      "Both are perceptive, analytical, and share a love of depth over superficiality",
      "Virgo's devotion and reliability meets Scorpio's fierce loyalty, creating rock-solid commitment",
      "Shared intensity about their interests and values creates a deeply engaged partnership",
    ],
    challenges: [
      "Both can be controlling — Virgo through micromanagement, Scorpio through emotional manipulation",
      "Virgo's criticism can trigger Scorpio's vengeful streak, creating a dangerous cycle",
      "Both struggle with trust and vulnerability, potentially creating emotional walls within the relationship",
    ],
    emotionalDynamics:
      "Scorpio's emotions run deep and intense while Virgo's are carefully managed and practically expressed. Scorpio may view Virgo as emotionally superficial, while Virgo may feel overwhelmed by Scorpio's emotional demands. When Virgo learns to trust Scorpio with their carefully guarded feelings, and Scorpio learns that Virgo's practical love is genuine, a profound bond forms.",
    communicationStyle:
      "Both are strategic communicators who choose words carefully. Virgo communicates to solve problems; Scorpio communicates to understand motivations. They share an appreciation for honesty and substance, despising small talk equally. Their conversations can be deeply meaningful — or deeply cutting when conflict arises. Mutual respect is the non-negotiable foundation.",
    famousCouples: [
      { names: "Julia Roberts & Danny Moder (Scorpio & Capricorn)", signs: "Virgo-Scorpio energy" },
    ],
    advice:
      "Your shared depth is your bond — lean into it. Virgo, let Scorpio see your imperfections and insecurities without trying to fix them first. Scorpio, let Virgo help without interpreting it as a power move. You are both deeply private people building something deeply meaningful — honor that with trust.",
  },

  "virgo-sagittarius": {
    strengths: [
      "Sagittarius' optimism lifts Virgo's tendency toward worry and self-criticism",
      "Virgo's attention to detail helps Sagittarius actually complete their grand plans",
      "Both are mutable signs, making them adaptable and willing to adjust for each other",
    ],
    challenges: [
      "Virgo's focus on details irritates big-picture Sagittarius, who finds it limiting",
      "Sagittarius' carelessness about logistics drives meticulous Virgo to distraction",
      "Virgo criticizes; Sagittarius preaches — both are giving unsolicited advice the other does not want",
    ],
    emotionalDynamics:
      "Virgo processes emotions through analysis while Sagittarius processes them through philosophy and action. Virgo may find Sagittarius emotionally avoidant; Sagittarius may find Virgo emotionally uptight. Their shared mutability gives them the flexibility to meet in the middle — if both are willing to stretch. Virgo needs to lighten up; Sagittarius needs to slow down.",
    communicationStyle:
      "Sagittarius is expansive and enthusiastic while Virgo is precise and discerning. Sagittarius talks in big ideas; Virgo talks in specific examples. They can enrich each other's perspective or frustrate each other endlessly. The key is Sagittarius valuing Virgo's details and Virgo appreciating Sagittarius' vision without dismissing each other's natural style.",
    famousCouples: [
      { names: "Britney Spears & Sam Asghari (formerly, Sagittarius & Pisces)", signs: "Mutable-sign energy" },
    ],
    advice:
      "Combine your strengths into a planning-and-execution partnership. Sagittarius provides the vision and enthusiasm; Virgo provides the roadmap and quality control. Stop trying to convert each other and start collaborating. Your shared mutability means you can adapt — if you choose to.",
  },

  "virgo-capricorn": {
    strengths: [
      "A powerhouse Earth-Earth match built on shared values of discipline, responsibility, and quality",
      "Exceptional practical compatibility — finances, household, careers all run smoothly together",
      "Deep mutual respect for each other's competence and dedication",
    ],
    challenges: [
      "Both suppress emotions in favor of productivity, risking an efficient but loveless partnership",
      "Virgo's self-criticism combined with Capricorn's impossible standards can create a joyless atmosphere",
      "Neither naturally prioritizes fun, romance, or spontaneity",
    ],
    emotionalDynamics:
      "Both Virgo and Capricorn express love through reliability and practical support rather than emotional declaration. This creates a deeply secure but potentially stiff emotional environment. Both may secretly wish the other would be more emotionally expressive while neither is willing to go first. The partner who first learns to say 'I love you' without it being attached to a task is the one who transforms this relationship.",
    communicationStyle:
      "Efficient, practical, and goal-oriented. They communicate well about logistics, plans, and responsibilities. Emotional conversations require deliberate effort from both. Their best communication happens through shared work — building something together allows feelings to flow naturally alongside productivity.",
    famousCouples: [
      { names: "Kate Middleton & Prince William (Capricorn & Cancer)", signs: "Earth-sign energy" },
    ],
    advice:
      "You have the practical part mastered — now deliberately invest in romance, play, and emotional expression. Schedule date nights, write love notes, take vacations that have no productive purpose. Your relationship deserves to be not just successful but joyful.",
  },

  "virgo-aquarius": {
    strengths: [
      "Both are intellectually driven and value competence and innovation",
      "Aquarius' unconventional thinking expands Virgo's sometimes narrow focus",
      "Virgo's practicality helps Aquarius bring visionary ideas to life",
    ],
    challenges: [
      "Virgo's need for order and routine conflicts with Aquarius' love of unpredictability",
      "Aquarius' emotional detachment can leave service-oriented Virgo feeling unappreciated",
      "Different social orientations — Virgo is selectively social, Aquarius connects with everyone",
    ],
    emotionalDynamics:
      "Neither Virgo nor Aquarius leads with emotion, which can create a cerebral partnership that functions well but lacks warmth. Virgo shows love through practical care; Aquarius shows love through intellectual respect and freedom. Both may struggle to create emotional intimacy because neither is comfortable being the emotionally vulnerable one. Someone has to go first.",
    communicationStyle:
      "Intellectually stimulating when aligned, frustrating when not. Virgo communicates with precision about specific, practical matters. Aquarius communicates about abstract ideas and future possibilities. Virgo may find Aquarius impractical; Aquarius may find Virgo narrow-minded. Their best conversations bridge the specific and the visionary.",
    famousCouples: [
      { names: "Jennifer Aniston & Justin Theroux (formerly, Aquarius & Leo)", signs: "Virgo-Aquarius energy" },
    ],
    advice:
      "Find projects that require both vision (Aquarius) and execution (Virgo). Your partnership is mentally strong — strengthen it emotionally by creating rituals of connection that go beyond intellectual exchange. Cook together, garden, or do something physical that gets you out of your heads and into your hearts.",
  },

  "virgo-pisces": {
    strengths: [
      "As opposite signs, they experience powerful mutual attraction and deep complementarity",
      "Virgo grounds Pisces' dreams in reality while Pisces infuses Virgo's life with magic and meaning",
      "Both are service-oriented — Virgo practically, Pisces compassionately — creating a deeply caring partnership",
    ],
    challenges: [
      "Virgo's criticism can devastate sensitive Pisces, even when well-intentioned",
      "Pisces' escapism and avoidance frustrates reality-based Virgo",
      "Virgo wants order; Pisces creates beautiful chaos — daily life can be a battleground",
    ],
    emotionalDynamics:
      "This opposite-sign pairing creates profound emotional complementarity. Pisces opens Virgo's heart to the vastness of feeling, while Virgo gives Pisces' overwhelming emotions practical structure. Virgo may not understand why Pisces is crying; Pisces may not understand why Virgo responds to emotions with a plan. But their opposite approaches complete each other beautifully.",
    communicationStyle:
      "Virgo communicates with clarity and practical precision. Pisces communicates through metaphor, feeling, and intuition. Virgo may grow impatient with Pisces' indirect style, and Pisces may feel reduced by Virgo's analytical approach. They communicate best through creative collaboration and acts of service — showing love rather than debating it.",
    famousCouples: [
      { names: "Cindy Crawford & Rande Gerber", signs: "Pisces & Virgo" },
    ],
    advice:
      "Your opposite-sign axis is about integrating the practical and the spiritual, the mundane and the magical. Virgo, let Pisces teach you that not everything needs to be useful to be valuable. Pisces, let Virgo teach you that structure is not the enemy of creativity. You are each other's missing piece.",
  },

  // ─── LIBRA PAIRS ─────────────────────────────────────────────
  "libra-libra": {
    strengths: [
      "A beautifully balanced partnership filled with grace, culture, and mutual consideration",
      "Shared love of art, beauty, and social life creates a rich, stimulating environment",
      "Both prioritize harmony and fairness, making the relationship feel equitable and respectful",
    ],
    challenges: [
      "Two indecisive people means nothing gets decided — paralysis by analysis becomes chronic",
      "Both avoid conflict so aggressively that real issues never get addressed",
      "The relationship can become overly focused on appearances and external validation",
    ],
    emotionalDynamics:
      "Two Libras create a pleasant, harmonious emotional atmosphere that can also be emotionally avoidant. Both want to maintain equilibrium, which means messy, intense feelings get smoothed over rather than explored. The relationship looks serene from the outside but may harbor unexpressed frustrations. Someone needs to be brave enough to disrupt the peace when it is time for honest conversation.",
    communicationStyle:
      "Diplomatic, thoughtful, and articulate — sometimes excessively so. Two Libras can discuss any topic with grace and mutual respect. The problem is that difficult truths get wrapped in so many layers of diplomacy that the point gets lost. They need a pact to sometimes be direct, even if it feels uncomfortable. Clarity is a form of kindness too.",
    famousCouples: [
      { names: "Catherine Zeta-Jones & Michael Douglas (Libra & Virgo)", signs: "Libra-adjacent" },
    ],
    advice:
      "Practice the art of loving disagreement. Your shared harmony is precious, but it cannot be built on avoidance. Choose honesty over comfort when it matters. And when neither of you can decide where to eat, flip a coin — then use your freed mental energy for the decisions that actually matter.",
  },

  "libra-scorpio": {
    strengths: [
      "Libra's social grace combined with Scorpio's magnetic intensity creates a captivating couple",
      "Scorpio's depth gives Libra's relationship focus real substance and meaning",
      "As zodiac neighbors, they often share Venus or Mars placements that create unexpected chemistry",
    ],
    challenges: [
      "Scorpio's intensity and jealousy overwhelms harmony-seeking Libra",
      "Libra's social flirtatiousness triggers Scorpio's deepest insecurities",
      "Scorpio demands emotional depth that surface-oriented Libra may struggle to provide",
    ],
    emotionalDynamics:
      "Scorpio experiences emotions as transformative forces while Libra experiences them as data points for maintaining relational balance. Scorpio may feel Libra is emotionally superficial; Libra may feel Scorpio is emotionally overwhelming. The bridge is Libra learning that deep emotion is not inherently disruptive, and Scorpio learning that lightness is not inherently shallow.",
    communicationStyle:
      "Libra communicates with diplomatic charm while Scorpio communicates with penetrating directness. Libra may feel interrogated; Scorpio may feel placated. Their communication improves when Libra drops the diplomacy and speaks truth, which Scorpio paradoxically finds far more soothing than polished reassurance.",
    famousCouples: [
      { names: "Bill & Hillary Clinton", signs: "Leo & Scorpio (neighboring-sign energy)" },
    ],
    advice:
      "Libra, be more real and less polished with Scorpio — they can handle the truth and actually prefer it. Scorpio, be more gentle and less investigative with Libra — they are not hiding anything, they just process differently. Your neighboring-sign tension is where your greatest growth lives.",
  },

  "libra-sagittarius": {
    strengths: [
      "A socially vibrant pairing that loves culture, travel, and intellectual exploration together",
      "Sagittarius' honesty and Libra's diplomacy create a balanced communication dynamic",
      "Both are optimistic, future-oriented, and value growth in relationships",
    ],
    challenges: [
      "Sagittarius' blunt honesty can wound Libra's need for harmonious interaction",
      "Libra wants partnership decisions made jointly; Sagittarius wants to decide independently",
      "Neither is naturally inclined toward domestic life or routine maintenance",
    ],
    emotionalDynamics:
      "Both Libra and Sagittarius prefer light, positive emotional interactions. They bond through shared experiences, laughter, and intellectual connection rather than deep emotional processing. This creates a joyful but potentially surface-level emotional bond. Deepening requires both to occasionally sit with uncomfortable feelings instead of immediately moving on to the next adventure or conversation.",
    communicationStyle:
      "Lively, engaging, and intellectually stimulating. Libra brings balanced perspective while Sagittarius brings bold opinions. They enjoy debating ideas without the conversation becoming personal. The communication challenge comes when real relational issues arise and both would rather pivot to philosophy than address what is actually happening between them.",
    famousCouples: [
      { names: "John Legend & Chrissy Teigen (Capricorn & Sagittarius)", signs: "Libra-Sagittarius energy" },
    ],
    advice:
      "Keep traveling, exploring, and learning together — it is the lifeblood of your relationship. But also build a home base, literally and emotionally, where you can land after your adventures. Sagittarius, consider Libra's feelings before speaking your truth. Libra, appreciate that Sagittarius' honesty is a gift, even when it stings.",
  },

  "libra-capricorn": {
    strengths: [
      "Both are cardinal signs with natural leadership abilities, capable of achieving great things together",
      "Capricorn's determination gives Libra's ideas practical momentum",
      "Libra's social intelligence complements Capricorn's professional ambition",
    ],
    challenges: [
      "Capricorn's workaholic tendencies leave partnership-oriented Libra feeling lonely",
      "Libra's need for social activity conflicts with Capricorn's preference for focused work",
      "Different priorities — Libra values harmony and beauty, Capricorn values achievement and status",
    ],
    emotionalDynamics:
      "Libra seeks emotional connection through partnership and togetherness while Capricorn seeks emotional security through achievement and structure. Libra may feel Capricorn is emotionally distant and work-obsessed, while Capricorn may feel Libra is emotionally needy and unproductive. Finding the bridge between connection and achievement is their central emotional challenge.",
    communicationStyle:
      "Libra communicates with charm and diplomacy while Capricorn communicates with authority and efficiency. Libra may feel dismissed by Capricorn's brisk style; Capricorn may feel frustrated by Libra's circuitous approach. They communicate best when focused on shared goals and plans, where Libra's relationship skills and Capricorn's strategic mind complement each other.",
    famousCouples: [
      { names: "Gwyneth Paltrow & Brad Falchuk (Libra & Pisces)", signs: "Cardinal-sign energy" },
    ],
    advice:
      "Balance work and partnership deliberately. Capricorn, block out time for Libra that is as non-negotiable as your most important meetings. Libra, show interest in Capricorn's ambitions and find ways to contribute. You are both builders — build a life that is successful and beautiful.",
  },

  "libra-aquarius": {
    strengths: [
      "A naturally harmonious Air-Air pairing with exceptional intellectual and social chemistry",
      "Both value fairness, progress, and creating positive change in their communities",
      "Shared love of socializing, ideas, and culture keeps the relationship vibrant and stimulating",
    ],
    challenges: [
      "Both can be emotionally detached, creating a relationship strong on ideas but weak on intimacy",
      "Aquarius' unpredictability can unsettle harmony-seeking Libra",
      "Neither naturally provides emotional grounding, which can leave the relationship floating",
    ],
    emotionalDynamics:
      "Emotionally, this is a comfortable but potentially detached pairing. Both prefer intellectual connection over raw emotional intensity. Libra wants partnership harmony while Aquarius wants individual freedom — these can coexist but require conscious negotiation. The emotional depth that transforms a pleasant partnership into a profound one must be deliberately cultivated.",
    communicationStyle:
      "Superb. Both are articulate, idea-driven, and socially aware. Conversations range from personal to political to philosophical with ease. They challenge each other intellectually without bruising egos. The risk is that all this excellent communication stays in the realm of ideas and never penetrates the messier territory of personal emotional truth.",
    famousCouples: [
      { names: "Ellen DeGeneres & Portia de Rossi (Aquarius & Libra-adjacent)", signs: "Air-Air harmony" },
    ],
    advice:
      "Your mental connection is extraordinary — protect it by also developing emotional fluency. Practice sharing feelings that cannot be resolved by logic. Be physically present with each other, not just intellectually engaged. The heart needs expression as much as the mind.",
  },

  "libra-pisces": {
    strengths: [
      "Both are deeply romantic, creative, and idealistic about love and partnership",
      "Shared appreciation for art, music, and beauty creates a poetic, aesthetically rich bond",
      "Both are gentle, empathetic, and naturally attuned to their partner's needs",
    ],
    challenges: [
      "Neither is naturally decisive or assertive, leading to chronic indecision and drift",
      "Pisces' emotional intensity can overwhelm harmony-seeking Libra",
      "Both avoid conflict so persistently that serious issues become permanent fixtures",
    ],
    emotionalDynamics:
      "Libra seeks balanced, fair emotional exchanges while Pisces experiences emotions as vast, boundless, and sometimes overwhelming. Libra may try to rationalize or balance Pisces' feelings, which Pisces experiences as dismissal. Pisces' emotional depth may pull Libra into waters deeper than they are prepared for. The connection deepens when Libra accepts Pisces' emotional reality and Pisces respects Libra's need for equilibrium.",
    communicationStyle:
      "Both communicate with sensitivity and consideration but through different channels. Libra is verbally articulate and balanced; Pisces is intuitive and impressionistic. They may struggle with practical conversations (budgets, logistics, decisions) because neither wants to be the one who forces reality into their romantic bubble. One of them must learn to be the practical voice.",
    famousCouples: [
      { names: "Jada Pinkett Smith & Will Smith", signs: "Virgo & Libra (Venus-water dynamic)" },
    ],
    advice:
      "Embrace your shared romanticism while building practical structures to support it. One of you needs to learn to make decisions and hold boundaries — ideally, take turns. Your creative and emotional connection is beautiful; give it a solid foundation by addressing real-world needs with the same care you bring to your inner world.",
  },

  // ─── SCORPIO PAIRS ─────────────────────────────────────────────
  "scorpio-scorpio": {
    strengths: [
      "No one understands Scorpio like another Scorpio — the depth of mutual understanding is unmatched",
      "Fierce loyalty and commitment on both sides creates an unbreakable bond",
      "Shared intensity around passion, transformation, and truth creates a profoundly meaningful relationship",
    ],
    challenges: [
      "Power struggles are constant — neither will yield control, creating nuclear-level standoffs",
      "Jealousy and possessiveness are doubled, creating a potentially toxic cycle of suspicion",
      "Both know exactly how to hurt the other and may weaponize that knowledge during conflicts",
    ],
    emotionalDynamics:
      "Two Scorpios together create the most emotionally intense pairing in the entire zodiac. Every interaction carries weight, every look has meaning, and every conflict feels existential. The depth of emotional connection is extraordinary — borderline psychic. The danger is that this intensity becomes all-consuming, leaving no room for lightness, humor, or individual space.",
    communicationStyle:
      "Strategic, penetrating, and sometimes manipulative. Both are skilled at reading between lines and understanding hidden motivations. When trust is solid, their communication is deeply honest and transformative. When trust wavers, it becomes a chess game of control and counter-control. Ground rules for transparent communication are not optional — they are essential.",
    famousCouples: [
      { names: "Leonardo DiCaprio & multiple partners (Scorpio)", signs: "Scorpio intensity" },
    ],
    advice:
      "Your depth is your gift and your danger. Establish absolute ground rules: no manipulation, no weaponizing vulnerabilities, no silent treatments as punishment. Channel your combined intensity into transformation — of yourselves, your community, or the world. You are most powerful when your intensity has a constructive outlet.",
  },

  "scorpio-sagittarius": {
    strengths: [
      "Sagittarius brings optimism and lightness that lifts Scorpio's sometimes heavy emotional world",
      "Scorpio brings depth and focus that gives Sagittarius' wandering energy meaningful direction",
      "As zodiac neighbors, they often share planetary placements that create unexpected rapport",
    ],
    challenges: [
      "Scorpio's need for emotional intensity conflicts with Sagittarius' need for emotional freedom",
      "Sagittarius' blunt tactlessness can wound Scorpio deeply, provoking retaliation",
      "Scorpio wants exclusivity and depth; Sagittarius wants variety and breadth",
    ],
    emotionalDynamics:
      "Scorpio dives deep into emotional waters while Sagittarius prefers to skim the surface. Scorpio may feel Sagittarius is emotionally avoidant; Sagittarius may feel Scorpio is emotionally demanding. The relationship works when Sagittarius learns to occasionally go deep and Scorpio learns to occasionally come up for air. Their neighboring-sign bond creates more understanding than is apparent at first.",
    communicationStyle:
      "Sagittarius is open, honest, and sometimes carelessly blunt. Scorpio is strategic, probing, and carefully selective with information. Sagittarius says everything; Scorpio reveals things on a need-to-know basis. This creates a dynamic where Sagittarius feels Scorpio is hiding things and Scorpio feels overwhelmed by Sagittarius' verbal deluge. Calibrating openness levels is key.",
    famousCouples: [
      { names: "Miley Cyrus & Liam Hemsworth (formerly, Sagittarius & Capricorn)", signs: "Scorpio-Sagittarius dynamic" },
    ],
    advice:
      "Sagittarius, honor Scorpio's need for emotional privacy and depth — not everything needs to be discussed with everyone. Scorpio, honor Sagittarius' need for freedom and lightness — not everything needs to be a deep conversation. Your adjacent-sign connection holds more potential than either of you initially suspects.",
  },

  "scorpio-capricorn": {
    strengths: [
      "Two of the zodiac's most determined signs — together they achieve extraordinary things",
      "Shared seriousness, depth, and ambition creates a power couple dynamic",
      "Both value loyalty and commitment above almost everything else in relationships",
    ],
    challenges: [
      "Emotional vulnerability is difficult for both, risking a successful but emotionally isolated partnership",
      "Power dynamics and control issues simmer beneath the surface of this high-achieving duo",
      "Both can be ruthless when threatened, making conflicts potentially destructive",
    ],
    emotionalDynamics:
      "Both Scorpio and Capricorn have deep emotions that they guard carefully behind protective walls. Scorpio's walls are made of intensity and strategic vulnerability; Capricorn's are made of competence and self-sufficiency. The emotional breakthrough comes when one of them is brave enough to be genuinely vulnerable first. When the walls come down, the emotional bond is extraordinarily deep and lasting.",
    communicationStyle:
      "Both are direct and substantive communicators who despise superficiality. Scorpio probes for truth; Capricorn states it plainly. They respect each other's no-nonsense approach. The challenge is that neither is naturally warm or reassuring in communication, making their interactions feel businesslike if they do not consciously inject warmth and tenderness.",
    famousCouples: [
      { names: "Bradley Cooper & Irina Shayk (formerly, Capricorn & Scorpio-adjacent)", signs: "Scorpio-Capricorn power" },
    ],
    advice:
      "You are already a formidable team in the outer world. Now bring that same determination to your inner world together. Practice vulnerability as the ultimate power move — showing your soft underbelly to each other is not weakness but the deepest form of the trust you both value so highly.",
  },

  "scorpio-aquarius": {
    strengths: [
      "Both are fiercely independent thinkers who refuse to follow the crowd",
      "Shared intellectual curiosity and depth creates stimulating, unconventional conversations",
      "When aligned, they form one of the zodiac's most original and transformative partnerships",
    ],
    challenges: [
      "Both are fixed signs with immovable opinions, creating stubborn standoffs",
      "Scorpio's emotional intensity clashes dramatically with Aquarius' emotional detachment",
      "Control issues are paramount — Scorpio controls through emotion, Aquarius through ideas",
    ],
    emotionalDynamics:
      "This is one of the zodiac's most emotionally challenging pairings. Scorpio needs deep, intimate, exclusive emotional bonding. Aquarius needs emotional freedom, intellectual connection, and a cause larger than any one relationship. Scorpio may feel Aquarius is cold and unreachable; Aquarius may feel Scorpio is possessive and draining. Success requires both to radically accept each other's emotional wiring.",
    communicationStyle:
      "Both are intelligent, opinionated, and unwilling to compromise their positions. Scorpio communicates with emotional penetration while Aquarius communicates with intellectual conviction. Debates can be fascinating or infuriating. Neither changes their mind easily, which means productive communication requires genuine openness to influence — the one thing both fixed signs resist most.",
    famousCouples: [
      { names: "Demi Moore & Ashton Kutcher (formerly)", signs: "Scorpio & Aquarius" },
    ],
    advice:
      "Respect your differences as genuinely different operating systems, not personal failures. Scorpio, accept that Aquarius' love does not look like yours but is no less real. Aquarius, accept that Scorpio's intensity is not a cage but a cathedral. If you can bridge the gap between depth and breadth, you create something truly unique.",
  },

  "scorpio-pisces": {
    strengths: [
      "A profoundly deep Water-Water connection with almost telepathic emotional understanding",
      "Both value emotional authenticity and can sense each other's moods and needs intuitively",
      "Shared creative and spiritual sensibilities create a rich, meaningful inner life together",
    ],
    challenges: [
      "Emotional intensity can become overwhelming — both feel everything deeply and may spiral together",
      "Scorpio's possessiveness can suffocate Pisces' need for imaginative freedom",
      "Both are prone to emotional manipulation — Scorpio through power, Pisces through martyrdom",
    ],
    emotionalDynamics:
      "This Water-Water pairing creates one of the zodiac's deepest emotional bonds. Scorpio's intense focus meets Pisces' boundless empathy in a connection that transcends ordinary intimacy. They sense each other's pain, joy, and anxiety without words. The risk is emotional enmeshment — losing where one ends and the other begins. Maintaining individual emotional identities is essential.",
    communicationStyle:
      "Much of their communication is nonverbal — intuitive, energetic, and emotionally transmitted. When they do speak, both are emotionally honest but in different ways. Scorpio is direct and penetrating; Pisces is poetic and impressionistic. They rarely misunderstand each other's feelings, even when the words do not quite capture the experience.",
    famousCouples: [
      { names: "Prince & Mayte Garcia (Gemini & Scorpio)", signs: "Water-sign depth" },
    ],
    advice:
      "Your emotional connection is transcendent — protect it with healthy boundaries. Scorpio, give Pisces room to dream and wander without interpreting it as abandonment. Pisces, be direct with Scorpio rather than absorbing their energy silently. Create a shared spiritual or creative practice that gives your extraordinary connection a productive outlet.",
  },

  // ─── SAGITTARIUS PAIRS ─────────────────────────────────────────────
  "sagittarius-sagittarius": {
    strengths: [
      "Unlimited adventure, laughter, and philosophical exploration — never a dull moment",
      "Both understand and respect each other's need for freedom without jealousy",
      "Shared optimism creates a relationship that feels perpetually exciting and full of possibility",
    ],
    challenges: [
      "Double restlessness means nobody is anchoring the relationship to reality",
      "Both avoid emotional depth and difficult conversations, leaving issues permanently unaddressed",
      "Financial irresponsibility multiplied — who pays the bills when both want to travel?",
    ],
    emotionalDynamics:
      "Two Sagittarians together create an emotionally upbeat but potentially shallow dynamic. Both prefer optimism over processing, adventure over analysis, and moving forward over dwelling on the past. This makes for a fun, light partnership that may lack the emotional depth needed to survive genuine crises. Building emotional resilience as a couple requires deliberate practice.",
    communicationStyle:
      "Open, honest, enthusiastic, and philosophical. They can discuss the meaning of life for hours and never run out of material. Both appreciate directness and neither holds grudges. The communication gap is around practical matters and emotional vulnerability — topics they both instinctively avoid but must eventually face.",
    famousCouples: [
      { names: "Brad Pitt & Julianne Moore (Sagittarius & Sagittarius-adjacent)", signs: "Sagittarius fire" },
    ],
    advice:
      "Your mutual freedom and joy are rare gifts — now add roots. Build at least one stable structure together (a home, a business, a tradition) that gives your adventures a launching pad. And when life inevitably serves up something that cannot be fixed with optimism, sit with it together instead of running from it.",
  },

  "sagittarius-capricorn": {
    strengths: [
      "Sagittarius brings vision and enthusiasm while Capricorn brings strategy and discipline",
      "As zodiac neighbors, they complement each other's blind spots beautifully when respect is present",
      "Capricorn grounds Sagittarius' ideas into achievable plans, creating real-world results",
    ],
    challenges: [
      "Capricorn sees Sagittarius as irresponsible and unrealistic; Sagittarius sees Capricorn as rigid and joyless",
      "Different timelines — Sagittarius wants everything now, Capricorn plans in decades",
      "Sagittarius' need for freedom clashes with Capricorn's need for structure and commitment",
    ],
    emotionalDynamics:
      "Sagittarius expresses emotions through enthusiasm and physical action while Capricorn expresses them through steadfast dedication and quiet presence. Sagittarius may feel Capricorn is emotionally cold; Capricorn may feel Sagittarius is emotionally immature. Their adjacent-sign bond means they understand each other more than they let on — the challenge is expressing that understanding.",
    communicationStyle:
      "Sagittarius is expansive and spontaneous in conversation while Capricorn is measured and purposeful. Sagittarius may feel Capricorn kills their enthusiasm with practicality; Capricorn may feel Sagittarius wastes time with unrealistic speculation. Their best conversations happen when both acknowledge the value of vision and execution in equal measure.",
    famousCouples: [
      { names: "John Legend & Chrissy Teigen", signs: "Capricorn & Sagittarius" },
    ],
    advice:
      "Stop trying to convert each other and start leveraging your differences. Sagittarius, respect Capricorn's plans as the scaffolding for your dreams. Capricorn, respect Sagittarius' enthusiasm as the fuel for your ambitions. You are the dreamer and the builder — and both roles are essential.",
  },

  "sagittarius-aquarius": {
    strengths: [
      "A highly stimulating intellectual and ideological match — both want to change the world",
      "Shared love of freedom, independence, and unconventional thinking creates a progressive partnership",
      "Both are socially conscious and future-oriented, bonding over shared visions for humanity",
    ],
    challenges: [
      "Neither is emotionally demonstrative, creating a partnership that can feel more like a friendship",
      "Both can be committed to ideas more than to each other, deprioritizing the relationship",
      "Practical daily life management is nobody's strength — dishes pile up while they debate philosophy",
    ],
    emotionalDynamics:
      "Emotionally, this is a warm but not intense pairing. Both express care through intellectual engagement, shared activities, and mutual respect rather than deep emotional processing. This works well until a genuine emotional crisis requires vulnerability — then both may retreat into their heads. The emotional work is learning to be present with feelings, not just ideas.",
    communicationStyle:
      "Outstanding. Sagittarius' philosophical enthusiasm meets Aquarius' innovative vision in conversations that are endlessly fascinating. They challenge each other's thinking, expand each other's perspectives, and never run out of things to discuss. The risk is that their communication stays in the realm of ideas and never descends into the personal, emotional territory that bonds partners at the deepest level.",
    famousCouples: [
      { names: "Taylor Swift & Joe Alwyn (formerly, Sagittarius & Pisces)", signs: "Freedom-loving energy" },
    ],
    advice:
      "Your intellectual and ideological bond is rare and precious. Build on it by also developing emotional intimacy — share fears, insecurities, and tender feelings, not just opinions and ideas. And assign someone to handle the practical details of life, or they will never get done.",
  },

  "sagittarius-pisces": {
    strengths: [
      "Both are mutable signs with extraordinary adaptability and openness to life's flow",
      "Shared love of spirituality, philosophy, and the search for meaning creates a profound bond",
      "Both are ruled by Jupiter (traditional rulership for Pisces), sharing generosity, optimism, and expansiveness",
    ],
    challenges: [
      "Sagittarius' bluntness wounds sensitive Pisces repeatedly, often without realizing it",
      "Both can be escapist — Sagittarius through restless activity, Pisces through fantasy and withdrawal",
      "Neither provides practical grounding, making daily responsibilities a persistent struggle",
    ],
    emotionalDynamics:
      "Pisces feels emotions like the ocean — deep, vast, and sometimes overwhelming. Sagittarius feels emotions like a bonfire — bright, warm, and quickly moving. Pisces may feel Sagittarius skims their emotional surface; Sagittarius may feel Pisces pulls them into emotional depths they cannot navigate. Their shared Jupiter connection provides the optimism needed to bridge this gap.",
    communicationStyle:
      "Sagittarius communicates in bold declarations and philosophical frameworks while Pisces communicates through imagery, feeling, and intuition. Sagittarius' directness can feel harsh to Pisces, and Pisces' indirectness can feel evasive to Sagittarius. They connect beautifully through creative expression, spiritual practice, and shared adventures that bypass verbal communication.",
    famousCouples: [
      { names: "Britney Spears & Kevin Federline (formerly)", signs: "Sagittarius & Pisces" },
    ],
    advice:
      "Honor your shared Jupiter ruler by being generous with each other — generous in patience, in benefit of the doubt, and in emotional allowance. Sagittarius, soften your delivery for Pisces. Pisces, be direct with Sagittarius rather than hoping they will intuit your needs. Together you seek life's deepest meaning — seek it in each other too.",
  },

  // ─── CAPRICORN PAIRS ─────────────────────────────────────────────
  "capricorn-capricorn": {
    strengths: [
      "An incredibly driven, ambitious pair capable of building empires together",
      "Shared values of discipline, responsibility, and long-term planning create a rock-solid foundation",
      "Deep mutual respect — both understand the sacrifices required for meaningful achievement",
    ],
    challenges: [
      "Double workaholism can destroy the romantic and emotional dimensions of the relationship",
      "Neither is naturally emotionally expressive, creating a functional but potentially loveless partnership",
      "Competition around achievement can turn partners into rivals rather than teammates",
    ],
    emotionalDynamics:
      "Two Capricorns together create the most emotionally contained partnership in the zodiac. Both express love through stability, financial security, and steadfast commitment. While this is deeply meaningful, the absence of emotional expression can make both feel lonely within the relationship. One of them must be brave enough to break through the competence-as-love barrier and express raw, tender feeling.",
    communicationStyle:
      "Efficient, substantive, and goal-oriented. They communicate excellently about strategy, plans, and responsibilities. Personal or emotional topics are approached with the same efficiency, which strips them of warmth. Their communication transforms when one of them says 'I am not looking for a solution — I just need you to listen and hold me.'",
    famousCouples: [
      { names: "Kate Middleton & Prince William (Capricorn & Cancer)", signs: "Capricorn ambition" },
    ],
    advice:
      "Schedule romance and emotional expression as non-negotiable appointments in your calendars (yes, this is advice specific to Capricorn). Your ability to build is unmatched — now build a love life as impressive as your career. Let vulnerability be the project you tackle together.",
  },

  "capricorn-aquarius": {
    strengths: [
      "Capricorn's institutional knowledge combines with Aquarius' revolutionary vision for powerful innovation",
      "As zodiac neighbors, they share Saturn as a ruler, creating deep understanding of discipline and structure",
      "Together they can reform systems — Capricorn working within them, Aquarius reimagining them",
    ],
    challenges: [
      "Capricorn is traditional; Aquarius is progressive — values conflicts arise around lifestyle and priorities",
      "Capricorn may view Aquarius as impractical and scattered; Aquarius may view Capricorn as boring and rigid",
      "Both are emotionally reserved in different ways, making warmth scarce",
    ],
    emotionalDynamics:
      "Both Capricorn and Aquarius are emotionally reserved, which can create a partnership that runs smoothly but lacks warmth. Capricorn guards emotions behind a wall of competence; Aquarius intellectualizes them into abstractions. Neither naturally creates the cozy emotional intimacy that sustains a romantic partnership. Deliberate emotional investment is required from both.",
    communicationStyle:
      "Capricorn communicates practically and Aquarius communicates conceptually. They can have excellent discussions about systems, structures, and ideas for improvement. Personal emotional communication is their shared weak spot. Their Saturn connection gives them a shared language around responsibility, discipline, and legacy — building from there is wise.",
    famousCouples: [
      { names: "Diane Keaton & Al Pacino (Capricorn & Taurus)", signs: "Saturn-ruled energy" },
    ],
    advice:
      "Your shared Saturn ruler gives you a foundation of mutual respect and seriousness. Use it to take your emotional life as seriously as you take everything else. Capricorn, open your heart to Aquarius' unconventional approach. Aquarius, ground your ideals in Capricorn's reality. You reform each other beautifully if you allow it.",
  },

  "capricorn-pisces": {
    strengths: [
      "Capricorn provides the structure and stability that Pisces needs to thrive creatively and emotionally",
      "Pisces brings imagination, compassion, and emotional depth that enriches Capricorn's achievement-focused life",
      "A naturally complementary pairing where each provides what the other lacks",
    ],
    challenges: [
      "Capricorn's pragmatism may dismiss Pisces' emotional and spiritual needs as impractical",
      "Pisces' avoidance of reality frustrates responsibility-focused Capricorn",
      "Capricorn may inadvertently become parental toward dependent Pisces, creating an unequal dynamic",
    ],
    emotionalDynamics:
      "Capricorn is emotionally guarded and expresses love through practical provision. Pisces is emotionally boundless and expresses love through empathy and emotional attunement. Pisces can gradually teach Capricorn to feel more freely, and Capricorn can teach Pisces to channel emotions productively. The danger is Capricorn dismissing Pisces' feelings or Pisces feeling perpetually misunderstood.",
    communicationStyle:
      "Capricorn communicates with directness and practical focus while Pisces communicates with impressionistic feeling and creative metaphor. Capricorn may need Pisces to 'just say what you mean,' while Pisces may need Capricorn to 'feel what I am feeling.' They connect best through shared creative or charitable activities where both their languages are valued.",
    famousCouples: [
      { names: "George & Amal Clooney (Taurus & Aquarius)", signs: "Capricorn-Pisces complementarity" },
    ],
    advice:
      "Appreciate your complementarity as a feature, not a bug. Capricorn, Pisces' emotional world is not a distraction from important things — it is one of the most important things. Pisces, Capricorn's practical nature is not a rejection of your inner world — it is the container that protects it. You complete each other when you honor each other's gifts.",
  },

  // ─── AQUARIUS PAIRS ─────────────────────────────────────────────
  "aquarius-aquarius": {
    strengths: [
      "An extraordinary meeting of minds — intellectual stimulation, shared visions, and mutual respect for individuality",
      "Both value freedom and independence, creating a relationship free from possessiveness",
      "Shared commitment to humanitarian values and progressive ideas creates a deeply purpose-driven bond",
    ],
    challenges: [
      "Two emotionally detached people can create a relationship that is intellectually rich but emotionally barren",
      "Both are stubborn in their fixed opinions, leading to ideological standoffs",
      "Neither prioritizes the relationship over their individual missions, leading to drift",
    ],
    emotionalDynamics:
      "Two Aquarians together create the zodiac's most intellectually intimate but emotionally distant pairing. They understand each other's need for space and independence perfectly — perhaps too perfectly. The emotional growth edge is learning that emotional closeness is not the same as emotional control, and that vulnerability strengthens rather than weakens their bond.",
    communicationStyle:
      "Brilliant, wide-ranging, and future-focused. They can discuss anything and everything for hours without fatigue. Two Aquarians bring out each other's most innovative and original thinking. The communication gap is personal and emotional — 'I miss you,' 'I need you,' 'I am afraid' are sentences that do not come naturally to either but must be practiced.",
    famousCouples: [
      { names: "Ellen DeGeneres & Portia de Rossi", signs: "Aquarius & Aquarius-adjacent" },
    ],
    advice:
      "Your intellectual partnership is unmatched. Now dare to be emotionally dependent on each other — not as weakness but as trust. Create rituals of intimacy that feel safe but stretch your emotional muscles. The relationship that inspires the world begins with two people brave enough to fully love each other.",
  },

  "aquarius-pisces": {
    strengths: [
      "Both are visionary in their own way — Aquarius intellectually, Pisces intuitively — creating a comprehensive worldview",
      "As zodiac neighbors, they often share planetary placements that create subtle, unexpected affinity",
      "Both are compassionate and concerned with making the world a better place",
    ],
    challenges: [
      "Aquarius' rational approach clashes with Pisces' emotional and spiritual approach to life",
      "Pisces' emotional needs may overwhelm intellectually-oriented Aquarius",
      "Both can be avoidant — Aquarius through detachment, Pisces through escapism — allowing problems to worsen",
    ],
    emotionalDynamics:
      "Pisces feels everything deeply and personally while Aquarius processes emotions intellectually and impersonally. Pisces may feel Aquarius is cold and disconnected; Aquarius may feel Pisces is irrationally emotional. Their connection deepens when Aquarius allows Pisces to be their emotional guide and Pisces allows Aquarius to provide rational perspective — not to override feelings but to complement them.",
    communicationStyle:
      "Aquarius communicates through ideas, theories, and progressive visions. Pisces communicates through feeling, imagery, and spiritual knowing. These two approaches can complement each other beautifully (creating holistic understanding) or frustrate each other completely (neither speaking the other's language). Patience and genuine curiosity about each other's perspective is essential.",
    famousCouples: [
      { names: "Justin Timberlake & Jessica Biel (Aquarius & Pisces)", signs: "Aquarius & Pisces" },
    ],
    advice:
      "View your different approaches as complementary lenses rather than competing worldviews. Aquarius, practice feeling without analyzing. Pisces, practice communicating without assuming your partner can read your emotions. Your neighboring-sign connection means you share more common ground than is immediately apparent — find it and build on it.",
  },

  // ─── PISCES PAIRS ─────────────────────────────────────────────
  "pisces-pisces": {
    strengths: [
      "An almost telepathic emotional bond — both understand each other's inner world without words",
      "Shared creativity, spirituality, and compassion create a beautiful, soulful partnership",
      "Both are gentle, empathetic, and selfless in their love for each other",
    ],
    challenges: [
      "No one is driving the ship — both lack practical grounding and decisiveness",
      "Emotional boundaries dissolve completely, making it impossible to tell whose feelings are whose",
      "Shared escapist tendencies (substances, fantasy, avoidance) can become enabling rather than supportive",
    ],
    emotionalDynamics:
      "Two Pisces together create the zodiac's most emotionally merged pairing. They feel everything the other feels, often simultaneously and indistinguishably. The emotional depth available is oceanic — spiritual, transcendent, and sometimes overwhelming. The central challenge is maintaining individual emotional identities and not becoming so merged that neither can function independently.",
    communicationStyle:
      "Much of their communication is nonverbal — energetic, intuitive, and felt rather than spoken. When they do speak, both are gentle, poetic, and deeply considerate. Practical conversations (bills, schedules, decisions) are their weak spot. They need external structures — apps, calendars, a trusted practical friend — to handle what neither naturally manages.",
    famousCouples: [
      { names: "Elizabeth Taylor & Richard Burton (Pisces & Scorpio)", signs: "Water-sign transcendence" },
    ],
    advice:
      "Your spiritual and emotional connection is one of the rarest gifts in human experience. Protect it by building the practical infrastructure neither of you naturally creates. Designate roles, use tools and systems for daily life management, and maintain friendships that ground you. Your love is beautiful — give it the structure it needs to survive in the real world.",
  },
};

/**
 * Look up content for a zodiac pair. Handles both orderings (aries-taurus or taurus-aries).
 */
export function getPairContent(
  sign1: string,
  sign2: string
): ZodiacPairContent | null {
  const key1 = `${sign1}-${sign2}`;
  const key2 = `${sign2}-${sign1}`;
  return PAIR_CONTENT[key1] || PAIR_CONTENT[key2] || null;
}
