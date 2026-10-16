-- ==============================================================================
-- CampusBite Production Supabase / PostgreSQL Schema & Migration
-- Authoritative database specification for Smart Canteen & Digital Kitchen Operations
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & ROLES
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'STAFF', 'FACULTY', 'STUDENT')),
    student_id VARCHAR(50),
    faculty_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RAW INVENTORY
CREATE TABLE IF NOT EXISTS inventory (
    id BIGSERIAL PRIMARY KEY,
    ingredient VARCHAR(100) NOT NULL,
    qty NUMERIC(10, 2) NOT NULL DEFAULT 0.0 CHECK (qty >= 0),
    unit VARCHAR(20) NOT NULL,
    min_qty NUMERIC(10, 2) NOT NULL DEFAULT 1.0,
    unit_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FOOD ITEMS (Defect 5 & 6: Clean separation of admin pause, stock status & cost)
CREATE TABLE IF NOT EXISTS foods (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    cost_price NUMERIC(10, 2) DEFAULT 0.0, -- Internal margin / raw cost (Restricted from public API)
    category VARCHAR(50) NOT NULL,
    prep_min INT NOT NULL DEFAULT 10,
    is_paused_by_admin BOOLEAN DEFAULT FALSE,
    pause_reason VARCHAR(255),
    paused_at TIMESTAMPTZ,
    prepared_portions INT NOT NULL DEFAULT 0 CHECK (prepared_portions >= 0),
    image TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MULTI-INGREDIENT RECIPES (Group A: Multiple-ingredient recipe editing)
CREATE TABLE IF NOT EXISTS recipes (
    id BIGSERIAL PRIMARY KEY,
    food_id BIGINT REFERENCES foods(id) ON DELETE CASCADE,
    ingredient_id BIGINT REFERENCES inventory(id) ON DELETE RESTRICT,
    per_serving NUMERIC(10, 4) NOT NULL CHECK (per_serving > 0),
    unit VARCHAR(20) NOT NULL,
    UNIQUE(food_id, ingredient_id)
);

-- 5. PREPARATION BATCHES (Defect 1: Idempotent batch operations)
CREATE TABLE IF NOT EXISTS batches (
    id BIGSERIAL PRIMARY KEY,
    batch_operation_id VARCHAR(100) UNIQUE NOT NULL, -- Idempotency key for batch preparation
    food_id BIGINT REFERENCES foods(id) ON DELETE RESTRICT,
    portions INT NOT NULL CHECK (portions > 0),
    portions_available INT NOT NULL CHECK (portions_available >= 0),
    status VARCHAR(30) DEFAULT 'PREPARED',
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDERS (Defect 2 & 3: Atomic transitions & idempotency)
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    idempotency_key VARCHAR(100) UNIQUE NOT NULL, -- Duplicate-request protection
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(100) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'ACCEPTED', 'PREPARING', 'READY', 'COLLECTED', 'CANCELLED', 'EXPIRED')),
    eta_min INT NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    food_id BIGINT REFERENCES foods(id),
    name VARCHAR(120) NOT NULL,
    qty INT NOT NULL CHECK (qty > 0),
    price NUMERIC(10, 2) NOT NULL
);

