import React from 'react';

export function Checkbox({ checked, onChange, disabled = false, label, id }) {
  const cbId = id || React.useId();
  const on = !!checked;
  return (
    <label htmlFor={cbId} style={{
      display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-sans)',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
    }}>
      <input id={cbId} type="checkbox" checked={on} disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.checked)}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
      {/* Puramente decorativo: o clique no label ja aciona o input nativo acima.
          Ter role/onClick aqui disparava onChange duas vezes por clique. */}
      <span
        aria-hidden="true"
        style={{
          width: 20, height: 20, flex: 'none', borderRadius: 'var(--radius-xs)',
          border: on ? '1.5px solid var(--revvo-blue-500)' : '1.5px solid var(--control-border-off)',
          background: on ? 'var(--revvo-blue-500)' : 'var(--control-bg-off)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out)',
        }}
      >
        {on && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6.2L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label && <span style={{ fontSize: 14, color: 'var(--text-body)' }}>{label}</span>}
    </label>
  );
}
