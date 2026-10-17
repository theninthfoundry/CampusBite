import { describe, it, expect, beforeEach } from 'vitest';
import { orderService } from '../lib/orderService';

describe('CampusBite Order Service & State Machine', () => {
  it('creates an order authoritatively with unique order reference', async () => {
    const key = 'TEST-KEY-' + Date.now();
    const order = await orderService.createOrder(
      key,
      [{ foodId: 1, qty: 1 }],
      'Test Student'
    );

    expect(order.id).toBeDefined();
    expect(order.orderRef).toMatch(/^CB-\d+$/);
    expect(order.status).toBe('NEW');
    expect(order.total).toBe(120); // Authoritative price of Chicken Biryani
    expect(order.customerName).toBe('Test Student');
  });

  it('enforces idempotency: identical key returns identical order without duplication', async () => {
    const key = 'IDEM-REPEAT-' + Date.now();
    const order1 = await orderService.createOrder(key, [{ foodId: 2, qty: 1 }], 'Student A');
    const order2 = await orderService.createOrder(key, [{ foodId: 2, qty: 1 }], 'Student A');

    expect(order1.id).toBe(order2.id);
    expect(order1.orderRef).toBe(order2.orderRef);
    expect(order1.total).toBe(order2.total);
  });

  it('advances order status along the canonical state machine', async () => {
    const key = 'TRANSIT-' + Date.now();
    const order = await orderService.createOrder(key, [{ foodId: 6, qty: 1 }], 'Student B');

    // NEW -> PREPARING
    const prepOrder = await orderService.advanceOrderStatus(
      order.id,
      'NEW',
      'PREPARING',
      'Chef Ramesh',
      'STAFF'
    );
    expect(prepOrder.status).toBe('PREPARING');

    // PREPARING -> READY
    const readyOrder = await orderService.advanceOrderStatus(
      order.id,
      'PREPARING',
      'READY',
      'Chef Ramesh',
      'STAFF'
    );
    expect(readyOrder.status).toBe('READY');

    // READY -> COLLECTED
    const collectedOrder = await orderService.advanceOrderStatus(
      order.id,
      'READY',
      'COLLECTED',
      'Student B',
      'STUDENT'
    );
    expect(collectedOrder.status).toBe('COLLECTED');
  });

  it('rejects conflicting or out-of-order transitions', async () => {
    const key = 'CONFLICT-' + Date.now();
    const order = await orderService.createOrder(key, [{ foodId: 7, qty: 1 }], 'Student C');

    // Attempting to advance from READY when order is still NEW should fail
    await expect(
      orderService.advanceOrderStatus(order.id, 'READY', 'COLLECTED', 'Staff', 'STAFF')
    ).rejects.toThrow(/Conflict/);
  });

  it('allows cancellation when NEW, but rejects cancellation once PREPARING', async () => {
    const key = 'CANCEL-' + Date.now();
    const order = await orderService.createOrder(key, [{ foodId: 10, qty: 1 }], 'Student D');

    // Permitted in NEW
    const cancelled = await orderService.cancelOrder(
      order.id,
      'Class reschedule',
      'Student D',
      'STUDENT'
    );
    expect(cancelled.status).toBe('CANCELLED');

    // Order 101 in seed is already PREPARING -> cancellation should be rejected
    await expect(
      orderService.cancelOrder(101, 'Changed mind', 'Student D', 'STUDENT')
    ).rejects.toThrow(/cannot be cancelled/);
  });
});

describe('Inventory & Dish Management (User Requests)', () => {
  it('adds a new raw inventory ingredient', async () => {
    const created = await orderService.addInventoryItem({
      ingredient: 'Organic Honey',
      qty: 5.0,
      unit: 'kg',
      minQty: 1.0,
      unitCost: 280,
    });

    expect(created.id).toBeDefined();
    expect(created.ingredient).toBe('Organic Honey');
    expect(created.qty).toBe(5.0);

    const inv = await orderService.fetchInventory();
    expect(inv.some((i) => i.ingredient === 'Organic Honey')).toBe(true);
  });

  it('adjusts physical stock counts', async () => {
    const updated = await orderService.updateInventoryStock(1, 30.0);
    expect(updated.id).toBe(1);
    expect(updated.qty).toBe(30.0);
  });

  it('publishes a new food dish to the menu', async () => {
    const dish = await orderService.addFoodItem({
      name: 'Paneer Tikka Roll',
      description: 'Char-grilled cottage cheese in flaky parotta',
      price: 85,
      costPrice: 35,
      category: 'Snacks',
      dietary: 'Veg',
      prepMin: 7,
      preparedPortions: 0,
      isPausedByAdmin: false,
    });

    expect(dish.id).toBeDefined();
    expect(dish.name).toBe('Paneer Tikka Roll');

    const menu = await orderService.fetchPublicMenu();
    expect(menu.some((f) => f.name === 'Paneer Tikka Roll')).toBe(true);
  });

  it('toggles pause on dishes and blocks ordering when paused', async () => {
    const paused = await orderService.toggleFoodPause(4, 'Oven maintenance');
    expect(paused.isPausedByAdmin).toBe(true);

    const key = 'PAUSED-TEST-' + Date.now();
    await expect(
      orderService.createOrder(key, [{ foodId: 4, qty: 1 }], 'Student E')
    ).rejects.toThrow(/paused by kitchen/);

    // Resume dish
    const resumed = await orderService.toggleFoodPause(4);
    expect(resumed.isPausedByAdmin).toBe(false);
  });
});
