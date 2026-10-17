import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, InventoryItem, FoodItemDTO } from '../../lib/types';
import { StatusPill } from '../../components/ui/StatusPill';
import { Button } from '../../components/ui/Button';
import { orderService } from '../../lib/orderService';
import { useToast } from '../../app/providers';

interface KanbanBoardProps {
  onOrdersChange?: (orders: Order[]) => void;
}

const COLUMNS: { status: OrderStatus; label: string; badgeColor: string }[] = [
  { status: 'NEW', label: 'Incoming Orders', badgeColor: 'var(--color-accent)' },
  { status: 'PREPARING', label: 'On Stove / Prep', badgeColor: '#3b82f6' },
  { status: 'READY', label: 'Ready for Pickup', badgeColor: 'var(--color-success)' },
  { status: 'COLLECTED', label: 'Collected History', badgeColor: 'var(--color-text-secondary)' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ onOrdersChange }) => {
  const { addToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [foods, setFoods] = useState<FoodItemDTO[]>([]);
  const [activeTab, setActiveTab] = useState<'queue' | 'inventory' | 'menu'>('queue');

  // Modals for user requests ("add options to add the inventory, items and all those")
  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
  const [showAddDishModal, setShowAddDishModal] = useState(false);

  // Form states
  const [newIngredient, setNewIngredient] = useState({
    ingredient: '',
    qty: 10,
    unit: 'kg',
    minQty: 2,
    unitCost: 50,
  });

  const [newDish, setNewDish] = useState({
    name: '',
    description: '',
    price: 60,
    category: 'Meals' as const,
    dietary: 'Veg' as const,
    prepMin: 8,
    preparedPortions: 0,
    costPrice: 25,
    isPausedByAdmin: false,
  });

  const loadData = async () => {
    try {
      const [fetchedOrders, fetchedInv, fetchedFoods] = await Promise.all([
        orderService.fetchActiveOrders(),
        orderService.fetchInventory(),
        orderService.fetchPublicMenu(),
      ]);
      setOrders(fetchedOrders);
      setInventory(fetchedInv);
      setFoods(fetchedFoods);
      if (onOrdersChange) onOrdersChange(fetchedOrders);
    } catch (err: any) {
      addToast('error', `Failed to load kitchen data: ${err.message}`);
    }
  };

  useEffect(() => {
    loadData();
    // Poll every 5s for cross-device updates
    const timer = setInterval(loadData, 5000);
    return () => clearInterval(timer);
  }, []);

  const advanceOrderStatus = async (orderId: number, currentStatus: OrderStatus) => {
    const nextStatusMap: Record<OrderStatus, OrderStatus | null> = {
      NEW: 'PREPARING',
      ACCEPTED: 'PREPARING',
      PREPARING: 'READY',
      READY: 'COLLECTED',
      COLLECTED: null,
      CANCELLED: null,
      NO_SHOW: null,
      EXPIRED: null,
    };

    const next = nextStatusMap[currentStatus];
    if (!next) return;

    try {
      const updated = await orderService.advanceOrderStatus(
        orderId,
        currentStatus,
        next,
        'Chef Ramesh',
        'STAFF'
      );
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: next } : o)));
      addToast('success', `Order #${updated.orderRef} advanced to ${next}`);
      if (onOrdersChange) onOrdersChange(orders);
    } catch (err: any) {
      addToast('error', `Status advance failed: ${err.message}`);
    }
  };

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredient.ingredient.trim()) return;

    try {
      const created = await orderService.addInventoryItem(newIngredient);
      setInventory((prev) => [...prev, created]);
      addToast('success', `Added ingredient "${created.ingredient}" to raw stock ledger.`);
      setShowAddInventoryModal(false);
      setNewIngredient({ ingredient: '', qty: 10, unit: 'kg', minQty: 2, unitCost: 50 });
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDish.name.trim()) return;

    try {
      const created = await orderService.addFoodItem(newDish);
      setFoods((prev) => [...prev, created]);
      addToast('success', `Dish "${created.name}" published to campus dining menu!`);
      setShowAddDishModal(false);
      setNewDish({
        name: '',
        description: '',
        price: 60,
        category: 'Meals',
        dietary: 'Veg',
        prepMin: 8,
        preparedPortions: 0,
        costPrice: 25,
        isPausedByAdmin: false,
      });
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleTogglePause = async (foodId: number) => {
    try {
      const updated = await orderService.toggleFoodPause(foodId, 'Paused by Kitchen Chef');
      setFoods((prev) => prev.map((f) => (f.id === foodId ? updated : f)));
      addToast('info', `Dish #${foodId} is now ${updated.isPausedByAdmin ? 'PAUSED' : 'ACTIVE'}.`);
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleQuickStockAdjust = async (id: number, delta: number) => {
    const item = inventory.find((i) => i.id === id);
    if (!item) return;
    const newQty = Math.max(0, item.qty + delta);

    try {
      const updated = await orderService.updateInventoryStock(id, newQty);
      setInventory((prev) => prev.map((i) => (i.id === id ? updated : i)));
      addToast('info', `Stock of ${updated.ingredient} updated to ${updated.qty} ${updated.unit}`);
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  return (
    <section aria-labelledby="kitchen-heading">
      {/* Kitchen Header & Navigation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 'var(--space-6)',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: 'var(--space-4)',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-xl)' }}>🍳</span>
            <h2 id="kitchen-heading" style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', color: 'var(--color-primary)' }}>
              Kitchen Operations & Live Queue
            </h2>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Authoritative multi-station order advancement, physical inventory tracking, and dish pause controls.
          </p>
        </div>

        {/* Tab Controls & Add Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '2px',
            }}
          >
            <button
              onClick={() => setActiveTab('queue')}
              style={{
                padding: 'var(--space-1) var(--space-3)',
                background: activeTab === 'queue' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'queue' ? '#fff' : 'var(--color-text)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Active Queue ({orders.filter((o) => o.status !== 'COLLECTED').length})
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              style={{
                padding: 'var(--space-1) var(--space-3)',
                background: activeTab === 'inventory' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'inventory' ? '#fff' : 'var(--color-text)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Raw Inventory ({inventory.length})
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              style={{
                padding: 'var(--space-1) var(--space-3)',
                background: activeTab === 'menu' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'menu' ? '#fff' : 'var(--color-text)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Menu Controls ({foods.length})
            </button>
          </div>

          {activeTab === 'inventory' && (
            <Button variant="primary" size="sm" onClick={() => setShowAddInventoryModal(true)}>
              + Add Ingredient
            </Button>
          )}

          {activeTab === 'menu' && (
            <Button variant="primary" size="sm" onClick={() => setShowAddDishModal(true)}>
              + Add Menu Item
            </Button>
          )}
        </div>
      </div>

      {/* VIEW 1: ACTIVE ORDER KANBAN QUEUE */}
      {activeTab === 'queue' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          {COLUMNS.map((col) => {
            const colOrders = orders.filter((o) => o.status === col.status);
            return (
              <div
                key={col.status}
                style={{
                  background: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '440px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-3)',
                    paddingBottom: 'var(--space-2)',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {col.label}
                  </h3>
                  <span
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-full)',
                      padding: '2px 8px',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                    }}
                  >
                    {colOrders.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', flex: 1 }}>
                  {colOrders.length === 0 ? (
                    <div
                      style={{
                        margin: 'auto 0',
                        textAlign: 'center',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-secondary)',
                        padding: 'var(--space-6) 0',
                      }}
                    >
                      No orders
                    </div>
                  ) : (
                    colOrders.map((ord) => (
                      <article
                        key={ord.id}
                        style={{
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          padding: 'var(--space-3)',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary)' }}>
                            #{ord.orderRef}
                          </span>
                          <StatusPill status={ord.status} />
                        </div>

                        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
                          {ord.customerName} · <span style={{ color: 'var(--color-text-secondary)' }}>~{ord.etaMin}m target</span>
                        </div>

                        <ul style={{ listStyle: 'none', margin: '0 0 var(--space-3) 0', padding: 0 }}>
                          {ord.items.map((i, idx) => (
                            <li
                              key={idx}
                              style={{
                                fontSize: 'var(--text-xs)',
                                color: 'var(--color-text-secondary)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '2px 0',
                              }}
                            >
                              <span>
                                {i.qty}x {i.name}
                              </span>
                              <span style={{ fontFamily: 'var(--font-mono)' }}>₹{i.subtotal}</span>
                            </li>
                          ))}
                        </ul>

                        {col.status !== 'COLLECTED' && (
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            onClick={() => advanceOrderStatus(ord.id, ord.status)}
                          >
                            {col.status === 'NEW' && 'Start Preparation →'}
                            {col.status === 'PREPARING' && 'Mark Ready for Pickup ✓'}
                            {col.status === 'READY' && 'Confirm Collected 📦'}
                          </Button>
                        )}
                      </article>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: RAW INVENTORY LEDGER & STOCK CONTROLS */}
      {activeTab === 'inventory' && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-primary)' }}>
                Physical Raw Stock Ledger
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                Real-time stock balance. When items reach min threshold, connected dishes alert or pause automatically.
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: 'var(--space-2)' }}>ID</th>
                  <th style={{ padding: 'var(--space-2)' }}>Ingredient</th>
                  <th style={{ padding: 'var(--space-2)' }}>Current Stock</th>
                  <th style={{ padding: 'var(--space-2)' }}>Min Threshold</th>
                  <th style={{ padding: 'var(--space-2)' }}>Unit Cost</th>
                  <th style={{ padding: 'var(--space-2)' }}>Status</th>
                  <th style={{ padding: 'var(--space-2)', textAlign: 'right' }}>Stock Adjust</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((inv) => {
                  const isLow = inv.qty <= inv.minQty;
                  return (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: 'var(--space-3) var(--space-2)', fontFamily: 'var(--font-mono)' }}>#{inv.id}</td>
                      <td style={{ padding: 'var(--space-3) var(--space-2)', fontWeight: 600 }}>{inv.ingredient}</td>
                      <td style={{ padding: 'var(--space-3) var(--space-2)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {inv.qty} {inv.unit}
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-2)', color: 'var(--color-text-secondary)' }}>
                        {inv.minQty} {inv.unit}
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-2)', fontFamily: 'var(--font-mono)' }}>₹{inv.unitCost}</td>
                      <td style={{ padding: 'var(--space-3) var(--space-2)' }}>
                        <span
                          style={{
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '10px',
                            fontWeight: 700,
                            background: isLow ? '#fee2e2' : '#dcfce7',
                            color: isLow ? '#991b1b' : '#166534',
                          }}
                        >
                          {isLow ? 'LOW STOCK' : 'ADEQUATE'}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          <button
                            onClick={() => handleQuickStockAdjust(inv.id, -1)}
                            style={{ padding: '2px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                            title="Decrement 1"
                          >
                            −1
                          </button>
                          <button
                            onClick={() => handleQuickStockAdjust(inv.id, +5)}
                            style={{ padding: '2px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                            title="Restock 5"
                          >
                            +5
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: DISH MANAGEMENT & PAUSE CONTROLS */}
      {activeTab === 'menu' && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-primary)' }}>
                Campus Menu Availability & Warmer Stocks
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                Control live kitchen ordering availability. Paused dishes are instantly hidden from the student cart.
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: 'var(--space-2)' }}>Dish</th>
                  <th style={{ padding: 'var(--space-2)' }}>Category</th>
                  <th style={{ padding: 'var(--space-2)' }}>Price</th>
                  <th style={{ padding: 'var(--space-2)' }}>Prep Time</th>
                  <th style={{ padding: 'var(--space-2)' }}>Warmer Stock</th>
                  <th style={{ padding: 'var(--space-2)' }}>Status</th>
                  <th style={{ padding: 'var(--space-2)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {foods.map((food) => (
                  <tr key={food.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: 'var(--space-3) var(--space-2)', fontWeight: 600 }}>{food.name}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-2)', color: 'var(--color-text-secondary)' }}>{food.category}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-2)', fontFamily: 'var(--font-mono)' }}>₹{food.price}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-2)' }}>{food.prepMin} mins</td>
                    <td style={{ padding: 'var(--space-3) var(--space-2)', fontFamily: 'var(--font-mono)' }}>
                      {food.preparedPortions} ready ({food.allocatedPortions} allocated)
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-2)' }}>
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '10px',
                          fontWeight: 700,
                          background: food.isPausedByAdmin ? '#fee2e2' : '#dcfce7',
                          color: food.isPausedByAdmin ? '#991b1b' : '#166534',
                        }}
                      >
                        {food.isPausedByAdmin ? 'PAUSED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'right' }}>
                      <Button
                        variant={food.isPausedByAdmin ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => handleTogglePause(food.id)}
                      >
                        {food.isPausedByAdmin ? 'Resume Ordering' : 'Pause Dish'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD INVENTORY INGREDIENT */}
      {showAddInventoryModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '440px',
              width: '100%',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
              Add Raw Ingredient
            </h3>
            <form onSubmit={handleAddIngredient}>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Ingredient Name
                </label>
                <input
                  type="text"
                  required
                  value={newIngredient.ingredient}
                  onChange={(e) => setNewIngredient({ ...newIngredient, ingredient: e.target.value })}
                  placeholder="e.g. Basmati Rice, Butter, Tomatoes"
                  style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Initial Quantity
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={newIngredient.qty}
                    onChange={(e) => setNewIngredient({ ...newIngredient, qty: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Measurement Unit
                  </label>
                  <select
                    value={newIngredient.unit}
                    onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                    style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                  >
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                    <option value="packs">packs</option>
                    <option value="pcs">pcs</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <div>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Min Alert Threshold
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={newIngredient.minQty}
                    onChange={(e) => setNewIngredient({ ...newIngredient, minQty: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Unit Cost (₹)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    required
                    value={newIngredient.unitCost}
                    onChange={(e) => setNewIngredient({ ...newIngredient, unitCost: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                <Button variant="outline" size="sm" type="button" onClick={() => setShowAddInventoryModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Ingredient
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MENU DISH */}
      {showAddDishModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '480px',
              width: '100%',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
              Publish New Dish to Canteen Menu
            </h3>
            <form onSubmit={handleAddDish}>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Dish Name
                </label>
                <input
                  type="text"
                  required
                  value={newDish.name}
                  onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                  placeholder="e.g. Masala Dosa, Paneer Wrap"
                  style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div style={{ marginBottom: 'var(--space-3)' }}>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newDish.description}
                  onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                  placeholder="Appetizing description for students"
                  style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Public Price (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newDish.price}
                    onChange={(e) => setNewDish({ ...newDish, price: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Prep Duration (mins)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newDish.prepMin}
                    onChange={(e) => setNewDish({ ...newDish, prepMin: parseInt(e.target.value, 10) || 1 })}
                    style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <div>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Category
                  </label>
                  <select
                    value={newDish.category}
                    onChange={(e) => setNewDish({ ...newDish, category: e.target.value as any })}
                    style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                  >
                    <option value="Meals">Meals</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Dietary Classification
                  </label>
                  <select
                    value={newDish.dietary}
                    onChange={(e) => setNewDish({ ...newDish, dietary: e.target.value as any })}
                    style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                  >
                    <option value="Veg">Vegetarian</option>
                    <option value="Non-Veg">Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                <Button variant="outline" size="sm" type="button" onClick={() => setShowAddDishModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Publish Dish
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
