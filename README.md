# STRATIQ Access

Premium Iraq market-entry, tender intelligence, and local representation platform.
Public website + admin dashboard, built on Next.js and Supabase.

STRATIQ Access is a commercial division operated by Abraj Al-Anwar for General Trading,
General Contracting & Commercial Agencies LLC, Iraq.

## Stack

- **Next.js 16** (App Router, TypeScript, Server Actions)
- **Tailwind CSS v4** — dark institutional theme (navy / graphite / gold), tokens in `src/app/globals.css`
- **Framer Motion** — scroll-based reveals, hero animation
- **Supabase** — Postgres, Auth, Storage (schema in `supabase/schema.sql`)
- **next-intl** — locale-routed, English-only today, structured for Arabic/Turkish/Kurdish/Chinese/Persian later
- **Zod** — server action input validation
- **Stripe SDK** — installed and wired behind an abstract `PaymentProvider` interface; not required to run the app

## Getting started

```bash
npm install
cp .env.example .env.local
```

### 1. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the Project URL and anon key into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
   ```
3. Run `supabase/schema.sql` in the SQL editor (tables, enums, RLS policies, storage buckets).
4. Run `supabase/seed.sql` (site settings, languages, services, sectors, sample tenders, CMS page rows).

### 2. Create your first admin user

Supabase Auth has no SQL-only signup path, so:

1. Sign up once through the public app at `/account/signup` (this creates the `auth.users` row and,
   via the `handle_new_user` trigger, a matching `profiles` row with `role = 'client'`).
2. In the Supabase SQL editor, promote that user:
   ```sql
   update profiles set role = 'admin' where email = 'you@example.com';
   ```
3. Sign in at `/admin/login` with the same credentials.

### 3. Run the app

```bash
npm run dev
```

- Public site: `http://localhost:3000`
- Admin console: `http://localhost:3000/admin/login`

## Project structure

```
src/
  app/
    [locale]/            public site (locale-routed; only "en" ships today)
      about/ services/ sectors/ iraq-market-access/ tender-intelligence/
      partnerships/ insights/ tenders/ reports/ contact/ account/ legal/
    admin/
      login/             public login, outside the auth guard
      (dashboard)/        every other /admin/* route — guarded by requireStaff()
    actions/             server actions (public forms, admin CRUD, purchases, auth)
    api/webhooks/stripe/ Stripe webhook handler
  components/
    ui/                  Button, Card, Badge, SectionHeading, FadeIn, Container
    site/                Header, Footer, Hero, ServiceGrid, SectorGrid, forms
    admin/               Sidebar, tables, forms per resource
  lib/
    supabase/            browser + server clients, hand-written Database types
    payments/            PaymentProvider interface + manual/stripe implementations
    admin/require-staff.ts
  i18n/                  next-intl routing/config
  messages/en.json       all public-site copy
supabase/
  schema.sql             tables, enums, RLS policies, storage buckets
  seed.sql                initial content matching the site copy
```

## Content model

- **services**, **sectors** — the six service pillars and nine sectors shown on the public site.
- **opportunities** — tenders *and* investment opportunities share one table (`kind` column), so the
  admin sidebar shows them as separate sections ("Tenders" / "Investment Opportunities") without
  duplicating schema or CRUD code. Confidential details are gated behind `requires_nda`; the public
  detail page shows a "Request NDA & Full Access" form when gated, wired to the `nda_requests` table.
- **articles** — Insights/briefings.
- **reports** — paid downloadable PDFs, purchased via `purchases` → `downloads`.
- **leads** — every contact/inquiry form (general, market entry, representation, partnership, tender
  intelligence) writes to this one table with a `form_type` column, since a contact submission *is*
  a lead — there's no separate "contact_submissions" table.
- **pages** / **page_sections** — a lightweight editorial layer (SEO metadata, publish status, and
  freeform sections) for future dynamic page content. The current public pages render their copy
  from `src/messages/en.json` plus component structure; wiring individual page sections to render
  from `page_sections` is a Phase 2/3 follow-up, not required to launch Phase 1.

## Payments

Defaults to `PAYMENT_PROVIDER=manual`: a purchase is recorded as `pending`, the buyer sees payment
instructions, and an admin approves it from `/admin/purchases` — which unlocks the download row.

To go live with Stripe:

1. Set `STRIPE_SECRET_KEY` and `PAYMENT_PROVIDER=stripe` in `.env.local`.
2. Point a Stripe webhook at `/api/webhooks/stripe` for the `checkout.session.completed` event and
   set `STRIPE_WEBHOOK_SECRET`.
3. No call-site changes needed — `getPaymentProvider()` in `src/lib/payments/index.ts` switches
   providers based on the env var. Adding bank transfer / FastPay / ZainCash later means adding a
   new file implementing `PaymentProvider` and registering it in that same file.

## Internationalization

Only `en` is active. The routing (`src/i18n/routing.ts`), middleware, and `languages` table are
already structured for `ar` (RTL), `tr`, `ku` (RTL), `zh`, `fa` (RTL) — activating one is:

1. Add the locale to `routing.ts` `locales` array.
2. Add `src/messages/<locale>.json` (translate `en.json` key-for-key).
3. Flip `is_active = true` on that row in `languages` (admin → Languages page does this).
4. For RTL locales, add the code to `rtlLocales` in `routing.ts` and set `dir="rtl"` in the locale
   layout for that locale.

## What's built vs. what's next

**Built (Phase 1):** full public site, admin dashboard + auth, CRUD for pages, services, sectors,
tenders/opportunities, articles, reports, leads, NDA requests, users, languages, site settings,
media library, i18n-ready routing, contact/NDA/lead forms writing to Supabase.

**Scaffolded, not fully wired (Phase 2):** Stripe checkout (works once keys are set — see above),
client accounts (signup/login/dashboard exist and are functional against Supabase Auth), saved
opportunities (table + query wired, no "Save" button on the public tender page yet).

**Not started (Phase 3):** advanced CRM, email notifications, analytics, multi-language launch.

## Deployment

1. Push to a git remote and connect it to Vercel (or your host of choice).
2. Set the env vars from `.env.example` in the hosting platform.
3. Point the Stripe webhook at the deployed `/api/webhooks/stripe` URL, if using Stripe.
4. Add a custom domain (`stratiqaccess.com`) and update `NEXT_PUBLIC_SITE_URL` accordingly.
