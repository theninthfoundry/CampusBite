import React from 'react';
import { LastPlateListing } from '../../lib/types';
import { Button } from '../../components/ui/Button';

export const FIXTURE_LAST_PLATE: LastPlateListing[] = [
  {
    id: 'lp-1',
    foodItemId: 'f-3',
    foodItemName: 'Surplus Paneer Butter Masala Thali',
    originalPrice: 110,
    discountedPrice: 55,
    quantityAvailable: 3,
    expiryTimestamp: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
  },
  {
    id: 'lp-2',
    foodItemId: 'f-2',
    foodItemName: 'Fresh Baked Bread & Masala Patties',
    originalPrice: 50,
    discountedPrice: 25,
    quantityAvailable: 5,
    expiryTimestamp: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
  },
];

interface LastPlateSectionProps {
  onReservePlate?: (listing: LastPlateListing) => void;
}

export const LastPlateSection: React.FC<LastPlateSectionProps> = ({ onReservePlate }) => {
  return (
    <section
      aria-labelledby="last-plate-heading"
      style={{
        background: '#fff9f0',
        border: '1.5px dashed var(--color-accent)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        marginBottom: 'var(--space-10)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-xl)' }}>🌱</span>
            <h2 id="last-plate-heading" style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', color: 'var(--color-primary)' }}>
              LAST PLATE™ — Campus Zero-Waste Rescue
            </h2>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Freshly prepared cafeteria portions at up to 50% discount before closing hours.
          </p>
        </div>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase' }}>
          [Development Fixture]
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {FIXTURE_LAST_PLATE.map((item) => (
          <div
            key={item.id}
            style={{
              background: '#ffffff',
              border: '1px solid #fed7aa',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-1)' }}>
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)' }}>
                  {item.foodItemName}
                </h3>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: 'var(--color-accent)',
                    background: '#ffedd5',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {item.quantityAvailable} left
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', margin: 'var(--space-2) 0' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-accent)' }}>
                  ₹{item.discountedPrice}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', textDecoration: 'line-through' }}>
                  ₹{item.originalPrice}
                </span>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-success)' }}>
                  Save 50%
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onReservePlate && onReservePlate(item)}
              aria-label={`Claim ${item.foodItemName} for ₹${item.discountedPrice}`}
            >
              ⚡ Claim Last Plate
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};
