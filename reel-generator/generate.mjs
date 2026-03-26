#!/usr/bin/env node
/**
 * ChartChemistry Daily Insight Reel Generator (v2 — Playwright)
 *
 * Screenshots HTML slides via headless Chromium for pixel-perfect output.
 * Generates 6 TikTok-ready 1080x1920 PNGs + MP4 video + caption.
 *
 * Usage:
 *   node generate.mjs                    # Today's pair (day-of-year rotation)
 *   node generate.mjs aries taurus       # Specific pair
 *   node generate.mjs --day 3            # Pair #3 in rotation
 *   node generate.mjs --list             # List all 78 pairs
 */

import { chromium } from "playwright";
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "fs";
import { execFileSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "output");
const TEMPLATE = join(__dirname, "slide-template.html");

// ─── ZODIAC DATA ──────────────────────────────────────────
const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const SIGN_SYMBOLS = {
  Aries: "\u2648", Taurus: "\u2649", Gemini: "\u264A", Cancer: "\u264B",
  Leo: "\u264C", Virgo: "\u264D", Libra: "\u264E", Scorpio: "\u264F",
  Sagittarius: "\u2650", Capricorn: "\u2651", Aquarius: "\u2652", Pisces: "\u2653",
};

const SIGN_ELEMENTS = {
  Aries: "fire", Taurus: "earth", Gemini: "air", Cancer: "water",
  Leo: "fire", Virgo: "earth", Libra: "air", Scorpio: "water",
  Sagittarius: "fire", Capricorn: "earth", Aquarius: "air", Pisces: "water",
};

const ELEMENT_METAPHORS = {
  "fire-fire": { a: "flame", b: "wildfire", line: "Two flames \u2014 they either light the way or burn the house down." },
  "fire-earth": { a: "wildfire", b: "mountain", line: "The wildfire met the mountain. One won\u2019t stop. The other won\u2019t move." },
  "fire-air": { a: "spark", b: "wind", line: "A spark caught the wind. Together they\u2019re unstoppable \u2014 or out of control." },
  "fire-water": { a: "fire", b: "ocean", line: "Fire kissed the ocean. Steam rose. Something new was born." },
  "earth-earth": { a: "stone", b: "root", line: "Two roots in the same soil \u2014 unshakable, unless they compete for sun." },
  "earth-air": { a: "mountain", b: "breeze", line: "The mountain tried to hold the breeze. The breeze just laughed." },
  "earth-water": { a: "garden", b: "rain", line: "Rain fell on rich soil. Something beautiful grew \u2014 slowly." },
  "air-air": { a: "storm", b: "sky", line: "Two winds in the same sky \u2014 brilliant conversation, but who\u2019s landing the plane?" },
  "air-water": { a: "mist", b: "wave", line: "The mist danced over the waves. Beautiful from afar. Confusing up close." },
  "water-water": { a: "tide", b: "current", line: "Two currents in one ocean \u2014 they feel everything, twice." },
};

