import React from 'react';

const kinds = {
  info: { accent: 'var(--soft-blue-400)', icon: 'i' },
  success: { accent: 'var(--revvo-green-400)', icon: '✓' },
  warning: { accent: 'var(--warning-500)', icon: '!' },
  danger: { accent: 'var(--danger-500)', icon: '!' },
};

export function Toast({ kind = 'info', title, children, onClose, style }) {
  const k = kinds[kind] || kinds.info;
  return (
    <div role="status" aria-live="polite" style={{
      display: 'flex', gap: 12, alignItems: 'flex-start', width: 360, maxWidth: '100%',
      background: 'var(--toast-bg)', color: 'var(--toast-fg)', borderRadius: 'var(--radius-md)',
      padding: 16, boxShadow: 'var(--shadow-lg)', fontFamily: 'var(--font-sans)', ...style,
    }}>
      <span style={{
        flex: 'none', width: 22, height: 22, borderRadius: '50%', background: k.accent, color: '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
      }}>{k.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontSize: 14, fontWeight: 600, marginBottom: children ? 2 : 0 }}>{title}</div>}
        {children && <div style={{ fontSize: 13, color: 'var(--toast-fg-muted)', lineHeight: 1.5 }}>{children}</div>}
      </div>
      {onClose && (
        <button onClick={onClose} aria-label="Fechar" style={{
          flex: 'none', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--toast-close)', fontSize: 15, padding: 2, lineHeight: 1,
        }}>✕</button>
      )}
    </div>
  );
}
