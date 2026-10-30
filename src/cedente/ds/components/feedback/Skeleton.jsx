import React from 'react';

function ensureKeyframes() {
  if (document.getElementById('revvo-skeleton-kf')) return;
  const el = document.createElement('style');
  el.id = 'revvo-skeleton-kf';
  el.textContent = '@keyframes revvo-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}';
  document.head.appendChild(el);
}

export function Skeleton({ variant = 'text', width, height, style }) {
  React.useEffect(() => { ensureKeyframes(); }, []);
  const dims = variant === 'circle'
    ? { width: width ?? 40, height: height ?? 40, borderRadius: '50%' }
    : variant === 'rect'
      ? { width: width ?? '100%', height: height ?? 120, borderRadius: 'var(--radius-md)' }
      : { width: width ?? '100%', height: height ?? 14, borderRadius: 'var(--radius-xs)' };
  return (
    <span aria-hidden="true" style={{
      display: 'block', ...dims,
      background: 'linear-gradient(90deg, var(--surface-sunken) 25%, var(--border-subtle) 50%, var(--surface-sunken) 75%)',
      backgroundSize: '200% 100%', animation: 'revvo-shimmer 1.4s ease-in-out infinite',
      ...style,
    }}></span>
  );
}
