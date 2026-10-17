import React, { useState } from 'react';
import { FoodItemDTO } from '../../lib/types';
import { Button } from '../../components/ui/Button';
import { evaluateBreakFit } from '../../lib/etaEngine';

interface MenuGridProps {
  items: FoodItemDTO[];
  onAddToCart?: (item: FoodItemDTO) => void;
  selectedMaxPrepTime?: number | null;
  activeQueueCount?: number;
}

export const MenuGrid: React.FC<MenuGridProps> = ({
  items,
  onAddToCart,
  selectedMaxPrepTime,
  activeQueueCount = 0,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categories = ['All', 'Meals', 'Snacks', 'Drinks', 'Desserts'];

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    if (!matchesCategory) return false;

    if (selectedMaxPrepTime != null) {
      const rec = evaluateBreakFit(item, 1, selectedMaxPrepTime, activeQueueCount);
      return rec.fitsBreak;
    }
    return true;
  });

  return (
    <section aria-labelledby="menu-heading" style={{ marginBottom: 'var(--space-10)' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: 'var(--space-4)',
        }}
      >
        <div>
          <h2 id="menu-heading" style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', color: 'var(--color-primary)' }}>
            Campus Daily Menu
          </h2>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
            Showing {filteredItems.length} dishes · Authenticated Public Menu
          </span>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }} role="group" aria-label="Menu categories">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--color-primary)' : 'var(--color-border)',
                background: selectedCategory === cat ? 'var(--color-primary)' : 'var(--color-surface)',
                color: selectedCategory === cat ? '#ffffff' : 'var(--color-text)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              aria-pressed={selectedCategory === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--space-12) var(--space-4)',
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>🍱</div>
          <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--color-text)', marginBottom: 'var(--space-1)' }}>
            No dishes match your selected break timing
          </h3>
          <p style={{ fontSize: 'var(--text-xs)', maxWidth: '400px', margin: '0 auto' }}>
            Try choosing a longer break period (e.g. 15 or 30 mins) or explore all categories.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--space-6)',
          }}
        >
          {filteredItems.map((item) => {
            const hasWarmerStock = item.availablePreparedPortions > 0;
            const isPaused = item.isPausedByAdmin;

            return (
              <article
                key={item.id}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: isPaused ? 0.75 : 1,
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {item.image && (
                  <div style={{ height: '160px', overflow: 'hidden', background: 'var(--color-border)', position: 'relative' }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {hasWarmerStock && !isPaused && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 'var(--space-2)',
                          left: 'var(--space-2)',
                          background: 'var(--color-success)',
                          color: '#ffffff',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                      >
                        ⚡ Ready in Warmer: {item.availablePreparedPortions}
                      </span>
                    )}
                    {isPaused && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 'var(--space-2)',
                          left: 'var(--space-2)',
                          background: 'var(--color-danger)',
                          color: '#ffffff',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        ⛔ Paused by Kitchen
                      </span>
                    )}
                  </div>
                )}

                <div style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span
                        aria-label={item.dietary === 'Veg' ? 'Vegetarian' : 'Non-Vegetarian'}
                        style={{
                          display: 'inline-block',
                          width: '14px',
                          height: '14px',
                          border: `1.5px solid ${item.dietary === 'Veg' ? 'var(--color-success)' : 'var(--color-danger)'}`,
                          padding: '2px',
                          textAlign: 'center',
                        }}
                      >
                        <span
                          style={{
                            display: 'block',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: item.dietary === 'Veg' ? 'var(--color-success)' : 'var(--color-danger)',
                          }}
                        />
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                        {item.category}
                      </span>
                    </div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)', fontWeight: 600 }}>
                      ⏱ {hasWarmerStock ? 'Instant' : `${item.prepMin}m prep`}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-1)' }}>
                    {item.name}
                  </h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', flex: 1, marginBottom: 'var(--space-4)', lineHeight: 1.4 }}>
                    {item.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 'var(--space-2)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-primary)' }}>
                      ₹{item.price}
                    </span>
                    <Button
                      variant={isPaused ? 'secondary' : 'primary'}
                      size="sm"
                      disabled={isPaused}
                      onClick={() => onAddToCart && onAddToCart(item)}
                      aria-label={`Add ${item.name} to tray for ₹${item.price}`}
                    >
                      {isPaused ? 'Paused' : '+ Add to Tray'}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
