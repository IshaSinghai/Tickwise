# API Gateway Dashboard

DORYOKU  ·  DESIGN + FRONTEND BRIEF

Frontend surface spec

Every screen we need to design and build to turn the metered API into a product someone can actually buy



Prepared

28 July 2026

Repo

top-pools-positions / frontend — Next.js 15, App Router

Today

The entire customer-facing product is ONE route: / renders the positions dashboard. Plus a 3-tab internal admin panel. Everything else in this document is new.

Backend

Capabilities cited here are live unless marked "backend planned" — those arrive with the self-serve subscriptions work and can be built against in parallel.

Source of truth

docs/frontend-surface-spec.md in the repo. This document is the shareable rendering of it.




The gap, stated plainly

The API product already exists in the backend: metered /v1 endpoints, API keys, plans, per-endpoint unit costs, monthly quotas, rate limits. There is no UI in front of any of it.

There is no way for someone to discover what we sell, sign up, get a key, read documentation, see what they have used, pay us, or ask for help. That is what this document specifies.



1. Three realms, not one app

These must feel like one product, but they are not the same application. Different information density, different navigation, different auth, different empty states.

Realm

Who it is for

Shell

Auth

Marketing + public app

Anyone, plus search crawlers

Public header and footer, server-rendered, SEO-indexed

None

