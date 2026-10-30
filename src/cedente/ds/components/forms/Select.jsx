import React from 'react';

export function Select({ label, hint, error, options = [], value, onChange, disabled = false, placeholder, id, style }) {
  const [focus, setFocus] = React.useState(false);
  const selId = id || React.useId();
  const borderColor = error ? 'var(--danger-500)' : focus ? 'var(--border-focus)' : 'var(--border-default)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-sans)', ...style }}>
      {label && <label htmlFor={selId} style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{label}</label>}
      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center', height: 44,
        background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
        border: `1.5px solid ${borderColor}`, borderRadius: 'var(--radius-sm)',
        boxShadow: focus && !error ? 'var(--focus-ring)' : 'none',
        transition: 'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)',
      }}>
        <select
          id={selId} value={value} disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.value)}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            appearance: 'none', WebkitAppearance: 'none', border: 'none', outline: 'none',
            background: 'transparent', width: '100%', height: '100%', padding: '0 38px 0 14px',
            fontSize: 14, fontFamily: 'var(--font-sans)',
            color: value ? 'var(--text-strong)' : 'var(--text-muted)', cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o;
            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
          })}
        </select>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ position: 'absolute', right: 14, pointerEvents: 'none' }}>
          <path d="M4 6L8 10L12 6" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {error ? <span style={{ fontSize: 12, color: 'var(--text-danger)' }}>{error}</span>
        : hint ? <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hint}</span> : null}
    </div>
  );
}
