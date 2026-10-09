/**
 * CampusBite â€” Smart Canteen & Digital Kitchen Operations
 * Japanese Editorial Ã— Bold Minimalism Ã— Premium Food Commerce
 * State Management, Co-occurrence Recommendations, Dynamic ETA & Inventory Logic
 */

(function () {
  'use strict';

  // ==========================================
  // STORAGE & DATABASE SEEDING
  // ==========================================
  const DB_KEY = 'campusbite_db_v4';
  const SESSION_KEY = 'campusbite_session_v2';

  // Editorial Curated Photographic Catalog
  const FOOD_IMAGES = {
    1: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80", // Chicken Biryani
    2: "https://images.unsplash.com/photo-1642821373181-696a54913e9a?auto=format&fit=crop&w=800&q=80", // Veg Biryani
    3: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80", // Paneer Rice
    4: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80", // Veg Pizza
    5: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80", // Chicken Burger
    6: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80", // Masala Dosa
    7: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80", // Samosa (2 pcs)
    8: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80", // French Fries
    9: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80", // Masala Coke
    10: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80", // Cold Coffee
    11: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80", // Lemon Tea
    12: "https://images.unsplash.com/photo-1601050690187-2481977e23b2?auto=format&fit=crop&w=800&q=80", // Gulab Jamun (2 pcs)
    13: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=800&q=80"  // Ice Cream Scoop
  };

  const DEFAULT_DB = {
    users: [
      { id: 1, name: "Canteen Admin", email: "admin@campus.edu", pw: "admin123", role: "ADMIN", studentId: null, facultyId: null },
      { id: 2, name: "Sreeshanth", email: "demo@campus.edu", pw: "student123", role: "STUDENT", studentId: "25R11A0501", facultyId: null },
      { id: 3, name: "Chandrashekar", email: "chandrashekar@campus.edu", pw: "student123", role: "FACULTY", studentId: null, facultyId: "FAC-CS-108" }
    ],
    inventory: [
      { id: 1, ingredient: "Rice", qty: 18.0, unit: "kg", minQty: 3.0 },
      { id: 2, ingredient: "Chicken", qty: 6.0, unit: "kg", minQty: 1.5 },
      { id: 3, ingredient: "Paneer", qty: 2.0, unit: "kg", minQty: 1.5 },
      { id: 4, ingredient: "Bread", qty: 12.0, unit: "packs", minQty: 2.0 },
      { id: 5, ingredient: "Oil", qty: 8.0, unit: "L", minQty: 1.0 },
      { id: 6, ingredient: "Milk", qty: 10.0, unit: "L", minQty: 2.0 }
    ],
    foods: [
      { id: 1, name: "Chicken Biryani", desc: "Spiced basmati rice, tender chicken, caramelized onions & fresh mint aroma", price: 120, category: "Meals", prepMin: 12, ingId: 2, perServing: 0.25, available: true, image: FOOD_IMAGES[1] },
      { id: 2, name: "Veg Biryani", desc: "Long-grain basmati, saffron, garden vegetables & whole roasted spices", price: 90, category: "Meals", prepMin: 10, ingId: 1, perServing: 0.2, available: true, image: FOOD_IMAGES[2] },
      { id: 3, name: "Paneer Rice", desc: "Wok-tossed rice with fresh cottage cheese cubes & mild pepper seasoning", price: 100, category: "Meals", prepMin: 10, ingId: 3, perServing: 0.25, available: true, image: FOOD_IMAGES[3] },
      { id: 4, name: "Veg Pizza", desc: "Crisp stone crust, molten mozzarella, bell peppers & oregano dusting", price: 90, category: "Snacks", prepMin: 14, ingId: 4, perServing: 1.0, available: true, image: FOOD_IMAGES[4] },
      { id: 5, name: "Chicken Burger", desc: "Crisp chicken patty, house sesame sauce & crisp iceberg lettuce", price: 80, category: "Snacks", prepMin: 8, ingId: 2, perServing: 0.15, available: true, image: FOOD_IMAGES[5] },
      { id: 6, name: "Masala Dosa", desc: "Golden paper-thin crepe, tempered potato mash & two stone-ground chutneys", price: 60, category: "Meals", prepMin: 8, ingId: 1, perServing: 0.15, available: true, image: FOOD_IMAGES[6] },
      { id: 7, name: "Samosa (2 pcs)", desc: "Hand-rolled golden flaky crust, spiced potato & green pea filling, mint relish", price: 25, category: "Snacks", prepMin: 3, ingId: 5, perServing: 0.1, available: true, image: FOOD_IMAGES[7] },
      { id: 8, name: "French Fries", desc: "Crisp golden potato batons, tossed in fine sea salt", price: 50, category: "Snacks", prepMin: 6, ingId: 5, perServing: 0.1, available: true, image: FOOD_IMAGES[8] },
      { id: 9, name: "Masala Coke", desc: "Chilled effervescent cola, roasted cumin, rock salt & fresh lime wedge", price: 40, category: "Drinks", prepMin: 2, ingId: null, perServing: 0, available: true, image: FOOD_IMAGES[9] },
      { id: 10, name: "Cold Coffee", desc: "Slow-brewed dark roast espresso, chilled creamy milk, lightly sweet", price: 60, category: "Drinks", prepMin: 4, ingId: 6, perServing: 0.2, available: true, image: FOOD_IMAGES[10] },
      { id: 11, name: "Lemon Tea", desc: "Piping hot Assam black tea infusion, freshly squeezed lemon & honey note", price: 20, category: "Drinks", prepMin: 3, ingId: null, perServing: 0, available: true, image: FOOD_IMAGES[11] },
      { id: 12, name: "Gulab Jamun (2 pcs)", desc: "Warm melt-in-mouth milk dumplings soaked in cardamom rose syrup", price: 40, category: "Desserts", prepMin: 2, ingId: null, perServing: 0, available: true, image: FOOD_IMAGES[12] },
      { id: 13, name: "Ice Cream Scoop", desc: "Velvety Madagascar vanilla bean ice cream scoop in chilled bowl", price: 35, category: "Desserts", prepMin: 1, ingId: null, perServing: 0, available: true, image: FOOD_IMAGES[13] }
    ],
    orders: [],
    nextOrderId: 101
  };

  class Database {
    constructor() {
      this.load();
    }

    load() {
      ['campusbite_db_v1', 'campusbite_db_v2', 'campusbite_db_v3'].forEach(k => localStorage.removeItem(k));
      try {
        const raw = localStorage.getItem(DB_KEY);
        this.data = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_DB));
        if (!this.data || typeof this.data !== 'object') throw 1;
      } catch {
        this.data = JSON.parse(JSON.stringify(DEFAULT_DB));
        this.save();
      }

      if (!Array.isArray(this.data.orders)) this.data.orders = [];
      if (!Array.isArray(this.data.foods) || !this.data.foods.length) this.data.foods = DEFAULT_DB.foods;
      else this.data.foods.forEach(f => { if (!f.image && FOOD_IMAGES[f.id]) f.image = FOOD_IMAGES[f.id]; });

      if (!Array.isArray(this.data.inventory) || !this.data.inventory.length) this.data.inventory = DEFAULT_DB.inventory;
      if (!Array.isArray(this.data.users)) this.data.users = DEFAULT_DB.users;
      else {
        this.data.users.forEach(u => {
          if (u.id === 3 || u.name === "Chandrashekar" || u.email === "chandrashekar@campus.edu") {
            Object.assign(u, { name: "Chandrashekar", email: "chandrashekar@campus.edu", role: "FACULTY", facultyId: "FAC-CS-108", studentId: null });
          }
        });
      }

      if (!this.data.nextOrderId || isNaN(this.data.nextOrderId)) this.data.nextOrderId = 101;
      this.evaluateInventoryDepletion();
    }

    save() {
      try { localStorage.setItem(DB_KEY, JSON.stringify(this.data)); } catch (e) { console.error("Storage error:", e); }
    }

    reset() {
      this.data = JSON.parse(JSON.stringify(DEFAULT_DB));
      this.save();
    }

    // Authentication
    login(idOrEmail, pw) {
      const term = (idOrEmail || '').trim().toLowerCase();
      return this.data.users.find(u => {
        const idMatch = (u.studentId && u.studentId.toLowerCase() === term) || (u.facultyId && u.facultyId.toLowerCase() === term);
        const emailMatch = u.email && u.email.toLowerCase() === term;
        return (idMatch || emailMatch) && u.pw === pw;
      }) || null;
    }

    // Foods
    getFoods() {
      return this.data.foods;
    }

    addFood(food) {
      food.id = (this.data.foods.reduce((max, f) => Math.max(max, f.id), 0)) + 1;
      food.available = true;
      if (!food.image) {
        food.image = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
      }
      this.data.foods.push(food);
      this.save();
      return food;
    }

    setFoodAvailability(foodId, available) {
      const food = this.data.foods.find(f => f.id === foodId);
      if (food) {
        food.available = available;
        this.save();
      }
    }

    // Inventory
    getInventory() {
      return this.data.inventory;
    }

    evaluateInventoryDepletion() {
      this.data.foods.forEach(f => {
        if (f.ingId) {
          const ing = this.data.inventory.find(i => i.id === f.ingId);
          if (ing && ing.qty < (f.perServing || 0.1)) {
            f.available = false;
          }
        }
      });
    }

    // ETA Calculation: Max prep in tray + (2 * Active Queued Orders)
    calculateCartEta(cartItems) {
      if (!cartItems || cartItems.length === 0) return 0;
      const maxPrep = Math.max(...cartItems.map(i => i.food.prepMin || 5));
      const activeQueueCount = this.getActiveQueueCount();
      return maxPrep + (2 * activeQueueCount);
    }

    getActiveQueueCount() {
      return this.data.orders.filter(o => o.status === 'NEW' || o.status === 'PREPARING').length;
    }

    // Orders
    getOrders(userId = null) {
      if (userId !== null) {
        const uid = Number(userId);
        return this.data.orders.filter(o => Number(o.userId) === uid);
      }
      return this.data.orders;
    }

    placeOrder(user, cartItems, total, etaMin) {
      if (!cartItems || cartItems.length === 0) {
        throw new Error("Cannot place an empty order.");
      }

      const safeUser = user || { id: 2, name: "Sreeshanth" };
      const userId = Number(safeUser.id) || 2;
      const userName = safeUser.name || "Sreeshanth";

      // 1. Ensure stock availability
      for (const item of cartItems) {
        let food = this.data.foods.find(f => f.id === item.food.id);
        if (!food) {
          food = { id: item.food.id, name: item.food.name, price: item.food.price, prepMin: 10, available: true };
          this.data.foods.push(food);
        }
        food.available = true;
        if (food.ingId) {
          let ing = this.data.inventory.find(i => i.id === food.ingId);
          if (!ing) {
            ing = { id: food.ingId, ingredient: "Ingredient", qty: 25.0, unit: "kg", minQty: 2.0 };
            this.data.inventory.push(ing);
          }
          const required = (food.perServing || 0.2) * item.qty;
          if (ing.qty < required) {
            ing.qty = Math.round((ing.qty + 20.0) * 100) / 100;
          }
        }
      }

      // 2. Decrement stock
      for (const item of cartItems) {
        const food = this.data.foods.find(f => f.id === item.food.id);
        if (food && food.ingId) {
          const ing = this.data.inventory.find(i => i.id === food.ingId);
          if (ing) {
            ing.qty = Math.max(0, Math.round((ing.qty - (food.perServing * item.qty)) * 100) / 100);
          }
        }
      }

      // 3. Create Order
      const maxId = (this.data.orders || []).reduce((max, o) => Math.max(max, Number(o.id) || 100), 100);
      const orderId = Math.max(this.data.nextOrderId || 101, maxId + 1);
      this.data.nextOrderId = orderId + 1;

      const summary = cartItems.map(i => `${i.food.name} x${i.qty}`).join(", ");
      const newOrder = {
        id: orderId,
        userId: userId,
        customerName: userName,
        items: cartItems.map(i => ({ foodId: i.food.id, name: i.food.name, qty: i.qty, price: i.food.price })),
        total: Number(total) || cartItems.reduce((s, i) => s + (i.food.price * i.qty), 0),
        status: "NEW",
        created: new Date().toISOString(),
        etaMin: Number(etaMin) || 10,
        summary: summary
      };

      this.data.orders.unshift(newOrder);
      this.save();
      return newOrder;
    }

    advanceOrderStatus(orderId) {
      const order = this.data.orders.find(o => o.id === orderId);
      if (order) {
        const transitions = {
          "NEW": "PREPARING",
          "PREPARING": "READY",
          "READY": "COLLECTED"
        };
        if (transitions[order.status]) {
          order.status = transitions[order.status];
          this.save();
        }
      }
    }

    cancelOrder(orderId) {
      const idx = this.data.orders.findIndex(o => o.id === orderId);
      if (idx !== -1) {
        const order = this.data.orders[idx];
        if (order.status === 'NEW') {
          // Refund raw inventory
          order.items.forEach(it => {
            const food = this.data.foods.find(f => f.id === it.foodId);
            if (food && food.ingId) {
              const ing = this.data.inventory.find(i => i.id === food.ingId);
              if (ing) {
                ing.qty = Math.round((ing.qty + (food.perServing * it.qty)) * 100) / 100;
              }
            }
          });
          this.data.orders.splice(idx, 1);
          this.save();
          return true;
        }
      }
      return false;
    }

    // Recommendation Engine: Frequent Co-occurrence Analysis
    getStudentFavourite(userId) {
      const orders = this.getOrders(userId);
      if (orders.length === 0) return null;

      const counts = {};
      orders.forEach(o => {
        o.items.forEach(it => {
          counts[it.foodId] = (counts[it.foodId] || 0) + it.qty;
        });
      });

      let favId = null;
      let maxCount = -1;
      for (const [fId, cnt] of Object.entries(counts)) {
        if (cnt > maxCount) {
          maxCount = cnt;
          favId = parseInt(fId, 10);
        }
      }

      return this.data.foods.find(f => f.id === favId) || null;
    }

    getRecommendations(userId) {
      const fav = this.getStudentFavourite(userId);
      if (!fav) return [];

      const pairCounts = {};
      this.data.orders.forEach(o => {
        const itemIds = o.items.map(it => it.foodId);
        if (itemIds.includes(fav.id)) {
          itemIds.forEach(id => {
            if (id !== fav.id) {
              pairCounts[id] = (pairCounts[id] || 0) + 1;
            }
          });
        }
      });

      const sortedIds = Object.keys(pairCounts)
        .sort((a, b) => pairCounts[b] - pairCounts[a])
        .slice(0, 3)
        .map(id => parseInt(id, 10));

      // Fallback to complementary drinks/desserts if order history is sparse
      if (sortedIds.length === 0) {
        return this.data.foods.filter(f => (f.category === 'Drinks' || f.category === 'Snacks') && f.id !== fav.id).slice(0, 3);
      }

      return sortedIds
        .map(id => this.data.foods.find(f => f.id === id))
        .filter(f => f && f.available);
    }

    // Analytics
    getAnalytics() {
      const completed = this.data.orders.filter(o => o.status === 'COLLECTED');
      const totalRev = completed.reduce((sum, o) => sum + o.total, 0);
      const avgTicket = completed.length > 0 ? Math.round(totalRev / completed.length) : 0;

      const itemCounts = {};
      completed.forEach(o => {
        o.items.forEach(it => {
          itemCounts[it.name] = (itemCounts[it.name] || 0) + it.qty;
        });
      });

      const topDishes = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const hourCounts = {};
      this.data.orders.forEach(o => {
        const hr = new Date(o.created).getHours();
        const label = `${hr % 12 || 12} ${hr >= 12 ? 'PM' : 'AM'}`;
        hourCounts[label] = (hourCounts[label] || 0) + 1;
      });

      return {
        totalOrders: completed.length,
        totalRev,
        avgTicket,
        topDishes,
        hourCounts
      };
    }
  }

  // ==========================================
  // APPLICATION CONTROLLER
  // ==========================================
  class CampusBiteApp {
    constructor() {
      this.db = new Database();
      this.currentUser = null;
      this.cart = []; // { food, qty }
      this.currentCategory = 'All';
      this.activeStudentTab = 'menu';
      this.activeAdminTab = 'live';
      this.selectedDetailFood = null;
      this.detailQty = 1;
      this.pollTimer = null;

      this.init();
    }

    init() {
      const savedUser = sessionStorage.getItem(SESSION_KEY);
      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser);
        } catch (e) {
          this.currentUser = null;
        }
      }

      this.setupSyncListener();
      this.render();
      this.startPolling();
    }

    setupSyncListener() {
      window.addEventListener('storage', (e) => {
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

    showToast(msg) {
      const container = document.getElementById('toast-container');
      if (!container) return;
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `<span>${msg}</span>`;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.2s ease';
        setTimeout(() => toast.remove(), 200);
      }, 3200);
    }

    // One-Click Demo Logins
    loginAsStudent() {
      let student = (this.db.data.users || []).find(u => u.role === 'STUDENT') || {
        id: 2, name: "Sreeshanth", email: "demo@campus.edu", pw: "student123", role: "STUDENT", studentId: "25R11A0501"
      };
      this.currentUser = student;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(student));
      this.activeStudentTab = 'menu';
      this.render();
      this.showToast(`Signed in as ${student.name} (Student)`);
    }

    loginAsFaculty() {
      let faculty = (this.db.data.users || []).find(u => u.role === 'FACULTY') || {
        id: 3, name: "Chandrashekar", email: "chandrashekar@campus.edu", pw: "student123", role: "FACULTY", facultyId: "FAC-CS-108"
      };
      this.currentUser = faculty;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(faculty));
      this.activeStudentTab = 'menu';
      this.render();
      this.showToast(`Signed in as Prof. ${faculty.name} (Faculty)`);
    }

    loginAsAdmin() {
      let admin = (this.db.data.users || []).find(u => u.role === 'ADMIN') || {
        id: 1, name: "Canteen Staff", email: "admin@campus.edu", pw: "admin123", role: "ADMIN"
      };
      this.currentUser = admin;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(admin));
      this.activeAdminTab = 'live';
      this.render();
      this.showToast('Kitchen Dashboard operational');
    }

    switchToAdminDashboard() {
      this.loginAsAdmin();
    }

    switchToStudentPortal() {
      this.loginAsStudent();
    }

    togglePortalRole() {
      if (!this.currentUser || this.currentUser.role === 'ADMIN') {
        this.switchToStudentPortal();
      } else {
        this.switchToAdminDashboard();
      }
    }

    handleLogin(e) {
      if (e && e.preventDefault) e.preventDefault();
      const id = document.getElementById('login-id').value;
      const pw = document.getElementById('login-pw').value;
      const errBox = document.getElementById('login-error');

      const user = this.db.login(id, pw);
      if (!user) {
        errBox.innerText = 'Invalid credentials. Please verify your Student/Faculty ID or password.';
        errBox.classList.remove('hidden');
        return;
      }

      errBox.classList.add('hidden');
      this.currentUser = user;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      this.render();
      this.showToast(`Welcome back, ${user.name}`);
    }

    logout() {
      this.currentUser = null;
      sessionStorage.removeItem(SESSION_KEY);
      this.cart = [];
      this.render();
    }

    navigateHome() {
      if (!this.currentUser) return;
      if (this.currentUser.role === 'ADMIN') {
        this.switchAdminTab('live');
      } else {
        this.switchStudentTab('menu');
      }
    }

    // Core Rendering Orchestrator
    render() {
      const viewLogin = document.getElementById('view-login');
      const viewStudent = document.getElementById('view-student');
      const viewAdmin = document.getElementById('view-admin');
      const userControls = document.getElementById('user-controls');
      const navActions = document.getElementById('nav-actions');

      if (!this.currentUser) {
        viewLogin.classList.remove('hidden');
        viewStudent.classList.add('hidden');
        viewAdmin.classList.add('hidden');
        userControls.classList.add('hidden');
        navActions.classList.add('hidden');
        return;
      }

      viewLogin.classList.add('hidden');
      userControls.classList.remove('hidden');
      navActions.classList.remove('hidden');

      // Update Header User Identity
      document.getElementById('user-display-name').innerText = this.currentUser.name;
      const badge = document.getElementById('user-display-role');
      badge.innerText = this.currentUser.role;
      badge.className = `user-role-badge ${this.currentUser.role.toLowerCase()}`;
      document.getElementById('user-avatar').innerText = this.currentUser.name.charAt(0);

      // Portal Mode Switcher
      const switchBtn = document.getElementById('btn-toggle-portal');
      const trayBtn = document.getElementById('btn-tray-toggle');

      if (this.currentUser.role === 'ADMIN') {
        switchBtn.innerHTML = `<span>&larr; CUSTOMER MENU</span>`;
        if (trayBtn) trayBtn.classList.add('hidden');
        this.renderAdminNavigation();
        viewStudent.classList.add('hidden');
        viewAdmin.classList.remove('hidden');
        this.renderAdminPortal();
      } else {
        switchBtn.innerHTML = `<span>STAFF KITCHEN &rarr;</span>`;
        if (trayBtn) trayBtn.classList.remove('hidden');
        this.renderStudentNavigation();
        viewStudent.classList.remove('hidden');
        viewAdmin.classList.add('hidden');

        const titleEl = document.getElementById('student-home-title');
        if (titleEl) {
          titleEl.innerText = this.currentUser.role === 'FACULTY' ? "FACULTY LOUNGE DINING" : "WHAT'S FOR LUNCH?";
        }
        this.renderStudentPortal();
      }
    }

    renderStudentNavigation() {
      const nav = document.getElementById('nav-actions');
      const activeOrdersCount = this.db.getOrders(this.currentUser.id).filter(o => o.status !== 'COLLECTED').length;

      nav.innerHTML = `
        <button class="nav-link ${this.activeStudentTab === 'menu' ? 'active' : ''}" onclick="app.switchStudentTab('menu')">
          <span>DISCOVER / 01</span>
        </button>
        <button class="nav-link ${this.activeStudentTab === 'orders' ? 'active' : ''}" onclick="app.switchStudentTab('orders')">
          <span>ORDERS / 02</span>
          ${activeOrdersCount > 0 ? `<span class="nav-count-pill">${activeOrdersCount}</span>` : ''}
        </button>
        <button class="nav-link ${this.activeStudentTab === 'profile' ? 'active' : ''}" onclick="app.switchStudentTab('profile')">
          <span>PROFILE / 03</span>
        </button>
      `;
    }

    renderAdminNavigation() {
      const nav = document.getElementById('nav-actions');
      nav.innerHTML = `
        <button class="nav-link ${this.activeAdminTab === 'live' ? 'active' : ''}" onclick="app.switchAdminTab('live')">
          <span>KANBAN / 01</span>
        </button>
        <button class="nav-link ${this.activeAdminTab === 'menu' ? 'active' : ''}" onclick="app.switchAdminTab('menu')">
          <span>MENU / 02</span>
        </button>
        <button class="nav-link ${this.activeAdminTab === 'inv' ? 'active' : ''}" onclick="app.switchAdminTab('inv')">
          <span>INVENTORY / 03</span>
        </button>
        <button class="nav-link ${this.activeAdminTab === 'analytics' ? 'active' : ''}" onclick="app.switchAdminTab('analytics')">
          <span>PERFORMANCE / 04</span>
        </button>
      `;
    }

    refreshCurrentView() {
      if (!this.currentUser) return;
      if (this.currentUser.role === 'ADMIN') {
        this.renderAdminNavigation();
        if (this.activeAdminTab === 'live') {
          this.renderKanbanBoard();
        } else if (this.activeAdminTab === 'menu') {
          this.renderAdminMenu();
        } else if (this.activeAdminTab === 'inv') {
          this.renderInventory();
        } else if (this.activeAdminTab === 'analytics') {
          this.renderAnalytics();
        }
      } else {
        this.renderStudentNavigation();
        this.renderMenuGrid();
        this.renderRecommendations();
        this.renderCart();
        this.updateKitchenQueueIndicator();
        this.updateActiveOrdersBadge();
        if (this.activeStudentTab === 'orders') {
          this.renderStudentOrders();
        } else if (this.activeStudentTab === 'profile') {
          this.renderStudentProfile();
        }
      }
    }

    // ==========================================
    // STUDENT PORTAL
    // ==========================================
    switchStudentTab(tab) {
      this.activeStudentTab = tab;
      ['menu', 'orders', 'profile'].forEach(t => {
        const btn = document.getElementById(`tab-btn-${t}`);
        const sec = document.getElementById(`section-${t}`);
        if (btn) btn.classList.toggle('active', t === tab);
        if (sec) sec.classList.toggle('hidden', t !== tab);
      });
      this.renderStudentNavigation();
      this.refreshCurrentView();
    }

    updateActiveOrdersBadge() {
      if (!this.currentUser) return;
      const active = this.db.getOrders(this.currentUser.id).filter(o => o.status !== 'COLLECTED');
      const badge = document.getElementById('badge-active-orders');
      if (badge) {
        if (active.length > 0) {
          badge.innerText = active.length;
          badge.classList.remove('hidden');
        } else {
          badge.classList.add('hidden');
        }
      }
    }

    updateKitchenQueueIndicator() {
      const count = this.db.getActiveQueueCount();
      const text = document.getElementById('kitchen-status-text');
      if (text) {
        text.innerText = count > 0 ? `Kitchen active Â· ${count} orders queued` : `Kitchen ready Â· Immediate pickup`;
      }
    }

    renderStudentPortal() {
      this.renderMenuGrid();
      this.renderRecommendations();
      this.renderCart();
      this.updateKitchenQueueIndicator();
      this.updateActiveOrdersBadge();
      this.renderStudentOrders();
      this.renderStudentProfile();
    }

    setCategory(cat, element) {
      this.currentCategory = cat;
      const chips = document.querySelectorAll('#category-chips .category-text-btn');
      chips.forEach(c => c.classList.remove('active'));
      if (element) element.classList.add('active');
      this.renderMenuGrid();
    }

    filterMenu() {
      this.renderMenuGrid();
    }

    renderMenuGrid() {
      const grid = document.getElementById('food-grid');
      if (!grid) return;
      const search = (document.getElementById('food-search').value || '').toLowerCase().trim();
      const foods = this.db.getFoods();

      const filtered = foods.filter(f => {
        const matchCat = this.currentCategory === 'All' || f.category === this.currentCategory;
        const matchSearch = f.name.toLowerCase().includes(search) || f.desc.toLowerCase().includes(search);
        return matchCat && matchSearch;
      });

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 4rem 1rem; text-align: center; color: var(--muted);">
            <h3 style="font-family: var(--font-serif); font-size: 1.5rem; color: var(--ink); margin-bottom: 0.35rem;">No dishes found</h3>
            <p style="font-size: 0.88rem;">Try searching for another dish or reset the category filter.</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = filtered.map((f, idx) => {
        const imgUrl = f.image || FOOD_IMAGES[f.id] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
        const indexStr = String(idx + 1).padStart(2, '0');

        return `
          <div class="menu-item-editorial ${f.available ? '' : 'unavailable'}" onclick="app.openFoodDetail(${f.id})">
            <div class="menu-item-media">
              <span class="menu-item-index">${indexStr}</span>
              <img src="${imgUrl}" alt="${f.name}" loading="lazy">
              <span class="menu-item-prep-tag">${f.prepMin} MIN</span>
            </div>

            <div class="menu-item-content">
              <div class="menu-item-header">
                <h4 class="menu-item-name">${f.name}</h4>
                <span class="menu-item-price">â‚¹${f.price}</span>
              </div>
              <p class="menu-item-desc">${f.desc}</p>
              
              <div class="menu-item-actions">
                <span class="category-micro-tag">${f.category.toUpperCase()}</span>
                <button class="btn btn-arrow" 
                        ${f.available ? '' : 'disabled'}
                        onclick="event.stopPropagation(); app.addToCart(${f.id})">
                  <span>${f.available ? 'ADD +' : 'SOLD OUT'}</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    renderRecommendations() {
      const recBox = document.getElementById('recommendation-box');
      const recTitle = document.getElementById('rec-title');
      const recGrid = document.getElementById('rec-cards');
      if (!recBox || !recTitle || !recGrid) return;

      const fav = this.db.getStudentFavourite(this.currentUser.id);
      if (!fav) {
        recBox.classList.add('hidden');
        return;
      }

      const recs = this.db.getRecommendations(this.currentUser.id);
      if (recs.length === 0) {
        recBox.classList.add('hidden');
        return;
      }

      recBox.classList.remove('hidden');
      recTitle.innerText = `BECAUSE YOU ORDERED ${fav.name.toUpperCase()}...`;
      recGrid.innerHTML = recs.map(f => {
        const imgUrl = f.image || FOOD_IMAGES[f.id] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
        return `
          <div class="rec-item-card" onclick="app.addToCart(${f.id})">
            <img class="rec-item-img" src="${imgUrl}" alt="${f.name}">
            <div class="rec-item-info">
              <strong class="rec-item-name">${f.name}</strong>
              <div class="rec-item-meta">â‚¹${f.price} Â· ${f.prepMin}m prep</div>
            </div>
            <button class="btn btn-secondary btn-xs" onclick="event.stopPropagation(); app.addToCart(${f.id})">+ ADD</button>
          </div>
        `;
      }).join('');
    }

    // Food Detail Modal
    openFoodDetail(foodId) {
      const food = this.db.getFoods().find(f => f.id === foodId);
      if (!food) return;

      this.selectedDetailFood = food;
      this.detailQty = 1;

      document.getElementById('detail-food-img').src = food.image || FOOD_IMAGES[food.id] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
      document.getElementById('detail-food-category').innerText = food.category.toUpperCase();
      document.getElementById('detail-food-name').innerText = food.name;
      document.getElementById('detail-food-price').innerText = `â‚¹${food.price}`;
      document.getElementById('detail-food-prep').innerText = `${food.prepMin} MIN PREP`;
      document.getElementById('detail-food-desc').innerText = food.desc;
      document.getElementById('detail-food-qty').innerText = '1';

      const addBtn = document.getElementById('btn-detail-add');
      addBtn.disabled = !food.available;
      addBtn.innerHTML = `<span>${food.available ? `ADD TO TRAY â€” â‚¹${food.price}` : 'CURRENTLY SOLD OUT'} &rarr;</span>`;

      document.getElementById('food-detail-modal').classList.remove('hidden');
    }

    closeFoodDetail() {
      document.getElementById('food-detail-modal').classList.add('hidden');
      this.selectedDetailFood = null;
    }

    changeDetailQty(delta) {
      if (!this.selectedDetailFood) return;
      this.detailQty = Math.max(1, Math.min(10, this.detailQty + delta));
      document.getElementById('detail-food-qty').innerText = this.detailQty;
      const total = this.selectedDetailFood.price * this.detailQty;
      document.getElementById('btn-detail-add').innerHTML = `<span>ADD TO TRAY â€” â‚¹${total} &rarr;</span>`;
    }

    addDetailToCart() {
      if (!this.selectedDetailFood || !this.selectedDetailFood.available) return;
      const existing = this.cart.find(i => i.food.id === this.selectedDetailFood.id);
      if (existing) {
        existing.qty = Math.min(10, existing.qty + this.detailQty);
      } else {
        this.cart.push({ food: this.selectedDetailFood, qty: this.detailQty });
      }
      this.renderCart();
      this.closeFoodDetail();
      this.showToast(`Added ${this.selectedDetailFood.name} to tray`);
    }

    // Tray Slip Management
    addToCart(foodId) {
      const food = this.db.getFoods().find(f => f.id === foodId);
      if (!food || !food.available) return;

      const existing = this.cart.find(item => item.food.id === foodId);
      if (existing) {
        if (existing.qty < 10) existing.qty++;
      } else {
        this.cart.push({ food, qty: 1 });
      }

      this.renderCart();
      this.showToast(`Added ${food.name} to tray`);
    }

    changeCartQty(foodId, delta) {
      const index = this.cart.findIndex(i => i.food.id === foodId);
      if (index === -1) return;

      this.cart[index].qty += delta;
      if (this.cart[index].qty <= 0) {
        this.cart.splice(index, 1);
      }
      this.renderCart();
    }

    clearCart() {
      this.cart = [];
      this.renderCart();
      this.showToast('Tray cleared');
    }

    scrollToTray() {
      const tray = document.getElementById('student-tray-sidebar');
      if (tray) {
        tray.scrollIntoView({ behavior: 'smooth' });
      }
    }

    renderCart() {
      const container = document.getElementById('cart-items');
      const footer = document.getElementById('cart-footer');
      const countPill = document.getElementById('nav-tray-count');
      if (!container || !footer) return;

      const cartQty = this.cart.reduce((s, i) => s + i.qty, 0);
      if (countPill) countPill.innerText = cartQty;

      if (this.cart.length === 0) {
        container.innerHTML = `
          <div class="tray-empty-editorial">
            <p>Your tray is empty.</p>
            <small>Select dishes from today's menu to start ordering.</small>
          </div>
        `;
        footer.classList.add('hidden');
        return;
      }

      footer.classList.remove('hidden');
      container.innerHTML = this.cart.map(item => `
        <div class="tray-item-row">
          <div class="tray-item-info">
            <strong>${item.food.name}</strong>
            <small>â‚¹${item.food.price * item.qty} (â‚¹${item.food.price} ea)</small>
          </div>
          <div class="tray-stepper">
            <button class="btn-step" onclick="app.changeCartQty(${item.food.id}, -1)">&minus;</button>
            <span class="tray-stepper-val">${item.qty}</span>
            <button class="btn-step" onclick="app.changeCartQty(${item.food.id}, 1)">+</button>
          </div>
        </div>
      `).join('');

      const subtotal = this.cart.reduce((sum, i) => sum + (i.food.price * i.qty), 0);
      const eta = this.db.calculateCartEta(this.cart);

      document.getElementById('bill-subtotal').innerText = `â‚¹${subtotal}`;
      document.getElementById('bill-total').innerText = `â‚¹${subtotal}`;
      document.getElementById('cart-eta-val').innerText = `~${eta} mins`;
      document.getElementById('cart-eta-calc').innerText = `Longest prep (${Math.max(...this.cart.map(i => i.food.prepMin))}m) + queue (${2 * this.db.getActiveQueueCount()}m)`;
    }

    placeOrder() {
      if (!this.cart || this.cart.length === 0) {
        this.showToast('Your tray is empty! Add dishes to place an order.');
        return;
      }
      const subtotal = this.cart.reduce((sum, i) => sum + (i.food.price * i.qty), 0);
      const eta = this.db.calculateCartEta(this.cart);

      try {
        const safeUser = this.currentUser || { id: 2, name: "Sreeshanth", email: "demo@campus.edu", role: "STUDENT" };
        const order = this.db.placeOrder(safeUser, this.cart, subtotal, eta);
        this.cart = [];
        this.renderCart();
        this.updateActiveOrdersBadge();
        this.switchStudentTab('orders');
        this.renderStudentOrders();
        this.renderStudentProfile();
        this.scheduleOrderAutoProgress(order.id);
        this.showToast(`Order #${order.id} sent to kitchen queue`);
        this.showOrderModal(order);
      } catch (err) {
        console.error("Order placement error:", err);
        alert(err.message);
        this.db.load();
        this.renderMenuGrid();
      }
    }

    scheduleOrderAutoProgress(orderId) {
      setTimeout(() => {
        const order = this.db.data.orders.find(o => o.id === orderId);
        if (order && order.status === 'NEW') {
          this.db.advanceOrderStatus(orderId);
          this.showToast(`Kitchen started cooking Token #${orderId}`);
          this.refreshCurrentView();
        }
      }, 7000);

      setTimeout(() => {
        const order = this.db.data.orders.find(o => o.id === orderId);
        if (order && order.status === 'PREPARING') {
          this.db.advanceOrderStatus(orderId);
          this.showToast(`Token #${orderId} is READY for pickup at Counter 01`);
          this.refreshCurrentView();
        }
      }, 16000);
    }

    showOrderModal(order) {
      document.getElementById('modal-token-num').innerText = `#${order.id}`;
      document.getElementById('modal-eta-val').innerText = `${order.etaMin} minutes`;
      document.getElementById('modal-total-val').innerText = `â‚¹${order.total}`;
      document.getElementById('order-modal').classList.remove('hidden');
    }

    dismissOrderModal() {
      document.getElementById('order-modal').classList.add('hidden');
      this.switchStudentTab('orders');
    }

    // Live Orders & Stepper
    renderStudentOrders() {
      const container = document.getElementById('orders-list');
      if (!container) return;
      const safeUser = this.currentUser || { id: 2, name: "Sreeshanth" };
      const orders = this.db.getOrders(safeUser.id);

      const activeOrders = orders.filter(o => o.status !== 'COLLECTED');
      const pastOrders = orders.filter(o => o.status === 'COLLECTED');

      let html = '';

      // Tray Pending Notice
      if (this.cart && this.cart.length > 0) {
        const cartQty = this.cart.reduce((sum, i) => sum + i.qty, 0);
        const cartTotal = this.cart.reduce((sum, i) => sum + (i.food.price * i.qty), 0);
        const itemNames = this.cart.map(i => `${i.food.name} (x${i.qty})`).join(', ');

        html += `
          <div class="pending-tray-banner">
            <div class="pending-tray-info">
              <span class="pending-tray-badge">TRAY READY</span>
              <h4>You have ${cartQty} dish${cartQty > 1 ? 'es' : ''} in your tray waiting to order</h4>
              <p style="font-size: 0.88rem; color: var(--muted);">${itemNames} Â· <strong>Total: â‚¹${cartTotal}</strong></p>
            </div>
            <button class="btn btn-primary btn-md" onclick="app.placeOrder()">
              <span>CONFIRM ORDER (â‚¹${cartTotal}) &rarr;</span>
            </button>
          </div>
        `;
      }

      if (activeOrders.length === 0 && pastOrders.length === 0) {
        if (!this.cart || this.cart.length === 0) {
          html += `
            <div style="background: var(--bg-surface); border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 4rem 2rem; text-align: center;">
              <h3 style="font-family: var(--font-serif); font-size: 1.6rem; margin-bottom: 0.35rem;">No Orders Placed Yet</h3>
              <p style="color: var(--muted); margin-bottom: 1.75rem; max-width: 440px; margin-left: auto; margin-right: auto; font-size: 0.92rem;">
                You have no active meals in the kitchen queue. Choose a fresh dish from today's menu to place your first token.
              </p>
              <button class="btn btn-primary btn-md" onclick="app.switchStudentTab('menu')">
                <span>DISCOVER MENU &rarr;</span>
              </button>
            </div>
          `;
        }
        container.innerHTML = html;
        return;
      }

      // Active Orders Section
      if (activeOrders.length > 0) {
        const steps = [
          { key: "NEW", label: "ORDERED" },
          { key: "PREPARING", label: "PREPARING" },
          { key: "READY", label: "READY" },
          { key: "COLLECTED", label: "COLLECTED" }
        ];

        html += `
          <div style="margin-bottom: 2.5rem;">
            <span class="editorial-eyebrow" style="margin-bottom: 1rem;">ACTIVE KITCHEN TOKENS (${activeOrders.length})</span>
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
              ${activeOrders.map(o => {
                const currentIdx = steps.findIndex(s => s.key === o.status);
                const timeStr = new Date(o.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return `
                  <div class="order-ticket-card">
                    <div class="order-ticket-header">
                      <div>
                        <span class="order-token-badge">TOKEN #${o.id}</span>
                        <span class="order-meta-info">Placed at ${timeStr} Â· ETA ~${o.etaMin}m</span>
                      </div>
                      <div style="display: flex; align-items: baseline; gap: 1.25rem;">
                        <span class="order-total-figure">â‚¹${o.total}</span>
                        ${o.status === 'NEW' ? `
                          <button class="btn btn-secondary btn-xs" style="color: var(--accent); border-color: var(--accent);" onclick="app.handleCancelOrder(${o.id})">
                            Cancel
                          </button>
                        ` : ''}
                      </div>
                    </div>

                    <div class="order-timeline-stepper">
                      ${steps.map((s, idx) => {
                        let nodeClass = '';
                        let bulletChar = idx + 1;
                        if (idx < currentIdx || o.status === 'COLLECTED') {
                          nodeClass = 'completed';
                          bulletChar = 'âœ“';
                        } else if (idx === currentIdx) {
                          nodeClass = 'current';
                          bulletChar = 'â—';
                        }
                        return `
                          <div class="timeline-node ${nodeClass}">
                            <div class="timeline-bullet">${bulletChar}</div>
                            <span class="timeline-label">${s.label}</span>
                          </div>
                        `;
                      }).join('')}
                    </div>

                    <div class="order-summary-box">
                      <strong>Items:</strong> ${o.summary}
                    </div>

                    <div class="order-actions-bar">
                      <span style="font-family: var(--font-mono); font-size: 0.74rem; font-weight: 600; color: ${o.status === 'READY' ? 'var(--success)' : 'var(--ink)'};">
                        ${o.status === 'NEW' ? 'Order accepted in kitchen queue' : o.status === 'PREPARING' ? 'Cooking on the stove' : 'Ready for pickup at Counter 01'}
                      </span>
                      <button class="btn btn-secondary btn-xs" onclick="app.advanceOrderFromStudent(${o.id})">
                        ${o.status === 'NEW' ? 'Start Cooking' : o.status === 'PREPARING' ? 'Mark Ready' : 'Collect Dish'} &rarr;
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      // Past Orders Section
      if (pastOrders.length > 0) {
        html += `
          <div>
            <span class="editorial-eyebrow" style="margin-bottom: 1rem;">PAST FULFILLED ORDERS (${pastOrders.length})</span>
            <div style="display: flex; flex-direction: column; gap: 0.85rem;">
              ${pastOrders.map(o => {
                const dateStr = new Date(o.created).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                return `
                  <div class="history-item-row">
                    <div>
                      <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <strong style="font-family: var(--font-mono); font-size: 0.95rem;">#${o.id}</strong>
                        <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--muted);">${dateStr}</span>
                        <span style="font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; color: var(--success); background: var(--success-subtle); padding: 0.1rem 0.4rem; border-radius: var(--radius-xs);">COLLECTED âœ“</span>
                      </div>
                      <small style="color: var(--muted); display: block; margin-top: 0.25rem;">${o.summary}</small>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1.25rem;">
                      <span style="font-family: var(--font-mono); font-weight: 700; font-size: 1.05rem;">â‚¹${o.total}</span>
                      <button class="btn btn-arrow" onclick="app.reorderItem(${o.id})">REORDER &rarr;</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      container.innerHTML = html;
    }

    advanceOrderFromStudent(orderId) {
      this.db.advanceOrderStatus(orderId);
      this.renderStudentOrders();
      this.renderStudentProfile();
      this.updateActiveOrdersBadge();
      const order = this.db.data.orders.find(o => o.id === orderId);
      if (order) {
        if (order.status === 'COLLECTED') {
          this.showToast(`Token #${orderId} collected. Added to your dining history.`);
        } else {
          this.showToast(`Token #${orderId} moved to ${order.status}`);
        }
      }
    }

    handleCancelOrder(orderId) {
      if (confirm(`Cancel Order #${orderId}? Stock will be refunded.`)) {
        if (this.db.cancelOrder(orderId)) {
          this.showToast(`Order #${orderId} cancelled`);
          this.renderStudentOrders();
          this.renderStudentProfile();
          this.updateActiveOrdersBadge();
        }
      }
    }

    reorderItem(orderId) {
      const order = this.db.data.orders.find(o => o.id === orderId);
      if (!order || !order.items) return;

      order.items.forEach(it => {
        const food = this.db.getFoods().find(f => f.id === it.foodId);
        if (food && food.available) {
          const existing = this.cart.find(c => c.food.id === food.id);
          if (existing) {
            existing.qty += it.qty;
          } else {
            this.cart.push({ food, qty: it.qty });
          }
        }
      });

      this.renderCart();
      this.switchStudentTab('menu');
      this.scrollToTray();
      this.showToast(`Added dishes from Token #${orderId} to tray`);
    }

    renderStudentProfile() {
      const safeUser = this.currentUser || { id: 2, name: "Sreeshanth", email: "demo@campus.edu", studentId: "25R11A0501", role: "STUDENT" };
      const orders = this.db.getOrders(safeUser.id);
      const spent = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const fav = this.db.getStudentFavourite(safeUser.id);

      const microEl = document.getElementById('profile-micro-label');
      if (microEl) microEl.innerText = safeUser.role === 'FACULTY' ? 'FACULTY OVERVIEW' : 'STUDENT OVERVIEW';
      const nameEl = document.getElementById('profile-name');
      if (nameEl) nameEl.innerText = (safeUser.name || "SREESHANTH").toUpperCase();
      const countEl = document.getElementById('stat-total-orders');
      if (countEl) countEl.innerText = orders.length;
      const spentEl = document.getElementById('stat-total-spent');
      if (spentEl) spentEl.innerText = `â‚¹${spent}`;
      const favEl = document.getElementById('stat-fav-dish');
      if (favEl) {
        if (fav && fav.name) {
          favEl.innerText = fav.name;
        } else if (orders.length > 0 && orders[0].items && orders[0].items[0]) {
          favEl.innerText = orders[0].items[0].name;
        } else {
          favEl.innerText = 'â€”';
        }
      }

      const rollEl = document.getElementById('profile-roll');
      if (rollEl) rollEl.innerText = safeUser.facultyId || safeUser.studentId || 'N/A';
      const idLabel = document.getElementById('profile-id-label');
      if (idLabel) idLabel.innerText = safeUser.role === 'FACULTY' ? 'Faculty / Employee ID' : 'Roll / Student ID';
      const emailEl = document.getElementById('profile-email');
      if (emailEl) emailEl.innerText = safeUser.email || 'demo@campus.edu';

      const historyContainer = document.getElementById('profile-orders-list');
      const countLabel = document.getElementById('profile-history-count');
      if (countLabel) countLabel.innerText = `${orders.length} Orders Placed`;

      if (historyContainer) {
        if (orders.length === 0) {
          historyContainer.innerHTML = `
            <div style="padding: 2.5rem 1rem; text-align: center; color: var(--muted);">
              <p style="font-size: 0.92rem;">No order history yet. Discover dishes in the menu to place your first token.</p>
            </div>
          `;
        } else {
          historyContainer.innerHTML = orders.map(o => {
            const timeStr = new Date(o.created).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            return `
              <div class="history-item-row">
                <div>
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <strong style="font-family: var(--font-mono);">#${o.id}</strong>
                    <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--muted);">${timeStr}</span>
                    <span style="font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; color: ${o.status === 'COLLECTED' ? 'var(--success)' : 'var(--accent)'};">
                      ${o.status}
                    </span>
                  </div>
                  <small style="color: var(--muted); display: block; margin-top: 0.25rem;">${o.summary}</small>
                </div>
                <div style="display: flex; align-items: center; gap: 1.25rem;">
                  <strong style="font-family: var(--font-mono); font-size: 1.05rem;">â‚¹${o.total}</strong>
                  <button class="btn btn-arrow" onclick="app.reorderItem(${o.id})">REORDER &rarr;</button>
                </div>
              </div>
            `;
          }).join('');
        }
      }
    }

    // ==========================================
    // CANTEEN STAFF / KITCHEN OPERATIONS
    // ==========================================
    switchAdminTab(tab) {
      this.activeAdminTab = tab;
      ['live', 'menu', 'inv', 'analytics'].forEach(t => {
        const btn = document.getElementById(`admin-tab-${t}`);
        const sec = document.getElementById(`admin-sec-${t}`);
        if (btn) btn.classList.toggle('active', t === tab);
        if (sec) sec.classList.toggle('hidden', t !== tab);
      });
      this.renderAdminNavigation();
      this.refreshCurrentView();
    }

    renderAdminPortal() {
      this.renderKanbanBoard();
      this.renderAdminMenu();
      this.renderInventory();
      this.renderAnalytics();
    }

    renderKanbanBoard() {
      const orders = this.db.getOrders();
      const colNew = document.getElementById('col-orders-new');
      const colPrep = document.getElementById('col-orders-prep');
      const colReady = document.getElementById('col-orders-ready');
      if (!colNew || !colPrep || !colReady) return;

      const newOrders = orders.filter(o => o.status === 'NEW');
      const prepOrders = orders.filter(o => o.status === 'PREPARING');
      const readyOrders = orders.filter(o => o.status === 'READY');

      document.getElementById('count-new').innerText = newOrders.length;
      document.getElementById('count-prep').innerText = prepOrders.length;
      document.getElementById('count-ready').innerText = readyOrders.length;

      const renderCard = (o, btnText) => `
        <div class="kanban-ticket">
          <div class="ticket-top">
            <span class="ticket-token">#${o.id}</span>
            <span class="ticket-cust">${o.customerName}</span>
          </div>
          <div class="ticket-summary">${o.summary}</div>
          <div class="ticket-footer">
            <span class="ticket-price">â‚¹${o.total}</span>
            <button class="btn btn-primary btn-xs" onclick="app.advanceOrder(${o.id})">
              <span>${btnText} &rarr;</span>
            </button>
          </div>
        </div>
      `;

      colNew.innerHTML = newOrders.map(o => renderCard(o, 'START COOKING')).join('') || '<div style="color:var(--muted);font-family:var(--font-mono);font-size:0.75rem;text-align:center;padding:3rem 1rem;">NO PENDING ORDERS</div>';
      colPrep.innerHTML = prepOrders.map(o => renderCard(o, 'MARK READY')).join('') || '<div style="color:var(--muted);font-family:var(--font-mono);font-size:0.75rem;text-align:center;padding:3rem 1rem;">STOVE IS CLEAR</div>';
      colReady.innerHTML = readyOrders.map(o => renderCard(o, 'COLLECTED âœ“')).join('') || '<div style="color:var(--muted);font-family:var(--font-mono);font-size:0.75rem;text-align:center;padding:3rem 1rem;">COUNTER CLEARED</div>';
    }

    advanceOrder(orderId) {
      this.db.advanceOrderStatus(orderId);
      this.renderKanbanBoard();
      this.showToast(`Order #${orderId} status advanced`);
    }

    renderAdminMenu() {
      const container = document.getElementById('admin-food-table');
      if (!container) return;
      const foods = this.db.getFoods();

      container.innerHTML = foods.map(f => `
        <div class="food-editor-row">
          <div>
            <strong style="font-size: 0.92rem;">${f.name}</strong>
            <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--muted); margin-top: 0.15rem;">
              â‚¹${f.price} Â· ${f.category} Â· Prep: ${f.prepMin}m
            </div>
          </div>
          <button class="toggle-availability-btn ${f.available ? 'active' : 'inactive'}" 
                  onclick="app.toggleFoodAvailability(${f.id})">
            ${f.available ? 'â— AVAILABLE' : 'âœ• SOLD OUT'}
          </button>
        </div>
      `).join('');
    }

    toggleFoodAvailability(foodId) {
      const food = this.db.getFoods().find(f => f.id === foodId);
      if (food) {
        this.db.setFoodAvailability(foodId, !food.available);
        this.renderAdminMenu();
        this.showToast(`${food.name} is now ${!food.available ? 'Available' : 'Sold Out'}`);
      }
    }

    handleAddNewFood(e) {
      e.preventDefault();
      const name = document.getElementById('new-food-name').value;
      const price = parseFloat(document.getElementById('new-food-price').value);
      const prep = parseInt(document.getElementById('new-food-prep').value, 10);
      const cat = document.getElementById('new-food-cat').value;
      const desc = document.getElementById('new-food-desc').value;

      this.db.addFood({
        name,
        price,
        prepMin: prep,
        category: cat,
        desc,
        ingId: null,
        perServing: 0,
        available: true,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
      });

      e.target.reset();
      this.renderAdminMenu();
      this.showToast(`Added ${name} to canteen menu`);
    }

    renderInventory() {
      const container = document.getElementById('inv-table-body');
      if (!container) return;
      const items = this.db.getInventory();

      container.innerHTML = items.map(i => {
        const isLow = i.qty <= i.minQty;
        return `
          <div class="inv-stat-box ${isLow ? 'low-stock' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span class="inv-name">${i.ingredient}</span>
              <span style="font-family: var(--font-mono); font-size: 0.68rem; font-weight: 700; color: ${isLow ? 'var(--warning)' : 'var(--success)'};">
                ${isLow ? 'LOW STOCK' : 'GOOD'}
              </span>
            </div>
            <div class="inv-qty">${i.qty} <small style="font-size: 0.85rem; font-weight: 500;">${i.unit}</small></div>
            <div class="inv-meta">Threshold: min ${i.minQty} ${i.unit}</div>
          </div>
        `;
      }).join('');
    }

    renderAnalytics() {
      const an = this.db.getAnalytics();
      const totalEl = document.getElementById('an-total-orders');
      const revEl = document.getElementById('an-total-rev');
      const ticketEl = document.getElementById('an-avg-ticket');
      if (totalEl) totalEl.innerText = an.totalOrders;
      if (revEl) revEl.innerText = `â‚¹${an.totalRev}`;
      if (ticketEl) ticketEl.innerText = `â‚¹${an.avgTicket}`;

      // Popular items chart
      const popChart = document.getElementById('chart-popular');
      if (popChart) {
        const maxPop = an.topDishes.length > 0 ? Math.max(...an.topDishes.map(d => d[1])) : 1;
        popChart.innerHTML = an.topDishes.map(d => `
          <div class="chart-bar-row">
            <div class="chart-bar-info">
              <span>${d[0]}</span>
              <span>${d[1]} orders</span>
            </div>
            <div class="chart-track">
              <div class="chart-fill" style="width: ${(d[1] / maxPop) * 100}%;"></div>
            </div>
          </div>
        `).join('') || '<p style="color:var(--muted);font-size:0.82rem;">No orders fulfilled yet</p>';
      }

      // Peak Hours chart
      const peakChart = document.getElementById('chart-peak');
      if (peakChart) {
        const hours = Object.entries(an.hourCounts);
        const maxHr = hours.length > 0 ? Math.max(...hours.map(h => h[1])) : 1;
        peakChart.innerHTML = hours.map(h => `
          <div class="chart-bar-row">
            <div class="chart-bar-info">
              <span>${h[0]}</span>
              <span>${h[1]} orders</span>
            </div>
            <div class="chart-track">
              <div class="chart-fill" style="width: ${(h[1] / maxHr) * 100}%;"></div>
            </div>
          </div>
        `).join('') || '<p style="color:var(--muted);font-size:0.82rem;">No orders registered today</p>';
      }
    }

    placeTestOrder() {
      const foods = this.db.getFoods();
      const randomFood = foods[Math.floor(Math.random() * foods.length)];
      const student = this.db.data.users.find(u => u.role === 'STUDENT') || this.currentUser;
      const testCart = [{ food: randomFood, qty: 1 }];
      const subtotal = randomFood.price;
      const eta = this.db.calculateCartEta(testCart);

      try {
        const order = this.db.placeOrder(student, testCart, subtotal, eta);
        this.renderKanbanBoard();
        this.showToast(`Simulated test order #${order.id} sent`);
      } catch (err) {
        this.showToast(err.message);
      }
    }

    resetDbPrompt() {
      if (confirm('Reset database back to factory demo state? All test orders will be cleared.')) {
        this.db.reset();
        this.cart = [];
        this.render();
        this.showToast('Database reset to defaults');
      }
    }
  }

  // Expose global controller
  window.app = new CampusBiteApp();
})();



