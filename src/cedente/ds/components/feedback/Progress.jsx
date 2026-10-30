import React from 'react';

export function Progress({ value = 0, max = 100, tone = 'blue', size = 'md', showLabel = false, label, style }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const height = size === 'sm' ? 5 : size === 'lg' ? 10 : 7;
  const fills = {
    blue: 'var(--revvo-blue-500)',
    green: 'var(--revvo-green-500)',
    warning: 'var(--warning-500)',
    danger: 'var(--danger-500)',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-sans)', ...style }}>
      {(showLabel || label) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
          <span>{label || ''}</span>
          {showLabel && <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'var(--text-body)' }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} style={{
        height, borderRadius: 'var(--radius-pill)', background: 'var(--surface-sunken)', overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 'var(--radius-pill)', background: fills[tone] || fills.blue,
          transition: 'width var(--duration-base) var(--ease-out)',
        }} />
      </div>
    </div>
  );
}
