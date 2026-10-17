# CampusBite Architecture Specification

## 1. Executive Summary

CampusBite is a smart campus dining and cafeteria operations platform engineered to coordinate student ordering, meal preparation timing (BREAK-FIT™), zero-waste surplus rescue (LAST PLATE™), and kitchen workflow orchestration.

This document outlines the architectural blueprint bridging the initial prototype with the modern Stage 1 React + TypeScript + Vite frontend foundation and subsequent Supabase-backed backend architecture.

---

## 2. System Architecture Overview

```
                      ┌──────────────────────────────────────────────┐
                      │                CampusBite                    │
                      └──────────────────────┬───────────────────────┘
                                             │
             ┌───────────────────────────────┼──────────────────────────────┐
             │                               │                              │
             ▼                               ▼                              ▼
  ┌──────────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
  │   Live Production    │       │     New Web App      │       │    Desktop Client    │
  │   Vanilla JS App     │       │ React + TS + Vite    │       │  JavaFX / Maven      │
  │                      │       │                      │       │                      │
  │  - index.html        │       │  - web/              │       │  - pom.xml           │
  │  - app.js            │       │  - Strict TypeScript │       │  - src/main/java/    │
  │  - localStorage DB   │       │  - Component tests   │       │  - Independent DB    │
  │  - GitHub Pages Root │       │  - Safe Supabase SDK │       │  - Desktop UI        │
  └──────────────────────┘       └──────────────────────┘       └──────────────────────┘
             │                               │
             │ (Migration Reference)         │ (Target Production)
             └───────────────────────────────►
                                             │
                                             ▼
                               ┌──────────────────────────────┐
                               │       Supabase (Stage 2)     │
                               │  - PostgreSQL Engine         │
                               │  - Row Level Security (RLS)  │
                               │  - Realtime Subscriptions    │
                               │  - Atomic Reservation RPCs   │
                               └──────────────────────────────┘
```

---

## 3. Existing Architecture (Stage 0 Baseline)

The legacy web application lives at the repository root:
- **Presentation**: `index.html`, `styles.css`.
- **Application Logic**: Monolithic `app.js` containing an in-browser `Database` class storing all state in `localStorage` and `sessionStorage`.
- **Key Features**: Student ordering, inventory management, preparation batches, BREAK-FIT class-interval filters, LAST PLATE anti-waste claims, and multi-language support (English, Hindi, Telugu).
- **Architectural Limitations**:
  - Browser-side data isolation prevents synchronized state between separate devices.
  - Client-side role checking is bypassable and lacks authoritative database enforcement.
  - Concurrent claims on LAST PLATE or inventory are vulnerable to race conditions without server-side locking or atomic RPCs.
  - GitHub Pages deploys directly from root without automated test gating.

---

## 4. Stage 1 Frontend Architecture (`web/`)

The new frontend is isolated inside `web/` to prevent collisions with the live root deployment:

```
web/
├── index.html               # Vite HTML entry point
├── package.json             # React 18, Vite 5, TypeScript 5, Vitest 2
├── tsconfig.json            # Strict TypeScript settings with path aliases
├── vite.config.ts           # Build configuration & Vitest jsdom integration
├── .eslintrc.cjs            # Lint rules for React hooks and TypeScript
├── .env.example             # Safe environment variable placeholders
└── src/
    ├── app/
    │   ├── App.tsx          # Root shell layout with header, navigation, & footer
    │   ├── routes.tsx       # View switching (Student Canteen vs. Kitchen Portal)
    │   └── providers.tsx    # Global notifications and application context
    ├── components/
    │   ├── ui/              # Reusable primitives (Button, StatusPill, Toast)
    │   ├── layout/          # Structural components (Header, Footer)
    │   └── feedback/        # ErrorBoundary, LoadingState, EmptyState
    ├── features/
    │   ├── menu/            # Menu discovery, dietary tags, prep times
    │   ├── break-fit/       # Class-interval safe filtering (5/10/15/30 mins)
    │   ├── last-plate/      # Surplus rescue discount reservations
    │   └── kitchen/         # Real-time Kanban queue (Placed -> Prep -> Ready)
    ├── lib/
    │   ├── types.ts         # Strictly typed domain models
    │   └── supabase.ts      # Safe Supabase client factory (fail-safe fallback)
    ├── styles/
    │   ├── tokens.css       # Design tokens (colors, typography, spacing)
    │   └── global.css       # Global resets, accessibility rules, layout
    └── test/
        ├── setup.ts         # Testing Library & Vitest configuration
        └── app.test.tsx     # Shell, portal switching, and feature tests
```

---

## 5. Architectural Boundaries & Data Access Principles

1. **Separation of Concerns**:
   - **Presentation**: Components under `src/components/` and `src/features/` handle pure rendering and user interaction.
   - **Domain Logic**: Business rules (e.g. prep-time thresholds, discount percentages, order status progression) are isolated in pure functions and typed interfaces.
   - **Data Access**: All external communication is routed through `src/lib/supabase.ts`. Direct `localStorage` access is prohibited in `web/src/`.
2. **Clear Separation of Development Fixtures**:
   - Fixture datasets (e.g., `FIXTURE_MENU_ITEMS`, `FIXTURE_KITCHEN_ORDERS`) are explicitly labeled with `[Development Fixture Data — Stage 1 Foundation]`.
   - The UI never misleads users into believing mock mutations are permanently persisted.
3. **Environment Security**:
   - Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are exposed to the client.
   - Privileged keys (Service Role, DB credentials) must NEVER enter client bundles.

---

## 6. JavaFX Desktop Application Separation

The JavaFX desktop project (`pom.xml`, `src/main/java/`, `src/main/resources/`) is a standalone academic desktop client. It:
- Operates independently of the web frontend.
- Uses its own Java data model and Maven lifecycle (`mvn test`, `mvn package`).
- Remains untouched and isolated throughout all web migration stages.

---

## 7. Testing Strategy

1. **Automated Unit & Component Tests (`web/`)**:
   - Vitest + React Testing Library running in JSDOM.
   - Validates component rendering, accessibility, state transitions, and user interactions.
2. **Legacy Browser Regression Tests (`tests.html`)**:
   - 26 browser-level assertions validating the vanilla JavaScript database engine, idempotency, batching, and inventory.
   - Preserved at root to guarantee that refactoring does not regress baseline behaviors.
3. **Continuous Integration**:
   - Automated via GitHub Actions (`.github/workflows/ci.yml`) enforcing clean builds, TypeScript checks, and test passes.

---

## 8. Planned Supabase Integration (Stage 2 Blueprint)

In Stage 2, the application transitions to authoritative backend persistence:
- **Authentication**: Supabase Auth (JWT) with student and staff roles.
- **Data Tables**: `profiles`, `food_items`, `orders`, `order_items`, `last_plate_listings`, `inventory_ledger`.
- **Row Level Security (RLS)**: Enforces that students can only read/create their own orders, while kitchen staff can modify order fulfillment states.
- **Concurrency & Atomicity**: PostgreSQL stored procedures / RPCs handle atomic reservations for LAST PLATE items and inventory deductions, preventing double-allocation race conditions.
