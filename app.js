/**
 * CampusBite — Smart Canteen & Digital Kitchen Operations
 * Authoritative Application Logic & Database Engine (v5.0)
 * Japanese Editorial × Bold Minimalism × Resilient Operations
 */
(function () {
  'use strict';

  const DB_KEY = 'campusbite_db_v5', SESSION_KEY = 'campusbite_session_v3';
  const $ = id => document.getElementById(id);
  const show = (el, v) => el && el.classList.toggle('hidden', !v);
  const escHtml = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  const FOOD_IMAGES = {
    1: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    2: "https://images.unsplash.com/photo-1642821373181-696a54913e9a?auto=format&fit=crop&w=800&q=80",
    3: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
    4: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    5: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    6: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80",
    7: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    8: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
    9: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
    10: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80",
    11: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
    12: "https://images.unsplash.com/photo-1601050690187-2481977e23b2?auto=format&fit=crop&w=800&q=80",
    13: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=800&q=80"
  };

  const DEFAULT_DB = {
    users: [
      { id: 1, name: "Canteen Admin", email: "admin@campus.edu", pw: "admin123", role: "ADMIN", studentId: null, facultyId: null, isActive: true },
      { id: 2, name: "Sreeshanth", email: "demo@campus.edu", pw: "student123", role: "STUDENT", studentId: "25R11A0501", facultyId: null, isActive: true },
      { id: 3, name: "Chandrashekar", email: "chandrashekar@campus.edu", pw: "student123", role: "FACULTY", studentId: null, facultyId: "FAC-CS-108", isActive: true },
      { id: 4, name: "Ramesh (Kitchen Chef)", email: "staff@campus.edu", pw: "staff123", role: "STAFF", studentId: null, facultyId: null, isActive: true }
    ],
    inventory: [
      { id: 1, ingredient: "Rice", qty: 24.0, unit: "kg", minQty: 3.0, unitCost: 45.0 },
      { id: 2, ingredient: "Chicken", qty: 10.0, unit: "kg", minQty: 2.0, unitCost: 180.0 },
      { id: 3, ingredient: "Paneer", qty: 4.0, unit: "kg", minQty: 1.5, unitCost: 320.0 },
      { id: 4, ingredient: "Bread & Buns", qty: 18.0, unit: "packs", minQty: 3.0, unitCost: 30.0 },
      { id: 5, ingredient: "Cooking Oil", qty: 12.0, unit: "L", minQty: 2.0, unitCost: 130.0 },
      { id: 6, ingredient: "Milk", qty: 14.0, unit: "L", minQty: 2.5, unitCost: 55.0 }
    ],
    foods: [
      {
        id: 1, name: "Chicken Biryani", desc: "Spiced basmati rice, tender chicken, caramelized onions & fresh mint aroma",
        price: 120, costPrice: 58.0, category: "Meals", prepMin: 12,
        is_paused_by_admin: false, pause_reason: null, paused_at: null,
        preparedPortions: 3, is_out_of_stock: false,
        recipe: [{ ingId: 1, perServing: 0.20 }, { ingId: 2, perServing: 0.25 }, { ingId: 5, perServing: 0.05 }],
        image: FOOD_IMAGES[1], dietary: "Non-Veg", batchSize: 4
      },
      {
        id: 2, name: "Veg Biryani", desc: "Long-grain basmati, saffron, garden vegetables & whole roasted spices",
        price: 90, costPrice: 38.0, category: "Meals", prepMin: 10,
        is_paused_by_admin: false, pause_reason: null, paused_at: null,
        preparedPortions: 2, is_out_of_stock: false,
        recipe: [{ ingId: 1, perServing: 0.20 }, { ingId: 5, perServing: 0.05 }],
        image: FOOD_IMAGES[2], dietary: "Veg", batchSize: 4
      },
      {
        id: 3, name: "Paneer Rice", desc: "Wok-tossed rice with fresh cottage cheese cubes & mild pepper seasoning",
        price: 100, costPrice: 46.0, category: "Meals", prepMin: 10,
        is_paused_by_admin: false, pause_reason: null, paused_at: null,
        preparedPortions: 0, is_out_of_stock: false,
        recipe: [{ ingId: 1, perServing: 0.20 }, { ingId: 3, perServing: 0.20 }, { ingId: 5, perServing: 0.05 }],
        image: FOOD_IMAGES[3], dietary: "Veg", batchSize: 4
      },
      {
        id: 4, name: "Veg Pizza", desc: "Crisp stone crust, molten mozzarella, bell peppers & oregano dusting",
        price: 90, costPrice: 42.0, category: "Snacks", prepMin: 14,
        is_paused_by_admin: false, pause_reason: null, paused_at: null,
        preparedPortions: 1, is_out_of_stock: false,
        recipe: [{ ingId: 4, perServing: 1.0 }, { ingId: 3, perServing: 0.10 }],
        image: FOOD_IMAGES[4], dietary: "Veg", batchSize: 2
      },
      {
        id: 5, name: "Chicken Burger", desc: "Crisp chicken patty, house sesame sauce & crisp iceberg lettuce",
        price: 80, costPrice: 36.0, category: "Snacks", prepMin: 8,
        is_paused_by_admin: false, pause_reason: null, paused_at: null,
        preparedPortions: 0, is_out_of_stock: false,
        recipe: [{ ingId: 4, perServing: 1.0 }, { ingId: 2, perServing: 0.15 }, { ingId: 5, perServing: 0.05 }],
        image: FOOD_IMAGES[5], dietary: "Non-Veg", batchSize: 4
      },
      {
        id: 6, name: "Masala Dosa", desc: "Golden paper-thin crepe, tempered potato mash & two stone-ground chutneys",
        price: 60, costPrice: 22.0, category: "Meals", prepMin: 8,
        is_paused_by_admin: false, pause_reason: null, paused_at: null,
        preparedPortions: 0, is_out_of_stock: false,
        recipe: [{ ingId: 1, perServing: 0.15 }, { ingId: 5, perServing: 0.05 }],
        image: FOOD_IMAGES[6], dietary: "Veg", batchSize: 3
      },
      {
        id: 7, name: "Samosa (2 pcs)", desc: "Hand-rolled golden flaky crust, spiced potato & green pea filling, mint relish",
        price: 25, costPrice: 10.0, category: "Snacks", prepMin: 3,
        is_paused_by_admin: false, pause_reason: null, paused_at: null,
        preparedPortions: 8, is_out_of_stock: false,
        recipe: [{ ingId: 5, perServing: 0.08 }],
        image: FOOD_IMAGES[7], dietary: "Veg", batchSize: 6
      },
      {
        id: 8, name: "French Fries", desc: "Crisp golden potato batons, tossed in fine sea salt",
        price: 50, costPrice: 18.0, category: "Snacks", prepMin: 6,
        is_paused_by_admin: false, pause_reason: null, paused_at: null,
        preparedPortions: 0, is_out_of_stock: false,
        recipe: [{ ingId: 5, perServing: 0.10 }],
        image: FOOD_IMAGES[8], dietary: "Veg", batchSize: 4
      },
      {
        id: 9, name: "Masala Coke", desc: "Chilled effervescent cola, roasted cumin, rock salt & fresh lime wedge",
        price: 40, costPrice: 15.0, category: "Drinks", prepMin: 2,
        is_paused_by_admin: false, pause_reason: null, paused_at: null,
        preparedPortions: 10, is_out_of_stock: false,
        recipe: [], image: FOOD_IMAGES[9], dietary: "Veg", batchSize: 6
      },
      {
        id: 10, name: "Cold Coffee", desc: "Slow-brewed dark roast espresso, chilled creamy milk, lightly sweet",
        price: 60, costPrice: 24.0, category: "Drinks", prepMin: 4,
        is_paused_by_admin: false, pause_reason: null, paused_at: null,
        preparedPortions: 4, is_out_of_stock: false,
        recipe: [{ ingId: 6, perServing: 0.20 }],
        image: FOOD_IMAGES[10], dietary: "Veg", batchSize: 4
      },
      {
        id: 11, name: "Lemon Tea", desc: "Piping hot Assam black tea infusion, freshly squeezed lemon & honey note",
        price: 20, costPrice: 6.0, category: "Drinks", prepMin: 3,
        is_paused_by_admin: false, pause_reason: null, paused_at: null,
        preparedPortions: 0, is_out_of_stock: false,
        recipe: [], image: FOOD_IMAGES[11], dietary: "Veg", batchSize: 4
      },
      {
        id: 12, name: "Gulab Jamun (2 pcs)", desc: "Warm melt-in-mouth milk dumplings soaked in cardamom rose syrup",
        price: 40, costPrice: 16.0, category: "Desserts", prepMin: 2,
        is_paused_by_admin: false, pause_reason: null, paused_at: null,
        preparedPortions: 6, is_out_of_stock: false,
        recipe: [{ ingId: 6, perServing: 0.10 }],
        image: FOOD_IMAGES[12], dietary: "Veg", batchSize: 6
      },
      {
        id: 13, name: "Ice Cream Scoop", desc: "Velvety Madagascar vanilla bean ice cream scoop in chilled bowl",
        price: 35, costPrice: 14.0, category: "Desserts", prepMin: 1,
        is_paused_by_admin: false, pause_reason: null, paused_at: null,
        preparedPortions: 5, is_out_of_stock: false,
        recipe: [{ ingId: 6, perServing: 0.10 }],
        image: FOOD_IMAGES[13], dietary: "Veg", batchSize: 6
      }
    ],
    batches: [],
    batchOperations: {},
    orders: [],
    nextOrderId: 101,
    stockMovements: [],
    idempotencyRecords: {},
    customerFeedback: [],
    stockoutHistory: [],
    prepCoachDecisions: [],
    notificationLogs: [],
    passwordResetTokens: {},
    lastPlateListings: [],
    lastPlateReservations: [],
    nextLastPlateId: 1,
    nextReservationId: 1
  };

  /**
   * Database: Transactional, idempotent, multi-entity store
   */
  class Database {
    constructor() { this.load(); }

    load() {
      try {
        const raw = localStorage.getItem(DB_KEY);
        this.data = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_DB));
        if (!this.data || typeof this.data !== 'object') throw new Error('Invalid DB');
      } catch (e) {
        this.data = JSON.parse(JSON.stringify(DEFAULT_DB));
        this.save();
      }

      // Schema migrations & defaults
      if (!Array.isArray(this.data.orders)) this.data.orders = [];
      if (!Array.isArray(this.data.foods) || !this.data.foods.length) this.data.foods = DEFAULT_DB.foods;
      else {
        this.data.foods.forEach(f => {
          if (!f.image && FOOD_IMAGES[f.id]) f.image = FOOD_IMAGES[f.id];
          if (typeof f.is_paused_by_admin !== 'boolean') f.is_paused_by_admin = false;
          if (typeof f.preparedPortions !== 'number') f.preparedPortions = 0;
          if (typeof f.is_out_of_stock !== 'boolean') f.is_out_of_stock = false;
          if (!Array.isArray(f.recipe)) {
            f.recipe = f.ingId ? [{ ingId: f.ingId, perServing: f.perServing || 0.2 }] : [];
          }
          if (!f.batchSize) f.batchSize = 4;
        });
      }
      if (!Array.isArray(this.data.inventory) || !this.data.inventory.length) this.data.inventory = DEFAULT_DB.inventory;
      if (!Array.isArray(this.data.users)) this.data.users = DEFAULT_DB.users;
      if (!Array.isArray(this.data.batches)) this.data.batches = [];
      if (!this.data.batchOperations) this.data.batchOperations = {};
      if (!Array.isArray(this.data.stockMovements)) this.data.stockMovements = [];
      if (!this.data.idempotencyRecords) this.data.idempotencyRecords = {};
      if (!Array.isArray(this.data.customerFeedback)) this.data.customerFeedback = [];
      if (!Array.isArray(this.data.stockoutHistory)) this.data.stockoutHistory = [];
      if (!Array.isArray(this.data.prepCoachDecisions)) this.data.prepCoachDecisions = [];
      if (!Array.isArray(this.data.notificationLogs)) this.data.notificationLogs = [];
      if (!this.data.passwordResetTokens) this.data.passwordResetTokens = {};
      if (!Array.isArray(this.data.lastPlateListings)) this.data.lastPlateListings = [];
      if (!Array.isArray(this.data.lastPlateReservations)) this.data.lastPlateReservations = [];
      if (!this.data.nextOrderId) this.data.nextOrderId = 101;
      if (!this.data.nextLastPlateId) this.data.nextLastPlateId = 1;
      if (!this.data.nextReservationId) this.data.nextReservationId = 1;

      this.evaluateInventoryDepletion();
      this.refreshListingStates();
    }

    save() {
      try {
        localStorage.setItem(DB_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.error("Storage error:", e);
      }
    }

    reset() {
      this.data = JSON.parse(JSON.stringify(DEFAULT_DB));
      this.save();
    }

    // =========================================================================
    // AUTHENTICATION & USERS (GROUP A: ROLES & RECOVERY)
    // =========================================================================
    login(idOrEmail, pw) {
      const term = (idOrEmail || '').trim().toLowerCase();
      return this.data.users.find(u => {
        const idMatch = (u.studentId && u.studentId.toLowerCase() === term) ||
                        (u.facultyId && u.facultyId.toLowerCase() === term);
        const emailMatch = u.email && u.email.toLowerCase() === term;
        return (idMatch || emailMatch) && u.pw === pw && u.isActive !== false;
      }) || null;
    }

    createPasswordResetToken(idOrEmail) {
      const term = (idOrEmail || '').trim().toLowerCase();
      const user = this.data.users.find(u => {
        const idMatch = (u.studentId && u.studentId.toLowerCase() === term) ||
                        (u.facultyId && u.facultyId.toLowerCase() === term);
        const emailMatch = u.email && u.email.toLowerCase() === term;
        return idMatch || emailMatch;
      });
      if (!user) throw new Error("No account registered with that Student ID or Email.");
      const token = Math.floor(100000 + Math.random() * 900000).toString();
      this.data.passwordResetTokens[token] = {
        userId: user.id,
        email: user.email,
        expiresAt: Date.now() + 15 * 60 * 1000 // 15 mins
      };
      this.save();
      return { token, email: user.email, userName: user.name };
    }

    resetPasswordWithToken(token, newPw) {
      const rec = this.data.passwordResetTokens[token];
      if (!rec) throw new Error("Invalid or expired password reset token.");
      if (Date.now() > rec.expiresAt) {
        delete this.data.passwordResetTokens[token];
        this.save();
        throw new Error("Password reset token has expired. Please request a new one.");
      }
      const user = this.data.users.find(u => u.id === rec.userId);
      if (!user) throw new Error("User record not found.");
      user.pw = newPw;
      delete this.data.passwordResetTokens[token];
      this.save();
      return user;
    }

    getUsers() { return this.data.users; }

    addUser(name, email, role, password, studentId = null, facultyId = null) {
      if (this.data.users.some(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
        throw new Error("An account with this email address already exists.");
      }
      const maxId = this.data.users.reduce((m, u) => Math.max(m, u.id), 0);
      const newUser = {
        id: maxId + 1,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        pw: password || "temp123",
        role: role.toUpperCase(),
        studentId: studentId ? studentId.trim() : null,
        facultyId: facultyId ? facultyId.trim() : null,
        isActive: true
      };
      this.data.users.push(newUser);
      this.save();
      return newUser;
    }

    // =========================================================================
    // DEFECT 6 FIX: SEPARATE PUBLIC DTO FROM ADMIN DATA (STOPS COST LEAKS)
    // =========================================================================
    toPublicFoodDTO(food) {
      const hasStock = food.preparedPortions > 0 || this.hasRawIngredients(food, 1);
      const isAvailable = !food.is_paused_by_admin && !food.is_out_of_stock && hasStock;
      let availabilityReason = 'AVAILABLE';
      if (food.is_paused_by_admin) availabilityReason = 'PAUSED_BY_ADMIN';
      else if (food.is_out_of_stock || !hasStock) availabilityReason = 'OUT_OF_STOCK';

      return {
        id: food.id,
        name: food.name,
        desc: food.desc,
        price: food.price,
        category: food.category,
        prepMin: food.prepMin,
        available: isAvailable,
        availabilityReason,
        isPausedByAdmin: Boolean(food.is_paused_by_admin),
        isOutOfStock: Boolean(food.is_out_of_stock),
        preparedPortionsAvailable: Math.max(0, food.preparedPortions || 0),
        dietary: food.dietary || 'Veg',
        image: food.image
        // NOTE: costPrice, perServing, recipe ingredients, and margins are strictly omitted!
      };
    }

    getPublicFoods() {
      this.evaluateInventoryDepletion();
      return this.data.foods.map(f => this.toPublicFoodDTO(f));
    }

    getAdminFoods() {
      this.evaluateInventoryDepletion();
      return this.data.foods;
    }

    // =========================================================================
    // DEFECT 5 FIX: ADMIN MENU PAUSE SURVIVES BATCH RECORDING & RESTOCK
    // =========================================================================
    setAdminMenuPause(foodId, isPaused, reason = "Paused by Canteen Management") {
      const food = this.data.foods.find(f => f.id === foodId);
      if (!food) throw new Error("Dish not found.");
      food.is_paused_by_admin = Boolean(isPaused);
      food.pause_reason = isPaused ? reason : null;
      food.paused_at = isPaused ? new Date().toISOString() : null;
      this.save();
      return food;
    }

    evaluateInventoryDepletion() {
      const now = new Date().toISOString();
      this.data.foods.forEach(f => {
        const canMakeOne = this.hasRawIngredients(f, 1);
        const wasOutOfStock = f.is_out_of_stock;
        f.is_out_of_stock = (f.preparedPortions <= 0 && !canMakeOne);

        // Record stockout trends (Group B)
        if (!wasOutOfStock && f.is_out_of_stock) {
          this.data.stockoutHistory.push({
            id: 'so-' + Date.now() + '-' + f.id,
            foodId: f.id,
            foodName: f.name,
            startedAt: now,
            resolvedAt: null,
            durationMins: null
          });
        } else if (wasOutOfStock && !f.is_out_of_stock) {
          const ev = this.data.stockoutHistory.find(e => e.foodId === f.id && !e.resolvedAt);
          if (ev) {
            ev.resolvedAt = now;
            ev.durationMins = Math.round((new Date(now) - new Date(ev.startedAt)) / 60000);
          }
        }
      });
    }

    hasRawIngredients(food, portions = 1) {
      if (!food.recipe || !food.recipe.length) return true;
      for (const item of food.recipe) {
        const ing = this.data.inventory.find(i => i.id === item.ingId);
        if (!ing || ing.qty < (item.perServing * portions)) return false;
      }
      return true;
    }

    // =========================================================================
    // DEFECT 1 FIX: PREP COACH IDEMPOTENT BATCHING & READONLY FORECASTING
    // =========================================================================
    forecastPrepBatches() {
      // PURE FORECAST CALCULATION: NO INVENTORY DEDUCTION OR BATCH COMMITS!
      const currentQueue = this.getActiveQueueCount();
      const hour = new Date().getHours();
      // Rush hour multipliers: lunch (11-14) and evening snacks (16-18)
      const isRush = (hour >= 11 && hour <= 14) || (hour >= 16 && hour <= 18);
      const demandFactor = isRush ? 1.6 : 1.0;

      return this.data.foods.map(f => {
        const ordersForFood = this.data.orders.filter(o => o.items.some(it => it.foodId === f.id)).length;
        const baselineSuggested = Math.max(2, Math.round((ordersForFood * 0.4 + 2) * demandFactor));
        const needed = Math.max(0, baselineSuggested - (f.preparedPortions || 0));
        const roundedBatch = Math.ceil(needed / (f.batchSize || 4)) * (f.batchSize || 4);

        // Calculate maximum portions supported by raw stock
        let maxPossible = 999;
        if (f.recipe && f.recipe.length) {
          f.recipe.forEach(r => {
            const ing = this.data.inventory.find(i => i.id === r.ingId);
            if (ing) {
              const possible = Math.floor(ing.qty / r.perServing);
              if (possible < maxPossible) maxPossible = possible;
            }
          });
        }
        const suggestedPortions = Math.min(roundedBatch, maxPossible > 0 ? maxPossible : 0);

        return {
          foodId: f.id,
          foodName: f.name,
          category: f.category,
          preparedReady: f.preparedPortions || 0,
          suggestedBatch: suggestedPortions,
          maxPossibleFromRawStock: maxPossible === 999 ? 'Unlimited' : maxPossible,
          isPausedByAdmin: Boolean(f.is_paused_by_admin)
        };
      });
    }

    commitPrepBatch({ batchOperationId, foodId, portions, chefId = 'STAFF' }) {
      if (!batchOperationId) throw new Error("A unique batchOperationId is required.");
      const p = parseInt(portions, 10);
      if (!Number.isInteger(p) || p <= 0) throw new Error("Portions must be a positive integer.");

      // IDEMPOTENCY CHECK: Submit same batch twice returns original result without re-deducting!
      if (this.data.batchOperations[batchOperationId]) {
        const existing = this.data.batchOperations[batchOperationId];
        return { success: true, batch: existing, isDuplicate: true };
      }

      const food = this.data.foods.find(f => f.id === foodId);
      if (!food) throw new Error("Dish not found.");

      // Check ingredient availability
      if (food.recipe && food.recipe.length) {
        for (const item of food.recipe) {
          const ing = this.data.inventory.find(i => i.id === item.ingId);
          const required = item.perServing * p;
          if (!ing || ing.qty < required) {
            throw new Error(`Insufficient stock for ingredient '${ing ? ing.ingredient : item.ingId}'. Needed: ${required}, Available: ${ing ? ing.qty : 0}`);
          }
        }

        // Deduct raw stock & write to append-only movements ledger
        for (const item of food.recipe) {
          const ing = this.data.inventory.find(i => i.id === item.ingId);
          const required = item.perServing * p;
          ing.qty = Math.max(0, Math.round((ing.qty - required) * 1000) / 1000);

          this.appendStockMovement({
            type: 'BATCH_PREPARATION',
            operationId: batchOperationId,
            refId: food.id,
            ingredientId: ing.id,
            qtyDelta: -required,
            balanceAfter: ing.qty,
            reason: `Prepared ${p} portions of ${food.name}`,
            actor: chefId
          });
        }
      }

      // Increment prepared portions pool (NOTE: Does NOT alter is_paused_by_admin!)
      food.preparedPortions = (food.preparedPortions || 0) + p;

      const batchRecord = {
        id: 'BATCH-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        batchOperationId,
        foodId: food.id,
        foodName: food.name,
        portions: p,
        portionsAvailable: p,
        status: 'PREPARED',
        timestamp: new Date().toISOString(),
        chefId
      };

      this.data.batches.unshift(batchRecord);
      this.data.batchOperations[batchOperationId] = batchRecord;

      // Track prep coach decision
      this.data.prepCoachDecisions.push({
        id: 'pcd-' + Date.now(),
        date: new Date().toISOString().slice(0, 10),
        hour: new Date().getHours(),
        foodId: food.id,
        foodName: food.name,
        forecastQty: p,
        committedQty: p,
        actualServed: 0
      });

      this.evaluateInventoryDepletion();
      this.save();
      return { success: true, batch: batchRecord, isDuplicate: false };
    }

    appendStockMovement({ type, operationId, refId, ingredientId, qtyDelta, balanceAfter, reason, actor }) {
      const movement = {
        id: 'SM-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
        timestamp: new Date().toISOString(),
        type,
        operationId: operationId || null,
        refId: refId || null,
        ingredientId,
        qtyDelta: Math.round(qtyDelta * 1000) / 1000,
        balanceAfter: Math.round(balanceAfter * 1000) / 1000,
        reason: reason || '',
        actor: actor || 'SYSTEM'
      };
      this.data.stockMovements.unshift(movement);
    }

    // =========================================================================
    // DEFECT 4 FIX: QUANTITY-AWARE TRAY ETA WITH PARTIAL PREPARED STOCK
    // =========================================================================
    calculateCartEta(cartItems) {
      if (!cartItems?.length) return 0;

      // Station categories & batch rules
      const stationMaxPrep = { "Meals": 0, "Snacks": 0, "Drinks": 0, "Desserts": 0 };
      let totalRemainingPortionsToCook = 0;
      let totalPortionsFromPrepared = 0;

      cartItems.forEach(item => {
        const food = this.data.foods.find(f => f.id === item.food.id) || item.food;
        const orderedQty = item.qty;
        const preparedAvail = food.preparedPortions || 0;

        // Q_remaining = max(0, Q_ordered - Q_allocated)
        const allocatedFromPrepared = Math.min(orderedQty, preparedAvail);
        const remainingToCook = Math.max(0, orderedQty - allocatedFromPrepared);

        totalPortionsFromPrepared += allocatedFromPrepared;
        totalRemainingPortionsToCook += remainingToCook;

        if (remainingToCook > 0) {
          const batchSize = food.batchSize || 4;
          const batchesNeeded = Math.ceil(remainingToCook / batchSize);
          const prepTimeForDish = batchesNeeded * (food.prepMin || 8);
          const st = food.category || "Meals";
          if (prepTimeForDish > (stationMaxPrep[st] || 0)) {
            stationMaxPrep[st] = prepTimeForDish;
          }
        }
      });

      // Stations operate in parallel: cooking time is max station time
      const maxCookingTimeAcrossStations = Math.max(...Object.values(stationMaxPrep));
      const queueBuffer = 2 * this.getActiveQueueCount();

      // If all portions are already prepared, assembly/plating is only 2 mins
      if (totalRemainingPortionsToCook === 0) {
        return Math.max(2, 2 + queueBuffer);
      }

      // Assembly buffer: 2 min base assembly + max station cook time + queue buffer
      const estimatedTotal = 2 + maxCookingTimeAcrossStations + queueBuffer;
      return Math.max(5, estimatedTotal);
    }

    getActiveQueueCount() {
      return this.data.orders.filter(o => o.status === 'NEW' || o.status === 'PREPARING' || o.status === 'ACCEPTED').length;
    }

    // =========================================================================
    // DEFECT 3 FIX: ORDER CREATION WITH IDEMPOTENCY KEY PROTECTION
    // =========================================================================
    placeOrder(user, cartItems, total, etaMin, idempotencyKey) {
      if (!cartItems?.length) throw new Error("Cannot place an empty order.");
      if (!idempotencyKey) throw new Error("Idempotency key is required for order submission.");

      // Check for duplicate submission using idempotency key
      if (this.data.idempotencyRecords[idempotencyKey]) {
        const cached = this.data.idempotencyRecords[idempotencyKey];
        return { ...cached.order, isDuplicateRetry: true };
      }

      const safeUser = user || { id: 2, name: "Sreeshanth" };
      const userId = Number(safeUser.id) || 2;
      const userName = safeUser.name || "Sreeshanth";

      // Validate stock & availability for all items before applying changes
      for (const item of cartItems) {
        const food = this.data.foods.find(f => f.id === item.food.id);
        if (!food) throw new Error(`Dish #${item.food.id} not found.`);
        if (food.is_paused_by_admin) {
          throw new Error(`'${food.name}' is currently paused by canteen management and cannot be ordered.`);
        }
        const prepared = food.preparedPortions || 0;
        const allocated = Math.min(item.qty, prepared);
        const remainingToCook = Math.max(0, item.qty - allocated);
        if (remainingToCook > 0 && !this.hasRawIngredients(food, remainingToCook)) {
          throw new Error(`Insufficient inventory to prepare remaining portions of '${food.name}'.`);
        }
      }

      // Apply inventory changes and portion allocation atomically
      for (const item of cartItems) {
        const food = this.data.foods.find(f => f.id === item.food.id);
        const prepared = food.preparedPortions || 0;
        const allocatedFromPrep = Math.min(item.qty, prepared);
        const remainingToCook = Math.max(0, item.qty - allocatedFromPrep);

        if (allocatedFromPrep > 0) {
          food.preparedPortions -= allocatedFromPrep;
          this.appendStockMovement({
            type: 'ORDER_FULFILMENT',
            operationId: idempotencyKey,
            refId: food.id,
            ingredientId: null,
            qtyDelta: -allocatedFromPrep,
            balanceAfter: food.preparedPortions,
            reason: `Allocated ${allocatedFromPrep} prepared portions to order`,
            actor: userName
          });
        }

        if (remainingToCook > 0 && food.recipe && food.recipe.length) {
          for (const r of food.recipe) {
            const ing = this.data.inventory.find(i => i.id === r.ingId);
            const req = r.perServing * remainingToCook;
            if (ing) {
              ing.qty = Math.max(0, Math.round((ing.qty - req) * 1000) / 1000);
              this.appendStockMovement({
                type: 'ORDER_FULFILMENT',
                operationId: idempotencyKey,
                refId: food.id,
                ingredientId: ing.id,
                qtyDelta: -req,
                balanceAfter: ing.qty,
                reason: `Cooked-to-order ${remainingToCook} portions of ${food.name}`,
                actor: userName
              });
            }
          }
        }
      }

      const orderId = Math.max(this.data.nextOrderId || 101, (this.data.orders || []).reduce((m, o) => Math.max(m, o.id), 100) + 1);
      this.data.nextOrderId = orderId + 1;
      const summary = cartItems.map(i => `${i.food.name} x${i.qty}`).join(", ");

      const newOrder = {
        id: orderId,
        idempotencyKey,
        userId,
        customerName: userName,
        items: cartItems.map(i => ({ foodId: i.food.id, name: i.food.name, qty: i.qty, price: i.food.price })),
        total: Number(total) || cartItems.reduce((s, i) => s + (i.food.price * i.qty), 0),
        status: "NEW",
        created: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        etaMin: Number(etaMin) || 10,
        summary,
        transitions: [
          { from: "NONE", to: "NEW", timestamp: new Date().toISOString(), actor: userName }
        ]
      };

      this.data.orders.unshift(newOrder);
      this.data.idempotencyRecords[idempotencyKey] = { order: newOrder, timestamp: new Date().toISOString() };

      // Dispatch simulated WhatsApp notification
      this.dispatchNotification({
        recipientContact: safeUser.email || 'student@campus.edu',
        message: `CampusBite: Token #${orderId} confirmed! ETA ~${newOrder.etaMin}m at Counter 01.`,
        refType: 'ORDER',
        refId: orderId
      });

      this.evaluateInventoryDepletion();
      this.save();
      return newOrder;
    }

    // =========================================================================
    // DEFECT 2 FIX: ATOMIC CONDITIONAL STATE TRANSITION ENFORCEMENT
    // =========================================================================
    transitionOrderStatus(orderId, expectedCurrentStatus, targetStatus, actor = "KITCHEN_STAFF") {
      const order = this.data.orders.find(o => o.id === orderId);
      if (!order) return { success: false, error: "Order not found" };

      // CONDITIONAL UPDATE CHECK: Must match expectedCurrentStatus
      if (order.status !== expectedCurrentStatus) {
        return {
          success: false,
          conflict: true,
          currentStatus: order.status,
          message: `Order #${orderId} has already moved to ${order.status}. Refreshing view.`
        };
      }

      // Valid state machine transitions
      const validTransitions = {
        "NEW": ["ACCEPTED", "PREPARING", "CANCELLED"],
        "ACCEPTED": ["PREPARING", "CANCELLED"],
        "PREPARING": ["READY"],
        "READY": ["COLLECTED", "EXPIRED"],
        "COLLECTED": [],
        "CANCELLED": [],
        "EXPIRED": []
      };

      const allowedNext = validTransitions[expectedCurrentStatus] || [];
      if (!allowedNext.includes(targetStatus)) {
        return {
          success: false,
          error: `Invalid state transition: Cannot advance order from '${expectedCurrentStatus}' directly to '${targetStatus}'.`
        };
      }

      order.status = targetStatus;
      order.updatedAt = new Date().toISOString();
      if (!Array.isArray(order.transitions)) order.transitions = [];
      order.transitions.push({
        from: expectedCurrentStatus,
        to: targetStatus,
        timestamp: new Date().toISOString(),
        actor
      });

      if (targetStatus === 'READY') {
        this.dispatchNotification({
          recipientContact: 'student@campus.edu',
          message: `CampusBite: Token #${order.id} is READY for collection at Counter 01! Steaming hot.`,
          refType: 'ORDER',
          refId: order.id
        });
      }

      this.save();
      return { success: true, order };
    }

    cancelOrder(orderId, actor = "CUSTOMER") {
      const order = this.data.orders.find(o => o.id === orderId);
      if (!order || (order.status !== 'NEW' && order.status !== 'ACCEPTED')) {
        return { success: false, error: "Only un-started orders can be cancelled." };
      }

      // Refund ingredients or portions
      order.items.forEach(it => {
        const food = this.data.foods.find(f => f.id === it.foodId);
        if (food) {
          food.preparedPortions = (food.preparedPortions || 0) + it.qty;
          this.appendStockMovement({
            type: 'ORDER_CANCELLATION',
            operationId: `CANCEL-${orderId}`,
            refId: food.id,
            ingredientId: null,
            qtyDelta: it.qty,
            balanceAfter: food.preparedPortions,
            reason: `Refunded portions from cancelled order #${orderId}`,
            actor
          });
        }
      });

      order.status = 'CANCELLED';
      order.updatedAt = new Date().toISOString();
      order.transitions.push({ from: 'NEW', to: 'CANCELLED', timestamp: new Date().toISOString(), actor });
      this.evaluateInventoryDepletion();
      this.save();
      return { success: true, order };
    }

    // =========================================================================
    // INVENTORY RECONCILIATION & AUDITED CORRECTIONS (GROUP A)
    // =========================================================================
    reconcileStock(ingredientId, actualCount, reason, actor = "ADMIN") {
      const ing = this.data.inventory.find(i => i.id === ingredientId);
      if (!ing) throw new Error("Ingredient not found.");
      const count = parseFloat(actualCount);
      if (isNaN(count) || count < 0) throw new Error("Actual count must be a non-negative number.");
      const variance = Math.round((count - ing.qty) * 1000) / 1000;
      ing.qty = count;

      this.appendStockMovement({
        type: 'AUDIT_CORRECTION',
        operationId: 'AUDIT-' + Date.now(),
        refId: ing.id,
        ingredientId: ing.id,
        qtyDelta: variance,
        balanceAfter: ing.qty,
        reason: reason || 'Physical inventory reconciliation',
        actor
      });

      this.evaluateInventoryDepletion();
      this.save();
      return { success: true, ingredient: ing, variance };
    }

    getStockMovements() { return this.data.stockMovements; }

    // =========================================================================
    // CUSTOMER FEEDBACK PORTAL (GROUP A & B)
    // =========================================================================
    submitFeedback(orderId, userId, userName, rating, comment) {
      const order = this.data.orders.find(o => o.id === orderId);
      const r = parseInt(rating, 10);
      if (!r || r < 1 || r > 5) throw new Error("Rating must be between 1 and 5.");
      const feedback = {
        id: 'FB-' + Date.now(),
        orderId,
        userId,
        userName,
        dishNames: order ? order.items.map(i => i.name).join(', ') : 'Order',
        rating: r,
        comment: (comment || '').trim(),
        timestamp: new Date().toISOString(),
        staffReply: null
      };
      this.data.customerFeedback.unshift(feedback);
      this.save();
      return feedback;
    }

    getFeedback() { return this.data.customerFeedback; }

    // =========================================================================
    // NOTIFICATION ENGINE WITH RETRIES (GROUP C)
    // =========================================================================
    dispatchNotification({ recipientContact, message, refType, refId }) {
      const log = {
        id: 'NOTIF-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        channel: 'WHATSAPP',
        recipientContact,
        message,
        refType,
        refId,
        status: 'DELIVERED',
        attempts: 1,
        timestamp: new Date().toISOString()
      };
      this.data.notificationLogs.unshift(log);
      this.save();
      return log;
    }

    resendNotification(notifId) {
      const log = this.data.notificationLogs.find(l => l.id === notifId);
      if (!log) throw new Error("Notification log not found.");
      log.attempts += 1;
      log.status = 'DELIVERED';
      log.timestamp = new Date().toISOString();
      this.save();
      return log;
    }

    // =========================================================================
    // ANALYTICS & OPERATIONAL INTELLIGENCE (GROUP B)
    // =========================================================================
    getAnalytics() {
      const completed = this.data.orders.filter(o => o.status === 'COLLECTED');
      const totalRev = completed.reduce((s, o) => s + o.total, 0);
      const avgTicket = completed.length ? Math.round(totalRev / completed.length) : 0;
      const itemCounts = {}, hourCounts = {};

      completed.forEach(o => o.items.forEach(it => itemCounts[it.name] = (itemCounts[it.name] || 0) + it.qty));
      this.data.orders.forEach(o => {
        const hr = new Date(o.created).getHours();
        const lbl = `${hr % 12 || 12} ${hr >= 12 ? 'PM' : 'AM'}`;
        hourCounts[lbl] = (hourCounts[lbl] || 0) + 1;
      });

      // Potential waste cost calculation
      const expiredListings = (this.data.lastPlateListings || []).filter(l => l.status === 'EXPIRED' || l.status === 'CLOSED');
      const totalWastedSurplusPortions = expiredListings.reduce((s, l) => s + (l.portionsRemaining || 0), 0);
      const estWasteCost = expiredListings.reduce((s, l) => s + (l.portionsRemaining * (l.price * 0.6)), 0);

      return {
        totalOrders: completed.length,
        totalRev,
        avgTicket,
        topDishes: Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
        hourCounts,
        wasteMetrics: {
          wastedPortions: totalWastedSurplusPortions,
          estWasteCost: Math.round(estWasteCost)
        }
      };
    }

    // =========================================================================
    // LAST PLATE SURPLUS & EARLY WITHDRAWAL (GROUP C)
    // =========================================================================
    refreshListingStates() {
      const now = new Date();
      (this.data.lastPlateListings || []).forEach(l => {
        if (l.status === 'ACTIVE' && new Date(l.deadline) <= now) l.status = 'EXPIRED';
      });
    }

    getLastPlateListings(includeAll) {
      this.refreshListingStates();
      if (includeAll) return this.data.lastPlateListings || [];
      return (this.data.lastPlateListings || []).filter(l => l.status === 'ACTIVE');
    }

    publishLastPlateListing({ dishName, price, portions, deadline, location, description }) {
      if (!dishName || !portions || !deadline || !location) throw new Error('All required fields must be provided.');
      const p = parseInt(portions, 10), pr = parseFloat(price);
      if (!Number.isInteger(p) || p <= 0) throw new Error('Portions must be a positive integer.');
      if (isNaN(pr) || pr < 0) throw new Error('Price cannot be negative.');
      const dl = new Date(deadline);
      if (isNaN(dl.getTime()) || dl <= new Date()) throw new Error('Collection deadline must be a valid future time.');
      const id = this.data.nextLastPlateId || 1;
      this.data.nextLastPlateId = id + 1;
      const listing = {
        id, dishName: String(dishName).trim(), price: pr, portions: p, portionsRemaining: p,
        deadline: dl.toISOString(), location: String(location).trim(),
        description: description ? String(description).trim() : '',
        status: 'ACTIVE', createdAt: new Date().toISOString(), isDemo: false
      };
      this.data.lastPlateListings.push(listing);
      this.save();
      return listing;
    }

    withdrawLastPlateListing(id, reason = "Withdrawn by Canteen Staff") {
      const l = (this.data.lastPlateListings || []).find(x => x.id === id);
      if (!l) throw new Error("Listing not found.");
      if (l.status === 'ACTIVE' || l.status === 'SOLD_OUT') {
        l.status = 'WITHDRAWN';
        l.withdrawalReason = reason;
        // Cancel pending reservations for this listing
        (this.data.lastPlateReservations || []).forEach(r => {
          if (r.listingId === id && r.collectionStatus === 'PENDING') {
            r.collectionStatus = 'CANCELLED';
          }
        });
        this.save();
        return l;
      }
      throw new Error(`Cannot withdraw listing in status ${l.status}`);
    }

    reserveLastPlate(listingId, userId, userName, qty) {
      this.refreshListingStates();
      const listing = (this.data.lastPlateListings || []).find(l => l.id === listingId);
      if (!listing) throw new Error('Listing not found.');
      if (listing.status !== 'ACTIVE') throw new Error(listing.status === 'SOLD_OUT' ? 'This listing is sold out.' : 'This listing is no longer active.');
      const q = parseInt(qty, 10);
      if (!Number.isInteger(q) || q <= 0) throw new Error('Quantity must be a positive integer.');
      if (q > listing.portionsRemaining) throw new Error(`Only ${listing.portionsRemaining} portion(s) remaining.`);

      listing.portionsRemaining -= q;
      if (listing.portionsRemaining === 0) listing.status = 'SOLD_OUT';

      const resId = this.data.nextReservationId || 1;
      this.data.nextReservationId = resId + 1;
      const token = 'LP-' + String(resId).padStart(3, '0') + String.fromCharCode(65 + Math.floor(Math.random() * 26));
      const reservation = {
        id: resId, listingId, userId: Number(userId), userName: String(userName),
        qty: q, token, reservedAt: new Date().toISOString(), collectionStatus: 'PENDING', collectedAt: null
      };
      this.data.lastPlateReservations.push(reservation);
      this.save();
      return reservation;
    }

    markReservationCollected(resId) {
      const res = (this.data.lastPlateReservations || []).find(r => r.id === resId);
      if (!res) throw new Error('Reservation not found.');
      if (res.collectionStatus === 'COLLECTED') return res;
      res.collectionStatus = 'COLLECTED';
      res.collectedAt = new Date().toISOString();
      this.save();
      return res;
    }

    getUserReservations(userId) {
      return (this.data.lastPlateReservations || []).filter(r => r.userId === Number(userId));
    }

    getLastPlateImpact() {
      const listings = this.data.lastPlateListings || [];
      const reservations = this.data.lastPlateReservations || [];
      const totalListed = listings.reduce((s, l) => s + l.portions, 0);
      const totalReserved = reservations.reduce((s, r) => s + r.qty, 0);
      const totalCollected = reservations.filter(r => r.collectionStatus === 'COLLECTED').reduce((s, r) => s + r.qty, 0);
      const unclaimed = listings.filter(l => l.status === 'EXPIRED' || l.status === 'CLOSED' || l.status === 'WITHDRAWN').reduce((s, l) => s + l.portionsRemaining, 0);
      return { totalListed, totalReserved, totalCollected, unclaimed, reservedNotCollected: totalReserved - totalCollected, listingCount: listings.length };
    }

    loadLastPlateSampleData() {
      if ((this.data.lastPlateListings || []).some(l => l.isDemo)) return false;
      const now = new Date();
      const samples = [
        { dishName: 'Chicken Biryani', price: 80, portions: 5, location: 'Counter 02', description: 'Prepared for lunch — aromatic basmati with tender chicken', deadline: new Date(now.getTime() + 45 * 60000).toISOString() },
        { dishName: 'Veg Fried Rice', price: 50, portions: 3, location: 'Counter 01', description: 'Wok-tossed with seasonal vegetables and soy glaze', deadline: new Date(now.getTime() + 30 * 60000).toISOString() },
        { dishName: 'Paneer Wrap', price: 65, portions: 4, location: 'Counter 02', description: 'Grilled paneer in whole-wheat wrap with mint chutney', deadline: new Date(now.getTime() + 60 * 60000).toISOString() }
      ];
      samples.forEach(s => {
        const id = this.data.nextLastPlateId || 1;
        this.data.nextLastPlateId = id + 1;
        this.data.lastPlateListings.push({ id, ...s, portionsRemaining: s.portions, status: 'ACTIVE', createdAt: now.toISOString(), isDemo: true });
      });
      this.save();
      return true;
    }

    clearLastPlateSampleData() {
      const demoIds = (this.data.lastPlateListings || []).filter(l => l.isDemo).map(l => l.id);
      this.data.lastPlateListings = (this.data.lastPlateListings || []).filter(l => !l.isDemo);
      this.data.lastPlateReservations = (this.data.lastPlateReservations || []).filter(r => !demoIds.includes(r.listingId));
      this.save();
    }

    getStudentFavourite(userId) {
      const orders = this.getOrders(userId);
      if (!orders.length) return null;
      const counts = {};
      orders.forEach(o => o.items.forEach(it => counts[it.foodId] = (counts[it.foodId] || 0) + it.qty));
      const favId = Number(Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, 0));
      return this.data.foods.find(f => f.id === favId) || null;
    }

    getRecommendations(userId) {
      const fav = this.getStudentFavourite(userId);
      if (!fav) return [];
      const pairCounts = {};
      this.data.orders.forEach(o => {
        const ids = o.items.map(it => it.foodId);
        if (ids.includes(fav.id)) {
          ids.filter(id => id !== fav.id).forEach(id => pairCounts[id] = (pairCounts[id] || 0) + 1);
        }
      });
      const sortedIds = Object.keys(pairCounts).sort((a, b) => pairCounts[b] - pairCounts[a]).slice(0, 3).map(Number);
      if (!sortedIds.length) {
        return this.getPublicFoods().filter(f => (f.category === 'Drinks' || f.category === 'Snacks') && f.id !== fav.id).slice(0, 3);
      }
      return sortedIds.map(id => this.toPublicFoodDTO(this.data.foods.find(f => f.id === id))).filter(f => f && f.available);
    }

    getOrders(userId = null) {
      if (userId !== null) {
        const uid = Number(userId);
        return this.data.orders.filter(o => Number(o.userId) === uid);
      }
      return this.data.orders;
    }

    getInventory() { return this.data.inventory; }
  }

  /**
   * CampusBiteApp: Presentation & UX Orchestrator
   */
  class CampusBiteApp {
    constructor() {
      this.db = new Database();
      this.currentUser = null;
      this.cart = [];
      this.currentCategory = 'All';
      this.activeStudentTab = 'menu';
      this.activeAdminTab = 'live';
      this.selectedDetailFood = null;
      this.detailQty = 1;
      this.pollTimer = null;
      this.lpQty = {};
      this._isPlacingOrder = false;
      this._reserving = false;
      this.feedbackRating = 5;
      this.activeFeedbackOrderId = null;
      this.init();
    }

    init() {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        try { this.currentUser = JSON.parse(saved); }
        catch { this.currentUser = null; }
      }
      this.setupSyncListener();
      this.render();
      this.startPolling();
    }

    setupSyncListener() {
      window.addEventListener('storage', e => {
        if (e.key === DB_KEY) {
          this.db.load();
          this.refreshCurrentView();
        }
      });
    }

    startPolling() {
      if (this.pollTimer) clearInterval(this.pollTimer);
      this.pollTimer = setInterval(() => {
        this.db.load();
        this.refreshCurrentView();
      }, 3000);
    }

    // =========================================================================
    // DEFECT 7 FIX: FIXED POSITION TOAST CONTAINER DOES NOT MOVE CONTENT
    // =========================================================================
    showToast(msg, type = 'info') {
      const container = $('toast-container');
      if (!container) return;
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      const icon = type === 'success' ? '✓' : type === 'warning' ? '⚠' : type === 'error' ? '✕' : 'ℹ';
      toast.innerHTML = `<span style="font-family:var(--font-mono);font-weight:700;">${icon}</span><span>${escHtml(msg)}</span>`;
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
        toast.style.transition = 'all 0.25s ease';
        setTimeout(() => toast.remove(), 250);
      }, 3500);
    }

    loginAsStudent() {
      const s = this.db.data.users.find(u => u.role === 'STUDENT') || { id: 2, name: "Sreeshanth", email: "demo@campus.edu", pw: "student123", role: "STUDENT", studentId: "25R11A0501" };
      this.currentUser = s;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
      this.activeStudentTab = 'menu';
      this.render();
      this.showToast(`Signed in as ${s.name} (Student)`, 'success');
    }

    loginAsFaculty() {
      const f = this.db.data.users.find(u => u.role === 'FACULTY') || { id: 3, name: "Chandrashekar", email: "chandrashekar@campus.edu", pw: "student123", role: "FACULTY", facultyId: "FAC-CS-108" };
      this.currentUser = f;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(f));
      this.activeStudentTab = 'menu';
      this.render();
      this.showToast(`Signed in as Prof. ${f.name} (Faculty)`, 'success');
    }

    loginAsAdmin() {
      const a = this.db.data.users.find(u => u.role === 'ADMIN') || { id: 1, name: "Canteen Admin", email: "admin@campus.edu", pw: "admin123", role: "ADMIN" };
      this.currentUser = a;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(a));
      this.activeAdminTab = 'live';
      this.render();
      this.showToast('Kitchen & Operations Dashboard active', 'success');
    }

    switchToAdminDashboard() { this.loginAsAdmin(); }
    switchToStudentPortal() { this.loginAsStudent(); }

    togglePortalRole() {
      if (!this.currentUser || this.currentUser.role === 'ADMIN' || this.currentUser.role === 'STAFF') {
        this.switchToStudentPortal();
      } else {
        this.switchToAdminDashboard();
      }
    }

    handleLogin(e) {
      if (e?.preventDefault) e.preventDefault();
      const id = $('login-id').value, pw = $('login-pw').value, err = $('login-error');
      const u = this.db.login(id, pw);
      if (!u) {
        err.innerText = 'Invalid credentials. Please verify your Student/Faculty ID or password.';
        err.classList.remove('hidden');
        return;
      }
      err.classList.add('hidden');
      this.currentUser = u;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(u));
      this.render();
      this.showToast(`Welcome back, ${u.name}`, 'success');
    }

    logout() {
      this.currentUser = null;
      sessionStorage.removeItem(SESSION_KEY);
      this.cart = [];
      this.render();
    }

    navigateHome() {
      if (!this.currentUser) return;
      if (this.currentUser.role === 'ADMIN' || this.currentUser.role === 'STAFF') this.switchAdminTab('live');
      else this.switchStudentTab('menu');
    }

    render() {
      const [vl, vs, va, uc, na] = [$('view-login'), $('view-student'), $('view-admin'), $('user-controls'), $('nav-actions')];
      if (!this.currentUser) {
        show(vl, true); show(vs, false); show(va, false); show(uc, false); show(na, false);
        return;
      }
      show(vl, false); show(uc, true); show(na, true);
      $('user-display-name').innerText = this.currentUser.name;
      const b = $('user-display-role');
      b.innerText = this.currentUser.role;
      b.className = `user-role-badge ${this.currentUser.role.toLowerCase()}`;
      $('user-avatar').innerText = this.currentUser.name.charAt(0);

      const sw = $('btn-toggle-portal'), tr = $('btn-tray-toggle');
      const isAdminOrStaff = this.currentUser.role === 'ADMIN' || this.currentUser.role === 'STAFF';
      sw.innerHTML = isAdminOrStaff ? `<span>&larr; CUSTOMER MENU</span>` : `<span>STAFF KITCHEN &rarr;</span>`;
      if (tr) show(tr, !isAdminOrStaff);

      if (isAdminOrStaff) {
        this.renderAdminNavigation(); show(vs, false); show(va, true); this.renderAdminPortal();
      } else {
        this.renderStudentNavigation(); show(vs, true); show(va, false);
        const titleEl = $('student-home-title');
        if (titleEl) titleEl.innerText = this.currentUser.role === 'FACULTY' ? "FACULTY LOUNGE DINING" : "WHAT'S FOR LUNCH?";
        this.renderStudentPortal();
      }
    }

    renderStudentNavigation() {
      const nav = $('nav-actions');
      const cnt = this.db.getOrders(this.currentUser.id).filter(o => o.status !== 'COLLECTED' && o.status !== 'CANCELLED').length;
      nav.innerHTML = `
        <button class="nav-link ${this.activeStudentTab === 'menu' ? 'active' : ''}" onclick="app.switchStudentTab('menu')"><span>DISCOVER / 01</span></button>
        <button class="nav-link ${this.activeStudentTab === 'orders' ? 'active' : ''}" onclick="app.switchStudentTab('orders')"><span>ORDERS / 02</span>${cnt ? `<span class="nav-count-pill">${cnt}</span>` : ''}</button>
        <button class="nav-link ${this.activeStudentTab === 'profile' ? 'active' : ''}" onclick="app.switchStudentTab('profile')"><span>PROFILE / 03</span></button>
      `;
    }

    renderAdminNavigation() {
      const tabs = [
        'live|KANBAN / 01',
        'menu|MENU & RECIPES / 02',
        'inv|INVENTORY / 03',
        'prep|PREP COACH / 04',
        'analytics|PERFORMANCE / 05',
        'lastplate|LAST PLATE / 06',
        'feedback|FEEDBACK / 07'
      ];
      $('nav-actions').innerHTML = tabs.map(p => {
        const [tab, lbl] = p.split('|');
        return `<button class="nav-link ${this.activeAdminTab === tab ? 'active' : ''}" onclick="app.switchAdminTab('${tab}')"><span>${lbl}</span></button>`;
      }).join('');
    }

    refreshCurrentView() {
      if (!this.currentUser) return;
      const isAdminOrStaff = this.currentUser.role === 'ADMIN' || this.currentUser.role === 'STAFF';
      if (isAdminOrStaff) {
        this.renderAdminNavigation();
        if (this.activeAdminTab === 'live') this.renderKanbanBoard();
        else if (this.activeAdminTab === 'menu') this.renderAdminMenu();
        else if (this.activeAdminTab === 'inv') this.renderInventory();
        else if (this.activeAdminTab === 'prep') this.renderPrepCoachAdmin();
        else if (this.activeAdminTab === 'analytics') this.renderAnalytics();
        else if (this.activeAdminTab === 'lastplate') this.renderLastPlateAdmin();
        else if (this.activeAdminTab === 'feedback') this.renderFeedbackAdmin();
      } else {
        this.renderStudentNavigation();
        this.renderMenuGrid();
        this.renderRecommendations();
        this.renderLastPlateStudent();
        this.renderCart();
        this.updateKitchenQueueIndicator();
        this.updateActiveOrdersBadge();
        if (this.activeStudentTab === 'orders') {
          this.renderStudentOrders();
          this.renderStudentLPReservations();
        } else if (this.activeStudentTab === 'profile') {
          this.renderStudentProfile();
        }
      }
    }

    switchStudentTab(tab) {
      this.activeStudentTab = tab;
      ['menu', 'orders', 'profile'].forEach(t => {
        $(`tab-btn-${t}`)?.classList.toggle('active', t === tab);
        show($(`section-${t}`), t === tab);
      });
      this.renderStudentNavigation();
      this.refreshCurrentView();
    }

    updateActiveOrdersBadge() {
      if (!this.currentUser) return;
      const cnt = this.db.getOrders(this.currentUser.id).filter(o => o.status !== 'COLLECTED' && o.status !== 'CANCELLED').length;
      const b = $('badge-active-orders');
      if (b) { b.innerText = cnt; show(b, cnt > 0); }
    }

    updateKitchenQueueIndicator() {
      const cnt = this.db.getActiveQueueCount(), el = $('kitchen-status-text');
      if (el) el.innerText = cnt > 0 ? `Kitchen active · ${cnt} orders queued` : `Kitchen ready · Immediate pickup`;
    }

    renderStudentPortal() {
      this.renderMenuGrid();
      this.renderRecommendations();
      this.renderLastPlateStudent();
      this.renderCart();
      this.updateKitchenQueueIndicator();
      this.updateActiveOrdersBadge();
      this.renderStudentOrders();
      this.renderStudentLPReservations();
      this.renderStudentProfile();
    }

    setCategory(cat, el) {
      this.currentCategory = cat;
      document.querySelectorAll('#category-chips .category-text-btn').forEach(c => c.classList.remove('active'));
      el?.classList.add('active');
      this.renderMenuGrid();
    }

    filterMenu() { this.renderMenuGrid(); }

    renderMenuGrid() {
      const g = $('food-grid');
      if (!g) return;
      const search = ($('food-search')?.value || '').toLowerCase().trim();
      // DEFECT 6 FIX: Strictly use public foods DTO (no costPrice / perServing exposed)
      const list = this.db.getPublicFoods().filter(f => {
        const catMatch = this.currentCategory === 'All' || f.category === this.currentCategory;
        const txtMatch = f.name.toLowerCase().includes(search) || f.desc.toLowerCase().includes(search);
        return catMatch && txtMatch;
      });

      if (!list.length) {
        g.innerHTML = `<div style="grid-column: 1 / -1; padding: 4rem 1rem; text-align: center; color: var(--muted);"><h3 style="font-family: var(--font-serif); font-size: 1.5rem; color: var(--ink); margin-bottom: 0.35rem;">No dishes found</h3><p style="font-size: 0.88rem;">Try searching for another dish or reset the category filter.</p></div>`;
        return;
      }

      g.innerHTML = list.map((f, idx) => {
        const isPaused = f.isPausedByAdmin;
        const isOutOfStock = f.isOutOfStock;
        let badgeTxt = 'ADD +';
        let badgeClass = 'available';
        if (isPaused) { badgeTxt = 'PAUSED'; badgeClass = 'paused'; }
        else if (!f.available) { badgeTxt = 'SOLD OUT'; badgeClass = 'out-of-stock'; }

        return `
          <div class="menu-item-editorial ${f.available ? '' : 'unavailable'}" onclick="app.openFoodDetail(${f.id})">
            <div class="menu-item-media">
              <span class="menu-item-index">${String(idx + 1).padStart(2, '0')}</span>
              <img src="${f.image || FOOD_IMAGES[f.id]}" alt="${escHtml(f.name)}" loading="lazy">
              <span class="menu-item-prep-tag">${f.prepMin} MIN</span>
              ${f.preparedPortionsAvailable > 0 ? `<span style="position:absolute;top:0.75rem;left:0.75rem;background:#15803d;color:#fff;font-family:var(--font-mono);font-size:0.65rem;font-weight:700;padding:0.15rem 0.45rem;border-radius:var(--radius-xs);">READY: ${f.preparedPortionsAvailable}</span>` : ''}
            </div>
            <div class="menu-item-content">
              <div class="menu-item-header">
                <h4 class="menu-item-name">${escHtml(f.name)}</h4>
                <span class="menu-item-price">₹${f.price}</span>
              </div>
              <p class="menu-item-desc">${escHtml(f.desc)}</p>
              <div class="menu-item-actions">
                <span class="category-micro-tag">${escHtml(f.category.toUpperCase())} · ${escHtml(f.dietary)}</span>
                <button class="btn btn-arrow" ${f.available ? '' : 'disabled'} onclick="event.stopPropagation(); app.addToCart(${f.id})">
                  <span>${badgeTxt}</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    renderRecommendations() {
      const [box, title, grid] = [$('recommendation-box'), $('rec-title'), $('rec-cards')];
      if (!box || !title || !grid) return;
      const fav = this.db.getStudentFavourite(this.currentUser.id);
      if (!fav) return show(box, false);
      const recs = this.db.getRecommendations(this.currentUser.id);
      if (!recs.length) return show(box, false);
      show(box, true);
      title.innerText = `BECAUSE YOU ORDERED ${fav.name.toUpperCase()}...`;
      grid.innerHTML = recs.map(f => `
        <div class="rec-item-card" onclick="app.addToCart(${f.id})">
          <img class="rec-item-img" src="${f.image || FOOD_IMAGES[f.id]}" alt="${escHtml(f.name)}">
          <div class="rec-item-info">
            <strong class="rec-item-name">${escHtml(f.name)}</strong>
            <div class="rec-item-meta">₹${f.price} · ${f.prepMin}m prep</div>
          </div>
          <button class="btn btn-secondary btn-xs" onclick="event.stopPropagation(); app.addToCart(${f.id})">+ ADD</button>
        </div>
      `).join('');
    }

    openFoodDetail(foodId) {
      const f = this.db.getPublicFoods().find(item => item.id === foodId);
      if (!f) return;
      this.selectedDetailFood = f;
      this.detailQty = 1;
      $('detail-food-img').src = f.image || FOOD_IMAGES[f.id];
      $('detail-food-category').innerText = `${f.category.toUpperCase()} · ${f.dietary.toUpperCase()}`;
      $('detail-food-name').innerText = f.name;
      $('detail-food-price').innerText = `₹${f.price}`;
      $('detail-food-prep').innerText = `${f.prepMin} MIN PREP`;
      $('detail-food-desc').innerText = f.desc;
      $('detail-food-qty').innerText = '1';

      const b = $('btn-detail-add');
      b.disabled = !f.available;
      if (f.isPausedByAdmin) {
        b.innerHTML = `<span>PAUSED BY KITCHEN</span>`;
      } else if (!f.available) {
        b.innerHTML = `<span>CURRENTLY SOLD OUT</span>`;
      } else {
        b.innerHTML = `<span>ADD TO TRAY — ₹${f.price} &rarr;</span>`;
      }
      show($('food-detail-modal'), true);
    }

    closeFoodDetail() {
      show($('food-detail-modal'), false);
      this.selectedDetailFood = null;
    }

    changeDetailQty(delta) {
      if (!this.selectedDetailFood) return;
      this.detailQty = Math.max(1, Math.min(10, this.detailQty + delta));
      $('detail-food-qty').innerText = this.detailQty;
      $('btn-detail-add').innerHTML = `<span>ADD TO TRAY — ₹${this.selectedDetailFood.price * this.detailQty} &rarr;</span>`;
    }

    addDetailToCart() {
      if (!this.selectedDetailFood?.available) return;
      const ex = this.cart.find(i => i.food.id === this.selectedDetailFood.id);
      if (ex) ex.qty = Math.min(10, ex.qty + this.detailQty);
      else this.cart.push({ food: this.selectedDetailFood, qty: this.detailQty });
      this.renderCart();
      this.closeFoodDetail();
      this.showToast(`Added ${this.selectedDetailFood.name} to tray`, 'success');
    }

    addToCart(foodId) {
      const f = this.db.getPublicFoods().find(item => item.id === foodId);
      if (!f?.available) {
        this.showToast(f?.isPausedByAdmin ? 'This dish is paused by kitchen' : 'Dish currently unavailable', 'warning');
        return;
      }
      const ex = this.cart.find(i => i.food.id === foodId);
      if (ex) { if (ex.qty < 10) ex.qty++; }
      else this.cart.push({ food: f, qty: 1 });
      this.renderCart();
      this.showToast(`Added ${f.name} to tray`, 'success');
    }

    changeCartQty(foodId, delta) {
      const idx = this.cart.findIndex(i => i.food.id === foodId);
      if (idx === -1) return;
      this.cart[idx].qty += delta;
      if (this.cart[idx].qty <= 0) this.cart.splice(idx, 1);
      this.renderCart();
    }

    clearCart() {
      this.cart = [];
      this.renderCart();
      this.showToast('Tray cleared', 'info');
    }

    scrollToTray() {
      $('student-tray-sidebar')?.scrollIntoView({ behavior: 'smooth' });
    }

    renderCart() {
      const [cont, foot, cp] = [$('cart-items'), $('cart-footer'), $('nav-tray-count')];
      if (!cont || !foot) return;
      const totalQty = this.cart.reduce((s, i) => s + i.qty, 0);
      if (cp) cp.innerText = totalQty;
      if (!this.cart.length) {
        cont.innerHTML = `<div class="tray-empty-editorial"><p>Your tray is empty.</p><small>Select dishes from today's menu to start ordering.</small></div>`;
        return show(foot, false);
      }
      show(foot, true);
      cont.innerHTML = this.cart.map(i => `
        <div class="tray-item-row">
          <div class="tray-item-info"><strong>${escHtml(i.food.name)}</strong><small>₹${i.food.price * i.qty} (₹${i.food.price} ea)</small></div>
          <div class="tray-stepper">
            <button class="btn-step" onclick="app.changeCartQty(${i.food.id}, -1)">&minus;</button>
            <span class="tray-stepper-val">${i.qty}</span>
            <button class="btn-step" onclick="app.changeCartQty(${i.food.id}, 1)">+</button>
          </div>
        </div>
      `).join('');

      const subtotal = this.cart.reduce((s, i) => s + (i.food.price * i.qty), 0);
      // DEFECT 4 FIX: Quantity-aware ETA calculation
      const eta = this.db.calculateCartEta(this.cart);
      $('bill-subtotal').innerText = `₹${subtotal}`;
      $('bill-total').innerText = `₹${subtotal}`;
      $('cart-eta-val').innerText = `~${eta} mins`;
      $('cart-eta-calc').innerText = `Quantities allocated from prepared warmer + fresh stove batches + queue`;
    }

    // =========================================================================
    // DEFECT 3 FIX: CLIENT-SIDE IDEMPOTENCY KEY GENERATION & DOUBLE-CLICK LOCK
    // =========================================================================
    placeOrder() {
      if (!this.cart.length) return this.showToast('Your tray is empty! Add dishes to place an order.', 'warning');
      if (this._isPlacingOrder) return;
      this._isPlacingOrder = true;

      const btn = $('btn-place-order');
      if (btn) { btn.disabled = true; btn.innerHTML = `<span>PROCESSING ORDER...</span>`; }

      const subtotal = this.cart.reduce((s, i) => s + (i.food.price * i.qty), 0);
      const eta = this.db.calculateCartEta(this.cart);
      const idempotencyKey = 'CB-ORD-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);

      try {
        const u = this.currentUser || { id: 2, name: "Sreeshanth", email: "demo@campus.edu", role: "STUDENT" };
        const order = this.db.placeOrder(u, this.cart, subtotal, eta, idempotencyKey);
        this.cart = [];
        this.renderCart();
        this.updateActiveOrdersBadge();
        this.switchStudentTab('orders');
        this.renderStudentOrders();
        this.renderStudentProfile();
        this.showToast(`Order #${order.id} confirmed & sent to kitchen`, 'success');
        this.showOrderModal(order);
      } catch (err) {
        this.showToast(err.message, 'error');
        this.db.load();
        this.renderMenuGrid();
      } finally {
        setTimeout(() => {
          this._isPlacingOrder = false;
          if (btn) { btn.disabled = false; btn.innerHTML = `<span>CONFIRM & PLACE ORDER &rarr;</span>`; }
        }, 600);
      }
    }

    showOrderModal(order) {
      $('modal-token-num').innerText = `#${order.id}`;
      $('modal-eta-val').innerText = `~${order.etaMin} minutes`;
      $('modal-total-val').innerText = `₹${order.total}`;
      show($('order-modal'), true);
    }

    dismissOrderModal() {
      show($('order-modal'), false);
      this.switchStudentTab('orders');
    }

    renderStudentOrders() {
      const cont = $('orders-list');
      if (!cont) return;
      const u = this.currentUser || { id: 2, name: "Sreeshanth" };
      const orders = this.db.getOrders(u.id);
      const active = orders.filter(o => o.status !== 'COLLECTED' && o.status !== 'CANCELLED');
      const past = orders.filter(o => o.status === 'COLLECTED' || o.status === 'CANCELLED');
      let html = '';

      if (this.cart.length) {
        const qty = this.cart.reduce((s, i) => s + i.qty, 0), tot = this.cart.reduce((s, i) => s + (i.food.price * i.qty), 0);
        html += `<div class="pending-tray-banner"><div class="pending-tray-info"><span class="pending-tray-badge">TRAY READY</span><h4>You have ${qty} dish${qty > 1 ? 'es' : ''} in your tray waiting to order</h4><p style="font-size: 0.88rem; color: var(--muted);">${this.cart.map(i => `${i.food.name} (x${i.qty})`).join(', ')} · <strong>Total: ₹${tot}</strong></p></div><button class="btn btn-primary btn-md" onclick="app.placeOrder()"><span>CONFIRM ORDER (₹${tot}) &rarr;</span></button></div>`;
      }

      if (!active.length && !past.length) {
        if (!this.cart.length) {
          html += `<div style="background: var(--bg-surface); border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 4rem 2rem; text-align: center;"><h3 style="font-family: var(--font-serif); font-size: 1.6rem; margin-bottom: 0.35rem;">No Orders Placed Yet</h3><p style="color: var(--muted); margin-bottom: 1.75rem; max-width: 440px; margin: 0 auto 1.75rem auto; font-size: 0.92rem;">You have no active meals in the kitchen queue. Choose a fresh dish from today's menu to place your first token.</p><button class="btn btn-primary btn-md" onclick="app.switchStudentTab('menu')"><span>DISCOVER MENU &rarr;</span></button></div>`;
        }
        cont.innerHTML = html;
        return;
      }

      const steps = [{ k: "NEW", l: "ORDERED" }, { k: "PREPARING", l: "PREPARING" }, { k: "READY", l: "READY" }, { k: "COLLECTED", l: "COLLECTED" }];

      if (active.length) {
        html += `<div style="margin-bottom: 2.5rem;"><span class="editorial-eyebrow" style="margin-bottom: 1rem;">ACTIVE KITCHEN TOKENS (${active.length})</span><div style="display: flex; flex-direction: column; gap: 1.5rem;">${active.map(o => {
          const cur = steps.findIndex(s => s.k === o.status), tStr = new Date(o.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return `
            <div class="order-ticket-card">
              <div class="order-ticket-header">
                <div>
                  <span class="order-token-badge">TOKEN #${o.id}</span>
                  <span class="order-meta-info">Placed at ${tStr} · ETA ~${o.etaMin}m</span>
                </div>
                <div style="display: flex; align-items: baseline; gap: 1.25rem;">
                  <span class="order-total-figure">₹${o.total}</span>
                  ${(o.status === 'NEW' || o.status === 'ACCEPTED') ? `<button class="btn btn-secondary btn-xs" style="color: var(--accent); border-color: var(--accent);" onclick="app.handleCancelOrder(${o.id})">Cancel</button>` : ''}
                </div>
              </div>
              <div class="order-timeline-stepper">
                ${steps.map((s, idx) => {
                  const cls = (idx < cur || o.status === 'COLLECTED') ? 'completed' : idx === cur ? 'current' : '';
                  const bChar = (idx < cur || o.status === 'COLLECTED') ? '✓' : idx === cur ? '●' : idx + 1;
                  return `<div class="timeline-node ${cls}"><div class="timeline-bullet">${bChar}</div><span class="timeline-label">${s.l}</span></div>`;
                }).join('')}
              </div>
              <div class="order-summary-box"><strong>Items:</strong> ${escHtml(o.summary)}</div>
              <div class="order-actions-bar">
                <span style="font-family: var(--font-mono); font-size: 0.74rem; font-weight: 600; color: ${o.status === 'READY' ? 'var(--success)' : 'var(--ink)'};">
                  ${o.status === 'NEW' ? 'Order accepted in kitchen queue' : o.status === 'PREPARING' ? 'Cooking on stove & assembly' : 'Ready for pickup at Counter 01'}
                </span>
                ${o.status === 'READY' ? `<button class="btn btn-primary btn-xs" onclick="app.collectDish(${o.id})"><span>COLLECT DISH ✓</span></button>` : ''}
              </div>
            </div>
          `;
        }).join('')}</div></div>`;
      }

      if (past.length) {
        html += `<div><span class="editorial-eyebrow" style="margin-bottom: 1rem;">PAST FULFILLED ORDERS (${past.length})</span><div style="display: flex; flex-direction: column; gap: 0.85rem;">${past.map(o => `
          <div class="history-item-row">
            <div>
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <strong style="font-family: var(--font-mono); font-size: 0.95rem;">#${o.id}</strong>
                <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--muted);">${new Date(o.created).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                <span style="font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; color: ${o.status === 'COLLECTED' ? 'var(--success)' : 'var(--accent)'}; background: ${o.status === 'COLLECTED' ? 'var(--success-subtle)' : 'rgba(224,76,56,0.1)'}; padding: 0.1rem 0.4rem; border-radius: var(--radius-xs);">${o.status}</span>
              </div>
              <small style="color: var(--muted); display: block; margin-top: 0.25rem;">${escHtml(o.summary)}</small>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <span style="font-family: var(--font-mono); font-weight: 700; font-size: 1.05rem;">₹${o.total}</span>
              ${o.status === 'COLLECTED' ? `<button class="btn btn-secondary btn-xs" onclick="app.openFeedbackModal(${o.id})">★ RATE</button>` : ''}
              <button class="btn btn-arrow" onclick="app.reorderItem(${o.id})">REORDER &rarr;</button>
            </div>
          </div>
        `).join('')}</div></div>`;
      }

      cont.innerHTML = html;
    }

    collectDish(id) {
      const res = this.db.transitionOrderStatus(id, 'READY', 'COLLECTED', this.currentUser?.name || 'STUDENT');
      if (res.success) {
        this.showToast(`Token #${id} collected! Added to your dining history.`, 'success');
        this.renderStudentOrders();
        this.renderStudentProfile();
        this.updateActiveOrdersBadge();
      } else {
        this.showToast(res.message || res.error, 'warning');
      }
    }

    handleCancelOrder(id) {
      if (confirm(`Cancel Order #${id}? Ingredients will be restored.`)) {
        const res = this.db.cancelOrder(id, this.currentUser?.name || 'STUDENT');
        if (res.success) {
          this.showToast(`Order #${id} cancelled`, 'info');
          this.renderStudentOrders();
          this.renderStudentProfile();
          this.updateActiveOrdersBadge();
        } else {
          this.showToast(res.error, 'error');
        }
      }
    }

    reorderItem(id) {
      const o = this.db.data.orders.find(item => item.id === id);
      if (!o?.items) return;
      o.items.forEach(it => {
        const f = this.db.getPublicFoods().find(food => food.id === it.foodId);
        if (f?.available) {
          const ex = this.cart.find(c => c.food.id === f.id);
          if (ex) ex.qty += it.qty; else this.cart.push({ food: f, qty: it.qty });
        }
      });
      this.renderCart();
      this.switchStudentTab('menu');
      this.scrollToTray();
      this.showToast(`Added dishes from Token #${id} to tray`, 'success');
    }

    renderStudentProfile() {
      const u = this.currentUser || { id: 2, name: "Sreeshanth", email: "demo@campus.edu", studentId: "25R11A0501", role: "STUDENT" };
      const orders = this.db.getOrders(u.id), spent = orders.filter(o => o.status === 'COLLECTED').reduce((s, o) => s + (Number(o.total) || 0), 0);
      const fav = this.db.getStudentFavourite(u.id);

      $('profile-micro-label').innerText = u.role === 'FACULTY' ? 'FACULTY OVERVIEW' : 'STUDENT OVERVIEW';
      $('profile-name').innerText = (u.name || "SREESHANTH").toUpperCase();
      $('stat-total-orders').innerText = orders.length;
      $('stat-total-spent').innerText = `₹${spent}`;
      $('stat-fav-dish').innerText = fav?.name || orders[0]?.items[0]?.name || '—';
      $('profile-roll').innerText = u.facultyId || u.studentId || 'N/A';
      $('profile-id-label').innerText = u.role === 'FACULTY' ? 'Faculty / Employee ID' : 'Roll / Student ID';
      $('profile-email').innerText = u.email || 'demo@campus.edu';
      $('profile-history-count').innerText = `${orders.length} Orders Placed`;

      const cont = $('profile-orders-list');
      if (!cont) return;
      if (!orders.length) {
        cont.innerHTML = `<div style="padding: 2.5rem 1rem; text-align: center; color: var(--muted);"><p style="font-size: 0.92rem;">No order history yet. Discover dishes in the menu to place your first token.</p></div>`;
      } else {
        cont.innerHTML = orders.map(o => `
          <div class="history-item-row">
            <div>
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <strong style="font-family: var(--font-mono);">#${o.id}</strong>
                <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--muted);">${new Date(o.created).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                <span style="font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; color: ${o.status === 'COLLECTED' ? 'var(--success)' : 'var(--accent)'};">${o.status}</span>
              </div>
              <small style="color: var(--muted); display: block; margin-top: 0.25rem;">${escHtml(o.summary)}</small>
            </div>
            <div style="display: flex; align-items: center; gap: 1.25rem;">
              <strong style="font-family: var(--font-mono); font-size: 1.05rem;">₹${o.total}</strong>
              <button class="btn btn-arrow" onclick="app.reorderItem(${o.id})">REORDER &rarr;</button>
            </div>
          </div>
        `).join('');
      }
    }

    switchAdminTab(tab) {
      this.activeAdminTab = tab;
      ['live', 'menu', 'inv', 'prep', 'analytics', 'lastplate', 'feedback'].forEach(t => {
        $(`admin-tab-${t}`)?.classList.toggle('active', t === tab);
        show($(`admin-sec-${t}`), t === tab);
      });
      this.renderAdminNavigation();
      this.refreshCurrentView();
    }

    renderAdminPortal() {
      this.renderKanbanBoard();
      this.renderAdminMenu();
      this.renderInventory();
      this.renderPrepCoachAdmin();
      this.renderAnalytics();
      this.renderLastPlateAdmin();
      this.renderFeedbackAdmin();
    }

    // =========================================================================
    // DEFECT 2 FIX: KANBAN ADVANCE ATOMIC TRANSITIONS (PREVENTS SKIPPING)
    // =========================================================================
    renderKanbanBoard() {
      const orders = this.db.getOrders();
      const [cn, cp, cr] = [$('col-orders-new'), $('col-orders-prep'), $('col-orders-ready')];
      if (!cn || !cp || !cr) return;

      const [n, p, r] = [
        orders.filter(o => o.status === 'NEW' || o.status === 'ACCEPTED'),
        orders.filter(o => o.status === 'PREPARING'),
        orders.filter(o => o.status === 'READY')
      ];

      $('count-new').innerText = n.length;
      $('count-prep').innerText = p.length;
      $('count-ready').innerText = r.length;

      cn.innerHTML = n.map(o => `
        <div class="kanban-ticket">
          <div class="ticket-top"><span class="ticket-token">#${o.id}</span><span class="ticket-cust">${escHtml(o.customerName)}</span></div>
          <div class="ticket-summary">${escHtml(o.summary)}</div>
          <div class="ticket-footer">
            <span class="ticket-price">₹${o.total}</span>
            <button class="btn btn-primary btn-xs" onclick="app.advanceKanbanOrder(${o.id}, '${o.status}', 'PREPARING')">
              <span>START COOKING &rarr;</span>
            </button>
          </div>
        </div>
      `).join('') || '<div style="color:var(--muted);font-family:var(--font-mono);font-size:0.75rem;text-align:center;padding:3rem 1rem;">NO PENDING ORDERS</div>';

      cp.innerHTML = p.map(o => `
        <div class="kanban-ticket">
          <div class="ticket-top"><span class="ticket-token">#${o.id}</span><span class="ticket-cust">${escHtml(o.customerName)}</span></div>
          <div class="ticket-summary">${escHtml(o.summary)}</div>
          <div class="ticket-footer">
            <span class="ticket-price">₹${o.total}</span>
            <button class="btn btn-primary btn-xs" onclick="app.advanceKanbanOrder(${o.id}, 'PREPARING', 'READY')">
              <span>MARK READY &rarr;</span>
            </button>
          </div>
        </div>
      `).join('') || '<div style="color:var(--muted);font-family:var(--font-mono);font-size:0.75rem;text-align:center;padding:3rem 1rem;">STOVE IS CLEAR</div>';

      cr.innerHTML = r.map(o => `
        <div class="kanban-ticket">
          <div class="ticket-top"><span class="ticket-token">#${o.id}</span><span class="ticket-cust">${escHtml(o.customerName)}</span></div>
          <div class="ticket-summary">${escHtml(o.summary)}</div>
          <div class="ticket-footer">
            <span class="ticket-price">₹${o.total}</span>
            <div style="display:flex;gap:0.4rem;">
              <button class="btn btn-ghost btn-xs" onclick="app.handleNoShowOrder(${o.id})">NO-SHOW</button>
              <button class="btn btn-primary btn-xs" onclick="app.advanceKanbanOrder(${o.id}, 'READY', 'COLLECTED')">
                <span>COLLECTED ✓</span>
              </button>
            </div>
          </div>
        </div>
      `).join('') || '<div style="color:var(--muted);font-family:var(--font-mono);font-size:0.75rem;text-align:center;padding:3rem 1rem;">COUNTER CLEARED</div>';
    }

    advanceKanbanOrder(orderId, expectedCurrentStatus, targetStatus) {
      const staffName = this.currentUser?.name || "KITCHEN_STAFF";
      const result = this.db.transitionOrderStatus(orderId, expectedCurrentStatus, targetStatus, staffName);
      if (result.success) {
        this.renderKanbanBoard();
        this.showToast(`Order #${orderId} moved to ${targetStatus}`, 'success');
      } else if (result.conflict) {
        this.showToast(result.message, 'warning');
        this.renderKanbanBoard();
      } else {
        this.showToast(result.error || 'Transition failed', 'error');
      }
    }

    handleNoShowOrder(orderId) {
      if (confirm(`Flag Order #${orderId} as NO-SHOW / Expired? Unclaimed portion will be logged.`)) {
        const res = this.db.transitionOrderStatus(orderId, 'READY', 'EXPIRED', 'KITCHEN_STAFF');
        if (res.success) {
          this.renderKanbanBoard();
          this.showToast(`Order #${orderId} marked as NO-SHOW`, 'info');
        } else {
          this.showToast(res.message || res.error, 'error');
        }
      }
    }

    // =========================================================================
    // DEFECT 5 FIX: ADMIN MENU AVAILABILITY & EXPLICIT PAUSE CONTROLS
    // =========================================================================
    renderAdminMenu() {
      const cont = $('admin-food-table');
      if (!cont) return;
      // Admin sees real food objects with cost & pause states
      cont.innerHTML = this.db.getAdminFoods().map(f => {
        const isPaused = Boolean(f.is_paused_by_admin);
        const marginPct = f.costPrice ? Math.round(((f.price - f.costPrice) / f.price) * 100) : 0;
        return `
          <div class="food-editor-row" style="display:flex;justify-content:space-between;align-items:center;padding:1rem 0;border-bottom:1px solid var(--line);">
            <div>
              <div style="display:flex;align-items:center;gap:0.5rem;">
                <strong style="font-size: 0.95rem;">${escHtml(f.name)}</strong>
                <span class="status-pill ${isPaused ? 'paused' : f.is_out_of_stock ? 'out-of-stock' : 'available'}">
                  ${isPaused ? '⏸ PAUSED' : f.is_out_of_stock ? '✕ OUT OF STOCK' : '● AVAILABLE'}
                </span>
                ${f.preparedPortions > 0 ? `<span style="font-family:var(--font-mono);font-size:0.68rem;background:var(--bg-surface);border:1px solid var(--line);padding:0.15rem 0.45rem;border-radius:2px;">Warmer: ${f.preparedPortions}</span>` : ''}
              </div>
              <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--muted); margin-top: 0.25rem;">
                Sell: ₹${f.price} · Cost: ₹${f.costPrice || 0} (${marginPct}% margin) · Prep: ${f.prepMin}m · ${f.category}
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:0.5rem;">
              <button class="btn btn-secondary btn-xs" onclick="app.openRecipeEditor(${f.id})">RECIPE</button>
              <button class="btn ${isPaused ? 'btn-primary' : 'btn-ghost'} btn-xs" onclick="app.toggleMenuPause(${f.id})">
                ${isPaused ? '▶ RESUME' : '⏸ PAUSE'}
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    toggleMenuPause(foodId) {
      const f = this.db.data.foods.find(item => item.id === foodId);
      if (!f) return;
      const willPause = !f.is_paused_by_admin;
      this.db.setAdminMenuPause(foodId, willPause, willPause ? 'Paused by kitchen operator' : null);
      this.renderAdminMenu();
      this.showToast(`${f.name} is now ${willPause ? 'PAUSED (Ordering disabled)' : 'RESUMED (Ordering enabled)'}`, willPause ? 'warning' : 'success');
    }

    handleAddNewFood(e) {
      e.preventDefault();
      const [name, price, prep, cat, desc] = [
        $('new-food-name').value.trim(),
        parseFloat($('new-food-price').value),
        parseInt($('new-food-prep').value, 10),
        $('new-food-cat').value,
        $('new-food-desc').value.trim()
      ];

      const maxId = this.db.data.foods.reduce((m, f) => Math.max(m, f.id), 0);
      const newFood = {
        id: maxId + 1,
        name,
        desc,
        price,
        costPrice: Math.round(price * 0.45),
        category: cat,
        prepMin: prep,
        is_paused_by_admin: false,
        pause_reason: null,
        paused_at: null,
        preparedPortions: 0,
        is_out_of_stock: false,
        recipe: [],
        batchSize: 4,
        dietary: (cat === 'Meals' && name.toLowerCase().includes('chicken')) ? 'Non-Veg' : 'Veg',
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
      };

      this.db.data.foods.push(newFood);
      this.db.save();
      e.target.reset();
      this.renderAdminMenu();
      this.showToast(`Added ${name} to canteen menu`, 'success');
    }

    // =========================================================================
    // DEFECT 1 & GROUP B: PREP COACH OPERATIONAL DASHBOARD
    // =========================================================================
    renderPrepCoachAdmin() {
      const cont = $('prep-coach-content');
      if (!cont) return;
      const forecast = this.db.forecastPrepBatches();

      cont.innerHTML = `
        <div class="canteen-editorial-header" style="margin-bottom:1.5rem;">
          <div>
            <span class="editorial-eyebrow">INTELLIGENT KITCHEN FORECASTING & IDEMPOTENT BATCHING</span>
            <h3 class="editorial-title" style="font-size:1.6rem;">Prep Coach Operations</h3>
            <p style="font-size:0.88rem;color:var(--muted);margin-top:0.25rem;">
              Suggestions predict dish demand based on rush hours, active queue, and warmer counts. 
              <strong>Forecasts are strictly read-only</strong>: ingredients are deducted only when batch preparation is explicitly confirmed.
            </p>
          </div>
        </div>

        <div class="prep-coach-grid">
          ${forecast.map(item => `
            <div class="prep-coach-card">
              <div class="prep-coach-header">
                <div>
                  <strong style="font-size:1.05rem;">${escHtml(item.foodName)}</strong>
                  <div style="font-family:var(--font-mono);font-size:0.72rem;color:var(--muted);">${item.category}</div>
                </div>
                <span class="status-pill ${item.isPausedByAdmin ? 'paused' : 'available'}">
                  ${item.isPausedByAdmin ? 'PAUSED' : 'ACTIVE'}
                </span>
              </div>
              <div class="prep-coach-metrics">
                <div class="prep-coach-metric">
                  <span>WARMER READY</span>
                  <strong style="color:var(--success);">${item.preparedReady}</strong>
                </div>
                <div class="prep-coach-metric">
                  <span>SUGGESTED</span>
                  <strong style="color:var(--accent);">${item.suggestedBatch}</strong>
                </div>
                <div class="prep-coach-metric">
                  <span>RAW CAPACITY</span>
                  <strong>${item.maxPossibleFromRawStock}</strong>
                </div>
              </div>
              <div class="prep-coach-action-box">
                <label style="font-family:var(--font-mono);font-size:0.75rem;">Portions:</label>
                <input type="number" id="batch-qty-${item.foodId}" class="prep-coach-qty-input" min="1" max="50" value="${item.suggestedBatch || 4}">
                <button class="btn btn-primary btn-sm" onclick="app.commitPrepBatch(${item.foodId})">
                  <span>COOK BATCH &rarr;</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="editorial-data-card" style="margin-top:2.5rem;">
          <div class="editorial-table-head">
            <h3>Recent Batch Preparation Ledger</h3>
            <span class="table-head-meta">Authoritative Preparation Records</span>
          </div>
          <div class="ledger-table-wrap">
            <table class="ledger-table">
              <thead>
                <tr>
                  <th>BATCH ID</th>
                  <th>DISH</th>
                  <th>COOKED</th>
                  <th>AVAILABLE</th>
                  <th>STATUS</th>
                  <th>TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                ${this.db.data.batches.slice(0, 10).map(b => `
                  <tr>
                    <td><strong>${b.id}</strong></td>
                    <td>${escHtml(b.foodName)}</td>
                    <td>${b.portions}</td>
                    <td>${b.portionsAvailable}</td>
                    <td><span class="status-pill available">${b.status}</span></td>
                    <td>${new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                `).join('') || '<tr><td colspan="6" style="text-align:center;padding:2rem;">No batches recorded yet today</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    commitPrepBatch(foodId) {
      const input = $(`batch-qty-${foodId}`);
      const qty = input ? parseInt(input.value, 10) : 4;
      const batchOpId = 'OP-PREP-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
      const chef = this.currentUser?.name || "Kitchen Chef";

      try {
        const result = this.db.commitPrepBatch({
          batchOperationId: batchOpId,
          foodId,
          portions: qty,
          chefId: chef
        });
        this.renderPrepCoachAdmin();
        this.renderAdminMenu();
        this.renderInventory();
        this.showToast(`Batch recorded: ${qty} portions of ${result.batch.foodName} added to warmer!`, 'success');
      } catch (err) {
        this.showToast(err.message, 'error');
      }
    }

    // =========================================================================
    // INVENTORY, RECONCILIATION & STOCK MOVEMENTS (GROUP A)
    // =========================================================================
    renderInventory() {
      const cont = $('inv-table-body');
      if (!cont) return;
      cont.innerHTML = this.db.getInventory().map(i => {
        const isLow = i.qty <= i.minQty;
        return `
          <div class="inv-stat-box ${isLow ? 'low-stock' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span class="inv-name">${escHtml(i.ingredient)}</span>
              <span style="font-family: var(--font-mono); font-size: 0.68rem; font-weight: 700; color: ${isLow ? 'var(--warning)' : 'var(--success)'};">
                ${isLow ? 'LOW STOCK' : 'GOOD'}
              </span>
            </div>
            <div class="inv-qty">${i.qty} <small style="font-size: 0.85rem; font-weight: 500;">${i.unit}</small></div>
            <div class="inv-meta">Min Threshold: ${i.minQty} ${i.unit} · ₹${i.unitCost || 0}/${i.unit}</div>
            <div style="margin-top:0.75rem;">
              <button class="btn btn-secondary btn-xs" onclick="app.openReconciliationModal(${i.id})">AUDIT RECONCILE</button>
            </div>
          </div>
        `;
      }).join('');
    }

    openReconciliationModal(ingId) {
      const ing = this.db.data.inventory.find(i => i.id === ingId);
      if (!ing) return;
      const modal = $('reconciliation-modal');
      if (!modal) return;
      $('recon-ing-id').value = ing.id;
      $('recon-ing-name').innerText = ing.ingredient;
      $('recon-current-qty').innerText = `${ing.qty} ${ing.unit}`;
      $('recon-actual-qty').value = ing.qty;
      $('recon-reason').value = 'Physical count verification';
      show(modal, true);
    }

    closeReconciliationModal() {
      show($('reconciliation-modal'), false);
    }

    handleReconciliationSubmit(e) {
      e.preventDefault();
      const ingId = parseInt($('recon-ing-id').value, 10);
      const actual = parseFloat($('recon-actual-qty').value);
      const reason = $('recon-reason').value;
      const actor = this.currentUser?.name || 'ADMIN';

      try {
        const res = this.db.reconcileStock(ingId, actual, reason, actor);
        this.closeReconciliationModal();
        this.renderInventory();
        this.showToast(`Stock updated: ${res.ingredient.ingredient} variance: ${res.variance > 0 ? '+' : ''}${res.variance} ${res.ingredient.unit}`, 'success');
      } catch (err) {
        this.showToast(err.message, 'error');
      }
    }

    openLedgerModal() {
      const modal = $('ledger-modal');
      const tableBody = $('ledger-modal-body');
      if (!modal || !tableBody) return;
      const movements = this.db.getStockMovements();
      tableBody.innerHTML = movements.slice(0, 30).map(m => {
        const ing = this.db.data.inventory.find(i => i.id === m.ingredientId);
        const deltaColor = m.qtyDelta > 0 ? 'var(--success)' : 'var(--accent)';
        return `
          <tr>
            <td><strong>${m.id}</strong></td>
            <td>${m.type}</td>
            <td>${ing ? ing.ingredient : 'Prepared Dish'}</td>
            <td style="color:${deltaColor};font-weight:700;">${m.qtyDelta > 0 ? '+' : ''}${m.qtyDelta}</td>
            <td>${m.balanceAfter}</td>
            <td>${escHtml(m.reason)}</td>
            <td>${escHtml(m.actor)}</td>
            <td>${new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
          </tr>
        `;
      }).join('') || '<tr><td colspan="8" style="text-align:center;padding:2rem;">No movement records yet</td></tr>';
      show(modal, true);
    }

    closeLedgerModal() {
      show($('ledger-modal'), false);
    }

    // =========================================================================
    // MULTI-INGREDIENT RECIPE EDITOR MODAL (GROUP A)
    // =========================================================================
    openRecipeEditor(foodId) {
      const food = this.db.data.foods.find(f => f.id === foodId);
      if (!food) return;
      const modal = $('recipe-editor-modal');
      if (!modal) return;
      $('recipe-food-id').value = food.id;
      $('recipe-food-name').innerText = food.name;

      const container = $('recipe-ingredients-list');
      container.innerHTML = (food.recipe || []).map((r, idx) => {
        const ing = this.db.data.inventory.find(i => i.id === r.ingId);
        return `
          <div class="recipe-row-item" style="display:flex;gap:0.75rem;align-items:center;margin-bottom:0.65rem;">
            <select class="form-input-box recipe-ing-select" style="flex:2;">
              ${this.db.data.inventory.map(i => `<option value="${i.id}" ${i.id === r.ingId ? 'selected' : ''}>${escHtml(i.ingredient)} (${i.unit})</option>`).join('')}
            </select>
            <input type="number" step="0.01" min="0.01" class="form-input-box recipe-ing-qty" value="${r.perServing}" style="flex:1;" placeholder="Amount">
            <button type="button" class="btn btn-ghost btn-xs" onclick="this.parentElement.remove()" style="color:var(--accent);">✕</button>
          </div>
        `;
      }).join('');
      show(modal, true);
    }

    addRecipeRow() {
      const container = $('recipe-ingredients-list');
      if (!container) return;
      const div = document.createElement('div');
      div.className = 'recipe-row-item';
      div.style = 'display:flex;gap:0.75rem;align-items:center;margin-bottom:0.65rem;';
      div.innerHTML = `
        <select class="form-input-box recipe-ing-select" style="flex:2;">
          ${this.db.data.inventory.map(i => `<option value="${i.id}">${escHtml(i.ingredient)} (${i.unit})</option>`).join('')}
        </select>
        <input type="number" step="0.01" min="0.01" class="form-input-box recipe-ing-qty" value="0.2" style="flex:1;" placeholder="Amount">
        <button type="button" class="btn btn-ghost btn-xs" onclick="this.parentElement.remove()" style="color:var(--accent);">✕</button>
      `;
      container.appendChild(div);
    }

    saveRecipeEditor() {
      const foodId = parseInt($('recipe-food-id').value, 10);
      const food = this.db.data.foods.find(f => f.id === foodId);
      if (!food) return;

      const rows = document.querySelectorAll('#recipe-ingredients-list .recipe-row-item');
      const newRecipe = [];
      rows.forEach(r => {
        const ingId = parseInt(r.querySelector('.recipe-ing-select').value, 10);
        const perServing = parseFloat(r.querySelector('.recipe-ing-qty').value);
        if (ingId && perServing > 0) {
          newRecipe.push({ ingId, perServing });
        }
      });

      food.recipe = newRecipe;
      // Recalculate raw cost price
      food.costPrice = Math.round(newRecipe.reduce((s, r) => {
        const ing = this.db.data.inventory.find(i => i.id === r.ingId);
        return s + (r.perServing * (ing?.unitCost || 0));
      }, 0) * 10) / 10;

      this.db.evaluateInventoryDepletion();
      this.db.save();
      this.closeRecipeEditor();
      this.renderAdminMenu();
      this.showToast(`Updated recipe for ${food.name}`, 'success');
    }

    closeRecipeEditor() {
      show($('recipe-editor-modal'), false);
    }

    // =========================================================================
    // CUSTOMER FEEDBACK SUBMISSION & REVIEW (GROUP A & B)
    // =========================================================================
    openFeedbackModal(orderId) {
      this.activeFeedbackOrderId = orderId;
      this.feedbackRating = 5;
      this.updateStarRatingDisplay();
      $('feedback-comment').value = '';
      show($('feedback-modal'), true);
    }

    closeFeedbackModal() {
      show($('feedback-modal'), false);
      this.activeFeedbackOrderId = null;
    }

    setFeedbackRating(val) {
      this.feedbackRating = val;
      this.updateStarRatingDisplay();
    }

    updateStarRatingDisplay() {
      document.querySelectorAll('#feedback-stars .feedback-star-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', idx < this.feedbackRating);
      });
    }

    submitFeedbackForm(e) {
      e.preventDefault();
      if (!this.activeFeedbackOrderId) return;
      const comment = $('feedback-comment').value;
      const u = this.currentUser || { id: 2, name: 'Student' };

      try {
        this.db.submitFeedback(this.activeFeedbackOrderId, u.id, u.name, this.feedbackRating, comment);
        this.closeFeedbackModal();
        this.showToast('Thank you for rating your dining experience!', 'success');
      } catch (err) {
        this.showToast(err.message, 'error');
      }
    }

    renderFeedbackAdmin() {
      const cont = $('admin-sec-feedback-content');
      if (!cont) return;
      const list = this.db.getFeedback();
      const avg = list.length ? (list.reduce((s, f) => s + f.rating, 0) / list.length).toFixed(1) : '5.0';

      cont.innerHTML = `
        <div class="analytics-metrics-editorial" style="margin-bottom:2rem;">
          <div class="editorial-stat-card"><span class="stat-desc">Total Reviews</span><span class="stat-num">${list.length}</span></div>
          <div class="editorial-stat-card"><span class="stat-desc">Average Rating</span><span class="stat-num">★ ${avg} / 5</span></div>
          <div class="editorial-stat-card"><span class="stat-desc">Customer Satisfaction</span><span class="stat-num">${Math.round((parseFloat(avg) / 5) * 100)}%</span></div>
        </div>

        <div class="editorial-data-card">
          <div class="editorial-table-head"><h3>Student Feedback Feed</h3><span class="table-head-meta">Verified Token Reviews</span></div>
          <div style="display:flex;flex-direction:column;gap:1rem;">
            ${list.map(f => `
              <div class="feedback-card-item">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.35rem;">
                  <div>
                    <strong>${escHtml(f.userName)}</strong>
                    <span style="font-family:var(--font-mono);font-size:0.72rem;color:var(--muted);margin-left:0.5rem;">Token #${f.orderId} · ${new Date(f.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <span style="color:#f59e0b;font-weight:700;font-size:0.95rem;">${'★'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}</span>
                </div>
                <p style="font-size:0.88rem;color:var(--ink);">${escHtml(f.comment) || '<em>No written comment provided</em>'}</p>
              </div>
            `).join('') || '<p style="color:var(--muted);padding:2rem;text-align:center;">No feedback reviews submitted yet.</p>'}
          </div>
        </div>
      `;
    }

    // =========================================================================
    // PERFORMANCE & OPERATIONAL INTELLIGENCE ANALYTICS
    // =========================================================================
    renderAnalytics() {
      const an = this.db.getAnalytics();
      $('an-total-orders').innerText = an.totalOrders;
      $('an-total-rev').innerText = `₹${an.totalRev}`;
      $('an-avg-ticket').innerText = `₹${an.avgTicket}`;

      const pc = $('chart-popular'), pk = $('chart-peak');
      if (pc) {
        const mx = an.topDishes.length ? Math.max(...an.topDishes.map(d => d[1])) : 1;
        pc.innerHTML = an.topDishes.map(d => `
          <div class="chart-bar-row">
            <div class="chart-bar-info"><span>${escHtml(d[0])}</span><span>${d[1]} orders</span></div>
            <div class="chart-track"><div class="chart-fill" style="width: ${(d[1] / mx) * 100}%;"></div></div>
          </div>
        `).join('') || '<p style="color:var(--muted);font-size:0.82rem;">No orders fulfilled yet</p>';
      }

      if (pk) {
        const hrs = Object.entries(an.hourCounts), mx = hrs.length ? Math.max(...hrs.map(h => h[1])) : 1;
        pk.innerHTML = hrs.map(h => `
          <div class="chart-bar-row">
            <div class="chart-bar-info"><span>${h[0]}</span><span>${h[1]} orders</span></div>
            <div class="chart-track"><div class="chart-fill" style="width: ${(h[1] / mx) * 100}%;"></div></div>
          </div>
        `).join('') || '<p style="color:var(--muted);font-size:0.82rem;">No orders registered today</p>';
      }

      const wasteEl = $('analytics-waste-card');
      if (wasteEl) {
        wasteEl.innerHTML = `
          <div class="editorial-stat-card"><span class="stat-desc">Unclaimed Surplus Portions</span><span class="stat-num">${an.wasteMetrics.wastedPortions}</span></div>
          <div class="editorial-stat-card"><span class="stat-desc">Potential Waste Cost</span><span class="stat-num">₹${an.wasteMetrics.estWasteCost}</span></div>
          <div class="editorial-stat-card"><span class="stat-desc">Stockout Incidents Logged</span><span class="stat-num">${this.db.data.stockoutHistory.length}</span></div>
        `;
      }
    }

    placeTestOrder() {
      const foods = this.db.getPublicFoods().filter(f => f.available);
      if (!foods.length) return this.showToast('No dishes currently available to test', 'warning');
      const rf = foods[Math.floor(Math.random() * foods.length)];
      const student = this.db.data.users.find(u => u.role === 'STUDENT') || this.currentUser;
      const tc = [{ food: rf, qty: 1 }];
      const eta = this.db.calculateCartEta(tc);
      const testKey = 'TEST-ORD-' + Date.now();

      try {
        const o = this.db.placeOrder(student, tc, rf.price, eta, testKey);
        this.renderKanbanBoard();
        this.showToast(`Simulated test order #${o.id} sent to kitchen queue`, 'success');
      } catch (err) {
        this.showToast(err.message, 'error');
      }
    }

    resetDbPrompt() {
      if (confirm('Reset database back to factory demo state? All orders and audit logs will be refreshed.')) {
        this.db.reset();
        this.cart = [];
        this.render();
        this.showToast('Database reset to pristine defaults', 'info');
      }
    }

    // =========================================================================
    // LAST PLATE: SURPLUS MEALS & EARLY WITHDRAWAL (GROUP C)
    // =========================================================================
    renderLastPlateStudent() {
      const grid = $('last-plate-grid');
      const section = $('last-plate-student');
      if (!grid || !section) return;
      this.db.refreshListingStates();
      const allListings = this.db.data.lastPlateListings || [];
      const visible = allListings.filter(l => l.status === 'ACTIVE' || l.status === 'SOLD_OUT');
      if (!visible.length) { show(section, false); return; }
      show(section, true);
      const now = new Date();

      grid.innerHTML = visible.map(l => {
        const deadline = new Date(l.deadline);
        const minsLeft = Math.max(0, Math.floor((deadline - now) / 60000));
        const timeStr = deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isActive = l.status === 'ACTIVE';
        const curQty = this.lpQty[l.id] || 1;
        return `
          <div class="lp-listing-card ${isActive ? '' : 'lp-listing-inactive'}">
            <div class="lp-card-header">
              <h4 class="lp-card-name">${escHtml(l.dishName)}</h4>
              <span class="lp-status-badge lp-status-${l.status.toLowerCase()}">${l.status.replace('_', ' ')}</span>
            </div>
            ${l.description ? `<p class="lp-card-desc">${escHtml(l.description)}</p>` : ''}
            <div class="lp-card-details">
              <div class="lp-card-detail"><span class="lp-detail-label">PRICE</span><strong>₹${l.price}/portion</strong></div>
              <div class="lp-card-detail"><span class="lp-detail-label">AVAILABLE</span><strong>${l.portionsRemaining} of ${l.portions}</strong></div>
              <div class="lp-card-detail"><span class="lp-detail-label">COLLECT BY</span><strong>${timeStr}</strong></div>
              <div class="lp-card-detail"><span class="lp-detail-label">PICKUP</span><strong>${escHtml(l.location)}</strong></div>
            </div>
            ${isActive ? `
              <div class="lp-card-footer">
                <div class="lp-card-ready-badge">✓ READY FOR PICKUP${minsLeft > 0 ? ` · ${minsLeft} min left` : ''}</div>
                <div class="lp-card-actions">
                  <div class="tray-stepper">
                    <button class="btn-step" onclick="event.stopPropagation(); app.changeLpQty(${l.id}, -1)">−</button>
                    <span id="lp-qty-${l.id}" class="tray-stepper-val">${curQty}</span>
                    <button class="btn-step" onclick="event.stopPropagation(); app.changeLpQty(${l.id}, 1)">+</button>
                  </div>
                  <button class="btn btn-primary btn-sm" onclick="app.handleReserveLastPlate(${l.id})"><span>RESERVE →</span></button>
                </div>
              </div>
            ` : `<div class="lp-card-closed-notice">${l.status === 'SOLD_OUT' ? 'All portions have been reserved' : 'Collection window has closed'}</div>`}
          </div>
        `;
      }).join('');
    }

    changeLpQty(listingId, delta) {
      const listing = (this.db.data.lastPlateListings || []).find(l => l.id === listingId);
      if (!listing || listing.status !== 'ACTIVE') return;
      const current = this.lpQty[listingId] || 1;
      this.lpQty[listingId] = Math.max(1, Math.min(listing.portionsRemaining, current + delta));
      const el = $(`lp-qty-${listingId}`);
      if (el) el.innerText = this.lpQty[listingId];
    }

    handleReserveLastPlate(listingId) {
      if (this._reserving) return;
      this._reserving = true;
      try {
        const qty = this.lpQty[listingId] || 1;
        const u = this.currentUser || { id: 2, name: 'Sreeshanth' };
        const reservation = this.db.reserveLastPlate(listingId, u.id, u.name, qty);
        const listing = (this.db.data.lastPlateListings || []).find(l => l.id === listingId);
        this.lpQty[listingId] = 1;
        this.renderLastPlateStudent();
        this.showLastPlateModal(reservation, listing);
        this.showToast(`Reserved ${qty} portion(s) — Token: ${reservation.token}`, 'success');
      } catch (err) {
        this.showToast(err.message, 'error');
      } finally {
        setTimeout(() => { this._reserving = false; }, 500);
      }
    }

    showLastPlateModal(res, listing) {
      $('lp-modal-token').innerText = res.token;
      $('lp-modal-dish').innerText = listing ? listing.dishName : 'Last Plate';
      $('lp-modal-qty').innerText = `${res.qty} portion(s)`;
      $('lp-modal-total').innerText = listing ? `₹${listing.price * res.qty}` : '—';
      $('lp-modal-location').innerText = listing ? listing.location : '—';
      $('lp-modal-deadline').innerText = listing ? new Date(listing.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
      show($('lp-reservation-modal'), true);
    }

    dismissLastPlateModal() {
      show($('lp-reservation-modal'), false);
      this.switchStudentTab('orders');
    }

    renderStudentLPReservations() {
      const cont = $('lp-student-reservations');
      if (!cont) return;
      const u = this.currentUser || { id: 2 };
      const lpRes = this.db.getUserReservations(u.id);
      if (!lpRes.length) { cont.innerHTML = ''; return; }
      cont.innerHTML = `
        <div style="margin-top: 2.5rem;">
          <span class="editorial-eyebrow" style="margin-bottom: 1rem;">LAST PLATE RESERVATIONS (${lpRes.length})</span>
          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            ${lpRes.map(r => {
              const listing = (this.db.data.lastPlateListings || []).find(l => l.id === r.listingId);
              const dlStr = listing ? new Date(listing.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
              return `
                <div class="history-item-row">
                  <div>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <strong style="font-family: var(--font-mono); font-size: 0.95rem;">${escHtml(r.token)}</strong>
                      <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--muted);">${new Date(r.reservedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      <span class="lp-status-badge lp-status-${r.collectionStatus.toLowerCase()}">${r.collectionStatus}</span>
                    </div>
                    <small style="color: var(--muted); display: block; margin-top: 0.25rem;">${listing ? escHtml(listing.dishName) : 'Unknown'} × ${r.qty} · Collect by ${dlStr}${listing ? ' · ' + escHtml(listing.location) : ''}</small>
                  </div>
                  <div style="display: flex; align-items: center; gap: 1.25rem;">
                    <strong style="font-family: var(--font-mono); font-size: 1.05rem;">${listing ? '₹' + (listing.price * r.qty) : '—'}</strong>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    renderLastPlateAdmin() {
      const listingsEl = $('lp-admin-listings');
      const resEl = $('lp-admin-reservations');
      const impactEl = $('lp-impact-stats');
      const resCountEl = $('lp-res-count');
      if (!listingsEl) return;
      this.db.refreshListingStates();
      const listings = this.db.data.lastPlateListings || [];
      const reservations = this.db.data.lastPlateReservations || [];

      if (!listings.length) {
        listingsEl.innerHTML = '<div style="padding: 2rem 1rem; text-align: center; color: var(--muted);"><p style="font-size: 0.92rem;">No listings yet. Publish your first Last Plate listing.</p></div>';
      } else {
        listingsEl.innerHTML = listings.map(l => {
          const res = reservations.filter(r => r.listingId === l.id);
          const collected = res.filter(r => r.collectionStatus === 'COLLECTED').reduce((s, r) => s + r.qty, 0);
          const pending = res.filter(r => r.collectionStatus === 'PENDING').reduce((s, r) => s + r.qty, 0);
          const dlStr = new Date(l.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return `
            <div class="food-editor-row">
              <div>
                <strong style="font-size: 0.92rem;">${escHtml(l.dishName)}${l.isDemo ? ' <span class="lp-demo-tag">SAMPLE</span>' : ''}</strong>
                <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--muted); margin-top: 0.15rem;">₹${l.price} · ${l.portionsRemaining}/${l.portions} left · By ${dlStr} · ${escHtml(l.location)}</div>
                <div style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--muted); margin-top: 0.1rem;">Reserved: ${pending + collected} · Collected: ${collected} · Pending pickup: ${pending}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="lp-status-badge lp-status-${l.status.toLowerCase()}">${l.status.replace('_', ' ')}</span>
                ${(l.status === 'ACTIVE' || l.status === 'SOLD_OUT') ? `<button class="btn btn-ghost btn-xs" onclick="app.handleWithdrawLastPlateListing(${l.id})">WITHDRAW</button>` : ''}
              </div>
            </div>
          `;
        }).join('');
      }

      if (resCountEl) resCountEl.innerText = `${reservations.length} Reservations`;
      if (resEl) {
        if (!reservations.length) {
          resEl.innerHTML = '<div style="padding: 2rem 1rem; text-align: center; color: var(--muted);"><p style="font-size: 0.92rem;">No reservations yet.</p></div>';
        } else {
          resEl.innerHTML = reservations.map(r => {
            const listing = listings.find(l => l.id === r.listingId);
            return `
              <div class="food-editor-row">
                <div>
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <strong style="font-family: var(--font-mono); font-size: 0.88rem;">${escHtml(r.token)}</strong>
                    <span style="font-size: 0.82rem;">${escHtml(r.userName)}</span>
                    <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--muted);">${new Date(r.reservedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <small style="color: var(--muted); display: block; margin-top: 0.15rem;">${listing ? escHtml(listing.dishName) : 'Unknown'} × ${r.qty} portion(s)</small>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span class="lp-status-badge lp-status-${r.collectionStatus.toLowerCase()}">${r.collectionStatus}</span>
                  ${r.collectionStatus === 'PENDING' ? `<button class="btn btn-primary btn-xs" onclick="app.handleMarkCollected(${r.id})"><span>COLLECTED ✓</span></button>` : ''}
                </div>
              </div>
            `;
          }).join('');
        }
      }

      if (impactEl) {
        const impact = this.db.getLastPlateImpact();
        impactEl.innerHTML = `
          <div class="editorial-stat-card"><span class="stat-desc">Portions Listed</span><span class="stat-num">${impact.totalListed}</span></div>
          <div class="editorial-stat-card"><span class="stat-desc">Portions Reserved</span><span class="stat-num">${impact.totalReserved}</span></div>
          <div class="editorial-stat-card"><span class="stat-desc">Portions Collected</span><span class="stat-num">${impact.totalCollected}</span></div>
          <div class="editorial-stat-card"><span class="stat-desc">Unclaimed / Withdrawn</span><span class="stat-num">${impact.unclaimed}</span></div>
          <div class="editorial-stat-card"><span class="stat-desc">Pending Collection</span><span class="stat-num">${impact.reservedNotCollected}</span></div>
        `;
      }
    }

    handlePublishLastPlate(e) {
      e.preventDefault();
      try {
        const listing = this.db.publishLastPlateListing({
          dishName: $('lp-dish-name').value,
          portions: $('lp-portions').value,
          price: $('lp-price').value,
          deadline: $('lp-deadline').value,
          location: $('lp-location').value,
          description: $('lp-description').value
        });
        e.target.reset();
        this.renderLastPlateAdmin();
        this.showToast(`Published: ${listing.dishName} (${listing.portions} portions)`, 'success');
      } catch (err) {
        this.showToast(err.message, 'error');
      }
    }

    handleWithdrawLastPlateListing(id) {
      if (confirm('Withdraw this surplus listing before the deadline? Uncollected reservations will be cancelled.')) {
        try {
          this.db.withdrawLastPlateListing(id, 'Early withdrawal by kitchen manager');
          this.renderLastPlateAdmin();
          this.showToast('Listing withdrawn', 'info');
        } catch (err) {
          this.showToast(err.message, 'error');
        }
      }
    }

    handleMarkCollected(resId) {
      try {
        const res = this.db.markReservationCollected(resId);
        this.renderLastPlateAdmin();
        this.showToast(`Reservation ${res.token} marked as collected`, 'success');
      } catch (err) {
        this.showToast(err.message, 'error');
      }
    }

    loadLastPlateSampleData() {
      if (this.db.loadLastPlateSampleData()) {
        this.renderLastPlateAdmin();
        this.renderLastPlateStudent();
        this.showToast('Sample Last Plate listings loaded', 'info');
      } else {
        this.showToast('Sample data already loaded', 'info');
      }
    }

    clearLastPlateSampleData() {
      this.db.clearLastPlateSampleData();
      this.renderLastPlateAdmin();
      this.renderLastPlateStudent();
      this.showToast('Sample Last Plate data cleared', 'info');
    }

    // =========================================================================
    // SUPABASE SETTINGS MODAL & CONNECTION
    // =========================================================================
    openSupabaseModal() {
      const modal = $('supabase-modal');
      if (!modal) return;
      const status = window.CampusBiteSupabase?.getStatus() || {};
      $('supabase-url-input').value = status.url || '';
      $('supabase-key-input').value = status.hasKey ? '••••••••••••••••' : '';
      $('supabase-status-text').innerText = status.status || 'LOCAL_OFFLINE';
      show(modal, true);
    }

    closeSupabaseModal() {
      show($('supabase-modal'), false);
    }

    async handleTestSupabase() {
      const url = $('supabase-url-input').value;
      const key = $('supabase-key-input').value;
      const btn = $('btn-test-supabase');
      if (btn) btn.innerText = 'Connecting...';

      if (window.CampusBiteSupabase) {
        const res = await window.CampusBiteSupabase.saveConfig(url, key, true);
        $('supabase-status-text').innerText = res.status;
        this.showToast(res.message, res.success ? 'success' : 'warning');
      }
      if (btn) btn.innerText = 'Test & Save Connection';
    }

    // =========================================================================
    // PASSWORD RECOVERY MODAL (GROUP A)
    // =========================================================================
    openForgotPasswordModal() {
      show($('forgot-pw-modal'), true);
      $('forgot-step-1').classList.remove('hidden');
      $('forgot-step-2').classList.add('hidden');
    }

    closeForgotPasswordModal() {
      show($('forgot-pw-modal'), false);
    }

    handleForgotPasswordRequest(e) {
      e.preventDefault();
      const idOrEmail = $('forgot-id-input').value;
      try {
        const res = this.db.createPasswordResetToken(idOrEmail);
        $('forgot-token-display').innerText = res.token;
        $('forgot-token-input').value = res.token;
        $('forgot-step-1').classList.add('hidden');
        $('forgot-step-2').classList.remove('hidden');
        this.showToast(`Reset code generated: ${res.token}`, 'info');
      } catch (err) {
        this.showToast(err.message, 'error');
      }
    }

    handleResetPasswordSubmit(e) {
      e.preventDefault();
      const token = $('forgot-token-input').value.trim();
      const newPw = $('forgot-new-pw').value;
      try {
        this.db.resetPasswordWithToken(token, newPw);
        this.closeForgotPasswordModal();
        this.showToast('Password updated! You can now sign in.', 'success');
      } catch (err) {
        this.showToast(err.message, 'error');
      }
    }
  }

  window.CampusBiteApp = CampusBiteApp;
  window.app = new CampusBiteApp();
})();
