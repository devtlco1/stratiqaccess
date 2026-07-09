# STRATIQ Access

Next.js 15 (App Router) site for STRATIQ Access — an Iraq market entry and
business support platform operated by Abraj Al-Anwar for General Trading,
General Contracting and Commercial Agencies Ltd. Content (services, sectors,
insights, case studies, clients) is stored in Supabase and managed through
the `/admin` panel; public pages are localized via `next-intl` (English
default/unprefixed, Arabic under `/ar`).

## Setup

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

Required env vars are documented inline in `.env.example` (Supabase project
URL/key, `DATABASE_URL` for one-off migration scripts, Resend API key for
contact-form emails, and `NEXT_PUBLIC_SITE_URL`).

## Analytics

Google Analytics 4 and Microsoft Clarity are wired up in
`src/components/analytics/Analytics.tsx` and mounted once in
`src/app/[locale]/layout.tsx`. Both are opt-in: **no IDs are hardcoded**, and
each script only loads if its env var is set.

Add these to `.env.local` (or your hosting provider's environment variables)
to enable them:

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_CLARITY_ID=xxxxxxxxxx
```

Leave either blank to skip loading that script — useful for local
development so dev traffic doesn't pollute production analytics. Scripts
load with `strategy="afterInteractive"` so they don't block initial page
render.

## Bing / IndexNow

The site is IndexNow-ready: a key file is served at
`/04843c0deb2e4348921b3700d0949135.txt` (containing just that key), which is
what IndexNow-compatible search engines (Bing, Yandex) use to verify
ownership before accepting submissions.

After deploying new or updated public URLs, notify Bing so it recrawls
sooner rather than waiting for its normal crawl cycle:

```bash
curl -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json" \
  -d '{
    "host": "stratiqaccess.com",
    "key": "04843c0deb2e4348921b3700d0949135",
    "keyLocation": "https://stratiqaccess.com/04843c0deb2e4348921b3700d0949135.txt",
    "urlList": [
      "https://stratiqaccess.com/services",
      "https://stratiqaccess.com/services/iraq-market-entry-services",
      "https://stratiqaccess.com/insights/how-foreign-companies-can-enter-the-iraqi-market"
    ]
  }'
```

Or submit a single URL via a `GET` request:

```
https://api.indexnow.org/indexnow?url=https://stratiqaccess.com/services&key=04843c0deb2e4348921b3700d0949135
```

For the homepage or `/services` specifically after this SEO update, you can
also request indexing directly from Bing Webmaster Tools
(bing.com/webmasters) using the "Submit URL" / "URL Inspection" tool — this
is the most reliable way to force an immediate recrawl of a specific page.

## Sitemap & robots

`src/app/sitemap.ts` and `src/app/robots.ts` are dynamic — the sitemap pulls
every `services`/`sectors`/`insights` row from Supabase for both locales
automatically, and `robots.ts` allows all public pages while disallowing
`/admin`. No manual sitemap maintenance is required when content changes
through the admin panel.
