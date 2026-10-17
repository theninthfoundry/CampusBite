import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  style,
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    borderRadius: 'var(--radius-xs)',
    border: '1px solid transparent',
    transition: 'all 0.15s ease',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.6 : 1,
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    xs: { padding: '0.2rem 0.5rem', fontSize: '0.68rem' },
    sm: { padding: '0.35rem 0.75rem', fontSize: '0.74rem' },
    md: { padding: '0.55rem 1.1rem', fontSize: '0.82rem' },
    lg: { padding: '0.75rem 1.5rem', fontSize: '0.92rem' },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--ink)',
      color: 'var(--bg)',
      borderColor: 'var(--ink)',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: 'var(--ink)',
      borderColor: 'var(--line-strong)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--muted)',
      borderColor: 'transparent',
    },
    danger: {
      backgroundColor: 'var(--accent)',
      color: '#ffffff',
      borderColor: 'var(--accent)',
    },
  };

  const combinedStyle: React.CSSProperties = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button
      style={combinedStyle}
      disabled={disabled || isLoading}
      className={`btn-${variant} ${className}`}
      {...props}
    >
      {isLoading ? '...' : children}
    </button>
  );
};
