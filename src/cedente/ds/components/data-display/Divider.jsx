import React from 'react';

export function Divider({ orientation = 'horizontal', label, strong = false, inset = 0, gap = 16, style }) {
  const thickness = strong ? 1.5 : 1;
  const color = strong ? 'var(--border-strong)' : 'var(--border-subtle)';
  if (orientation === 'vertical') {
    return (
      <span role="separator" aria-orientation="vertical" style={{
        display: 'inline-block', alignSelf: 'stretch', width: thickness, minHeight: '1em',
        background: color, margin: `0 ${gap}px`, flex: 'none', ...style,
      }} />
    );
  }
  if (label) {
    return (
      <div role="separator" aria-orientation="horizontal" style={{
        display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-sans)',
        margin: `${gap}px 0`, ...style,
      }}>
        <span style={{ flex: 1, height: thickness, background: color }} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
        <span style={{ flex: 1, height: thickness, background: color }} />
      </div>
    );
  }
  return (
    <hr role="separator" aria-orientation="horizontal" style={{
      border: 'none', height: thickness, background: color,
      margin: `${gap}px ${inset}px`, ...style,
    }} />
  );
}
