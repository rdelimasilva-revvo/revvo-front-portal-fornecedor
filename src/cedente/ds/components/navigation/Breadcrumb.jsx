import React from 'react';

export function Breadcrumb({ items = [], style }) {
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [items]);
  return (
    <nav aria-label="Trilha de navegação" style={{ fontFamily: 'var(--font-sans)', ...style }}>
      <ol style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0, padding: 0, listStyle: 'none', flexWrap: 'wrap' }}>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {last ? (
                <span aria-current="page" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{item.label}</span>
              ) : (
                <a href={item.href || '#'}
                  onClick={item.onClick ? (e) => { e.preventDefault(); item.onClick(); } : undefined}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-link)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color var(--duration-fast) var(--ease-out)' }}
                >{item.label}</a>
              )}
              {!last && <i data-lucide="chevron-right" style={{ width: 14, height: 14, color: 'var(--text-muted)', flex: 'none' }}></i>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
