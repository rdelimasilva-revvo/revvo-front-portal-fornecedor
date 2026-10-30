import React from 'react';

export function SegmentedControl({ options = [], value, defaultValue, onChange, size = 'md', fullWidth = false, style }) {
  const items = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  const [internal, setInternal] = React.useState(defaultValue ?? (items[0] && items[0].value));
  const active = value !== undefined ? value : internal;
  const pad = size === 'sm' ? '5px 12px' : '7px 16px';
  const fs = size === 'sm' ? 13 : 14;
  const select = (v) => { if (value === undefined) setInternal(v); onChange && onChange(v); };
  return (
    <div role="tablist" style={{
      display: fullWidth ? 'grid' : 'inline-grid',
      gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 2, padding: 3,
      background: 'var(--tab-track)', borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)', width: fullWidth ? '100%' : 'auto', ...style,
    }}>
      {items.map((it) => {
        const on = active === it.value;
        return (
          <button key={it.value} type="button" role="tab" aria-selected={on} onClick={() => select(it.value)} style={{
            padding: pad, fontSize: fs, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
            border: 'none', borderRadius: 'var(--radius-sm)', whiteSpace: 'nowrap',
            background: on ? 'var(--tab-active-bg)' : 'transparent',
            color: on ? 'var(--tab-active-fg)' : 'var(--tab-idle-fg)',
            boxShadow: on ? 'var(--shadow-xs)' : 'none',
            transition: 'background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)',
          }}>{it.label}</button>
        );
      })}
    </div>
  );
}
