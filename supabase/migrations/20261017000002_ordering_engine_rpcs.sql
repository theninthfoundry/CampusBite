-- ==============================================================================
-- Migration: 20261017000002_ordering_engine_rpcs.sql
-- Description: Authoritative, atomic ordering engine, state machine, and ETA calculations
-- ==============================================================================

-- 1. CENTRALIZED ETA CALCULATION FUNCTION
CREATE OR REPLACE FUNCTION calculate_queue_eta(p_items JSONB)
RETURNS INT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_item JSONB;
    v_food_id BIGINT;
    v_qty INT;
    v_prep_min INT;
    v_prepared INT;
    v_allocated INT;
    v_available_prepared INT;
    v_uncovered_qty INT;
    v_max_cook_time INT := 0;
    v_queued_orders_count INT := 0;
    v_congestion_buffer INT := 0;
    v_all_portions_ready BOOLEAN := TRUE;
BEGIN
    -- 1. Count active orders in kitchen queue (NEW, ACCEPTED, PREPARING)
    SELECT COUNT(*) INTO v_queued_orders_count
    FROM orders
    WHERE status IN ('NEW', 'ACCEPTED', 'PREPARING');

    -- Congestion heuristic: +1.5 mins per 2 active queued orders
    v_congestion_buffer := FLOOR(v_queued_orders_count / 2) * 2;

    -- 2. Inspect each requested item
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_food_id := (v_item->>'food_id')::BIGINT;
        v_qty := (v_item->>'qty')::INT;

        SELECT prep_min, prepared_portions, allocated_portions 
        INTO v_prep_min, v_prepared, v_allocated
        FROM foods
        WHERE id = v_food_id;

        IF NOT FOUND THEN
            CONTINUE;
        END IF;

        v_available_prepared := GREATEST(0, v_prepared - v_allocated);
        v_uncovered_qty := GREATEST(0, v_qty - v_available_prepared);

        IF v_uncovered_qty > 0 THEN
            v_all_portions_ready := FALSE;
            -- In batch cooking, base prep time dominates + small scaling
            IF v_prep_min > v_max_cook_time THEN
                v_max_cook_time := v_prep_min;
            END IF;
        END IF;
    END LOOP;

    -- If all items have available prepared portions in warmer -> ready in 2-3 mins
    IF v_all_portions_ready THEN
        RETURN 3;
    END IF;

    -- Cooking needed: max cook time + congestion buffer
    RETURN v_max_cook_time + v_congestion_buffer;
END;
$$;

