# CampusBite Testing & Verification Guide

This guide details how to verify the React + TypeScript + Vite frontend under `web/`, the PostgreSQL authoritative ordering engine, the legacy browser regression suite, and the JavaFX desktop application.

---

## 1. Quick Reference: Command Matrix

| Target | Command | Working Directory | Purpose |
| :--- | :--- | :--- | :--- |
| **Install Dependencies** | `npm ci` or `npm install` | `web/` | Install frozen, verified npm packages |
| **Type Check** | `npm run type-check` | `web/` | Execute strict TypeScript compiler verification (`tsc --noEmit`) |
| **Lint** | `npm run lint` | `web/` | Run ESLint for React hooks and TypeScript conventions |
| **Component & Unit Tests** | `npm run test` | `web/` | Run Vitest across domain engines, orderService, and app shell |
| **Component Tests (Watch)** | `npm run test:watch` | `web/` | Run Vitest in interactive watch mode |
| **Production Build** | `npm run build` | `web/` | Build production bundle to `web/dist/` (`tsc && vite build`) |
| **Local Dev Server** | `npm run dev` | `web/` | Start local Vite hot-reloading development server |
| **Legacy Browser Suite** | Open `tests.html` in browser | `.` (Repo Root) | Run 26 browser regression test assertions |
| **JavaFX Desktop App** | `mvn test` or `mvn compile` | `.` (Repo Root) | Compile and verify JavaFX application classes |

---

## 2. Web Frontend (`web/`) Verification

All commands in this section must be executed from the `web/` directory:

```bash
cd web
```

### 2.1 Dependency Installation
```bash
npm install
```
Installs React 18, TypeScript 5, Vite 5, Vitest, Testing Library, and ESLint without modifying root project files.

### 2.2 Strict TypeScript Verification
```bash
npm run type-check
```
Executes `tsc --noEmit` against `tsconfig.json`. Verifies:
- No implicit any
- Strict null checks
- Consistent module resolution via `@/*` aliases
- Type safety across `Order`, `OrderItem`, `FoodItemDTO`, `InventoryItem`, and `OrderStatus`.

### 2.3 Linting
```bash
npm run lint
```
Executes ESLint across `src/` validating React hooks rules, unused variables, and JSX formatting.

### 2.4 Unit & Component Testing
```bash
npm run test
```
Executes Vitest suites in `web/src/test/`:
- `eta.test.ts`:
  - Instant 3-min pickup calculation when all items are ready in warmers.
  - Dominant cooking duration calculation for fresh preparation.
  - Dynamic queue congestion buffers (+2 min per 2 active queued orders).
  - BREAK-FIT evaluation across 5m, 10m, and 30m intervals.
- `orderService.test.ts`:
  - Idempotent order placement (identical key returns committed result without duplicate order creation).
  - Authoritative price lookup and subtotal calculations.
  - Rejection of paused items.
  - Canonical state machine transitions (`NEW` -> `PREPARING` -> `READY` -> `COLLECTED`).
  - Rejection of invalid/skipped state transitions.
  - Cancellation allowed in `NEW` / `ACCEPTED`; rejected once in `PREPARING`.
  - Adding raw inventory ingredients and stock adjustments.
  - Adding new menu dishes and toggling pause status.
- `app.test.tsx`:
  - Shell rendering and portal switching.
  - Tray population, checkout verification modal invocation.
  - Live BREAK-FIT filtering against active queue counts.

### 2.5 Production Build
```bash
npm run build
```
Generates an optimized, tree-shaken static production bundle in `web/dist/`.
*Note: In accordance with Condition A, `web/dist/` is NOT deployed to GitHub Pages during Stage 3; root remains authoritative until Stage 4 cutover.*

---

## 3. Database & Concurrency Verification

Versioned migrations are located under `supabase/migrations/`:
- `20261017000001_initial_schema.sql`: Tables, views, and RLS policies.
- `20261017000002_ordering_engine_rpcs.sql`:
  - `create_order_atomic`: Locks idempotency keys, validates prices authoritatively, inserts order and line items atomically.
  - `advance_order_status_atomic`: Concurrency-guarded state transitions with `SELECT ... FOR UPDATE`.
  - `cancel_order_atomic`: State-guarded cancellation releasing allocated warmer stock.
  - `calculate_queue_eta`: Server-side queue congestion calculation.
- `20261017000003_seed_campus_data.sql`: Seed data for foods, inventory, and profiles.

### Concurrency Test Scenarios:
1. **Double Submission**: Two simultaneous requests with the same `idempotency_key` acquire a lock; exactly one order row is inserted; the second request returns the committed payload.
2. **Conflicting Kitchen Advancement**: Two staff members attempting to advance the same order simultaneously; first transition commits; second transition detects state change and returns already-transitioned status gracefully without duplicate audit records.

---

## 4. Legacy Browser Regression Test Suite (`tests.html`)

The original application includes 26 regression test assertions in `tests.html` covering the in-browser database engine, idempotency, batching, inventory, and LAST PLATE reservations.

### How to Run:
1. Open `tests.html` directly in any modern browser.
2. The automated runner executes on page load.
3. Verification results: **26 / 26 passed** (0 failed, 26 assertions in ~30ms).

---

## 5. JavaFX Desktop Application Verification

The JavaFX desktop project is located at the root of the repository and governed by `pom.xml`.

```bash
mvn clean test-compile
mvn test
```
All Java classes under `src/main/java/com/campusbite/` remain 100% untouched and isolated.