const PAIR_CONTENT = {
  "aries-aries": {
    strengths: [
      "Unmatched energy and enthusiasm \u2014 this couple never runs out of things to do",
      "Deep mutual respect for each other\u2019s independence and ambition",
      "A fearless approach to life that makes them willing to take bold risks as a team",
    ],
    challenges: [
      "Two dominant personalities lead to explosive arguments over who takes the lead",
      "Neither naturally gravitates toward compromise, making conflict resolution tough",
      "Impatience on both sides can cause them to abandon conversations prematurely",
    ],
    emotional: "Two Aries create an emotionally high-voltage relationship. Feelings are expressed instantly and intensely. Both need to learn that vulnerability is not weakness \u2014 their instinct is to power through emotions rather than sit with them.",
    advice: "Take turns leading. Your shared fire burns brightest when you are allies, not rivals.",
    famous: "Sarah Jessica Parker & Matthew Broderick",
  },
  "aries-taurus": {
    strengths: [
      "Aries brings excitement and spontaneity that pulls Taurus out of their comfort zone",
      "Taurus provides grounding stability that gives Aries a safe base to return to",
      "Together they balance impulsiveness with practicality \u2014 effective goal-crushers",
    ],
    challenges: [
      "Aries\u2019 need for speed clashes with Taurus\u2019 measured, deliberate pace",
      "Taurus sees Aries as reckless. Aries sees Taurus as frustratingly stubborn.",
      "Money fights incoming \u2014 Aries spends freely while Taurus prioritizes security",
    ],
    emotional: "Taurus processes emotions slowly and deeply, building toward a steady flame, while Aries experiences feelings in sudden bursts. When they sync up, Taurus\u2019 constancy gives Aries\u2019 passion a safe container.",
    advice: "Respect each other\u2019s internal clock. Your differences are your superpower when wielded with mutual respect.",
    famous: "Victoria & David Beckham",
  },
  "aries-gemini": {
    strengths: [
      "An incredibly fun, high-energy pairing that thrives on adventure",
      "Gemini\u2019s wit and Aries\u2019 boldness create a socially magnetic duo",
      "Both value independence, so neither feels smothered",
    ],
    challenges: [
      "Both signs can be restless, making it hard to build lasting depth",
      "Aries\u2019 directness can wound Gemini\u2019s more nuanced emotional nature",
      "Commitment timelines differ \u2014 Aries charges in while Gemini weighs options",
    ],
    emotional: "Feelings are channeled through action (Aries) and conversation (Gemini). Neither is naturally inclined to deep emotional processing \u2014 liberating or superficial depending on perspective.",
    advice: "Channel your shared restless energy into joint adventures. Schedule regular check-ins where you share what you actually feel.",
    famous: null,
  },
  "aries-cancer": {
    strengths: [
      "Aries\u2019 courage helps Cancer step outside their protective shell",
      "Cancer\u2019s nurturing nature provides warmth Aries secretly craves",
      "Both are cardinal signs with natural leadership, driving the relationship forward",
    ],
    challenges: [
      "Aries\u2019 blunt communication can deeply wound sensitive Cancer",
      "Cancer\u2019s moodiness frustrates action-oriented Aries",
      "Different definitions of security \u2014 independence vs. closeness",
    ],
    emotional: "Cancer feels everything deeply and needs time to process, while Aries experiences emotions as fuel for action. Cancer teaches Aries the richness of depth; Aries shows Cancer that not every feeling needs analysis.",
    advice: "The friction here is where the growth lives. Aries, soften your edges. Cancer, trust their fire.",
    famous: "Chris Pratt & Katherine Schwarzenegger",
  },
  "aries-leo": {
    strengths: [
      "A power couple radiating confidence, creativity, and passion",
      "Both love grand gestures and know how to make each other feel special",
      "Incredible physical chemistry and shared love of adventure",
    ],
    challenges: [
      "Both need to be the star \u2014 competition for the spotlight is real",
      "Leo needs constant admiration; Aries isn\u2019t naturally a cheerleader",
      "Arguments are dramatic and loud \u2014 neither backs down easily",
    ],
    emotional: "Two fire signs create an emotionally intense bond. The love is passionate and expressive, but so are the fights. Both need to learn that being vulnerable doesn\u2019t diminish their strength.",
    advice: "You\u2019re both royalty. Build a kingdom together instead of competing for the crown.",
    famous: "Sarah Michelle Gellar & Freddie Prinze Jr.",
  },
  "leo-scorpio": {
    strengths: [
      "Both are intensely loyal and demand all-or-nothing commitment",
      "Magnetic chemistry \u2014 this pairing turns heads everywhere",
      "Shared ambition and desire for power create a formidable duo",
    ],
    challenges: [
      "Two massive egos in one relationship \u2014 power struggles are epic",
      "Scorpio\u2019s secrecy infuriates transparent Leo",
      "Both hold grudges, making forgiveness a rare commodity",
    ],
    emotional: "Leo loves in sunlight; Scorpio loves in shadows. When they meet in twilight, it\u2019s transformative. But both need to be the one in control of the emotional narrative.",
    advice: "This only works if both partners can be vulnerable without seeing it as defeat. Drop the armor.",
    famous: "Hillary & Bill Clinton",
  },
  "scorpio-pisces": {
    strengths: [
      "The deepest emotional connection in the zodiac \u2014 they understand each other\u2019s souls",
      "Both are intuitive, often communicating without words",
      "Shared love of mystery, depth, and transformation",
    ],
    challenges: [
      "Can become a closed emotional loop that excludes the outside world",
      "Scorpio\u2019s intensity can overwhelm even empathetic Pisces",
      "Both avoid confrontation \u2014 passive aggression becomes the default",
    ],
    emotional: "Two water signs creating an ocean of feeling. The emotional depth is unmatched, but they can drown in each other if they don\u2019t maintain individual identity.",
    advice: "You feel each other more than any other pairing. Use that gift to heal, not to lose yourselves.",
    famous: "Ryan Gosling & Eva Mendes",
  },
  "libra-sagittarius": {
    strengths: [
      "Both are social, optimistic, and love experiencing new things together",
      "Libra\u2019s charm + Sagittarius\u2019 humor = the life of every party",
      "Neither is possessive, giving each other healthy space",
    ],
    challenges: [
      "Sagittarius\u2019 bluntness shocks diplomatic Libra",
      "Libra wants partnership decisions; Sagittarius wants solo freedom",
      "Both avoid difficult emotional conversations by staying surface-level",
    ],
    emotional: "Light, fun, and breezy on the surface \u2014 which is exactly how both like it. The growth edge is learning to go deep when it matters.",
    advice: "You\u2019re everyone\u2019s favorite couple at the party. Make sure you\u2019re still a couple after everyone goes home.",
    famous: "Ryan Reynolds & Blake Lively",
  },
  "capricorn-pisces": {
    strengths: [
      "Capricorn builds the structure; Pisces fills it with soul and meaning",
      "Pisces softens Capricorn\u2019s hard edges; Capricorn makes Pisces\u2019 dreams real",
      "A quiet, powerful bond built on mutual admiration",
    ],
    challenges: [
      "Capricorn\u2019s practicality can crush Pisces\u2019 dreamy nature",
      "Pisces\u2019 lack of structure frustrates goal-oriented Capricorn",
      "Different coping mechanisms \u2014 Capricorn works harder, Pisces escapes",
    ],
    emotional: "Capricorn feels safe enough with Pisces to finally let their guard down. Pisces feels grounded enough with Capricorn to stop floating away. It\u2019s complementary magic.",
    advice: "Capricorn, not everything needs a plan. Pisces, some things do. Trust each other\u2019s lens on reality.",
    famous: "John Legend & Chrissy Teigen",
  },
};