-- 2. SECURE ATOMIC ORDER CREATION RPC
CREATE OR REPLACE FUNCTION create_order_atomic(
    p_idempotency_key VARCHAR(100),
    p_items JSONB,
    p_customer_name VARCHAR(100) DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_customer_name VARCHAR(100);
    v_customer_role VARCHAR(20) := 'STUDENT';
    v_existing_idempotency JSONB;
    v_order_id BIGINT;
    v_order_ref VARCHAR(30);
    v_subtotal NUMERIC(10, 2) := 0.0;
    v_calculated_eta INT;
    v_item JSONB;
    v_food_id BIGINT;
    v_requested_qty INT;
    v_food_record RECORD;
    v_available_prep INT;
    v_covered_prep INT;
    v_requires_cook INT;
    v_item_subtotal NUMERIC(10, 2);
    v_result JSONB;
BEGIN
    -- A. Idempotency Check (SELECT ... FOR UPDATE equivalent on idempotency_keys)
    SELECT response_payload INTO v_existing_idempotency
    FROM idempotency_keys
    WHERE key = p_idempotency_key;

    IF FOUND AND v_existing_idempotency IS NOT NULL THEN
        -- Return previously committed result without duplicating order or stock changes
        RETURN v_existing_idempotency;
    END IF;

    -- B. Authenticate caller
    v_user_id := auth.uid();
    
    IF v_user_id IS NOT NULL THEN
        SELECT full_name, role INTO v_customer_name, v_customer_role
        FROM profiles
        WHERE id = v_user_id;
    END IF;

    IF v_customer_name IS NULL THEN
        v_customer_name := COALESCE(p_customer_name, 'Campus Guest');
    END IF;

    -- C. Validate items array
    IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Order must contain at least one valid item';
    END IF;

    -- D. Pre-validate all items, calculate authoritative subtotal, and check availability
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_food_id := (v_item->>'food_id')::BIGINT;
        v_requested_qty := (v_item->>'qty')::INT;

        IF v_requested_qty <= 0 THEN
            RAISE EXCEPTION 'Quantity for item % must be greater than zero', v_food_id;
        END IF;

        -- Lock food row to prevent concurrent race conditions on portions
        SELECT * INTO v_food_record
        FROM foods
        WHERE id = v_food_id AND is_active = TRUE
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Food item ID % does not exist or is inactive', v_food_id;
        END IF;

        IF v_food_record.is_paused_by_admin THEN
            RAISE EXCEPTION 'Dish "%" is currently paused by kitchen (%): cannot order', 
                v_food_record.name, COALESCE(v_food_record.pause_reason, 'Temporarily unavailable');
        END IF;

        -- Authoritative price calculation (DO NOT TRUST CLIENT PRICE)
        v_item_subtotal := v_food_record.price * v_requested_qty;
        v_subtotal := v_subtotal + v_item_subtotal;
    END LOOP;

    -- E. Calculate authoritative ETA
    v_calculated_eta := calculate_queue_eta(p_items);

    -- F. Register idempotency key placeholder
    INSERT INTO idempotency_keys (key, user_id, operation, created_at)
    VALUES (p_idempotency_key, v_user_id, 'CREATE_ORDER', NOW())
    ON CONFLICT (key) DO NOTHING;

    -- G. Insert Order record
    v_order_ref := 'CB-' || (100 + (SELECT COUNT(*) FROM orders) + 1)::TEXT;

    INSERT INTO orders (
        order_ref,
        idempotency_key,
        user_id,
        customer_name,
        customer_role,
        subtotal,
        total,
        status,
        eta_min,
        estimated_ready_at,
        created_at
    ) VALUES (
        v_order_ref,
        p_idempotency_key,
        v_user_id,
        v_customer_name,
        v_customer_role,
        v_subtotal,
        v_subtotal, -- Total matches subtotal (fees currently waived)
        'NEW',
        v_calculated_eta,
        NOW() + (v_calculated_eta || ' minutes')::INTERVAL,
        NOW()
    )
    RETURNING id INTO v_order_id;

    -- H. Insert order items & allocate prepared portions
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_food_id := (v_item->>'food_id')::BIGINT;
        v_requested_qty := (v_item->>'qty')::INT;

        SELECT * INTO v_food_record FROM foods WHERE id = v_food_id;

        v_available_prep := GREATEST(0, v_food_record.prepared_portions - v_food_record.allocated_portions);
        v_covered_prep := LEAST(v_requested_qty, v_available_prep);
        v_requires_cook := v_requested_qty - v_covered_prep;

        -- Update portion allocations on the food item
        IF v_covered_prep > 0 THEN
            UPDATE foods 
            SET allocated_portions = allocated_portions + v_covered_prep
            WHERE id = v_food_id;
        END IF;

        INSERT INTO order_items (
            order_id,
            food_id,
            name,
            qty,
            unit_price,
            subtotal,
            covered_by_prepared_portions,
            requires_cooking_qty
        ) VALUES (
            v_order_id,
            v_food_id,
            v_food_record.name,
            v_requested_qty,
            v_food_record.price,
            v_food_record.price * v_requested_qty,
            v_covered_prep,
            v_requires_cook
        );
    END LOOP;

    -- I. Log initial state transition
    INSERT INTO order_transitions (
        order_id,
        from_status,
        to_status,
        actor_id,
        actor_name,
        actor_role,
        notes
    ) VALUES (
        v_order_id,
        'NONE',
        'NEW',
        v_user_id,
        v_customer_name,
        v_customer_role,
        'Order submitted and accepted by kitchen queue'
    );

    -- J. Build response payload
    v_result := jsonb_build_object(
        'success', TRUE,
        'order_id', v_order_id,
        'order_ref', v_order_ref,
        'customer_name', v_customer_name,
        'total', v_subtotal,
        'status', 'NEW',
        'eta_min', v_calculated_eta,
        'estimated_ready_at', (NOW() + (v_calculated_eta || ' minutes')::INTERVAL),
        'created_at', NOW()
    );

    -- K. Save response into idempotency registry
    UPDATE idempotency_keys
    SET resource_id = v_order_id,
        response_payload = v_result
    WHERE key = p_idempotency_key;

    RETURN v_result;
END;
$$;

-- 3. SECURE ATOMIC ORDER STATUS TRANSITION RPC
CREATE OR REPLACE FUNCTION advance_order_status_atomic(
    p_order_id BIGINT,
    p_expected_status VARCHAR(30),
    p_next_status VARCHAR(30),
    p_actor_name VARCHAR(100),
    p_actor_role VARCHAR(20),
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order RECORD;
    v_is_valid_transition BOOLEAN := FALSE;
BEGIN
    -- Concurrency lock on order row
    SELECT * INTO v_order
    FROM orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order #% not found', p_order_id;
    END IF;

    -- Concurrency check: Ensure state has not changed under us
    IF v_order.status != p_expected_status THEN
        -- If already in next status, return gracefully (idempotent success)
        IF v_order.status = p_next_status THEN
            RETURN jsonb_build_object(
                'success', TRUE,
                'order_id', p_order_id,
                'status', v_order.status,
                'message', 'Order already transitioned to requested status'
            );
        END IF;

        RAISE EXCEPTION 'Concurrent transition conflict: Order is currently %, expected %',
            v_order.status, p_expected_status;
    END IF;

    -- Validate allowed state transitions according to canonical state machine:
    -- NEW -> ACCEPTED or PREPARING
    -- ACCEPTED -> PREPARING
    -- PREPARING -> READY
    -- READY -> COLLECTED or NO_SHOW
    IF (p_expected_status = 'NEW' AND p_next_status IN ('ACCEPTED', 'PREPARING')) OR
       (p_expected_status = 'ACCEPTED' AND p_next_status = 'PREPARING') OR
       (p_expected_status = 'PREPARING' AND p_next_status = 'READY') OR
       (p_expected_status = 'READY' AND p_next_status IN ('COLLECTED', 'NO_SHOW')) THEN
        v_is_valid_transition := TRUE;
    END IF;

    IF NOT v_is_valid_transition THEN
        RAISE EXCEPTION 'Invalid status transition from % to %', p_expected_status, p_next_status;
    END IF;

    -- Update order status
    UPDATE orders
    SET status = p_next_status,
        collected_at = CASE WHEN p_next_status = 'COLLECTED' THEN NOW() ELSE collected_at END,
        updated_at = NOW()
    WHERE id = p_order_id;

    -- Insert Transition Audit Record
    INSERT INTO order_transitions (
        order_id,
        from_status,
        to_status,
        actor_name,
        actor_role,
        notes
    ) VALUES (
        p_order_id,
        p_expected_status,
        p_next_status,
        p_actor_name,
        p_actor_role,
        p_notes
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'order_id', p_order_id,
        'status', p_next_status,
        'updated_at', NOW()
    );
END;
$$;

-- 4. SECURE ATOMIC CANCELLATION RPC
CREATE OR REPLACE FUNCTION cancel_order_atomic(
    p_order_id BIGINT,
    p_reason TEXT,
    p_actor_name VARCHAR(100),
    p_actor_role VARCHAR(20)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
BEGIN
    SELECT * INTO v_order
    FROM orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order #% not found', p_order_id;
    END IF;

    -- Cancellation policy: Only allowed when NEW or ACCEPTED (before cooking begins)
    IF v_order.status NOT IN ('NEW', 'ACCEPTED') THEN
        RAISE EXCEPTION 'Order #% cannot be cancelled because it is already in "%" state',
            p_order_id, v_order.status;
    END IF;

    -- Release allocated prepared portions back to the foods table
    FOR v_item IN SELECT * FROM order_items WHERE order_id = p_order_id
    LOOP
        IF v_item.covered_by_prepared_portions > 0 THEN
            UPDATE foods
            SET allocated_portions = GREATEST(0, allocated_portions - v_item.covered_by_prepared_portions)
            WHERE id = v_item.food_id;
        END IF;
    END LOOP;

    -- Update order status
    UPDATE orders
    SET status = 'CANCELLED',
        cancellation_reason = p_reason,
        cancelled_by = p_actor_name,
        cancelled_at = NOW(),
        updated_at = NOW()
    WHERE id = p_order_id;

    -- Record in audit log
    INSERT INTO order_transitions (
        order_id,
        from_status,
        to_status,
        actor_name,
        actor_role,
        notes
    ) VALUES (
        p_order_id,
        v_order.status,
        'CANCELLED',
        p_actor_name,
        p_actor_role,
        'Cancelled: ' || COALESCE(p_reason, 'No reason specified')
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'order_id', p_order_id,
        'status', 'CANCELLED'
    );
END;
$$;
