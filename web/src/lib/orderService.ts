/**
 * CampusBite Order Service & Authoritative Data Access Layer
 *
 * Calls PostgreSQL RPCs via Supabase client with seamless in-memory fallback
 * if running offline or in development preview.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { FoodItemDTO, Order, OrderStatus, InventoryItem } from './types';
import { calculateOrderEta } from './etaEngine';

// Seed dishes matching PostgreSQL migration
const INITIAL_FOODS: FoodItemDTO[] = [
  {
    id: 1,
    name: 'Chicken Biryani',
    description: 'Spiced basmati rice with tender marinated chicken and caramelized mint',
    price: 120,
    category: 'Meals',
    dietary: 'Non-Veg',
    prepMin: 12,
    available: true,
    preparedPortions: 4,
    allocatedPortions: 0,
    availablePreparedPortions: 4,
    isPausedByAdmin: false,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
    allergens: ['Dairy'],
  },
  {
    id: 2,
    name: 'Veg Biryani',
    description: 'Long-grain basmati, saffron, garden vegetables & whole roasted spices',
    price: 90,
    category: 'Meals',
    dietary: 'Veg',
    prepMin: 10,
    available: true,
    preparedPortions: 2,
    allocatedPortions: 0,
    availablePreparedPortions: 2,
    isPausedByAdmin: false,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&auto=format&fit=crop&q=80',
    allergens: [],
  },
  {
    id: 3,
    name: 'Paneer Rice',
    description: 'Wok-tossed rice with fresh cottage cheese cubes & mild pepper seasoning',
    price: 100,
    category: 'Meals',
    dietary: 'Veg',
    prepMin: 10,
    available: true,
    preparedPortions: 0,
    allocatedPortions: 0,
    availablePreparedPortions: 0,
    isPausedByAdmin: false,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80',
    allergens: ['Dairy'],
  },
  {
    id: 4,
    name: 'Veg Pizza',
    description: 'Crisp stone crust, molten mozzarella, bell peppers & oregano dusting',
    price: 90,
    category: 'Snacks',
    dietary: 'Veg',
    prepMin: 14,
    available: true,
    preparedPortions: 1,
    allocatedPortions: 0,
    availablePreparedPortions: 1,
    isPausedByAdmin: false,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80',
    allergens: ['Dairy', 'Gluten'],
  },
  {
    id: 6,
    name: 'Masala Dosa',
    description: 'Golden paper-thin crepe, tempered potato mash & two stone-ground chutneys',
    price: 60,
    category: 'Meals',
    dietary: 'Veg',
    prepMin: 8,
    available: true,
    preparedPortions: 0,
    allocatedPortions: 0,
    availablePreparedPortions: 0,
    isPausedByAdmin: false,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&auto=format&fit=crop&q=80',
    allergens: ['Dairy'],
  },
  {
    id: 7,
    name: 'Samosa (2 pcs)',
    description: 'Hand-rolled golden flaky crust, spiced potato & green pea filling',
    price: 25,
    category: 'Snacks',
    dietary: 'Veg',
    prepMin: 3,
    available: true,
    preparedPortions: 8,
    allocatedPortions: 0,
    availablePreparedPortions: 8,
    isPausedByAdmin: false,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80',
    allergens: ['Gluten'],
  },
  {
    id: 10,
    name: 'Cold Coffee',
    description: 'Slow-brewed dark roast espresso, chilled creamy milk, lightly sweet',
    price: 60,
    category: 'Drinks',
    dietary: 'Veg',
    prepMin: 4,
    available: true,
    preparedPortions: 4,
    allocatedPortions: 0,
    availablePreparedPortions: 4,
    isPausedByAdmin: false,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&auto=format&fit=crop&q=80',
    allergens: ['Dairy'],
  },
  {
    id: 12,
    name: 'Gulab Jamun (2 pcs)',
    description: 'Warm melt-in-mouth milk dumplings soaked in cardamom rose syrup',
    price: 40,
    category: 'Desserts',
    dietary: 'Veg',
    prepMin: 2,
    available: true,
    preparedPortions: 6,
    allocatedPortions: 0,
    availablePreparedPortions: 6,
    isPausedByAdmin: false,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80',
    allergens: ['Dairy'],
  },
  {
    id: 13,
    name: 'Ice Cream Scoop',
    description: 'Velvety Madagascar vanilla bean ice cream scoop in chilled bowl',
    price: 35,
    category: 'Desserts',
    dietary: 'Veg',
    prepMin: 1,
    available: true,
    preparedPortions: 5,
    allocatedPortions: 0,
    availablePreparedPortions: 5,
    isPausedByAdmin: false,
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&auto=format&fit=crop&q=80',
    allergens: ['Dairy'],
  },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 1, ingredient: 'Rice', qty: 24.0, unit: 'kg', minQty: 3.0, unitCost: 45.0 },
  { id: 2, ingredient: 'Chicken', qty: 10.0, unit: 'kg', minQty: 2.0, unitCost: 180.0 },
  { id: 3, ingredient: 'Paneer', qty: 4.0, unit: 'kg', minQty: 1.5, unitCost: 320.0 },
  { id: 4, ingredient: 'Bread & Buns', qty: 18.0, unit: 'packs', minQty: 3.0, unitCost: 30.0 },
  { id: 5, ingredient: 'Cooking Oil', qty: 12.0, unit: 'L', minQty: 2.0, unitCost: 130.0 },
  { id: 6, ingredient: 'Milk', qty: 14.0, unit: 'L', minQty: 2.5, unitCost: 55.0 },
];

// In-Memory Database store for standalone preview / offline tests
let localFoods: FoodItemDTO[] = [...INITIAL_FOODS];
let localInventory: InventoryItem[] = [...INITIAL_INVENTORY];
let localOrders: Order[] = [
  {
    id: 101,
    orderRef: 'CB-101',
    idempotencyKey: 'idem-seed-101',
    userId: 'u-1',
    customerName: 'Aarav Sharma',
    customerRole: 'STUDENT',
    items: [
      { foodId: 1, name: 'Chicken Biryani', qty: 1, unitPrice: 120, subtotal: 120 },
      { foodId: 10, name: 'Cold Coffee', qty: 1, unitPrice: 60, subtotal: 60 },
    ],
    subtotal: 180,
    total: 180,
    status: 'PREPARING',
    etaMin: 8,
    estimatedReadyAt: new Date(Date.now() + 6 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    transitions: [
      { fromStatus: 'NEW', toStatus: 'ACCEPTED', actorName: 'Chef Ramesh', actorRole: 'STAFF', timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString() },
      { fromStatus: 'ACCEPTED', toStatus: 'PREPARING', actorName: 'Chef Ramesh', actorRole: 'STAFF', timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: 102,
    orderRef: 'CB-102',
    idempotencyKey: 'idem-seed-102',
    userId: 'u-2',
    customerName: 'Diya Murthy',
    customerRole: 'STUDENT',
    items: [
      { foodId: 6, name: 'Masala Dosa', qty: 1, unitPrice: 60, subtotal: 60 },
    ],
    subtotal: 60,
    total: 60,
    status: 'NEW',
    etaMin: 10,
    estimatedReadyAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    transitions: [
      { fromStatus: 'NEW', toStatus: 'NEW', actorName: 'Diya Murthy', actorRole: 'STUDENT', timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
    ],
  },
];
const localIdempotencyMap = new Map<string, any>();

export const orderService = {
  /**
   * Fetch public menu with available items and prepared portion counts
   */
  async fetchPublicMenu(): Promise<FoodItemDTO[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('public_menu_items')
        .select('*');

      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          name: d.name,
          description: d.description || '',
          price: Number(d.price),
          category: d.category,
          dietary: d.dietary || 'Veg',
          prepMin: d.prep_min,
          available: d.is_available,
          preparedPortions: d.prepared_portions || 0,
          allocatedPortions: d.allocated_portions || 0,
          availablePreparedPortions: d.available_prepared_portions || 0,
          isPausedByAdmin: d.is_paused_by_admin,
          pauseReason: d.pause_reason,
          image: d.image,
          allergens: d.allergens || [],
        }));
      }
    }
    return [...localFoods];
  },

  /**
   * Fetch active orders in kitchen queue
   */
  async fetchActiveOrders(): Promise<Order[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .in('status', ['NEW', 'ACCEPTED', 'PREPARING', 'READY'])
        .order('created_at', { ascending: true });

      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          orderRef: d.order_ref,
          idempotencyKey: d.idempotency_key,
          userId: d.user_id,
          customerName: d.customer_name,
          customerRole: d.customer_role,
          subtotal: Number(d.subtotal),
          total: Number(d.total),
          status: d.status,
          etaMin: d.eta_min,
          estimatedReadyAt: d.estimated_ready_at,
          createdAt: d.created_at,
          items: (d.order_items || []).map((i: any) => ({
            id: i.id,
            foodId: i.food_id,
            name: i.name,
            qty: i.qty,
            unitPrice: Number(i.unit_price),
            subtotal: Number(i.subtotal),
          })),
        }));
      }
    }
    return localOrders.filter((o) => o.status !== 'COLLECTED' && o.status !== 'CANCELLED');
  },

  /**
   * Submit new order through authoritative creation operation
   */
  async createOrder(
    idempotencyKey: string,
    items: { foodId: number; qty: number }[],
    customerName: string,
    userId?: string
  ): Promise<Order> {
    // Check idempotency cache first
    if (localIdempotencyMap.has(idempotencyKey)) {
      return localIdempotencyMap.get(idempotencyKey);
    }

    if (isSupabaseConfigured() && supabase) {
      const rpcPayload = {
        p_idempotency_key: idempotencyKey,
        p_items: items.map((i) => ({ food_id: i.foodId, qty: i.qty })),
        p_customer_name: customerName,
      };

      const { data, error } = await supabase.rpc('create_order_atomic', rpcPayload);
      if (error) {
        throw new Error(error.message);
      }
      return data;
    }

    // Authoritative in-memory implementation
    if (!items || items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    let subtotal = 0;
    const orderItems = items.map((i) => {
      const food = localFoods.find((f) => f.id === i.foodId);
      if (!food) {
        throw new Error(`Food ID ${i.foodId} not found`);
      }
      if (food.isPausedByAdmin) {
        throw new Error(`Dish "${food.name}" is currently paused by kitchen`);
      }
      const itemSubtotal = food.price * i.qty;
      subtotal += itemSubtotal;
      return {
        foodId: food.id,
        name: food.name,
        qty: i.qty,
        unitPrice: food.price,
        subtotal: itemSubtotal,
      };
    });

    const activeQueue = localOrders.filter((o) =>
      ['NEW', 'ACCEPTED', 'PREPARING'].includes(o.status)
    ).length;

    const etaResult = calculateOrderEta({
      items: items.map((i) => ({
        food: localFoods.find((f) => f.id === i.foodId)!,
        qty: i.qty,
      })),
      activeQueueCount: activeQueue,
    });

    const newOrder: Order = {
      id: 100 + localOrders.length + 1,
      orderRef: `CB-${100 + localOrders.length + 1}`,
      idempotencyKey,
      userId: userId || 'usr_guest',
      customerName,
      customerRole: 'STUDENT',
      items: orderItems,
      subtotal,
      total: subtotal,
      status: 'NEW',
      etaMin: etaResult.estimatedMins,
      estimatedReadyAt: new Date(Date.now() + etaResult.estimatedMins * 60000).toISOString(),
      createdAt: new Date().toISOString(),
      transitions: [
        {
          fromStatus: 'NEW',
          toStatus: 'NEW',
          actorName: customerName,
          actorRole: 'STUDENT',
          timestamp: new Date().toISOString(),
          notes: 'Order placed by student',
        },
      ],
    };

    localOrders.unshift(newOrder);
    localIdempotencyMap.set(idempotencyKey, newOrder);
    return newOrder;
  },

  /**
   * Advance order status through canonical state transitions
   */
  async advanceOrderStatus(
    orderId: number,
    expectedStatus: OrderStatus,
    nextStatus: OrderStatus,
    actorName: string,
    actorRole: string
  ): Promise<Order> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.rpc('advance_order_status_atomic', {
        p_order_id: orderId,
        p_expected_status: expectedStatus,
        p_next_status: nextStatus,
        p_actor_name: actorName,
        p_actor_role: actorRole,
      });
      if (error) throw new Error(error.message);
      return data;
    }

    const order = localOrders.find((o) => o.id === orderId);
    if (!order) throw new Error(`Order #${orderId} not found`);

    if (order.status !== expectedStatus) {
      if (order.status === nextStatus) return order;
      throw new Error(`Conflict: Order status is ${order.status}, expected ${expectedStatus}`);
    }

    order.status = nextStatus;
    order.updatedAt = new Date().toISOString();
    order.transitions = order.transitions || [];
    order.transitions.push({
      fromStatus: expectedStatus,
      toStatus: nextStatus,
      actorName,
      actorRole,
      timestamp: new Date().toISOString(),
    });

    return order;
  },

  /**
   * Cancel an order if it is in NEW or ACCEPTED state
   */
  async cancelOrder(
    orderId: number,
    reason: string,
    actorName: string,
    actorRole: string
  ): Promise<Order> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.rpc('cancel_order_atomic', {
        p_order_id: orderId,
        p_reason: reason,
        p_actor_name: actorName,
        p_actor_role: actorRole,
      });
      if (error) throw new Error(error.message);
      return data;
    }

    const order = localOrders.find((o) => o.id === orderId);
    if (!order) throw new Error(`Order #${orderId} not found`);

    if (order.status !== 'NEW' && order.status !== 'ACCEPTED') {
      throw new Error(`Order cannot be cancelled: already in "${order.status}" status`);
    }

    order.status = 'CANCELLED';
    order.cancellationReason = reason;
    order.cancelledAt = new Date().toISOString();
    return order;
  },

  /**
   * Fetch inventory items
   */
  async fetchInventory(): Promise<InventoryItem[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('inventory').select('*').order('id');
      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          ingredient: d.ingredient,
          qty: Number(d.qty),
          unit: d.unit,
          minQty: Number(d.min_qty),
          unitCost: Number(d.unit_cost),
        }));
      }
    }
    return [...localInventory];
  },

  /**
   * Add a new inventory ingredient (User request: "add options to add the inventory")
   */
  async addInventoryItem(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('inventory').insert([{
        ingredient: item.ingredient,
        qty: item.qty,
        unit: item.unit,
        min_qty: item.minQty,
        unit_cost: item.unitCost,
      }]).select().single();

      if (error) throw new Error(error.message);
      return {
        id: data.id,
        ingredient: data.ingredient,
        qty: Number(data.qty),
        unit: data.unit,
        minQty: Number(data.min_qty),
        unitCost: Number(data.unit_cost),
      };
    }

    const newId = localInventory.length ? Math.max(...localInventory.map((i) => i.id)) + 1 : 1;
    const newItem: InventoryItem = { id: newId, ...item };
    localInventory.push(newItem);
    return newItem;
  },

  /**
   * Update inventory stock balance
   */
  async updateInventoryStock(id: number, newQty: number): Promise<InventoryItem> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('inventory')
        .update({ qty: newQty, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return {
        id: data.id,
        ingredient: data.ingredient,
        qty: Number(data.qty),
        unit: data.unit,
        minQty: Number(data.min_qty),
        unitCost: Number(data.unit_cost),
      };
    }

    const item = localInventory.find((i) => i.id === id);
    if (!item) throw new Error(`Ingredient #${id} not found`);
    item.qty = newQty;
    return item;
  },

  /**
   * Add new food dish to menu (User request: "add items and all those")
   */
  async addFoodItem(food: Omit<FoodItemDTO, 'id' | 'available' | 'allocatedPortions' | 'availablePreparedPortions'>): Promise<FoodItemDTO> {
    const newId = localFoods.length ? Math.max(...localFoods.map((f) => f.id)) + 1 : 1;
    const newFood: FoodItemDTO = {
      id: newId,
      ...food,
      available: !food.isPausedByAdmin,
      allocatedPortions: 0,
      availablePreparedPortions: food.preparedPortions,
    };
    localFoods.push(newFood);
    return newFood;
  },

  /**
   * Toggle dish ordering pause
   */
  async toggleFoodPause(foodId: number, pauseReason?: string): Promise<FoodItemDTO> {
    const food = localFoods.find((f) => f.id === foodId);
    if (!food) throw new Error(`Food #${foodId} not found`);
    food.isPausedByAdmin = !food.isPausedByAdmin;
    food.pauseReason = food.isPausedByAdmin ? pauseReason || 'Temporarily paused by staff' : undefined;
    food.available = !food.isPausedByAdmin;
    return food;
  },
};
