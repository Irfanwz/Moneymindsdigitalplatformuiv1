# MoneyMinds — Client Feedback Issue Tracker

> Based on: `MoneyMinds_Code_Audit_Report.docx`
> Status as of: 2026-06-06
> Current state: **Beta / Demo build — NOT production ready**

---

## CRITICAL — Security (Fix Before Any Real Users)

- [x] **#1 — JWT stored in localStorage**
  - File: `src/app/contexts/AuthContext.tsx` (line 37)
  - Problem: Token stored in localStorage is accessible via XSS attacks.
  - Fix: Replace with HttpOnly secure cookie flow (backend sets cookie, frontend never touches token directly).

- [x] **#2 — Reset token exposed in API response**
  - File: `server/app.js` (line 199)
  - Problem: `resetToken` is returned in the JSON response body — any attacker who intercepts traffic can hijack password resets.
  - Fix: Remove `resetToken` from the response. Keep `console.log` for dev only. In production, send via email only.

- [x] **#3 — No HTTP security headers**
  - File: `server/app.js` (line 57)
  - Problem: No `helmet` middleware — missing XSS protection, HSTS, content-type sniffing headers, etc.
  - Fix: Add `helmet` as first middleware in the Express app.

- [x] **#4 — No rate limiting on auth routes**
  - File: `server/app.js` (line 57)
  - Problem: Login, register, and forgot-password endpoints have no rate limiting — open to brute force attacks.
  - Fix: Add `express-rate-limit` on `/api/auth/*` routes (e.g. 10 requests/min per IP).

- [x] **#5 — File upload crashes if Supabase is not configured**
  - File: `server/app.js` (line 1061)
  - Problem: Upload endpoint dynamically imports Supabase and crashes hard if env vars are missing — no graceful error.
  - Fix: Check for `config.supabaseUrl` / `config.supabaseServiceRoleKey` at startup and return `503` with a clear message if absent.

- [x] **#6 — No production environment validation**
  - File: `server/index.js`
  - Problem: App boots silently even if required env vars are missing — causes runtime failures instead of clear startup errors.
  - Fix: Add a startup check that lists all missing required env vars and exits with a clear message if any are absent.

---

## HIGH — Missing Features (Partially or Fully Unbuilt)

- [x] **#7 — Payments are simulated (no real Stripe)**
  - File: `server/app.js` (line 1013)
  - Problem: Payment processing uses `TXN-${Date.now()}` fake transaction IDs. No real money movement.
  - Fix: Integrate Stripe SDK — create PaymentIntent, handle webhooks for `payment_intent.succeeded` and `invoice.payment_failed`.

- [x] **#8 — Emails are not sent (only console.log)**
  - File: `server/app.js` (line 198)
  - Problem: Password reset link, onboarding emails, payment confirmations — none are actually sent. All go to console.
  - Fix: Wire up SendGrid (or Nodemailer + SMTP). At minimum: password reset email and payment receipt.

- [x] **#9 — 2FA / TOTP not implemented**
  - Problem: Auth system has no two-factor authentication despite it being in the spec.
  - Fix: Add TOTP support using `speakeasy` or `otplib` — QR code setup + verification on login.

- [x] **#10 — Data export endpoints missing**
  - Problem: UI may show export buttons (PDF, CSV, JSON) but no backend export routes exist.
  - Fix: Add `/api/export/payments.csv`, `/api/export/trainings.pdf`, etc. with proper content-type headers.

---

## HIGH — Architecture (Needed Before Scaling)

- [x] **#11 — Entire backend in one 1199-line file**
  - File: `server/app.js`
  - Problem: Routing, validation, business logic, and persistence calls all in one file — very hard to maintain or test.
  - Fix: Split into domain route files: `routes/auth.js`, `routes/trainings.js`, `routes/payments.js`, `routes/groups.js`, `routes/connections.js`, `routes/notifications.js`, `routes/admin.js`.

- [x] **#12 — No input validation schemas**
  - File: `server/app.js` (throughout)
  - Problem: Validation is ad-hoc inline string checks — inconsistent and easy to miss edge cases.
  - Fix: Add Zod schemas per domain (or per route group) for all request bodies and query params.

- [x] **#13 — No database migrations**
  - Problem: No migration files exist — schema changes require manual DB edits and are not tracked in version control.
  - Fix: Add a migration system (Supabase migrations or `node-postgres-migrate`). Version all schema changes.

- [x] **#14 — No Supabase Row Level Security (RLS) policies**
  - Problem: Access control is only enforced at the API layer — if a bug bypasses middleware, DB has no second layer of defense.
  - Fix: Define RLS policies in Supabase so each table enforces user-level access independently.

---

## MEDIUM — Code Quality & CI

- [x] **#15 — No tests at all**
  - Problem: Zero automated tests — regressions are invisible until they hit users.
  - Fix: Add smoke tests for: health check, login, role routing, trainings API. Use Vitest or Jest.

- [x] **#16 — No CI/CD pipeline**
  - Problem: No automated checks on PRs — broken builds or type errors can be merged silently.
  - Fix: Add GitHub Actions workflow: lint → type-check → build → tests on every pull request.

- [x] **#17 — JS bundle is 1.29MB (too large)**
  - Problem: Vite build warning — bundle exceeds recommended chunk size, slow initial load.
  - Fix: Add `manualChunks` in `vite.config.ts` to split React, charts (Recharts), and UI library into separate chunks.

- [x] **#18 — 1 moderate vulnerability in `ws` package**
  - Problem: `npm audit` reports 1 moderate transitive vulnerability.
  - Fix: Run `npm audit fix` — fix is already available.

---

## Execution Order (Recommended)

| Order | Issue | Effort |
|-------|-------|--------|
| 1 | #2 — Remove resetToken from response | 10 min |
| 2 | #3 — Add Helmet headers | 30 min |
| 3 | #4 — Rate limiting on auth routes | 30 min |
| 4 | #18 — npm audit fix | 10 min |
| 5 | #6 — Env validation on startup | 1 hour |
| 6 | #5 — Upload fallback for missing Supabase | 1 hour |
| 7 | #7 — Real Stripe integration | 1–2 days |
| 8 | #8 — Wire up email sending (SendGrid) | half day |
| 9 | #1 — HttpOnly cookie auth | 1 day |
| 10 | #11 — Split backend into route files | 1 day |
| 11 | #12 — Zod validation schemas | 1 day |
| 12 | #15 + #16 — Tests + GitHub Actions CI | 1 day |
| 13 | #17 — Bundle code splitting | half day |
| 14 | #9 — 2FA / TOTP | 1 day |
| 15 | #10 — Data export endpoints | 1 day |
| 16 | #13 + #14 — DB migrations + RLS policies | 2 days |

---

## Summary

| Category | Total Issues | Estimated Effort |
|----------|-------------|-----------------|
| Critical Security | 6 | ~2 days |
| Missing Features | 4 | ~4 days |
| Architecture | 4 | ~3 days |
| Quality / CI | 4 | ~2 days |
| **Total** | **18** | **~11 days** |
