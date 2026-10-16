# CampusBite — Production Operations Runbook

## 1. Architecture & Deployment Topology
CampusBite is built as an offline-resilient, event-driven smart canteen application designed to operate reliably under high student rush-hour traffic.

- **Frontend & Edge**: Single-Page Web Application hosted on GitHub Pages or Vercel edge CDN.
- **Authoritative Database**: PostgreSQL hosted on Supabase (`supabase_schema.sql`).
- **Resilient Offline Cache**: Client-side storage layer (`campusbite_db_v5`) with transactional idempotency protection and cross-tab multi-station sync.
- **Ledger Journal**: Append-only `stock_movements` ledger recording every state change, portion fulfillment, batch cook, and audit reconciliation.

---

## 2. Seven Confirmed Defects: Implemented Solutions

| Defect | Issue Fixed | Technical Implementation |
| :--- | :--- | :--- |
| **P0: Prep Coach double deduction** | Forecasting deducted stock or repeated clicks drained inventory twice. | Segregated into pure read-only forecasting (`forecastPrepBatches`) and idempotent batch commitment (`commitPrepBatch`) guarded by `batchOperationId`. |
| **P0: Concurrent 'Start Cooking' skip to READY** | Rapid clicks by staff jumped from `NEW` directly to `READY`. | Backend state machine enforces conditional status updates (`transitionOrderStatus`). Transitions require matching `expectedCurrentStatus` and legal edge traversal. |
| **P0: Duplicate order submission** | Retried requests or double-clicks duplicated orders and drained stock. | Unique client `idempotencyKey` required on submission. Duplicate requests return original order without double-deduction. |
| **P0: Partial stock Tray ETA error** | ETA ignored whether portions were ready in warmer vs cooking on stove. | Formula $Q_{\text{remaining}} = \max(0, Q_{\text{ordered}} - Q_{\text{allocated}})$ computes batch cooking requirements for remaining portions with station parallelism. |
| **P1: Menu pause reset by batch record** | Cooking a batch or restocking re-enabled admin-paused items. | Independent boolean flag `is_paused_by_admin` is separated from stock depletion logic (`is_out_of_stock`). Admin pause persists across all batch updates. |
| **P1: Student API internal cost leak** | Raw database objects exposed ingredient costs, per-serving ratios, and margins. | `toPublicFoodDTO` Whitelist projector strips `costPrice`, `recipe`, `perServing`, and supplier costs before student payload delivery. |
| **P1: Toast messages push page content** | Adding toasts shifted page scroll and header down. | Fixed-position notification layer (`.toast-container { position: fixed; bottom: 2rem; right: 2rem; z-index: 10000; pointer-events: none; }`). |

---

## 3. Operational Features Complete (Groups A, B, C)

### Group A: Security & Core Operations
1. **Admin Account & Role Management**: Multi-role support (`ADMIN`, `STAFF`, `FACULTY`, `STUDENT`) with user activation toggles.
2. **Password Recovery**: Self-service recovery token generation and secure password reset flow.
3. **Audited Stock Reconciliation**: Physical inventory counts with variance calculation (+ / -), reason logging, and append-only ledger tracking.
4. **Multi-Ingredient Recipe Builder**: Canteen managers can configure multiple ingredients per dish with precise portion ratios and automated cost recalculation.
5. **Customer Feedback Portal**: Post-collection 1–5 star ratings and reviews with staff management review feed.

### Group B: Operational Intelligence
1. **Stockout History & Durations**: Real-time logging of stockout events, timestamps, recovery durations, and affected dishes.
2. **Prep Coach Persistent Analytics**: Forecasted suggestions evaluated against actual customer orders served for forecasting accuracy.
3. **Potential Waste Cost Tracking**: Financial loss calculation for unsold surplus and expired Last Plate portions.
4. **Hourly Demand Distribution**: Rush hour profiling (12 PM - 2 PM lunch peak) for staff station planning.

### Group C: Notifications & Customer Experience
1. **WhatsApp Delivery Tracking & Retry**: Automated message dispatch for order confirmation and counter collection alerts with delivery tracking.
2. **Reliable Order Expiry & No-Show Handling**: Pickup timeout flags uncollected orders as `EXPIRED` / `NO_SHOW`.
3. **Last Plate Early Withdrawal**: Managers can withdraw surplus listings early with automatic cancellation of pending uncollected reservations.

---

## 4. Disaster Recovery & Database Rollback Procedures

### Point-in-Time Recovery (PITR) for Supabase PostgreSQL
1. **Backup Verification**: Supabase automated daily backups and WAL logs provide up to 7 days of point-in-time recovery.
2. **Emergency Rollback**:
   - If a faulty deployment or corrupted data state occurs, navigate to the Supabase Dashboard -> **Database** -> **Backups**.
   - Select point-in-time prior to the incident and trigger **Restore to New Project** or **In-Place Restore**.
3. **Local Store Disaster Recovery**:
   - If client cache needs manual reset to defaults, use the **RESET DB** button in the Kitchen Dashboard or run `localStorage.removeItem('campusbite_db_v5')`.

### Transaction Rollback Strategy via Stock Movements Ledger
Every inventory movement records:
- `operationId`: Transaction reference
- `qtyDelta`: Quantitative adjustment
- `balanceAfter`: Resulting balance

To reverse an errant operation:
1. Filter ledger for target `operationId`.
2. Generate compensating entries with inverted `qtyDelta` (`-qtyDelta`).
3. Commit compensating records with reason `REVERSAL_COMPENSATION`.

---

## 5. Automated Verification & Test Evidence
- **Browser Automated Test Suite**: [tests.html](file:///d:/campusbite/tests.html) (26 / 26 tests passing).
- **CLI Assertion Suite**: `powershell -ExecutionPolicy Bypass -File .\run_tests.ps1` (18 / 18 checks passing).
