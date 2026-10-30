import React from 'react';

function ensureKeyframes() {
  if (document.getElementById('revvo-spin-kf')) return;
  const el = document.createElement('style');
  el.id = 'revvo-spin-kf';
  el.textContent = '@keyframes revvo-spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(el);
}

const SIZES = { sm: 16, md: 22, lg: 32 };

export function Spinner({ size = 'md', color = 'var(--revvo-blue-500)', label = 'Carregando', style }) {
  React.useEffect(() => { ensureKeyframes(); }, []);
  const px = typeof size === 'number' ? size : (SIZES[size] || 22);
  const bw = Math.max(2, Math.round(px / 10));
  return (
    <span role="status" aria-label={label} style={{ display: 'inline-flex', ...style }}>
      <span style={{
        width: px, height: px, borderRadius: '50%',
        border: `${bw}px solid var(--border-default)`, borderTopColor: color,
        animation: 'revvo-spin 0.7s linear infinite', boxSizing: 'border-box',
      }} />
    </span>
  );
}
