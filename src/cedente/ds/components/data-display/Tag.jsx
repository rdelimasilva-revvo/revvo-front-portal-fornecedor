import React from 'react';

const tones = {
  neutral: { bg: 'var(--badge-neutral-bg)', fg: 'var(--badge-neutral-fg)' },
  blue: { bg: 'var(--badge-blue-bg)', fg: 'var(--badge-blue-fg)' },
  green: { bg: 'var(--badge-green-bg)', fg: 'var(--badge-green-fg)' },
};

export function Tag({ children, tone = 'neutral', onRemove, removeLabel = 'Remover', style }) {
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: onRemove ? '4px 6px 4px 11px' : '4px 11px',
      background: t.bg, color: t.fg, borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, lineHeight: 1.3, whiteSpace: 'nowrap', ...style,
    }}>
      {children}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={removeLabel} style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 16, height: 16, flex: 'none', padding: 0, border: 'none', cursor: 'pointer',
          borderRadius: '50%', background: 'transparent', color: 'inherit', opacity: 0.7,
          fontSize: 13, lineHeight: 1,
        }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = 'rgba(0,0,0,0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.7; e.currentTarget.style.background = 'transparent'; }}
        >×</button>
      )}
    </span>
  );
}
