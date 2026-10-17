import React, { useState } from 'react';
import { CartItem, Order, FoodItemDTO } from '../../lib/types';
import { Button } from '../../components/ui/Button';
import { calculateOrderEta } from '../../lib/etaEngine';
import { orderService } from '../../lib/orderService';

interface CheckoutModalProps {
  cart: CartItem[];
  activeQueueCount: number;
  customerName: string;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  cart,
  activeQueueCount,
  customerName,
  onClose,
  onOrderSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generate unique client-side idempotency key for this checkout attempt
  const [idempotencyKey] = useState<string>(
    () => 'CB-IDEM-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9)
  );

  const subtotal = cart.reduce((sum, item) => sum + item.food.price * item.qty, 0);

  const etaResult = calculateOrderEta({
    items: cart,
    activeQueueCount,
  });

  const handleConfirmOrder = async () => {
    if (isSubmitting || cart.length === 0) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const order = await orderService.createOrder(
        idempotencyKey,
        cart.map((i) => ({ foodId: i.food.id, qty: i.qty })),
        customerName
      );
      onOrderSuccess(order);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please check item availability.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        zIndex: 1000,
        animation: 'fadeIn var(--transition-fast)',
      }}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          maxWidth: '520px',
          width: '100%',
          padding: 'var(--space-6)',
          boxShadow: 'var(--shadow-lg)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
          <div>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase' }}>
              Finalize Order Verification
            </span>
            <h2 id="checkout-modal-title" style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', color: 'var(--color-primary)' }}>
              Order Review & Confirmation
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close checkout modal"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
            }}
          >
            ✕
          </button>
        </div>

        {/* Items Summary Table */}
        <div
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-4)',
            background: 'var(--color-bg-subtle)',
          }}
        >
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
            DISHES IN TRAY
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {cart.map((item) => (
              <li
                key={item.food.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: 'var(--space-2) 0',
                  borderBottom: '1px solid var(--color-border)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                <div>
                  <strong>{item.qty}x</strong> {item.food.name}
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    ₹{item.food.price} each · {item.food.prepMin}m base prep
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  ₹{item.food.price * item.qty}
                </span>
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
            <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Authoritative Total:</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-primary)' }}>
              ₹{subtotal}
            </span>
          </div>
        </div>

        {/* Live ETA Card */}
        <div
          style={{
            background: etaResult.allPortionsPrepared ? '#f0fdf4' : '#fffbeb',
            border: `1px solid ${etaResult.allPortionsPrepared ? '#bbf7d0' : '#fde68a'}`,
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-4)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: etaResult.allPortionsPrepared ? '#166534' : '#92400e' }}>
              ⏱ CALCULATED READY TIME
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 'var(--text-base)', color: etaResult.allPortionsPrepared ? '#166534' : '#92400e' }}>
              ~{etaResult.estimatedMins} MINS
            </span>
          </div>
          <p style={{ fontSize: '11px', color: etaResult.allPortionsPrepared ? '#15803d' : '#b45309', marginTop: '2px', lineHeight: 1.4 }}>
            {etaResult.explanation}
          </p>
        </div>

        {/* Idempotency & Pickup Policy Notice */}
        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 1.4 }}>
          <strong>Pickup & Payment:</strong> Counter 01 · Payment collected upon pickup via Cash / UPI.
          <br />
          <strong>Idempotency Key:</strong> <code>{idempotencyKey}</code> (Prevents duplicate order creation).
        </div>

        {errorMessage && (
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
            {errorMessage}
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="outline" onClick={onClose} fullWidth disabled={isSubmitting}>
            Modify Tray
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmOrder}
            fullWidth
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Transmitting Order...' : `Confirm & Transmit (₹${subtotal}) →`}
          </Button>
        </div>
      </div>
    </div>
  );
};
