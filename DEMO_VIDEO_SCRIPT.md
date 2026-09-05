# Demo Video Script — 1Fi Marketplace (2–5 minutes)

Shot-by-shot script for the assignment's video deliverable. Record the browser at
http://localhost:5000 (`npm start`) plus a terminal window side-by-side.
Total runtime ≈ 3:30 at a relaxed pace.

> **Recording tips:** 1920×1080, browser zoom 90%, DevTools docked right (not bottom) so
> the Network tab is visible during the API shots. Do one dry run before recording.

---

### Shot 1 — Intro (0:00–0:20) · *voiceover over the marketplace screen*

> "Hi, I'm [name]. This is my implementation of the **1Fi Marketplace** for the SDE intern
> assignment — the fully-built section inside the Shop page. Users browse smartphones,
> pick a variant, choose an EMI plan backed by mutual funds, and proceed to checkout.
> Everything runs on a real REST API with a SQL database — no hardcoded data."

**On screen:** Marketplace grid — point at the 4 product cards, the "EMI from ₹X/mo" pill,
discount badges.

---

### Shot 2 — Shop structure (0:20–0:45)

**Do:** Click **Shop** in the bottom nav → show the three sections → click **Top Brands**
(blank page as per assignment) → back → **Nearby Stores** (blank) → back → open
**1Fi Marketplace**.

> "The Shop page has the three required options. Top Brands and Nearby Stores are
> intentionally blank per the assignment; the Marketplace is fully implemented."

---

### Shot 3 — Product page + variants (0:45–1:20)

**Do:** Click **Apple iPhone 17 Pro** → page loads with a skeleton (loading state) →
switch through variants: Silver → Cosmic Orange → Black Titanium. Price, image, and
EMI amounts change with each click.

**Say:** "Each product has a unique URL — see the address bar: slash product slash
iphone-17-pro. The selected variant even syncs to the URL, so links are shareable.
Four variants here — colour and storage — and every variant carries its own price,
image, and EMI plans."

---

### Shot 4 — EMI plans (1:20–2:00)

**Do:** Scroll through the EMI plan cards. Point out: monthly amount, tenure, **0% interest**
vs **10.5%**, cashback line, and the **backing mutual fund** on each card. Select a few
plans — the Proceed button updates live. Show the "Popular" pre-selection.

> "Every plan shows the monthly payment, tenure, interest rate, cashback where
> applicable, and the mutual fund backing it — that's the 1Fi twist: your instalments
> stay invested while you pay."

---

### Shot 5 — Checkout (2:00–2:35)

**Do:** Click **Proceed with 6 months plan · ₹20,834/mo** → modal shows the full summary
(price, tenure, rate, total, cashback, fund) → click **Confirm plan** → brief spinner →
success screen with a real order ID, e.g. `1FI-XXXXXX`.

> "The Proceed CTA opens a confirmation summary. Confirming places a **real order** —
> the server generates the ID and persists it. Let me prove that."

---

### Shot 6 — API + database proof (2:35–3:20) · *the evaluator-pleasing shot*

**Do (terminal, side-by-side):**

```bash
# 1. Health + database
curl -s http://localhost:5000/api/health

# 2. The API the UI consumes
curl -s http://localhost:5000/api/products | head -c 400

# 3. THE PROOF — the order you just placed, straight from SQLite:
curl -s http://localhost:5000/api/orders | head -c 400
```

**Say:** "Health endpoint confirms the DB is connected. The products API serves the
grid you saw. And here's the orders table — the exact order ID from the success
screen, persisted in SQLite with its EMI snapshot. The schema is products →
variants → emi_plans → orders; EMI amounts are **computed** server-side with the
standard formula, never hardcoded. The client only ever sends variant and plan IDs —
pricing is recomputed on the server, so it can't be tampered with."

*(Optional flex, 10s): open `server/data/marketplace.db` in a SQLite viewer (e.g. DB
Browser for SQLite) and show the `orders` row.*

---

### Shot 7 — Engineering quality + architecture (3:20–3:50)

**Do:** Quick screen-share of the repo tree (or the README's Project Structure section):
`server/src/{routes,repositories,seed,utils}`, `client/src/{api,components,hooks,pages}`.

> "Code is layered — routes call repositories, repositories own all SQL, so swapping
> SQLite for Postgres or Mongo touches one file. The client has a small fetch wrapper
> with typed errors, a reusable async-data hook driving loading/error/retry states,
> and a React error boundary. Responsive down to phone width with no overflow.
> The README documents setup, API contracts with example responses, and the schema."

---

### Shot 8 — Outro (3:50–4:00)

> "Deployed link is in the description along with the GitHub repo — README has the
> one-command setup. Thanks for watching."

---

## Pre-flight checklist (before hitting record)

- [ ] `npm start` running → http://localhost:5000 loads
- [ ] `curl http://localhost:5000/api/health` returns `"status":"ok"`
- [ ] Fresh DB (optional): `npm run seed` — so the orders list starts empty and Shot 6 shows only your order
- [ ] Terminal font size bumped up (readable at 1080p)
- [ ] Close unrelated tabs/notifications
