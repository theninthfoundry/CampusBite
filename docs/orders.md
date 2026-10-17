# CampusBite Authoritative Ordering Engine & Data Contract

## 1. System Overview

In CampusBite Stage 3, PostgreSQL serves as the authoritative source of truth for all orders, line items, prices, and state transitions. Browser `localStorage` is explicitly decommissioned for transactional decisions.

---

## 2. Canonical Order Lifecycle & State Machine

```
   [ NEW ] ──(Chef acknowledges)──► [ ACCEPTED ]
      │                                    │
      │ (Start preparation)               │ (Start preparation)
      ▼                                    ▼
   [ PREPARING ] ──(Cooked / Plated)──► [ READY ]
                                           │
                                           ├─(Student picks up)──► [ COLLECTED ]
                                           │
                                           └─(No pickup timeout)─► [ NO_SHOW ]

   [ NEW / ACCEPTED ] ──(Cancel before cooking)──► [ CANCELLED ]
```

### Transition Matrix & Security Boundaries

| Current Status | Allowed Next Status | Permitted Actor | Validation Rules & Side Effects |
| :--- | :--- | :--- | :--- |
| `NONE` | `NEW` | `STUDENT`, `FACULTY` | Validates item active status, unpaused state, authoritative price calculation, idempotency key registration. |
| `NEW` | `ACCEPTED` | `STAFF`, `ADMIN` | Kitchen acknowledges order receipt and station assignment. |
| `NEW` | `PREPARING` | `STAFF`, `ADMIN` | Direct start cooking if kitchen skip-acknowledges. |
| `ACCEPTED` | `PREPARING` | `STAFF`, `ADMIN` | Dish moved to stove/preparation counter. |
| `PREPARING` | `READY` | `STAFF`, `ADMIN` | Plated and placed in Counter 01 ready racks. |
| `READY` | `COLLECTED` | `STAFF`, `ADMIN`, `STUDENT` | Verified student collection. Sets `collected_at = NOW()`. |
| `READY` | `NO_SHOW` | `STAFF`, `ADMIN` | Staff declares portion abandoned after timeout. |
| `NEW` / `ACCEPTED` | `CANCELLED` | `STUDENT`, `STAFF`, `ADMIN` | Cancellation permitted **only prior to cooking**. Releases allocated warmer portions back to `foods`. |
| `PREPARING` / `READY` | `CANCELLED` | **REJECTED** | Once ingredients are on stove or dish is plated, cancellation is prohibited. |
| `COLLECTED` | `ANY` | **REJECTED** | Terminal state; modifications rejected. |

---

## 3. Order Data Contract

### PostgreSQL Schema Entity (`orders` table)
- `id` (BIGINT, Primary Key)
- `order_ref` (VARCHAR(30), Unique Human-Readable Reference e.g. `CB-101`)
- `idempotency_key` (VARCHAR(100), Unique Foreign Key referencing `idempotency_keys(key)`)
- `user_id` (UUID, Foreign Key referencing `profiles(id)`)
- `customer_name` (VARCHAR(100), Captured from authenticated profile)
- `customer_role` (VARCHAR(20), `STUDENT` | `FACULTY`)
- `subtotal` (NUMERIC(10, 2), Authoritatively calculated from `foods.price`)
- `total` (NUMERIC(10, 2), Total payable after campus tech fee waivers)
- `status` (VARCHAR(30), `NEW` | `ACCEPTED` | `PREPARING` | `READY` | `COLLECTED` | `CANCELLED` | `NO_SHOW`)
- `eta_min` (INT, Authoritative calculated minutes)
- `estimated_ready_at` (TIMESTAMPTZ, `created_at + (eta_min * '1 min')`)
- `created_at` (TIMESTAMPTZ, Database authoritative event timestamp)
- `updated_at` (TIMESTAMPTZ)
- `collected_at` (TIMESTAMPTZ, Populated upon collection)
- `cancelled_at` (TIMESTAMPTZ, Populated upon cancellation)
- `cancellation_reason` (TEXT)

### Line Item Snapshot Entity (`order_items` table)
Changing prices or descriptions in the campus menu never rewrites historical records:
- `order_id` (BIGINT, Foreign Key referencing `orders(id)`)
- `food_id` (BIGINT, Foreign Key referencing `foods(id)`)
- `name` (VARCHAR(120), Frozen dish name at transaction time)
- `qty` (INT, Must be > 0)
- `unit_price` (NUMERIC(10, 2), Frozen price from database)
- `subtotal` (NUMERIC(10, 2), `qty * unit_price`)
- `covered_by_prepared_portions` (INT, Quantity fulfilled from warmer stock)
- `requires_cooking_qty` (INT, Quantity requiring fresh cook cycle)

---

## 4. Idempotency & Duplicate Prevention

1. **Unique Request Scope**: Every checkout submission must supply a client-generated UUID/Key (`CB-IDEM-...`).
2. **First Valid Submission**:
   - PostgreSQL RPC `create_order_atomic` acquires a lock on the key.
   - Inserts order, items, and initial transition atomically.
   - Stores response payload in `idempotency_keys.response_payload`.
3. **Identical Retries (Network Timeouts)**:
   - When the client retries with the identical key, `create_order_atomic` immediately returns the cached `response_payload`.
   - Zero duplicate orders are created; zero double-deductions occur.
4. **Conflicting Payload on Reused Key**:
   - Reused keys with different payloads are rejected by PostgreSQL constraint violation.

---

## 5. Security & Authorization

- Client-side prices (`price`) and totals are strictly ignored by PostgreSQL.
- Only the authenticated caller's identity (`auth.uid()`) is associated with the order.
- RLS ensures students can only query their own orders, while authorized staff (`role IN ('STAFF', 'ADMIN')`) have access to the global kitchen queue.
- Transitions and cancellations are enforced server-side via `advance_order_status_atomic` and `cancel_order_atomic`.
