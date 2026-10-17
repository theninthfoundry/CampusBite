import React, { useState } from 'react';
import { Order, OrderStatus } from '../../lib/types';
import { StatusPill } from '../../components/ui/StatusPill';
import { Button } from '../../components/ui/Button';

export const FIXTURE_KITCHEN_ORDERS: Order[] = [
  {
    id: 'ord-101',
    userId: 'u-1',
    userName: 'Namira K.',
    items: [
      { foodItemId: 'f-1', name: 'Steamed Idli Sambar', price: 35, quantity: 2, subtotal: 70 },
      { foodItemId: 'f-5', name: 'Cold Pressed Lime Juice', price: 30, quantity: 1, subtotal: 30 },
    ],
    totalAmount: 100,
    status: 'PLACED',
    createdAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    estimatedReadyTime: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
    idempotencyKey: 'idem-101',
  },
  {
    id: 'ord-102',
    userId: 'u-2',
    userName: 'Aarav S.',
    items: [
      { foodItemId: 'f-2', name: 'Masala Dosa', price: 55, quantity: 1, subtotal: 55 },
    ],
    totalAmount: 55,
    status: 'PREPARING',
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    estimatedReadyTime: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
    idempotencyKey: 'idem-102',
  },
  {
    id: 'ord-103',
    userId: 'u-3',
    userName: 'Diya M.',
    items: [
      { foodItemId: 'f-3', name: 'Paneer Butter Masala Thali', price: 110, quantity: 1, subtotal: 110 },
    ],
    totalAmount: 110,
    status: 'READY',
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    estimatedReadyTime: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    idempotencyKey: 'idem-103',
  },
];

const COLUMNS: { status: OrderStatus; label: string }[] = [
  { status: 'PLACED', label: 'Incoming Orders' },
  { status: 'PREPARING', label: 'In Kitchen' },
  { status: 'READY', label: 'Ready for Pickup' },
  { status: 'COMPLETED', label: 'Completed' },
];

export const KanbanBoard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(FIXTURE_KITCHEN_ORDERS);

  const advanceOrderStatus = (orderId: string, currentStatus: OrderStatus) => {
    const nextStatusMap: Record<OrderStatus, OrderStatus | null> = {
      PLACED: 'PREPARING',
      PREPARING: 'READY',
      READY: 'COMPLETED',
      COMPLETED: null,
      CANCELLED: null,
    };

    const next = nextStatusMap[currentStatus];
    if (!next) return;

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: next } : o))
    );
  };

  return (
    <section aria-labelledby="kitchen-heading">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 'var(--space-6)',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: 'var(--space-3)',
        }}
      >
        <div>
          <h2 id="kitchen-heading" style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', color: 'var(--color-primary)' }}>
            Kitchen Operations Queue
          </h2>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            [Development Fixture Board — Stage 1 Foundation]
          </span>
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
          Active Orders: <strong>{orders.filter((o) => o.status !== 'COMPLETED').length}</strong>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
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
                minHeight: '400px',
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
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
                          #{ord.id.toUpperCase()}
                        </span>
                        <StatusPill status={ord.status} />
                      </div>

                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
                        {ord.userName}
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
                              {i.quantity}x {i.name}
                            </span>
                            <span style={{ fontFamily: 'var(--font-mono)' }}>₹{i.subtotal}</span>
                          </li>
                        ))}
                      </ul>

                      {col.status !== 'COMPLETED' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          fullWidth
                          onClick={() => advanceOrderStatus(ord.id, ord.status)}
                        >
                          {col.status === 'PLACED' && 'Start Prep →'}
                          {col.status === 'PREPARING' && 'Mark Ready ✓'}
                          {col.status === 'READY' && 'Complete Pickup 📦'}
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
    </section>
  );
};
