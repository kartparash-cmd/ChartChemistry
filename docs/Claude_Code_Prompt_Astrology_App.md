# Claude Code Prompt: AI Astrological Compatibility Web App (MVP)

## Project Overview

Build a full-stack web application called **[APP_NAME]** — an AI-powered astrological compatibility platform that analyzes full birth charts (synastry, composite charts, house overlays, planetary aspects) to provide deep relationship compatibility insights. This is NOT a dating app. It's a compatibility analysis tool that anyone can use for romantic partners, crushes, exes, friends, or family.

**Core thesis:** Most astrology apps only compare sun signs. This app goes 10 layers deeper — analyzing Moon compatibility, Venus/Mars dynamics, Saturn commitment patterns, house overlays, and the full synastry chart — then uses AI to synthesize everything into a coherent, personalized narrative that reads like a session with a professional astrologer.

**Tech Stack:**
- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Framer Motion for animations
- **Backend:** Next.js API routes + Python microservice for astrological calculations
- **Database:** PostgreSQL via Prisma ORM
- **AI:** Anthropic Claude API for chart interpretation
- **Astrological Engine:** Swiss Ephemeris (via `swisseph` Python package) for planetary calculations
- **Auth:** NextAuth.js (Google + email magic link)
- **Payments:** Stripe (subscriptions + one-time purchases)
- **Deployment:** Vercel (frontend) + Railway or Fly.io (Python microservice)
- **Styling:** Tailwind CSS + shadcn/ui components

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Next.js Frontend               │
│  (Pages, Components, UI, Chart Visualizations)   │
└──────────────────────┬──────────────────────────┘
                       │
              Next.js API Routes
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   PostgreSQL    Python Astro    Claude API
   (Prisma)      Microservice   (Interpretation)
                  (Swiss Eph)
```

---

## Database Schema (Prisma)

```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  name            String?
  image           String?
  plan            Plan     @default(FREE)
  stripeCustomerId String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  birthProfiles   BirthProfile[]
  reports         CompatibilityReport[]
  chatSessions    ChatSession[]
}

enum Plan {
  FREE
  PREMIUM
  ANNUAL
}

model BirthProfile {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  name          String
  birthDate     DateTime
  birthTime     String?  // HH:MM format, nullable (some users won't know)
  birthCity      String
  birthCountry   String
  latitude      Float
  longitude     Float
  timezone      String
  isOwner       Boolean  @default(false) // Is this the user's own chart?
  chartData     Json?    // Cached natal chart calculation results
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  reportsAsPerson1 CompatibilityReport[] @relation("Person1")
  reportsAsPerson2 CompatibilityReport[] @relation("Person2")
}

model CompatibilityReport {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  person1Id       String
  person1         BirthProfile @relation("Person1", fields: [person1Id], references: [id])
  person2Id       String
  person2         BirthProfile @relation("Person2", fields: [person2Id], references: [id])
  
  // Scores (0-100)
  overallScore        Int
  communicationScore  Int
  emotionalScore      Int
  chemistryScore      Int
  stabilityScore      Int
  conflictScore       Int
  
  // AI-generated content
  summaryNarrative    String   @db.Text  // Short shareable summary
  fullNarrative       String   @db.Text  // Full AI interpretation
  redFlags            Json     // Array of warning areas
  growthAreas         Json     // Array of growth opportunities
  
  // Raw astrological data
  synastryData        Json     // Full synastry calculation results
  compositeData       Json?    // Composite chart data (premium)
  
  tier                ReportTier @default(FREE)
  createdAt           DateTime @default(now())

  @@unique([person1Id, person2Id])
}

enum ReportTier {
  FREE      // Basic: sun/moon/rising + overall score + short summary
  PREMIUM   // Full: all dimensions, full narrative, red flags, growth areas
  BOUTIQUE  // PDF export with composite chart and transit forecast
}

