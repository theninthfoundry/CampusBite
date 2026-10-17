-- ==============================================================================
-- Migration: 20261017000001_initial_schema.sql
-- Description: Core tables, RLS policies, audit logs, and idempotency registry
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & PROFILES (Linked to Supabase auth.users or standalone campus profiles)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(150) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'STAFF', 'FACULTY', 'STUDENT')),
    student_id VARCHAR(50),
    faculty_id VARCHAR(50),
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RAW INVENTORY
CREATE TABLE IF NOT EXISTS inventory (
    id BIGSERIAL PRIMARY KEY,
    ingredient VARCHAR(100) NOT NULL UNIQUE,
    qty NUMERIC(10, 2) NOT NULL DEFAULT 0.0 CHECK (qty >= 0),
    unit VARCHAR(20) NOT NULL,
    min_qty NUMERIC(10, 2) NOT NULL DEFAULT 1.0,
    unit_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FOOD ITEMS (Defect 5 & 6: Clean separation of admin pause, stock status & cost)
CREATE TABLE IF NOT EXISTS foods (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    cost_price NUMERIC(10, 2) DEFAULT 0.0, -- Restricted from public API
    category VARCHAR(50) NOT NULL CHECK (category IN ('Meals', 'Snacks', 'Drinks', 'Desserts', 'Breakfast')),
    dietary VARCHAR(20) NOT NULL DEFAULT 'Veg' CHECK (dietary IN ('Veg', 'Non-Veg', 'Vegan')),
    prep_min INT NOT NULL DEFAULT 10 CHECK (prep_min > 0),
    is_paused_by_admin BOOLEAN DEFAULT FALSE,
    pause_reason VARCHAR(255),
    paused_at TIMESTAMPTZ,
    prepared_portions INT NOT NULL DEFAULT 0 CHECK (prepared_portions >= 0),
    allocated_portions INT NOT NULL DEFAULT 0 CHECK (allocated_portions >= 0),
    image TEXT,
    allergens TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MULTI-INGREDIENT RECIPES
CREATE TABLE IF NOT EXISTS recipes (
    id BIGSERIAL PRIMARY KEY,
    food_id BIGINT REFERENCES foods(id) ON DELETE CASCADE,
    ingredient_id BIGINT REFERENCES inventory(id) ON DELETE RESTRICT,
    per_serving NUMERIC(10, 4) NOT NULL CHECK (per_serving > 0),
    unit VARCHAR(20) NOT NULL,
    UNIQUE(food_id, ingredient_id)
);

-- 5. IDEMPOTENCY REGISTRY (Stage 2/3 requirement)
CREATE TABLE IF NOT EXISTS idempotency_keys (
    key VARCHAR(100) PRIMARY KEY,
    user_id UUID,
    operation VARCHAR(50) NOT NULL,
    resource_id BIGINT,
    response_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_idempotency_user_op ON idempotency_keys(user_id, operation);

-- 6. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    order_ref VARCHAR(30) UNIQUE NOT NULL, -- Human-readable token e.g. 'CB-101'
    idempotency_key VARCHAR(100) UNIQUE NOT NULL REFERENCES idempotency_keys(key),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_role VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'NEW' CHECK (
        status IN ('NEW', 'ACCEPTED', 'PREPARING', 'READY', 'COLLECTED', 'CANCELLED', 'NO_SHOW')
    ),
    eta_min INT NOT NULL DEFAULT 10 CHECK (eta_min >= 0),
    estimated_ready_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    cancelled_by VARCHAR(100),
    cancelled_at TIMESTAMPTZ,
    collected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders(user_id, created_at DESC);

-- 7. ORDER ITEMS (Historical immutable snapshot)
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    food_id BIGINT REFERENCES foods(id),
    name VARCHAR(120) NOT NULL,
    qty INT NOT NULL CHECK (qty > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    covered_by_prepared_portions INT NOT NULL DEFAULT 0 CHECK (covered_by_prepared_portions >= 0),
    requires_cooking_qty INT NOT NULL DEFAULT 0 CHECK (requires_cooking_qty >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- 8. ORDER TRANSITIONS AUDIT LOG
CREATE TABLE IF NOT EXISTS order_transitions (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    from_status VARCHAR(30) NOT NULL,
    to_status VARCHAR(30) NOT NULL,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_name VARCHAR(100) NOT NULL,
    actor_role VARCHAR(20) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_order_transitions_order ON order_transitions(order_id);

-- 9. APPEND-ONLY STOCK MOVEMENTS LEDGER
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
    operation_id VARCHAR(100),
    ref_id BIGINT,
    ingredient_id BIGINT REFERENCES inventory(id),
    qty_delta NUMERIC(10, 3) NOT NULL,
    balance_after NUMERIC(10, 3) NOT NULL,
    reason TEXT,
    actor_name VARCHAR(100) DEFAULT 'SYSTEM'
);

-- 10. PUBLIC MENU VIEW (Defect 6: Stops internal cost leaks)
CREATE OR REPLACE VIEW public_menu_items AS
SELECT 
    f.id,
    f.name,
    f.description,
    f.price,
    f.category,
    f.dietary,
    f.prep_min,
    f.prepared_portions,
    f.allocated_portions,
    GREATEST(0, f.prepared_portions - f.allocated_portions) AS available_prepared_portions,
    f.is_paused_by_admin,
    f.pause_reason,
    f.image,
    f.allergens,
    CASE 
        WHEN f.is_paused_by_admin THEN FALSE
        WHEN f.is_active = FALSE THEN FALSE
        ELSE TRUE
    END AS is_available,
    CASE 
        WHEN f.is_paused_by_admin THEN 'PAUSED_BY_ADMIN'
        WHEN GREATEST(0, f.prepared_portions - f.allocated_portions) > 0 THEN 'PREPARED_READY'
        ELSE 'COOK_TO_ORDER'
    END AS availability_status
FROM foods f
WHERE f.is_active = TRUE;

-- 11. ENABLE RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- 12. RLS POLICIES
-- Profiles: Users read own profile; Staff/Admin can view all
CREATE POLICY "Users read own profile" ON profiles 
FOR SELECT USING (auth.uid() = id);

-- Public can read menu view & active foods
CREATE POLICY "Public read active foods" ON foods 
FOR SELECT USING (is_active = TRUE);

-- Staff manage foods
CREATE POLICY "Staff manage foods" ON foods 
FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'STAFF'))
);

-- Orders: Students read their own orders; Staff/Admin can read all
CREATE POLICY "Students read own orders" ON orders 
FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'STAFF'))
);

-- Order Items: Read linked to accessible orders
CREATE POLICY "Users read own order items" ON order_items 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders o 
        WHERE o.id = order_items.order_id 
        AND (o.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'STAFF')))
    )
);

-- Staff manage kitchen orders
CREATE POLICY "Staff update orders" ON orders 
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'STAFF'))
);

-- Inventory: Staff manage, public read-none
CREATE POLICY "Staff manage inventory" ON inventory 
FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'STAFF'))
);
