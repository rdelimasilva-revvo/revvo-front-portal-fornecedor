import React from 'react';

export function Menu({ trigger, items = [], align = 'start', open: openProp, onOpenChange, style }) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = openProp !== undefined ? openProp : internalOpen;
  const setOpen = (v) => { if (openProp === undefined) setInternalOpen(v); onOpenChange && onOpenChange(v); };
  const ref = React.useRef(null);
  const [activeIdx, setActiveIdx] = React.useState(-1);

  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, items.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && activeIdx >= 0 && items[activeIdx]) { items[activeIdx].onClick && items[activeIdx].onClick(); setOpen(false); }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDocClick); document.removeEventListener('keydown', onKey); };
  }, [open, activeIdx, items]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex', fontFamily: 'var(--font-sans)', ...style }}>
      <span onClick={() => setOpen(!open)}>{trigger}</span>
      {open && (
        <div role="menu" style={{
          position: 'absolute', top: 'calc(100% + 6px)', [align === 'end' ? 'right' : 'left']: 0,
          minWidth: 200, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', padding: 6, zIndex: 'var(--z-dropdown)',
        }}>
          {items.map((item, i) => (
            <button key={item.label} role="menuitem" onClick={() => { item.onClick && item.onClick(); setOpen(false); }}
              onMouseEnter={() => setActiveIdx(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%', border: 'none',
                background: activeIdx === i ? 'var(--surface-hover)' : 'transparent',
                color: item.danger ? 'var(--text-danger)' : 'var(--text-body)', textAlign: 'left', padding: '9px 10px',
                borderRadius: 'var(--radius-sm)', fontSize: 14, cursor: 'pointer',
              }}
            >{item.icon && <span style={{ display: 'inline-flex', flex: 'none' }}>{item.icon}</span>}{item.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}
