# Lalitha Tailoring — Website + Admin Dashboard

Next.js (App Router) + Tailwind CSS + Supabase. Customer-facing site at `/`,
internal Order Management Board at `/admin`.

## Project structure

```
app/
  layout.jsx           Root layout, loads global CSS
  page.jsx              Public landing page
  globals.css            Fonts, base styles, "running stitch" divider
  admin/page.jsx         Admin dashboard route
components/
  public/                Hero, Services, InstituteCTA, Contact, Header, Footer
  admin/                 OrderBoard, OrderCard, AddOrderModal
lib/
  supabaseClient.js       Shared Supabase client
sql/
  schema.sql              Full database schema — run this first
```

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor → New query**, paste the entire contents of
   `sql/schema.sql`, and run it. This creates all four tables
   (`customers`, `measurements`, `orders`, `institute_enrollments`),
   the status/type enums, auto-updating timestamps, and Row Level
   Security policies.
3. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Local development

```bash
npm install
cp .env.local.example .env.local
# paste your Supabase URL + anon key into .env.local
npm run dev
```

Visit `http://localhost:3000` for the site, `http://localhost:3000/admin`
for the dashboard.

## 3. How the frontend talks to Supabase

Everything goes through the single client in `lib/supabaseClient.js`,
built with the public **anon** key. That's safe because access is
governed by the Row Level Security (RLS) policies in `sql/schema.sql`:

- **Public visitors** (anon role) can only `INSERT` into
  `institute_enrollments` — i.e. submit the class registration form on
  the homepage. They cannot read or write orders, customers, or
  measurements.
- **Authenticated staff** (once you add Supabase Auth — see below) have
  full read/write access to all four tables.

Until you add staff logins, the `/admin` routes will only work for
rows you insert with an authenticated session, or temporarily while
testing you can loosen the `orders`/`customers`/`measurements`
policies to `anon` in the SQL editor — just remember to tighten them
again before going live.

### Securing `/admin`

This build ships `/admin` unauthenticated so you can wire it up on
your own timeline. Before launch:

1. Enable **Supabase Auth** (Email/Password or phone OTP is simplest
   for a small shop — the owner and any staff each get one login).
2. Add a `middleware.js` at the project root that checks for a valid
   Supabase session and redirects to a login page for any `/admin/*`
   route.
3. The existing RLS policies already restrict data access to
   `authenticated` users, so once login is added, the data layer is
   already locked down — you're just adding the UI gate.

## 4. Deploying to Netlify

1. Push this project to a GitHub repo.
2. In Netlify: **Add new site → Import an existing project**, select
   the repo.
3. Netlify will detect `netlify.toml` (already included, uses
   `@netlify/plugin-nextjs`). Build command and publish directory are
   pre-configured.
4. Add the two environment variables (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) under **Site settings → Environment
   variables**.
5. Deploy.

## 5. Customizing content

- **Phone number**: update the `tel:` link in
  `components/public/Contact.jsx`.
- **Google Map**: replace the `iframe src` in `Contact.jsx` — instructions
  are in a comment right above it (Google Maps → Share → Embed a map).
- **Colors/fonts**: all design tokens live in `tailwind.config.js`
  under `theme.extend.colors` and `fontFamily`.

## 6. What's intentionally left for you to extend

- Customer detail / measurement history view (schema already supports
  multiple measurement records per customer over time).
- WhatsApp notifications when an order status changes (the
  `whatsapp_opt_in` flag on `customers` is ready for this — hook it up
  via a Supabase Edge Function + WhatsApp Business API or Twilio).
- Printable/PDF order receipts.
- Reporting view for the Institute (batch rosters, fee collection).
