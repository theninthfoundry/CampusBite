import React from 'react';

interface BreakFitFilterProps {
  currentBreakMins: number | null;
  onSelectBreakMins: (mins: number | null) => void;
}

const BREAK_OPTIONS = [
  { label: 'Any Time', value: null },
  { label: '⚡ 5-min Quick Bite', value: 5 },
  { label: '🕒 10-min Recess', value: 10 },
  { label: '🍱 15-min Class Break', value: 15 },
  { label: '☕ 30-min Free Slot', value: 30 },
];

export const BreakFitFilter: React.FC<BreakFitFilterProps> = ({
  currentBreakMins,
  onSelectBreakMins,
}) => {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: 'var(--text-lg)' }}>⚡</span>
          <h3
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            BREAK-FIT™ Filter
          </h3>
          <span
            style={{
              fontSize: '10px',
              background: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Class-Interval Safe
          </span>
        </div>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
          Filters items guaranteed ready within your exact passing period or recess window.
        </p>
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
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                border: '1px solid',
                borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                background: isSelected ? 'var(--color-primary)' : 'var(--color-bg)',
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
