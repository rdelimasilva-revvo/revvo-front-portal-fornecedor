import React from 'react';

const kinds = {
  info:    { bg: 'var(--alert-info-bg)', border: 'var(--alert-info-border)', fg: 'var(--alert-info-fg)', iconBg: 'var(--alert-info-icon-bg)', icon: 'i' },
  success: { bg: 'var(--alert-success-bg)', border: 'var(--alert-success-border)', fg: 'var(--alert-success-fg)', iconBg: 'var(--alert-success-icon-bg)', icon: '✓' },
  warning: { bg: 'var(--alert-warning-bg)', border: 'var(--alert-warning-border)', fg: 'var(--alert-warning-fg)', iconBg: 'var(--alert-warning-icon-bg)', icon: '!' },
  danger:  { bg: 'var(--alert-danger-bg)', border: 'var(--alert-danger-border)', fg: 'var(--alert-danger-fg)', iconBg: 'var(--alert-danger-icon-bg)', icon: '!' },
};

export function Alert({ kind = 'info', title, children, onClose, style }) {
  const k = kinds[kind] || kinds.info;
  return (
    <div role={kind === 'danger' || kind === 'warning' ? 'alert' : 'status'} style={{
      display: 'flex', gap: 12, padding: 14, background: k.bg,
      border: `1px solid ${k.border}`, borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)', ...style,
    }}>
      <span style={{
        flex: 'none', width: 22, height: 22, borderRadius: '50%', background: k.iconBg, color: '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
      }}>{k.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark-100)', marginBottom: children ? 2 : 0 }}>{title}</div>}
        {children && <div style={{ fontSize: 13, color: 'var(--dark-80)', lineHeight: 1.5 }}>{children}</div>}
      </div>
      {onClose && (
        <button onClick={onClose} style={{
          flex: 'none', border: 'none', background: 'transparent', cursor: 'pointer',
          color: 'var(--dark-40)', fontSize: 16, lineHeight: 1, padding: 2,
        }}>✕</button>
      )}
    </div>
  );
}
