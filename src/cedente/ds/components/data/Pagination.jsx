import React from 'react';

function getPages(page, count, siblings) {
  const totalShown = siblings * 2 + 5;
  if (count <= totalShown) return Array.from({ length: count }, (_, i) => i + 1);
  const pages = [1];
  const start = Math.max(2, page - siblings);
  const end = Math.min(count - 1, page + siblings);
  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < count - 1) pages.push('…');
  pages.push(count);
  return pages;
}

export function Pagination({ page = 1, pageCount = 1, onChange, siblingCount = 1, style }) {
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [page, pageCount]);
  const pages = getPages(page, pageCount, siblingCount);
  const go = (p) => { if (p >= 1 && p <= pageCount && p !== page) onChange && onChange(p); };
  const btn = (active) => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 32, height: 32,
    padding: '0 6px', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
    fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
    background: active ? 'var(--revvo-blue-500)' : 'transparent', color: active ? '#fff' : 'var(--text-body)',
    transition: 'background var(--duration-fast) var(--ease-out)',
  });
  return (
    <nav aria-label="Paginação" style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-sans)', ...style }}>
      <button type="button" aria-label="Página anterior" onClick={() => go(page - 1)} disabled={page <= 1}
        style={{ ...btn(false), opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}>
        <i data-lucide="chevron-left" style={{ width: 16, height: 16 }}></i>
      </button>
      {pages.map((p, i) => p === '…' ? (
        <span key={'e' + i} style={{ width: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>…</span>
      ) : (
        <button type="button" key={p} aria-current={p === page ? 'page' : undefined} onClick={() => go(p)} style={btn(p === page)}>{p}</button>
      ))}
      <button type="button" aria-label="Próxima página" onClick={() => go(page + 1)} disabled={page >= pageCount}
        style={{ ...btn(false), opacity: page >= pageCount ? 0.4 : 1, cursor: page >= pageCount ? 'not-allowed' : 'pointer' }}>
        <i data-lucide="chevron-right" style={{ width: 16, height: 16 }}></i>
      </button>
    </nav>
  );
}