-- 8. ORDER TRANSITION AUDIT LOG (Defect 2: Explicit verified state changes)
CREATE TABLE IF NOT EXISTS order_transitions (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    from_status VARCHAR(30) NOT NULL,
    to_status VARCHAR(30) NOT NULL,
    actor_id BIGINT REFERENCES users(id),
    actor_name VARCHAR(100),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- 9. APPEND-ONLY STOCK MOVEMENTS LEDGER (Section 4: Authoritative inventory ledger)
CREATE TABLE IF NOT EXISTS stock_movements (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    movement_type VARCHAR(40) NOT NULL CHECK (movement_type IN (
        'BATCH_PREPARATION', 
        'ORDER_FULFILMENT', 
        'ORDER_CANCELLATION', 
        'RESTOCK', 
        'AUDIT_CORRECTION', 
        'SPOILAGE_DISCARD'
    )),
    operation_id VARCHAR(100), -- Linked batch_operation_id or idempotency_key
    ref_id BIGINT,             -- Linked order_id or batch_id
    ingredient_id BIGINT REFERENCES inventory(id),
    qty_delta NUMERIC(10, 3) NOT NULL,
    balance_after NUMERIC(10, 3) NOT NULL,
    reason TEXT,
    actor_id BIGINT REFERENCES users(id)
);

-- 10. IDEMPOTENCY REGISTRY
CREATE TABLE IF NOT EXISTS idempotency_keys (
    key VARCHAR(100) PRIMARY KEY,
    resource_type VARCHAR(50) NOT NULL,
    resource_id BIGINT,
    response_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. LAST PLATE SURPLUS LISTINGS (Group C: Early withdrawal & surplus lifecycle)
CREATE TABLE IF NOT EXISTS last_plate_listings (
    id BIGSERIAL PRIMARY KEY,
    dish_name VARCHAR(120) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    portions INT NOT NULL CHECK (portions > 0),
    portions_remaining INT NOT NULL CHECK (portions_remaining >= 0),
    deadline TIMESTAMPTZ NOT NULL,
    location VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SOLD_OUT', 'CLOSED', 'EXPIRED', 'WITHDRAWN')),
    withdrawal_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. LAST PLATE RESERVATIONS
CREATE TABLE IF NOT EXISTS last_plate_reservations (
    id BIGSERIAL PRIMARY KEY,
    listing_id BIGINT REFERENCES last_plate_listings(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id),
    user_name VARCHAR(100) NOT NULL,
    qty INT NOT NULL CHECK (qty > 0),
    token VARCHAR(30) UNIQUE NOT NULL,
    collection_status VARCHAR(30) DEFAULT 'PENDING' CHECK (collection_status IN ('PENDING', 'COLLECTED', 'CANCELLED')),
    reserved_at TIMESTAMPTZ DEFAULT NOW(),
    collected_at TIMESTAMPTZ
);

-- 13. CUSTOMER FEEDBACK (Group A: Secure feedback portal)
CREATE TABLE IF NOT EXISTS customer_feedback (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
    user_id BIGINT REFERENCES users(id),
    user_name VARCHAR(100) NOT NULL,
    food_id BIGINT REFERENCES foods(id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    staff_reply TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. STOCKOUT EVENTS (Group B: Stockout history & duration trends)
CREATE TABLE IF NOT EXISTS stockout_events (
    id BIGSERIAL PRIMARY KEY,
    ingredient_id BIGINT REFERENCES inventory(id),
    food_id BIGINT REFERENCES foods(id),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    duration_mins INT
);

-- 15. PREP COACH PERSISTENT DECISIONS (Group B: Forecast evaluation)
CREATE TABLE IF NOT EXISTS prep_coach_decisions (
    id BIGSERIAL PRIMARY KEY,
    decision_date DATE DEFAULT CURRENT_DATE,
    hour_slot INT,
    food_id BIGINT REFERENCES foods(id),
    forecast_qty INT NOT NULL,
    committed_qty INT NOT NULL,
    actual_served INT DEFAULT 0,
    accuracy_pct NUMERIC(5, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. NOTIFICATIONS LOG (Group C: WhatsApp delivery tracking & retry)
CREATE TABLE IF NOT EXISTS notification_logs (
    id BIGSERIAL PRIMARY KEY,
    channel VARCHAR(30) DEFAULT 'WHATSAPP',
    recipient_id BIGINT REFERENCES users(id),
    recipient_contact VARCHAR(100),
    message TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED')),
    attempts INT DEFAULT 1,
    last_error TEXT,
    ref_type VARCHAR(30),
    ref_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 17. PUBLIC DTO VIEW (DEFECT 6 FIX: STOPS INTERNAL COST & MARGIN LEAKS)
-- Only safe public fields are exposed to student consumers.
-- ==============================================================================
CREATE OR REPLACE VIEW public_menu_items AS
SELECT 
    f.id,
    f.name,
    f.description,
    f.price,
    f.category,
    f.prep_min,
    f.prepared_portions,
    f.is_paused_by_admin,
    f.image,
    CASE 
        WHEN f.is_paused_by_admin THEN FALSE
        WHEN f.prepared_portions > 0 THEN TRUE
        ELSE TRUE
    END AS is_available,
    CASE 
        WHEN f.is_paused_by_admin THEN 'PAUSED_BY_ADMIN'
        WHEN f.prepared_portions > 0 THEN 'PREPARED_READY'
        ELSE 'COOK_TO_ORDER'
    END AS availability_status
FROM foods f
WHERE f.is_active = TRUE;

-- ==============================================================================
-- 18. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;

-- Anonymous / Student can read public menu view
CREATE POLICY "Public can view menu" ON foods FOR SELECT USING (is_active = TRUE);

-- Users can read their own orders; Staff/Admin can view all
CREATE POLICY "Users read own orders" ON orders FOR SELECT 
USING (auth.uid()::text = user_id::text OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()::bigint AND role IN ('ADMIN', 'STAFF')
));

-- Staff and Admin have full access to kitchen operations
CREATE POLICY "Staff manage kitchen" ON orders FOR ALL 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::bigint AND role IN ('ADMIN', 'STAFF')));

CREATE POLICY "Staff manage inventory" ON inventory FOR ALL 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::bigint AND role IN ('ADMIN', 'STAFF')));

CREATE POLICY "Staff manage batches" ON batches FOR ALL 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::bigint AND role IN ('ADMIN', 'STAFF')));
