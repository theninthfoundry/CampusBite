import React, { useState } from 'react';
import { Order, OrderStatus } from '../../lib/types';
import { StatusPill } from '../../components/ui/StatusPill';
import { Button } from '../../components/ui/Button';
import { orderService } from '../../lib/orderService';

interface OrderTrackingViewProps {
  order: Order;
  onOrderUpdate: (updatedOrder: Order) => void;
  onBackToMenu: () => void;
}

const STATUS_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'NEW', label: 'Order Received', desc: 'Logged in kitchen queue' },
  { status: 'ACCEPTED', label: 'Accepted', desc: 'Station assigned' },
  { status: 'PREPARING', label: 'Preparing', desc: 'Cooking on stove' },
  { status: 'READY', label: 'Ready for Pickup', desc: 'At Counter 01' },
  { status: 'COLLECTED', label: 'Collected', desc: 'Picked up by student' },
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  order,
  onOrderUpdate,
  onBackToMenu,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.status === order.status);

  const canCancel = order.status === 'NEW' || order.status === 'ACCEPTED';
  const isReady = order.status === 'READY';

  const handleCancelOrder = async () => {
    if (!window.confirm(`Cancel order ${order.orderRef}? Your portion allocations will be restored.`)) {
      return;
    }
    setIsProcessing(true);
    setActionError(null);

    try {
      const updated = await orderService.cancelOrder(
        order.id,
        'Cancelled by student before cooking started',
        order.customerName,
        'STUDENT'
      );
      onOrderUpdate(updated);
    } catch (err: any) {
      setActionError(err.message || 'Unable to cancel order.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCollectOrder = async () => {
    setIsProcessing(true);
    setActionError(null);

    try {
      const updated = await orderService.advanceOrderStatus(
        order.id,
        'READY',
        'COLLECTED',
        order.customerName,
        'STUDENT'
      );
      onOrderUpdate(updated);
    } catch (err: any) {
      setActionError(err.message || 'Unable to confirm collection.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '680px',
        margin: '0 auto',
        padding: 'var(--space-6)',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <button
          onClick={onBackToMenu}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-primary)',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          ← Back to Canteen Menu
        </button>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
          IDEM: {order.idempotencyKey.slice(-12)}
        </span>
      </div>

      <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase' }}>
              Confirmed Operational Token
            </span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', color: 'var(--color-primary)', margin: 'var(--space-1) 0' }}>
              Token #{order.orderRef}
            </h1>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
              Placed at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Counter 01
            </p>
          </div>
          <StatusPill status={order.status} />
        </div>
      </div>

      {/* Real-Time Stepper */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
          REAL-TIME KITCHEN PROGRESSION
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 'var(--space-2)',
            textAlign: 'center',
          }}
        >
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = currentStepIndex > idx || order.status === 'COLLECTED';
            const isCurrent = currentStepIndex === idx && order.status !== 'COLLECTED';
            const bulletBg = isCompleted ? 'var(--color-success)' : isCurrent ? 'var(--color-primary)' : 'var(--color-border)';

            return (
              <div key={step.status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: bulletBg,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    marginBottom: 'var(--space-2)',
                    boxShadow: isCurrent ? '0 0 0 4px rgba(27, 42, 74, 0.15)' : 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span style={{ fontSize: '11px', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                  {step.label}
                </span>
                <span style={{ fontSize: '9px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {step.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ETA & Collection Box */}
      {order.status !== 'COLLECTED' && order.status !== 'CANCELLED' && (
        <div
          style={{
            background: isReady ? '#ecfdf5' : '#f8fafc',
            border: `1.5px solid ${isReady ? 'var(--color-success)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: isReady ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
              {isReady ? '🎉 READY AT COUNTER 01' : 'ESTIMATED TIME REMAINING'}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', marginTop: '2px' }}>
              {isReady
                ? 'Your meal is plated and steaming hot. Please collect at Counter 01.'
                : `Target Ready Time: ~${order.etaMin} mins from submission.`}
            </div>
          </div>
          {isReady && (
            <Button variant="primary" size="sm" onClick={handleCollectOrder} disabled={isProcessing}>
              Confirm Received ✓
            </Button>
          )}
        </div>
      )}

      {/* Order Items Breakdown */}
      <div
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
          TRANSACTION BREAKDOWN
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {order.items.map((it, idx) => (
            <li
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: 'var(--space-2) 0',
                borderBottom: '1px solid var(--color-border)',
                fontSize: 'var(--text-sm)',
              }}
            >
              <span>
                <strong>{it.qty}x</strong> {it.name}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>₹{it.subtotal}</span>
            </li>
          ))}
        </ul>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            paddingTop: 'var(--space-3)',
            marginTop: 'var(--space-2)',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Total Payable:</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-primary)' }}>
            ₹{order.total}
          </span>
        </div>
      </div>

      {actionError && (
        <div
          role="alert"
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            marginBottom: 'var(--space-4)',
          }}
        >
          {actionError}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {canCancel && (
          <Button
            variant="danger"
            size="sm"
            onClick={handleCancelOrder}
            disabled={isProcessing}
          >
            Cancel Order
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onBackToMenu} style={{ marginLeft: 'auto' }}>
          Browse Menu
        </Button>
      </div>
    </div>
  );
};
