import React, { useState } from 'react';
import { MenuGrid } from '../features/menu/MenuGrid';
import { BreakFitFilter } from '../features/break-fit/BreakFitFilter';
import { LastPlateSection } from '../features/last-plate/LastPlateSection';
import { KanbanBoard } from '../features/kitchen/KanbanBoard';
import { EmptyState } from '../components/feedback/EmptyState';
import { FoodItemDTO, LastPlateListing } from '../lib/types';
import { useToast } from './providers';

interface RoutesProps {
  currentPortal: 'student' | 'kitchen';
  onTogglePortal: () => void;
}

export const AppRoutes: React.FC<RoutesProps> = ({ currentPortal, onTogglePortal }) => {
  const { addToast } = useToast();
  const [breakMins, setBreakMins] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);

  const handleAddToCart = (item: FoodItemDTO) => {
    setCartCount((c) => c + 1);
    addToast('success', `Added ${item.name} to cart.`);
  };

  const handleReservePlate = (listing: LastPlateListing) => {
    addToast('info', `Reserved ${listing.foodItemName} via LAST PLATE™ at ₹${listing.discountedPrice}!`);
  };

  if (currentPortal === 'kitchen') {
    return (
      <div style={{ animation: 'fadeIn var(--transition-normal)' }}>
        <KanbanBoard />
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn var(--transition-normal)' }}>
      {/* Student ordering banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-6)',
          background: 'var(--color-surface)',
          padding: 'var(--space-4) var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--text-3xl)',
              color: 'var(--color-primary)',
              lineHeight: 1.2,
            }}
          >
            Smart Campus Dining
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
            Fresh meals synchronized with your academic schedule. Zero queueing, zero food waste.
          </p>
        </div>

        {cartCount > 0 && (
          <div
            style={{
              background: 'var(--color-primary)',
              color: '#ffffff',
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            <span>🛒</span>
            <span>{cartCount} item{cartCount > 1 ? 's' : ''} in cart</span>
          </div>
        )}
      </div>

      {/* Break-Fit Filter */}
      <BreakFitFilter currentBreakMins={breakMins} onSelectBreakMins={setBreakMins} />

      {/* LAST PLATE Surplus Deals */}
      <LastPlateSection onReservePlate={handleReservePlate} />

      {/* Menu Grid */}
      <MenuGrid onAddToCart={handleAddToCart} selectedMaxPrepTime={breakMins} />
    </div>
  );
};
