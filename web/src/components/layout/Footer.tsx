import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--line)',
        backgroundColor: 'var(--bg)',
        padding: '1.5rem 0',
        marginTop: 'auto',
      }}
    >
      <div
        className="app-container"
        style={{
          minHeight: 'auto',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.74rem',
          color: 'var(--muted)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <div>
          <span>CampusBite Operations Framework • v2.0-modular</span>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <span>PostgreSQL Architecture</span>
          <span>Offline Resilient</span>
          <span>Zero-Waste Kitchen</span>
        </div>
      </div>
    </footer>
  );
};