// ─── HELPERS ──────────────────────────────────────────────
function generateAllPairs() {
  const pairs = [];
  for (let i = 0; i < SIGNS.length; i++) {
    for (let j = i; j < SIGNS.length; j++) {
      pairs.push([SIGNS[i], SIGNS[j]]);
    }
  }
  return pairs;
}

function getElementCombo(a, b) {
  const eA = SIGN_ELEMENTS[a];
  const eB = SIGN_ELEMENTS[b];
  return ELEMENT_METAPHORS[`${eA}-${eB}`] || ELEMENT_METAPHORS[`${eB}-${eA}`] || ELEMENT_METAPHORS["fire-earth"];
}

function getPairContent(signA, signB) {
  const key1 = `${signA.toLowerCase()}-${signB.toLowerCase()}`;
  const key2 = `${signB.toLowerCase()}-${signA.toLowerCase()}`;
  const content = PAIR_CONTENT[key1] || PAIR_CONTENT[key2];
  if (content) return content;

  return {
    strengths: [
      `${signA}\u2019s ${SIGN_ELEMENTS[signA]} energy complements ${signB}\u2019s ${SIGN_ELEMENTS[signB]} nature beautifully`,
      `They challenge each other to grow in unexpected and powerful ways`,
      `A unique pairing that keeps both partners evolving and on their toes`,
    ],
    challenges: [
      `Different emotional rhythms require patience and genuine understanding`,
      `Communication styles may need conscious and deliberate translation`,
      `Finding shared ground between their different approaches to life and love`,
    ],
    emotional: `${signA} and ${signB} process emotions differently, creating a dynamic where each partner brings something the other deeply lacks. The key is learning to appreciate rather than judge these differences.`,
    advice: `Honor what makes you different. Your unique combination is your greatest asset when you stop trying to change each other.`,
    famous: null,
  };
}

function generateCaption(signA, signB) {
  const metaphor = getElementCombo(signA, signB);
  return `${metaphor.line}\n\n${signA} x ${signB} \u2014 the full truth about this pairing. Strengths, red flags, and the emotional reality.\n\nTag your ${signA} or ${signB} \uD83D\uDC9C\n\n#chartchemistry #${signA.toLowerCase()} #${signB.toLowerCase()} #zodiaccompatibility #astrologytiktok #zodiacsigns #astrology #compatibility #relationships #zodiacpairings`;
}

