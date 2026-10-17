import React, { useState } from 'react';
import { FoodItemDTO } from '../../lib/types';
import { Button } from '../../components/ui/Button';
import { StatusPill } from '../../components/ui/StatusPill';

// Clearly identified development fixtures (Stage 1 migration baseline)
export const FIXTURE_MENU_ITEMS: FoodItemDTO[] = [
  {
    id: 'f-1',
    name: 'Steamed Idli Sambar (2 pcs)',
    category: 'Breakfast',
    price: 35,
    isVeg: true,
    prepTimeMins: 4,
    calories: 180,
    proteinGrams: 6,
    available: true,
    description: 'Puffy fermented rice and lentil cakes served with drumstick sambar and fresh coconut chutney.',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80',
    allergens: ['Mustard seeds'],
  },
  {
    id: 'f-2',
    name: 'Masala Dosa with Chutneys',
    category: 'Breakfast',
    price: 55,
    isVeg: true,
    prepTimeMins: 8,
    calories: 340,
    proteinGrams: 8,
    available: true,
    description: 'Crisp golden crepe filled with spiced tempered potato mash.',
    imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&auto=format&fit=crop&q=80',
    allergens: ['Dairy (Butter)'],
  },
  {
    id: 'f-3',
    name: 'Paneer Butter Masala Thali',
    category: 'Lunch',
    price: 110,
    isVeg: true,
    prepTimeMins: 12,
    calories: 620,
    proteinGrams: 22,
    available: true,
    description: 'Cottage cheese cubes simmered in creamy makhani gravy, served with 2 parottas and jeera rice.',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80',
    allergens: ['Dairy', 'Cashews'],
  },
  {
    id: 'f-4',
    name: 'Hyderabadi Chicken Biryani',
    category: 'Lunch',
    price: 140,
    isVeg: false,
    prepTimeMins: 15,
    calories: 680,
    proteinGrams: 34,
    available: true,
    description: 'Fragrant basmati rice cooked on dum with marinated chicken cuts and whole ground spices.',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
    allergens: ['Dairy'],
  },
  {
    id: 'f-5',
    name: 'Cold Pressed Sweet Lime Juice',
    category: 'Beverages',
    price: 30,
    isVeg: true,
    prepTimeMins: 3,
    calories: 90,
    proteinGrams: 1,
    available: true,
    description: 'Freshly extracted mosambi juice with a pinch of black salt and mint.',
    allergens: [],
  },
];

interface MenuGridProps {
  onAddToCart?: (item: FoodItemDTO) => void;
  selectedMaxPrepTime?: number | null;
}

export const MenuGrid: React.FC<MenuGridProps> = ({ onAddToCart, selectedMaxPrepTime }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Breakfast', 'Lunch', 'Beverages'];

  const filteredItems = FIXTURE_MENU_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesPrepTime =
      selectedMaxPrepTime == null || item.prepTimeMins <= selectedMaxPrepTime;
    return matchesCategory && matchesPrepTime;
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
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            [Development Fixture Data — Stage 1 Foundation]
          </span>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: 'var(--space-2)' }} role="group" aria-label="Menu categories">
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
        <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-secondary)' }}>
          No menu items found matching the selected filter.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--space-6)',
          }}
        >
          {filteredItems.map((item) => (
            <article
              key={item.id}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'box-shadow var(--transition-fast), transform var(--transition-fast)',
              }}
            >
              {item.imageUrl && (
                <div style={{ height: '160px', overflow: 'hidden', background: 'var(--color-border)' }}>
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
              <div style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span
                      aria-label={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                      title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                      style={{
                        display: 'inline-block',
                        width: '14px',
                        height: '14px',
                        border: `1.5px solid ${item.isVeg ? 'var(--color-success)' : 'var(--color-danger)'}`,
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
                          background: item.isVeg ? 'var(--color-success)' : 'var(--color-danger)',
                        }}
                      />
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                      {item.category}
                    </span>
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)', fontWeight: 600 }}>
                    ⏱ {item.prepTimeMins} min prep
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
                    variant="primary"
                    size="sm"
                    onClick={() => onAddToCart && onAddToCart(item)}
                    aria-label={`Add ${item.name} to order for ₹${item.price}`}
                  >
                    + Add to Cart
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
