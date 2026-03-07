# ChartChemistry — Comprehensive Testing Plan

## 1. Unit Tests (Vitest)

### Existing Tests (75 passing)
- [x] `src/lib/__tests__/utils.test.ts` — cn() utility (12 tests)
- [x] `src/lib/__tests__/rate-limit.test.ts` — Rate limiting (14 tests)
- [x] `src/lib/__tests__/auth.test.ts` — Auth config (10 tests)
- [x] `src/lib/__tests__/stripe.test.ts` — Stripe helpers (14 tests)
- [x] `src/lib/__tests__/achievement-defs.test.ts` — Achievement definitions (17 tests)
- [x] `src/components/__tests__/star-field.test.tsx` — StarField component (8 tests)

### New Unit Tests Needed
- [ ] `src/lib/__tests__/sanitize.test.ts` — Input sanitization
  - sanitizeInput strips HTML tags
  - sanitizeInput trims whitespace
  - sanitizeInput enforces max length
  - sanitizeEmail lowercases and trims
  - sanitizeName strips HTML and limits to 100 chars
  - XSS payloads are neutralized (`<script>`, `onerror=`, etc.)
- [ ] `src/lib/__tests__/analytics.test.ts` — Event tracking
  - trackEvent fires window.umami.track when available
  - trackEvent logs in development mode
  - trackEvent silently handles missing umami
  - trackPageView sends correct path/referrer
- [ ] `src/lib/__tests__/email.test.ts` — Email functions
  - sendVerificationEmail constructs correct payload
  - sendPasswordResetEmail includes reset link
  - sendPaymentFailedEmail includes correct content
  - Functions return `{ success: false }` when RESEND_API_KEY missing

## 2. API Route Tests (Vitest + mocked Prisma/NextAuth)

### Auth Routes
- [ ] `POST /api/auth/signup` — Creates user with hashed password
- [ ] `POST /api/auth/signup` — Rejects duplicate email
- [ ] `POST /api/auth/signup` — Rejects password < 8 chars
- [ ] `POST /api/auth/signup` — Rejects missing ageConfirmed
- [ ] `POST /api/auth/signup` — Rate limits by IP (5 attempts/15 min)
- [ ] `POST /api/auth/signup` — Sanitizes name and email inputs
- [ ] `GET /api/auth/verify-email` — Verifies valid token
- [ ] `GET /api/auth/verify-email` — Rejects expired token
- [ ] `POST /api/auth/forgot-password` — Sends reset email

### Profile Routes
- [ ] `GET /api/profile` — Returns user's profiles
- [ ] `POST /api/profile` — Creates birth profile with sanitized inputs
- [ ] `PUT /api/profile/[id]` — Updates own profile
- [ ] `DELETE /api/profile/[id]` — Deletes own profile
- [ ] `POST /api/profile` — Rejects unauthenticated requests

### Compatibility Routes
- [ ] `POST /api/compatibility` — Returns free compatibility check
- [ ] `POST /api/compatibility` — Rate limits unauthenticated users (3/24h)
- [ ] `POST /api/compatibility/full` — Requires authentication
- [ ] `POST /api/compatibility/full` — Requires premium plan

### Chat Route
- [ ] `POST /api/chat` — Requires authentication
- [ ] `POST /api/chat` — Requires premium plan
- [ ] `POST /api/chat` — Streams AI response

### Stripe Routes
- [ ] `POST /api/stripe/checkout` — Creates checkout session for PREMIUM
- [ ] `POST /api/stripe/checkout` — Creates checkout session for ANNUAL
- [ ] `POST /api/stripe/checkout` — Rejects invalid plan
- [ ] `POST /api/stripe/webhook` — Processes checkout.session.completed
- [ ] `POST /api/stripe/webhook` — Handles duplicate events (idempotency)
- [ ] `POST /api/stripe/webhook` — Processes customer.subscription.deleted
- [ ] `POST /api/stripe/webhook` — Processes invoice.payment_failed
- [ ] `POST /api/stripe/portal` — Creates portal session for subscribed user
- [ ] `POST /api/stripe/portal` — Rejects user without stripeCustomerId

### User Routes
- [ ] `GET /api/user/preferences` — Returns DB-backed preferences
- [ ] `PUT /api/user/preferences` — Updates only allowed boolean keys
- [ ] `PUT /api/user/preferences` — Rejects non-boolean values
- [ ] `GET /api/user/export` — Returns user data as JSON
- [ ] `DELETE /api/user/delete` — Deletes user and all related data
- [ ] All user routes reject unauthenticated requests

### Health Route
- [ ] `GET /api/health` — Returns healthy status

## 3. Middleware Tests

- [ ] Unauthenticated user redirected from `/dashboard` to `/auth/signin`
- [ ] Unauthenticated API request returns 401
- [ ] Authenticated user can access `/dashboard`
- [ ] Non-admin redirected from `/admin` to `/dashboard`
- [ ] Admin can access `/admin`
- [ ] Public routes (`/`, `/pricing`, `/learn/*`) accessible without auth
- [ ] `/api/auth/*` routes bypass middleware
- [ ] `/api/health` bypasses middleware
- [ ] `/api/compatibility` (free) bypasses middleware
- [ ] Static files (`.js`, `.css`, images) bypass middleware

## 4. Integration Tests

### Full User Journey
- [ ] Signup → Email verification → Signin → Dashboard loads
- [ ] Create birth profile → Profile appears in dashboard
- [ ] Create 2 profiles → Run compatibility → Report generated
- [ ] Free user hits rate limit → Upgrade CTA shown

