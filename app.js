/**
 * CampusBite — Smart Canteen Ordering & Kitchen Management System
 * Full Client Database, Recommendation Engine, ETA Calculator & State Manager
 */

(function () {
  'use strict';

  // ==========================================
  // STORAGE & DATABASE SEEDING
  // ==========================================
  const DB_KEY = 'campusbite_db_v3';
  const SESSION_KEY = 'campusbite_session_v1';

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
      { id: 1, name: "Chicken Biryani", desc: "Spiced basmati rice, tender chicken & house aroma masala", price: 120, category: "Meals", prepMin: 12, ingId: 2, perServing: 0.25, available: true },
      { id: 2, name: "Veg Biryani", desc: "Long-grain basmati, seasonal vegetables & whole spices", price: 90, category: "Meals", prepMin: 10, ingId: 1, perServing: 0.2, available: true },
      { id: 3, name: "Paneer Rice", desc: "Wok-tossed rice with fresh cottage cheese cubes", price: 100, category: "Meals", prepMin: 10, ingId: 3, perServing: 0.25, available: true },
      { id: 4, name: "Veg Pizza", desc: "Crisp crust, mozzarella & fire-roasted vegetables", price: 90, category: "Snacks", prepMin: 14, ingId: 4, perServing: 1.0, available: true },
      { id: 5, name: "Chicken Burger", desc: "Crisp chicken patty, house sauce & fresh lettuce", price: 80, category: "Snacks", prepMin: 8, ingId: 2, perServing: 0.15, available: true },
      { id: 6, name: "Masala Dosa", desc: "Crispy crepe, spiced potato masala & two chutneys", price: 60, category: "Meals", prepMin: 8, ingId: 1, perServing: 0.15, available: true },
      { id: 7, name: "Samosa (2 pcs)", desc: "Golden crust, potato & green pea filling, mint chutney", price: 25, category: "Snacks", prepMin: 3, ingId: 5, perServing: 0.1, available: true },
      { id: 8, name: "French Fries", desc: "Salted, golden crisp potato batons", price: 50, category: "Snacks", prepMin: 6, ingId: 5, perServing: 0.1, available: true },
      { id: 9, name: "Masala Coke", desc: "Chilled fizzy soda with fresh lime & rock salt chaat masala", price: 40, category: "Drinks", prepMin: 2, ingId: null, perServing: 0, available: true },
      { id: 10, name: "Cold Coffee", desc: "Slow brewed espresso, rich milk, lightly sweet", price: 60, category: "Drinks", prepMin: 4, ingId: 6, perServing: 0.2, available: true },
      { id: 11, name: "Lemon Tea", desc: "Piping hot black tea, freshly squeezed lemon", price: 20, category: "Drinks", prepMin: 3, ingId: null, perServing: 0, available: true },
      { id: 12, name: "Gulab Jamun (2 pcs)", desc: "Warm melt-in-mouth milk dumplings in rose cardamom syrup", price: 40, category: "Desserts", prepMin: 2, ingId: null, perServing: 0, available: true },
      { id: 13, name: "Ice Cream Scoop", desc: "Creamy Madagascar vanilla bean scoop", price: 35, category: "Desserts", prepMin: 1, ingId: null, perServing: 0, available: true }
    ],
    orders: [],
    nextOrderId: 101
  };

  class Database {
    constructor() {
      this.load();
    }

    load() {
      // Purge older legacy cache keys
      localStorage.removeItem('campusbite_db_v1');
      localStorage.removeItem('campusbite_db_v2');

      const raw = localStorage.getItem(DB_KEY);
      if (!raw) {
        this.data = JSON.parse(JSON.stringify(DEFAULT_DB));
        this.save();
      } else {
        try {
          this.data = JSON.parse(raw);
          if (!this.data || typeof this.data !== 'object') {
            this.data = JSON.parse(JSON.stringify(DEFAULT_DB));
          }
        } catch (e) {
          this.data = JSON.parse(JSON.stringify(DEFAULT_DB));
          this.save();
        }
      }

      // Integrity checks and auto-repair
      if (!Array.isArray(this.data.orders)) this.data.orders = [];
      if (!Array.isArray(this.data.foods) || this.data.foods.length === 0) this.data.foods = DEFAULT_DB.foods;
      if (!Array.isArray(this.data.inventory) || this.data.inventory.length === 0) this.data.inventory = DEFAULT_DB.inventory;
      if (!Array.isArray(this.data.users)) {
        this.data.users = DEFAULT_DB.users;
      } else {
        // Auto-migrate any existing cached profile for Chandrashekar to FACULTY
        this.data.users.forEach(u => {
          if (u.id === 3 || u.name === "Ananya" || u.name === "Chandrashekar" || u.email === "ananya@campus.edu" || u.email === "chandrashekar@campus.edu") {
            u.name = "Chandrashekar";
            u.email = "chandrashekar@campus.edu";
            u.role = "FACULTY";
            u.facultyId = "FAC-CS-108";
            u.studentId = null;
          }
        });
      }

      // Ensure nextOrderId is valid and higher than any existing order
      if (!this.data.nextOrderId || isNaN(this.data.nextOrderId) || this.data.nextOrderId < 101) {
        const maxId = this.data.orders.reduce((max, o) => Math.max(max, Number(o.id) || 100), 100);
        this.data.nextOrderId = maxId + 1;
      }

      // Guarantee demo stock is replenished so ordering never fails
      this.data.inventory.forEach(ing => {
        if (typeof ing.qty !== 'number' || isNaN(ing.qty) || ing.qty < (ing.minQty || 2) + 2) {
          ing.qty = Math.max(Number(ing.qty) || 0, 15.0);
        }
      });

      // Ensure foods are available for ordering
      this.data.foods.forEach(f => {
        if (typeof f.available !== 'boolean') f.available = true;
      });
    }

    save() {
      localStorage.setItem(DB_KEY, JSON.stringify(this.data));
    }

    reset() {
      this.data = JSON.parse(JSON.stringify(DEFAULT_DB));
      this.save();
    }

    // Auth
    login(identifier, password) {
      const cleanId = (identifier || '').trim().toLowerCase();
      const user = this.data.users.find(u => 
        (u.email.toLowerCase() === cleanId || 
         (cleanId === 'ananya@campus.edu' && u.email.toLowerCase() === 'chandrashekar@campus.edu') ||
         (u.studentId && u.studentId.toLowerCase() === cleanId) ||
         (u.facultyId && u.facultyId.toLowerCase() === cleanId)) &&
        u.pw === password
      );
      return user || null;
    }

    // Foods
    getFoods() {
      return [...this.data.foods];
    }

    setFoodAvailability(foodId, isAvailable) {
      const food = this.data.foods.find(f => f.id === foodId);
      if (food) {
        food.available = isAvailable;
        this.save();
      }
    }

    addFood(name, price, category, prepMin, desc) {
      const newId = this.data.foods.reduce((max, f) => Math.max(max, f.id), 0) + 1;
      const item = {
        id: newId,
        name: name.trim(),
        desc: desc ? desc.trim() : "Made fresh today",
        price: parseFloat(price),
        category: category || "Meals",
        prepMin: parseInt(prepMin, 10),
        ingId: null,
        perServing: 0,
        available: true
      };
      this.data.foods.push(item);
      this.save();
      return item;
    }

    // Inventory & Stock
    getInventory() {
      return [...this.data.inventory];
    }

    restock(invId, amount) {
      const inv = this.data.inventory.find(i => i.id === invId);
      if (inv) {
        inv.qty = Math.round((inv.qty + amount) * 100) / 100;
        // Auto re-enable dishes whose ingredients are now safe
        this.data.foods.forEach(f => {
          if (f.ingId) {
            const ing = this.data.inventory.find(i => i.id === f.ingId);
            if (ing && ing.qty > ing.minQty) {
              f.available = true;
            }
          }
        });
        this.save();
      }
    }

    // Queue & ETA
    getActiveQueueCount() {
      return this.data.orders.filter(o => o.status === 'NEW' || o.status === 'PREPARING').length;
    }

    calculateCartEta(cartItems) {
      if (!cartItems || cartItems.length === 0) return 0;
      const maxPrep = Math.max(...cartItems.map(i => i.food.prepMin));
      const queuePenalty = 2 * this.getActiveQueueCount();
      return maxPrep + queuePenalty;
    }

    // Order Placement (Atomic Transaction simulation)
    placeOrder(user, cartItems, total, etaMin) {
      if (!cartItems || cartItems.length === 0) {
        throw new Error("Cannot place an empty order.");
      }

      // Safe user resolution
      const safeUser = user || (this.data.users && this.data.users.find(u => u.role === 'STUDENT')) || { id: 2, name: "Sreeshanth" };
      const userId = Number(safeUser.id) || 2;
      const userName = safeUser.name || "Sreeshanth";

      // 1. Validate availability and ensure stock
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
        if (food.ingId) {
          const ing = this.data.inventory.find(i => i.id === food.ingId);
          ing.qty = Math.max(0, Math.round((ing.qty - (food.perServing * item.qty)) * 100) / 100);
        }
      }

      // 3. Create Order with safe orderId
      if (!this.data.nextOrderId || isNaN(this.data.nextOrderId)) {
        const maxId = (this.data.orders || []).reduce((max, o) => Math.max(max, Number(o.id) || 100), 100);
        this.data.nextOrderId = maxId + 1;
      }
      const orderId = this.data.nextOrderId++;
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

      if (!Array.isArray(this.data.orders)) this.data.orders = [];
      this.data.orders.unshift(newOrder);
      this.save();
      return newOrder;
    }

    // Order Advance
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
          // Restore ingredient stock
          for (const item of order.items) {
            const food = this.data.foods.find(f => f.id === item.foodId);
            if (food && food.ingId) {
              const ing = this.data.inventory.find(i => i.id === food.ingId);
              if (ing) {
                ing.qty = Math.round((ing.qty + (food.perServing * item.qty)) * 100) / 100;
              }
            }
          }
          this.data.orders.splice(idx, 1);
          this.save();
          return true;
        }
      }
      return false;
    }

    getOrders(userId = null) {
      if (!Array.isArray(this.data.orders)) this.data.orders = [];
      if (userId !== null && userId !== undefined) {
        return this.data.orders.filter(o => String(o.userId) === String(userId));
      }
      return [...this.data.orders];
    }

    // Recommendations (Market Basket / Co-occurrence)
    getStudentFavourite(userId) {
      const counts = {};
      const orders = this.getOrders(userId);
      orders.forEach(o => {
        (o.items || []).forEach(it => {
          const key = it.foodId || it.name;
          counts[key] = (counts[key] || 0) + (Number(it.qty) || 1);
        });
      });
      let favKey = null;
      let maxQty = 0;
      for (const id in counts) {
        if (counts[id] > maxQty) {
          maxQty = counts[id];
          favKey = id;
        }
      }
      if (!favKey) return null;
      const found = this.data.foods.find(f => f.id === Number(favKey) || f.name === favKey);
      return found || { name: String(favKey) };
    }

    getRecommendations(userId) {
      const fav = this.getStudentFavourite(userId);
      if (!fav) return [];

      // Find orders that contain fav dish
      const pairCounts = {};
      this.data.orders.forEach(o => {
        const containsFav = o.items.some(i => i.foodId === fav.id);
        if (containsFav) {
          o.items.forEach(it => {
            if (it.foodId !== fav.id) {
              pairCounts[it.foodId] = (pairCounts[it.foodId] || 0) + 1;
            }
          });
        }
      });

      // Sort pairs by occurrence
      const sortedIds = Object.keys(pairCounts)
        .sort((a, b) => pairCounts[b] - pairCounts[a])
        .slice(0, 3)
        .map(id => parseInt(id, 10));

      return sortedIds
        .map(id => this.data.foods.find(f => f.id === id))
        .filter(f => f && f.available);
    }

    // Analytics
    getAnalytics() {
      const completed = this.data.orders.filter(o => o.status === 'COLLECTED');
      const totalRev = completed.reduce((sum, o) => sum + o.total, 0);
      const avgTicket = completed.length > 0 ? Math.round(totalRev / completed.length) : 0;

      // Popular items
      const itemCounts = {};
      completed.forEach(o => {
        o.items.forEach(it => {
          itemCounts[it.name] = (itemCounts[it.name] || 0) + it.qty;
        });
      });
      const topDishes = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      // Peak Hours
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
      this.pollTimer = null;

      this.init();
    }

    init() {
      // Check saved session
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

    // Notifications
    showToast(msg) {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerText = msg;
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    // Auth & Direct Role Switchers
    loginAsStudent() {
      let student = (this.db.data.users || []).find(u => u.role === 'STUDENT') || {
        id: 2, name: "Sreeshanth", email: "demo@campus.edu", pw: "student123", role: "STUDENT", studentId: "25R11A0501"
      };
      this.currentUser = student;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(student));
      this.activeStudentTab = 'menu';
      this.render();
      this.showToast(`Logged in as ${student.name} (Student)`);
    }

    loginAsFaculty() {
      let faculty = (this.db.data.users || []).find(u => u.role === 'FACULTY') || {
        id: 3, name: "Chandrashekar", email: "chandrashekar@campus.edu", pw: "student123", role: "FACULTY", facultyId: "FAC-CS-108"
      };
      this.currentUser = faculty;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(faculty));
      this.activeStudentTab = 'menu';
      this.render();
      this.showToast(`Logged in as Prof. ${faculty.name} (Faculty)`);
    }

    loginAsAdmin() {
      let admin = (this.db.data.users || []).find(u => u.role === 'ADMIN') || {
        id: 1, name: "Canteen Admin", email: "admin@campus.edu", pw: "admin123", role: "ADMIN"
      };
      this.currentUser = admin;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(admin));
      this.activeAdminTab = 'live';
      this.render();
      this.showToast('Welcome to Canteen Kitchen Dashboard!');
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

    fillDemo(id, pw) {
      document.getElementById('login-id').value = id;
      document.getElementById('login-pw').value = pw;
      this.handleLogin(new Event('submit'));
    }

    handleLogin(e) {
      if (e && e.preventDefault) e.preventDefault();
      const id = document.getElementById('login-id').value;
      const pw = document.getElementById('login-pw').value;
      const errBox = document.getElementById('login-error');

      const user = this.db.login(id, pw);
      if (!user) {
        errBox.innerText = 'Invalid credentials. Please check your student ID or email.';
        errBox.classList.remove('hidden');
        return;
      }

      errBox.classList.add('hidden');
      this.currentUser = user;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      this.render();
      this.showToast(`Welcome back, ${user.name}!`);
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

    // Rendering core views
    render() {
      const viewLogin = document.getElementById('view-login');
      const viewStudent = document.getElementById('view-student');
      const viewAdmin = document.getElementById('view-admin');
      const userControls = document.getElementById('user-controls');

      if (!this.currentUser) {
        viewLogin.classList.remove('hidden');
        viewStudent.classList.add('hidden');
        viewAdmin.classList.add('hidden');
        userControls.classList.add('hidden');
        return;
      }

      viewLogin.classList.add('hidden');
      userControls.classList.remove('hidden');

      // Update header profile pill
      document.getElementById('user-display-name').innerText = this.currentUser.name;
      const badge = document.getElementById('user-display-role');
      badge.innerText = this.currentUser.role;
      badge.className = `user-badge ${this.currentUser.role.toLowerCase()}`;
      document.getElementById('user-avatar').innerText = this.currentUser.name.charAt(0);

      // Update portal switcher button in top navbar
      const switchBtn = document.getElementById('btn-toggle-portal');
      if (switchBtn) {
        if (this.currentUser.role === 'ADMIN') {
          switchBtn.innerHTML = `<span>🍽️ Customer Menu View</span>`;
          switchBtn.title = "Switch to Customer Ordering View";
        } else {
          switchBtn.innerHTML = `<span>👨‍🍳 Kitchen Dashboard</span>`;
          switchBtn.title = "Switch to Kitchen Staff Dashboard & Kanban";
        }
      }

      if (this.currentUser.role === 'ADMIN') {
        viewStudent.classList.add('hidden');
        viewAdmin.classList.remove('hidden');
        this.renderAdminPortal();
      } else {
        viewStudent.classList.remove('hidden');
        viewAdmin.classList.add('hidden');
        const titleEl = document.getElementById('student-home-title');
        if (titleEl) {
          titleEl.innerText = this.currentUser.role === 'FACULTY' ? "FACULTY LOUNGE DINING" : "WHAT'S FOR LUNCH?";
        }
        this.renderStudentPortal();
      }
    }

    refreshCurrentView() {
      if (!this.currentUser) return;
      if (this.currentUser.role !== 'ADMIN') {
        if (this.activeStudentTab === 'menu') {
          this.renderMenuGrid();
          this.renderRecommendations();
          this.updateKitchenQueueIndicator();
        } else if (this.activeStudentTab === 'orders') {
          this.renderStudentOrders();
        } else if (this.activeStudentTab === 'profile') {
          this.renderStudentProfile();
        }
        this.updateActiveOrdersBadge();
      } else {
        if (this.activeAdminTab === 'live') {
          this.renderKanbanBoard();
        } else if (this.activeAdminTab === 'menu') {
          this.renderAdminMenu();
        } else if (this.activeAdminTab === 'inv') {
          this.renderInventory();
        } else if (this.activeAdminTab === 'analytics') {
          this.renderAnalytics();
        }
      }
    }

    // ==========================================
    // STUDENT PORTAL
    // ==========================================
    switchStudentTab(tab) {
      this.activeStudentTab = tab;
      ['menu', 'orders', 'profile'].forEach(t => {
        document.getElementById(`tab-btn-${t}`).classList.toggle('active', t === tab);
        document.getElementById(`section-${t}`).classList.toggle('hidden', t !== tab);
      });
      this.refreshCurrentView();
    }

    updateActiveOrdersBadge() {
      const active = this.db.getOrders(this.currentUser.id).filter(o => o.status !== 'COLLECTED');
      const badge = document.getElementById('badge-active-orders');
      if (active.length > 0) {
        badge.innerText = active.length;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }

    updateKitchenQueueIndicator() {
      const count = this.db.getActiveQueueCount();
      const text = document.getElementById('kitchen-status-text');
      text.innerText = count > 0 ? `Kitchen live · ${count} orders queued` : `Kitchen ready · Fast turnaround`;
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
      const chips = document.querySelectorAll('#category-chips .chip');
      chips.forEach(c => c.classList.remove('active'));
      if (element) element.classList.add('active');
      this.renderMenuGrid();
    }

    filterMenu() {
      this.renderMenuGrid();
    }

    renderMenuGrid() {
      const grid = document.getElementById('food-grid');
      const search = (document.getElementById('food-search').value || '').toLowerCase().trim();
      const foods = this.db.getFoods();

      const filtered = foods.filter(f => {
        const matchCat = this.currentCategory === 'All' || f.category === this.currentCategory;
        const matchSearch = f.name.toLowerCase().includes(search) || f.desc.toLowerCase().includes(search);
        return matchCat && matchSearch;
      });

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 3rem; text-align: center; color: var(--text-muted);">
            <h3>No dishes found</h3>
            <p>Try searching for something else or pick another category.</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = filtered.map(f => `
        <div class="card food-card ${f.available ? '' : 'unavailable'}">
          <div class="food-card-top">
            <div class="card-tags">
              <span class="food-category-tag">${f.category.toUpperCase()}</span>
              <span class="food-prep-pill">⏱️ ${f.prepMin} min</span>
            </div>
            <h4 class="food-name">${f.name}</h4>
            <p class="food-desc">${f.desc}</p>
          </div>
          <div class="food-card-bottom">
            <span class="food-price">₹${f.price}</span>
            <button class="btn btn-primary btn-sm" 
                    ${f.available ? '' : 'disabled'}
                    onclick="app.addToCart(${f.id})">
              ${f.available ? '+ ADD TO TRAY' : 'SOLD OUT'}
            </button>
          </div>
        </div>
      `).join('');
    }

    renderRecommendations() {
      const recBox = document.getElementById('recommendation-box');
      const recTitle = document.getElementById('rec-title');
      const recGrid = document.getElementById('rec-cards');

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
      recTitle.innerText = `BECAUSE YOU LOVE ${fav.name.toUpperCase()}...`;
      recGrid.innerHTML = recs.map(f => `
        <div class="card food-card" style="padding: 1rem;">
          <div class="card-tags" style="margin-bottom: 0.25rem;">
            <span class="food-category-tag">${f.category.toUpperCase()}</span>
            <span class="food-prep-pill">⏱️ ${f.prepMin}m</span>
          </div>
          <strong style="font-size: 0.95rem; margin-bottom: 0.5rem; display: block;">${f.name}</strong>
          <div class="food-card-bottom" style="padding-top: 0.5rem;">
            <span class="food-price" style="font-size: 1.1rem;">₹${f.price}</span>
            <button class="btn btn-primary btn-xs" onclick="app.addToCart(${f.id})">+ ADD</button>
          </div>
        </div>
      `).join('');
    }

    // Cart Management
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
      if (this.activeStudentTab === 'orders') {
        this.renderStudentOrders();
      }
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
      if (this.activeStudentTab === 'orders') {
        this.renderStudentOrders();
      }
    }

    clearCart() {
      this.cart = [];
      this.renderCart();
      if (this.activeStudentTab === 'orders') {
        this.renderStudentOrders();
      }
      this.showToast('Tray cleared');
    }

    renderCart() {
      const container = document.getElementById('cart-items');
      const footer = document.getElementById('cart-footer');

      if (this.cart.length === 0) {
        container.innerHTML = `
          <div class="cart-empty-state">
            <span class="empty-icon">🍽️</span>
            <p>Your tray is hungry.</p>
            <small>Select dishes from the menu to start ordering.</small>
          </div>
        `;
        footer.classList.add('hidden');
        return;
      }

      footer.classList.remove('hidden');
      container.innerHTML = this.cart.map(item => `
        <div class="cart-item-row">
          <div>
            <div class="cart-item-name">${item.food.name}</div>
            <div class="cart-item-price">₹${item.food.price * item.qty} (₹${item.food.price} ea)</div>
          </div>
          <div class="cart-stepper">
            <button class="btn-step" onclick="app.changeCartQty(${item.food.id}, -1)">−</button>
            <span style="font-size: 0.85rem; font-weight: 700; min-width: 16px; text-align: center;">${item.qty}</span>
            <button class="btn-step" onclick="app.changeCartQty(${item.food.id}, 1)">+</button>
          </div>
        </div>
      `).join('');

      // Calculations
      const subtotal = this.cart.reduce((sum, i) => sum + (i.food.price * i.qty), 0);
      const eta = this.db.calculateCartEta(this.cart);

      document.getElementById('bill-subtotal').innerText = `₹${subtotal}`;
      document.getElementById('bill-total').innerText = `₹${subtotal}`;
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
        this.showToast(`🎉 Order #${order.id} sent to kitchen queue!`);
        this.showOrderModal(order);
      } catch (err) {
        console.error("Order placement error:", err);
        alert(err.message);
        this.db.load();
        this.renderMenuGrid();
      }
    }

    scheduleOrderAutoProgress(orderId) {
      // Simulate live kitchen prep & ready progression automatically
      setTimeout(() => {
        const order = this.db.data.orders.find(o => o.id === orderId);
        if (order && order.status === 'NEW') {
          this.db.advanceOrderStatus(orderId);
          this.showToast(`👨‍🍳 Kitchen started cooking Token #${orderId}!`);
          this.refreshCurrentView();
        }
      }, 7000);

      setTimeout(() => {
        const order = this.db.data.orders.find(o => o.id === orderId);
        if (order && order.status === 'PREPARING') {
          this.db.advanceOrderStatus(orderId);
          this.showToast(`🔔 Token #${orderId} is READY for pickup at Counter 1!`);
          this.refreshCurrentView();
        }
      }, 15000);
    }

    showOrderModal(order) {
      document.getElementById('modal-token-num').innerText = `#${order.id}`;
      document.getElementById('modal-eta-val').innerText = `${order.etaMin} minutes`;
      document.getElementById('modal-total-val').innerText = `₹${order.total}`;
      document.getElementById('order-modal').classList.remove('hidden');
    }

    dismissOrderModal() {
      document.getElementById('order-modal').classList.add('hidden');
      this.switchStudentTab('orders');
    }

    renderStudentOrders() {
      const container = document.getElementById('orders-list');
      const safeUser = this.currentUser || { id: 2, name: "Sreeshanth" };
      const orders = this.db.getOrders(safeUser.id);

      const activeOrders = orders.filter(o => o.status !== 'COLLECTED');
      const pastOrders = orders.filter(o => o.status === 'COLLECTED');

      let html = '';

      // TRAY PENDING NOTICE:
      // If user has items in their tray, show a prominent banner here so they can place order directly
      if (this.cart && this.cart.length > 0) {
        const cartQty = this.cart.reduce((sum, i) => sum + i.qty, 0);
        const cartTotal = this.cart.reduce((sum, i) => sum + (i.food.price * i.qty), 0);
        const itemNames = this.cart.map(i => `${i.food.name} (x${i.qty})`).join(', ');

        html += `
          <div class="pending-tray-banner">
            <div class="pending-tray-info">
              <span class="pending-tray-badge">⚡ READY IN TRAY</span>
              <h4>You have ${cartQty} dish${cartQty > 1 ? 'es' : ''} in your tray waiting to order!</h4>
              <p>${itemNames} · <strong>Total Payable: ₹${cartTotal}</strong></p>
            </div>
            <button class="btn btn-primary btn-md pulse" onclick="app.placeOrder()">
              <span>CONFIRM & PLACE ORDER (₹${cartTotal})</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        `;
      }

      if (activeOrders.length === 0 && pastOrders.length === 0) {
        if (!this.cart || this.cart.length === 0) {
          html += `
            <div class="card" style="padding: 3.5rem 2rem; text-align: center; border: 2px dashed var(--border-subtle);">
              <div style="font-size: 3rem; margin-bottom: 0.75rem;">🍳</div>
              <h3 style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; margin-bottom: 0.4rem;">No Orders Placed Yet</h3>
              <p style="color: var(--text-secondary); margin-bottom: 1.5rem; max-width: 420px; margin-left: auto; margin-right: auto; font-size: 0.95rem;">
                You have no active meals in the kitchen queue. Choose a dish from today's menu to place an order!
              </p>
              <button class="btn btn-primary btn-lg" onclick="app.switchStudentTab('menu')">
                DISCOVER MENU & ORDER
              </button>
            </div>
          `;
        }
        container.innerHTML = html;
        return;
      }

      // Active Orders
      if (activeOrders.length > 0) {
        const steps = [
          { key: "NEW", label: "ORDERED" },
          { key: "PREPARING", label: "PREPARING" },
          { key: "READY", label: "READY FOR PICKUP" },
          { key: "COLLECTED", label: "COLLECTED" }
        ];

        html += `
          <div style="margin-bottom: 2rem;">
            <h4 style="font-size: 0.75rem; font-weight: 800; letter-spacing: 0.1em; color: var(--primary); text-transform: uppercase; margin-bottom: 1rem;">
              ACTIVE KITCHEN ORDERS (${activeOrders.length})
            </h4>
            <div style="display: flex; flex-direction: column; gap: 1.25rem;">
              ${activeOrders.map(o => {
                const currentIdx = steps.findIndex(s => s.key === o.status);
                const timeStr = new Date(o.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return `
                  <div class="card order-card">
                    <div class="order-card-header">
                      <div class="order-id-group">
                        <span class="order-token">Token #${o.id}</span>
                        <span class="order-time">Placed at ${timeStr} · ETA ~${o.etaMin}m</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 1rem;">
                        <span class="order-price">₹${o.total}</span>
                        ${o.status === 'NEW' ? `
                          <button class="btn btn-ghost btn-xs" style="color: #DC2626; border-color: #FCA5A5;" onclick="app.handleCancelOrder(${o.id})">
                            ✕ Cancel
                          </button>
                        ` : ''}
                      </div>
                    </div>

                    <div class="order-stepper">
                      ${steps.map((s, idx) => {
                        let statusClass = '';
                        let bulletContent = idx + 1;
                        if (idx < currentIdx || o.status === 'COLLECTED') {
                          statusClass = 'completed';
                          bulletContent = '✓';
                        } else if (idx === currentIdx) {
                          statusClass = 'current';
                          bulletContent = '●';
                        }
                        return `
                          <div class="step-node ${statusClass}">
                            <div class="step-bullet">${bulletContent}</div>
                            <span class="step-label">${s.label}</span>
                          </div>
                        `;
                      }).join('')}
                    </div>

                    <div class="order-summary-text">
                      <strong>Items:</strong> ${o.summary}
                    </div>

                    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px dashed var(--border-subtle);">
                      <div>
                        ${o.status === 'NEW' ? '<span style="background: #FEF3C7; color: #D97706; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 999px;">⏳ Order Received in Kitchen</span>' : ''}
                        ${o.status === 'PREPARING' ? '<span style="background: #FEE2E2; color: #DC2626; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 999px;">🔥 Sizzling & Cooking in Kitchen</span>' : ''}
                        ${o.status === 'READY' ? '<span style="background: #D1FAE5; color: #059669; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 999px;">🔔 Ready for Pickup at Counter 1!</span>' : ''}
                      </div>
                      <button class="btn btn-ghost btn-xs" style="font-size: 0.75rem;" onclick="app.advanceOrderFromStudent(${o.id})">
                        ${o.status === 'NEW' ? '👨‍🍳 Kitchen: Start Cooking' : o.status === 'PREPARING' ? '🔔 Kitchen: Mark Ready' : '✓ Pick Up & Collect'}
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="card" style="padding: 1.75rem; text-align: center; margin-bottom: 2rem; background: var(--bg-surface-subtle);">
            <p style="color: var(--text-secondary); font-size: 0.9rem;">
              No active orders currently in the kitchen.
            </p>
            <button class="btn btn-ghost btn-sm" style="margin-top: 0.75rem;" onclick="app.switchStudentTab('menu')">
              + Order Something New
            </button>
          </div>
        `;
      }

      // Past Orders Section
      if (pastOrders.length > 0) {
        html += `
          <div>
            <h4 style="font-size: 0.75rem; font-weight: 800; letter-spacing: 0.1em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 1rem;">
              PAST COMPLETED ORDERS (${pastOrders.length})
            </h4>
            <div style="display: flex; flex-direction: column; gap: 0.85rem;">
              ${pastOrders.map(o => {
                const dateStr = new Date(o.created).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                return `
                  <div class="card" style="padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between; opacity: 0.9;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <strong style="font-family: var(--font-display);">Token #${o.id}</strong>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">${dateStr}</span>
                        <span style="font-size: 0.7rem; font-weight: 700; color: var(--success); background: var(--success-subtle); padding: 0.1rem 0.4rem; border-radius: 999px;">COLLECTED ✓</span>
                      </div>
                      <small style="color: var(--text-secondary); display: block; margin-top: 0.2rem;">${o.summary}</small>
                    </div>
                    <span style="font-family: var(--font-display); font-weight: 800; font-size: 1.1rem;">₹${o.total}</span>
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
          this.showToast(`Token #${orderId} collected! Added to your profile statistics.`);
        } else {
          this.showToast(`Token #${orderId} moved to ${order.status}`);
        }
      }
    }

    handleCancelOrder(orderId) {
      if (confirm(`Cancel Order #${orderId}? Stock will be refunded.`)) {
        if (this.db.cancelOrder(orderId)) {
          this.showToast(`Order #${orderId} cancelled.`);
          this.renderStudentOrders();
          this.renderStudentProfile();
          this.updateActiveOrdersBadge();
        }
      }
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
      if (spentEl) spentEl.innerText = `₹${spent}`;
      const favEl = document.getElementById('stat-fav-dish');
      if (favEl) {
        if (fav && fav.name) {
          favEl.innerText = fav.name;
        } else if (orders.length > 0 && orders[0].items && orders[0].items[0]) {
          favEl.innerText = orders[0].items[0].name;
        } else {
          favEl.innerText = '—';
        }
      }
      const headingEl = document.getElementById('profile-detail-heading');
      if (headingEl) headingEl.innerText = safeUser.role === 'FACULTY' ? 'Faculty Identification' : 'Student Identification';
      const idLabelEl = document.getElementById('profile-id-label');
      if (idLabelEl) idLabelEl.innerText = safeUser.role === 'FACULTY' ? 'Faculty / Employee ID' : 'Roll / Student ID';
      const rollEl = document.getElementById('profile-roll');
      if (rollEl) rollEl.innerText = safeUser.facultyId || safeUser.studentId || 'N/A';
      const emailEl = document.getElementById('profile-email');
      if (emailEl) emailEl.innerText = safeUser.email || 'demo@campus.edu';

      // Populate recent orders list in profile
      const historyContainer = document.getElementById('profile-orders-list');
      const countLabel = document.getElementById('profile-history-count');
      if (countLabel) countLabel.innerText = `${orders.length} Orders Placed`;

      if (historyContainer) {
        if (orders.length === 0) {
          historyContainer.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--text-muted);">
              <p>No order history yet. Discover dishes in the menu and place your first meal!</p>
            </div>
          `;
        } else {
          historyContainer.innerHTML = orders.map(o => {
            const timeStr = new Date(o.created).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            let badge = '';
            if (o.status === 'NEW') badge = '<span style="background: #FEF3C7; color: #D97706; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 999px;">ORDERED</span>';
            else if (o.status === 'PREPARING') badge = '<span style="background: #FEE2E2; color: #DC2626; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 999px;">PREPARING</span>';
            else if (o.status === 'READY') badge = '<span style="background: #D1FAE5; color: #059669; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 999px;">READY</span>';
            else badge = '<span style="background: var(--bg-surface-subtle); color: var(--text-secondary); font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 999px;">COLLECTED ✓</span>';

            return `
              <div class="food-row-item" style="padding: 0.85rem 1rem;">
                <div class="food-row-info">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <strong>Token #${o.id}</strong>
                    ${badge}
                    <small style="color: var(--text-muted);">${timeStr}</small>
                  </div>
                  <small style="margin-top: 0.2rem; color: var(--text-secondary);">${o.summary}</small>
                </div>
                <div style="font-family: var(--font-display); font-weight: 800; font-size: 1.15rem; color: var(--text-primary);">
                  ₹${o.total}
                </div>
              </div>
            `;
          }).join('');
        }
      }
    }

    // ==========================================
    // ADMIN PORTAL
    // ==========================================
    switchAdminTab(tab) {
      this.activeAdminTab = tab;
      ['live', 'menu', 'inv', 'analytics'].forEach(t => {
        const btn = document.getElementById(`admin-tab-${t}`);
        const sec = document.getElementById(`admin-sec-${t}`);
        if (btn) btn.classList.toggle('active', t === tab);
        if (sec) sec.classList.toggle('hidden', t !== tab);
      });
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

      const newOrders = orders.filter(o => o.status === 'NEW');
      const prepOrders = orders.filter(o => o.status === 'PREPARING');
      const readyOrders = orders.filter(o => o.status === 'READY');

      document.getElementById('count-new').innerText = newOrders.length;
      document.getElementById('count-prep').innerText = prepOrders.length;
      document.getElementById('count-ready').innerText = readyOrders.length;

      const renderCard = (o, btnText) => `
        <div class="card kanban-card">
          <div class="kanban-card-top">
            <span class="k-token">#${o.id}</span>
            <span class="k-cust">${o.customerName}</span>
          </div>
          <div class="k-summary">${o.summary}</div>
          <div class="k-footer">
            <span class="k-price">₹${o.total}</span>
            <button class="btn btn-primary btn-sm" onclick="app.advanceOrder(${o.id})">
              ${btnText}
            </button>
          </div>
        </div>
      `;

      colNew.innerHTML = newOrders.map(o => renderCard(o, 'ACCEPT & START')).join('') || '<div style="color:var(--text-muted);font-size:0.8rem;text-align:center;padding:2rem;">No new orders</div>';
      colPrep.innerHTML = prepOrders.map(o => renderCard(o, 'MARK READY')).join('') || '<div style="color:var(--text-muted);font-size:0.8rem;text-align:center;padding:2rem;">Stove is clear</div>';
      colReady.innerHTML = readyOrders.map(o => renderCard(o, 'COLLECTED ✓')).join('') || '<div style="color:var(--text-muted);font-size:0.8rem;text-align:center;padding:2rem;">Counter cleared</div>';
    }

    advanceOrder(orderId) {
      this.db.advanceOrderStatus(orderId);
      this.renderKanbanBoard();
      this.showToast(`Order #${orderId} status advanced`);
    }

    renderAdminMenu() {
      const container = document.getElementById('admin-food-table');
      const foods = this.db.getFoods();

      container.innerHTML = foods.map(f => `
        <div class="food-row-item">
          <div class="food-row-info">
            <strong>${f.name} (₹${f.price})</strong>
            <small>${f.category} · Prep: ${f.prepMin} mins</small>
          </div>
          <button class="toggle-btn ${f.available ? 'active' : 'inactive'}" 
                  onclick="app.toggleFoodAvailability(${f.id})">
            ${f.available ? '● IN STOCK' : '✕ OUT OF STOCK'}
          </button>
        </div>
      `).join('');
    }

    toggleFoodAvailability(foodId) {
      const food = this.db.getFoods().find(f => f.id === foodId);
      if (food) {
        this.db.setFoodAvailability(foodId, !food.available);
        this.renderAdminMenu();
        this.showToast(`${food.name} is now ${!food.available ? 'In Stock' : 'Out of Stock'}`);
      }
    }

    handleAddNewFood(e) {
      e.preventDefault();
      const name = document.getElementById('new-food-name').value;
      const price = document.getElementById('new-food-price').value;
      const prep = document.getElementById('new-food-prep').value;
      const cat = document.getElementById('new-food-cat').value;
      const desc = document.getElementById('new-food-desc').value;

      this.db.addFood(name, price, cat, prep, desc);
      e.target.reset();
      this.renderAdminMenu();
      this.showToast(`Published ${name} to canteen menu!`);
    }

    renderInventory() {
      const container = document.getElementById('inv-table-body');
      const invs = this.db.getInventory();

      container.innerHTML = invs.map(i => {
        let status = 'good';
        let statusLabel = 'HEALTHY';
        if (i.qty <= 0) {
          status = 'out';
          statusLabel = 'EMPTY';
        } else if (i.qty <= i.minQty) {
          status = 'low';
          statusLabel = 'LOW STOCK';
        }

        const maxRef = Math.max(i.qty, i.minQty * 3);
        const pct = Math.min(100, Math.round((i.qty / maxRef) * 100));

        return `
          <div class="inv-card">
            <div>
              <div class="inv-card-header">
                <span class="inv-name">${i.ingredient}</span>
                <span class="inv-status-pill ${status}">${statusLabel}</span>
              </div>
              <div class="inv-qty">${i.qty} <small style="font-size:0.9rem;font-weight:600;color:var(--text-secondary);">${i.unit}</small></div>
              <small style="color:var(--text-muted);font-size:0.75rem;">Safety Threshold: ${i.minQty} ${i.unit}</small>
              <div class="stock-meter">
                <div class="stock-meter-fill ${status}" style="width: ${pct}%;"></div>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="app.restockIngredient(${i.id})">
              + Restock (10 ${i.unit})
            </button>
          </div>
        `;
      }).join('');
    }

    restockIngredient(invId) {
      this.db.restock(invId, 10);
      this.renderInventory();
      this.renderAdminMenu();
      this.showToast('Restocked +10 units. Associated dishes re-enabled.');
    }

    renderAnalytics() {
      const an = this.db.getAnalytics();
      document.getElementById('an-total-orders').innerText = an.totalOrders;
      document.getElementById('an-total-rev').innerText = `₹${an.totalRev}`;
      document.getElementById('an-avg-ticket').innerText = `₹${an.avgTicket}`;

      // Popular chart
      const popChart = document.getElementById('chart-popular');
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
      `).join('') || '<p style="color:var(--text-muted);font-size:0.8rem;">No completed order data yet</p>';

      // Peak Hours chart
      const peakChart = document.getElementById('chart-peak');
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
      `).join('') || '<p style="color:var(--text-muted);font-size:0.8rem;">No orders registered today</p>';
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
        this.showToast(`Placed test order #${order.id} for ${student.name}`);
      } catch (err) {
        this.showToast(err.message);
      }
    }

    resetDbPrompt() {
      if (confirm('Reset database back to factory demo state? All test orders will be cleared.')) {
        this.db.reset();
        this.cart = [];
        this.render();
        this.showToast('Database reset to defaults.');
      }
    }
  }

  // Expose global controller
  window.app = new CampusBiteApp();
})();