// ─── MAIN ─────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--list")) {
    const allPairs = generateAllPairs();
    allPairs.forEach((p, i) => console.log(`${i + 1}. ${p[0]} x ${p[1]}`));
    console.log(`\nTotal: ${allPairs.length} pairs`);
    return;
  }

  let signA, signB;

  if (args.includes("--day")) {
    const dayIdx = parseInt(args[args.indexOf("--day") + 1]) || 1;
    const allPairs = generateAllPairs();
    const pair = allPairs[(dayIdx - 1) % allPairs.length];
    [signA, signB] = pair;
  } else if (args.length >= 2 && !args[0].startsWith("--")) {
    signA = args[0].charAt(0).toUpperCase() + args[0].slice(1).toLowerCase();
    signB = args[1].charAt(0).toUpperCase() + args[1].slice(1).toLowerCase();
  } else {
    const allPairs = generateAllPairs();
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const pair = allPairs[dayOfYear % allPairs.length];
    [signA, signB] = pair;
  }

  if (!SIGNS.includes(signA) || !SIGNS.includes(signB)) {
    console.error(`Invalid signs: ${signA}, ${signB}`);
    console.error(`Valid signs: ${SIGNS.join(", ")}`);
    process.exit(1);
  }

  const content = getPairContent(signA, signB);
  const metaphor = getElementCombo(signA, signB);
  const pairDir = join(OUT_DIR, `${signA.toLowerCase()}-${signB.toLowerCase()}`);
  if (!existsSync(pairDir)) mkdirSync(pairDir, { recursive: true });

  console.log(`\n\u2728 Generating reel: ${signA} x ${signB}`);
  console.log(`   Output: ${pairDir}\n`);

  // Write template as-is, then inject data via page.evaluate (handles Unicode natively)
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
  const capElement = SIGN_ELEMENTS[signA].charAt(0).toUpperCase() + SIGN_ELEMENTS[signA].slice(1);

  const logoPath = join(__dirname, "assets", "logo.png");
  const logoBase64 = existsSync(logoPath)
    ? `data:image/png;base64,${readFileSync(logoPath).toString("base64")}`
    : "";

  const html = readFileSync(TEMPLATE, "utf-8");
  const customHtml = join(pairDir, "slides.html");
  writeFileSync(customHtml, html);

  // Launch Playwright and inject all data via JS (avoids HTML entity issues)
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(`file://${customHtml}`, { waitUntil: "networkidle" });

  // Wait for fonts to load
  await page.waitForTimeout(2000);

  // Inject all dynamic content via JavaScript (textContent for safety)
  await page.evaluate((data) => {
    const $ = (id) => document.getElementById(id);

    // Slide 1: Hook
    $("hook-emoji").textContent = `${data.symbolA} ${data.symbolB}`;
    $("hook-text").textContent = data.hookLine;
    $("hook-pair").textContent = `${data.signA.toUpperCase()} x ${data.signB.toUpperCase()}`;

    // Slide 2: Pair
    $("pair-date").textContent = data.dateStr;
    $("sign-a-symbol").textContent = data.symbolA;
    $("sign-b-symbol").textContent = data.symbolB;
    $("sign-a-name").textContent = data.signA;
    $("sign-b-name").textContent = data.signB;
    $("pair-title").textContent = `${data.signA} \u00D7 ${data.signB}`;
    $("pair-tagline").textContent = `\u201C${data.capElement} meets ${data.elementB} \u2014 ${data.metaphorA} and ${data.metaphorB}.\u201D`;

    if (data.famous) {
      $("famous-names").textContent = data.famous;
    } else {
      $("famous-box").style.display = "none";
    }

    // Slide 3: Strengths — build via DOM (safe, no innerHTML)
    const sList = $("strengths-list");
    sList.textContent = "";
    data.strengths.forEach(s => {
      const item = document.createElement("div");
      item.className = "bullet-item";
      const dot = document.createElement("div");
      dot.className = "bullet-dot green";
      dot.textContent = "\u2713";
      const txt = document.createElement("div");
      txt.className = "bullet-text";
      txt.textContent = s;
      item.appendChild(dot);
      item.appendChild(txt);
      sList.appendChild(item);
    });

    // Slide 4: Challenges — build via DOM (safe, no innerHTML)
    const cList = $("challenges-list");
    cList.textContent = "";
    data.challenges.forEach(c => {
      const item = document.createElement("div");
      item.className = "bullet-item";
      const dot = document.createElement("div");
      dot.className = "bullet-dot red";
      dot.textContent = "!";
      const txt = document.createElement("div");
      txt.className = "bullet-text";
      txt.textContent = c;
      item.appendChild(dot);
      item.appendChild(txt);
      cList.appendChild(item);
    });

    // Slide 5: Emotional
    $("emotional-quote").textContent = data.emotional;
    $("advice-text").textContent = data.advice;

    // Slide 6: CTA
    if (data.logoDataUri) {
      const logo = document.querySelector(".cta-logo");
      if (logo) logo.src = data.logoDataUri;
    }
    $("cta-today").textContent = `Today: ${data.signA} \u00D7 ${data.signB}`;
  }, {
    signA,
    signB,
    symbolA: SIGN_SYMBOLS[signA],
    symbolB: SIGN_SYMBOLS[signB],
    hookLine: metaphor.line,
    dateStr,
    capElement,
    elementB: SIGN_ELEMENTS[signB],
    metaphorA: metaphor.a,
    metaphorB: metaphor.b,
    famous: content.famous,
    strengths: content.strengths,
    challenges: content.challenges,
    emotional: content.emotional,
    advice: content.advice,
    logoDataUri: logoBase64,
  });

  await page.waitForTimeout(300);

  const slideNames = [
    "01-hook", "02-pair", "03-strengths", "04-challenges", "05-emotional", "06-cta"
  ];

  const filePaths = [];
  for (let i = 0; i < slideNames.length; i++) {
    const slideId = `slide-${i + 1}`;

    // Show only this slide
    await page.evaluate((id) => {
      document.querySelectorAll(".slide").forEach(s => s.classList.remove("active"));
      document.getElementById(id).classList.add("active");
    }, slideId);

    await page.waitForTimeout(200);

    const path = join(pairDir, `${slideNames[i]}.png`);
    await page.screenshot({ path, type: "png" });
    filePaths.push(path);
    console.log(`   \u2713 ${slideNames[i]}.png`);
  }

  // ─── INSTAGRAM CAROUSEL (1080x1080 square) ───
  console.log(`\n   \uD83D\uDCF8 Generating Instagram carousel (1080x1080)...\n`);

  const igDir = join(pairDir, "instagram");
  if (!existsSync(igDir)) mkdirSync(igDir, { recursive: true });

  // Resize viewport to square
  await page.setViewportSize({ width: 1080, height: 1080 });

  // Inject square-mode CSS overrides
  await page.addStyleTag({
    content: `
      body { width: 1080px !important; height: 1080px !important; }
      .slide { width: 1080px !important; height: 1080px !important; }
      .slide-inner { padding: 50px 50px !important; }
      .hook-emoji { font-size: 80px !important; margin-bottom: 30px !important; }
      .hook-text { font-size: 42px !important; max-width: 800px !important; line-height: 1.35 !important; }
      .hook-pair { font-size: 26px !important; margin-top: 0 !important; }
      .hook-divider { margin: 24px 0 !important; }
      .hook-swipe { display: none !important; }
      .pair-signs { gap: 30px !important; margin-bottom: 30px !important; }
      .sign-circle { width: 110px !important; height: 110px !important; }
      .sign-circle::after { inset: -6px !important; }
      .sign-symbol { font-size: 50px !important; }
      .sign-name { font-size: 18px !important; margin-top: 12px !important; }
      .pair-vs { font-size: 32px !important; }
      .pair-title { font-size: 44px !important; margin-bottom: 10px !important; }
      .pair-tagline { font-size: 22px !important; max-width: 600px !important; }
      .famous-box { margin-top: 30px !important; padding: 20px 28px !important; width: 80% !important; }
      .famous-label { font-size: 14px !important; }
      .famous-names { font-size: 22px !important; }
      .section-icon { font-size: 50px !important; margin-bottom: 10px !important; }
      .section-title { font-size: 36px !important; margin-bottom: 28px !important; }
      .bullet-list { width: 88% !important; }
      .bullet-item { margin-bottom: 18px !important; padding: 14px 18px !important; gap: 16px !important; }
      .bullet-dot { width: 30px !important; height: 30px !important; font-size: 14px !important; }
      .bullet-text { font-size: 22px !important; line-height: 1.45 !important; }
      .emotional-icon { font-size: 56px !important; margin-bottom: 10px !important; }
      .emotional-label { font-size: 16px !important; margin-bottom: 28px !important; }
      .quote-mark { font-size: 100px !important; top: 160px !important; }
      .emotional-quote { font-size: 26px !important; max-width: 750px !important; margin-bottom: 36px !important; }
      .advice-box { padding: 24px 32px !important; width: 88% !important; }
      .advice-label { font-size: 16px !important; margin-bottom: 12px !important; }
      .advice-text { font-size: 22px !important; }
      .cta-logo { width: 240px !important; margin-bottom: 16px !important; }
      .cta-brand { font-size: 52px !important; margin-bottom: 18px !important; }
      .cta-text { font-size: 24px !important; max-width: 650px !important; margin-bottom: 36px !important; }
      .cta-button { padding: 20px 52px !important; font-size: 24px !important; }
      .cta-link { font-size: 20px !important; margin-top: 24px !important; }
      .cta-today { margin-top: 30px !important; font-size: 18px !important; }
      .watermark { bottom: 28px !important; font-size: 18px !important; }
      .accent-line.top { top: 36px !important; }
      .accent-line.bottom { bottom: 60px !important; }
      .pair-date { top: 36px !important; right: 40px !important; font-size: 16px !important; }
    `
  });

  await page.waitForTimeout(300);

  const igPaths = [];
  for (let i = 0; i < slideNames.length; i++) {
    const slideId = `slide-${i + 1}`;
    await page.evaluate((id) => {
      document.querySelectorAll(".slide").forEach(s => s.classList.remove("active"));
      document.getElementById(id).classList.add("active");
    }, slideId);
    await page.waitForTimeout(200);

    const path = join(igDir, `${slideNames[i]}.png`);
    await page.screenshot({ path, type: "png" });
    igPaths.push(path);
    console.log(`   \u2713 ig/${slideNames[i]}.png`);
  }

  await browser.close();

  // Create video with ffmpeg
  const videoPath = join(pairDir, "reel.mp4");
  const concatFile = join(pairDir, "concat.txt");
  const concatContent = filePaths
    .map((p) => `file '${p}'\nduration 3.5`)
    .join("\n") + `\nfile '${filePaths[filePaths.length - 1]}'`;
  writeFileSync(concatFile, concatContent);

  try {
    execFileSync("ffmpeg", [
      "-y", "-f", "concat", "-safe", "0", "-i", concatFile,
      "-vf", "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,format=yuv420p",
      "-c:v", "libx264", "-preset", "medium", "-crf", "23",
      "-r", "30", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
      videoPath,
    ], { stdio: "pipe" });
    console.log(`   \u2713 reel.mp4 (21s video)\n`);
  } catch (err) {
    console.error("   \u2717 ffmpeg error \u2014 slides saved as PNGs\n");
  }

  // Caption + meta
  const caption = generateCaption(signA, signB);
  writeFileSync(join(pairDir, "caption.txt"), caption);
  console.log(`   \u2713 caption.txt`);

  // Instagram caption (slightly different tone)
  const igCaption = `${signA} \u00D7 ${signB} \u2014 the deep truth about this pairing \u2728\n\nSwipe through for strengths, red flags, and the emotional reality most people miss.\n\nSave this. Tag someone who needs to see it.\n\n#chartchemistry #${signA.toLowerCase()} #${signB.toLowerCase()} #zodiaccompatibility #astrology #zodiacsigns #compatibility #relationshipadvice #astrologymemes #zodiacfacts`;
  writeFileSync(join(igDir, "caption.txt"), igCaption);
  console.log(`   \u2713 ig/caption.txt`);

  const meta = {
    signA, signB,
    date: today.toISOString().split("T")[0],
    tiktok: {
      slides: filePaths,
      video: videoPath,
      caption,
    },
    instagram: {
      slides: igPaths,
      caption: igCaption,
    },
    hashtags: `#chartchemistry #${signA.toLowerCase()} #${signB.toLowerCase()} #zodiaccompatibility #astrologytiktok`,
    status: "pending",
  };
  writeFileSync(join(pairDir, "meta.json"), JSON.stringify(meta, null, 2));
  console.log(`\n   \u2713 meta.json`);

  console.log(`\n\uD83C\uDFAC REEL READY: ${signA} x ${signB}`);
  console.log(`   TikTok:    ${filePaths.length} slides (1080x1920) + reel.mp4`);
  console.log(`   Instagram: ${igPaths.length} slides (1080x1080) in /instagram/`);
  console.log(`   Video:     ${videoPath}`);
  console.log(`\n\uD83D\uDCDD TIKTOK CAPTION:\n${caption}`);
  console.log(`\n\uD83D\uDCF8 INSTAGRAM CAPTION:\n${igCaption}`);
}

main().catch(console.error);
