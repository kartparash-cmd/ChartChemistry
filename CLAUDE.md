# ChartChemistry

AI-powered astrology compatibility app. Next.js frontend + Python FastAPI microservice for astronomical calculations.

## Tech Stack

- **Framework:** Next.js 16 (App Router, RSC), React 19, TypeScript (strict)
- **Auth:** NextAuth v4 (JWT strategy) — Google OAuth + email/password credentials
- **Database:** PostgreSQL (Supabase) via Prisma 7 with `@prisma/adapter-pg`
- **AI:** Multi-model — Claude Sonnet for reports, OpenAI GPT-4.1 Nano for chat/horoscopes/explanations
- **Payments:** Stripe (PREMIUM $9.99/mo, ANNUAL $79.99/yr, SINGLE_REPORT $4.99 one-time)
- **Styling:** Tailwind CSS v4, shadcn/ui (New York style), Framer Motion
- **Astro Service:** Python FastAPI with Swiss Ephemeris (`pyswisseph`)
- **Email:** Resend (transactional + lifecycle emails from `noreply@send.chartchemistry.com`)
- **Analytics:** Umami (analytics.ownerly.xyz, consent-gated) + server-side structured logging
- **Monitoring:** Sentry (conditional, production-only) on all critical API routes
- **Testing:** Vitest + @testing-library/react (169 tests across 9 files)
- **CI/CD:** Dependabot (weekly), GitHub Actions security audit
- **PWA:** manifest.json + service worker for installability

## Commands

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build (runs prisma generate via postinstall)
npm run lint         # ESLint (flat config, next/core-web-vitals + typescript)
npm run test         # Run Vitest test suite
npm run test:watch   # Vitest in watch mode
npm start            # Start production server

# Prisma
npx prisma generate              # Regenerate client (output: src/generated/prisma)
npx prisma db push               # Push schema to Supabase (preferred over migrate for this project)
npx prisma studio                # Open Prisma Studio

