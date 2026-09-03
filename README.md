# Euro Gulf Logistics — Handoff Documentation

Site: https://eg-logistics.ae
Stack: TanStack Start (React 19 + SSR) · Tailwind v4 · shadcn/ui · Supabase (Postgres + Auth) · Vercel

This document covers everything needed to run, deploy, and maintain this project from scratch: Supabase setup, environment variables, Vercel deployment, and the permission model.

---

## 1. Tech stack overview

- **Frontend/SSR framework:** TanStack Start (file-based routing under `src/routes/`, SSR via Nitro)
- **Styling:** Tailwind CSS v4 + shadcn/ui (Radix primitives)
- **Data/backend:** Supabase — Postgres database, Auth (email/password), Row Level Security for all access control
- **Package manager:** Bun (see `vercel.json` — `bun install` / `bun run build`). `npm` also works for local dev if Bun isn't installed.
- **Hosting:** Vercel

---

## 2. Supabase setup (from scratch)

If the client already has a Supabase project running, skip to step 3. If setting up fresh (new client Supabase account, migrating environments, etc.):

### 2.1 Create the project
1. Go to [supabase.com](https://supabase.com), create a new project.
2. Pick a region close to the UAE if available.
3. Save the database password somewhere safe — you won't need it directly (the app uses API keys, not the DB password), but Supabase requires it at creation.

### 2.2 Run the migrations, in this exact order

Open **SQL Editor** in the Supabase dashboard → New Query. Run each of the following **one at a time, in order** (later ones depend on earlier ones — role-checking functions, RLS policies, etc. are built up incrementally).

**Files already in the repo** (`supabase/migrations/`) — copy-paste each file's contents and run:

1. `20260814134608_a91759cc-f8a0-4512-a41a-a73a032a1f14.sql` — creates `services` table + seed data, `quote_requests`, `contact_messages`
2. `20260814134633_1496b2f2-e25b-405c-8a55-ad6a5b46b7b6.sql`
3. `20260817030425_d35ec804-2d42-4c0c-991e-96dfa215fae0.sql`
4. `20260817030514_9b9fd6df-265b-4d20-a79a-9e8a0b9e240c.sql`
5. `20260817032347_fc1ee053-856e-4233-a479-adfe343369c1.sql`
6. `20260817032446_32f8f964-23e1-4e44-85a5-707b7911081c.sql` — creates `staff_accounts`, `audit_logs`, `user_roles`, role enum (`user`/`staff`/`admin`/`super_admin`)
7. `20260819061438_ad941445-b7ed-4f8c-be17-713d5d8c37c0.sql` — fixes an RLS recursion bug, adds `has_role()`/`is_staff()` SECURITY DEFINER functions
8. `20260902120000_service_editing_and_rls_fix.sql` — adds `long_description` column to `services`, fixes services RLS to allow `super_admin` (not just literal `admin`)
9. `20260902130000_staff_can_toggle_services.sql` — lets staff toggle service availability, with a trigger that blocks them from editing any other field

### 2.3 Grab your API credentials

Supabase dashboard → **Settings → API**:

| What | Where | Sensitivity |
|---|---|---|
| Project URL | Settings → API → "Project URL" | Public, safe to expose |
| `anon` / `publishable` key | Settings → API → "Project API keys" | Public, safe to expose in browser |
| `service_role` key | Settings → API → "Project API keys" (click reveal) | **Secret — server only, never in browser code, never in a `VITE_` variable** |

---

## 3. Environment variables

Set these in **two places**: locally in `.env` (for dev), and in **Vercel → Project Settings → Environment Variables** (for the live deployment). The public ones are already committed in `.env` in the repo (that's intentional — they're safe to be public); the secret ones are **not** in the repo and must be added manually in Vercel.

| Variable | Value | Where it's used |
|---|---|---|
| `VITE_SUPABASE_URL` | Project URL | Browser client |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | anon/publishable key | Browser client |
| `VITE_SUPABASE_PROJECT_ID` | Project ref (e.g. `jiuavcvalwuswikxfhrh`) | Browser client |
| `SUPABASE_URL` | Same as above, no `VITE_` prefix | Server functions (TanStack server-side auth middleware) |
| `SUPABASE_PUBLISHABLE_KEY` | Same anon key, no `VITE_` prefix | Server functions |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** service_role key | Admin server functions (staff CRUD, audit logs) — bypasses RLS, so this must never leak to the browser |
| `GOD_MODE_EMAIL` | The super-admin bootstrap email | One-time bootstrap of the first super_admin account |
| `GOD_MODE_PASSWORD` | The super-admin bootstrap password | Same — **rotate this if it's ever shared insecurely (e.g. pasted in chat/Slack)** |
| `VITE_SITE_URL` | `https://eg-logistics.ae` (or whatever the live domain is) | Used to build canonical URLs for SEO |

**Do not** put `SUPABASE_SERVICE_ROLE_KEY`, `GOD_MODE_EMAIL`, or `GOD_MODE_PASSWORD` in any `VITE_`-prefixed variable — anything prefixed `VITE_` gets bundled into the client-side JavaScript and is visible to anyone who views page source.

---

## 4. Vercel deployment

1. Go to [vercel.com](https://vercel.com) → **New Project** → import the GitHub repo.
2. Vercel should auto-detect settings from the committed `vercel.json` (`bun install` / `bun run build`) — no manual build config needed.
3. Go to **Project Settings → Environment Variables** and add every row from the table in section 3 above (Production, and Preview if you use preview deploys).
4. Deploy.
5. Point your domain (`eg-logistics.ae`) at the Vercel project under **Settings → Domains**, if not already done.

### First-time bootstrap after deploying

Visit `https://<your-domain>/stealth-admin-auth` once. The app automatically calls a bootstrap function on that page load which creates the first `super_admin` account using `GOD_MODE_EMAIL` / `GOD_MODE_PASSWORD`. Sign in with those credentials afterward — that account is the "God Mode" account and can create Admin and Staff accounts from the dashboard's Staff tab.

**This route is intentionally not linked anywhere in the site's navigation** — it's the only way into the admin dashboard, kept out of the public menu on purpose. Don't add a visible link to it.

---

## 5. Permission model (who can do what)

| Role | Services | Staff accounts | Audit log |
|---|---|---|---|
| **super_admin** ("God Mode") | Full CRUD (add/edit/delete/toggle) | Create/delete Admin + Staff accounts, override any password | Full read access |
| **admin** | Full CRUD (add/edit/delete/toggle) | Create/delete **Staff** accounts only — cannot create/delete other Admins or reset passwords | No access |
| **staff** | Can **only** toggle availability on/off — cannot add, edit details, or delete services (enforced by a database trigger, not just the UI, so it can't be bypassed by calling the API directly) | No access | No access |

There is exactly **one** `super_admin` account, bootstrapped once via `GOD_MODE_EMAIL`/`GOD_MODE_PASSWORD`. It cannot be deleted through the dashboard (the delete function explicitly blocks it).

---

## 6. What's already built

- Public site: Home, Services (with expandable service details), About, Contact, Privacy Policy
- Quote request form + general contact form, both write to Supabase and show up in the dashboard
- Full SEO: per-page meta titles/descriptions, canonical URLs, LocalBusiness JSON-LD structured data, `robots.txt` (allows AI crawlers), `sitemap.xml`, `llms.txt`
- Admin dashboard (`/admin`, gated behind `/stealth-admin-auth`): live overview, quote inbox, contact messages, full services management, staff management, audit log (super_admin only)
- Global UI: cookie banner, scroll-to-top, floating contact button, copy-to-clipboard on emails/phones, password visibility toggle, form validation states, confirmation modals on destructive actions

## 7. Known gaps / things to flag to whoever takes this over

- If `GOD_MODE_PASSWORD` was ever shared over chat, Slack, email, etc., rotate it before handoff — change the env var and re-run the bootstrap, or update it directly for that user in Supabase Auth.
