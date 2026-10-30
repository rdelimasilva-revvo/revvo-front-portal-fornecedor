import React from 'react';

function Item({ item, open, onToggle }) {
  return (
    <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <button type="button" onClick={onToggle} aria-expanded={open} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        width: '100%', padding: '16px 4px', border: 'none', background: 'transparent', cursor: 'pointer',
        fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, color: 'var(--text-strong)', textAlign: 'left',
      }}>
        <span>{item.title}</span>
        <span style={{
          flex: 'none', color: 'var(--text-muted)', fontSize: 13, lineHeight: 1,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform var(--duration-base) var(--ease-out)',
        }}>▾</span>
      </button>
      <div style={{
        display: 'grid', gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows var(--duration-base) var(--ease-out)',
      }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ padding: '0 4px 16px', fontSize: 14, lineHeight: 1.6, color: 'var(--text-body)' }}>
            {item.content}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Accordion({ items = [], multiple = false, defaultOpen = [], style }) {
  const [open, setOpen] = React.useState(() => new Set(defaultOpen));
  const toggle = (key) => setOpen((prev) => {
    const next = new Set(multiple ? prev : []);
    if (prev.has(key)) next.delete(key); else next.add(key);
    return next;
  });
  return (
    <div style={{ borderTop: '1px solid var(--border-subtle)', ...style }}>
      {items.map((it, i) => {
        const key = it.id ?? i;
        return <Item key={key} item={it} open={open.has(key)} onToggle={() => toggle(key)} />;
      })}
    </div>
  );
}
