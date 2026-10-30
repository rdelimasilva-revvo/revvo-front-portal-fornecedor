import React from 'react';

export function StatCard({ label, value, delta, deltaTone, icon, style }) {
  const tone = deltaTone || (typeof delta === 'string' && delta.trim().startsWith('-') ? 'down' : 'up');
  const deltaColor = tone === 'down' ? 'var(--badge-danger-fg)' : 'var(--badge-success-fg)';
  const deltaBg = tone === 'down' ? 'var(--badge-danger-bg)' : 'var(--badge-success-bg)';
  return (
    <div style={{
      background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)', padding: 20, boxShadow: 'var(--shadow-sm)',
      fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', gap: 14, ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>{label}</span>
        {icon && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 34, height: 34, borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-soft-bg)', color: 'var(--accent-soft-fg)',
          }}>{icon}</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--text-strong)', letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        {delta != null && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px',
            background: deltaBg, color: deltaColor, borderRadius: 'var(--radius-pill)',
            fontSize: 12, fontWeight: 600,
          }}>
            <span style={{ fontSize: 10 }}>{tone === 'down' ? '▼' : '▲'}</span>{delta}
          </span>
        )}
      </div>
    </div>
  );
}
