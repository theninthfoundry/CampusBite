import React from 'react';
import { ToastMessage } from '../../lib/types';

export interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      role="region"
      aria-label="Notifications"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        pointerEvents: 'none',
        maxWidth: '380px',
      }}
    >
      {toasts.map(toast => {
        const bgColors = {
          success: 'var(--ink)',
          error: 'var(--accent)',
          warning: 'var(--warning)',
          info: 'var(--ink)',
        };

        const icons = {
          success: '✓',
          error: '✕',
          warning: '⚠',
          info: 'ℹ',
        };

        return (
          <div
            key={toast.id}
            role="status"
            style={{
              pointerEvents: 'auto',
              backgroundColor: bgColors[toast.type] || 'var(--ink)',
              color: '#ffffff',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              boxShadow: 'var(--shadow-lg)',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {icons[toast.type]}
              </span>
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              aria-label="Close notification"
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.9rem',
                padding: '0.1rem 0.3rem',
              }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};
