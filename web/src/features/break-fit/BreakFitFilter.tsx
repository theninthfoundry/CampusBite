import React from 'react';
import { FoodItemDTO, BreakFitRecommendation } from '../../lib/types';
import { evaluateBreakFit } from '../../lib/etaEngine';

interface BreakFitFilterProps {
  currentBreakMins: number | null;
  onSelectBreakMins: (mins: number | null) => void;
  activeQueueCount: number;
  menuItems: FoodItemDTO[];
}

const BREAK_OPTIONS = [
  { label: 'All Dishes', value: null },
  { label: '⚡ 5-min Recess', value: 5 },
  { label: '🕒 10-min Passing Period', value: 10 },
  { label: '🍱 15-min Break', value: 15 },
  { label: '☕ 30-min Free Slot', value: 30 },
];

export const BreakFitFilter: React.FC<BreakFitFilterProps> = ({
  currentBreakMins,
  onSelectBreakMins,
  activeQueueCount,
  menuItems,
}) => {
  // Calculate how many menu items fit the selected break
  const fittingDishesCount = currentBreakMins
    ? menuItems.filter((f) => evaluateBreakFit(f, 1, currentBreakMins, activeQueueCount).fitsBreak).length
    : menuItems.length;

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        marginBottom: 'var(--space-6)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-xl)' }}>⚡</span>
            <h3
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 700,
                color: 'var(--color-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              BREAK-FIT™ Smart Academic Timing
            </h3>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                background: activeQueueCount > 4 ? '#fef3c7' : '#ecfdf5',
                color: activeQueueCount > 4 ? '#92400e' : '#065f46',
                border: `1px solid ${activeQueueCount > 4 ? '#fde68a' : '#a7f3d0'}`,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              Live Kitchen: {activeQueueCount} queued {activeQueueCount === 1 ? 'order' : 'orders'}
            </span>
          </div>
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              marginTop: '4px',
              maxWidth: '620px',
            }}
          >
            Calculates real kitchen prep times against live warmer stock and outstanding queue congestion.
            Guarantees meals ready for collection before your next lecture begins.
          </p>
        </div>

        {currentBreakMins && (
          <div
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              color: 'var(--color-primary)',
              background: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            {fittingDishesCount} dishes guaranteed within {currentBreakMins}m
          </div>
        )}
      </div>

      <div
        role="radiogroup"
        aria-label="Available break time options"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}
      >
        {BREAK_OPTIONS.map((opt) => {
          const isSelected = currentBreakMins === opt.value;
          return (
            <button
              key={opt.label}
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectBreakMins(opt.value)}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                border: '1px solid',
                borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                background: isSelected ? 'var(--color-primary)' : 'var(--color-surface)',
                color: isSelected ? '#ffffff' : 'var(--color-text)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
