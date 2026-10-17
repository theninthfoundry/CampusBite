-- ==============================================================================
-- Migration: 20261017000003_seed_campus_data.sql
-- Description: Seed initial campus menu, inventory, recipes, and user profiles
-- ==============================================================================

-- 1. SEED PROFILES
INSERT INTO profiles (id, email, full_name, role, student_id, faculty_id, department) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin@campus.edu', 'Canteen Admin', 'ADMIN', NULL, NULL, 'Canteen Operations'),
    ('00000000-0000-0000-0000-000000000002', 'staff@campus.edu', 'Ramesh (Kitchen Chef)', 'STAFF', NULL, NULL, 'Kitchen Operations'),
    ('00000000-0000-0000-0000-000000000003', 'student@campus.edu', 'Sreeshanth', 'STUDENT', '25R11A0501', NULL, 'Computer Science'),
    ('00000000-0000-0000-0000-000000000004', 'faculty@campus.edu', 'Dr. Chandrashekar', 'FACULTY', NULL, 'FAC-CS-108', 'Computer Science')
ON CONFLICT (id) DO NOTHING;

-- 2. SEED INVENTORY
INSERT INTO inventory (id, ingredient, qty, unit, min_qty, unit_cost) VALUES
    (1, 'Rice', 24.0, 'kg', 3.0, 45.0),
    (2, 'Chicken', 10.0, 'kg', 2.0, 180.0),
    (3, 'Paneer', 4.0, 'kg', 1.5, 320.0),
    (4, 'Bread & Buns', 18.0, 'packs', 3.0, 30.0),
    (5, 'Cooking Oil', 12.0, 'L', 2.0, 130.0),
    (6, 'Milk', 14.0, 'L', 2.5, 55.0)
ON CONFLICT (id) DO UPDATE SET qty = EXCLUDED.qty;

-- 3. SEED FOODS (All 13 standard campus dishes)
INSERT INTO foods (id, name, description, price, cost_price, category, dietary, prep_min, prepared_portions, allocated_portions, image) VALUES
    (1, 'Chicken Biryani', 'Spiced basmati rice with tender marinated chicken and caramelized mint', 120.00, 48.00, 'Meals', 'Non-Veg', 12, 4, 0, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80'),
    (2, 'Veg Biryani', 'Long-grain basmati, saffron, garden vegetables & whole roasted spices', 90.00, 38.00, 'Meals', 'Veg', 10, 2, 0, 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&auto=format&fit=crop&q=80'),
    (3, 'Paneer Rice', 'Wok-tossed rice with fresh cottage cheese cubes & mild pepper seasoning', 100.00, 46.00, 'Meals', 'Veg', 10, 0, 0, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80'),
    (4, 'Veg Pizza', 'Crisp stone crust, molten mozzarella, bell peppers & oregano dusting', 90.00, 42.00, 'Snacks', 'Veg', 14, 1, 0, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80'),
    (5, 'Chicken Burger', 'Crisp chicken patty, house sesame sauce & crisp iceberg lettuce', 80.00, 36.00, 'Snacks', 'Non-Veg', 8, 0, 0, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80'),
    (6, 'Masala Dosa', 'Golden paper-thin crepe, tempered potato mash & two stone-ground chutneys', 60.00, 22.00, 'Meals', 'Veg', 8, 0, 0, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&auto=format&fit=crop&q=80'),
    (7, 'Samosa (2 pcs)', 'Hand-rolled golden flaky crust, spiced potato & green pea filling', 25.00, 10.00, 'Snacks', 'Veg', 3, 8, 0, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80'),
    (8, 'French Fries', 'Crisp golden potato batons, tossed in fine sea salt', 50.00, 18.00, 'Snacks', 'Veg', 6, 0, 0, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400&auto=format&fit=crop&q=80'),
    (9, 'Masala Coke', 'Chilled effervescent cola, roasted cumin, rock salt & fresh lime wedge', 40.00, 15.00, 'Drinks', 'Veg', 2, 10, 0, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&auto=format&fit=crop&q=80'),
    (10, 'Cold Coffee', 'Slow-brewed dark roast espresso, chilled creamy milk, lightly sweet', 60.00, 24.00, 'Drinks', 'Veg', 4, 4, 0, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&auto=format&fit=crop&q=80'),
    (11, 'Lemon Tea', 'Piping hot Assam black tea infusion, freshly squeezed lemon & honey note', 20.00, 6.00, 'Drinks', 'Veg', 3, 0, 0, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80'),
    (12, 'Gulab Jamun (2 pcs)', 'Warm melt-in-mouth milk dumplings soaked in cardamom rose syrup', 40.00, 16.00, 'Desserts', 'Veg', 2, 6, 0, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80'),
    (13, 'Ice Cream Scoop', 'Velvety Madagascar vanilla bean ice cream scoop in chilled bowl', 35.00, 14.00, 'Desserts', 'Veg', 1, 5, 0, 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO UPDATE SET 
    price = EXCLUDED.price,
    prepared_portions = EXCLUDED.prepared_portions;

SELECT setval('foods_id_seq', 14, false);
SELECT setval('inventory_id_seq', 7, false);
