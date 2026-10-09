/**
 * CampusBite — Smart Canteen & Digital Kitchen Operations
 * Japanese Editorial × Bold Minimalism × Premium Food Commerce
 */
(function () {
  'use strict';

  const DB_KEY = 'campusbite_db_v4', SESSION_KEY = 'campusbite_session_v2';
  const $ = id => document.getElementById(id);
  const show = (el, v) => el && el.classList.toggle('hidden', !v);

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
    constructor() { this.load(); }
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
    save() { try { localStorage.setItem(DB_KEY, JSON.stringify(this.data)); } catch (e) { console.error("Storage error:", e); } }
    reset() { this.data = JSON.parse(JSON.stringify(DEFAULT_DB)); this.save(); }
    login(idOrEmail, pw) {
      const term = (idOrEmail || '').trim().toLowerCase();
      return this.data.users.find(u => {
        const idMatch = (u.studentId && u.studentId.toLowerCase() === term) || (u.facultyId && u.facultyId.toLowerCase() === term);
        const emailMatch = u.email && u.email.toLowerCase() === term;
        return (idMatch || emailMatch) && u.pw === pw;
      }) || null;
    }
    getFoods() { return this.data.foods; }
    addFood(food) {
      food.id = (this.data.foods.reduce((m, f) => Math.max(m, f.id), 0)) + 1;
      food.available = true;
      food.image = food.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
      this.data.foods.push(food);
      this.save();
      return food;
    }
    setFoodAvailability(foodId, available) {
      const food = this.data.foods.find(f => f.id === foodId);
      if (food) { food.available = available; this.save(); }
    }
    getInventory() { return this.data.inventory; }
    evaluateInventoryDepletion() {
      this.data.foods.forEach(f => {
        if (f.ingId) {
          const ing = this.data.inventory.find(i => i.id === f.ingId);
          if (ing && ing.qty < (f.perServing || 0.1)) f.available = false;
        }
      });
    }
    calculateCartEta(cartItems) {
      if (!cartItems?.length) return 0;
      const maxPrep = Math.max(...cartItems.map(i => i.food.prepMin || 5));
      return maxPrep + (2 * this.getActiveQueueCount());
    }
    getActiveQueueCount() {
      return this.data.orders.filter(o => o.status === 'NEW' || o.status === 'PREPARING').length;
    }
    getOrders(userId = null) {
      if (userId !== null) {
        const uid = Number(userId);
        return this.data.orders.filter(o => Number(o.userId) === uid);
      }
      return this.data.orders;
    }
    placeOrder(user, cartItems, total, etaMin) {
      if (!cartItems?.length) throw new Error("Cannot place an empty order.");
      const safeUser = user || { id: 2, name: "Sreeshanth" };
      const userId = Number(safeUser.id) || 2;
      const userName = safeUser.name || "Sreeshanth";

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
          if (ing.qty < required) ing.qty = Math.round((ing.qty + 20.0) * 100) / 100;
          ing.qty = Math.max(0, Math.round((ing.qty - required) * 100) / 100);
        }
      }

      const maxId = (this.data.orders || []).reduce((m, o) => Math.max(m, Number(o.id) || 100), 100);
      const orderId = Math.max(this.data.nextOrderId || 101, maxId + 1);
      this.data.nextOrderId = orderId + 1;
      const summary = cartItems.map(i => `${i.food.name} x${i.qty}`).join(", ");
      const newOrder = {
        id: orderId, userId, customerName: userName,
        items: cartItems.map(i => ({ foodId: i.food.id, name: i.food.name, qty: i.qty, price: i.food.price })),
        total: Number(total) || cartItems.reduce((s, i) => s + (i.food.price * i.qty), 0),
        status: "NEW", created: new Date().toISOString(), etaMin: Number(etaMin) || 10, summary
      };
      this.data.orders.unshift(newOrder);
      this.save();
      return newOrder;
    }
    advanceOrderStatus(orderId) {
      const order = this.data.orders.find(o => o.id === orderId);
      const next = { "NEW": "PREPARING", "PREPARING": "READY", "READY": "COLLECTED" };
      if (order && next[order.status]) { order.status = next[order.status]; this.save(); }
    }
    cancelOrder(orderId) {
      const idx = this.data.orders.findIndex(o => o.id === orderId);
      if (idx !== -1 && this.data.orders[idx].status === 'NEW') {
        const order = this.data.orders[idx];
        order.items.forEach(it => {
          const food = this.data.foods.find(f => f.id === it.foodId);
          if (food?.ingId) {
            const ing = this.data.inventory.find(i => i.id === food.ingId);
            if (ing) ing.qty = Math.round((ing.qty + (food.perServing * it.qty)) * 100) / 100;
          }
        });
        this.data.orders.splice(idx, 1);
        this.save();
        return true;
      }
      return false;
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
        return this.data.foods.filter(f => (f.category === 'Drinks' || f.category === 'Snacks') && f.id !== fav.id).slice(0, 3);
      }
      return sortedIds.map(id => this.data.foods.find(f => f.id === id)).filter(f => f && f.available);
    }
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
      return { totalOrders: completed.length, totalRev, avgTicket, topDishes: Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 5), hourCounts };
    }
  }

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
      this.init();
    }
    init() {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) { try { this.currentUser = JSON.parse(saved); } catch { this.currentUser = null; } }
      this.setupSyncListener();
      this.render();
      this.startPolling();
    }
    setupSyncListener() {
      window.addEventListener('storage', e => { if (e.key === DB_KEY) { this.db.load(); this.refreshCurrentView(); } });
    }
    startPolling() {
      if (this.pollTimer) clearInterval(this.pollTimer);
      this.pollTimer = setInterval(() => { this.db.load(); this.refreshCurrentView(); }, 3000);
    }
    showToast(msg) {
      const c = $('toast-container');
      if (!c) return;
      const t = document.createElement('div');
      t.className = 'toast';
      t.innerHTML = `<span>${msg}</span>`;
      c.appendChild(t);
      setTimeout(() => {
        t.style.opacity = '0'; t.style.transform = 'translateY(10px)'; t.style.transition = 'all 0.2s ease';
        setTimeout(() => t.remove(), 200);
      }, 3200);
    }
    loginAsStudent() {
      const s = (this.db.data.users || []).find(u => u.role === 'STUDENT') || { id: 2, name: "Sreeshanth", email: "demo@campus.edu", pw: "student123", role: "STUDENT", studentId: "25R11A0501" };
      this.currentUser = s;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
      this.activeStudentTab = 'menu';
      this.render();
      this.showToast(`Signed in as ${s.name} (Student)`);
    }
    loginAsFaculty() {
      const f = (this.db.data.users || []).find(u => u.role === 'FACULTY') || { id: 3, name: "Chandrashekar", email: "chandrashekar@campus.edu", pw: "student123", role: "FACULTY", facultyId: "FAC-CS-108" };
      this.currentUser = f;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(f));
      this.activeStudentTab = 'menu';
      this.render();
      this.showToast(`Signed in as Prof. ${f.name} (Faculty)`);
    }
    loginAsAdmin() {
      const a = (this.db.data.users || []).find(u => u.role === 'ADMIN') || { id: 1, name: "Canteen Staff", email: "admin@campus.edu", pw: "admin123", role: "ADMIN" };
      this.currentUser = a;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(a));
      this.activeAdminTab = 'live';
      this.render();
      this.showToast('Kitchen Dashboard operational');
    }
    switchToAdminDashboard() { this.loginAsAdmin(); }
    switchToStudentPortal() { this.loginAsStudent(); }
    togglePortalRole() {
      if (!this.currentUser || this.currentUser.role === 'ADMIN') this.switchToStudentPortal();
      else this.switchToAdminDashboard();
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
      this.showToast(`Welcome back, ${u.name}`);
    }
    logout() { this.currentUser = null; sessionStorage.removeItem(SESSION_KEY); this.cart = []; this.render(); }
    navigateHome() {
      if (!this.currentUser) return;
      if (this.currentUser.role === 'ADMIN') this.switchAdminTab('live');
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
      const isAdmin = this.currentUser.role === 'ADMIN';
      sw.innerHTML = isAdmin ? `<span>&larr; CUSTOMER MENU</span>` : `<span>STAFF KITCHEN &rarr;</span>`;
      if (tr) show(tr, !isAdmin);

      if (isAdmin) {
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
      const cnt = this.db.getOrders(this.currentUser.id).filter(o => o.status !== 'COLLECTED').length;
      nav.innerHTML = `
        <button class="nav-link ${this.activeStudentTab === 'menu' ? 'active' : ''}" onclick="app.switchStudentTab('menu')"><span>DISCOVER / 01</span></button>
        <button class="nav-link ${this.activeStudentTab === 'orders' ? 'active' : ''}" onclick="app.switchStudentTab('orders')"><span>ORDERS / 02</span>${cnt ? `<span class="nav-count-pill">${cnt}</span>` : ''}</button>
        <button class="nav-link ${this.activeStudentTab === 'profile' ? 'active' : ''}" onclick="app.switchStudentTab('profile')"><span>PROFILE / 03</span></button>
      `;
    }
    renderAdminNavigation() {
      $('nav-actions').innerHTML = ['live|KANBAN / 01', 'menu|MENU / 02', 'inv|INVENTORY / 03', 'analytics|PERFORMANCE / 04'].map(p => {
        const [tab, lbl] = p.split('|');
        return `<button class="nav-link ${this.activeAdminTab === tab ? 'active' : ''}" onclick="app.switchAdminTab('${tab}')"><span>${lbl}</span></button>`;
      }).join('');
    }
    refreshCurrentView() {
      if (!this.currentUser) return;
      if (this.currentUser.role === 'ADMIN') {
        this.renderAdminNavigation();
        if (this.activeAdminTab === 'live') this.renderKanbanBoard();
        else if (this.activeAdminTab === 'menu') this.renderAdminMenu();
        else if (this.activeAdminTab === 'inv') this.renderInventory();
        else if (this.activeAdminTab === 'analytics') this.renderAnalytics();
      } else {
        this.renderStudentNavigation(); this.renderMenuGrid(); this.renderRecommendations(); this.renderCart();
        this.updateKitchenQueueIndicator(); this.updateActiveOrdersBadge();
        if (this.activeStudentTab === 'orders') this.renderStudentOrders();
        else if (this.activeStudentTab === 'profile') this.renderStudentProfile();
      }
    }
    switchStudentTab(tab) {
      this.activeStudentTab = tab;
      ['menu', 'orders', 'profile'].forEach(t => {
        $(`tab-btn-${t}`)?.classList.toggle('active', t === tab);
        show($(`section-${t}`), t === tab);
      });
      this.renderStudentNavigation(); this.refreshCurrentView();
    }
    updateActiveOrdersBadge() {
      if (!this.currentUser) return;
      const cnt = this.db.getOrders(this.currentUser.id).filter(o => o.status !== 'COLLECTED').length;
      const b = $('badge-active-orders');
      if (b) { b.innerText = cnt; show(b, cnt > 0); }
    }
    updateKitchenQueueIndicator() {
      const cnt = this.db.getActiveQueueCount(), el = $('kitchen-status-text');
      if (el) el.innerText = cnt > 0 ? `Kitchen active · ${cnt} orders queued` : `Kitchen ready · Immediate pickup`;
    }
    renderStudentPortal() {
      this.renderMenuGrid(); this.renderRecommendations(); this.renderCart();
      this.updateKitchenQueueIndicator(); this.updateActiveOrdersBadge();
      this.renderStudentOrders(); this.renderStudentProfile();
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
      const list = this.db.getFoods().filter(f => {
        const catMatch = this.currentCategory === 'All' || f.category === this.currentCategory;
        const txtMatch = f.name.toLowerCase().includes(search) || f.desc.toLowerCase().includes(search);
        return catMatch && txtMatch;
      });
      if (!list.length) {
        g.innerHTML = `<div style="grid-column: 1 / -1; padding: 4rem 1rem; text-align: center; color: var(--muted);"><h3 style="font-family: var(--font-serif); font-size: 1.5rem; color: var(--ink); margin-bottom: 0.35rem;">No dishes found</h3><p style="font-size: 0.88rem;">Try searching for another dish or reset the category filter.</p></div>`;
        return;
      }
      g.innerHTML = list.map((f, idx) => `
        <div class="menu-item-editorial ${f.available ? '' : 'unavailable'}" onclick="app.openFoodDetail(${f.id})">
          <div class="menu-item-media">
            <span class="menu-item-index">${String(idx + 1).padStart(2, '0')}</span>
            <img src="${f.image || FOOD_IMAGES[f.id]}" alt="${f.name}" loading="lazy">
            <span class="menu-item-prep-tag">${f.prepMin} MIN</span>
          </div>
          <div class="menu-item-content">
            <div class="menu-item-header"><h4 class="menu-item-name">${f.name}</h4><span class="menu-item-price">₹${f.price}</span></div>
            <p class="menu-item-desc">${f.desc}</p>
            <div class="menu-item-actions">
              <span class="category-micro-tag">${f.category.toUpperCase()}</span>
              <button class="btn btn-arrow" ${f.available ? '' : 'disabled'} onclick="event.stopPropagation(); app.addToCart(${f.id})"><span>${f.available ? 'ADD +' : 'SOLD OUT'}</span></button>
            </div>
          </div>
        </div>
      `).join('');
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
          <img class="rec-item-img" src="${f.image || FOOD_IMAGES[f.id]}" alt="${f.name}">
          <div class="rec-item-info"><strong class="rec-item-name">${f.name}</strong><div class="rec-item-meta">₹${f.price} · ${f.prepMin}m prep</div></div>
          <button class="btn btn-secondary btn-xs" onclick="event.stopPropagation(); app.addToCart(${f.id})">+ ADD</button>
        </div>
      `).join('');
    }
    openFoodDetail(foodId) {
      const f = this.db.getFoods().find(item => item.id === foodId);
      if (!f) return;
      this.selectedDetailFood = f; this.detailQty = 1;
      $('detail-food-img').src = f.image || FOOD_IMAGES[f.id];
      $('detail-food-category').innerText = f.category.toUpperCase();
      $('detail-food-name').innerText = f.name;
      $('detail-food-price').innerText = `₹${f.price}`;
      $('detail-food-prep').innerText = `${f.prepMin} MIN PREP`;
      $('detail-food-desc').innerText = f.desc;
      $('detail-food-qty').innerText = '1';
      const b = $('btn-detail-add');
      b.disabled = !f.available;
      b.innerHTML = `<span>${f.available ? `ADD TO TRAY — ₹${f.price}` : 'CURRENTLY SOLD OUT'} &rarr;</span>`;
      show($('food-detail-modal'), true);
    }
    closeFoodDetail() { show($('food-detail-modal'), false); this.selectedDetailFood = null; }
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
      this.renderCart(); this.closeFoodDetail(); this.showToast(`Added ${this.selectedDetailFood.name} to tray`);
    }
    addToCart(foodId) {
      const f = this.db.getFoods().find(item => item.id === foodId);
      if (!f?.available) return;
      const ex = this.cart.find(i => i.food.id === foodId);
      if (ex) { if (ex.qty < 10) ex.qty++; }
      else this.cart.push({ food: f, qty: 1 });
      this.renderCart(); this.showToast(`Added ${f.name} to tray`);
    }
    changeCartQty(foodId, delta) {
      const idx = this.cart.findIndex(i => i.food.id === foodId);
      if (idx === -1) return;
      this.cart[idx].qty += delta;
      if (this.cart[idx].qty <= 0) this.cart.splice(idx, 1);
      this.renderCart();
    }
    clearCart() { this.cart = []; this.renderCart(); this.showToast('Tray cleared'); }
    scrollToTray() { $('student-tray-sidebar')?.scrollIntoView({ behavior: 'smooth' }); }
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
          <div class="tray-item-info"><strong>${i.food.name}</strong><small>₹${i.food.price * i.qty} (₹${i.food.price} ea)</small></div>
          <div class="tray-stepper">
            <button class="btn-step" onclick="app.changeCartQty(${i.food.id}, -1)">&minus;</button>
            <span class="tray-stepper-val">${i.qty}</span>
            <button class="btn-step" onclick="app.changeCartQty(${i.food.id}, 1)">+</button>
          </div>
        </div>
      `).join('');
      const subtotal = this.cart.reduce((s, i) => s + (i.food.price * i.qty), 0);
      const eta = this.db.calculateCartEta(this.cart);
      $('bill-subtotal').innerText = `₹${subtotal}`;
      $('bill-total').innerText = `₹${subtotal}`;
      $('cart-eta-val').innerText = `~${eta} mins`;
      $('cart-eta-calc').innerText = `Longest prep (${Math.max(...this.cart.map(i => i.food.prepMin))}m) + queue (${2 * this.db.getActiveQueueCount()}m)`;
    }
    placeOrder() {
      if (!this.cart.length) return this.showToast('Your tray is empty! Add dishes to place an order.');
      const subtotal = this.cart.reduce((s, i) => s + (i.food.price * i.qty), 0);
      const eta = this.db.calculateCartEta(this.cart);
      try {
        const u = this.currentUser || { id: 2, name: "Sreeshanth", email: "demo@campus.edu", role: "STUDENT" };
        const order = this.db.placeOrder(u, this.cart, subtotal, eta);
        this.cart = []; this.renderCart(); this.updateActiveOrdersBadge();
        this.switchStudentTab('orders'); this.renderStudentOrders(); this.renderStudentProfile();
        this.scheduleOrderAutoProgress(order.id);
        this.showToast(`Order #${order.id} sent to kitchen queue`);
        this.showOrderModal(order);
      } catch (err) { alert(err.message); this.db.load(); this.renderMenuGrid(); }
    }
    scheduleOrderAutoProgress(orderId) {
      setTimeout(() => {
        const o = this.db.data.orders.find(item => item.id === orderId);
        if (o?.status === 'NEW') { this.db.advanceOrderStatus(orderId); this.showToast(`Kitchen started cooking Token #${orderId}`); this.refreshCurrentView(); }
      }, 7000);
      setTimeout(() => {
        const o = this.db.data.orders.find(item => item.id === orderId);
        if (o?.status === 'PREPARING') { this.db.advanceOrderStatus(orderId); this.showToast(`Token #${orderId} is READY for pickup at Counter 01`); this.refreshCurrentView(); }
      }, 16000);
    }
    showOrderModal(order) {
      $('modal-token-num').innerText = `#${order.id}`;
      $('modal-eta-val').innerText = `${order.etaMin} minutes`;
      $('modal-total-val').innerText = `₹${order.total}`;
      show($('order-modal'), true);
    }
    dismissOrderModal() { show($('order-modal'), false); this.switchStudentTab('orders'); }
    renderStudentOrders() {
      const cont = $('orders-list');
      if (!cont) return;
      const u = this.currentUser || { id: 2, name: "Sreeshanth" };
      const orders = this.db.getOrders(u.id);
      const active = orders.filter(o => o.status !== 'COLLECTED'), past = orders.filter(o => o.status === 'COLLECTED');
      let html = '';
      if (this.cart.length) {
        const qty = this.cart.reduce((s, i) => s + i.qty, 0), tot = this.cart.reduce((s, i) => s + (i.food.price * i.qty), 0);
        html += `<div class="pending-tray-banner"><div class="pending-tray-info"><span class="pending-tray-badge">TRAY READY</span><h4>You have ${qty} dish${qty > 1 ? 'es' : ''} in your tray waiting to order</h4><p style="font-size: 0.88rem; color: var(--muted);">${this.cart.map(i => `${i.food.name} (x${i.qty})`).join(', ')} · <strong>Total: ₹${tot}</strong></p></div><button class="btn btn-primary btn-md" onclick="app.placeOrder()"><span>CONFIRM ORDER (₹${tot}) &rarr;</span></button></div>`;
      }
      if (!active.length && !past.length) {
        if (!this.cart.length) html += `<div style="background: var(--bg-surface); border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 4rem 2rem; text-align: center;"><h3 style="font-family: var(--font-serif); font-size: 1.6rem; margin-bottom: 0.35rem;">No Orders Placed Yet</h3><p style="color: var(--muted); margin-bottom: 1.75rem; max-width: 440px; margin: 0 auto 1.75rem auto; font-size: 0.92rem;">You have no active meals in the kitchen queue. Choose a fresh dish from today's menu to place your first token.</p><button class="btn btn-primary btn-md" onclick="app.switchStudentTab('menu')"><span>DISCOVER MENU &rarr;</span></button></div>`;
        cont.innerHTML = html; return;
      }
      const steps = [{ k: "NEW", l: "ORDERED" }, { k: "PREPARING", l: "PREPARING" }, { k: "READY", l: "READY" }, { k: "COLLECTED", l: "COLLECTED" }];
      if (active.length) {
        html += `<div style="margin-bottom: 2.5rem;"><span class="editorial-eyebrow" style="margin-bottom: 1rem;">ACTIVE KITCHEN TOKENS (${active.length})</span><div style="display: flex; flex-direction: column; gap: 1.5rem;">${active.map(o => {
          const cur = steps.findIndex(s => s.k === o.status), tStr = new Date(o.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return `<div class="order-ticket-card"><div class="order-ticket-header"><div><span class="order-token-badge">TOKEN #${o.id}</span><span class="order-meta-info">Placed at ${tStr} · ETA ~${o.etaMin}m</span></div><div style="display: flex; align-items: baseline; gap: 1.25rem;"><span class="order-total-figure">₹${o.total}</span>${o.status === 'NEW' ? `<button class="btn btn-secondary btn-xs" style="color: var(--accent); border-color: var(--accent);" onclick="app.handleCancelOrder(${o.id})">Cancel</button>` : ''}</div></div><div class="order-timeline-stepper">${steps.map((s, idx) => {
            const cls = (idx < cur || o.status === 'COLLECTED') ? 'completed' : idx === cur ? 'current' : '';
            const bChar = (idx < cur || o.status === 'COLLECTED') ? '✓' : idx === cur ? '●' : idx + 1;
            return `<div class="timeline-node ${cls}"><div class="timeline-bullet">${bChar}</div><span class="timeline-label">${s.l}</span></div>`;
          }).join('')}</div><div class="order-summary-box"><strong>Items:</strong> ${o.summary}</div><div class="order-actions-bar"><span style="font-family: var(--font-mono); font-size: 0.74rem; font-weight: 600; color: ${o.status === 'READY' ? 'var(--success)' : 'var(--ink)'};">${o.status === 'NEW' ? 'Order accepted in kitchen queue' : o.status === 'PREPARING' ? 'Cooking on the stove' : 'Ready for pickup at Counter 01'}</span><button class="btn btn-secondary btn-xs" onclick="app.advanceOrderFromStudent(${o.id})">${o.status === 'NEW' ? 'Start Cooking' : o.status === 'PREPARING' ? 'Mark Ready' : 'Collect Dish'} &rarr;</button></div></div>`;
        }).join('')}</div></div>`;
      }
      if (past.length) {
        html += `<div><span class="editorial-eyebrow" style="margin-bottom: 1rem;">PAST FULFILLED ORDERS (${past.length})</span><div style="display: flex; flex-direction: column; gap: 0.85rem;">${past.map(o => `
          <div class="history-item-row"><div><div style="display: flex; align-items: center; gap: 0.75rem;"><strong style="font-family: var(--font-mono); font-size: 0.95rem;">#${o.id}</strong><span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--muted);">${new Date(o.created).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span><span style="font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; color: var(--success); background: var(--success-subtle); padding: 0.1rem 0.4rem; border-radius: var(--radius-xs);">COLLECTED ✓</span></div><small style="color: var(--muted); display: block; margin-top: 0.25rem;">${o.summary}</small></div><div style="display: flex; align-items: center; gap: 1.25rem;"><span style="font-family: var(--font-mono); font-weight: 700; font-size: 1.05rem;">₹${o.total}</span><button class="btn btn-arrow" onclick="app.reorderItem(${o.id})">REORDER &rarr;</button></div></div>
        `).join('')}</div></div>`;
      }
      cont.innerHTML = html;
    }
    advanceOrderFromStudent(id) {
      this.db.advanceOrderStatus(id); this.renderStudentOrders(); this.renderStudentProfile(); this.updateActiveOrdersBadge();
      const o = this.db.data.orders.find(item => item.id === id);
      if (o) this.showToast(o.status === 'COLLECTED' ? `Token #${id} collected. Added to your dining history.` : `Token #${id} moved to ${o.status}`);
    }
    handleCancelOrder(id) {
      if (confirm(`Cancel Order #${id}? Stock will be refunded.`)) {
        if (this.db.cancelOrder(id)) { this.showToast(`Order #${id} cancelled`); this.renderStudentOrders(); this.renderStudentProfile(); this.updateActiveOrdersBadge(); }
      }
    }
    reorderItem(id) {
      const o = this.db.data.orders.find(item => item.id === id);
      if (!o?.items) return;
      o.items.forEach(it => {
        const f = this.db.getFoods().find(food => food.id === it.foodId);
        if (f?.available) {
          const ex = this.cart.find(c => c.food.id === f.id);
          if (ex) ex.qty += it.qty; else this.cart.push({ food: f, qty: it.qty });
        }
      });
      this.renderCart(); this.switchStudentTab('menu'); this.scrollToTray(); this.showToast(`Added dishes from Token #${id} to tray`);
    }
    renderStudentProfile() {
      const u = this.currentUser || { id: 2, name: "Sreeshanth", email: "demo@campus.edu", studentId: "25R11A0501", role: "STUDENT" };
      const orders = this.db.getOrders(u.id), spent = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);
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
      if (!orders.length) cont.innerHTML = `<div style="padding: 2.5rem 1rem; text-align: center; color: var(--muted);"><p style="font-size: 0.92rem;">No order history yet. Discover dishes in the menu to place your first token.</p></div>`;
      else cont.innerHTML = orders.map(o => `
        <div class="history-item-row"><div><div style="display: flex; align-items: center; gap: 0.75rem;"><strong style="font-family: var(--font-mono);">#${o.id}</strong><span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--muted);">${new Date(o.created).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span><span style="font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; color: ${o.status === 'COLLECTED' ? 'var(--success)' : 'var(--accent)'};">${o.status}</span></div><small style="color: var(--muted); display: block; margin-top: 0.25rem;">${o.summary}</small></div><div style="display: flex; align-items: center; gap: 1.25rem;"><strong style="font-family: var(--font-mono); font-size: 1.05rem;">₹${o.total}</strong><button class="btn btn-arrow" onclick="app.reorderItem(${o.id})">REORDER &rarr;</button></div></div>
      `).join('');
    }
    switchAdminTab(tab) {
      this.activeAdminTab = tab;
      ['live', 'menu', 'inv', 'analytics'].forEach(t => {
        $(`admin-tab-${t}`)?.classList.toggle('active', t === tab);
        show($(`admin-sec-${t}`), t === tab);
      });
      this.renderAdminNavigation(); this.refreshCurrentView();
    }
    renderAdminPortal() { this.renderKanbanBoard(); this.renderAdminMenu(); this.renderInventory(); this.renderAnalytics(); }
    renderKanbanBoard() {
      const orders = this.db.getOrders();
      const [cn, cp, cr] = [$('col-orders-new'), $('col-orders-prep'), $('col-orders-ready')];
      if (!cn || !cp || !cr) return;
      const [n, p, r] = [orders.filter(o => o.status === 'NEW'), orders.filter(o => o.status === 'PREPARING'), orders.filter(o => o.status === 'READY')];
      $('count-new').innerText = n.length; $('count-prep').innerText = p.length; $('count-ready').innerText = r.length;
      const card = (o, txt) => `<div class="kanban-ticket"><div class="ticket-top"><span class="ticket-token">#${o.id}</span><span class="ticket-cust">${o.customerName}</span></div><div class="ticket-summary">${o.summary}</div><div class="ticket-footer"><span class="ticket-price">₹${o.total}</span><button class="btn btn-primary btn-xs" onclick="app.advanceOrder(${o.id})"><span>${txt} &rarr;</span></button></div></div>`;
      cn.innerHTML = n.map(o => card(o, 'START COOKING')).join('') || '<div style="color:var(--muted);font-family:var(--font-mono);font-size:0.75rem;text-align:center;padding:3rem 1rem;">NO PENDING ORDERS</div>';
      cp.innerHTML = p.map(o => card(o, 'MARK READY')).join('') || '<div style="color:var(--muted);font-family:var(--font-mono);font-size:0.75rem;text-align:center;padding:3rem 1rem;">STOVE IS CLEAR</div>';
      cr.innerHTML = r.map(o => card(o, 'COLLECTED ✓')).join('') || '<div style="color:var(--muted);font-family:var(--font-mono);font-size:0.75rem;text-align:center;padding:3rem 1rem;">COUNTER CLEARED</div>';
    }
    advanceOrder(id) { this.db.advanceOrderStatus(id); this.renderKanbanBoard(); this.showToast(`Order #${id} status advanced`); }
    renderAdminMenu() {
      const cont = $('admin-food-table');
      if (!cont) return;
      cont.innerHTML = this.db.getFoods().map(f => `
        <div class="food-editor-row"><div><strong style="font-size: 0.92rem;">${f.name}</strong><div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--muted); margin-top: 0.15rem;">₹${f.price} · ${f.category} · Prep: ${f.prepMin}m</div></div><button class="toggle-availability-btn ${f.available ? 'active' : 'inactive'}" onclick="app.toggleFoodAvailability(${f.id})">${f.available ? '● AVAILABLE' : '✕ SOLD OUT'}</button></div>
      `).join('');
    }
    toggleFoodAvailability(id) {
      const f = this.db.getFoods().find(item => item.id === id);
      if (f) { this.db.setFoodAvailability(id, !f.available); this.renderAdminMenu(); this.showToast(`${f.name} is now ${!f.available ? 'Available' : 'Sold Out'}`); }
    }
    handleAddNewFood(e) {
      e.preventDefault();
      const [name, price, prep, cat, desc] = [$('new-food-name').value, parseFloat($('new-food-price').value), parseInt($('new-food-prep').value, 10), $('new-food-cat').value, $('new-food-desc').value];
      this.db.addFood({ name, price, prepMin: prep, category: cat, desc, ingId: null, perServing: 0, available: true, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80" });
      e.target.reset(); this.renderAdminMenu(); this.showToast(`Added ${name} to canteen menu`);
    }
    renderInventory() {
      const cont = $('inv-table-body');
      if (!cont) return;
      cont.innerHTML = this.db.getInventory().map(i => {
        const isLow = i.qty <= i.minQty;
        return `<div class="inv-stat-box ${isLow ? 'low-stock' : ''}"><div style="display: flex; justify-content: space-between; align-items: baseline;"><span class="inv-name">${i.ingredient}</span><span style="font-family: var(--font-mono); font-size: 0.68rem; font-weight: 700; color: ${isLow ? 'var(--warning)' : 'var(--success)'};">${isLow ? 'LOW STOCK' : 'GOOD'}</span></div><div class="inv-qty">${i.qty} <small style="font-size: 0.85rem; font-weight: 500;">${i.unit}</small></div><div class="inv-meta">Threshold: min ${i.minQty} ${i.unit}</div></div>`;
      }).join('');
    }
    renderAnalytics() {
      const an = this.db.getAnalytics();
      $('an-total-orders').innerText = an.totalOrders;
      $('an-total-rev').innerText = `₹${an.totalRev}`;
      $('an-avg-ticket').innerText = `₹${an.avgTicket}`;
      const pc = $('chart-popular'), pk = $('chart-peak');
      if (pc) {
        const mx = an.topDishes.length ? Math.max(...an.topDishes.map(d => d[1])) : 1;
        pc.innerHTML = an.topDishes.map(d => `<div class="chart-bar-row"><div class="chart-bar-info"><span>${d[0]}</span><span>${d[1]} orders</span></div><div class="chart-track"><div class="chart-fill" style="width: ${(d[1] / mx) * 100}%;"></div></div></div>`).join('') || '<p style="color:var(--muted);font-size:0.82rem;">No orders fulfilled yet</p>';
      }
      if (pk) {
        const hrs = Object.entries(an.hourCounts), mx = hrs.length ? Math.max(...hrs.map(h => h[1])) : 1;
        pk.innerHTML = hrs.map(h => `<div class="chart-bar-row"><div class="chart-bar-info"><span>${h[0]}</span><span>${h[1]} orders</span></div><div class="chart-track"><div class="chart-fill" style="width: ${(h[1] / mx) * 100}%;"></div></div></div>`).join('') || '<p style="color:var(--muted);font-size:0.82rem;">No orders registered today</p>';
      }
    }
    placeTestOrder() {
      const foods = this.db.getFoods(), rf = foods[Math.floor(Math.random() * foods.length)];
      const student = this.db.data.users.find(u => u.role === 'STUDENT') || this.currentUser;
      const tc = [{ food: rf, qty: 1 }], eta = this.db.calculateCartEta(tc);
      try { const o = this.db.placeOrder(student, tc, rf.price, eta); this.renderKanbanBoard(); this.showToast(`Simulated test order #${o.id} sent`); }
      catch (err) { this.showToast(err.message); }
    }
    resetDbPrompt() {
      if (confirm('Reset database back to factory demo state? All test orders will be cleared.')) {
        this.db.reset(); this.cart = []; this.render(); this.showToast('Database reset to defaults');
      }
    }
  }

  window.app = new CampusBiteApp();
})();
