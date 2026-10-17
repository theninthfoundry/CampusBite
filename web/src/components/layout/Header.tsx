import React from 'react';
import { UserProfile } from '../../lib/types';
import { Button } from '../ui/Button';

export interface HeaderProps {
  currentUser: UserProfile | null;
  currentLang: string;
  onLanguageChange: (lang: string) => void;
  onTogglePortal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentLang,
  onLanguageChange,
  onTogglePortal,
  onLogout,
}) => {
  const isStaffOrAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'STAFF';

  return (
    <header
      style={{
        borderBottom: '1px solid var(--line)',
        backgroundColor: 'var(--bg)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        className="app-container"
        style={{
          minHeight: 'auto',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.85rem',
          paddingBottom: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1
            className="editorial-title"
            style={{
              fontSize: '1.4rem',
              letterSpacing: '-0.03em',
              fontWeight: 700,
            }}
          >
            CAMPUSBITE
          </h1>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              color: 'var(--muted)',
              borderLeft: '1px solid var(--line)',
              paddingLeft: '0.85rem',
            }}
          >
            DIGITAL KITCHEN & CANTEEN
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Language Toggle */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-full)',
              padding: '2px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
            }}
          >
            {[
              { code: 'en', label: 'EN' },
              { code: 'te', label: 'తెలుగు' },
              { code: 'hi', label: 'हिंदी' },
            ].map(lang => (
              <button
                key={lang.code}
                onClick={() => onLanguageChange(lang.code)}
                style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: currentLang === lang.code ? 700 : 500,
                  backgroundColor: currentLang === lang.code ? 'var(--ink)' : 'transparent',
                  color: currentLang === lang.code ? 'var(--bg)' : 'var(--muted)',
                  transition: 'all 0.15s ease',
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Button size="xs" variant="secondary" onClick={onTogglePortal}>
                {isStaffOrAdmin ? '← Customer View' : 'Kitchen Dashboard →'}
              </Button>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                }}
              >
                <strong>{currentUser.name}</strong>
                <span
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--line)',
                    padding: '0.1rem 0.35rem',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.62rem',
                  }}
                >
                  {currentUser.role}
                </span>
              </div>
              <Button size="xs" variant="ghost" onClick={onLogout}>
                Exit
              </Button>
            </div>
          ) : (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--muted)',
              }}
            >
              Sign-in required
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
