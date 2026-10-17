import React, { useState, useEffect } from 'react';
import { MenuGrid } from '../features/menu/MenuGrid';
import { BreakFitFilter } from '../features/break-fit/BreakFitFilter';
import { LastPlateSection } from '../features/last-plate/LastPlateSection';
import { KanbanBoard } from '../features/kitchen/KanbanBoard';
import { CheckoutModal } from '../features/ordering/CheckoutModal';
import { OrderTrackingView } from '../features/ordering/OrderTrackingView';
import { FoodItemDTO, CartItem, Order, LastPlateListing } from '../lib/types';
import { orderService } from '../lib/orderService';
import { useToast } from './providers';
import { Button } from '../components/ui/Button';

interface RoutesProps {
  currentPortal: 'student' | 'kitchen';
  onTogglePortal: () => void;
}

export const AppRoutes: React.FC<RoutesProps> = ({ currentPortal, onTogglePortal }) => {
  const { addToast } = useToast();
  const [menuItems, setMenuItems] = useState<FoodItemDTO[]>([]);
  const [activeQueueCount, setActiveQueueCount] = useState<number>(2);
  const [breakMins, setBreakMins] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Load menu items and active queue count
  const loadMenuAndQueue = async () => {
    try {
      const [fetchedMenu, activeOrders] = await Promise.all([
        orderService.fetchPublicMenu(),
        orderService.fetchActiveOrders(),
      ]);
      setMenuItems(fetchedMenu);
      setActiveQueueCount(activeOrders.length);
    } catch (err: any) {
      console.error('Failed to load menu data:', err);
    }
  };

  useEffect(() => {
    loadMenuAndQueue();
    const interval = setInterval(loadMenuAndQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddToCart = (item: FoodItemDTO) => {
    if (item.isPausedByAdmin) {
      addToast('warning', `Dish "${item.name}" is currently paused by kitchen.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((c) => c.food.id === item.id);
      if (existing) {
        return prev.map((c) => (c.food.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { food: item, qty: 1 }];
    });
    addToast('success', `Added ${item.name} to tray.`);
  };

  const handleClearTray = () => {
    setCart([]);
    addToast('info', 'Tray cleared.');
  };

  const handleOrderSuccess = (order: Order) => {
    setShowCheckout(false);
    setCart([]);
    setActiveOrder(order);
    addToast('success', `Order #${order.orderRef} confirmed! Sent to kitchen queue.`);
  };

  const totalCartQty = cart.reduce((s, i) => s + i.qty, 0);
  const totalCartPrice = cart.reduce((s, i) => s + i.food.price * i.qty, 0);

  if (currentPortal === 'kitchen') {
    return (
      <div style={{ animation: 'fadeIn var(--transition-normal)' }}>
        <KanbanBoard onOrdersChange={(orders) => setActiveQueueCount(orders.length)} />
      </div>
    );
  }

  // Active Order Live Tracking View
  if (activeOrder) {
    return (
      <div style={{ animation: 'fadeIn var(--transition-normal)' }}>
        <OrderTrackingView
          order={activeOrder}
          onOrderUpdate={(updated) => setActiveOrder(updated)}
          onBackToMenu={() => setActiveOrder(null)}
        />
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn var(--transition-normal)' }}>
      {/* Student dining banner & Tray summary */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-6)',
          background: 'var(--color-surface)',
          padding: 'var(--space-5) var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase' }}>
            Campus Dining Experience
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--text-3xl)',
              color: 'var(--color-primary)',
              lineHeight: 1.15,
              marginTop: '2px',
            }}
          >
            Authoritative Kitchen Synchronization
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-1)' }}>
            Real-time warmer allocations, zero double-deductions, and schedule-aware BREAK-FIT.
          </p>
        </div>

        {cart.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button
              onClick={handleClearTray}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowCheckout(true)}
              aria-label={`View tray with ${totalCartQty} items for ₹${totalCartPrice}`}
            >
              🛒 View Tray ({totalCartQty}) · ₹{totalCartPrice} →
            </Button>
          </div>
        )}
      </div>

      {/* BREAK-FIT Smart Academic Window Filter */}
      <BreakFitFilter
        currentBreakMins={breakMins}
        onSelectBreakMins={setBreakMins}
        activeQueueCount={activeQueueCount}
        menuItems={menuItems}
      />

      {/* Menu Grid */}
      <MenuGrid
        items={menuItems}
        onAddToCart={handleAddToCart}
        selectedMaxPrepTime={breakMins}
        activeQueueCount={activeQueueCount}
      />

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          activeQueueCount={activeQueueCount}
          customerName="Sreeshanth"
          onClose={() => setShowCheckout(false)}
          onOrderSuccess={handleOrderSuccess}
        />
      )}
    </div>
  );
};