### Payment Flow
- [ ] Checkout creates Stripe session → Redirect to Stripe
- [ ] Webhook processes completed checkout → User plan updated to PREMIUM
- [ ] Premium user can access chat, full reports
- [ ] Subscription cancelled via webhook → Plan reverted to FREE
- [ ] Payment failed → Dunning email sent

### Email Flow
- [ ] Signup triggers welcome email + verification email
- [ ] Password reset sends email with valid link
- [ ] Checkout completion sends receipt email
- [ ] Payment failure sends dunning email

## 5. E2E Tests (Playwright)

### Core Flows
- [ ] Landing page loads, navigation works
- [ ] Signup form validates inputs (email, password, age confirmation)
- [ ] Signin with credentials works
- [ ] Dashboard shows user's profiles and reports
- [ ] Create birth profile form submits successfully
- [ ] Compatibility page: select 2 profiles → run check → results display
- [ ] Report page renders with scores and narrative

### Premium Features
- [ ] Pricing page shows both plans with correct prices
- [ ] Checkout button redirects to Stripe
- [ ] Chat page loads for premium users
- [ ] Chat sends message and receives AI response

### Viral Tools
- [ ] Quick Match: select 2 signs → score displays → share buttons work
- [ ] Social share buttons open correct URLs (Twitter, Facebook)
- [ ] Copy link button copies URL to clipboard

### SEO Pages
- [ ] `/compatibility/aries-taurus` loads with correct content
- [ ] All 78 zodiac pair pages return 200
- [ ] JSON-LD structured data present on learn/pricing pages

### UX Components
- [ ] Cookie consent banner appears on first visit
- [ ] Cookie consent respects accept/decline
- [ ] Onboarding wizard shows on first dashboard visit
- [ ] PWA install prompt appears on supported browsers
- [ ] Error boundary catches and displays errors gracefully

### Accessibility
- [ ] Skip-to-content link focuses main content
- [ ] All interactive elements keyboard-navigable
- [ ] Modal dialogs trap focus correctly
- [ ] Chart page includes SR-only data table

## 6. Security Tests

### Input Validation
- [ ] XSS payload in name field is sanitized (`<script>alert(1)</script>`)
- [ ] XSS payload in birth city field is sanitized
- [ ] SQL injection in profile fields is prevented (Prisma parameterized queries)
- [ ] Oversized inputs are truncated (100 char limit on names)

### Rate Limiting
- [ ] Signin: 6th attempt within 15 min returns error
- [ ] Signup: excessive attempts from same IP are blocked
- [ ] Compatibility: 4th unauthenticated check within 24h returns 429

### Auth Security
- [ ] JWT tokens expire after 7 days
- [ ] Session cannot access another user's profiles
- [ ] Admin impersonation only works for ADMIN role users
- [ ] Webhook signature verification rejects tampered payloads

### Headers
- [ ] Response includes Content-Security-Policy
- [ ] Response includes Strict-Transport-Security
- [ ] Response includes X-Frame-Options: DENY
- [ ] Response includes X-Content-Type-Options: nosniff
- [ ] Response includes Referrer-Policy: strict-origin-when-cross-origin

## 7. Performance Tests

### Lighthouse Scores (Target: 90+)
- [ ] Homepage: Performance, Accessibility, Best Practices, SEO
- [ ] Dashboard: Performance, Accessibility
- [ ] Compatibility page: Performance
- [ ] Report page: Performance (with lazy-loaded chart)

### Core Web Vitals
- [ ] LCP < 2.5s on homepage
- [ ] FID < 100ms on interactive pages
- [ ] CLS < 0.1 on all pages

### API Response Times
- [ ] `/api/health` < 100ms
- [ ] `/api/profile` (GET) < 200ms
- [ ] `/api/compatibility` < 5s (includes AI generation)
- [ ] `/api/user/preferences` < 100ms

### Lazy Loading
- [ ] ChartWheel loads only when chart page is visited
- [ ] Service worker caches static assets
- [ ] Images use AVIF/WebP with proper sizing

## 8. Manual Testing Checklist

### Visual / UI
- [ ] All pages render correctly in dark mode
- [ ] Mobile responsive (320px, 375px, 768px, 1024px, 1440px)
- [ ] Fonts load correctly (Inter + Playfair Display)
- [ ] Animations play smoothly (star field, shimmer, float)
- [ ] Glass card effects render properly

### Email Delivery
- [ ] Welcome email received after signup
- [ ] Verification email link works
- [ ] Password reset email link works
- [ ] Receipt email received after checkout
- [ ] Payment failed email received (test with Stripe test cards)
- [ ] Daily digest email renders correctly

### Stripe
- [ ] Checkout completes with test card (4242 4242 4242 4242)
- [ ] Customer portal loads and allows subscription management
- [ ] Cancellation works and plan reverts at period end
- [ ] Plan switch (monthly ↔ annual) works

### PWA
- [ ] Service worker registers successfully
- [ ] App works offline (cached pages)
- [ ] Install prompt appears on mobile Chrome/Safari
- [ ] Manifest loaded correctly (name, icons, colors)

## Running Tests

```bash
# Unit + API tests
npm run test              # Run all Vitest tests
npm run test:watch        # Watch mode

# E2E tests (when Playwright is added)
npx playwright test       # Run all E2E tests
npx playwright test --ui  # Interactive UI mode

# Lighthouse
npx lighthouse https://chartchemistry.com --output html

# Security headers
curl -I https://chartchemistry.com | grep -E "content-security|strict-transport|x-frame|x-content-type|referrer-policy"
```