model ChatSession {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  reportId    String?
  messages    Json     // Array of {role, content, timestamp}
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## Python Astrological Microservice

Build a FastAPI microservice that handles all astrological calculations. This is separate from the Next.js app because Swiss Ephemeris is a Python/C library.

### Endpoints

**POST `/api/natal-chart`**
- Input: `{ birthDate, birthTime, latitude, longitude, timezone }`
- Output: Full natal chart data including:
  - All planet positions (Sun through Pluto + North Node, Chiron, Lilith) with sign, degree, minute
  - House cusps (support Placidus and Whole Sign systems)
  - Aspects between planets (conjunction, sextile, square, trine, opposition) with orbs
  - Element and modality balance
  - Dominant planet calculation

**POST `/api/synastry`**
- Input: `{ chart1: NatalChart, chart2: NatalChart }`
- Output:
  - Inter-chart aspects (all aspects between Person 1's planets and Person 2's planets) with orb values
  - House overlays (where Person 1's planets fall in Person 2's houses and vice versa)
  - Element/modality compatibility
  - Key compatibility indicators:
    - Moon compatibility (emotional)
    - Venus-Mars aspects (chemistry/romance)
    - Mercury aspects (communication)
    - Saturn aspects (commitment/challenges)
    - Jupiter aspects (growth/expansion)
    - Sun-Moon aspects (core identity + emotions)
  - Calculated sub-scores for each dimension (0-100)
  - Overall compatibility score (weighted combination)

**POST `/api/composite`**
- Input: `{ chart1: NatalChart, chart2: NatalChart }`
- Output: Composite chart (midpoint method) with positions, houses, and aspects

**POST `/api/transits`**
- Input: `{ natalChart: NatalChart, date: string }`
- Output: Current transits affecting the natal chart, with interpretive keywords

### Scoring Algorithm

The scoring should weight aspects as follows (these are starting weights — the app will learn better weights over time from user outcome data):

```python
DIMENSION_WEIGHTS = {
    "emotional": {  # Moon-Moon, Moon-Venus, Moon-Sun aspects
        "conjunction": 10, "trine": 8, "sextile": 6, 
        "square": -3, "opposition": -1
    },
    "chemistry": {  # Venus-Mars, Mars-Mars, Venus-Venus
        "conjunction": 10, "trine": 7, "sextile": 5,
        "square": 2,  # Squares add tension/attraction in chemistry
        "opposition": 4  # Oppositions create magnetic pull
    },
    "communication": {  # Mercury-Mercury, Mercury-Sun, Mercury-Moon
        "conjunction": 8, "trine": 7, "sextile": 6,
        "square": -4, "opposition": -2
    },
    "stability": {  # Saturn-Sun, Saturn-Moon, Jupiter-Saturn
        "conjunction": 6, "trine": 8, "sextile": 7,
        "square": -5, "opposition": -3
    },
    "conflict": {  # Mars-Mars, Mars-Saturn, Mars-Moon (inverse — higher = less conflict)
        "conjunction": -2, "trine": 8, "sextile": 7,
        "square": -6, "opposition": -4
    }
}

# Normalize each dimension to 0-100
# Overall = weighted average: emotional(25%) + chemistry(20%) + communication(20%) + stability(20%) + conflict(15%)
```

### Implementation Notes
- Use `swisseph` Python package (wrapper for Swiss Ephemeris C library)
- Use `timezonefinder` + `pytz` for timezone resolution from coordinates
- Use `geopy` for geocoding city names to lat/lng
- Cache natal chart calculations in the database (they never change)
- All planetary positions should be tropical zodiac (Western astrology default)
- Support both Placidus and Whole Sign house systems (user preference)

---

## AI Interpretation Layer

Use Claude API to generate compatibility narratives. The key is a well-crafted system prompt that produces readings indistinguishable from a professional astrologer.

### System Prompt for Compatibility Reports

```
You are an expert astrologer with 20+ years of experience in synastry and relationship astrology. You synthesize birth chart compatibility data into clear, insightful, emotionally intelligent narratives.

Your approach:
- Read the ENTIRE chart holistically before commenting on individual aspects
- Identify the 3-5 most significant patterns that define this relationship
- Weigh conflicting signals honestly (e.g., "Your emotional connection is strong, but communication under stress will be your growth edge")
- Be specific and grounded in chart factors (always reference the actual placements)
- Be warm but honest — don't sugarcoat difficult aspects, but frame challenges as growth opportunities
- Avoid generic astrology clichés. Write like you're talking to a friend, not reading from a textbook
- Use "you" and "your partner" language, making it personal
- For each dimension, explain WHY the score is what it is, referencing specific planetary interactions

You will receive structured synastry data. Generate a narrative report with these sections:
1. **The Big Picture** (2-3 paragraphs): What is the overall energy of this relationship? What's the dominant theme?
2. **Emotional Connection** (Moon analysis): How do you process feelings together?
3. **Romance & Chemistry** (Venus-Mars): What's the attraction dynamic? How does desire work here?
4. **Communication** (Mercury): How do you talk, argue, and resolve?
5. **Long-Term Potential** (Saturn-Jupiter): What holds this together? What tests it?
6. **Watch Out For** (Red Flags): 2-3 specific dynamics to be aware of, with practical advice
7. **Your Growth Edge** (Growth Areas): 2-3 ways this relationship can help both people evolve

Keep the total report between 800-1200 words for premium reports. For free tier, generate only "The Big Picture" section (200-300 words).
```

### AI Chat Astrologer System Prompt

```
You are [APP_NAME]'s AI astrologer — a warm, knowledgeable guide who helps users understand their relationship dynamics through their birth charts.

You have access to the user's natal chart data and their compatibility report with [partner name]. When users ask questions, ground your answers in their specific chart data. Reference actual placements ("With your Moon in Cancer and their Mars in Aries...").

Rules:
- Always reference specific chart factors, never give generic advice
- Be warm, supportive, but honest about challenges
- If asked about timing ("When should we have this conversation?"), reference current transits if available
- Keep responses conversational and under 300 words
- If asked something outside astrology scope, gently redirect
- Never claim astrology is scientifically proven — frame as a lens for self-reflection and understanding
```

---

## Frontend Pages & Components

### Pages

1. **`/` — Landing Page**
   - Hero: "Stop judging compatibility by sun signs. Go 10 layers deeper."
   - Quick compatibility check CTA (no signup required for basic)
   - How it works (3 steps: Enter birth data → Get your chart → Compare with anyone)
   - Social proof / testimonials
   - Pricing section
   - FAQ

2. **`/compatibility` — Free Compatibility Tool (SEO Landing Page)**
   - Two birth data input forms side by side
   - No login required for basic report
   - City autocomplete for birth location (use Google Places or similar)
   - Optional birth time field with tooltip explaining why it matters
   - "Check Compatibility" CTA
   - Results page shows: overall score, 5 dimension scores (visual radar chart), short AI narrative (free tier), upgrade prompt for full report
   - Shareable compatibility card (OG image generation for social sharing)

3. **`/report/[id]` — Full Compatibility Report**
   - Premium gated content
   - Beautiful layout with score visualizations
   - Full AI narrative with all 7 sections
   - Red flags with practical tips
   - Growth areas
   - "Ask a question about this" → opens AI chat
   - Share button → generates social card
   - Download PDF option (boutique tier)

4. **`/dashboard` — User Dashboard (Authenticated)**
   - "My Chart" — user's own natal chart with AI interpretation
   - "My Connections" — list of saved compatibility reports
   - "Add New Connection" → new compatibility check
   - Relationship Weather widget (current transits affecting their chart)
   - Quick stats (how many checks, top match, etc.)

5. **`/chart/[id]` — Individual Birth Chart View**
   - Visual natal chart wheel (SVG rendered)
   - Planet positions table
   - House placements
   - AI interpretation of key placements
   - "Check compatibility with..." CTA

6. **`/chat` — AI Astrologer Chat (Premium)**
   - Chat interface
   - Context selector: choose which relationship to discuss
   - Conversation history
   - Suggested questions ("Why do we argue about money?", "Is this person going to commit?")

7. **`/pricing` — Pricing Page**
   - Three tiers: Free, Premium ($9.99/mo or $79.99/yr), Boutique Reports ($14.99-$29.99 one-time)
   - Feature comparison table
   - Stripe checkout integration

8. **`/auth/signin` — Auth Page**
   - Google OAuth + Email magic link
   - Minimal friction — delay signup until user wants to save results

### Key Components

**`<BirthDataForm />`**
- Date picker (date of birth)
- Time input (optional, with "I don't know my birth time" checkbox + tooltip)
- City/location autocomplete with geocoding
- Country selector
- Name field
- Validates and returns structured birth data

**`<ChartWheel />`**
- SVG-based natal chart visualization
- Shows zodiac signs, houses, planet glyphs at correct degrees
- Aspect lines between planets (color-coded: green=trine/sextile, red=square/opposition, blue=conjunction)
- Interactive: hover over planet for tooltip with details
- Responsive (works on mobile)

**`<CompatibilityScoreCard />`**
- Overall score (large, centered, with color gradient)
- 5 sub-dimension scores displayed as:
  - Radar/spider chart (primary visualization)
  - Individual progress bars with labels
- Animated on load (count up effect)

**`<SynastrySocialCard />`**
- Generates a shareable image (using @vercel/og or canvas)
- Shows: both names, overall score, top 3 highlights, app branding
- OG meta tags for social sharing previews
- "Share to Twitter/Instagram/TikTok" buttons

**`<AIReportSection />`**
- Renders AI-generated narrative with proper formatting
- Collapsible sections for each dimension
- Highlight key placements mentioned (bold planet names)
- "Unlock full report" CTA for free tier users (shows blurred premium content)

**`<RelationshipWeather />`**
- Shows current transit alerts affecting the user's chart
- Simple cards: "Mercury retrograde is hitting your 7th house — communication with partners may feel foggy this week"
- Updates daily

---

## Key UX Flows

### Flow 1: First-Time Free Compatibility Check (No Signup)
1. User lands on `/compatibility` (from SEO, social media, or shared link)
2. Enters their birth data + partner's birth data
3. Clicks "Check Compatibility"
4. Loading animation with fun astrology facts
5. Results page shows: overall score, 5 dimension radar chart, "The Big Picture" AI narrative (200-300 words)
6. Blurred sections below: "Full Report", "Red Flags", "Growth Areas" with "Unlock with Premium" overlay
7. Shareable card generated with "Share your compatibility" CTA
8. "Save this report" → prompts signup
9. "Get full report" → prompts signup + premium upgrade

### Flow 2: Returning User Checks New Connection
1. User goes to Dashboard → "Compare With Someone New"
2. Enters new person's birth data (or selects from saved profiles)
3. Full report generated based on their plan tier
4. Report saved to dashboard

### Flow 3: AI Chat About Relationship
1. User opens chat from report page or dashboard
2. Selects which relationship to discuss
3. Chart data + report automatically loaded as context
4. User asks question → AI responds grounded in their specific charts
5. Conversation saved for continuity

---

## SEO Strategy (Built Into the App)

The free `/compatibility` page is the primary SEO asset. Optimize for:
- "synastry chart calculator"
- "birth chart compatibility"  
- "astrology compatibility calculator"
- "synastry chart free"
- "relationship astrology calculator"

Each report page should generate unique meta descriptions based on the chart data (e.g., "Aries Sun + Scorpio Moon compatibility with Libra Sun + Cancer Moon — see your full synastry analysis").

Create programmatic SEO pages:
- `/compatibility/[sign1]-and-[sign2]` for all 144 sign combinations
- Content: AI-generated guide for that combination + CTA to check full birth chart compatibility
- Example: `/compatibility/scorpio-and-pisces`

---

## Environment Variables

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PREMIUM_MONTHLY_PRICE_ID=
STRIPE_PREMIUM_ANNUAL_PRICE_ID=
ASTRO_SERVICE_URL=  # URL of the Python microservice
GOOGLE_PLACES_API_KEY=  # For city autocomplete
```

---

## Implementation Priority Order

1. **Python microservice** — natal chart + synastry calculations (this is the engine)
2. **Database + Auth** — Prisma schema, NextAuth setup
3. **`/compatibility` page** — free tool with birth data forms + basic results
4. **AI interpretation** — Claude API integration for report generation
5. **Score visualizations** — radar chart, score cards, chart wheel
6. **Dashboard** — save reports, manage profiles
7. **Sharing** — social cards, OG images
8. **Payments** — Stripe integration, premium gating
9. **AI Chat** — conversational astrologer
10. **Programmatic SEO pages** — sign combination pages

---

## Design Guidelines

- **Color palette:** Deep navy (#0F172A) + cosmic purple (#7C3AED) + gold accent (#F59E0B) + soft cream (#FFF7ED) backgrounds
- **Typography:** Clean sans-serif (Inter or DM Sans) for body, display serif (Playfair Display) for headings
- **Aesthetic:** Modern, premium, slightly mystical but NOT cheesy crystal-ball vibes. Think "if Stripe designed an astrology app." Clean, trustworthy, data-forward with touches of cosmic beauty.
- **Mobile-first:** Everything must work beautifully on mobile. Most traffic will be from social media links on phones.
- **Animations:** Subtle Framer Motion transitions. Stars/constellation subtle background effects on key pages. Score count-up animations on results.
- **Dark mode:** Support dark mode (the cosmic theme looks better dark anyway).

---

## Important Notes

- **No pseudoscience claims.** Always frame as "a lens for self-reflection and understanding," never as scientific prediction. Include a tasteful disclaimer in the footer.
- **Privacy-first.** Birth data is sensitive. Clear privacy policy. Never sell data. Allow users to delete all their data.
- **Inclusive.** Support all gender identities and relationship types. No heteronormative assumptions in the UI copy or AI prompts. Use "partner" not "boyfriend/girlfriend" in default copy.
- **Birth time optional.** Many users won't know their birth time. The app should gracefully degrade — provide partial analysis (no house placements, approximate Moon position) with clear messaging about what additional insights birth time unlocks.
- **Rate limiting.** Free users get 1 compatibility check per day. Prevent abuse of the AI interpretation endpoint.
- **Caching.** Cache natal chart calculations (they never change for a given birth data). Cache AI interpretations for the same chart pair.

---

## Success Metrics (Post-Launch)

- Free compatibility checks per day
- Signup conversion rate (free check → account creation)
- Premium conversion rate (account → paid)
- Reports generated per user (target: 3-5, indicating "Compare With Anyone" engagement)
- Social shares per report
- AI chat sessions per premium user
- SEO organic traffic to `/compatibility`
- Retention: 7-day and 30-day return rate
