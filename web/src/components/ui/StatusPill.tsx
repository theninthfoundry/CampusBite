import React from 'react';

export interface StatusPillProps {
  status: string;
  variant?: 'available' | 'paused' | 'out-of-stock' | 'info';
  children?: React.ReactNode;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  variant = 'available',
  children,
}) => {
  const variantColors: Record<string, { bg: string; text: string; border: string }> = {
    available: { bg: 'var(--success-subtle)', text: 'var(--success)', border: 'rgba(21, 128, 61, 0.2)' },
    paused: { bg: 'var(--warning-subtle)', text: 'var(--warning)', border: 'rgba(180, 83, 9, 0.2)' },
    'out-of-stock': { bg: 'var(--accent-subtle)', text: 'var(--accent)', border: 'rgba(220, 38, 38, 0.2)' },
    info: { bg: 'var(--info-subtle)', text: 'var(--info)', border: 'rgba(3, 105, 161, 0.2)' },
  };

  const styleConfig = variantColors[variant] || variantColors.available;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.15rem 0.5rem',
        borderRadius: 'var(--radius-xs)',
        fontSize: '0.65rem',
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        backgroundColor: styleConfig.bg,
        color: styleConfig.text,
        border: `1px solid ${styleConfig.border}`,
      }}
    >
      {children || status}
    </span>
  );
};