Developer portal
/portal/*

Paying and free customers

Portal sidebar + account menu

Customer JWT (cp-portal-token)

Admin panel
/admin/*

Us

Existing panel shell

Admin JWT (cp-admin-token)

Portal and admin use separate token keys deliberately, so both sessions can coexist in one browser and a 401 in one realm clears only that realm.

2. Full route map

2.1 Marketing and public

Route

What it is

Backend

Status

/

Landing — what the API does, who it is for, live proof numbers, primary CTA "Get an API key"

GET /health, GET /v1/pools

NEW

/pricing

Plan cards, monthly/annual toggle, unit-cost table, FAQ

GET /v1/plans, /v1/pricing/units

NEW
(backend planned)

/docs

Documentation home — quickstart, auth, endpoints, units, errors

static

NEW

/docs/[...slug]

Individual documentation pages (see section 5)

static

NEW

/explore

The existing positions + pools dashboard, moved off /

/api/top-positions, /api/top-pools, charts

EXISTS
relocate

/status

Indexing freshness, per-chain lag, incident notes

GET /health

NEW

/changelog

API changes, new chains, new endpoints

static

NEW

/contact

Sales, enterprise, custom chain requests

form

NEW

/support

Help centre: common issues, error codes, escalation path

static + form

NEW

/legal/terms, /privacy, /dpa

Required before we charge anyone

static

NEW

2.2 Auth pages (no shell chrome)

Route

What it is

Backend

Status

/signup

Email + password, optional plan preselect

POST /account/auth/signup

NEW
(backend planned)

/login

Email + password

POST /account/auth/login

NEW
(backend planned)

/verify-email

Consumes the emailed token

POST /account/auth/verify-email

NEW
(backend planned)

/forgot-password, /reset-password

Deferred to phase 2 — design the entry point now and mark it disabled, so the login page needs no rework later

—

NEW
phase 2

2.3 Developer portal — customer JWT

Route

What it is

Backend

Status

/portal

Overview — plan, quota meter, keys summary, last payment, lifecycle banner

GET /account/overview

NEW
(backend planned)

/portal/keys

Key list, create, revoke, delete, allowed-origin editor

GET/POST /account/keys, PATCH origins, revoke, DELETE

NEW
(backend planned)

/portal/usage

Usage by month, quota vs consumed, per-endpoint unit costs

GET /account/usage, /usage/current

NEW
(backend planned)

/portal/billing

Subscription state, plan change, cancel/resume, invoice + payment history

GET /account/subscription, /account/payments

NEW
(backend planned)

/portal/billing/plans

In-portal plan picker leading to checkout

GET /v1/plans, POST /account/checkout

NEW
(backend planned)

/portal/checkout/return

Payment pending / confirmed / underpaid / expired / failed

GET /public/checkout/:ref/status

NEW
(backend planned)

/portal/settings

Name, billing email, change password, danger zone

PATCH /account/profile, change-password

NEW
(backend planned)

/portal/playground

Pick an endpoint, fill params, send with your own key, see response + units spent

/v1/*

NEW
phase 2

2.4 Admin — admin JWT

Route

What it is

Status

/admin

Clients list + client detail (plan, keys, usage)

EXISTS

/admin/login

Admin login

EXISTS

/admin/plans

Plan CRUD — extend with prices[], selfServe, maxApiKeys, allowBrowserKeys

EXISTS

/admin/endpoints

Per-endpoint unit costs

EXISTS

/admin/subscriptions

All subscriptions: status, plan, period end, grace, MRR/ARR totals

NEW
(backend planned)

/admin/payments

All payments: status, amount, tx hash, provider, manual reconcile actions

NEW
(backend planned)

/admin/revenue

Monthly paid vs pending, new vs churned, revenue by plan

NEW
(backend planned)

/admin client detail

Add subscription + payment history tabs to the existing ClientDetail

NEW
(backend planned)



3. The "/" decision, and why it matters

Right now / is the positions dashboard. That is the wrong front door for something we are selling: a first-time visitor lands on a dense data table with no explanation of what they are looking at or what is for sale.

Recommendation

/ becomes the landing page. The dashboard moves to /explore, with a redirect from / for anyone with the old link.

The dashboard stays public and ungated — it is our best demo and it proves the data is real.

Treat /explore as proof, not decoration: the landing page should pull two or three genuine live numbers from it (pools tracked, positions tracked, current indexing lag) rather than invented ones.

4. The four screens that carry real risk

Everything else in this document is a form or a table. These four are where a generic design produces a broken product.

4.1 One-time API key reveal

The raw key is returned by the backend exactly once. Only its SHA-256 hash is stored, so we cannot show it again — ever.

Reveal it in a distinct surface, not a toast. Monospace, with a copy button and a copy confirmation.

Unmissable warning: "This is the only time you will see this key."

Dismissing requires deliberate action — an "I have saved it" button, never a click-outside.

After dismissal the list shows only the key prefix (first 16 characters), its label, and the created date.

4.2 Asynchronous payment states — the screen most likely to be designed wrong

Two facts that drive this design

Crypto payments are not instant. Confirmation typically takes minutes.

The processor’s redirect back to us is NOT proof of payment — and the customer often finishes paying inside a wallet’s in-app browser, so the page they land on may have no logged-in session at all.




Therefore the return page must:

Read status from a capability URL that works without a session (/public/checkout/:ref/status).

Poll, with a visible "checking…" state, and never claim a success it has not confirmed.

Handle five outcomes distinctly: pending (seen, unconfirmed), confirmed, underpaid (show the remaining amount and a way to top up), expired, failed.

Say plainly on pending: "We have seen your payment and are waiting for confirmations. You can close this page — we will email you, and your plan activates automatically."

4.3 Subscription lifecycle banner

Because crypto has no auto-renew, every renewal needs the customer to act. The portal needs one persistent banner component with five states, escalating in urgency.

State

Message

Action

Active, more than 7 days left

Nothing, or a quiet line

—

Renewal due (7 days or fewer)

"Your plan renews on {date}. Pay now to avoid interruption."

Pay renewal

In grace (period ended, 3 days)

"Payment overdue. Your plan drops to Free on {date}."

Pay now

Downgraded to Free

"Your subscription lapsed. You are on the Free plan — your keys still work at free limits."

Reactivate

Canceled at period end

"Your plan ends on {date}."

Resume

Tone note on the downgrade state

Keys keep working, at free-tier limits. This is deliberate product behaviour — never design it as "access revoked" or "account suspended".

4.4 Quota meter

The backend already returns X-Quota-Limit, X-Quota-Remaining, X-Quota-Reset and X-RateLimit-* on every metered response. The portal shows units consumed against the plan limit for the current month. Two honesty constraints:

Quota resets on the 1st of each month, UTC — not on the subscription anniversary. Label it that way.

Different endpoints cost different numbers of units, so the meter needs an adjacent link to the unit-cost table or it reads as "requests".



5. Documentation site — the real answer to "how do users get the API?"

This is the funnel we are designing. Break any one link in the chain and the product has no self-serve path:

/ → /pricing → /signup → land in /portal on Free → create a key → copy the quickstart curl from /docs → first successful call → watch it appear in /portal/usage → hit the free ceiling → upgrade → hosted checkout → back to /portal




Page

Content

/docs

What the API is, the coverage statement, and the five-minute quickstart

/docs/quickstart

Sign up, create a key, first request — with a copy-paste curl that actually works

/docs/authentication

The KC-APIKey header, server vs browser keys, allowed origins, key rotation

/docs/units-and-limits

What a unit is, the live per-endpoint cost table, rate limits, quota headers, what a 429 looks like

/docs/endpoints/positions

List, detail, charts — every query parameter, response shape, examples

/docs/endpoints/pools

Same for pools

/docs/endpoints/metadata

/v1/chains and /v1/protocols — free and unmetered

/docs/errors

Every status code and what to do about it: 401 missing/invalid key, 403 server key used from a browser, 429 rate vs quota (they are different), 400 validation

/docs/coverage

Chains and protocols supported today, and what is on the roadmap — kept honest, see section 8

Server vs browser keys needs its own section, not a footnote

A server key is 403’d if the request carries an Origin header. A browser key requires at least one allowed origin, and is rejected from any other site.

Developers will hit this and be confused. It must be explained both in the docs and in the key-creation UI at the point of choice.

6. Components — reuse versus build

6.1 Already exists — reuse, do not reinvent

From admin.css (being renamed panel.css and shared with the portal): .admin-card, .admin-table, .admin-input, .admin-select, .admin-btn (.ghost / .danger / .sm), .admin-row, .admin-error, .admin-ok (declared but currently unused — use it), .admin-note, .admin-pill, .admin-key, .admin-login, .admin-subnav, .admin-tab.

From globals.css: .pagination with .iconButton, .emptyState, .notice.error, .skeletonRows / .skeletonRow, .searchControl, .compactSelect, .miniToggle, .detailOverlay (the slide-over used for position detail), .tokenBadge.

Also reusable: the allowed-origins chip editor already built in the admin panel (OriginsInput), and SeriesAreaChart if we ever capture time-series usage data.

6.2 Genuinely new

Component

Where it is used

Plan card + monthly/annual toggle

/pricing, /portal/billing/plans

Quota meter

/portal, /portal/usage

Lifecycle banner (5 states)

Every /portal page

One-time secret reveal

/portal/keys

Payment-status poller

/portal/checkout/return

Invoice + payment table with status pills

/portal/billing, /admin/payments

Docs layout — sidebar nav, content, anchor links

/docs/*

Code block with copy button and language tabs

/docs/*

Marketing header + footer

All public pages

Portal sidebar shell

/portal/*

Pricing FAQ accordion

/pricing

Contact and support forms

/contact, /support

Toast or inline-confirm system

Everywhere — none exists today. Every confirmation is currently window.confirm and every error is an inline div.

Deliberately not needed: any wallet connection

Payment happens on the processor’s hosted checkout page, so there is no wagmi, no viem, no RainbowKit, and no "connect wallet" button anywhere in this product.

There is a dead .connectButton class left in globals.css from an earlier visual reference. Ignore it.



7. Cross-cutting requirements

No new dependencies without a conversation — The frontend runs on next, react, lightweight-charts and lucide-react only. There is no form library, no validation library, no data-fetching library and no component kit. Forms are controlled useState plus try/catch; fetching is useEffect plus a typed fetch wrapper.

Theme and density are already implemented — Light and dark via data-theme and CSS custom properties, plus density and accent settings persisted in localStorage. Every new screen must use var(--token) — no hardcoded colours — and must work in both themes.

Auth is client-side — Tokens live in localStorage; layouts guard routes in a useEffect and redirect. There is no middleware.ts. Portal and admin use separate token keys, and a 401 in one realm must clear only that realm.

Every list needs four states — Loading (skeleton), empty (with a next action, not just "no data"), error (inline, showing the server’s own message), and populated. The existing dashboard already does this — match it.

Mobile matters for marketing, less for the portal — Landing, pricing, docs, contact and support must be fully responsive. Portal and admin can be desktop-first but must not be broken on a phone — someone will check their quota from bed.

SEO applies only to marketing and docs — Those pages should be server-rendered with real metadata. The portal and admin stay client-rendered.

8. What must NOT appear in the UI

Each of these is contradicted by the code. Shipping them makes us liars, so they should not reach a mockup.

Do not show

Because

Any uptime, SLA or latency number

We have no status monitoring and no error budget yet.

"v3 and v4", "multichain", or a chain count

Say "Uniswap v4 on Ethereum and Avalanche". A v3 request returns 400. Arbitrum and Optimism are indexed but NOT servable — do not list them as live.

"Real-time"

Positions re-price about every 5 minutes; on-chain fee state refreshes roughly hourly on Ethereum. "Near-real-time" is fine and true.

Rewards, pnlEth, the vs-USD basis, pool price divergence

All four are hardcoded zero on the live path. A field that renders a real 0 is worse than an absent one.

Position charts framed as auditable history

The series is reconstructed from transaction amounts and clamped. It is indicative only.

Any accuracy percentage

We have a parity harness against the incumbent — that is a method, not a published pass rate.

A daily or per-endpoint usage chart

Usage is stored as ONE aggregate row per customer per month. Anything finer would be invented. Monthly bars or a table only, until per-request capture ships.

9. Suggested build order

Marketing shell, landing, pricing, contact — needed before anyone can be sold to, and unblocks the designer immediately.

Docs shell plus quickstart, authentication, and units-and-limits — the funnel breaks without these three pages.

Move the dashboard to /explore and add the redirect from /.

Auth pages, portal shell, overview, keys — the minimum that lets a developer self-serve on Free.

Usage, billing, checkout return — arrives with the payments backend.

Admin subscriptions, payments, revenue.

Legal, status, changelog, support — must land before we charge real money.

Playground — phase 2, only if the docs alone prove insufficient.




The scheduling point worth acting on

Steps 1 to 4 have no dependency on the payments backend. Design and frontend can start on them immediately, in parallel with the backend subscriptions work.


i attached the current web and the requirements given so go through them properly and design it accordingly think yourself as a product designer with 10 years of experience

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7ca223c0-5dcc-439c-afec-b9ab5d0ce3cd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
