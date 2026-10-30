import React from 'react';

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

export function Avatar({ name = '', src, size = 40, tone = 'blue' }) {
  const tones = {
    blue: { bg: 'var(--avatar-blue-bg)', fg: 'var(--avatar-blue-fg)' },
    green: { bg: 'var(--avatar-green-bg)', fg: 'var(--avatar-green-fg)' },
    dark: { bg: 'var(--avatar-dark-bg)', fg: 'var(--avatar-dark-fg)' },
  };
  const t = tones[tone] || tones.blue;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: '50%', overflow: 'hidden', flex: 'none',
      background: t.bg, color: t.fg, fontFamily: 'var(--font-sans)',
      fontWeight: 600, fontSize: Math.round(size * 0.36), letterSpacing: '0.01em',
    }}>
      {src
        ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : initials(name)}
    </span>
  );
}
