import React from 'react';

const tones = {
  neutral: { bg: 'var(--badge-neutral-bg)', fg: 'var(--badge-neutral-fg)', dot: 'var(--badge-neutral-dot)' },
  blue:    { bg: 'var(--badge-blue-bg)', fg: 'var(--badge-blue-fg)', dot: 'var(--badge-blue-dot)' },
  green:   { bg: 'var(--badge-green-bg)', fg: 'var(--badge-green-fg)', dot: 'var(--badge-green-dot)' },
  success: { bg: 'var(--badge-success-bg)', fg: 'var(--badge-success-fg)', dot: 'var(--badge-success-dot)' },
  warning: { bg: 'var(--badge-warning-bg)', fg: 'var(--badge-warning-fg)', dot: 'var(--badge-warning-dot)' },
  danger:  { bg: 'var(--badge-danger-bg)', fg: 'var(--badge-danger-fg)', dot: 'var(--badge-danger-dot)' },
};

export function Badge({ children, tone = 'neutral', dot = false, style }) {
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: dot ? '4px 10px 4px 8px' : '4px 10px',
      background: t.bg, color: t.fg, borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, lineHeight: 1.3,
      letterSpacing: '0.005em', whiteSpace: 'nowrap', ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.dot, flex: 'none' }} />}
      {children}
    </span>
  );
}
