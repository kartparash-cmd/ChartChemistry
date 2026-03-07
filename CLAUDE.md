# ChartChemistry

AI-powered astrology compatibility app. Next.js frontend + Python FastAPI microservice for astronomical calculations.

## Tech Stack

- **Framework:** Next.js 16 (App Router, RSC), React 19, TypeScript (strict)
- **Auth:** NextAuth v4 (JWT strategy) — Google OAuth + email/password credentials
- **Database:** PostgreSQL (Supabase) via Prisma 7 with `@prisma/adapter-pg`
- **AI:** Anthropic Claude (`claude-sonnet-4-20250514`) for report generation and chat
- **Payments:** Stripe (PREMIUM $9.99/mo, ANNUAL $79.99/yr)
- **Styling:** Tailwind CSS v4, shadcn/ui (New York style), Framer Motion
- **Astro Service:** Python FastAPI with Swiss Ephemeris (`pyswisseph`)

## Commands

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build (runs prisma generate via postinstall)
npm run lint         # ESLint (flat config, next/core-web-vitals + typescript)
npm start            # Start production server

# Prisma
npx prisma generate              # Regenerate client (output: src/generated/prisma)
npx prisma migrate dev           # Run migrations (uses DIRECT_URL for Supabase)
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
│   │   ├── auth/           # [...nextauth] + signup
│   │   ├── chat/           # AI astrologer chat (premium-gated)
│   │   ├── compatibility/  # Free (route.ts) + full premium (full/route.ts)
│   │   ├── profile/        # CRUD birth profiles
│   │   └── report/[id]/    # Fetch compatibility report
│   ├── auth/               # signin + signup pages
│   ├── chart/[id]/         # Natal chart viewer
│   ├── chat/               # AI chat page
│   ├── compatibility/      # Compatibility tool page
│   ├── dashboard/          # User dashboard
│   ├── pricing/            # Pricing tiers
│   └── report/[id]/        # Report viewer
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── providers/          # SessionProvider wrapper
│   └── *.tsx               # Feature components (navigation, chart-wheel, etc.)
├── generated/prisma/       # Auto-generated Prisma client (DO NOT EDIT)
├── lib/
│   ├── auth.ts             # NextAuth config (Google + Credentials providers)
│   ├── prisma.ts           # Prisma singleton (pg adapter for Supabase)
│   ├── claude.ts           # Anthropic SDK wrapper + prompt engineering
│   ├── astro-client.ts     # HTTP client for Python astro-service
│   ├── stripe.ts           # Stripe SDK init + plan definitions
│   ├── rate-limit.ts       # In-memory IP rate limiter (3 free checks/24h)
│   └── utils.ts            # cn() utility (clsx + tailwind-merge)
├── types/
│   ├── astrology.ts        # Astrology domain types
│   └── next-auth.d.ts      # NextAuth type augmentation (id, plan on session)
astro-service/              # Python FastAPI microservice
├── main.py                 # FastAPI app + endpoints
├── app/                    # Calculation modules (natal, synastry, composite, transits, scoring)
├── ephe/                   # Swiss Ephemeris data files
└── tests/                  # pytest tests
```

## Architecture Patterns

- **Auth gating:** Done per-route via `getServerSession(authOptions)` — no middleware file exists
- **Plan checks:** JWT token carries `plan` field; API routes check `session.user.plan` for premium features
- **Prisma client:** Singleton in `src/lib/prisma.ts` using `globalThis` for dev hot-reload safety
- **Claude client:** Lazy-initialized on first use in `src/lib/claude.ts` (build-compatible)
- **Path alias:** `@/*` maps to `./src/*`
- **Dark mode:** Forced via `class="dark"` on `<html>` in layout.tsx
- **Rate limiting:** In-memory, IP-based for unauthenticated compatibility checks

## Database

- **Prisma schema:** `prisma/schema.prisma`
- **Generated client output:** `src/generated/prisma` (committed, regenerated on `npm install`)
- **Migration config:** `prisma.config.ts` uses `DIRECT_URL` (Supabase direct connection) for migrations, `DATABASE_URL` (pooled) for runtime queries
- **Key models:** User, BirthProfile, CompatibilityReport, ChatSession
- **Enums:** `Plan` (FREE, PREMIUM, ANNUAL), `ReportTier` (FREE, PREMIUM, BOUTIQUE)

## Environment Variables

Required in `.env`:
```
DATABASE_URL          # Supabase pooled connection string
DIRECT_URL            # Supabase direct connection (for prisma migrate)
NEXTAUTH_URL          # http://localhost:3000 in dev
NEXTAUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
ANTHROPIC_API_KEY
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PREMIUM_PRICE_ID
STRIPE_ANNUAL_PRICE_ID
ASTRO_SERVICE_URL     # http://localhost:8000 in dev
```

## Conventions

- shadcn/ui for all base UI components — add new ones with `npx shadcn@latest add <component>`
- ESLint flat config (ESLint 9) with `next/core-web-vitals` + `next/typescript`
- Tailwind v4 — styles in `src/app/globals.css` with custom design tokens (cosmic-purple, navy, gold, cream)
- Custom CSS utility classes: `.cosmic-gradient`, `.cosmic-text`, `.glass-card`
- Custom animations: shimmer, float, pulse-glow, star-twinkle, orbit, fade-in, slide-up
- Passwords hashed with bcryptjs (12 salt rounds)
- Astro-service endpoints prefixed with `/api/` (natal-chart, synastry, composite, transits)

## Known Gaps (MVP State)

- Prisma migration pending — run `npx prisma migrate dev` to apply schema changes to production DB
- Stripe Customer Portal needs configuration in Stripe Dashboard

## Deployment

- Vercel for Next.js frontend (`.vercel/` config present)
- Astro-service has Dockerfile (Python 3.11-slim, port 8000)
- Supabase for PostgreSQL hosting
