import React from 'react';

export function EmptyState({ icon = 'inbox', title, description, action, style }) {
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [icon]);
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      padding: '48px 24px', gap: 14, fontFamily: 'var(--font-sans)', ...style,
    }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56,
        borderRadius: '50%', background: 'var(--surface-sunken)', color: 'var(--text-muted)',
      }}><i data-lucide={icon} style={{ width: 26, height: 26 }}></i></span>
      <div>
        {title && <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-strong)' }}>{title}</div>}
        {description && <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4, maxWidth: 340 }}>{description}</div>}
      </div>
      {action && <div style={{ marginTop: 6 }}>{action}</div>}
    </div>
  );
}
