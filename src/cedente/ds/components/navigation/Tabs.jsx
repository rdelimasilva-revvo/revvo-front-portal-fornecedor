import React from 'react';

export function Tabs({ tabs = [], value, defaultValue, onChange, style }) {
  const [internal, setInternal] = React.useState(defaultValue ?? (tabs[0] && (tabs[0].value ?? tabs[0])));
  const active = value !== undefined ? value : internal;
  const select = (v) => { if (value === undefined) setInternal(v); onChange && onChange(v); };
  const onKeyDown = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const idx = tabs.findIndex((t) => (typeof t === 'string' ? t : t.value) === active);
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const next = tabs[(idx + dir + tabs.length) % tabs.length];
    select(typeof next === 'string' ? next : next.value);
  };
  return (
    <div role="tablist" onKeyDown={onKeyDown} style={{
      display: 'inline-flex', gap: 4, padding: 4, background: 'var(--tab-track)',
      borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-sans)', ...style,
    }}>
      {tabs.map((t) => {
        const item = typeof t === 'string' ? { value: t, label: t } : t;
        const on = item.value === active;
        return (
          <button key={item.value} role="tab" aria-selected={on} tabIndex={on ? 0 : -1}
            onClick={() => select(item.value)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', cursor: 'pointer',
            padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 600,
            fontFamily: 'var(--font-sans)',
            background: on ? 'var(--tab-active-bg)' : 'transparent',
            color: on ? 'var(--tab-active-fg)' : 'var(--tab-idle-fg)',
            boxShadow: on ? 'var(--shadow-xs)' : 'none',
            transition: 'background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)',
          }}>
            {item.label}
            {item.count != null && (
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 999,
                background: on ? 'var(--tab-count-active-bg)' : 'var(--tab-count-idle-bg)',
                color: on ? 'var(--tab-count-active-fg)' : 'var(--tab-count-idle-fg)',
              }}>{item.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
