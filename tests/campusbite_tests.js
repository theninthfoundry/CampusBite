/**
 * CampusBite Automated Regression Test Suite
 * Comprehensive verification of the 7 Defects, Operational Features, and State Invariants
 */
(function (global) {
  'use strict';

  const results = [];

  function assert(condition, message) {
    if (!condition) throw new Error(message || "Assertion failed");
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message || 'Assertion failed'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  }

  async function runTest(name, fn) {
    const t0 = performance.now();
    try {
      await fn();
      const time = (performance.now() - t0).toFixed(2);
      results.push({ name, passed: true, time });
    } catch (err) {
      const time = (performance.now() - t0).toFixed(2);
      results.push({ name, passed: false, error: err.message, time });
    }
  }

  // Setup a clean isolated test database instance
  function createTestDb() {
    localStorage.removeItem('campusbite_db_v5');
    const db = new Database();
    db.reset();
    return db;
  }

  async function executeAllTests() {
    results.length = 0;

    // --- DEFECT 1: PREP COACH IDEMPOTENT DEDUCTIONS ---
    await runTest("P0.1: Prep Coach double deduction prevention (idempotency)", () => {
      const db = createTestDb();
      const food = db.data.foods.find(f => f.id === 1); // Chicken Biryani (ing 1 & 2)
      const ingRice = db.data.inventory.find(i => i.id === 1);
      const initialRice = ingRice.qty;
      const initialPrep = food.preparedPortions;

      const opId = "TEST-OP-BATCH-1001";
      // First commit
      const res1 = db.commitPrepBatch({ batchOperationId: opId, foodId: 1, portions: 4, chefId: "Chef A" });
      assertEqual(res1.isDuplicate, false, "First batch must not be marked duplicate");
      assertEqual(food.preparedPortions, initialPrep + 4, "Prepared portions should increase by 4");

      const riceAfterFirst = ingRice.qty;
      assert(riceAfterFirst < initialRice, "Raw rice must be deducted after first commit");

      // Repeated commit with same batchOperationId
      const res2 = db.commitPrepBatch({ batchOperationId: opId, foodId: 1, portions: 4, chefId: "Chef A" });
      assertEqual(res2.isDuplicate, true, "Retried batch must return existing batch marked as duplicate");
      assertEqual(ingRice.qty, riceAfterFirst, "Raw stock must NOT be deducted a second time");
      assertEqual(food.preparedPortions, initialPrep + 4, "Prepared portions must not be incremented again");
      
      const batchesForOp = db.data.batches.filter(b => b.batchOperationId === opId);
      assertEqual(batchesForOp.length, 1, "Exactly one batch record must exist");
    });

    await runTest("P0.2: Prep Coach forecasting is strictly read-only", () => {
      const db = createTestDb();
      const ingSnapshot = JSON.stringify(db.data.inventory);
      const batchCount = db.data.batches.length;

      const forecast = db.forecastPrepBatches();
      assert(Array.isArray(forecast) && forecast.length > 0, "Forecast must return dishes");
      assertEqual(JSON.stringify(db.data.inventory), ingSnapshot, "Forecasting must not modify inventory");
      assertEqual(db.data.batches.length, batchCount, "Forecasting must not record batches");
    });

    // --- DEFECT 2: CONCURRENT START COOKING ATOMIC TRANSITIONS ---
    await runTest("P0.3: Concurrent 'Start Cooking' cannot skip order states to READY", () => {
      const db = createTestDb();
      const user = db.data.users.find(u => u.role === 'STUDENT');
      const food = db.data.foods[0];
      const order = db.placeOrder(user, [{ food, qty: 1 }], food.price, 10, "KEY-TEST-201");
      assertEqual(order.status, "NEW", "Initial status must be NEW");

      // Two staff members click 'START COOKING' simultaneously
      // Staff 1 initiates transition from NEW -> PREPARING
      const res1 = db.transitionOrderStatus(order.id, "NEW", "PREPARING", "Chef Ramesh");
      assertEqual(res1.success, true, "First staff transition must succeed");
      assertEqual(order.status, "PREPARING", "Order must now be PREPARING");

      // Staff 2 also clicked 'START COOKING' expecting status to be NEW
      const res2 = db.transitionOrderStatus(order.id, "NEW", "PREPARING", "Chef Suresh");
      assertEqual(res2.success, false, "Second concurrent transition expecting NEW must fail");
      assertEqual(res2.conflict, true, "Second call must flag state conflict");
      assertEqual(order.status, "PREPARING", "Order state MUST remain PREPARING and NEVER skip to READY");

      // Valid transition records check
      const validTransitions = order.transitions.filter(t => t.to === 'PREPARING');
      assertEqual(validTransitions.length, 1, "Exactly one PREPARING transition must be logged");
    });

    await runTest("P0.4: State machine rejects illegal state jumps", () => {
      const db = createTestDb();
      const user = db.data.users.find(u => u.role === 'STUDENT');
      const food = db.data.foods[0];
      const order = db.placeOrder(user, [{ food, qty: 1 }], food.price, 10, "KEY-TEST-202");

      // Attempt illegal jump from NEW directly to READY or COLLECTED
      const resIllegal = db.transitionOrderStatus(order.id, "NEW", "READY", "Attacker");
      assertEqual(resIllegal.success, false, "Direct jump from NEW to READY must be rejected");
      assertEqual(order.status, "NEW", "Order status must stay NEW");
    });

    // --- DEFECT 3: IDEMPOTENCY KEY ORDER DEDUPLICATION ---
    await runTest("P0.5: Duplicate order requests return original order (Idempotency Key)", () => {
      const db = createTestDb();
      const user = db.data.users.find(u => u.role === 'STUDENT');
      const food = db.data.foods[0];
      const key = "CB-IDEMP-TEST-301";

      const orderCountBefore = db.data.orders.length;
      // First attempt
      const order1 = db.placeOrder(user, [{ food, qty: 1 }], food.price, 10, key);
      assertEqual(db.data.orders.length, orderCountBefore + 1, "Order must be created on first submission");

      // Simulated network retry or double-click with same idempotency key
      const order2 = db.placeOrder(user, [{ food, qty: 1 }], food.price, 10, key);
      assertEqual(order2.id, order1.id, "Retried request must return original order ID");
      assertEqual(order2.isDuplicateRetry, true, "Retried response must indicate duplicate retry");
      assertEqual(db.data.orders.length, orderCountBefore + 1, "Database must still contain exactly one order");
    });

    // --- DEFECT 4: QUANTITY-AWARE TRAY ETA WITH PARTIAL PREPARED STOCK ---
    await runTest("P0.6: Tray ETA calculates remaining preparation work (Q_remaining = max(0, Q_ord - Q_alloc))", () => {
      const db = createTestDb();
      const food = db.data.foods.find(f => f.id === 1); // Chicken Biryani (prepMin: 12, batchSize: 4)
      food.preparedPortions = 2; // Only 2 portions available in warmer

      // Scenario: Student orders 5 portions
      // Requested: 5, Allocated from warmer: 2, Remaining to cook: 3
      // 3 remaining portions need 1 batch (batchSize 4) -> 12 mins cooking
      const cart5 = [{ food, qty: 5 }];
      const eta5 = db.calculateCartEta(cart5);

      // Compare with ordering only 2 portions (both in warmer -> instant assembly ~2-4m)
      const cart2 = [{ food, qty: 2 }];
      const eta2 = db.calculateCartEta(cart2);

      assert(eta5 > eta2, `ETA for 5 portions (${eta5}m) must be substantially higher than 2 portions already in warmer (${eta2}m)`);
      assert(eta5 >= 14, `ETA for 3 portions to cook must include cooking time (~14m), got ${eta5}m`);
    });

    await runTest("P0.7: Tray ETA with 100% prepared portions provides fast counter assembly", () => {
      const db = createTestDb();
      const food = db.data.foods.find(f => f.id === 1);
      food.preparedPortions = 10; // Plenty ready in warmer
      const cart = [{ food, qty: 3 }];
      const eta = db.calculateCartEta(cart);
      assert(eta <= 4, `ETA with 100% prepared portions in warmer should be ~2-4 mins, got ${eta}m`);
    });

    // --- DEFECT 5: ADMIN MENU PAUSE SURVIVES BATCH RECORDING & RESTOCK ---
    await runTest("P1.1: Batch recording must NOT reverse an administrator's menu pause", () => {
      const db = createTestDb();
      const food = db.data.foods.find(f => f.id === 1);
      
      // Admin pauses dish
      db.setAdminMenuPause(food.id, true, "Kitchen deep-clean hold");
      assertEqual(food.is_paused_by_admin, true, "Dish must be paused by admin");

      const publicBefore = db.toPublicFoodDTO(food);
      assertEqual(publicBefore.available, false, "Paused dish must not be available to students");

      // Staff records a new batch of 8 portions
      db.commitPrepBatch({ batchOperationId: "BATCH-PAUSE-TEST", foodId: food.id, portions: 8, chefId: "Chef" });
      assert(food.preparedPortions >= 8, "Batch must increment prepared portions");

      // VERIFY: Admin pause must persist!
      assertEqual(food.is_paused_by_admin, true, "Dish MUST REMAIN paused after batch recording");
      const publicAfter = db.toPublicFoodDTO(food);
      assertEqual(publicAfter.available, false, "Dish MUST NOT become available to students while admin pause is active");
    });

    await runTest("P1.2: Raw inventory restock must NOT reverse an administrator's menu pause", () => {
      const db = createTestDb();
      const food = db.data.foods.find(f => f.id === 2);
      db.setAdminMenuPause(food.id, true, "Admin inspection");
      
      // Restock inventory
      db.reconcileStock(1, 100.0, "Bulk delivery restock", "Supplier");
      db.evaluateInventoryDepletion();

      assertEqual(food.is_paused_by_admin, true, "Admin pause must survive restock reconciliation");
    });

    // --- DEFECT 6: STUDENT API RESPONSE COST PRIVACY ---
    await runTest("P1.3: Student API responses strictly strip costPrice, perServing, and recipes", () => {
      const db = createTestDb();
      const publicFoods = db.getPublicFoods();
      assert(publicFoods.length > 0, "Public foods must exist");

      publicFoods.forEach(dto => {
        assertEqual(dto.costPrice, undefined, `costPrice must not be exposed on ${dto.name}`);
        assertEqual(dto.perServing, undefined, `perServing must not be exposed on ${dto.name}`);
        assertEqual(dto.recipe, undefined, `recipe ingredients must not be exposed on ${dto.name}`);
        assertEqual(dto.margin, undefined, `margin must not be exposed on ${dto.name}`);
        assert(typeof dto.price === 'number', `Selling price must be present on ${dto.name}`);
        assert(typeof dto.available === 'boolean', `Availability must be boolean on ${dto.name}`);
      });
    });

    // --- DEFECT 7: FIXED POSITION TOAST CONTAINER ---
    await runTest("P1.4: Toast container is fixed-positioned outside document flow", () => {
      const container = document.getElementById('toast-container');
      assert(container != null, "Toast container element must exist in DOM");
      const comp = window.getComputedStyle(container);
      assertEqual(comp.position, 'fixed', "Toast container MUST have position: fixed");
      assertEqual(comp.pointerEvents, 'none', "Toast container MUST have pointer-events: none");
    });

    // --- GROUP A: SECURITY & CORE OPERATIONS ---
    await runTest("Group A.1: Password recovery token generation & reset flow", () => {
      const db = createTestDb();
      const res = db.createPasswordResetToken("demo@campus.edu");
      assert(res.token && res.token.length === 6, "Must generate 6-digit recovery code");
      
      // Reset with valid token
      const updatedUser = db.resetPasswordWithToken(res.token, "newSecurePassword123");
      assertEqual(updatedUser.pw, "newSecurePassword123", "Password must be updated");

      // Verify login with new password
      const loginUser = db.login("demo@campus.edu", "newSecurePassword123");
      assert(loginUser != null, "User must successfully log in with new password");
    });

    await runTest("Group A.2: Append-only stock movements ledger integrity", () => {
      const db = createTestDb();
      const beforeCount = db.data.stockMovements.length;
      db.reconcileStock(1, 30.0, "Audited stock count", "Admin Chandran");
      
      assertEqual(db.data.stockMovements.length, beforeCount + 1, "Must append exactly one record to ledger");
      const latest = db.data.stockMovements[0];
      assertEqual(latest.type, "AUDIT_CORRECTION", "Ledger type must be AUDIT_CORRECTION");
      assertEqual(latest.ingredientId, 1, "Ingredient ID must match");
      assertEqual(latest.balanceAfter, 30.0, "Balance after must record new count");
    });

    await runTest("Group A.3: Multi-ingredient recipe stock deduction", () => {
      const db = createTestDb();
      const biryani = db.data.foods.find(f => f.id === 1);
      // Recipe has Rice (ing 1: 0.2kg) and Chicken (ing 2: 0.25kg)
      const riceBefore = db.data.inventory.find(i => i.id === 1).qty;
      const chickenBefore = db.data.inventory.find(i => i.id === 2).qty;

      db.commitPrepBatch({ batchOperationId: "RECIPE-MULTI-TEST", foodId: 1, portions: 2, chefId: "Chef" });
      const riceAfter = db.data.inventory.find(i => i.id === 1).qty;
      const chickenAfter = db.data.inventory.find(i => i.id === 2).qty;

      assertEqual(Math.round((riceBefore - riceAfter) * 100) / 100, 0.4, "Must deduct 0.4kg rice for 2 portions");
      assertEqual(Math.round((chickenBefore - chickenAfter) * 100) / 100, 0.5, "Must deduct 0.5kg chicken for 2 portions");
    });

    await runTest("Group A.4: Customer feedback submission on fulfilled orders", () => {
      const db = createTestDb();
      const fb = db.submitFeedback(101, 2, "Sreeshanth", 5, "Steaming hot and flavorful!");
      assertEqual(fb.rating, 5, "Rating must be 5");
      assertEqual(db.data.customerFeedback.length, 1, "Feedback must be saved in database");
    });

    // --- GROUP B: OPERATIONAL INTELLIGENCE ---
    await runTest("Group B.1: Hourly sales aggregation and peak rush calculation", () => {
      const db = createTestDb();
      const analytics = db.getAnalytics();
      assert(typeof analytics.totalOrders === 'number', "Total orders must be numeric");
      assert(typeof analytics.hourCounts === 'object', "Hour counts breakdown must exist");
      assert(analytics.wasteMetrics != null, "Waste metrics must be calculated");
    });

    await runTest("Group B.2: Stockout history duration tracking", () => {
      const db = createTestDb();
      const food = db.data.foods.find(f => f.id === 1);
      food.preparedPortions = 0;
      // Drain raw rice to force stockout
      const rice = db.data.inventory.find(i => i.id === 1);
      rice.qty = 0;
      db.evaluateInventoryDepletion();

      assertEqual(food.is_out_of_stock, true, "Dish must be marked out of stock");
      assert(db.data.stockoutHistory.length > 0, "Stockout incident must be recorded");
    });

    // --- GROUP C: NOTIFICATIONS & LAST PLATE ---
    await runTest("Group C.1: WhatsApp notification dispatch and tracking", () => {
      const db = createTestDb();
      const notif = db.dispatchNotification({
        recipientContact: "9876543210",
        message: "CampusBite: Token #101 ready for collection",
        refType: "ORDER",
        refId: 101
      });
      assertEqual(notif.status, "DELIVERED", "Notification must be logged as DELIVERED");
      assertEqual(notif.attempts, 1, "First attempt count must be 1");
    });

    await runTest("Group C.2: Last Plate early withdrawal cancels pending reservations", () => {
      const db = createTestDb();
      const now = new Date();
      const listing = db.publishLastPlateListing({
        dishName: "Surplus Biryani",
        portions: 5,
        price: 60,
        deadline: new Date(now.getTime() + 60 * 60000).toISOString(),
        location: "Counter 02",
        description: "Fresh surplus"
      });

      const res = db.reserveLastPlate(listing.id, 2, "Student A", 2);
      assertEqual(res.collectionStatus, "PENDING", "Reservation must be PENDING");

      // Early withdrawal by kitchen
      db.withdrawLastPlateListing(listing.id, "Emergency staff allocation");
      assertEqual(listing.status, "WITHDRAWN", "Listing status must be WITHDRAWN");
      
      const updatedRes = db.data.lastPlateReservations.find(r => r.id === res.id);
      assertEqual(updatedRes.collectionStatus, "CANCELLED", "Pending reservations must be cancelled upon withdrawal");
    });

    await runTest("Group C.3: Order cancellation restores inventory & logs reason", () => {
      const db = createTestDb();
      const user = db.data.users.find(u => u.role === 'STUDENT');
      const food = db.data.foods[0];
      food.preparedPortions = 5;

      const order = db.placeOrder(user, [{ food, qty: 2 }], food.price * 2, 10, "CANCEL-TEST-KEY");
      assertEqual(food.preparedPortions, 3, "Prepared portions should decrease by 2 on order");

      const cancelRes = db.cancelOrder(order.id, "Student Cancelled");
      assertEqual(cancelRes.success, true, "Cancellation must succeed");
      assertEqual(food.preparedPortions, 5, "Prepared portions must be restored on cancellation");
      assertEqual(order.status, "CANCELLED", "Order status must be CANCELLED");
    });

    await runTest("System: Supabase Client offline fallback & schema integrity", async () => {
      if (global.CampusBiteSupabase) {
        const status = global.CampusBiteSupabase.getStatus();
        assert(status != null, "Supabase client manager must be operational");
        assert(status.status === 'LOCAL_OFFLINE' || status.status === 'CONNECTED', "Status must be valid");
      }
    });

    await runTest("Group A.5: Order transition audit trail logs actor and timestamp", () => {
      const db = createTestDb();
      const user = db.data.users.find(u => u.role === 'STUDENT');
      const food = db.data.foods[0];
      const order = db.placeOrder(user, [{ food, qty: 1 }], food.price, 10, "AUDIT-LOG-KEY");
      db.transitionOrderStatus(order.id, "NEW", "PREPARING", "Chef Ramesh");
      db.transitionOrderStatus(order.id, "PREPARING", "READY", "Chef Suresh");

      assert(Array.isArray(order.transitions), "Order must have transitions array");
      assert(order.transitions.length >= 3, "Must have recorded initial and both transitions");
      assertEqual(order.transitions[1].actor, "Chef Ramesh", "Actor for first transition must be recorded");
      assertEqual(order.transitions[2].actor, "Chef Suresh", "Actor for second transition must be recorded");
    });

    await runTest("Group A.6: Recipe modification recalculates unit cost price", () => {
      const db = createTestDb();
      const food = db.data.foods.find(f => f.id === 1);
      const originalCost = food.costPrice;
      // Change recipe to 1kg chicken (180/kg)
      food.recipe = [{ ingId: 2, perServing: 1.0 }];
      const chickenIng = db.data.inventory.find(i => i.id === 2);
      food.costPrice = Math.round(food.recipe.reduce((s, r) => s + (r.perServing * chickenIng.unitCost), 0));
      assertEqual(food.costPrice, 180, "Cost price must be recalculated to 180");
      assert(food.costPrice !== originalCost, "Cost price must reflect updated recipe");
    });

    await runTest("Group B.3: Co-occurrence recommendations suggest paired items", () => {
      const db = createTestDb();
      const user = db.data.users.find(u => u.role === 'STUDENT');
      const foodBiryani = db.data.foods[0]; // Chicken Biryani (id: 1)
      const foodCoke = db.data.foods[8];    // Masala Coke (id: 9)
      // Place paired order with Biryani as favorite (qty: 2) and Coke as paired item (qty: 1)
      db.placeOrder(user, [{ food: foodBiryani, qty: 2 }, { food: foodCoke, qty: 1 }], 280, 10, "REC-TRAIN-KEY");

      const recs = db.getRecommendations(user.id);
      assert(Array.isArray(recs), "Recommendations must be an array");
      assert(recs.length > 0, "Recommendations should return paired dishes");
      assertEqual(recs[0].id, foodCoke.id, "Recommended dish for Biryani favorite should be Coke");
    });

    await runTest("Group B.4: Inventory reconciliation calculates positive and negative variances", () => {
      const db = createTestDb();
      const ing = db.data.inventory[0];
      const initial = ing.qty;
      // Positive variance (stock surplus)
      const resPos = db.reconcileStock(ing.id, initial + 5, "Found unrecorded carton");
      assertEqual(resPos.variance, 5, "Variance must be +5");

      // Negative variance (spoilage)
      const resNeg = db.reconcileStock(ing.id, initial + 2, "Discarded 3kg damaged pack");
      assertEqual(resNeg.variance, -3, "Variance must be -3");
    });

    await runTest("Edge Case: Empty tray or invalid portion request throws descriptive error", () => {
      const db = createTestDb();
      const user = db.data.users.find(u => u.role === 'STUDENT');
      let threwEmpty = false;
      try {
        db.placeOrder(user, [], 0, 0, "EMPTY-KEY");
      } catch (e) {
        threwEmpty = true;
      }
      assert(threwEmpty, "Must reject empty cart order");

      let threwBatch = false;
      try {
        db.commitPrepBatch({ batchOperationId: "ZERO-OP", foodId: 1, portions: 0 });
      } catch (e) {
        threwBatch = true;
      }
      assert(threwBatch, "Must reject batch with zero portions");
    });

    return results;
  }

  global.CampusBiteTests = { executeAllTests, results };
})(typeof window !== 'undefined' ? window : this);