# Astro microservice (from astro-service/)
pip install -r requirements.txt
uvicorn main:app --reload        # Runs on port 8000
pytest                           # Run astro-service tests
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/
│   │   ├── auth/           # [...nextauth] + signup + verify-email + forgot-password
│   │   ├── chat/           # Marie (personal astrologer) chat (premium-gated)
│   │   ├── compatibility/  # Free (route.ts) + full premium (full/route.ts)
│   │   ├── cosmic-card/    # Shareable cosmic identity card image generation
│   │   ├── cron/           # daily-digest (Vercel Cron) — premium + free drip + birthday reminders
│   │   ├── daily-cosmic/   # Free daily cosmic weather (all users, no auth)
│   │   ├── health/         # Consolidated health check (DB, astro, AI, Stripe, Redis)
│   │   ├── marie-memory/   # View/delete Marie's extracted memories
│   │   ├── profile/        # CRUD birth profiles
│   │   ├── referral/       # GET status + POST claim reward
│   │   ├── report/[id]/    # Fetch + share compatibility report
│   │   ├── story-card/     # 1080x1920 Instagram/TikTok story image generation
│   │   ├── stripe/         # checkout (subscription + single report), webhook, portal
│   │   └── user/           # preferences, export, delete (cancels Stripe)
│   ├── auth/               # signin + signup + verify-email pages
│   ├── blog/               # Blog with [slug] pages (server components, JSON-LD)
│   ├── calendar/           # Monthly cosmic events calendar
│   ├── chart/[id]/         # Natal chart viewer (animated wheel, tabbed planets/aspects/houses, element colors)
│   ├── chat/               # Marie chat page (streaming SSE, ChatGPT-style UI)
│   ├── compatibility/      # Compatibility tool + [signs]/ programmatic SEO (78 pages, ISR)
│   ├── dashboard/          # User dashboard (profiles, reports, settings, Marie memories)
│   ├── embed/              # Embeddable compatibility widget (iframe-friendly)
│   ├── embed-code/         # Embed code generator page
│   ├── pricing/            # Pricing tiers (subscription + single report + promo codes)
│   ├── quick-match/        # Viral zodiac tool (share-to-unlock)
│   └── report/[id]/        # Report viewer with social sharing + story cards
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── providers/          # SessionProvider wrapper
│   └── *.tsx               # Feature components (navigation, chart-wheel, social-share, etc.)
├── generated/prisma/       # Auto-generated Prisma client (DO NOT EDIT)
├── lib/
│   ├── auth.ts             # NextAuth config (Google + Credentials + Redis-backed signin rate limiting)
│   ├── prisma.ts           # Prisma singleton (pg adapter for Supabase)
│   ├── claude.ts           # AI orchestration (Claude for reports, OpenAI for chat/horoscopes, streaming SSE)
│   ├── openai.ts           # OpenAI client wrapper (GPT-4.1 Nano, lazy-init singleton)
│   ├── astro-client.ts     # HTTP client for Python astro-service (with circuit breaker)
│   ├── stripe.ts           # Stripe SDK init + plan definitions (subscription + single report)
│   ├── rate-limit.ts       # Redis (Upstash) rate limiter for all endpoints, in-memory fallback
│   ├── email.ts            # Resend transactional emails (verify, reset, dunning 3-tier, receipt, cancellation)
│   ├── emails.ts           # Resend lifecycle emails (welcome, digest, drip day1/3/weekly, birthday)
│   ├── analytics.ts        # Type-safe Umami event tracking (24 event types, all wired)
│   ├── server-analytics.ts # Server-side structured event logging (revenue, signups)
│   ├── moderation.ts       # Content moderation (input + output) for AI chat
│   ├── achievements.ts     # Achievement system (20 types with auto-triggers)
│   ├── achievement-defs.ts # Achievement definitions and metadata
│   ├── blog-posts.ts       # Blog content data (articles, categories, slugs)
│   ├── zodiac-pair-content.ts # Unique content for 78 zodiac pair SEO pages
│   ├── geocode.ts          # Nominatim geocoding with 5s timeout + 24h cache (1000 entries)
│   ├── sanitize.ts         # Input sanitization (HTML tags + entities + incomplete tags)
│   └── utils.ts            # cn() utility (clsx + tailwind-merge)
├── middleware.ts            # Auth middleware (protected pages + API routes + admin)
├── types/
│   ├── astrology.ts        # Astrology domain types
│   └── next-auth.d.ts      # NextAuth type augmentation (id, plan, role on session)
astro-service/              # Python FastAPI microservice
├── main.py                 # FastAPI app + endpoints
├── app/                    # Calculation modules (natal, synastry, composite, transits, scoring)
├── ephe/                   # Swiss Ephemeris data files
└── tests/                  # pytest tests
```

## Architecture Patterns

- **Auth gating:** Centralized via `src/middleware.ts` + defense-in-depth `getServerSession` in API routes
- **Plan checks:** JWT token carries `plan` field; API routes check `session.user.plan` for premium features
- **Prisma client:** Singleton in `src/lib/prisma.ts` using `globalThis` for dev hot-reload safety
- **AI clients:** Claude (reports) + OpenAI (chat/horoscopes) — both lazy-initialized singletons, 30s timeout, explicit temperatures, bi-directional failover
- **AI streaming:** Marie chat uses SSE (Server-Sent Events) for progressive token display
- **AI moderation:** Input + output content moderation via regex-based keyword detection
- **AI persona:** Marie — the user-facing astrologer name across chat, emails, and marketing; persistent memory via MarieMemory model
- **Path alias:** `@/*` maps to `./src/*`
- **Dark mode:** Forced via `class="dark"` on `<html>` in layout.tsx; High Contrast Mode fallback for cosmic-text
- **Rate limiting:** Redis (Upstash) for ALL endpoints, in-memory fallback; per-IP for compatibility/city-search, per-email for signin
- **Email:** Resend SDK with graceful fallback; lifecycle emails (welcome, drip day1/3/weekly, birthday, dunning 3-tier, cancellation)
- **Analytics:** Umami consent-gated via cookie-consent; 24 event types all wired; server-side logging for revenue events
- **Error monitoring:** Sentry on all critical API routes with user context
- **Achievements:** 20 types with auto-triggers across API routes (fire-and-forget)
- **Geocoding:** Nominatim with 5s timeout, 24h in-memory cache (1000 entries), rate-limited proxy
- **PWA:** manifest.json + service worker for mobile installability
- **ISR:** Compatibility/[signs] pages use 24h revalidation; learn pages are server components

## Database

- **Prisma schema:** `prisma/schema.prisma`
- **Generated client output:** `src/generated/prisma` (committed, regenerated on `npm install`)
- **Schema sync:** Uses `prisma db push` (not migrations) due to existing DB drift
- **Key models:** User (with preference fields), BirthProfile, CompatibilityReport, ChatSession, UserAchievement
- **User preference fields:** `emailDigest`, `emailMarketing`, `pushEnabled`, `pushSubscription` (persisted to DB)
- **Enums:** `Plan` (FREE, PREMIUM, ANNUAL), `ReportTier` (FREE, PREMIUM, BOUTIQUE), `Role` (USER, ADMIN)

## Environment Variables

Required in `.env`:
```
DATABASE_URL              # Supabase pooled connection string
DIRECT_URL                # Supabase direct connection (for prisma db push)
NEXTAUTH_URL              # http://localhost:3000 in dev
NEXTAUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
ANTHROPIC_API_KEY         # Claude Sonnet (reports, relationship insights)
OPENAI_API_KEY            # GPT-4.1 Nano (chat, horoscopes, explanations, wellness)
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PREMIUM_PRICE_ID
STRIPE_ANNUAL_PRICE_ID
RESEND_API_KEY
NEXT_PUBLIC_UMAMI_URL     # https://analytics.ownerly.xyz
NEXT_PUBLIC_UMAMI_SITE_ID # Umami website ID
ASTRO_SERVICE_URL         # http://localhost:8000 in dev
```

## Conventions

- shadcn/ui for all base UI components — add new ones with `npx shadcn@latest add <component>`
- ESLint flat config (ESLint 9) with `next/core-web-vitals` + `next/typescript`
- Tailwind v4 — styles in `src/app/globals.css` with custom design tokens (cosmic-purple, navy, gold, cream)
- Custom CSS utility classes: `.cosmic-gradient`, `.cosmic-text`, `.glass-card`
- Custom animations: shimmer, float, pulse-glow, star-twinkle, orbit, fade-in, slide-up
- Chart wheel SVG animations: ring draw-in (2.5s), planet pop-in (staggered), aspect line draw, glow pulse, shimmer ring, hover highlight
- Background canvas: stars + constellations + shooting stars + recognizable planets (Saturn w/ rings, Jupiter w/ bands, Mars, Neptune) + spiral galaxies
- Cursor glow: toggleable via Dashboard Settings > Visual Preferences (localStorage `cursor-glow-disabled`)
- Passwords hashed with bcryptjs (12 salt rounds)
- Astro-service endpoints prefixed with `/api/` (natal-chart, synastry, composite, transits)
- Input sanitization via `src/lib/sanitize.ts` on all user-facing API routes
- Security headers configured in `next.config.ts` (CSP, HSTS, X-Frame-Options, etc.)

## External Services

- **Stripe:** Live mode, subscription + single-report purchases, webhook, customer portal, promo codes enabled
- **Resend:** Domain `chartchemistry.com` verified, from address `noreply@send.chartchemistry.com`
- **Umami:** analytics.ownerly.xyz, consent-gated, 24 event types tracked across all pages
- **Sentry:** Conditional (production-only), 10% trace rate, 100% error replay, instrumented in 6+ API routes
- **Supabase:** PostgreSQL, schema synced, all indexes applied

## Deployment

- Vercel for Next.js frontend (`chartchemistry.com`)
- Vercel scope: `kartikeya-parashars-projects`
- Astro-service has Dockerfile (Python 3.11-slim, port 8000)
- Supabase for PostgreSQL hosting
- Vercel Cron for daily digest + free drip + birthday reminders
- GitHub Actions for security audits (npm audit on PRs)
- Dependabot for weekly dependency updates
