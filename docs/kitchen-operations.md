# CampusBite Kitchen Operations, Queue Management & Inventory

## 1. Kitchen Staff Workflow

The Kitchen Operations interface is built for high-throughput campus cafeteria environments. Staff interact with a real-time Kanban board divided into four operational lanes:

1. **Incoming Orders (`NEW` / `ACCEPTED`)**:
   - Orders transmitted by students via web or mobile devices.
   - Highlights items with available warmer portions vs. dishes requiring immediate stove preparation.
   - Action: `Start Preparation →` moves order to `PREPARING`.
2. **On Stove / Preparation (`PREPARING`)**:
   - Live dishes actively being cooked or assembled by kitchen chefs.
   - Action: `Mark Ready for Pickup ✓` signals completion.
3. **Ready for Pickup (`READY`)**:
   - Plated dishes placed on Counter 01 racks awaiting student claim.
   - Action: `Confirm Collected 📦` closes order lifecycle upon physical collection.
4. **Collected / Past Orders (`COLLECTED`)**:
   - Terminal state retained for audits and operational analytics.

---

## 2. Concurrency Control & Conflicting Actions

To prevent two kitchen workers from accidentally double-advancing or conflicting on the same ticket:
- Every status update runs through PostgreSQL RPC `advance_order_status_atomic(p_order_id, p_expected_status, p_next_status, ...)`.
- The database acquires an exclusive row lock (`SELECT ... FOR UPDATE`).
- If another worker has already transitioned the order, the request succeeds idempotently (if in target status) or throws a concurrency conflict error.
- UI updates are applied only upon confirmed backend response.

---

## 3. Dynamic Raw Inventory & Menu Management

Staff have full operational controls to adjust physical stock and menu availability:

### 3.1 Adding Raw Ingredients
- Staff can add new bulk ingredients directly via the Kitchen Operations interface (`+ Add Ingredient`).
- Required inputs: `ingredient` name, `qty`, `unit` (`kg`, `L`, `packs`, `pcs`), `minQty` (alert threshold), `unitCost`.
- Automatically added to the `inventory` table and available for recipes.

### 3.2 Quick Stock Adjustments
- Physical counts can be updated via `−1` or `+5` quick-adjust triggers or audited reconciliations.
- When stock falls below `min_qty`, warning alerts appear automatically.

### 3.3 Adding & Pausing Menu Dishes
- **Add Menu Dish**: Staff can publish new dishes (`+ Add Menu Item`) specifying category, price, dietary classification, prep time, and initial warmer stock.
- **Dish Pause**: If an ingredient runs out or a station is overwhelmed, staff can toggle `Pause Dish`. Paused dishes are instantly disabled in student menus with a clear reason banner.

---

## 4. Real-Time Cross-Device Synchronization

- **Protocol**: Real-time websocket channels listening to `postgres_changes` on `orders` and `foods`.
- **Latency & Delivery**: Order placement or status transitions propagate across devices automatically.
- **Disconnection & Reconnection Strategy**:
  - The client maintains an active heartbeat.
  - If network or websocket drops, the UI displays a subtle reconnecting indicator.
  - A fallback background poller (5s interval) continues fetching authoritative state.
  - Upon reconnection, the client reconciles state directly with the database.
